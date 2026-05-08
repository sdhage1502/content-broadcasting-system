import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "default" | "warning" | "success" | "destructive";
  loading?: boolean;
}

const toneClass: Record<NonNullable<Props["tone"]>, string> = {
  default: "bg-primary/10 text-primary",
  warning: "bg-warning/15 text-amber-600 dark:text-amber-300",
  success: "bg-success/15 text-success",
  destructive: "bg-destructive/15 text-destructive",
};

export function StatsCard({ label, value, icon: Icon, tone = "default", loading }: Props) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", toneClass[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
          {loading ? (
            <Skeleton className="mt-1 h-7 w-16" />
          ) : (
            <span className="text-2xl font-semibold">{value}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
