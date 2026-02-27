import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuth } from '../store/authStore';
import { api, type AIResult, type NewsItem } from '../services/api';
import { Sparkles, Newspaper, Loader2, ArrowRight, Wand2, Copy, CheckCircle, AlertCircle } from 'lucide-react';

type Tab = 'generate' | 'news';

export default function AIGeneratorPage() {
  const navigate = useNavigate();
  const { createArticle, updateArticle } = useStore();
  const { isConnected } = useAuth();
  const [tab, setTab] = useState<Tab>('generate');
  const [topic, setTopic] = useState('');
  const [newsInput, setNewsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.ai.generate(topic);
      setResult(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchNews = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError('');
    setNewsList([]);
    try {
      const res = await api.ai.fetchNews(topic);
      setNewsList(res.data.news || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : '获取失败');
    } finally {
      setLoading(false);
    }
  };

  const handleNewsToNote = async (news: string) => {
    if (loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.ai.newsToNote(news);
      setResult(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomNewsToNote = async () => {
    if (!newsInput.trim() || loading) return;
    await handleNewsToNote(newsInput);
  };

  const handleApplyToEditor = () => {
    if (!result) return;
    const article = createArticle();
    const tags = result.tags?.length ? '\n\n' + result.tags.map(t => `#${t}#`).join(' ') : '';
    updateArticle(article.id, {
      title: result.title,
      content: result.content + tags,
    });
    setApplied(true);
    setTimeout(() => navigate('/'), 500);
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="text-[#fe2c55]" size={28} /> AI 内容生成
        </h1>
        {isConnected && (
          <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">已连接小红书 · 可直接发布</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setTab('generate'); setResult(null); setError(''); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${tab === 'generate' ? 'bg-[#fe2c55] text-white shadow-md' : 'bg-white/80 text-gray-600 hover:bg-red-50 border border-red-100'}`}
        >
          <Wand2 size={18} /> 主题生成
        </button>
        <button
          onClick={() => { setTab('news'); setResult(null); setError(''); setNewsList([]); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${tab === 'news' ? 'bg-[#fe2c55] text-white shadow-md' : 'bg-white/80 text-gray-600 hover:bg-red-50 border border-red-100'}`}
        >
          <Newspaper size={18} /> 新闻转笔记
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 overflow-hidden">
          <div className="p-6 border-b border-red-50 bg-gradient-to-r from-red-50 to-pink-50">
            <h2 className="text-lg font-semibold text-gray-800">
              {tab === 'generate' ? '输入主题' : '新闻素材'}
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {tab === 'generate' ? (
              <>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                  placeholder="输入主题，如：春季穿搭、居家好物推荐、职场干货..."
                  className="w-full px-4 py-3 rounded-xl border border-red-100 focus:border-[#fe2c55] focus:ring-2 focus:ring-red-100 outline-none"
                />
                <button
                  onClick={handleGenerate}
                  disabled={loading || !topic.trim()}
                  className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-[#fe2c55] text-white hover:bg-[#e01a45] transition-all disabled:opacity-50 shadow-md"
                >
                  {loading ? <><Loader2 size={20} className="animate-spin" /> 生成中...</> : <><Sparkles size={20} /> 生成小红书笔记</>}
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="输入关键词搜索热点，如：AI、科技、美食..."
                  className="w-full px-4 py-3 rounded-xl border border-red-100 focus:border-[#fe2c55] focus:ring-2 focus:ring-red-100 outline-none"
                />
                <button
                  onClick={handleFetchNews}
                  disabled={loading || !topic.trim()}
                  className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-[#fe2c55] text-white hover:bg-[#e01a45] transition-all disabled:opacity-50 shadow-md"
                >
                  {loading && newsList.length === 0 ? <><Loader2 size={20} className="animate-spin" /> 搜索中...</> : <><Newspaper size={20} /> 搜索热点资讯</>}
                </button>

                {newsList.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-sm font-medium text-gray-600">选择一条资讯转为笔记：</p>
                    {newsList.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleNewsToNote(`${item.title}：${item.summary}`)}
                        disabled={loading}
                        className="w-full text-left p-3 bg-red-50/50 hover:bg-red-50 rounded-xl border border-red-100 transition-colors disabled:opacity-50"
                      >
                        <p className="text-sm font-medium text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.summary}</p>
                      </button>
                    ))}
                  </div>
                )}

                <div className="border-t border-red-50 pt-4">
                  <p className="text-xs text-gray-500 mb-2">或直接粘贴新闻内容：</p>
                  <textarea
                    value={newsInput}
                    onChange={e => setNewsInput(e.target.value)}
                    placeholder="粘贴新闻原文..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-red-100 focus:border-[#fe2c55] focus:ring-2 focus:ring-red-100 outline-none resize-none text-sm"
                  />
                  <button
                    onClick={handleCustomNewsToNote}
                    disabled={loading || !newsInput.trim()}
                    className="w-full mt-2 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    <ArrowRight size={18} /> 转为小红书笔记
                  </button>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </div>
        </div>

        {/* Result Panel */}
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 overflow-hidden">
          <div className="p-6 border-b border-red-50 bg-gradient-to-r from-red-50 to-pink-50">
            <h2 className="text-lg font-semibold text-gray-800">生成结果</h2>
          </div>
          <div className="p-6">
            {loading && !result ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Loader2 size={32} className="animate-spin mb-3" />
                <p className="text-sm">AI 正在生成内容...</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">标题</p>
                  <p className="font-semibold text-gray-800 text-lg">{result.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">正文</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">{result.content}</p>
                </div>
                {result.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-red-50 text-[#fe2c55] rounded-full text-xs font-medium">#{tag}#</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleApplyToEditor}
                    disabled={applied}
                    className="flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-[#fe2c55] text-white hover:bg-[#e01a45] transition-all shadow-md disabled:opacity-70"
                  >
                    {applied ? <><CheckCircle size={18} /> 已添加</> : <><Copy size={18} /> 用作新笔记</>}
                  </button>
                  <button
                    onClick={() => { setResult(null); setApplied(false); }}
                    className="px-4 py-3 rounded-xl font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                  >
                    重新生成
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Sparkles size={32} className="mb-3" />
                <p className="text-sm">输入主题后点击生成</p>
                <p className="text-xs mt-1">AI 将自动创作小红书风格内容</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
