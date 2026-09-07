import { faker } from '@faker-js/faker';
import fs from 'node:fs';
import path from 'node:path';

import { generateUsersAndProfiles } from './users.generator';
import { generateExercisesAndMuscles } from './exercises.generator';
import { generatePlansAndAssignments } from './plans.generator';

faker.seed(42);

const DATA_DIR = path.join(process.cwd(), 'src/mock-server/data');

export function runGenerator() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Step 1: Users & Profiles
  const { users, trainers, trainees } = generateUsersAndProfiles();

  // Step 2: Exercises & Muscles
  const { muscles, exercises, exerciseMuscles } = generateExercisesAndMuscles();

  // Step 3: Plans, Workouts & Assignments (Consumes IDs from Steps 1 & 2)
  const plansData = generatePlansAndAssignments(trainers, trainees, exercises);

  const mockDb = {
    users,
    trainers,
    trainees,
    muscles,
    exercises,
    exerciseMuscles,
    ...plansData,
  };

  // Save each dataset to JSON
  Object.entries(mockDb).forEach(([key, val]) => {
    fs.writeFileSync(path.join(DATA_DIR, `${key}.json`), JSON.stringify(val, null, 2));
  });

  console.log('✅ Generated consistent mock data files across all modules!');
}

runGenerator();