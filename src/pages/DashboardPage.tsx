import { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useStore } from '../store/useStore';
import { useAuth } from '../store/authStore';
import { api, type PeriodStats } from '../services/api';
import { Eye, Heart, MessageCircle, Bookmark, Share2, Users, Wifi, WifiOff, RefreshCw, Loader2 } from 'lucide-react';

type TimeRange = '7' | '30';

export default function DashboardPage() {
  const { articles } = useStore();
  const { isConnected } = useAuth();
  const [range, setRange] = useState<TimeRange>('7');
  const [realData, setRealData] = useState<{ seven: PeriodStats; thirty: PeriodStats; summary7: string; summary30: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    if (!isConnected) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.dashboard();
      const d = res.data;
      setRealData({
        seven: d.seven_days,
        thirty: d.thirty_days,
        summary7: d.seven_days.summary,
        summary30: d.thirty_days.summary,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const useReal = isConnected && realData !== null;
  const stats = useReal ? (range === '7' ? realData!.seven : realData!.thirty) : null;
  const summary = useReal ? (range === '7' ? realData!.summary7 : realData!.summary30) : '';

  // Fallback: local mock data
  const published = articles.filter((a) => a.status === 'published');
  const localStats = published.reduce(
    (acc, a) => {
      if (!a.stats) return acc;
      return { views: acc.views + a.stats.views, likes: acc.likes + a.stats.likes, comments: acc.comments + a.stats.comments, collects: acc.collects + a.stats.collects, shares: acc.shares + a.stats.shares };
    },
    { views: 0, likes: 0, comments: 0, collects: 0, shares: 0 }
  );

  const views = useReal ? stats!.views : localStats.views;
  const likes = useReal ? stats!.likes : localStats.likes;
  const comments = useReal ? stats!.comments : localStats.comments;
  const collects = useReal ? stats!.collects : localStats.collects;
  const shares = useReal ? stats!.shares : localStats.shares;
  const fansGrowth = useReal ? stats!.fans_growth : 0;

  const trendData = useReal && stats!.view_trend.length > 0
    ? stats!.view_trend.map((v, i) => ({
        name: `Day ${i + 1}`,
        views: v,
        likes: stats!.like_trend[i] || 0,
        comments: stats!.comment_trend[i] || 0,
      }))
    : published.filter(a => a.stats).slice(-10).map(a => ({
        name: a.title?.slice(0, 6) || a.id.slice(0, 6),
        views: a.stats!.views,
        likes: a.stats!.likes,
        comments: a.stats!.comments,
      }));

  const pieData = [
    { name: '浏览量', value: views, color: '#fe2c55' },
    { name: '点赞', value: likes, color: '#ff6b9d' },
    { name: '收藏', value: collects, color: '#ff9ec4' },
    { name: '评论', value: comments, color: '#ffc4d9' },
    { name: '分享', value: shares, color: '#ffe4ec' },
  ].filter(d => d.value > 0);

  const hasAnyData = views > 0 || likes > 0 || comments > 0 || collects > 0 || shares > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">数据图表</h1>
        <div className="flex items-center gap-3">
          {useReal && (
            <div className="flex bg-white/80 rounded-lg border border-red-100 p-0.5">
              <button onClick={() => setRange('7')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${range === '7' ? 'bg-[#fe2c55] text-white' : 'text-gray-500'}`}>近 7 天</button>
              <button onClick={() => setRange('30')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${range === '30' ? 'bg-[#fe2c55] text-white' : 'text-gray-500'}`}>近 30 天</button>
            </div>
          )}
          {isConnected && (
            <button onClick={fetchDashboard} disabled={loading} className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#fe2c55] transition-colors">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              刷新
            </button>
          )}
          <span className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full ${useReal ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {useReal ? <Wifi size={12} /> : <WifiOff size={12} />}
            {useReal ? '真实数据' : '本地模拟数据'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
      )}

      {summary && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-4 border border-red-100">
          <p className="text-sm text-gray-700">📊 {summary}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={<Eye size={22} />} label="浏览量" value={views} />
        <StatCard icon={<Heart size={22} />} label="点赞" value={likes} />
        <StatCard icon={<MessageCircle size={22} />} label="评论" value={comments} />
        <StatCard icon={<Bookmark size={22} />} label="收藏" value={collects} />
        <StatCard icon={<Share2 size={22} />} label="分享" value={shares} />
        <StatCard icon={<Users size={22} />} label="涨粉" value={fansGrowth} highlight />
      </div>

      {!hasAnyData && useReal ? (
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 p-12 text-center text-gray-500">
          <p className="text-lg mb-2">📈 暂无互动数据</p>
          <p className="text-sm">你的笔记刚发布，数据需要一些时间积累。小红书通常在笔记发布 24 小时后开始显示完整统计。</p>
        </div>
      ) : !hasAnyData ? (
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 p-12 text-center text-gray-500">
          <p>暂无已发布笔记数据，发布笔记后可在此查看数据图表</p>
        </div>
      ) : (
        <>
          {trendData.length > 0 && (
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {useReal ? `${range === '7' ? '近 7 天' : '近 30 天'}数据趋势` : '笔记数据对比'}
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  {useReal ? (
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#fce7eb" />
                      <XAxis dataKey="name" stroke="#8e8e93" fontSize={12} />
                      <YAxis stroke="#8e8e93" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #fce7eb', borderRadius: '12px' }} />
                      <Legend />
                      <Line type="monotone" dataKey="views" name="浏览量" stroke="#fe2c55" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="likes" name="点赞" stroke="#ff6b9d" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="comments" name="评论" stroke="#ff9ec4" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  ) : (
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#fce7eb" />
                      <XAxis dataKey="name" stroke="#8e8e93" fontSize={12} />
                      <YAxis stroke="#8e8e93" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #fce7eb', borderRadius: '12px' }} />
                      <Legend />
                      <Bar dataKey="views" name="浏览量" fill="#fe2c55" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="likes" name="点赞" fill="#ff6b9d" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="comments" name="评论" fill="#ff9ec4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">数据分布</h2>
              {pieData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" nameKey="name"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                        {pieData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (<p className="text-gray-500 text-center py-12">暂无数据</p>)}
            </div>

            {useReal && (
              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">数据对比</h2>
                <div className="space-y-3">
                  <CompareRow label="浏览量" v7={realData!.seven.views} v30={realData!.thirty.views} />
                  <CompareRow label="点赞" v7={realData!.seven.likes} v30={realData!.thirty.likes} />
                  <CompareRow label="评论" v7={realData!.seven.comments} v30={realData!.thirty.comments} />
                  <CompareRow label="收藏" v7={realData!.seven.collects} v30={realData!.thirty.collects} />
                  <CompareRow label="分享" v7={realData!.seven.shares} v30={realData!.thirty.shares} />
                  <CompareRow label="涨粉" v7={realData!.seven.fans_growth} v30={realData!.thirty.fans_growth} />
                </div>
              </div>
            )}

            {!useReal && (
              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">趋势概览</h2>
                {trendData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#fce7eb" />
                        <XAxis dataKey="name" stroke="#8e8e93" fontSize={12} />
                        <YAxis stroke="#8e8e93" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #fce7eb', borderRadius: '12px' }} />
                        <Legend />
                        <Line type="monotone" dataKey="views" name="浏览量" stroke="#fe2c55" strokeWidth={2} />
                        <Line type="monotone" dataKey="likes" name="点赞" stroke="#ff6b9d" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (<p className="text-gray-500 text-center py-12">暂无数据</p>)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: number; highlight?: boolean }) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${highlight ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-orange-500' : 'bg-gradient-to-br from-red-100 to-pink-100 text-[#fe2c55]'}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-800">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function CompareRow({ label, v7, v30 }: { label: string; v7: number; v30: number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-red-50 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex gap-6 text-sm">
        <span className="text-gray-800 font-medium w-16 text-right">{v7.toLocaleString()}<span className="text-xs text-gray-400 ml-1">7天</span></span>
        <span className="text-gray-800 font-medium w-16 text-right">{v30.toLocaleString()}<span className="text-xs text-gray-400 ml-1">30天</span></span>
      </div>
    </div>
  );
}
