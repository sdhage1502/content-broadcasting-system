export type UserRole = "teacher" | "principal";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teacherId?: string;
}

export type ContentStatus = "pending" | "approved" | "rejected";

export interface Content {
  id: string;
  title: string;
  subject: string;
  description?: string;
  fileUrl: string; // Cloudinary URL
  fileType: string;
  filePublicId?: string; // Cloudinary public_id
  fileVersion?: number; // Cloudinary version
  startTime: string; // ISO
  endTime: string; // ISO
  rotationDuration: number; // minutes
  status: ContentStatus;
  rejectionReason?: string;
  teacherId: string;
  teacherName?: string;
  createdAt: string;
}

export interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
}
