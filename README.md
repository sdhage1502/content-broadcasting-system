# Content Broadcasting System

A role-based content management and broadcasting platform designed for schools. Teachers upload classroom materials, principals review and approve submissions, and approved content is broadcast via a public live page.

## Quick Start Credentials

> **Principal account**
> - **Email:** `max@yc.com`
> - **Password:** `max123`
>
> **Sample teacher account**
> - **Email:** `teacher@yc.com`
> - **Password:** `teacher123`
>
> Teachers can also self-register via `/signup`, or be provisioned by a
> signed-in principal from the **Teachers** page.

## Overview

This application streamlines the process of sharing classroom content across digital displays. The workflow follows three simple steps:

1. **Teachers** upload content (images, PDF, DOCX) with scheduling details
2. **Principals** review submissions and approve or reject with feedback
3. **Approved content** automatically appears on the public broadcast page during its scheduled time window

## Features

### Teacher Portal
- Upload content with title, subject, description, and scheduling
- Drag-and-drop file upload — supports images (JPG, PNG, GIF), PDF, and DOCX
- Image preview for visual files; download option for documents
- Track submission status (pending, approved, rejected)
- Search and filter personal submissions
- Access personal live broadcast link

### Principal Portal
- Review pending submissions with preview
- Approve or reject with mandatory rejection reason (≥ 5 chars)
- View all content across teachers with status tabs, search, and pagination
- Dashboard statistics overview
- **Manage teachers** — list all teachers, provision new teacher accounts
  without losing the principal session (uses a secondary Firebase Auth
  instance under the hood), see per-teacher content count, and view every
  teacher's submissions in a per-teacher dialog

### Live Broadcast Page
- Public, no-auth-required display page
- Real-time updates via Firestore
- Automatic rotation between multiple active items
- Full-screen optimized display

### Technical Features
- Dark/light theme support
- Responsive design for mobile and desktop
- Skeleton loaders and empty states
- Toast notifications for all actions
- Form validation with clear error messages

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | Radix UI primitives (shadcn-style) |
| Forms | React Hook Form + Zod |
| Backend | Firebase Firestore |
| File Storage | Cloudinary (CDN + Image Optimization) |
| Auth | Firebase Authentication (email/password) |
| State | React Context + custom hooks |
| Notifications | Sonner |

## Getting Started

### Prerequisites

- Node.js 18.18 or later (20+ recommended)
- A Firebase project with Firestore enabled
- A Cloudinary account with API credentials

### Installation

1. Clone and install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase and Cloudinary configuration:
```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. Deploy Firebase security rules (see `firestore.rules`)

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — unauthenticated users are redirected to `/login`.

### Building for Production

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── login/              # Authentication
│   ├── signup/             # Teacher self-registration (teachers only)
│   ├── teacher/            # Teacher dashboard and content
│   ├── principal/          # Principal review interface
│   │   ├── teachers/       # Teacher management page
│   │   ├── pending/        # Content approval
│   │   └── all-content/    # View all content
│   └── live/[teacherId]/   # Public broadcast page
├── components/
│   ├── ui/                 # Reusable UI primitives
│   ├── common/             # Layout components
│   ├── content/            # Content management UI
│   ├── dashboard/          # Statistics display
│   └── live/               # Broadcast components
├── context/                # React Context providers
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and configuration
├── services/               # Data layer (Firebase)
├── types/                  # TypeScript definitions
└── app/globals.css         # Global styles + Tailwind

scripts/
└── seed.mjs               # Database seeding utility

seed/
└── data.json              # Starter dataset
```

## Key Implementation Details

### Authentication
The app uses **Firebase Authentication** (email/password). The current user's
profile (`name`, `role`, `teacherId`) lives in Firestore at `users/{uid}` and
is loaded reactively via `onAuthStateChanged`. There is no custom token
handling, no `localStorage`-based session, and no manual password hashing.

When a principal provisions a teacher from the Teachers page, the app spins
up a **secondary Firebase Auth instance** to call
`createUserWithEmailAndPassword`. This is critical: the default Auth SDK
behaviour signs the newly created user *into the active session*, which
would log the principal out mid-flow and trigger
`Missing or insufficient permissions` on the next Firestore write. The
secondary instance is disposed in a `finally` block.

### Error Handling
`lib/utils.ts → getErrorMessage()` maps Firebase Auth/Firestore error
codes (`auth/invalid-credential`, `auth/email-already-in-use`,
`permission-denied`, `auth/too-many-requests`, etc.) to friendly,
human-readable messages surfaced via Sonner toasts and inline form errors.

### Data Flow
- **Content creation**: File uploads to Cloudinary, metadata to Firestore
- **Real-time updates**: Live page uses Firestore `onSnapshot` for instant updates
- **Client-side filtering**: Search and pagination happen in-memory for simplicity
- **Image optimization**: Cloudinary provides automatic format conversion and quality optimization

### Form Handling
All forms use React Hook Form with Zod schemas for validation. Error messages display inline below each field.

### Protected Routes
Role-based access control is handled via a `ProtectedRoute` component that redirects unauthorized users appropriately.

## Security Considerations

> **Note:** This is a demonstration project. The included Firestore rules are permissive for development.

For production deployment, update your security rules:

1. **Firestore**: Restrict `users` collection reads to authenticated users
2. **Content**: Teachers can only create/modify their own content; principals can update any content's approval status
3. **Cloudinary**: Use unsigned uploads with upload presets for production, or implement server-side signed uploads

Production-ready rule templates are provided in `firestore.rules`.

## Development Notes

### Design Decisions

**Route Structure**: While the original spec suggested route groups like `(teacher)/dashboard`, Next.js strips these prefixes from URLs. The app uses explicit prefixes (`/teacher/dashboard`, `/principal/dashboard`) to avoid collisions and provide clearer navigation.

**State Management**: React Context handles authentication state; custom hooks manage data fetching. No external state library was needed given the scope.

**Realtime Strategy**: The live page subscribes to Firestore changes rather than polling. This provides instant updates when content is approved or scheduled windows change.

### Known Limitations

- Pagination is client-side (suitable for the expected dataset size)
- Image uploads are limited to 10MB
- No offline support
- Password reset flow not implemented

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

## Screenshots

*(Add screenshots here showing key flows: upload form, pending approval, live broadcast)*

## Future Enhancements

- [ ] Video file support
- [ ] Content expiration notifications
- [ ] Bulk approval/rejection for principals
- [ ] Analytics dashboard (view counts, engagement)
- [ ] Firebase Auth migration
- [ ] Server-side rendering for SEO on live pages

---

Built for the Frontend Developer Technical Assignment — May 2026
