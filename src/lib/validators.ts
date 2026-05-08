import { z } from "zod";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, SUBJECTS } from "./constants";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name is too short").max(80, "Name is too long"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type SignupInput = z.infer<typeof signupSchema>;

const fileSchema = z
  .instanceof(File, { message: "File is required" })
  .refine((f) => (ALLOWED_FILE_TYPES as readonly string[]).includes(f.type), {
    message: "Only images (JPG, PNG, GIF), PDF, or DOCX allowed",
  })
  .refine((f) => f.size <= MAX_FILE_SIZE, {
    message: "File must be 10 MB or smaller",
  });

export const uploadSchema = z
  .object({
    title: z.string().min(2, "Title is too short").max(120, "Title is too long"),
    subject: z.enum(SUBJECTS as unknown as [string, ...string[]], {
      message: "Select a subject",
    }),
    description: z.string().max(500, "Description is too long").optional().or(z.literal("")),
    file: fileSchema,
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    rotationDuration: z
      .number({ message: "Enter rotation in minutes" })
      .int("Must be a whole number")
      .min(1, "At least 1 minute")
      .max(1440, "At most 1440 minutes (24 h)"),
  })
  .refine((v) => new Date(v.endTime) > new Date(v.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export type UploadInput = z.infer<typeof uploadSchema>;

export const rejectSchema = z.object({
  reason: z.string().min(5, "Provide a reason of at least 5 characters").max(500),
});
export type RejectInput = z.infer<typeof rejectSchema>;
