import type { StatItem } from "@/data/mock/coachDashboard.data";

interface CoachStatsGridProps {
  stats: StatItem[];
}

export function CoachStatsGrid({ stats }: CoachStatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="p-4 rounded-xl border border-border bg-card shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
}