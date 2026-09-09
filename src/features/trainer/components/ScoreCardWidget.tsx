"use client";

import { useTranslations } from "next-intl";
import { Users, Activity, CheckCircle } from "lucide-react";

interface ScoreCardProps {
  data: {
    titleKey?: string;
    value: string | number;
    iconName?: string;
  };
}

export default function ScoreCardWidget({ data }: ScoreCardProps) {
  const t = useTranslations("Trainer.dashboard");

  // Map the keys or default to safe lookups based on icon/position if titleKey isn't matched
  const getTitle = () => {
    if (data.titleKey) {
      try {
        return t(data.titleKey as any);
      } catch {
        return data.titleKey;
      }
    }
    return "";
  };

  const getIcon = (name?: string) => {
    switch (name) {
      case "users": return <Users className="h-5 w-5 text-muted-foreground" />;
      case "activity": return <Activity className="h-5 w-5 text-muted-foreground" />;
      default: return <CheckCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between pb-2">
        <span className="text-sm font-medium text-muted-foreground">{getTitle()}</span>
        {getIcon(data.iconName)}
      </div>
      <div className="text-2xl font-bold">{data.value}</div>
    </div>
  );
}