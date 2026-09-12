import axios from "axios";

export const programService = {
  // Plan Templates
  getTemplates: (page = 1, limit = 10) => 
    axios.get(`/api/plans/templates?page=${page}&limit=${limit}`),
  
  createTemplate: (data: { name: string; description: string }) => 
    axios.post("/api/plans/templates", data),
  
  getTemplateDetail: (planId: number) => 
    axios.get(`/api/plans/templates/${planId}`),
  
  duplicateTemplate: (planId: number) => 
    axios.post(`/api/plans/templates/${planId}/duplicate`),

  // Week Templates
  createWeek: (data: { sequenceNumber: number; planTemplateId: number }) => 
    axios.post("/api/plans/templates/weeks", data),
  
  getWeekDetail: (weekId: number) => 
    axios.get(`/api/plans/templates/weeks/${weekId}`),

  // Workout Templates
  createWorkout: (data: { name: string; sequenceNumber: number; weekTemplateId: number }) => 
    axios.post("/api/plans/templates/workouts", data),
  
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
  }) => axios.post("/api/plans/templates/exercises", data),
};