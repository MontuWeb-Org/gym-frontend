export interface TraineeRecord {
  id: string;
  name: string;
  program: string;
  status: "Active" | "Inactive" | "Pending";
  progress: number;
}

export const MOCK_TRAINEES: TraineeRecord[] = [
  {
    id: "1",
    name: "John Doe",
    program: "Hypertrophy V2",
    status: "Active",
    progress: 75,
  },
  {
    id: "2",
    name: "Sarah Smith",
    program: "Fat Loss Shred",
    status: "Active",
    progress: 40,
  },
];