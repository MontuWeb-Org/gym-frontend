export interface AnalyticsExercise {
  id: number;
  name: string;
}

export interface AnalyticsSetLog {
  id: number;
  reps: number;
  weight: number;
  endedAt: string;
}

export interface PersonalRecord {
  exercise: AnalyticsExercise;
  heaviestWeight: number;
  heaviestWeightSet: AnalyticsSetLog;
  estimatedOneRm: number;
  estimatedOneRmSet: AnalyticsSetLog;
  updatedAt: string;
}

export interface ProgressionEvent {
  id: number;
  exercise: AnalyticsExercise;
  heaviestWeight: number;
  estimatedOneRm: number;
  isWeightPr: boolean;
  isOneRmPr: boolean;
  achievedAt: string;
  setLog: AnalyticsSetLog;
}

export interface TraineePerformanceAnalytics {
  personalRecords: PersonalRecord[];
  progression: ProgressionEvent[];
}

export interface ProgressionPoint {
  date: string;
  label: string;
  weight: number;
  estimatedOneRm: number;
  isWeightPr: boolean;
  isOneRmPr: boolean;
}