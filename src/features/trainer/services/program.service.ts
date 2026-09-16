import axios from "axios";
import { tokenStorage } from "@/lib/storage";

axios.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = tokenStorage.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export const programService = {
  // Plan Templates
  getTemplates: (page = 1, limit = 10) =>
    axios.get(`/api/plans/templates?page=${page}&limit=${limit}`),

  createTemplate: (data: { name: string; description: string }) =>
    axios.post("/api/plans/templates", data),

  getTemplateDetail: (planId: number) =>
    axios.get(`/api/plans/templates/${planId}`),

  updatePlanTemplate: (
    planId: number,
    data: {
      name?: string;
      description?: string;
      status?: "DRAFT" | "ACTIVE";
    }
  ) =>
    axios.put(`/api/plans/templates/${planId}`, data),

  duplicateTemplate: (planId: number) =>
    axios.post(`/api/plans/templates/${planId}/duplicate`),

  // Week Templates
  createWeek: (data: {
    sequenceNumber: number;
    planTemplateId: number;
  }) => axios.post("/api/plans/templates/weeks", data),

  getWeekDetail: (weekId: number) =>
    axios.get(`/api/plans/templates/weeks/${weekId}`),

  // Workout Templates
  createWorkout: (data: {
    name: string;
    sequenceNumber: number;
    weekTemplateId: number;
  }) =>
    axios.post("/api/plans/templates/workouts", data),

  updateWorkout: (
    workoutId: number,
    data: {
      name?: string;
      sequenceNumber?: number;
    }
  ) =>
    axios.put(`/api/plans/templates/workouts/${workoutId}`, data),

  getWorkoutDetail: (workoutId: number) =>
    axios.get(`/api/plans/templates/workouts/${workoutId}`),

  // Exercise Library & Workout Exercises
  getExercises: (page = 1, limit = 50) =>
    axios.get(`/api/exercises?page=${page}&limit=${limit}`),

  addExerciseToWorkout: (data: {
    exerciseId: number;
    workoutTemplateId: number;
    sequenceNumber: number;
    defaultReps: string;
    defaultSets: number;
    defaultRestTimeSeconds: number;
    defaultDurationMinutes: number;
    defaultWeight: number;
  }) =>
    axios.post("/api/plans/templates/exercises", data),

  updateWorkoutExercise: (
    exerciseTemplateId: number,
    data: {
      sequenceNumber?: number;
      defaultReps?: string;
      defaultSets?: number;
      defaultRestTimeSeconds?: number;
      defaultDurationMinutes?: number;
      defaultWeight?: number;
    }
  ) =>
    axios.put(
      `/api/plans/templates/exercises/${exerciseTemplateId}`,
      data
    ),

  reorderExercises: (workoutId: number, exercises: unknown[]) =>
    axios.put(
      `/api/plans/templates/workouts/${workoutId}/exercises/reorder`,
      { exercises }
    ),

    // Trainees & Plan Assignments
  getTrainees: (page = 1, limit = 10) =>
    axios.get(
      `/api/users/trainer/trainees?page=${page}&limit=${limit}`
    ),

  getAssignments: () =>
    axios.get("/api/plans/assignments"),

  assignPlan: (data: {
    planTemplateId: number;
    traineeId: number;
    createdAt: string;
    endedAt: string;
  }) =>
    axios.post("/api/plans/assignments", data),

  updateAssignment: (
    assignmentId: number,
    data: {
      createdAt?: string;
      endedAt?: string;
    }
  ) =>
    axios.put(`/api/plans/assignments/${assignmentId}`, data),

  deleteAssignment: (assignmentId: number) =>
    axios.delete(`/api/plans/assignments/${assignmentId}`),
};