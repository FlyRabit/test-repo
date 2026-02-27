import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useAuth } from '../store/authStore';
import { api } from '../services/api';
import ArticleSelector from '../components/ArticleSelector';
import { Send, CheckCircle, Loader2, Wifi, WifiOff } from 'lucide-react';

export default function PublishPage() {
  const { articles, currentArticle, setCurrentArticle, createArticle, publishArticle } = useStore();
  const { isConnected } = useAuth();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const publishedArticles = articles.filter((a) => a.status === 'published');
  const draftArticles = articles.filter((a) => a.status === 'draft');

  const handleLocalPublish = () => {
    if (!currentArticle) return;
    if (currentArticle.status === 'published') return;
    if (!currentArticle.title.trim()) {
      alert('请先填写笔记标题');
      return;
    }
    publishArticle(currentArticle.id);
  };

  const handleApiPublish = async () => {
    if (!currentArticle || isPublishing) return;
    if (!currentArticle.title.trim()) {
      alert('请先填写笔记标题');
      return;
    }
    setIsPublishing(true);
    setPublishError(null);
    try {
      await api.notes.create({
        title: currentArticle.title,
        content: currentArticle.content,
        images: currentArticle.images.map(img => img.url),
      });
      publishArticle(currentArticle.id);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : '发布失败，请重试');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl">
        <ArticleSelector
          articles={articles}
          currentArticle={currentArticle}
          onSelect={setCurrentArticle}
          onCreate={createArticle}
        />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 overflow-hidden">
            <div className="p-6 border-b border-red-50 bg-gradient-to-r from-red-50 to-pink-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">发布预览</h2>
                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                  {isConnected ? '已连接小红书' : '本地模式'}
                </span>
              </div>
            </div>
            <div className="p-6">
              {currentArticle ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">标题</p>
                    <p className="font-medium text-gray-800">
                      {currentArticle.title || '（未填写）'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">正文预览</p>
                    <p className="text-sm text-gray-600 line-clamp-4 whitespace-pre-wrap">
                      {currentArticle.content || '（未填写）'}
                    </p>
                  </div>
                  {currentArticle.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {currentArticle.images
                        .sort((a, b) => a.order - b.order)
                        .slice(0, 5)
                        .map((img) => (
                          <img
                            key={img.id}
                            src={img.url}
                            alt=""
                            className="w-16 h-20 object-cover rounded-lg border border-red-100"
                          />
                        ))}
                    </div>
                  )}

                  {isConnected && currentArticle.status !== 'published' && (
                    <button
                      onClick={handleApiPublish}
                      disabled={isPublishing}
                      className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all bg-[#fe2c55] text-white hover:bg-[#e01a45] shadow-md disabled:opacity-70"
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          发布中...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          发布到小红书
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={handleLocalPublish}
                    disabled={currentArticle.status === 'published' || isPublishing}
                    className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                      currentArticle.status === 'published'
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : isConnected
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-[#fe2c55] text-white hover:bg-[#e01a45] shadow-md'
                    }`}
                  >
                    {currentArticle.status === 'published' ? (
                      <>
                        <CheckCircle size={20} />
                        已发布
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        {isConnected ? '仅本地发布' : '一键发布'}
                      </>
                    )}
                  </button>

                  {publishError && (
                    <p className="text-xs text-red-500 text-center">{publishError}</p>
                  )}

                  <p className="text-xs text-gray-400 text-center">
                    {isConnected
                      ? '连接模式：可直接发布到小红书平台'
                      : '注：此为模拟发布，数据将保存到本地并显示在数据图表中'}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">请选择一篇笔记</p>
              )}
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 overflow-hidden">
            <div className="p-6 border-b border-red-50">
              <h2 className="text-lg font-semibold text-gray-800">发布统计</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                <span className="text-gray-700">已发布</span>
                <span className="text-2xl font-bold text-green-600">{publishedArticles.length}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-amber-50 rounded-xl">
                <span className="text-gray-700">草稿</span>
                <span className="text-2xl font-bold text-amber-600">{draftArticles.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
