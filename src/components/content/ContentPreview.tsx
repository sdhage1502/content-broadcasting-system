"use client";
import { FileText, Download } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime } from "@/lib/utils";
import type { Content } from "@/types";

interface Props {
  content: Content | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const isImage = (fileType: string) => fileType.startsWith("image/");

export function ContentPreview({ content, open, onOpenChange }: Props) {
  if (!content) return null;
  const showImage = isImage(content.fileType);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-6">
            <DialogTitle className="leading-snug">{content.title}</DialogTitle>
            <StatusBadge status={content.status} />
          </div>
          <DialogDescription>
            {content.subject}
            {content.teacherName ? ` • by ${content.teacherName}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-hidden rounded-md border bg-muted">
          {showImage ? (
            content.filePublicId ? (
              <CldImage
                src={content.filePublicId}
                alt={content.title}
                width={800}
                height={600}
                className="h-64 w-full object-contain bg-background"
                version={content.fileVersion}
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={content.fileUrl} alt={content.title} className="h-64 w-full object-contain bg-background" />
            )
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-4 bg-background p-6">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">{content.fileType.includes("pdf") ? "PDF Document" : "Word Document"}</p>
                <p className="text-sm text-muted-foreground">Preview not available for this file type</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <a href={content.fileUrl} target="_blank" rel="noopener noreferrer" download>
                  <Download className="mr-2 h-4 w-4" /> Download File
                </a>
              </Button>
            </div>
          )}
        </div>
        {content.description && <p className="text-sm text-muted-foreground">{content.description}</p>}
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Start</dt>
            <dd>{formatDateTime(content.startTime)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">End</dt>
            <dd>{formatDateTime(content.endTime)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Rotation</dt>
            <dd>{content.rotationDuration} min</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Submitted</dt>
            <dd>{formatDateTime(content.createdAt)}</dd>
          </div>
        </dl>
        {content.status === "rejected" && content.rejectionReason && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <p className="font-medium">Rejection reason</p>
            <p className="mt-0.5 text-destructive/90">{content.rejectionReason}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

