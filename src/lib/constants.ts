export const SUBJECTS = [
  "Mathematics",
  "Science",
  "History",
  "English",
  "Geography",
  "Computer Science",
  "Art",
  "Physical Education",
] as const;

export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_FILE_SIZE_LABEL = "10 MB";
export const ALLOWED_FILE_EXTENSIONS = ".jpg, .jpeg, .png, .gif, .pdf, .docx";

export const ROLE_HOME: Record<"teacher" | "principal", string> = {
  teacher: "/teacher/dashboard",
  principal: "/principal/dashboard",
};
