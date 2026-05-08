```markdown
# Content Broadcasting System - Implementation Instructions

**Next.js + Tailwind CSS + shadcn/ui + Zod + React Hook Form + Axios**

**Deadline:** 8 May 2026, 10:00 AM

---

## 1. Project Setup

### Create the Project
```bash
npx create-next-app@latest content-broadcasting --typescript --tailwind --eslint --app --yes
cd content-broadcasting
```

### Install Dependencies
```bash
npm install axios react-hook-form @hookform/resolvers zod lucide-react date-fns
npm install -D @types/node

# shadcn/ui setup
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card form input label textarea select dialog toast skeleton avatar badge table tabs separator sheet avatar
npx shadcn-ui@latest add dropdown-menu scroll-area
```

### Recommended Additional (Optional but Recommended)
```bash
npm install sonner  # Better toasts
# or use shadcn toast
```

---

## 2. Folder Structure (Mandatory)

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (teacher)/
│   │   ├── dashboard/page.tsx
│   │   ├── upload/page.tsx
│   │   └── my-content/page.tsx
│   ├── (principal)/
│   │   ├── dashboard/page.tsx
│   │   ├── pending/page.tsx
│   │   └── all-content/page.tsx
│   ├── live/
│   │   └── [teacherId]/
│   │       └── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx (redirect to login)
├── components/
│   ├── ui/                  # shadcn components
│   ├── common/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingState.tsx
│   │   └── ProtectedRoute.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   └── ContentTable.tsx
│   ├── content/
│   │   ├── ContentUploadForm.tsx
│   │   ├── ContentPreview.tsx
│   │   ├── ContentCard.tsx
│   │   └── RejectionModal.tsx
│   └── live/
│       └── LiveContent.tsx
├── services/
│   ├── auth.service.ts
│   ├── content.service.ts
│   └── approval.service.ts
├── hooks/
│   ├── useAuth.ts
│   └── useContent.ts
├── context/
│   └── AuthContext.tsx
├── lib/
│   ├── utils.ts
│   ├── validators.ts
│   └── constants.ts
├── types/
│   └── index.ts
└── middleware.ts (optional)
```

---

## 3. Types Definition (`src/types/index.ts`)

```ts
export type UserRole = 'teacher' | 'principal';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teacherId?: string;
}

export interface Content {
  id: string;
  title: string;
  subject: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  startTime: string;
  endTime: string;
  rotationDuration: number;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  teacherId: string;
  createdAt: string;
}

export interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}
```

---

## 4. Mock API (Critical for Development)

Create mock data in `src/lib/mockData.ts`

**Option 1 (Recommended):** Use MSW (Mock Service Worker) for realistic API simulation.

**Option 2:** Simple in-memory state with functions (easier for quick start).

I'll provide both patterns in services.

---

## 5. Authentication Flow

### AuthContext (`src/context/AuthContext.tsx`)
- Use React Context + `localStorage` for token simulation.
- Store user role.
- Protected routes logic.

### Login Page
- Email + Password form with Zod validation.
- Mock credentials:
  - `teacher@school.com` / `password` → Teacher
  - `principal@school.com` / `password` → Principal

### Middleware / ProtectedRoute
Redirect based on role.

---

## 6. Service Layer (Mandatory)

**`src/services/auth.service.ts`**
```ts
import axios from 'axios';
import { User } from '@/types';

const API_BASE = '/api'; // Will be mocked

export const authService = {
  login: async (email: string, password: string): Promise<{user: User, token: string}> => {
    // Mock API call
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
    return res.data;
  }
};
```

Similar structure for `content.service.ts` and `approval.service.ts`.

**Never call axios directly in components.**

---

## 7. Key Pages Implementation Order

### 1. Login Page (`app/(auth)/login/page.tsx`)
- React Hook Form + Zod
- Role-based redirect after login

### 2. Layouts with Navbar/Sidebar
- Role-based navigation
- Logout functionality

### 3. Teacher Dashboard
- Stats cards (Total, Pending, Approved, Rejected)
- Recent content

### 4. Content Upload Form (`components/content/ContentUploadForm.tsx`)
**Fields:**
- Title (required)
- Subject (select: Math, Science, History, etc.)
- Description (textarea)
- File upload (JPG, PNG, GIF ≤ 10MB) + Preview
- Start Time (datetime-local)
- End Time (datetime-local)
- Rotation Duration (minutes)

**Validation:**
- Zod schema
- File type & size
- End > Start

### 5. My Content Page (Teacher)
- Table/List with status badges
- Preview modal
- Rejection reason display

### 6. Principal Dashboard
- Overall stats
- Quick links

### 7. Pending Approval Page (Principal)
- Filterable table
- Preview
- Approve / Reject with reason (modal)

### 8. All Content Page
- Search + Status filter

### 9. Public Live Page (`app/live/[teacherId]/page.tsx`)
- No auth
- Poll every 30s (optional)
- Show currently active content based on time
- Empty state

---

## 8. UI/UX Requirements

- **shadcn/ui** components everywhere
- Responsive (mobile + desktop)
- Skeleton loaders
- Proper Empty states with illustrations/text
- Toast notifications for success/error
- Loading spinners
- Status badges (color-coded)
- File preview (image)

---

## 9. State Management

- **Auth**: Context API
- **Content data**: React Query (bonus) **or** custom hooks with useState + useEffect
- Avoid prop drilling → Context or custom hooks

---

## 10. Performance & Code Quality

- Memoize components where needed (`React.memo`, `useMemo`, `useCallback`)
- Proper key props in lists
- Clean separation (services, components, hooks)
- Consistent naming
- Error boundaries (optional but good)

---

## 11. Documentation (`frontend-notes.txt`)

Include:
1. Project structure explanation
2. Authentication flow
3. How role-based routing works
4. API service layer approach
5. State management choice
6. Assumptions made (mock data, etc.)
7. How to run the project

---

## 12. README.md (Submission)

Must include:
- Setup instructions
- Tech stack
- Available scripts
- Mock credentials
- Screenshots (important)
- Live deployment link (Vercel)

---

## 13. Bonus Features (Aim for these)

- [ ] TanStack Query / React Query
- [ ] Dark mode
- [ ] Drag & drop upload
- [ ] Pagination on content lists
- [ ] Real-time polling on live page
- [ ] Skeleton loaders
- [ ] Protected route HOC

---

## Development Tips

1. Start with setup + auth + context
2. Create mock services first
3. Build upload form (most complex)
4. Then dashboards
5. Finally live page
6. Polish UI last

**Mock Current Active Content Logic:**
```ts
const isActive = (content: Content) => {
  const now = new Date();
  const start = new Date(content.startTime);
  const end = new Date(content.endTime);
  return now >= start && now <= end && content.status === 'approved';
};
```

---

## Final Submission Checklist

- [ ] Clean folder structure
- [ ] No direct API calls in components
- [ ] All pages functional
- [ ] Proper error/loading/empty states
- [ ] Responsive UI
- [ ] frontend-notes.txt
- [ ] Public GitHub repo
- [ ] Deployed on Vercel
- [ ] README complete

**Good Luck!** This assignment tests real-world frontend engineering skills. Focus on **architecture**, **separation of concerns**, and **polish**.

---

**Start coding now!** You got this. 🚀
```
