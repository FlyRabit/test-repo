export interface ArticleImage {
  id: string;
  url: string;
  order: number;
  caption?: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  images: ArticleImage[];
  status: 'draft' | 'published';
  createdAt: string;
  publishedAt?: string;
  // 数据统计（发布后生成）
  stats?: ArticleStats;
}

export interface ArticleStats {
  views: number;
  likes: number;
  comments: number;
  collects: number;
  shares: number;
  date: string;
}

export type NavItem = 'editor' | 'images' | 'publish' | 'dashboard' | 'account';
