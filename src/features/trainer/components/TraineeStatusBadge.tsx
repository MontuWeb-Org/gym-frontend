import { useTranslations } from "next-intl";
import { TraineeStatus } from "../types/trainer.types";

const STATUS_CONFIG: Record<TraineeStatus, { dotColor: string; key: string }> = {
  ON_TRACK: { dotColor: "bg-emerald-500", key: "status.onTrack" },
  AT_RISK: { dotColor: "bg-amber-500", key: "status.atRisk" },
  FALLING_BEHIND: { dotColor: "bg-rose-500", key: "status.fallingBehind" },
  NOT_STARTED: { dotColor: "bg-slate-400", key: "status.notStarted" },
  NEEDS_PLAN: { dotColor: "bg-sky-500", key: "status.needsPlan" },
};

export function TraineeStatusBadge({ status }: { status: TraineeStatus }) {
  const t = useTranslations("TraineesTable");
  const config = STATUS_CONFIG[status];

  if (!config) {
    // Surfaces unexpected backend values instead of masquerading as ON_TRACK
    return (
      <span className="text-xs font-medium text-muted-foreground">
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-foreground">
      <span className={`size-2 rounded-full ${config.dotColor}`} />
      {t(config.key)}
    </span>
  );
}