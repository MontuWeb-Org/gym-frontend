export type TraineeStatus = "ON_TRACK" | "AT_RISK" | "INVITE_PENDING" | "FALLING_BEHIND";

export interface Trainee {
  id: number;
  name: string;
  adherence: number;
  programName: string;
  lastSessionDate: string;
  status: TraineeStatus;
  email: string;
}

export interface GetTraineesQueryParams {
  page?: number;
  limit?: number;
}

export interface OffsetPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetTraineesResponse {
  data: {
    trainees: Trainee[];
  };
  pagination: OffsetPagination;
}

export interface TraineeSessionRecord {
  id: string;
  date: string;
  sessionName: string;
  completedSets: string;
  notes?: string;
}

export interface TraineeDetailedInfo {
  id: number;
  name: string;
  adherence: number;
  programName: string;
  lastSessionDate: string;
  status: TraineeStatus;
  joinedAt: string;
  programJoinedAt: string;
  streakWeeks?: number;
  topLiftPr?: string;
  recentSessions?: TraineeSessionRecord[];
  email: string;
}