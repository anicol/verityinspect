// Generated TypeScript types for PeakOps API
// Generated at: 2025-09-25T15:07:18.298Z

export interface ActionItem {
  id: number;
  assigned_to_name: string;
  completed_by_name: string;
  title: string;
  description: string;
  /** * `LOW` - Low
* `MEDIUM` - Medium
* `HIGH` - High
* `URGENT` - Urgent */
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  /** * `OPEN` - Open
* `IN_PROGRESS` - In Progress
* `COMPLETED` - Completed
* `DISMISSED` - Dismissed */
  status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED';
  due_date?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  inspection: number;
  finding?: number;
  assigned_to?: number;
  completed_by?: number;
}

export interface ActionItemRequest {
  title: string;
  description: string;
  /** * `LOW` - Low
* `MEDIUM` - Medium
* `HIGH` - High
* `URGENT` - Urgent */
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  /** * `OPEN` - Open
* `IN_PROGRESS` - In Progress
* `COMPLETED` - Completed
* `DISMISSED` - Dismissed */
  status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED';
  due_date?: string;
  completed_at?: string;
  notes?: string;
  inspection: number;
  finding?: number;
  assigned_to?: number;
  completed_by?: number;
}

export interface ActionItemUpdate {
  /** * `OPEN` - Open
* `IN_PROGRESS` - In Progress
* `COMPLETED` - Completed
* `DISMISSED` - Dismissed */
  status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED';
  assigned_to?: number;
  due_date?: string;
  notes?: string;
}

