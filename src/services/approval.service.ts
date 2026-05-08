import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { COL, db } from "@/lib/firebase";

export const approvalService = {
  async approve(id: string): Promise<void> {
    await updateDoc(doc(db(), COL.contents, id), {
      status: "approved",
      rejectionReason: null,
      reviewedAt: serverTimestamp(),
    });
  },
  async reject(id: string, reason: string): Promise<void> {
    const trimmed = reason.trim();
    if (trimmed.length < 5) throw new Error("Reason must be at least 5 characters");
    await updateDoc(doc(db(), COL.contents, id), {
      status: "rejected",
      rejectionReason: trimmed,
      reviewedAt: serverTimestamp(),
    });
  },
};
