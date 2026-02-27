const API_BASE = '/api';

function getSessionId(): string | null {
  return localStorage.getItem('xhs_session_id');
}

export function setSessionId(id: string) {
  localStorage.setItem('xhs_session_id', id);
}

export function clearSessionId() {
  localStorage.removeItem('xhs_session_id');
}

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const sessionId = getSessionId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error || `请求失败 (${res.status})`, res.status, body);
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
  health: () => request<{ status: string; configured: boolean; message: string }>('/health'),

  auth: {
    getLoginUrl: () => request<{ url: string; state: string }>('/auth/login'),
    getStatus: () => request<{
      authenticated: boolean;
      expired?: boolean;
      userInfo?: XhsUserInfo | null;
      userId?: string | null;
    }>('/auth/status'),
    refresh: () => request<{ success: boolean }>('/auth/refresh', { method: 'POST' }),
    logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  },

  notes: {
    list: (page = 1, pageSize = 20) =>
      request(`/notes?page=${page}&page_size=${pageSize}`),
    get: (noteId: string) => request(`/notes/${noteId}`),
    getStats: (noteId: string) => request(`/notes/${noteId}/stats`),
    getComments: (noteId: string, page = 1) =>
      request(`/notes/${noteId}/comments?page=${page}`),
    create: (data: { title: string; content: string; images?: string[] }) =>
      request('/notes', { method: 'POST', body: JSON.stringify(data) }),
  },
};

export interface XhsUserInfo {
  user_id?: string;
  nickname?: string;
  avatar?: string;
  desc?: string;
  fans_count?: number;
  follows_count?: number;
  notes_count?: number;
}
