export interface ExerciseSet {
  setNumber: number;
  reps: number;
  weight: number;
}

export interface AssignedExercise {
  id: number;
  exerciseId?: number;
  name: string;
  difficulty?: string;
  equipment?: string[];
  sets: ExerciseSet[] | number;
  reps?: number;
  rest: number;
}

export interface LibraryExercise {
  id: number;
  name: string;
  difficulty: string;
  equipment: string[];
  instructions: string;
  illustrations: string[];
}

export interface WorkoutDetail {
  id: number;
  name: string;
  exercises?: AssignedExercise[];
}