export interface Brand {
  id: number;
  stores_count: string;
  name: string;
  logo?: string;
  description?: string;
  /** Retention period for inspection mode in days */
  retention_days_inspection?: number;
  /** Retention period for coaching mode in days */
  retention_days_coaching?: number;
  /** URL for webhook notifications */
  webhook_url?: string;
  /** Configuration for inspection criteria */
  inspection_config?: any;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandRequest {
  name: string;
  logo?: string;
  description?: string;
  /** Retention period for inspection mode in days */
  retention_days_inspection?: number;
  /** Retention period for coaching mode in days */
  retention_days_coaching?: number;
  /** URL for webhook notifications */
  webhook_url?: string;
  /** Configuration for inspection criteria */
  inspection_config?: any;
  is_active?: boolean;
}

export interface ContactFormRequest {
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface DemoRequestRequest {
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  phone?: string;
  stores: string;
  role: string;
  message?: string;
}

export interface Finding {
  id: number;
  frame_image: string;
  frame_timestamp: number;
  /** * `PPE` - Personal Protective Equipment
* `SAFETY` - Safety
* `CLEANLINESS` - Cleanliness
* `UNIFORM` - Uniform Compliance
* `MENU_BOARD` - Menu Board
* `OTHER` - Other */
  category: 'PPE' | 'SAFETY' | 'CLEANLINESS' | 'UNIFORM' | 'MENU_BOARD' | 'OTHER';
  /** * `LOW` - Low
* `MEDIUM` - Medium
* `HIGH` - High
* `CRITICAL` - Critical */
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  /** AI confidence score 0-1 */
  confidence: number;
  /** Object detection coordinates */
  bounding_box?: any;
  recommended_action?: string;
  is_resolved?: boolean;
  created_at: string;
  inspection: number;
  frame?: number;
}

export interface FindingRequest {
  /** * `PPE` - Personal Protective Equipment
* `SAFETY` - Safety
* `CLEANLINESS` - Cleanliness
* `UNIFORM` - Uniform Compliance
* `MENU_BOARD` - Menu Board
* `OTHER` - Other */
  category: 'PPE' | 'SAFETY' | 'CLEANLINESS' | 'UNIFORM' | 'MENU_BOARD' | 'OTHER';
  /** * `LOW` - Low
* `MEDIUM` - Medium
* `HIGH` - High
* `CRITICAL` - Critical */
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  /** AI confidence score 0-1 */
  confidence: number;
  /** Object detection coordinates */
  bounding_box?: any;
  recommended_action?: string;
  is_resolved?: boolean;
  inspection: number;
  frame?: number;
}

export interface Inspection {
  id: number;
  findings: Finding[];
  action_items: ActionItem[];
  video_title: string;
  store_name: string;
  findings_count: string;
  critical_findings_count: string;
  open_actions_count: string;
  /** * `INSPECTION` - Inspection Mode
* `COACHING` - Coaching Mode */
  mode: 'INSPECTION' | 'COACHING';
  /** * `PENDING` - Pending
* `PROCESSING` - Processing
* `COMPLETED` - Completed
* `FAILED` - Failed */
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  /** Overall score 0-100 */
  overall_score?: number;
  ppe_score?: number;
  safety_score?: number;
  cleanliness_score?: number;
  uniform_score?: number;
  menu_board_score?: number;
  /** Raw AI analysis results */
  ai_analysis?: any;
  error_message?: string;
  /** When this inspection expires */
  expires_at?: string;
  created_at: string;
  updated_at: string;
  video: number;
}

export interface InspectionList {
  id: number;
  /** * `INSPECTION` - Inspection Mode
* `COACHING` - Coaching Mode */
  mode: 'INSPECTION' | 'COACHING';
  /** * `PENDING` - Pending
* `PROCESSING` - Processing
* `COMPLETED` - Completed
* `FAILED` - Failed */
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  /** Overall score 0-100 */
  overall_score?: number;
  video_title: string;
  store_name: string;
  findings_count: string;
  critical_findings_count: string;
  /** When this inspection expires */
  expires_at?: string;
  created_at: string;
}

export interface InspectionRequest {
  /** * `INSPECTION` - Inspection Mode
* `COACHING` - Coaching Mode */
  mode: 'INSPECTION' | 'COACHING';
  /** * `PENDING` - Pending
* `PROCESSING` - Processing
* `COMPLETED` - Completed
* `FAILED` - Failed */
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  /** Overall score 0-100 */
  overall_score?: number;
  ppe_score?: number;
  safety_score?: number;
  cleanliness_score?: number;
  uniform_score?: number;
  menu_board_score?: number;
  /** Raw AI analysis results */
  ai_analysis?: any;
  error_message?: string;
  /** When this inspection expires */
  expires_at?: string;
  video: number;
}

export interface PaginatedActionItemList {
  count: number;
  next?: string;
  previous?: string;
  results: ActionItem[];
}

export interface PaginatedBrandList {
  count: number;
  next?: string;
  previous?: string;
  results: Brand[];
}

export interface PaginatedFindingList {
  count: number;
  next?: string;
  previous?: string;
  results: Finding[];
}

export interface PaginatedInspectionListList {
  count: number;
  next?: string;
  previous?: string;
  results: InspectionList[];
}

export interface PaginatedStoreListList {
  count: number;
  next?: string;
  previous?: string;
  results: StoreList[];
}

export interface PaginatedUploadList {
  count: number;
  next?: string;
  previous?: string;
  results: Upload[];
}

export interface PaginatedUserList {
  count: number;
  next?: string;
  previous?: string;
  results: User[];
}

export interface PaginatedVideoFrameList {
  count: number;
  next?: string;
  previous?: string;
  results: VideoFrame[];
}

export interface PaginatedVideoListList {
  count: number;
  next?: string;
  previous?: string;
  results: VideoList[];
}

export interface PatchedActionItemUpdateRequest {
  /** * `OPEN` - Open
* `IN_PROGRESS` - In Progress
* `COMPLETED` - Completed
* `DISMISSED` - Dismissed */
  status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED';
  assigned_to?: number;
  due_date?: string;
  notes?: string;
}

export interface PatchedBrandRequest {
  name?: string;
  logo?: string;
  description?: string;
  /** Retention period for inspection mode in days */
  retention_days_inspection?: number;
  /** Retention period for coaching mode in days */
  retention_days_coaching?: number;
  /** URL for webhook notifications */
  webhook_url?: string;
  /** Configuration for inspection criteria */
  inspection_config?: any;
  is_active?: boolean;
}

export interface PatchedInspectionRequest {
  /** * `INSPECTION` - Inspection Mode
* `COACHING` - Coaching Mode */
  mode?: 'INSPECTION' | 'COACHING';
  /** * `PENDING` - Pending
* `PROCESSING` - Processing
* `COMPLETED` - Completed
* `FAILED` - Failed */
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  /** Overall score 0-100 */
  overall_score?: number;
  ppe_score?: number;
  safety_score?: number;
  cleanliness_score?: number;
  uniform_score?: number;
  menu_board_score?: number;
  /** Raw AI analysis results */
  ai_analysis?: any;
  error_message?: string;
  /** When this inspection expires */
  expires_at?: string;
  video?: number;
}

export interface PatchedStoreRequest {
  name?: string;
  /** Geographic region or district */
  region?: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  manager_email?: string;
  timezone?: string;
  is_active?: boolean;
  brand?: number;
}

export interface PatchedUserRequest {
  /** Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only. */
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  /** * `ADMIN` - Admin
* `GM` - General Manager
* `INSPECTOR` - Inspector */
  role?: 'ADMIN' | 'GM' | 'INSPECTOR';
  store?: number;
  phone?: string;
  is_active?: boolean;
}

export interface PatchedVideoRequest {
  title?: string;
  description?: string;
  file?: string;
  store?: number;
}

export interface Store {
  id: number;
  brand_name: string;
  name: string;
  /** Geographic region or district */
  region?: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone?: string;
  manager_email?: string;
  timezone?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  brand: number;
}

export interface StoreList {
  id: number;
  name: string;
  code: string;
  brand: number;
  brand_name: string;
  city: string;
  state: string;
  is_active?: boolean;
}

export interface StoreRequest {
  name: string;
  /** Geographic region or district */
  region?: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone?: string;
  manager_email?: string;
  timezone?: string;
  is_active?: boolean;
  brand: number;
}

export interface TokenRefresh {
  access: string;
  refresh: string;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface Upload {
  id: number;
  store: number;
  /** * `inspection` - Inspection Mode
* `coaching` - Coaching Mode */
  mode: 'inspection' | 'coaching';
  /** S3 object key for the video file */
  s3_key: string;
  /** * `uploaded` - Uploaded
* `processing` - Processing
* `complete` - Complete
* `failed` - Failed */
  status?: 'uploaded' | 'processing' | 'complete' | 'failed';
  /** Video duration in seconds */
  duration_s?: number;
  /** Original uploaded filename */
  original_filename: string;
  /** MIME type of the file */
  file_type?: string;
  created_at: string;
  updated_at: string;
  created_by: number;
}

export interface User {
  id: number;
  /** Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only. */
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name: string;
  /** * `ADMIN` - Admin
* `GM` - General Manager
* `INSPECTOR` - Inspector */
  role?: 'ADMIN' | 'GM' | 'INSPECTOR';
  store?: number;
  phone?: string;
  is_active?: boolean;
  created_at: string;
}

export interface UserCreate {
  /** Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only. */
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  /** * `ADMIN` - Admin
* `GM` - General Manager
* `INSPECTOR` - Inspector */
  role?: 'ADMIN' | 'GM' | 'INSPECTOR';
  store?: number;
  phone?: string;
}

export interface UserCreateRequest {
  /** Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only. */
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  password: string;
  password_confirm: string;
  /** * `ADMIN` - Admin
* `GM` - General Manager
* `INSPECTOR` - Inspector */
  role?: 'ADMIN' | 'GM' | 'INSPECTOR';
  store?: number;
  phone?: string;
}

export interface UserRequest {
  /** Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only. */
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  /** * `ADMIN` - Admin
* `GM` - General Manager
* `INSPECTOR` - Inspector */
  role?: 'ADMIN' | 'GM' | 'INSPECTOR';
  store?: number;
  phone?: string;
  is_active?: boolean;
}

export interface Video {
  id: number;
  frames: VideoFrame[];
  uploaded_by_name: string;
  store_name: string;
  file_size_mb: string;
  title: string;
  description?: string;
  file: string;
  thumbnail: string;
  /** Duration in seconds */
  duration: number;
  /** File size in bytes */
  file_size: number;
  /** * `UPLOADED` - Uploaded
* `PROCESSING` - Processing
* `COMPLETED` - Completed
* `FAILED` - Failed */
  status: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error_message: string;
  /** Video metadata from FFmpeg */
  metadata: any;
  created_at: string;
  updated_at: string;
  uploaded_by: number;
  store: number;
}

export interface VideoFrame {
  id: number;
  /** Timestamp in seconds */
  timestamp: number;
  frame_number: number;
  image: string;
  width: number;
  height: number;
  created_at: string;
  video: number;
}

export interface VideoFrameRequest {
  /** Timestamp in seconds */
  timestamp: number;
  frame_number: number;
  image: string;
  width: number;
  height: number;
  video: number;
}

export interface VideoList {
  id: number;
  title: string;
  store: number;
  store_name: string;
  uploaded_by_name: string;
  /** * `UPLOADED` - Uploaded
* `PROCESSING` - Processing
* `COMPLETED` - Completed
* `FAILED` - Failed */
  status?: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  /** Duration in seconds */
  duration?: number;
  file_size_mb: string;
  thumbnail?: string;
  created_at: string;
}

export interface VideoRequest {
  title: string;
  description?: string;
  file: string;
  store: number;
}


// Common API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}
