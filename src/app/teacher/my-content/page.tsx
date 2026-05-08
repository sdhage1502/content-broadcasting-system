"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentTable } from "@/components/content/ContentTable";
import { ContentPreview } from "@/components/content/ContentPreview";
import { useContentList } from "@/hooks/useContent";
import type { Content, ContentStatus } from "@/types";

const PAGE_SIZE = 8;

export default function MyContentPage() {
  const [status, setStatus] = useState<ContentStatus | "all">("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<Content | null>(null);

  const params = useMemo(
    () => ({
      status: status === "all" ? undefined : (status as ContentStatus),
      q: q.trim() || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [status, q, page],
  );
  const { data, loading } = useContentList(params);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My content</h1>
          <p className="text-sm text-muted-foreground">All your submissions and their statuses.</p>
        </div>
        <Button asChild>
          <Link href="/teacher/upload">
            <Upload className="h-4 w-4" /> Upload content
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Submissions</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Tabs value={status} onValueChange={(v) => { setStatus(v as ContentStatus | "all"); setPage(1); }}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Search title or subject…"
                className="pl-9 sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ContentTable
            items={data?.items ?? []}
            loading={loading}
            onPreview={setPreview}
            emptyTitle="No matching content"
            emptyDescription="Try clearing filters or upload something new."
          />
          {data && data.total > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {data.page} of {totalPages} · {data.total} total
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ContentPreview content={preview} open={!!preview} onOpenChange={(o) => !o && setPreview(null)} />
    </div>
  );
}
