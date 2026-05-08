"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, GraduationCap, MonitorPlay, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_HOME } from "@/lib/constants";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Already signed in? Send them straight to their dashboard.
  useEffect(() => {
    if (!loading && user) router.replace(ROLE_HOME[user.role]);
  }, [user, loading, router]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-background to-muted/30">
      {/* decorative blur */}
      <div className="pointer-events-none absolute -top-40 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" aria-hidden />

      {/* Header */}
      <header className="relative z-10 border-b bg-background/60 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <MonitorPlay className="h-4 w-4" />
            </div>
            <span>Content Broadcasting</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pt-20 pb-16 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Real-time classroom content, approved by principals
        </div>
        <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Upload. Approve. <span className="text-primary">Broadcast.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
          Teachers submit classroom material, principals approve it in one click,
          and approved content goes live on a public broadcast page in real time —
          no refresh required.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/login">
              Sign in <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/signup">Create teacher account</Link>
          </Button>
        </div>

        {/* Credentials callout — kept off the page on purpose; live in the repo README */}
        <a
          href="https://github.com/sdhage1502/content-broadcasting-system#login-details"
          target="_blank"
          rel="noopener noreferrer"
          className="group mx-auto mt-10 flex max-w-xl items-start gap-3 rounded-xl border bg-card/70 p-4 text-left text-sm shadow-sm backdrop-blur transition-colors hover:bg-card"
        >
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="font-medium">Demo credentials are in the README</div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              For test login IDs and passwords, please visit the project README on GitHub.
            </p>
            <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
              github.com/sdhage1502/content-broadcasting-system <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </a>
      </section>

      {/* Feature grid */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={<UploadCloud className="h-5 w-5" />}
            title="For teachers"
            body="Drag-and-drop uploads, schedule a broadcast window, and track approval status from a single dashboard."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="For principals"
            body="Review pending submissions, approve or reject with a reason, and provision teacher accounts in seconds."
          />
          <FeatureCard
            icon={<MonitorPlay className="h-5 w-5" />}
            title="Live broadcast"
            body="A public, no-auth /live/<teacherId> page rotates through approved content as it changes — powered by Firestore realtime."
          />
        </div>

        {/* How it works */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <Step n={1} title="Teacher uploads" body="Title, subject, file, schedule window — submitted for approval." />
          <Step n={2} title="Principal reviews" body="One-click approve, or reject with a reason that the teacher sees instantly." />
          <Step n={3} title="Goes live automatically" body="Approved + in-window content appears on /live/<teacherId> with no refresh." />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t bg-background/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row">
          <span className="flex items-center gap-2">
            <GraduationCap className="h-3.5 w-3.5" /> Frontend Developer Technical Assignment
          </span>
          <span>Next.js 16 · Firebase · Cloudinary · Tailwind v4</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl border bg-card/70 p-5 shadow-sm backdrop-blur transition-colors hover:bg-card">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="relative rounded-xl border bg-card/70 p-5 backdrop-blur">
      <div className="absolute -top-3 left-5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow">
        {n}
      </div>
      <h4 className="mt-2 font-medium">{title}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
