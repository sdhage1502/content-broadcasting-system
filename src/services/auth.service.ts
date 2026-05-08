import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type User as FirebaseUser } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { auth, COL, createSecondaryAuth, db } from "@/lib/firebase";
import type { User, UserRole } from "@/types";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export interface SignupInput {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

const mapUserDoc = (id: string, data: { email: string; name: string; role: UserRole; teacherId?: string | null }): User => ({
  id,
  email: data.email,
  name: data.name,
  role: data.role,
  teacherId: data.teacherId ?? undefined,
});

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth(), normalizeEmail(email), password);
    const userDoc = await getDoc(doc(db(), COL.users, cred.user.uid));
    if (!userDoc.exists()) throw new Error("User profile not found");
    const data = userDoc.data() as { email: string; name: string; role: UserRole; teacherId?: string | null };
    return mapUserDoc(cred.user.uid, data);
  },

  async signup({ email, password, name, role }: SignupInput): Promise<User> {
    const normalized = normalizeEmail(email);

    // No pre-flight Firestore lookup — Firestore rules require auth, and
    // the user isn't signed in yet. Firebase Auth itself rejects duplicates
    // with `auth/email-already-in-use`, which surfaces as a friendly message.
    const cred = await createUserWithEmailAndPassword(auth(), normalized, password);
    const teacherId = role === "teacher" ? `t_${Date.now().toString(36)}` : undefined;

    await setDoc(doc(db(), COL.users, cred.user.uid), {
      email: normalized,
      name: name.trim(),
      role,
      teacherId: teacherId ?? null,
      createdAt: serverTimestamp(),
    });

    return { id: cred.user.uid, email: normalized, name: name.trim(), role, teacherId };
  },

  async logout(): Promise<void> {
    await signOut(auth());
  },

  async getUser(fbUser: FirebaseUser): Promise<User | null> {
    const userDoc = await getDoc(doc(db(), COL.users, fbUser.uid));
    if (!userDoc.exists()) return null;
    const data = userDoc.data() as { email: string; name: string; role: UserRole; teacherId?: string | null };
    return mapUserDoc(fbUser.uid, data);
  },

  async listTeachers(): Promise<User[]> {
    const snap = await getDocs(query(collection(db(), COL.users), where("role", "==", "teacher")));
    const teachers = snap.docs.map((d) => {
      const data = d.data() as { email: string; name: string; role: UserRole; teacherId?: string | null };
      return mapUserDoc(d.id, data);
    });
    return teachers.sort((a, b) => a.name.localeCompare(b.name));
  },

  /**
   * Provisions a new teacher from inside an authenticated principal's session.
   * Uses a secondary Firebase Auth instance so the principal's primary session
   * (and the AuthContext listener) is not disturbed.
   */
  async createTeacher(input: { name: string; email: string; password: string }): Promise<User> {
    const normalized = normalizeEmail(input.email);
    const name = input.name.trim();

    // Firebase Auth rejects duplicates natively with `auth/email-already-in-use`,
    // which gets mapped to a friendly message by getErrorMessage().
    const { auth: secondaryAuth, db: secondaryDb, dispose } = await createSecondaryAuth();
    try {
      // Create the Firebase Auth account on the secondary app.
      const cred = await createUserWithEmailAndPassword(secondaryAuth, normalized, input.password);
      const teacherId = `t_${Date.now().toString(36)}`;

      // Write the Firestore profile doc using the SECONDARY Firestore instance.
      // At this point request.auth.uid === cred.user.uid on the secondary app,
      // so the rule `allow create: if request.auth.uid == userId` is satisfied.
      await setDoc(doc(secondaryDb, COL.users, cred.user.uid), {
        email: normalized,
        name,
        role: "teacher" as UserRole,
        teacherId,
        createdAt: serverTimestamp(),
      });

      return { id: cred.user.uid, email: normalized, name, role: "teacher", teacherId };
    } finally {
      await dispose();
    }
  },
};
