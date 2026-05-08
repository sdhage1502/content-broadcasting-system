# Content Broadcasting System

A role-based content management and broadcasting platform built for the Frontend Developer Technical Assignment. Teachers upload classroom materials, principals review and approve submissions, and approved content is broadcast on a public, real-time live page at `/live/<teacherId>`.

---

## 1.  Credentials



| Role | Email | Password |
| --- | --- | --- |
| **Principal** | `max@yc.com` | `max12345` |
| **Teacher** | `teacher@yc.com` | `teacher123` |

> Teachers can also self-register at `/signup`. Principals can provision additional teachers from **Principal → Teachers → Add teacher** without losing their own session (see [Auth flow](#5-authentication--authorization-flow)).

---

## 2. Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | **Next.js 16** (App Router, Turbopack) |
| Language | **TypeScript** + React 19 |
| Styling | **Tailwind CSS v4** + shadcn-style Radix UI primitives |
| Forms | **React Hook Form** + **Zod** |
| Auth + DB | **Firebase Authentication** + **Cloud Firestore** |
| File storage | **Cloudinary** (signed server-side uploads, `<CldImage>` previews) |
| State | React Context (auth) + custom hooks (data) |
| Notifications | **Sonner** toasts |
| Theme | `next-themes` (light/dark) |
| Icons | `lucide-react` |

---

## 3. Getting Started

### Prerequisites
- **Node.js 18.18+** (20+ recommended)
- A **Firebase project** with **Firestore** and **Authentication (Email/Password)** enabled
- A **Cloudinary account** (free tier is fine)

### Install

```bash
npm install
cp .env.example .env.local
# fill .env.local with your Firebase + Cloudinary keys
npm run dev          # http://localhost:3000
```

### Build / Run production

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

---

## 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# Firebase — Project settings → Your apps → Web app
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=     # exposed to the browser (CldImage)
CLOUDINARY_CLOUD_NAME=                 # server-only (signed upload)
CLOUDINARY_API_KEY=                    # server-only
CLOUDINARY_API_SECRET=                 # server-only
```

Anything starting with `NEXT_PUBLIC_` is bundled into the client. `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` are **never** sent to the browser — they are only read inside `/api/upload`.

---

## 5. Authentication & Authorization Flow

### Login / signup
- Backed by **Firebase Authentication (email/password)**. No bcrypt, no localStorage tokens, no custom JWT.
- `authService.login(email, password)` calls `signInWithEmailAndPassword`, then loads the profile doc at `users/{uid}`.
- `authService.signup({...})` calls `createUserWithEmailAndPassword`, then writes `users/{uid}` with `name`, `role`, `teacherId`, `createdAt`.
- `AuthContext` subscribes via `onAuthStateChanged` and reactively loads the matching Firestore profile. `ProtectedRoute` waits for hydration before rendering or redirecting.

### Role-based routing
- Implemented in `src/components/common/ProtectedRoute.tsx`:
  - No user → redirect to `/login`
  - Wrong role → redirect to `ROLE_HOME[user.role]`
  - Loading → show `LoadingState`
- Server-side enforcement lives in `firestore.rules` (see [Firestore section](#7-firebase--firestore)).

### Principal-driven teacher provisioning (the tricky one)
The default Firebase Auth SDK signs the newly created user **into the active session**, which would log the principal out mid-flow. Solution:

1. `createSecondaryAuth()` (in `src/lib/firebase.ts`) spins up a **named secondary Firebase app** with its own `Auth` and `Firestore`.
2. `createUserWithEmailAndPassword` runs on the secondary auth → primary session is untouched.
3. The new teacher's profile doc is written via the **secondary Firestore** so `request.auth.uid == userId` and the `allow create: if request.auth.uid == userId` Firestore rule is satisfied.
4. `dispose()` signs out and `deleteApp()`s the secondary app in a `finally` block.

---

## 6. Cloudinary Integration

Cloudinary handles **all file storage, transformation, and CDN delivery**. Uploads are signed server-side (the API secret never reaches the browser).

### How a file gets uploaded

```
ContentUploadForm → POST /api/upload (multipart/form-data)
                      ↓
                  validates size/type
                      ↓
                  cloudinary.uploader.upload_stream(...)
                      ↓
        returns { url, publicId, version }
                      ↓
        contentService.create stores those fields in Firestore
```

- **Server route**: `src/app/api/upload/route.ts`
  - Re-validates size (≤ 10 MB) and MIME type (JPG/PNG/GIF/WebP/PDF/DOCX) on the server.
  - Uses `cloudinary.uploader.upload_stream` with `folder: contents/<teacherId>` and a timestamped `public_id`.
  - Resource type is `image` for images and `raw` for documents.
- **Server config**: `src/lib/cloudinary.ts` — lazy `cloudinary.config({ cloud_name, api_key, api_secret })`.
- **Client preview**: `next-cloudinary` `<CldImage>` is used in `ContentPreview.tsx` and `LiveContent.tsx` for automatic format/quality optimization. It reads `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` at runtime in the browser.
- **Image domain whitelist**: `next.config.ts` allows `res.cloudinary.com` so Next/Image is happy.

### Why server-signed uploads (instead of unsigned presets)
- The API secret stays server-side.
- The server validates file type and size before paying for an upload.
- Cloudinary's response (`public_id`, `version`) is captured and persisted alongside Firestore content metadata, so `<CldImage>` can later regenerate optimized URLs without trusting client input.

---

## 7. Firebase / Firestore

### Collections

```
users/{uid}                       (uid = Firebase Auth uid)
  email:        string            // lowercased
  name:         string
  role:         "teacher" | "principal"
  teacherId?:   string | null     // present only for teachers
  createdAt:    Timestamp

contents/{autoId}
  title, subject, description?:   strings
  fileUrl:                        string         // Cloudinary secure_url
  fileType:                       string         // MIME
  filePublicId, fileVersion:      Cloudinary handle for <CldImage>
  startTime, endTime:             Timestamp
  rotationDuration:               number (minutes)
  status:                         "pending" | "approved" | "rejected"
  rejectionReason?:               string
  teacherId, teacherName:         strings
  createdAt, reviewedAt?:         Timestamp
```

### Security rules (`firestore.rules`)

- `users/{userId}`
  - `read`: any authenticated user (needed for the principal teacher list and live page name lookup).
  - `create`: only when `request.auth.uid == userId` (covers self-signup AND principal-driven provisioning via the secondary app — see [auth flow](#5-authentication--authorization-flow)).
  - `update`: self or principal.
- `contents/{contentId}`
  - `read`: anyone for `status == "approved"` (public live page); authenticated users for everything else.
  - `create`: teachers, restricted to their own `teacherId`.
  - `update`: teacher's own pending docs, OR any principal (so approve/reject works).
  - `create/update/delete`: principals have full control.

### Composite indexes (`firestore.indexes.json`)

Indexes are pre-declared for `contents` queries on `teacherId + status + createdAt`, but the app intentionally **sorts client-side** for the principal/teacher list pages so the dev experience never hits the "requires an index" error. The indexes are there so you can flip back to server-side `orderBy` for larger datasets.

### Deploying rules and indexes

`firebase.json` is committed at the repo root. From a checkout with the Firebase CLI installed and `firebase login` done:

```bash
firebase deploy --only firestore:rules,firestore:indexes --project <your_project_id>
```

---

## 8. Project Structure

```
src/
├── app/                              Next.js 16 App Router
│   ├── login/page.tsx
│   ├── signup/page.tsx               Self-service teacher/principal signup
│   ├── teacher/{layout, dashboard, upload, my-content}/
│   ├── principal/{layout, dashboard, teachers, pending, all-content}/
│   ├── live/[teacherId]/page.tsx     Public real-time broadcast (no auth)
│   ├── api/upload/route.ts           Server route: signed Cloudinary upload
│   ├── layout.tsx                    Theme + Auth + Toaster providers
│   ├── page.tsx                      Redirects to login or role home
│   └── globals.css                   Tailwind v4 tokens
├── components/
│   ├── ui/                           shadcn-style Radix primitives
│   ├── common/                       Navbar, Sidebar, ProtectedRoute,
│   │                                 ThemeProvider/Toggle, StatusBadge,
│   │                                 EmptyState, LoadingState
│   ├── dashboard/StatsCard.tsx
│   ├── content/                      ContentUploadForm, ContentTable,
│   │                                 ContentPreview, RejectionModal
│   └── live/LiveContent.tsx
├── services/                         Service layer — only place that talks
│   ├── auth.service.ts               to Firebase / Cloudinary directly
│   ├── content.service.ts
│   ├── approval.service.ts
│   └── live.service.ts
├── hooks/
│   ├── useAuth.ts                    Reads AuthContext
│   └── useContent.ts                 useContentList + useStats
├── context/AuthContext.tsx           user / login / signup / logout / loading
├── lib/
│   ├── firebase.ts                   Lazy primary app + createSecondaryAuth
│   ├── cloudinary.ts                 Server-side cloudinary.config()
│   ├── constants.ts                  Subjects, file rules, role-home routes
│   ├── utils.ts                      cn, formatDateTime, getErrorMessage
│   └── validators.ts                 Zod schemas (login, signup, upload, reject)
└── types/index.ts                    User, Content, Stats

firebase.json
firestore.rules
firestore.indexes.json
```

---

## 9. Service-Layer / Async Pattern

Per the assignment:

- **No component talks to Firebase directly.** Every component uses a hook (`useContentList`, `useStats`) or calls a function on a service (`authService`, `contentService`, `approvalService`, `liveService`).
- Services return plain DTOs (`User`, `Content`, `Stats`), so swapping Firebase for a REST/GraphQL backend is a one-file change per service.
- Every async surface returns `{ data, loading, error, refetch }` (hooks) or throws — both paths funnel through `getErrorMessage` so toasts/inline errors show a friendly Firebase message instead of a raw error code.

---

## 10. Error Handling & Validation

- **Inline validation**: React Hook Form + Zod on login, signup, upload, and rejection forms. The Teachers > Add teacher dialog uses a small bespoke validator (name length, email regex, password ≥ 6 chars) so errors render inline.
- **Friendly Firebase errors**: `lib/utils.ts → getErrorMessage(e, fallback)` maps codes:
  - `auth/invalid-credential` → *"Invalid email or password."*
  - `auth/email-already-in-use` → *"An account with this email already exists."*
  - `auth/weak-password` → *"Password is too weak — use at least 6 characters."*
  - `auth/too-many-requests` → *"Too many attempts. Please wait a few minutes…"*
  - `auth/network-request-failed` → *"Network error. Check your connection…"*
  - `permission-denied` → *"You don't have permission to perform this action."*
- **Edge cases handled**: empty data states, slow responses (skeletons), invalid login, upload failures (size/type/network), broken API responses (defensive `??` defaults in mappers), realtime errors on the live page.

---

## 11. Live / Realtime Page

- Route: `/live/[teacherId]` — **no authentication required**.
- `liveService.subscribe(teacherId, cb, onError)` attaches a Firestore `onSnapshot` to `where teacherId==X AND status=="approved"`.
- Time-window filter (`startTime ≤ now ≤ endTime`) is applied client-side after each snapshot.
- `LiveContent` rotates through items via a `setTimeout` keyed off each item's `rotationDuration`.
- Approvals/rejections propagate to the live screen in near-realtime — **no polling**.
- Empty state ("No content available") shown when nothing is currently scheduled.

---

## 12. Requirement Coverage (Assignment Brief)

| Requirement | Status | Where |
| --- | --- | --- |
| Principal: view all / pending / approved / rejected | ✅ | `principal/dashboard`, `principal/all-content` |
| Principal: approve content | ✅ | `principal/pending` + `approvalService.approve` |
| Principal: reject with reason (modal) | ✅ | `RejectionModal` (≥ 5 chars) |
| Principal: filter by status + search | ✅ | `principal/all-content` tabs + search |
| Principal dashboard counters | ✅ | `useStats` + `StatsCard` |
| Teacher: upload (title, subject, file, start/end, rotation) | ✅ | `ContentUploadForm` |
| Teacher: file validation (JPG/PNG/GIF, ≤ 10 MB) | ✅ | Zod + server `/api/upload` |
| Teacher: end > start validation | ✅ | `validators.ts` |
| Teacher: status (pending/approved/rejected + reason) | ✅ | `teacher/my-content` |
| Public `/live/:teacherId` with title, subject, preview | ✅ | `live/[teacherId]` + `LiveContent` |
| Loading + empty states | ✅ | `LoadingState`, `EmptyState`, skeletons |
| Auth (email + password, redirect by role) | ✅ | Firebase Auth + `ProtectedRoute` |
| Service layer (no API calls in components) | ✅ | `services/` |
| React Hook Form + Zod | ✅ | `validators.ts` + every form |
| Replaceable API design | ✅ | Components depend on services, not Firebase |
| Token storage / attached to calls | ✅ | Firebase SDK handles ID tokens internally |
| Role-based access | ✅ | `ProtectedRoute` + `firestore.rules` |
| Edge cases (empty, errors, slow, invalid login, upload fail, broken API) | ✅ | `getErrorMessage` + defensive mappers |
| Tailwind CSS, responsive, professional UI | ✅ | Tailwind v4 + Radix + dark mode |
| Navbar/Sidebar, dashboard cards, tables, forms, modals, toasts | ✅ | `components/common`, `components/content` |
| Documentation (`frontend-notes.txt`) | ✅ | Repo root |
| **Bonus**: dark mode | ✅ | `next-themes` + header toggle |
| **Bonus**: drag-and-drop upload | ✅ | `ContentUploadForm` |
| **Bonus**: pagination | ✅ | `ContentTable` + service-layer slicing |
| **Bonus**: polling/auto-refresh | ✅ | Firestore `onSnapshot` (better than polling) |
| **Bonus**: skeleton loaders | ✅ | `LoadingState` |
| **Bonus**: protected routes | ✅ | `ProtectedRoute` |

---

## 13. Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Turbopack dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## 14. Assumptions & Limitations

- Pagination is client-side (the dataset is expected to be small per teacher; indexes are ready for a server-side flip).
- Upload size capped at 10 MB; allowed types: JPG, PNG, GIF, WebP, PDF, DOCX.
- Live page only renders **image** content (PDFs/DOCX are downloadable from the teacher/principal views but are not part of the broadcast loop).
- No password reset flow.
- Time windows compare against the user's local clock.
