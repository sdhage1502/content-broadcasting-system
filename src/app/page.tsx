"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_HOME } from "@/lib/constants";
import { LoadingState } from "@/components/common/LoadingState";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else router.replace(ROLE_HOME[user.role]);
  }, [user, loading, router]);

  return <LoadingState label="Redirecting…" />;
}
