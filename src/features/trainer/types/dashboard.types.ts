export interface ScoreCardData {
  title?: string;
  titleKey?: string;
  value: string | number;
  iconName?: string;
}

export interface ChartDataset {
  label?: string;
  labelKey?: string;
  data: number[];
}

export interface ChartData {
  title: string;
  titleKey?: string;
  chartType: "line" | "bar";
  labels: string[];
  datasets: ChartDataset[];
}

export interface WeeklyActivity {
  sun: number;
  mon: number;
  tues: number;
  wed: number;
  thurs: number;
  fri: number;
  sat: number;
}

export interface TrainerDashboardResponse {
  weeklyActivity: WeeklyActivity;
  activePlansCount: number;
  avgActivePlansAdherence: number;
  completedPlansCount: number;
  traineesCount: number;
}