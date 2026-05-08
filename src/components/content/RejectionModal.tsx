"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { rejectSchema } from "@/lib/validators";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentTitle?: string;
  onConfirm: (reason: string) => Promise<void>;
}

export function RejectionModal({ open, onOpenChange, contentTitle, onConfirm }: Props) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    const parsed = rejectSchema.safeParse({ reason });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid reason");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm(parsed.data.reason);
      setReason("");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!submitting) onOpenChange(o);
        if (!o) {
          setReason("");
          setError(null);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject content</DialogTitle>
          <DialogDescription>
            {contentTitle
              ? `Provide a reason for rejecting "${contentTitle}".`
              : "Provide a reason for rejection."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="rejection-reason">Reason</Label>
          <Textarea
            id="rejection-reason"
            placeholder="Explain why this content cannot be approved…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            disabled={submitting}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Rejecting…" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
