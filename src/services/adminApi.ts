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
  deleted_at?: string | null;
  deleted_by?: string | null;
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
  /** 'only' lists trashed (soft-deleted) users; omitted/undefined excludes them (server default). */
  deleted?: 'only';
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
  if (params.deleted === 'only') query.set('deleted', 'only');
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

/** Moves a user to trash (soft-delete) — recoverable via restoreAdminUser until the grace period elapses. */
export async function deleteAdminUser(id: string) {
  return adminFetch<{ success: boolean }>(`/users/${id}`, { method: 'DELETE' });
}

/** Restores a trashed user back to normal/active state. 404s if the user isn't currently trashed. */
export async function restoreAdminUser(id: string) {
  return adminFetch<{ success: boolean }>(`/users/${id}/restore`, { method: 'PATCH' });
}

/** Permanently deletes an already-trashed user: real S3 cleanup + cascading DB delete. Irreversible. */
export async function purgeAdminUser(id: string) {
  return adminFetch<{ success: boolean; deletedObjectCount: number; s3Failures: unknown[] }>(
    `/users/${id}/purge`,
    { method: 'DELETE' },
  );
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

export async function getAdminCareEvents(params?: { page?: number; limit?: number; type?: string; user_id?: string }): Promise<any> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.type) query.set('type', params.type);
  if (params?.user_id) query.set('user_id', params.user_id);
  return adminFetch<any>(`/care-events?${query.toString()}`);
}

export async function createAdminCareEvent(data: any): Promise<any> {
  return adminFetch<any>('/care-events', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteAdminCareEvent(id: string): Promise<any> {
  return adminFetch<any>(`/care-events/${id}`, { method: 'DELETE' });
}

export async function getAdminMindGames(params?: { page?: number; limit?: number }): Promise<any> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  return adminFetch<any>(`/mind-games?${query.toString()}`);
}

// --- System Broadcast ---
export async function broadcastMessage(message: string, title?: string): Promise<{ success: boolean; sent: number; results?: any }> {
  return adminFetch<{ success: boolean; sent: number; results?: any }>('/broadcast', {
    method: 'POST',
    body: JSON.stringify({ title: title || 'System Broadcast', body: message }),
  });
}

// --- Audit log ---

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip: string | null;
  created_at: string;
}

export interface AuditLogsResponse {
  success: boolean;
  logs: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
}

export async function getAuditLogs(params?: {
  page?: number;
  limit?: number;
  action?: string;
  search?: string;
}): Promise<AuditLogsResponse> {
  const query = new URLSearchParams();
  query.set('page', String(params?.page ?? 1));
  query.set('limit', String(params?.limit ?? 50));
  if (params?.action) query.set('action', params.action);
  if (params?.search?.trim()) query.set('search', params.search.trim());
  return adminFetch<AuditLogsResponse>(`/audit-log?${query.toString()}`);
}

export async function exportAuditLogs(): Promise<string> {
  return adminFetch<string>('/audit-log/export');
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
export async function getMoodMedia(params?: { page?: number; limit?: number; category?: string; search?: string }): Promise<any> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.category) query.set('category', params.category);
  if (params?.search?.trim()) query.set('search', params.search.trim());
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
export async function getQuizQuestions(params?: { page?: number; limit?: number; search?: string }): Promise<any> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search?.trim()) query.set('search', params.search.trim());
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
export async function getInspirations(params?: { page?: number; limit?: number; search?: string }): Promise<any> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search?.trim()) query.set('search', params.search.trim());
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

// --- Health Records / Vault ---
export async function getAdminHealthRecords(params?: { page?: number; limit?: number; category?: string; user_id?: string; search?: string }): Promise<any> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.category) query.set('category', params.category);
  if (params?.user_id) query.set('user_id', params.user_id);
  if (params?.search?.trim()) query.set('search', params.search.trim());
  return adminFetch<any>(`/health-records?${query.toString()}`);
}

export async function deleteAdminHealthRecord(id: string): Promise<any> {
  return adminFetch<any>(`/health-records/${id}`, { method: 'DELETE' });
}

export async function runMultiForecast(records: any[]): Promise<any> {
  return adminFetch<any>('/ai-forecast-multi', {
    method: 'POST',
    body: JSON.stringify({ records }),
  });
}

// --- Help FAQs CRUD ---
export interface HelpFaq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getHelpFaqs(params?: { page?: number; limit?: number; active?: string; search?: string }): Promise<{ success: boolean; faqs: HelpFaq[]; error?: string }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.active !== undefined) query.set('active', params.active);
  if (params?.search?.trim()) query.set('search', params.search.trim());
  return adminFetch(`/help-faqs?${query.toString()}`);
}

export async function getHelpFaq(id: string): Promise<{ success: boolean; faq: HelpFaq; error?: string }> {
  return adminFetch(`/help-faqs/${id}`);
}

