import { Trainee } from "../types/trainer.types";

export function getLastActiveLabel(trainee: Trainee, locale: string): string {
  const dates = (trainee.plans ?? [])
    .map((p) => p.lastSession?.startedAt)
    .filter((d): d is string => Boolean(d))
    .map((d) => new Date(d));

  if (dates.length === 0) return "—";

  const mostRecent = new Date(Math.max(...dates.map((d) => d.getTime())));
  return mostRecent.toLocaleDateString(locale, { month: "short", day: "numeric" });
}