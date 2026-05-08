import { collection, onSnapshot, query, where, Timestamp, getDocs, limit, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
import { COL, db } from "@/lib/firebase";
import type { Content } from "@/types";

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
    status: data.status,
    rejectionReason: data.rejectionReason ?? undefined,
    teacherId: data.teacherId,
    teacherName: data.teacherName ?? undefined,
    createdAt: toISO(data.createdAt),
  };
};

export interface LiveSubscriptionPayload {
  teacherName: string | null;
  items: Content[];
}

const lookupTeacherName = async (teacherId: string): Promise<string | null> => {
  try {
    const snap = await getDocs(query(collection(db(), COL.users), where("teacherId", "==", teacherId), limit(1)));
    return snap.empty ? null : (snap.docs[0].data().name as string) ?? null;
  } catch {
    return null;
  }
};

export const liveService = {
  subscribe(teacherId: string, callback: (payload: LiveSubscriptionPayload) => void, onError?: (err: Error) => void): () => void {
    let teacherName: string | null = null;
    let nameResolved = false;

    lookupTeacherName(teacherId).then((name) => { teacherName = name; nameResolved = true; });

    const q = query(collection(db(), COL.contents), where("teacherId", "==", teacherId), where("status", "==", "approved"));

    const unsub = onSnapshot(q, (snap) => {
      const now = Date.now();
      const items = snap.docs.map(mapContent).filter((c) => {
        const start = new Date(c.startTime).getTime();
        const end = new Date(c.endTime).getTime();
        const inTimeWindow = now >= start && now <= end;
        const isImage = c.fileType.startsWith("image/");
        return inTimeWindow && isImage;
      }).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

      callback({ teacherName, items });

      if (!nameResolved) {
        lookupTeacherName(teacherId).then((name) => { teacherName = name; callback({ teacherName, items }); });
      }
    }, (err) => onError?.(err as Error));

    return unsub;
  },
};
