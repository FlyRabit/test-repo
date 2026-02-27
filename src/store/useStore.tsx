import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Article, ArticleImage, ArticleStats } from '../types';

interface StoreContextType {
  articles: Article[];
  currentArticle: Article | null;
  setCurrentArticle: (article: Article | null) => void;
  createArticle: () => Article;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  addImage: (articleId: string, url: string, order?: number) => void;
  removeImage: (articleId: string, imageId: string) => void;
  reorderImages: (articleId: string, imageIds: string[]) => void;
  updateImageCaption: (articleId: string, imageId: string, caption: string) => void;
  publishArticle: (id: string) => void;
  deleteArticle: (id: string) => void;
}

const STORAGE_KEY = 'xiaohongshu-ops-data';

const generateMockStats = (): ArticleStats => ({
  views: Math.floor(Math.random() * 5000) + 500,
  likes: Math.floor(Math.random() * 500) + 50,
  comments: Math.floor(Math.random() * 100) + 10,
  collects: Math.floor(Math.random() * 200) + 20,
  shares: Math.floor(Math.random() * 50) + 5,
  date: new Date().toISOString().split('T')[0],
});

const loadFromStorage = (): Article[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load from storage', e);
  }
  return [
    {
      id: uuidv4(),
      title: '欢迎使用小红书运营系统',
      content: '在这里编辑你的笔记文案，上传图片，一键发布！\n\n支持功能：\n✨ 文案编辑修改\n✨ 图片排版\n✨ 一键发布\n✨ 数据图表展示',
      images: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
    },
  ];
};

const saveToStorage = (articles: Article[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
};

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [articles, setArticles] = useState<Article[]>(loadFromStorage);
  const [currentArticle, setCurrentArticleState] = useState<Article | null>(null);

  useEffect(() => {
    saveToStorage(articles);
    if (currentArticle) {
      const updated = articles.find(a => a.id === currentArticle.id);
      if (updated) setCurrentArticleState(updated);
    }
  }, [articles]);

  const setCurrentArticle = useCallback((article: Article | null) => {
    setCurrentArticleState(article);
  }, []);

  const createArticle = useCallback(() => {
    const article: Article = {
      id: uuidv4(),
      title: '',
      content: '',
      images: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    setArticles(prev => [...prev, article]);
    setCurrentArticleState(article);
    return article;
  }, []);

  const updateArticle = useCallback((id: string, updates: Partial<Article>) => {
    setArticles(prev =>
      prev.map(a => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  const addImage = useCallback((articleId: string, url: string, order?: number) => {
    setArticles(prev =>
      prev.map(a => {
        if (a.id !== articleId) return a;
        const newImage: ArticleImage = {
          id: uuidv4(),
          url,
          order: order ?? a.images.length,
          caption: '',
        };
        return { ...a, images: [...a.images, newImage].sort((i, j) => i.order - j.order) };
      })
    );
  }, []);

  const removeImage = useCallback((articleId: string, imageId: string) => {
    setArticles(prev =>
      prev.map(a => {
        if (a.id !== articleId) return a;
        const filtered = a.images.filter(i => i.id !== imageId);
        return { ...a, images: filtered.map((img, idx) => ({ ...img, order: idx })) };
      })
    );
  }, []);

  const reorderImages = useCallback((articleId: string, imageIds: string[]) => {
    setArticles(prev =>
      prev.map(a => {
        if (a.id !== articleId) return a;
        const reordered = imageIds
          .map((id) => a.images.find(i => i.id === id))
          .filter(Boolean) as ArticleImage[];
        return { ...a, images: reordered.map((img, idx) => ({ ...img, order: idx })) };
      })
    );
  }, []);

  const updateImageCaption = useCallback((articleId: string, imageId: string, caption: string) => {
    setArticles(prev =>
      prev.map(a => {
        if (a.id !== articleId) return a;
        return {
          ...a,
          images: a.images.map(i => (i.id === imageId ? { ...i, caption } : i)),
        };
      })
    );
  }, []);

  const publishArticle = useCallback((id: string) => {
    setArticles(prev =>
      prev.map(a => {
        if (a.id !== id) return a;
        return {
          ...a,
          status: 'published' as const,
          publishedAt: new Date().toISOString(),
          stats: generateMockStats(),
        };
      })
    );
  }, []);

  const deleteArticle = useCallback((id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
    setCurrentArticleState(prev => (prev?.id === id ? null : prev));
  }, []);

  return (
    <StoreContext.Provider
      value={{
        articles,
        currentArticle,
        setCurrentArticle,
        createArticle,
        updateArticle,
        addImage,
        removeImage,
        reorderImages,
        updateImageCaption,
        publishArticle,
        deleteArticle,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
