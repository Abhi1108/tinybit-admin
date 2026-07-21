/** System role names; custom roles use free-form `name` strings. */
export type AdminRole =
  | 'super_admin'
  | 'operations_admin'
  | 'content_manager'
  | 'support_manager'
  | 'moderator'
  | string;

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: AdminRole;
  roleId?: string | null;
  avatar?: string;
  lastLogin: string;
  status: 'active' | 'inactive';
  permissions: string[];
}

export interface Elder {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  age: number;
  dateOfBirth: string;
  address: string;
  city: string;
  status: 'active' | 'inactive' | 'suspended';
  guardianCount: number;
  healthRiskScore: number;
  conditions: string[];
  emergencyContact: string;
  createdAt: string;
  lastActive: string;
}

export interface Guardian {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  linkedElders: string[];
  linkedElderCount: number;
  relationship: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  status: 'active' | 'inactive';
  createdAt: string;
  lastActive: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
  frequency: string;
  prescribedBy: string;
  elderId: string;
  elderName: string;
  adherenceRate: number;
  lastTaken?: string;
  nextDue?: string;
  refillStatus: 'ok' | 'low' | 'empty';
  status: 'active' | 'inactive';
  startDate: string;
}

export interface SOSAlert {
  id: string;
  elderName: string;
  elderId: string;
  elderAvatar?: string;
  guardianName: string;
  guardianId: string;
  time: string;
  location: { lat: number; lng: number; address: string };
  status: 'active' | 'resolved' | 'escalated' | 'false_alarm';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface WellnessLog {
  id: string;
  elderId: string;
  elderName: string;
  date: string;
  waterIntake: number;
  sleepHours: number;
  systolic: number;
  diastolic: number;
  heartRate: number;
  bloodSugar: number;
  temperature: number;
  weight: number;
  spo2: number;
}

export interface AISession {
  id: string;
  elderId: string;
  elderName: string;
  sessionType: 'chat' | 'voice';
  tokensUsed: number;
  duration: number;
  startTime: string;
  cost: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  model: string;
}

export interface JournalEntry {
  id: string;
  elderId: string;
  elderName: string;
  type: 'voice' | 'text';
  title: string;
  content?: string;
  audioUrl?: string;
  mood: string;
  createdAt: string;
  isShared: boolean;
  wordCount?: number;
  duration?: number;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: 'success' | 'failed';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'push' | 'email' | 'sms';
  target: 'all' | 'elders' | 'guardians' | 'specific';
  status: 'sent' | 'scheduled' | 'draft' | 'failed';
  sentAt?: string;
  scheduledAt?: string;
  recipientCount: number;
  openRate?: number;
  createdBy: string;
}

export interface Video {
  id: string;
  title: string;
  category: string;
  language: string;
  duration: string;
  thumbnail: string;
  url: string;
  platform: 'youtube' | 'vimeo' | 'direct';
  status: 'active' | 'inactive' | 'processing';
  views: number;
  likes: number;
  uploadedAt: string;
  description?: string;
}

export interface DashboardStats {
  totalElders: number;
  activeElders: number;
  totalGuardians: number;
  activeGuardians: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  sosTriggeredToday: number;
  activeAIUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  openSupportTickets: number;
  totalAIRequestsToday: number;
}

export interface ChartData {
  name: string;
  value?: number;
  [key: string]: string | number | undefined;
}

export interface ActivityItem {
  id: string;
  type: 'elder_registered' | 'guardian_connected' | 'sos_triggered' | 'journal_created' | 'medicine_missed' | 'checkin_submitted' | 'ai_session';
  message: string;
  time: string;
  avatar?: string;
  severity?: 'info' | 'warning' | 'critical';
}
