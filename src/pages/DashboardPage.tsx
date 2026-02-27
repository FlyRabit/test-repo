import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useStore } from '../store/useStore';
import { Eye, Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';

export default function DashboardPage() {
  const { articles } = useStore();
  const published = articles.filter((a) => a.status === 'published');

  const totalStats = published.reduce(
    (acc, a) => {
      if (!a.stats) return acc;
      return {
        views: acc.views + a.stats.views,
        likes: acc.likes + a.stats.likes,
        comments: acc.comments + a.stats.comments,
        collects: acc.collects + a.stats.collects,
        shares: acc.shares + a.stats.shares,
      };
    },
    { views: 0, likes: 0, comments: 0, collects: 0, shares: 0 }
  );

  const chartData = published
    .filter((a) => a.stats)
    .slice(-10)
    .map((a) => ({
      name: a.title?.slice(0, 6) || a.id.slice(0, 6),
      views: a.stats!.views,
      likes: a.stats!.likes,
      comments: a.stats!.comments,
    }));

  const pieData = [
    { name: '浏览量', value: totalStats.views, color: '#fe2c55' },
    { name: '点赞', value: totalStats.likes, color: '#ff6b9d' },
    { name: '收藏', value: totalStats.collects, color: '#ff9ec4' },
    { name: '评论', value: totalStats.comments, color: '#ffc4d9' },
    { name: '分享', value: totalStats.shares, color: '#ffe4ec' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-800">数据图表</h1>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            icon={<Eye size={24} />}
            label="总浏览量"
            value={totalStats.views}
          />
          <StatCard
            icon={<Heart size={24} />}
            label="总点赞数"
            value={totalStats.likes}
          />
          <StatCard
            icon={<MessageCircle size={24} />}
            label="总评论数"
            value={totalStats.comments}
          />
          <StatCard
            icon={<Bookmark size={24} />}
            label="总收藏数"
            value={totalStats.collects}
          />
          <StatCard
            icon={<Share2 size={24} />}
            label="总分享数"
            value={totalStats.shares}
          />
        </div>

        {published.length === 0 ? (
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 p-12 text-center text-gray-500">
            <p>暂无已发布笔记数据，发布笔记后可在此查看数据图表</p>
          </div>
        ) : (
          <>
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">笔记数据对比</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fce7eb" />
                    <XAxis dataKey="name" stroke="#8e8e93" fontSize={12} />
                    <YAxis stroke="#8e8e93" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #fce7eb',
                        borderRadius: '12px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="views" name="浏览量" fill="#fe2c55" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="likes" name="点赞" fill="#ff6b9d" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="comments" name="评论" fill="#ff9ec4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">数据分布</h2>
                {pieData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-12">暂无数据</p>
                )}
              </div>

              <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">趋势概览</h2>
                {chartData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#fce7eb" />
                        <XAxis dataKey="name" stroke="#8e8e93" fontSize={12} />
                        <YAxis stroke="#8e8e93" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #fce7eb',
                            borderRadius: '12px',
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="views"
                          name="浏览量"
                          stroke="#fe2c55"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="likes"
                          name="点赞"
                          stroke="#ff6b9d"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-12">暂无数据</p>
                )}
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-800 p-6 border-b border-red-50">
                笔记明细
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-red-50/50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        标题
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                        浏览量
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                        点赞
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                        评论
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                        收藏
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                        分享
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {published.map((a) => (
                      <tr key={a.id} className="border-t border-red-50">
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {a.title || '未命名'}
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          {a.stats?.views ?? '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          {a.stats?.likes ?? '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          {a.stats?.comments ?? '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          {a.stats?.collects ?? '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          {a.stats?.shares ?? '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center text-[#fe2c55]">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
