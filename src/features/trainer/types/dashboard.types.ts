export type WidgetType = 'score_card' | 'chart' | 'table' | 'quick_actions';

export interface ScoreCardData {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconName?: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
}

export interface ChartData {
  title: string;
  chartType: 'line' | 'bar';
  labels: string[];
  datasets: ChartDataset[];
}

export interface TableRow {
  id: string;
  name: string;
  adherence: string;
  lastSession: string;
  actionLabel?: string;
}

export interface TableData {
  title: string;
  columns: string[];
  rows: TableRow[];
}

export interface QuickActionItem {
  label: string;
  variant?: 'primary' | 'secondary';
}

export interface QuickActionsData {
  title: string;
  actions: QuickActionItem[];
}

export interface DashboardWidgetConfig {
  id: string;
  type: WidgetType;
  colSpan?: string; // Tailwind grid span
  data: ScoreCardData | ChartData | TableData | QuickActionsData;
}

export interface TrainerDashboardResponse {
  widgets: DashboardWidgetConfig[];
}