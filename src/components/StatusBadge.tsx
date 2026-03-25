import { Badge } from "@/components/ui/badge";
import { getStatusLabel } from "@/lib/crm-data";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  active: "bg-success/15 text-success border-success/30",
  online: "bg-success/15 text-success border-success/30",
  inactive: "bg-muted text-muted-foreground border-border",
  offline: "bg-destructive/15 text-destructive border-destructive/30",
  trial: "bg-warning/15 text-warning border-warning/30",
  pending: "bg-warning/15 text-warning border-warning/30",
  maintenance: "bg-warning/15 text-warning border-warning/30",
  expired: "bg-destructive/15 text-destructive border-destructive/30",
  "needs-update": "bg-warning/15 text-warning border-warning/30",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", statusColors[status] || "")}>
      {getStatusLabel(status)}
    </Badge>
  );
}
