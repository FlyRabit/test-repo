import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../store/authStore';
import { api, type PeriodStats, type PublishedNote } from '../services/api';
import { Eye, Heart, MessageCircle, Bookmark, Share2, Users, RefreshCw, Loader2, FileText, Clock, ExternalLink, AlertCircle } from 'lucide-react';

type TimeRange = '7' | '30';

export default function DashboardPage() {
  const { isConnected } = useAuth();
  const [range, setRange] = useState<TimeRange>('7');
  const [stats, setStats] = useState<{ seven: PeriodStats; thirty: PeriodStats } | null>(null);
  const [notes, setNotes] = useState<PublishedNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!isConnected) return;
    setLoading(true);
    setError('');
    try {
      const [dashRes, notesRes] = await Promise.all([
        api.dashboard(),
        api.notes.getPublished(),
      ]);
      setStats({ seven: dashRes.data.seven_days, thirty: dashRes.data.thirty_days });
      setNotes(notesRes.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <AlertCircle size={48} className="mb-4" />
        <p className="text-lg font-medium text-gray-600">请先连接小红书账号</p>
        <p className="text-sm mt-2">前往「账号管理」页面粘贴 Cookie 完成连接</p>
      </div>
    );
  }

  const current = stats ? (range === '7' ? stats.seven : stats.thirty) : null;

  const trendData = current?.view_trend?.length
    ? current.view_trend.map((v, i) => ({
        day: `${i + 1}`,
        浏览: v,
        点赞: current.like_trend?.[i] || 0,
        评论: current.comment_trend?.[i] || 0,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">数据看板</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/80 rounded-lg border border-red-100 p-0.5">
            {(['7', '30'] as TimeRange[]).map(r => (
              <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${range === r ? 'bg-[#fe2c55] text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                近 {r} 天
              </button>
            ))}
          </div>
          <button onClick={fetchData} disabled={loading} className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-[#fe2c55] bg-white/80 rounded-lg border border-red-100 transition-colors">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} 刷新
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}

      {/* Stats Cards */}
      {current && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <StatCard icon={<Eye size={20} />} label="浏览" value={current.views} />
          <StatCard icon={<Heart size={20} />} label="点赞" value={current.likes} />
          <StatCard icon={<MessageCircle size={20} />} label="评论" value={current.comments} />
          <StatCard icon={<Bookmark size={20} />} label="收藏" value={current.collects} />
          <StatCard icon={<Share2 size={20} />} label="分享" value={current.shares} />
          <StatCard icon={<Users size={20} />} label="涨粉" value={current.fans_growth} accent />
        </div>
      )}

      {current?.summary && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-3 border border-red-100 text-sm text-gray-600">
          📊 {current.summary}
        </div>
      )}

      {/* Trend Chart */}
      {trendData.length > 0 && (
        <div className="bg-white/90 rounded-2xl shadow-lg border border-red-50 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-3">近 {range} 天趋势</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fce7eb" />
                <XAxis dataKey="day" stroke="#8e8e93" fontSize={11} />
                <YAxis stroke="#8e8e93" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #fce7eb' }} />
                <Bar dataKey="浏览" fill="#fe2c55" radius={[3, 3, 0, 0]} />
                <Bar dataKey="点赞" fill="#ff6b9d" radius={[3, 3, 0, 0]} />
                <Bar dataKey="评论" fill="#ff9ec4" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Published Notes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText size={20} className="text-[#fe2c55]" /> 已发布笔记
          </h2>
          <span className="text-xs text-gray-400">{notes.length} 篇</span>
        </div>

        {notes.length === 0 ? (
          <div className="bg-white/90 rounded-2xl shadow-lg border border-red-50 p-12 text-center">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">暂无通过本系统发布的笔记</p>
            <p className="text-xs text-gray-400 mt-1">在「一键发布」页面发布笔记后，这里会自动显示</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <NoteCard key={note.note_id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NoteCard({ note }: { note: PublishedNote }) {
  const publishTime = new Date(note.published_at).toLocaleString('zh-CN', {
    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="bg-white/90 rounded-2xl shadow-lg border border-red-50 overflow-hidden hover:shadow-xl transition-shadow">
      {/* Cover */}
      <div className="h-40 bg-gradient-to-br from-red-100 to-pink-50 flex items-center justify-center relative">
        {note.image_count > 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-[#fe2c55]">
            <FileText size={48} strokeWidth={1} />
          </div>
        ) : (
          <FileText size={48} className="text-red-200" strokeWidth={1} />
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {note.is_private && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">私密</span>
          )}
          <span className="px-2 py-0.5 bg-white/90 text-gray-500 rounded-full text-xs">
            {note.image_count > 0 ? `${note.image_count} 图` : '纯文'}
          </span>
        </div>
        {note.score > 0 && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            评分 {note.score}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-snug">{note.title || '无标题'}</h3>
        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{note.desc}</p>

        {note.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {note.topics.slice(0, 3).map((t, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-red-50 text-[#fe2c55] rounded text-xs">#{t}</span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-red-50">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={12} /> {publishTime}
          </div>
          <a
            href={`https://www.xiaohongshu.com/explore/${note.note_id}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-[#fe2c55] hover:underline"
          >
            查看 <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: boolean }) {
  return (
    <div className="bg-white/90 rounded-xl shadow border border-red-50 p-3 flex items-center gap-2.5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-[#fe2c55]'}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-gray-400">{label}</p>
        <p className="text-base font-bold text-gray-800">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
