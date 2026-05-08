import { Badge } from "@/components/ui/badge";
import type { ContentStatus } from "@/types";

const map: Record<ContentStatus, { label: string; variant: "success" | "warning" | "destructive" }> = {
  approved: { label: "Approved", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}
