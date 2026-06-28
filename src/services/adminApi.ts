const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
  'https://tinybit-server.vercel.app';

const ADMIN_PREFIX = '/admin/api';

export interface AdminProfileUser {
  id: string;
  full_name: string | null;
  email: string | null;
  mobile: string | null;
  role: string;
  country: string | null;
  age: number | null;
  biological_sex: string | null;
  is_banned: boolean;
  last_active: string | null;
  created_at: string;
  guardian_count?: number;
  linked_elder_count?: number;
  profile_incomplete?: boolean;
}

export interface AdminProfileDetail {
  id: string;
  full_name: string | null;
  email: string | null;
  mobile: string | null;
  role: string;
  country: string | null;
  country_code: string | null;
  age: number | null;
  biological_sex: string | null;
  location: string | null;
  medical_conditions: string[] | null;
  emergency_phone: string | null;
  emergency_name: string | null;
  emergency_relation: string | null;
  plan_type: string | null;
  plan_status: string | null;
  is_banned: boolean;
  last_active: string | null;
  created_at: string;
  [key: string]: unknown;
}

export interface AdminConnection {
  id: string;
  guardian_id: string;
  elder_id: string | null;
  elder_email: string;
  parent_name: string;
  relation: string;
  status: 'pending' | 'connected' | 'declined';
  created_at: string;
  guardian_name: string;
  guardian_email: string;
  elder_name: string;
}

export interface AdminUsersResponse {
  success: boolean;
  users: AdminProfileUser[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}

export interface AdminUserDetailResponse {
  success: boolean;
  profile: AdminProfileDetail | null;
  app_user: { id: string; phone_e164: string; email: string; created_at: string } | null;
  connections: {
    as_guardian: AdminConnection[];
    as_elder: AdminConnection[];
  };
}

export interface AdminConnectionsResponse {
  success: boolean;
  connections: AdminConnection[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateUserPayload {
  phone: string;
  countryCode?: string;
  fullName?: string;
  password?: string;
  role: 'elder' | 'guardian' | 'caregiver';
  email?: string;
  country?: string;
  age?: number;
}

export interface UpdateUserPayload {
  full_name?: string;
  email?: string;
  mobile?: string;
  role?: string;
  country?: string;
  age?: number;
  biological_sex?: string;
  is_banned?: boolean;
  emergency_phone?: string;
  emergency_name?: string;
  emergency_relation?: string;
}

const TOKEN_KEY = 'tb-admin-token';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${ADMIN_PREFIX}${path}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('text/csv')) {
    const text = await res.text();
    if (!res.ok) throw new Error(text || `Export failed (${res.status})`);
    return text as T;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data as { error?: string }).error ??
      (data as { message?: string }).message ??
      `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export async function adminLogin(username: string, password: string) {
  return adminFetch<{ success: boolean; token?: string; user?: { username: string; role: string } }>('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function adminLogout(): Promise<void> {
  try {
    await adminFetch('/logout', { method: 'POST' });
  } catch {
    // ignore
  } finally {
    setAdminToken(null);
  }
}

export interface GetUsersParams {
  role?: 'elder' | 'guardian' | 'caregiver';
  search?: string;
  status?: 'all' | 'active' | 'suspended';
  page?: number;
  limit?: number;
}

export async function getAdminUsers(params: GetUsersParams): Promise<AdminUsersResponse> {
  const query = new URLSearchParams();
  if (params.role) query.set('role', params.role);
  query.set('page', String(params.page ?? 1));
  query.set('limit', String(params.limit ?? 20));
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.status && params.status !== 'all') query.set('status', params.status);
  return adminFetch<AdminUsersResponse>(`/users?${query.toString()}`);
}

export async function getIncompleteUsers(page = 1, limit = 20): Promise<AdminUsersResponse> {
  return adminFetch<AdminUsersResponse>(`/users/incomplete?page=${page}&limit=${limit}`);
}

export async function getAdminUser(id: string): Promise<AdminUserDetailResponse> {
  return adminFetch<AdminUserDetailResponse>(`/users/${id}`);
}

export async function createAdminUser(payload: CreateUserPayload) {
  return adminFetch<{ success: boolean; profile: AdminProfileDetail }>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUser(id: string, payload: UpdateUserPayload) {
  return adminFetch<{ success: boolean; profile: AdminProfileDetail }>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function banAdminUser(id: string, banned: boolean) {
  return adminFetch<{ success: boolean }>(`/users/${id}/ban`, {
    method: 'PATCH',
    body: JSON.stringify({ banned }),
  });
}

export async function deleteAdminUser(id: string) {
  return adminFetch<{ success: boolean }>(`/users/${id}`, { method: 'DELETE' });
}

export async function getAdminConnections(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<AdminConnectionsResponse> {
  const query = new URLSearchParams();
  query.set('page', String(params.page ?? 1));
  query.set('limit', String(params.limit ?? 20));
  if (params.status) query.set('status', params.status);
  if (params.search?.trim()) query.set('search', params.search.trim());
  return adminFetch<AdminConnectionsResponse>(`/connections?${query.toString()}`);
}

export async function updateAdminConnection(id: string, status: 'connected' | 'declined' | 'pending') {
  return adminFetch<{ success: boolean }>(`/connections/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteAdminConnection(id: string) {
  return adminFetch<{ success: boolean }>(`/connections/${id}`, { method: 'DELETE' });
}

export async function exportAdminUsers(role: 'elder' | 'guardian', status?: string): Promise<string> {
  const query = new URLSearchParams({ role });
  if (status && status !== 'all') query.set('status', status);
  return adminFetch<string>(`/users/export?${query.toString()}`);
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Dashboard Stats & Analytics ---
export interface AdminStatsResponse {
  success: boolean;
  stats: {
    totalUsers: number;
    activeUsers: number;
    activeElders: number;
    activeGuardians: number;
    connectionsCount: number;
    medicinesTakenToday: number;
    sosAlertsToday: number;
    dailyCheckinsToday: number;
  };
}

export interface AdminAnalyticsResponse {
  success: boolean;
  analytics: {
    userGrowth: Array<{ date: string; elders: number; guardians: number }>;
    medicineAdherence: Array<{ date: string; rate: number }>;
    wellnessTrends: Array<{ date: string; averageMood: number }>;
    sosAlertsByMonth: Array<{ month: string; count: number }>;
  };
}

export async function getAdminStats(): Promise<AdminStatsResponse> {
  return adminFetch<AdminStatsResponse>('/stats');
}

export async function getAdminAnalytics(): Promise<AdminAnalyticsResponse> {
  return adminFetch<AdminAnalyticsResponse>('/analytics');
}

// --- Activity & Health Monitoring ---
export async function getAdminMedicines(params?: { page?: number; limit?: number; category?: string; priority?: string; active?: string }): Promise<any> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.category) query.set('category', params.category);
  if (params?.priority) query.set('priority', params.priority);
  if (params?.active !== undefined) query.set('active', params.active);
  return adminFetch<any>(`/medicines?${query.toString()}`);
}

export async function getAdminCheckIns(params?: { page?: number; limit?: number; mood?: string }): Promise<any> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.mood) query.set('mood', params.mood);
  return adminFetch<any>(`/check-ins?${query.toString()}`);
}

