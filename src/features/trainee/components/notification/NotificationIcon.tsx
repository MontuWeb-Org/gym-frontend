import { ClipboardList, Trophy, TrendingDown } from "lucide-react";
import { NotificationType } from "../../types/notification.types";
import { cn } from "@/lib/cn";

const ICON_MAP: Record<NotificationType, React.ElementType> = {
  PLAN_ASSIGNED: ClipboardList,
  PERSONAL_RECORD_ACHIEVED: Trophy,
  PLAN_ADHERENCE_LOW: TrendingDown,
};

const COLOR_MAP: Record<NotificationType, string> = {
  PLAN_ASSIGNED: "text-blue-600 bg-blue-100 dark:bg-blue-950",
  PERSONAL_RECORD_ACHIEVED: "text-amber-600 bg-amber-100 dark:bg-amber-950",
  PLAN_ADHERENCE_LOW: "text-red-600 bg-red-100 dark:bg-red-950",
};

export function NotificationIcon({ type }: { type: NotificationType }) {
  const Icon = ICON_MAP[type];
  return (
    <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", COLOR_MAP[type])}>
      <Icon className="size-4" />
    </div>
  );
}