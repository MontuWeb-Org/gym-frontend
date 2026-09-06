import { faker } from '@faker-js/faker';

export function generatePlansAndAssignments(
  trainers: Array<{ userId: number }>,
  trainees: Array<{ userId: number }>,
  exercises: Array<{ id: number }>
) {
  let planId = 1;
  let weekId = 1;
  let workoutId = 1;
  let workoutExerciseId = 1;
  let assignmentId = 1;

    type PlanTemplate = {
        id: number;
        name: string;
        description: string;
        status: 'ACTIVE';
        trainerId: number;
        durationWeekTemplates: number;
        isFav: boolean;
        createdAt: string;
        updatedAt: string;
    }

    type WeekTemplate = {
        id: number;
        sequenceNumber: number;
        planTemplateId: number;
        createdAt: string;
        updatedAt: string;
    }
    type WorkoutTemplate = {
        id: number;
        name: string;
        sequenceNumber: number;
        durationMinutes: number;
        weekTemplateId: number;
        createdAt: string;
        updatedAt: string;
    }
    type WorkoutExerciseTemplate = {
        id: number;
        exerciseId: number;
        workoutTemplateId: number;
        sequenceNumber: number;
        defautlReps: string;
        defaultSets: number;
        defaultRestTimeSeconds: number;
        defautlDurationMinutes: number;
        defaultWeight: string;
        createdAt: string;
        updatedAt: string;
    }
    
  const planTemplates: PlanTemplate[]= [];
  const weekTemplates: WeekTemplate[] = [];
  const workoutTemplates: WorkoutTemplate[] = [];
  const workoutExerciseTemplates: WorkoutExerciseTemplate[] = [];
  // Generate Plan Templates per Trainer
  trainers.forEach((trainer) => {
    const plan = {
      id: planId++,
      name: `${trainer.userId === 1 ? 'Master' : 'Custom'} Hypertrophy Plan`,
      description: faker.lorem.sentence(),
      status: 'ACTIVE' as const,
      trainerId: trainer.userId,
      durationWeekTemplates: 4,
      isFav: faker.datatype.boolean(),
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    };
    planTemplates.push(plan);

    // Generate 1 Week Template per Plan
    const week = {
      id: weekId++,
      sequenceNumber: 1,
      planTemplateId: plan.id,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
    weekTemplates.push(week);

    // Generate 2 Workout Templates per Week
    for (let w = 1; w <= 2; w++) {
      const workout = {
        id: workoutId++,
        name: `Day ${w} - Full Body`,
        sequenceNumber: w,
        durationMinutes: 60,
        weekTemplateId: week.id,
        createdAt: week.createdAt,
        updatedAt: week.updatedAt,
      };
      workoutTemplates.push(workout);

      // Attach 2 Exercises per Workout
      for (let e = 1; e <= 2; e++) {
        const selectedExercise = faker.helpers.arrayElement(exercises);
        workoutExerciseTemplates.push({
          id: workoutExerciseId++,
          exerciseId: selectedExercise.id,
          workoutTemplateId: workout.id,
          sequenceNumber: e,
          defautlReps: '8-12',
          defaultSets: 3,
          defaultRestTimeSeconds: 90,
          defautlDurationMinutes: 15,
          defaultWeight: '50.0',
          createdAt: workout.createdAt,
          updatedAt: workout.updatedAt,
        });
      }
    }
  });

  // Assign generated Plans to Trainees
  const planAssignments = trainees.map((trainee) => {
    const assignedPlan = faker.helpers.arrayElement(planTemplates);
    return {
      id: assignmentId++,
      status: 'ACTIVE' as const,
      traineeId: trainee.userId,
      planTemplateId: assignedPlan.id,
      currentWeekIdx: 1,
      currentWorkoutIdx: 1,
      createdAt: faker.date.past().toISOString(),
      startedAt: faker.date.past().toISOString(),
      endedAt: null,
      updatedAt: faker.date.recent().toISOString(),
    };
  });

  return {
    planTemplates,
    weekTemplates,
    workoutTemplates,
    workoutExerciseTemplates,
    planAssignments,
  };
}