"use client";

import { ScoreCardData } from "../types/dashboard.types";
import { TrendingUp, TrendingDown, Users, Activity, CheckCircle } from "lucide-react";

interface ScoreCardWidgetProps {
  data: ScoreCardData;
}

export default function ScoreCardWidget({ data }: ScoreCardWidgetProps) {
  const getIcon = (name?: string) => {
    switch (name) {
      case "users": return <Users className="h-5 w-5 text-muted-foreground" />;
      case "activity": return <Activity className="h-5 w-5 text-muted-foreground" />;
      default: return <CheckCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{data.title}</h3>
        {getIcon(data.iconName)}
      </div>
      <div className="flex items-baseline justify-between pt-1">
        <div className="text-2xl font-bold">{data.value}</div>
        {data.trend && (
          <div className={`flex items-center text-xs font-semibold ${data.trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {data.trend.isPositive ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
            {data.trend.value}
          </div>
        )}
      </div>
    </div>
  );
}