export async function getAdminMoods(params?: { page?: number; limit?: number }): Promise<any> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  return adminFetch<any>(`/moods?${query.toString()}`);
}

export async function getAdminAIConversations(params?: { page?: number; limit?: number; role?: string }): Promise<any> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.role) query.set('role', params.role);
  return adminFetch<any>(`/ai-conversations?${query.toString()}`);
}

export async function getAdminCareEvents(params?: { page?: number; limit?: number; type?: string }): Promise<any> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.type) query.set('type', params.type);
  return adminFetch<any>(`/care-events?${query.toString()}`);
}

export async function getAdminMindGames(params?: { page?: number; limit?: number }): Promise<any> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  return adminFetch<any>(`/mind-games?${query.toString()}`);
}

// --- System Broadcast ---
export async function broadcastMessage(message: string): Promise<{ success: boolean; results: any }> {
  return adminFetch<{ success: boolean; results: any }>('/broadcast', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

// --- Catalog Storage Presign Upload ---
export async function presignCatalogUpload(filename: string, contentType?: string): Promise<{ uploadUrl: string; key: string; fileUrl: string; contentType: string; expiresIn: number }> {
  return adminFetch<{ uploadUrl: string; key: string; fileUrl: string; contentType: string; expiresIn: number }>('/storage/presign-upload', {
    method: 'POST',
    body: JSON.stringify({ filename, content_type: contentType }),
  });
}

// --- Doctors CRUD ---
export async function getDoctors(params?: { page?: number; limit?: number; search?: string }): Promise<any> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search?.trim()) query.set('search', params.search.trim());
  return adminFetch<any>(`/doctors?${query.toString()}`);
}

export async function getDoctor(id: string): Promise<any> {
  return adminFetch<any>(`/doctors/${id}`);
}

export async function createDoctor(data: any): Promise<any> {
  return adminFetch<any>('/doctors', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDoctor(id: string, data: any): Promise<any> {
  return adminFetch<any>(`/doctors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteDoctor(id: string): Promise<any> {
  return adminFetch<any>(`/doctors/${id}`, { method: 'DELETE' });
}

// --- Mood Media CRUD ---
export async function getMoodMedia(params?: { page?: number; limit?: number; category?: string }): Promise<any> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.category) query.set('category', params.category);
  return adminFetch<any>(`/mood-media?${query.toString()}`);
}

export async function getMoodMediaTrack(id: string): Promise<any> {
  return adminFetch<any>(`/mood-media/${id}`);
}

export async function createMoodMediaTrack(data: any): Promise<any> {
  return adminFetch<any>('/mood-media', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMoodMediaTrack(id: string, data: any): Promise<any> {
  return adminFetch<any>(`/mood-media/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteMoodMediaTrack(id: string): Promise<any> {
  return adminFetch<any>(`/mood-media/${id}`, { method: 'DELETE' });
}

// --- Quiz Questions CRUD ---
export async function getQuizQuestions(params?: { page?: number; limit?: number }): Promise<any> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  return adminFetch<any>(`/quiz-questions?${query.toString()}`);
}

export async function getQuizQuestion(id: string): Promise<any> {
  return adminFetch<any>(`/quiz-questions/${id}`);
}

export async function createQuizQuestion(data: any): Promise<any> {
  return adminFetch<any>('/quiz-questions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateQuizQuestion(id: string, data: any): Promise<any> {
  return adminFetch<any>(`/quiz-questions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteQuizQuestion(id: string): Promise<any> {
  return adminFetch<any>(`/quiz-questions/${id}`, { method: 'DELETE' });
}

// --- Inspirations CRUD ---
export async function getInspirations(params?: { page?: number; limit?: number }): Promise<any> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  return adminFetch<any>(`/inspirations?${query.toString()}`);
}

export async function getInspiration(id: string): Promise<any> {
  return adminFetch<any>(`/inspirations/${id}`);
}

export async function createInspiration(data: any): Promise<any> {
  return adminFetch<any>('/inspirations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateInspiration(id: string, data: any): Promise<any> {
  return adminFetch<any>(`/inspirations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteInspiration(id: string): Promise<any> {
  return adminFetch<any>(`/inspirations/${id}`, { method: 'DELETE' });
}
