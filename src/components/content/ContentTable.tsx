"use client";
import { Eye, CheckCircle2, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDateTime } from "@/lib/utils";
import type { Content } from "@/types";

interface Props {
  items: Content[];
  loading?: boolean;
  showTeacher?: boolean;
  onPreview?: (c: Content) => void;
  onApprove?: (c: Content) => void;
  onReject?: (c: Content) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ContentTable({
  items,
  loading,
  showTeacher,
  onPreview,
  onApprove,
  onReject,
  emptyTitle = "No content yet",
  emptyDescription = "Nothing to display.",
}: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (!items.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Subject</TableHead>
            {showTeacher && <TableHead>Teacher</TableHead>}
            <TableHead>Window</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.title}</TableCell>
              <TableCell className="text-muted-foreground">{c.subject}</TableCell>
              {showTeacher && <TableCell className="text-muted-foreground">{c.teacherName ?? c.teacherId}</TableCell>}
              <TableCell className="text-xs text-muted-foreground">
                <div>{formatDateTime(c.startTime)}</div>
                <div>→ {formatDateTime(c.endTime)}</div>
              </TableCell>
              <TableCell>
                <StatusBadge status={c.status} />
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  {onPreview && (
                    <Button variant="ghost" size="icon" aria-label="Preview" onClick={() => onPreview(c)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onApprove && c.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Approve"
                      className="text-success"
                      onClick={() => onApprove(c)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                  {onReject && c.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Reject"
                      className="text-destructive"
                      onClick={() => onReject(c)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