export async function createHelpFaq(data: { question: string; answer: string; sort_order?: number; is_active?: boolean }): Promise<{ success: boolean; faq: HelpFaq; error?: string }> {
  return adminFetch('/help-faqs', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateHelpFaq(id: string, data: Partial<{ question: string; answer: string; sort_order: number; is_active: boolean }>): Promise<{ success: boolean; faq: HelpFaq; error?: string }> {
  return adminFetch(`/help-faqs/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteHelpFaq(id: string): Promise<{ success: boolean; error?: string }> {
  return adminFetch(`/help-faqs/${id}`, { method: 'DELETE' });
}

// --- Help Tutorials CRUD ---
export interface HelpTutorial {
  id: string;
  category: string;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  difficulty: string;
  duration_seconds: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getHelpTutorials(params?: { page?: number; limit?: number; category?: string; active?: string; search?: string }): Promise<{ success: boolean; tutorials: HelpTutorial[]; error?: string }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.category) query.set('category', params.category);
  if (params?.active !== undefined) query.set('active', params.active);
  if (params?.search?.trim()) query.set('search', params.search.trim());
  return adminFetch(`/help-tutorials?${query.toString()}`);
}

export async function getHelpTutorial(id: string): Promise<{ success: boolean; tutorial: HelpTutorial; error?: string }> {
  return adminFetch(`/help-tutorials/${id}`);
}

export async function createHelpTutorial(data: Record<string, unknown>): Promise<{ success: boolean; tutorial: HelpTutorial; error?: string }> {
  return adminFetch('/help-tutorials', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateHelpTutorial(id: string, data: Record<string, unknown>): Promise<{ success: boolean; tutorial: HelpTutorial; error?: string }> {
  return adminFetch(`/help-tutorials/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteHelpTutorial(id: string): Promise<{ success: boolean; error?: string }> {
  return adminFetch(`/help-tutorials/${id}`, { method: 'DELETE' });
}

// --- Pricing tiers CRUD ---
export interface PricingTier {
  id: string;
  country_code: string;
  elder_count: number;
  amount: number;
  currency: string;
  interval_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getPricingTiers(params?: { country_code?: string; active?: string }): Promise<{ success: boolean; tiers: PricingTier[]; error?: string }> {
  const query = new URLSearchParams();
  if (params?.country_code) query.set('country_code', params.country_code);
  if (params?.active !== undefined) query.set('active', params.active);
  return adminFetch(`/pricing-tiers?${query.toString()}`);
}

export async function getPricingTier(id: string): Promise<{ success: boolean; tier: PricingTier; error?: string }> {
  return adminFetch(`/pricing-tiers/${id}`);
}

export async function createPricingTier(data: {
  country_code: string;
  elder_count: number;
  amount: number;
  currency: string;
  interval_days?: number;
  is_active?: boolean;
}): Promise<{ success: boolean; tier: PricingTier; error?: string }> {
  return adminFetch('/pricing-tiers', { method: 'POST', body: JSON.stringify(data) });
}

export async function updatePricingTier(id: string, data: Partial<{
  country_code: string;
  elder_count: number;
  amount: number;
  currency: string;
  interval_days: number;
  is_active: boolean;
}>): Promise<{ success: boolean; tier: PricingTier; error?: string }> {
  return adminFetch(`/pricing-tiers/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deletePricingTier(id: string): Promise<{ success: boolean; error?: string }> {
  return adminFetch(`/pricing-tiers/${id}`, { method: 'DELETE' });
}

// --- Payment orders ---
export interface PaymentOrder {
  id: string;
  guardian_id: string;
  guardian_name?: string | null;
  razorpay_order_id: string;
  kind: string;
  pricing_tier_id: string | null;
  elder_count_at_purchase: number;
  amount: number;
  tier_amount: number;
  interval_days: number;
  currency: string;
  status: string;
  created_at: string;
  payment: {
    id: string;
    razorpay_payment_id: string;
    status: string;
    method: string | null;
    captured_at: string | null;
    failure_reason: string | null;
  } | null;
}

export async function getPaymentOrders(params?: { page?: number; limit?: number; guardian_id?: string }): Promise<{ success: boolean; orders: PaymentOrder[]; error?: string }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.guardian_id) query.set('guardian_id', params.guardian_id);
  return adminFetch(`/payments/orders?${query.toString()}`);
}

export async function getPaymentOrder(id: string): Promise<{ success: boolean; order: PaymentOrder; error?: string }> {
  return adminFetch(`/payments/orders/${id}`);
}

export async function refundPayment(paymentId: string, data?: { amount?: number; speed?: string; reason?: string }): Promise<{ success: boolean; refund?: unknown; error?: string }> {
  return adminFetch(`/payments/${paymentId}/refund`, { method: 'POST', body: JSON.stringify(data ?? {}) });
}

// --- SOS alerts ---
export interface SosAlertRecord {
  id: string;
  user_id: string;
  user_name: string;
  triggered_at: string;
  resolved_at: string | null;
  status: 'active' | 'resolved' | 'cancelled';
  location?: { latitude: number; longitude: number; address: string | null } | null;
}

export async function getAdminSosAlerts(params?: { page?: number; limit?: number; status?: string }): Promise<{ success: boolean; alerts: SosAlertRecord[]; error?: string }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status);
  return adminFetch(`/sos-alerts?${query.toString()}`);
}

// --- Notifications (inbox / broadcast log) ---
export interface AdminNotification {
  id: string;
  user_id: string;
  user_name: string;
  sender_id: string | null;
  type: string;
  title: string;
  body: string;
  data: unknown;
  read: boolean;
  created_at: string;
}

export async function getAdminNotifications(params?: { page?: number; limit?: number; type?: string; search?: string }): Promise<{ success: boolean; notifications: AdminNotification[]; error?: string }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.type) query.set('type', params.type);
  if (params?.search?.trim()) query.set('search', params.search.trim());
  return adminFetch(`/notifications?${query.toString()}`);
}

// --- Emergency contacts ---
export interface EmergencyContactRecord {
  id: string;
  user_id: string;
  user_name: string;
  name: string;
  role: string;
  phone: string;
  color: string;
  created_at: string;
}

export async function getAdminEmergencyContacts(params?: { page?: number; limit?: number; search?: string }): Promise<{ success: boolean; contacts: EmergencyContactRecord[]; error?: string }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search?.trim()) query.set('search', params.search.trim());
  return adminFetch(`/emergency-contacts?${query.toString()}`);
}

// --- Journal entries ---
export interface JournalEntryRecord {
  id: string;
  user_id: string;
  user_name: string;
  type: 'Written' | 'Voice' | string;
  content: string;
  content_preview: string;
  audio_uri: string | null;
  prompt: string | null;
  created_at: string;
}

export async function getAdminJournalEntries(params?: { page?: number; limit?: number; type?: string; search?: string }): Promise<{ success: boolean; entries: JournalEntryRecord[]; error?: string }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.type) query.set('type', params.type);
  if (params?.search?.trim()) query.set('search', params.search.trim());
  return adminFetch(`/journal?${query.toString()}`);
}

// --- Family messages (shared journal / family chat) ---
export interface FamilyMessageRecord {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_name: string;
  receiver_name: string;
  message: string;
  message_preview: string;
  audio_url: string | null;
  created_at: string;
}

export async function getAdminFamilyMessages(params?: { page?: number; limit?: number; search?: string }): Promise<{ success: boolean; messages: FamilyMessageRecord[]; error?: string }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search?.trim()) query.set('search', params.search.trim());
  return adminFetch(`/family-messages?${query.toString()}`);
}

// --- Live elder locations ---
export interface ElderLocationRecord {
  elder_id: string;
  user_name: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  address: string | null;
  is_sharing: boolean;
  updated_at: string;
}

export async function getAdminElderLocations(params?: { page?: number; limit?: number; sharing?: string }): Promise<{ success: boolean; locations: ElderLocationRecord[]; error?: string }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.sharing) query.set('sharing', params.sharing);
  return adminFetch(`/elder-locations?${query.toString()}`);
}

// --- Appointments ---
export interface AppointmentRecord {
  id: string;
  user_id: string;
  user_name: string;
  doctor_name: string | null;
  specialty: string | null;
  date: string | null;
  time: string | null;
  fee: string | null;
  reason: string | null;
  status: string;
  created_at: string;
}

export async function getAdminAppointments(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<{ success: boolean; appointments: AppointmentRecord[]; error?: string }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status);
  if (params?.search?.trim()) query.set('search', params.search.trim());
  return adminFetch(`/appointments?${query.toString()}`);
}

// --- Streaks ---
export interface StreakRecord {
  id: string;
  name: string;
  location: string;
  current_streak: number;
  longest_streak: number;
  last_activity: string | null;
  status: 'active' | 'broken' | string;
}

export async function getAdminStreaks(params?: { page?: number; limit?: number; search?: string }): Promise<{ success: boolean; streaks: StreakRecord[]; error?: string }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search?.trim()) query.set('search', params.search.trim());
  return adminFetch(`/streaks?${query.toString()}`);
}

// --- User subscriptions ---
export interface UserSubscriptionRecord {
  id: string;
  user_name: string;
  user_type: string;
  plan: string;
  status: string;
  start_date: string | null;
  renewal_date: string | null;
  amount: number;
  currency: string;
  elder_count: number | null;
  interval: string | null;
}

export async function getAdminUserSubscriptions(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<{ success: boolean; subscriptions: UserSubscriptionRecord[]; error?: string }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status);
  if (params?.search?.trim()) query.set('search', params.search.trim());
  return adminFetch(`/user-subscriptions?${query.toString()}`);
}

// --- Revenue summary ---
export interface RevenueSummary {
  total_revenue: number;
  captured_payments: number;
  active_subscriptions: number;
  monthly: { month: string; revenue: number; payments: number }[];
  by_tier: { plan: string; elder_count: number; revenue: number; subscribers: number }[];
}

export async function getAdminRevenueSummary(): Promise<{ success: boolean; summary: RevenueSummary; error?: string }> {
  return adminFetch('/revenue');
}
