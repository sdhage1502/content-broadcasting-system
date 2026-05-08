"use client";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ClipboardCheck, Clock, Layers, Library, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ContentTable } from "@/components/content/ContentTable";
import { ContentPreview } from "@/components/content/ContentPreview";
import { useContentList, useStats } from "@/hooks/useContent";
import { useAuth } from "@/hooks/useAuth";
import type { Content } from "@/types";

export default function PrincipalDashboard() {
  const { user } = useAuth();
  const { data: stats, loading: statsLoading } = useStats();
  const { data, loading } = useContentList({ status: "pending", pageSize: 5 });
  const [preview, setPreview] = useState<Content | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">Review submissions and oversee broadcasts.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/principal/pending">
              <ClipboardCheck className="h-4 w-4" /> Review pending
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/principal/all-content">
              <Library className="h-4 w-4" /> All content
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total" value={stats?.total ?? 0} icon={Layers} loading={statsLoading} />
        <StatsCard label="Pending" value={stats?.pending ?? 0} icon={Clock} tone="warning" loading={statsLoading} />
        <StatsCard label="Approved" value={stats?.approved ?? 0} icon={CheckCircle2} tone="success" loading={statsLoading} />
        <StatsCard label="Rejected" value={stats?.rejected ?? 0} icon={XCircle} tone="destructive" loading={statsLoading} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent pending submissions</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/principal/pending">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ContentTable
            items={data?.items ?? []}
            loading={loading}
            showTeacher
            onPreview={setPreview}
            emptyTitle="Nothing pending"
            emptyDescription="All caught up — no submissions awaiting review."
          />
        </CardContent>
      </Card>

      <ContentPreview content={preview} open={!!preview} onOpenChange={(o) => !o && setPreview(null)} />
    </div>
  );
}
