export type TraineeStatus =
  | "ON_TRACK"
  | "AT_RISK"
  | "NOT_STARTED"
  | "FALLING_BEHIND"
  | "NEEDS_PLAN";
export interface TraineePlanTemplate {
  templateName: string;
  templateId: number;
}

export interface TraineePlanLastSession {
  status: string;
  startedAt: string;
}

export interface TraineePlan {
  adherencePercentage: number;
  template: TraineePlanTemplate;
  lastSession?: TraineePlanLastSession | null;
  status: string;
  planAdherenceStatus: string;
}

export interface Trainee {
  traineeId: number;
  traineeName: string;
  traineeStatus: TraineeStatus;
  plans: TraineePlan[];
  email?: string;
}

export interface OffsetPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetTraineesResponse {
  data: Trainee[];
  pagination: OffsetPagination;
}

export interface GetTraineesQueryParams {
  page?: number;
  limit?: number;
}

export interface TraineeSessionRecord {
  id: string;
  date: string;
  sessionName: string;
  completedSets: string;
  notes?: string;
}

export interface ExerciseRef {
  id: number;
  name: string;
}

export interface SetLog {
  id: number;
  reps: number;
  weight: number;
  endedAt: string;
}

export interface TraineeProfileDetails {
  bio?: string;
  experience?: string;
  traineesFallingBehindThreshold?: number;
  traineesAtRiskThreshold?: number;
  birthDate: string;
  gender: string;
  bodyMetrics: Record<string, unknown>;
  trainerId: number;
  trainerName: string;
}

export interface TraineeProfile {
  id: number;
  email: string;
  name: string;
  phoneNumber: string;
  role: string;
  profile: TraineeProfileDetails;
}

export interface PersonalRecord {
  exercise: ExerciseRef;
  heaviestWeight: number;
  heaviestWeightSet: SetLog;
  estimatedOneRm: number;
  estimatedOneRmSet: SetLog;
  updatedAt: string;
}

export interface ProgressionEntry {
  id: number;
  exercise: ExerciseRef;
  heaviestWeight: number;
  estimatedOneRm: number;
  isWeightPr: boolean;
  isOneRmPr: boolean;
  achievedAt: string;
  setLog: SetLog;
}

export interface TraineeDetailedInfo {
  traineeProfile: TraineeProfile;
  personalRecords: PersonalRecord[];
  progression: ProgressionEntry[];
}