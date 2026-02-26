import { Plus } from 'lucide-react';
import type { Article } from '../types';

interface ArticleSelectorProps {
  articles: Article[];
  currentArticle: Article | null;
  onSelect: (article: Article) => void;
  onCreate: () => void;
}

export default function ArticleSelector({ articles, currentArticle, onSelect, onCreate }: ArticleSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {articles.map((article) => (
        <button
          key={article.id}
          onClick={() => onSelect(article)}
          className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${
            currentArticle?.id === article.id
              ? 'bg-[#fe2c55] text-white shadow-md'
              : 'bg-white/80 text-gray-700 hover:bg-red-50 border border-red-100'
          }`}
        >
          {article.title || '未命名笔记'}
          <span className={`ml-2 text-xs ${article.status === 'published' ? 'text-green-500' : 'text-amber-500'}`}>
            {article.status === 'published' ? '已发布' : '草稿'}
          </span>
        </button>
      ))}
      <button
        onClick={onCreate}
        className="px-4 py-2 rounded-xl border-2 border-dashed border-red-200 text-[#fe2c55] hover:bg-red-50 transition-all flex items-center gap-1"
      >
        <Plus size={16} />
        新建笔记
      </button>
    </div>
  );
}
