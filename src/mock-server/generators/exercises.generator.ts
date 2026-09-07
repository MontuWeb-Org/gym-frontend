import { faker } from '@faker-js/faker';

export function generateExercisesAndMuscles() {
  const muscleGroups = [
    { name: 'Pectoralis Major', region: 'Chest' },
    { name: 'Latissimus Dorsi', region: 'Back' },
    { name: 'Quadriceps', region: 'Legs' },
    { name: 'Biceps Brachii', region: 'Arms' },
    { name: 'Deltoids', region: 'Shoulders' },
  ];

  const muscles = muscleGroups.map((m, idx) => ({
    id: idx + 1,
    commonName: m.name,
    bodyRegion: m.region,
    diagramUrl: faker.image.url(),
    description: faker.lorem.sentence(),
  }));

  const exerciseNames = ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Pull-up', 'Barbell Row', 'Dumbbell Curl'];

  const exercises = exerciseNames.map((name, idx) => ({
    id: idx + 1,
    name,
    instructions: faker.lorem.paragraph(),
    difficulty: faker.helpers.arrayElement(['Beginner', 'Intermediate', 'Advanced']),
    equipment: [faker.helpers.arrayElement(['Barbell', 'Dumbbell', 'Machine', 'Bodyweight'])],
    illustrations: [faker.image.url()],
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  }));

  const exerciseMuscles = exercises.map((exercise) => ({
    exerciseId: exercise.id,
    muscleId: faker.helpers.arrayElement(muscles).id,
    name: 'Primary Target',
    role: 'PRIMARY' as const,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  }));

  return { muscles, exercises, exerciseMuscles };
}