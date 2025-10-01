export interface TrialStatus {
  is_trial: boolean;
  expires_at?: string;
  days_remaining?: number;
  hours_remaining?: number;
  is_expired?: boolean;
  videos_used?: number;
  videos_remaining?: number;
  stores_used?: number;
  stores_remaining?: number;
  reports_downloaded?: number;
  reports_remaining?: number;
  can_upload_video?: boolean;
  can_create_store?: boolean;
  can_download_report?: boolean;
  conversion_score?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'ADMIN' | 'GM' | 'INSPECTOR' | 'TRIAL_ADMIN';
  store: number | null;
  phone: string;
  is_active: boolean;
  is_trial_user?: boolean;
  trial_status?: TrialStatus;
  has_seen_demo?: boolean;
  requested_demo?: boolean;
  demo_completed_at?: string;
  hours_since_signup?: number;
  total_inspections?: number;
  created_at: string;
}

export interface Brand {
  id: number;
  name: string;
  logo: string | null;
  description: string;
  inspection_config: Record<string, any>;
  retention_config: Record<string, any>;
  is_active: boolean;
  stores_count: number;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: number;
  brand: number;
  brand_name: string;
  name: string;
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

export interface Video {
  id: number;
  uploaded_by: number;
  uploaded_by_name: string;
  store: number;
  store_name: string;
  title: string;
  description: string;
  file: string;
  thumbnail: string | null;
  duration: number | null;
  file_size: number | null;
  file_size_mb: number | null;
  status: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error_message: string;
  metadata: Record<string, any>;
  frames?: VideoFrame[];
  created_at: string;
  updated_at: string;
}

export interface VideoFrame {
  id: number;
  video: number;
  timestamp: number;
  frame_number: number;
  image: string;
  width: number;
  height: number;
  created_at: string;
}

export interface Inspection {
  id: number;
  video: number;
  video_title: string;
  store_name: string;
  mode: 'INSPECTION' | 'COACHING';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  overall_score: number | null;
  ppe_score: number | null;
  safety_score: number | null;
  cleanliness_score: number | null;
  food_safety_score: number | null;
  equipment_score: number | null;
  operational_score: number | null;
  food_quality_score: number | null;
  staff_behavior_score: number | null;
  uniform_score: number | null;
  menu_board_score: number | null;
  ai_analysis: Record<string, any>;
  error_message: string;
  expires_at: string | null;
  findings?: Finding[];
  action_items?: ActionItem[];
  findings_count: number;
  critical_findings_count: number;
  open_actions_count: number;
  created_at: string;
  updated_at: string;
}

export interface Finding {
  id: number;
  inspection: number;
  frame: number | null;
  frame_image: string | null;
  frame_timestamp: number | null;
  category: 'PPE' | 'SAFETY' | 'CLEANLINESS' | 'UNIFORM' | 'MENU_BOARD' | 'FOOD_SAFETY' | 'EQUIPMENT' | 'OPERATIONAL' | 'FOOD_QUALITY' | 'STAFF_BEHAVIOR' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  confidence: number;
  bounding_box: Record<string, any> | null;
  recommended_action: string;
  is_resolved: boolean;
  // Consolidation fields
  affected_frame_count: number;
  first_timestamp: number | null;
  last_timestamp: number | null;
  average_confidence: number | null;
  // AI-generated action metadata
  estimated_minutes: number | null;
  created_at: string;
}

export interface ActionItem {
  id: number;
  inspection: number;
  finding: number | null;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED';
  assigned_to: number | null;
  assigned_to_name: string | null;
  due_date: string | null;
  completed_at: string | null;
  completed_by: number | null;
  completed_by_name: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
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

export interface InspectionStats {
  total_inspections: number;
  completed_inspections: number;
  average_score: number | null;
  critical_findings: number;
  open_action_items: number;
}

export interface Upload {
  id: number;
  store: number;
  mode: 'inspection' | 'coaching';
  s3_key: string;
  status: 'uploaded' | 'processing' | 'complete' | 'failed';
  duration_s: number | null;
  original_filename: string;
  file_type: string;
  created_at: string;
  updated_at: string;
  created_by: number;
}