export type Role = "admin" | "faculty" | "student";

export type UserProfile = {
  id: string;
  role: Role;
  name: string;
  section: string | null;
  department: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
};

export type Timetable = {
  id: string;
  label: string;
  semester: string;
  section: string;
  department: string;
  file_url: string | null;
  file_type: string | null;
  uploaded_by: string;
  is_active: boolean;
  created_at: string;
};

export type TimetableEntry = {
  id: string;
  timetable_id: string;
  subject: string;
  subject_code: string | null;
  faculty_name: string | null;
  room: string | null;
  day_of_week: number;
  period_number: number;
  start_time: string;
  end_time: string;
  color_hex: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "reminder";
  is_read: boolean;
  created_at: string;
};

export type AuditLog = {
  id: string;
  action: string;
  performed_by: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type Reminder = {
  id: string;
  user_id: string;
  timetable_entry_id: string;
  remind_before_minutes: number;
  is_active: boolean;
};