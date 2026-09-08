interface ActivityItem {
  id: string | number;
  description: string;
  time: string;
}

interface TrainerActivityListProps {
  activities?: ActivityItem[];
  title?: string;
}

export function TrainerActivityList({ activities = [], title = "Recent Trainee Activity" }: TrainerActivityListProps) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`flex items-center justify-between py-2 text-sm ${
              index !== activities.length - 1 ? "border-b border-border/50" : ""
            }`}
          >
            <span>{activity.description}</span>
            <span className="text-muted-foreground text-xs">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}