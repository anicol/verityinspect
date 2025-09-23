// Common types shared across apps

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'ADMIN' | 'GM' | 'INSPECTOR';
  store: number | null;
  phone: string;
  is_active: boolean;
  created_at: string;
}

export interface Brand {
  id: number;
  name: string;
  logo: string | null;
  description: string;
  retention_days_inspection: number;
  retention_days_coaching: number;
  webhook_url: string | null;
  inspection_config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: number;
  brand: number;
  brand_name: string;
  name: string;
  region: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  manager_email: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Upload {
  id: number;
  store: number;
  store_name: string;
  mode: 'inspection' | 'coaching';
  s3_key: string;
  presigned_url?: string;
  status: 'uploaded' | 'processing' | 'complete' | 'failed';
  duration_s: number | null;
  created_at: string;
  created_by: number;
  created_by_name: string;
}

export interface Detection {
  id: number;
  upload: number;
  type: string;
  label: string;
  confidence: number;
  frame_ts_ms: number;
  bbox_json: Record<string, any> | null;
}

export interface Rule {
  id: number;
  brand: number;
  code: string;
  name: string;
  description: string;
  config_json: Record<string, any>;
  is_active: boolean;
}

export interface Violation {
  id: number;
  upload: number;
  rule: number;
  rule_name: string;
  severity: 'low' | 'med' | 'high';
  evidence_frame_ts_ms: number;
  evidence_s3_key: string;
  status: 'open' | 'dismissed' | 'approved';
  notes: string;
  created_at: string;
}

export interface Scorecard {
  upload: number;
  scores_json: Record<string, any>;
  total_score: number;
  ppe_score: number | null;
  safety_score: number | null;
  cleanliness_score: number | null;
  uniform_score: number | null;
  menu_board_score: number | null;
  created_at: string;
}

export interface Task {
  id: number;
  store: number;
  upload: number | null;
  title: string;
  description: string;
  status: 'open' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: number | null;
  assigned_to_name: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  actor_user: number;
  actor_user_name: string;
  action: string;
  entity: string;
  entity_id: number;
  meta_json: Record<string, any>;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  services: {
    database: 'ok' | 'error';
    redis: 'ok' | 'error';
    celery: 'ok' | 'error';
  };
}