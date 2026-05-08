"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_HOME } from "@/lib/constants";
import type { UserRole } from "@/types";
import { LoadingState } from "./LoadingState";

interface ProtectedRouteProps {
  role?: UserRole;
  children: ReactNode;
}

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (role && user.role !== role) { router.replace(ROLE_HOME[user.role]); }
  }, [user, loading, role, router]);

  if (loading || !user || (role && user.role !== role)) {
    return <LoadingState label="Loading session…" />;
  }

  return <>{children}</>;
}
