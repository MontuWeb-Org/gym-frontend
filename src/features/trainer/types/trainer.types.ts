export type TraineeStatus =
  | "ON_TRACK"
  | "AT_RISK"
  | "NOT_STARTED"
  | "FALLING_BEHIND"
  | "NEEDS_PLAN";

export interface TraineePlan {
  planId: number;
  status: string;
  adherencePercentage: number;
  template: {
    templateName: string;
    templateId: number;
  };
  lastSession: {
    status: string;
    startedAt: string | null;
  } | null;
  planAdherenceStatus: TraineeStatus;
}

/**
 * Trainee shape used throughout the trainer frontend.
 *
 * The trainee-management components consume the API fields:
 * - traineeId
 * - traineeName
 * - traineeStatus
 * - plans
 * - email
 *
 * Other existing trainer functionality uses the normalized fields:
 * - id
 * - name
 * - adherence
 * - programName
 * - lastSessionDate
 * - status
 * - assignedPlanTemplateIds
 *
 * The Redux mapping preserves both representations.
 */
export interface Trainee {
  // API / trainee-management fields
  traineeId: number;
  traineeName: string;
  traineeStatus: TraineeStatus;
  plans: TraineePlan[];
  email?: string;

  // Existing normalized trainer fields
  id: number;
  name: string;
  adherence: number;
  programName: string;
  lastSessionDate: string | null;
  status: TraineeStatus;
  assignedPlanTemplateIds: number[];
}

export interface OffsetPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetTraineesApiItem {
  traineeId: number;
  traineeName: string;
  traineeStatus: TraineeStatus;
  plans: TraineePlan[];
  email?: string;
}

export interface GetTraineesResponse {
  data: GetTraineesApiItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
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