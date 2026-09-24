export interface ExerciseSet {
  setNumber: number;
  reps: number;
  weight: number;
}

export interface LibraryExercise {
  id: number;
  name: string;
  difficulty?: string;
  equipment?: string[];
  instructions?: string;
  illustrations?: string[];
  muscles?: string[];
}

export interface ExerciseTemplate {
  id: number;
  exercise: LibraryExercise;
  workoutTemplateId: number;
  sequenceNumber: number;
  defaultReps: string;
  defaultSets: number;
  defaultRestTimeSeconds: number;
  durationMinutes: number;
  defaultWeight: number;
}

export interface AssignedExercise {
  id: number;
  exerciseId: number;
  name: string;
  difficulty?: string;
  equipment?: string[];
  instructions?: string;
  illustrations?: string[];
  muscles?: string[];
  sequenceNumber: number;
  defaultSets: number;
  defaultReps: string;
  defaultRestTimeSeconds: number;
  durationMinutes: number;
  defaultWeight: number;
  sets: ExerciseSet[] | number;
  reps?: number;
  rest: number;
}

export interface WorkoutDetail {
  id: number;
  name: string;
  sequenceNumber?: number;
  weekTemplateId?: number;
  durationMinutes?: number;
  exerciseTemplateCount?: number;
  exercises?: AssignedExercise[];
}
