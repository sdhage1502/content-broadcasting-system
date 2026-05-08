import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, Timestamp, where, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
import { COL, db } from "@/lib/firebase";
import type { Content, ContentStatus, Stats } from "@/types";

export interface ContentListParams {
  status?: ContentStatus;
  q?: string;
  teacherId?: string;
  page?: number;
  pageSize?: number;
}

export interface ContentListResponse {
  items: Content[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateContentInput {
  title: string;
  subject: string;
  description?: string;
  file: File;
  startTime: Date;
  endTime: Date;
  rotationDuration: number;
  teacherId: string;
  teacherName: string;
}

const toISO = (ts: unknown): string => {
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (ts instanceof Date) return ts.toISOString();
  if (typeof ts === "string") return ts;
  return new Date().toISOString();
};

const mapContent = (d: QueryDocumentSnapshot<DocumentData>): Content => {
  const data = d.data();
  return {
    id: d.id,
    title: data.title,
    subject: data.subject,
    description: data.description ?? "",
    fileUrl: data.fileUrl,
    fileType: data.fileType,
    filePublicId: data.filePublicId ?? undefined,
    fileVersion: data.fileVersion ?? undefined,
    startTime: toISO(data.startTime),
    endTime: toISO(data.endTime),
    rotationDuration: data.rotationDuration,
    status: data.status as ContentStatus,
    rejectionReason: data.rejectionReason ?? undefined,
    teacherId: data.teacherId,
    teacherName: data.teacherName ?? undefined,
    createdAt: toISO(data.createdAt),
  };
};

const fetchAll = async (filters: { teacherId?: string; status?: ContentStatus }): Promise<Content[]> => {
  const clauses: ReturnType<typeof where>[] = [];
  if (filters.teacherId) clauses.push(where("teacherId", "==", filters.teacherId));
  if (filters.status) clauses.push(where("status", "==", filters.status));

  // Sort client-side to avoid requiring Firestore composite indexes for every
  // (teacherId|status) + createdAt combination. Dataset is small per teacher.
  const q = clauses.length
    ? query(collection(db(), COL.contents), ...clauses)
    : query(collection(db(), COL.contents));

  const snap = await getDocs(q);
  const items = snap.docs.map(mapContent);
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const contentService = {
  async list(params: ContentListParams = {}): Promise<ContentListResponse> {
    let items = await fetchAll({ teacherId: params.teacherId, status: params.status });
    if (params.q) {
      const q = params.q.toLowerCase();
      items = items.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q),
      );
    }
    const total = items.length;
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(1, Math.min(100, params.pageSize ?? 20));
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total, page, pageSize };
  },

  async getById(id: string): Promise<Content> {
    const snap = await getDoc(doc(db(), COL.contents, id));
    if (!snap.exists()) throw new Error("Content not found");
    return mapContent(snap as QueryDocumentSnapshot<DocumentData>);
  },

  async create(input: CreateContentInput): Promise<Content> {
    // Client-side validation (server re-validates)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (input.file.size > maxSize) {
      throw new Error("File size exceeds 10MB limit");
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(input.file.type)) {
      throw new Error("Invalid file type. Allowed types: JPG, PNG, GIF, WebP, PDF, DOCX");
    }

    // Upload via server-side API route (signed Cloudinary upload)
    const formData = new FormData();
    formData.append("file", input.file);
    formData.append("teacherId", input.teacherId);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(err.error ?? "Upload failed");
    }
    const upload = (await res.json()) as { url: string; publicId: string; version: number };

    const payload = {
      title: input.title,
      subject: input.subject,
      description: input.description ?? "",
      fileUrl: upload.url,
      fileType: input.file.type,
      filePublicId: upload.publicId,
      fileVersion: upload.version,
      startTime: Timestamp.fromDate(input.startTime),
      endTime: Timestamp.fromDate(input.endTime),
      rotationDuration: input.rotationDuration,
      status: "pending" as ContentStatus,
      teacherId: input.teacherId,
      teacherName: input.teacherName,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db(), COL.contents), payload);
    return { id: docRef.id, ...payload, startTime: input.startTime.toISOString(), endTime: input.endTime.toISOString(), createdAt: new Date().toISOString() } as Content;
  },

  async stats(filters: { teacherId?: string } = {}): Promise<Stats> {
    const items = await fetchAll({ teacherId: filters.teacherId });
    return {
      total: items.length,
      pending: items.filter((c) => c.status === "pending").length,
      approved: items.filter((c) => c.status === "approved").length,
      rejected: items.filter((c) => c.status === "rejected").length,
    };
  },
};
