const API_BASE = '/api';

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (!options.body || !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: `请求失败 (${res.status})` }));
    throw new ApiError(body.detail || body.error || `请求失败 (${res.status})`, res.status, body);
  }

  return res.json();
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const api = {
  health: () => request<{ status: string; connected: boolean; sdk: string; auth_method: string; gemini_configured: boolean; proxy: string | null }>('/health'),

  auth: {
    setCookie: (cookie: string) =>
      request<{ success: boolean; user_info?: unknown; error?: string }>('/auth/cookie', {
        method: 'POST',
        body: JSON.stringify({ cookie }),
      }),
    getStatus: () =>
      request<{ authenticated: boolean; user_info: XhsUserInfo | null }>('/auth/status'),
    logout: () =>
      request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  },

  user: {
    getSelfInfo: () =>
      request<{ success: boolean; data: XhsUserInfo }>('/user/info'),
  },

  dashboard: () =>
    request<{ success: boolean; data: DashboardData }>('/dashboard'),

  notes: {
    getPublished: () =>
      request<{ success: boolean; data: PublishedNote[] }>('/notes/published'),
    getMine: (cursor = '') =>
      request(`/notes/self?cursor=${cursor}`),
    getStats: () =>
      request<{ success: boolean; data: XhsNotesStats }>('/notes/stats'),
    get: (noteId: string) =>
      request(`/notes/${noteId}`),
    getComments: (noteId: string, cursor = '') =>
      request(`/notes/${noteId}/comments?cursor=${cursor}`),
    search: (keyword: string, page = 1) =>
      request('/notes/search', {
        method: 'POST',
        body: JSON.stringify({ keyword, page }),
      }),
    create: (data: { title: string; desc: string; image_paths: string[]; topics?: unknown[]; is_private?: boolean }) =>
      request('/notes', { method: 'POST', body: JSON.stringify(data) }),
    createVideo: (data: { title: string; desc: string; video_path: string; cover_path?: string; topics?: unknown[]; is_private?: boolean }) =>
      request('/notes/video', { method: 'POST', body: JSON.stringify(data) }),
    like: (noteId: string) =>
      request(`/notes/${noteId}/like`, { method: 'POST' }),
    collect: (noteId: string) =>
      request(`/notes/${noteId}/collect`, { method: 'POST' }),
    comment: (noteId: string, content: string) =>
      request(`/notes/${noteId}/comment`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
  },

  upload: {
    images: (files: File[]) => {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      return request<{ success: boolean; files: UploadedFile[] }>('/upload', {
        method: 'POST',
        body: formData,
      });
    },
  },

  topics: {
    suggest: (keyword: string) =>
      request(`/topics/suggest?keyword=${encodeURIComponent(keyword)}`),
  },

  ai: {
    beautify: (content: string) =>
      request<{ success: boolean; data: AIResult }>('/ai/beautify', {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    generate: (topic: string) =>
      request<{ success: boolean; data: AIResult }>('/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ topic }),
      }),
    fetchNews: (topic: string) =>
      request<{ success: boolean; data: { news: NewsItem[] } }>('/ai/news', {
        method: 'POST',
        body: JSON.stringify({ topic }),
      }),
    newsToNote: (news: string) =>
      request<{ success: boolean; data: AIResult }>('/ai/news-to-note', {
        method: 'POST',
        body: JSON.stringify({ news }),
      }),
  },
};

export interface XhsUserInfo {
  basic_info?: {
    nickname?: string;
    images?: string;
    red_id?: string;
    desc?: string;
    ip_location?: string;
    gender?: number;
  };
  interactions?: Array<{
    count?: string;
    name?: string;
    type?: string;
  }>;
  tags?: Array<{
    name?: string;
    tagType?: string;
  }>;
  [key: string]: unknown;
}

export interface XhsNotesStats {
  note_count?: number;
  [key: string]: unknown;
}

export interface PeriodStats {
  views: number;
  likes: number;
  comments: number;
  collects: number;
  shares: number;
  fans_growth: number;
  avg_view_time: number;
  home_views: number;
  summary: string;
  view_trend: number[];
  like_trend: number[];
  comment_trend: number[];
  fans_trend: number[];
}

export interface DashboardData {
  user: XhsUserInfo | null;
  seven_days: PeriodStats;
  thirty_days: PeriodStats;
  notes: Record<string, unknown>;
}

export interface PublishedNote {
  note_id: string;
  title: string;
  desc: string;
  image_count: number;
  cover: string;
  is_private: boolean;
  score: number;
  published_at: string;
  topics: string[];
}

export interface AIResult {
  title: string;
  content: string;
  tags: string[];
}

export interface NewsItem {
  title: string;
  summary: string;
}

export interface UploadedFile {
  filename: string;
  path: string;
  size: number;
  type: 'image' | 'video';
}
