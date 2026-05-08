"use client";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Clock, FileText, Layers, Radio, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ContentTable } from "@/components/content/ContentTable";
import { ContentPreview } from "@/components/content/ContentPreview";
import { useStats, useContentList } from "@/hooks/useContent";
import { useAuth } from "@/hooks/useAuth";
import type { Content } from "@/types";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data: stats, loading: statsLoading } = useStats();
  const { data, loading } = useContentList({ pageSize: 5 });
  const [preview, setPreview] = useState<Content | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">Submit content and track approvals.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/teacher/upload">
              <Upload className="h-4 w-4" /> Upload content
            </Link>
          </Button>
          {user?.teacherId && (
            <Button asChild variant="outline">
              <Link href={`/live/${user.teacherId}`} target="_blank">
                <Radio className="h-4 w-4" /> Open live page
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total" value={stats?.total ?? 0} icon={Layers} loading={statsLoading} />
        <StatsCard label="Pending" value={stats?.pending ?? 0} icon={Clock} tone="warning" loading={statsLoading} />
        <StatsCard label="Approved" value={stats?.approved ?? 0} icon={CheckCircle2} tone="success" loading={statsLoading} />
        <StatsCard label="Rejected" value={stats?.rejected ?? 0} icon={FileText} tone="destructive" loading={statsLoading} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent submissions</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/teacher/my-content">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ContentTable
            items={data?.items ?? []}
            loading={loading}
            onPreview={setPreview}
            emptyTitle="Nothing submitted yet"
            emptyDescription="Click Upload content to send your first submission."
          />
        </CardContent>
      </Card>

      <ContentPreview content={preview} open={!!preview} onOpenChange={(o) => !o && setPreview(null)} />
    </div>
  );
}
