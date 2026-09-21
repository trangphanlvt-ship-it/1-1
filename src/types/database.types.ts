export type UserRole = 'admin' | 'teacher' | 'student';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  student_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  student_code: string;
  full_name: string;
  dob?: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  team_number: number; // 1, 2, 3, 4
  role_in_class: string; // 'Học sinh', 'Lớp trưởng', 'Lớp phó', 'Tổ trưởng'...
  parent_name?: string;
  parent_phone?: string;
  address?: string;
  avatar_url?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  subject: string;
  target_date: string;
  is_important: boolean;
  author_id?: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  confirmations_count?: number;
  is_confirmed_by_me?: boolean;
}

export interface NoticeConfirmation {
  id: string;
  notice_id: string;
  student_id?: string;
  confirmed_by: string;
  confirmed_at: string;
  profile?: Profile;
}

export interface WeeklyCompetition {
  id: string;
  week_number: number;
  semester: number;
  student_id: string;
  flower_points: number; // Bông hoa điểm 10
  discipline_points: number; // Điểm nề nếp
  star_points: number; // Sao khen thưởng
  deduction_points: number; // Điểm trừ
  total_score?: number;
  rank_position?: number;
  note?: string;
  student?: Student;
}

export interface CompetitionLog {
  id: string;
  student_id: string;
  week_number: number;
  point_type: 'flower' | 'discipline' | 'star' | 'deduction';
  points: number;
  reason: string;
  created_by?: string;
  created_at: string;
  student?: Student;
}

export interface ActivityAlbum {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  cover_image_url?: string;
  created_by?: string;
  created_at: string;
  photos_count?: number;
}

export interface ActivityPhoto {
  id: string;
  album_id: string;
  image_url: string;
  caption?: string;
  uploaded_by?: string;
  created_at: string;
}
