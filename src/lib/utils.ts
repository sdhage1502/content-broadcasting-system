import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import type { Content } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isActive(content: Content, now: Date = new Date()): boolean {
  if (content.status !== "approved") return false;
  const start = new Date(content.startTime);
  const end = new Date(content.endTime);
  return now >= start && now <= end;
}

export function formatDateTime(iso: string): string {
  try {
    return format(parseISO(iso), "PPp");
  } catch {
    return iso;
  }
}

export function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), "PP");
  } catch {
    return iso;
  }
}

export function bytesToReadable(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function generateId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/**
 * Maps Firebase Auth & Firestore error codes to user-friendly messages.
 * Falls back to the original error message or the supplied fallback.
 */
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Invalid email or password.",
  "auth/invalid-email": "That email address looks invalid.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/user-disabled": "This account has been disabled. Contact your administrator.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password is too weak — use at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/operation-not-allowed": "Email/password sign-in is disabled for this project.",
  "auth/requires-recent-login": "Please sign in again to perform this action.",
  "permission-denied": "You don't have permission to perform this action.",
  "unavailable": "The service is temporarily unavailable. Please try again.",
  "not-found": "The requested item was not found.",
  "already-exists": "That item already exists.",
};

function extractFirebaseCode(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  const code = extractFirebaseCode(error);
  if (code && FIREBASE_ERROR_MESSAGES[code]) return FIREBASE_ERROR_MESSAGES[code];
  if (error instanceof Error && error.message) {
    // Strip the leading "Firebase: " prefix some SDK errors include.
    return error.message.replace(/^Firebase:\s*/i, "");
  }
  if (typeof error === "string") return error;
  return fallback;
}
