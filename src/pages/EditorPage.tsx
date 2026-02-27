import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Plus } from 'lucide-react';
import ArticleSelector from '../components/ArticleSelector';

export default function EditorPage() {
  const { articles, currentArticle, setCurrentArticle, createArticle, updateArticle } = useStore();

  useEffect(() => {
    if (!currentArticle && articles.length > 0) {
      setCurrentArticle(articles[0]);
    }
  }, [articles, currentArticle, setCurrentArticle]);

  if (!currentArticle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <p className="mb-4">暂无笔记，点击下方创建第一篇</p>
        <button
          onClick={createArticle}
          className="flex items-center gap-2 px-6 py-3 bg-[#fe2c55] text-white rounded-xl hover:bg-[#e01a45] transition-colors"
        >
          <Plus size={20} />
          新建笔记
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl">
        <ArticleSelector
          articles={articles}
          currentArticle={currentArticle}
          onSelect={setCurrentArticle}
          onCreate={createArticle}
        />
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-red-50 overflow-hidden">
          <div className="p-6 border-b border-red-50 bg-gradient-to-r from-red-50 to-pink-50">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">文案编辑</h2>
            <input
              type="text"
              placeholder="输入笔记标题..."
              value={currentArticle.title}
              onChange={(e) => updateArticle(currentArticle.id, { title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-red-100 focus:border-[#fe2c55] focus:ring-2 focus:ring-red-100 outline-none transition-all"
            />
          </div>
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">笔记正文</label>
            <textarea
              placeholder="在这里编写你的小红书笔记文案...&#10;&#10;💡 提示：小红书笔记建议 200-500 字，可适当使用 emoji 增加亲和力"
              value={currentArticle.content}
              onChange={(e) => updateArticle(currentArticle.id, { content: e.target.value })}
              className="w-full h-64 px-4 py-3 rounded-xl border border-red-100 focus:border-[#fe2c55] focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none"
            />
            <p className="mt-2 text-xs text-gray-400">
              当前字数：{currentArticle.content.length} 字
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
