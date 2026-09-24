import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { TraineeStatus } from "../types/trainer.types";


const STATUS_CONFIG: Record<
  TraineeStatus,
  { dotColor: string; key: string; badgeVariant: "outline" | "secondary" | "default" }
> = {
  ON_TRACK: { dotColor: "bg-emerald-500", key: "status.onTrack", badgeVariant: "outline" },
  AT_RISK: { dotColor: "bg-amber-500", key: "status.atRisk", badgeVariant: "outline" },
  FALLING_BEHIND: { dotColor: "bg-rose-500", key: "status.fallingBehind", badgeVariant: "outline" },
  NOT_STARTED: { dotColor: "bg-slate-400", key: "status.notStarted", badgeVariant: "secondary" },
  NEEDS_PLAN: { dotColor: "bg-sky-500", key: "status.needsPlan", badgeVariant: "outline" },
};

export function TraineeStatusBadge({ status }: { status: TraineeStatus }) {
  const t = useTranslations("TraineesTable");
  const config = STATUS_CONFIG[status];

  if (!config) {
    return (
      <Badge variant="outline" className="text-sm font-mono">
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant={config.badgeVariant} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-sm font-semibold">
      <span className={`h-2 w-2 rounded-full ${config.dotColor}`} />
      {t(config.key)}
    </Badge>
  );
}