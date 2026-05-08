"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ContentTable } from "@/components/content/ContentTable";
import { ContentPreview } from "@/components/content/ContentPreview";
import { RejectionModal } from "@/components/content/RejectionModal";
import { useContentList } from "@/hooks/useContent";
import { approvalService } from "@/services/approval.service";
import { getErrorMessage } from "@/lib/utils";
import type { Content } from "@/types";

export default function PendingPage() {
  const [q, setQ] = useState("");
  const { data, loading, refetch } = useContentList({ status: "pending", q: q.trim() || undefined, pageSize: 50 });
  const [preview, setPreview] = useState<Content | null>(null);
  const [reject, setReject] = useState<Content | null>(null);

  const handleApprove = async (c: Content) => {
    try {
      await approvalService.approve(c.id);
      toast.success(`Approved "${c.title}"`);
      refetch();
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to approve"));
    }
  };

  const handleReject = async (reason: string) => {
    if (!reject) return;
    try {
      await approvalService.reject(reject.id, reason);
      toast.success(`Rejected "${reject.title}"`);
      refetch();
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to reject"));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pending approval</h1>
        <p className="text-sm text-muted-foreground">Review submissions and approve or reject.</p>
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Awaiting review</CardTitle>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search title, subject, description…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 sm:w-72"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ContentTable
            items={data?.items ?? []}
            loading={loading}
            showTeacher
            onPreview={setPreview}
            onApprove={handleApprove}
            onReject={(c) => setReject(c)}
            emptyTitle="Nothing pending"
            emptyDescription="All submissions have been reviewed."
          />
        </CardContent>
      </Card>

      <ContentPreview content={preview} open={!!preview} onOpenChange={(o) => !o && setPreview(null)} />
      <RejectionModal
        open={!!reject}
        onOpenChange={(o) => !o && setReject(null)}
        contentTitle={reject?.title}
        onConfirm={handleReject}
      />
    </div>
  );
}
