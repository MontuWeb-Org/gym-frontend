import { faker } from '@faker-js/faker';

export function generateUsersAndProfiles(trainerCount = 4, traineeCount = 15) {
  let currentId = 1;

  const trainerHashedPassword = "3b60774b88b9ea67c9bac5eee365652a1cc33585c9e924b0aa36959b3c38d007"; //Trainer123!
  const traineeHashedPassword = "5f4887915e7ad8648549336ebae831405f90559dd3289ce110dff013d0fbdc7e"; //Trainee123!
  const adminHashedPassword = "3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121"; //Admin123!
  
  type User = {
    id: number;
    phoneNumber: string;
    email: string;
    name: string;
    role: 'TRAINER' | 'TRAINEE' | 'ADMIN';
    password: string;
    activationStatus: 'ACTIVATED' | 'PENDING';
    createdAt: string;
    updatedAt: string;
  };

  type Trainer = {
    userId: number;
    experience: string;
    bio: string;
    createdAt: string;
    updatedAt: string;
  };

  type Trainee = {
    userId: number;
    gender: 'MALE' | 'FEMALE';
    birthDate: string;
    bodyMetrics: {
      weightKg: number;
      heightCm: number;
      targetWeightKg: number;
    };
    trainerId: number;
    createdAt: string;
    updatedAt: string;
  };

  // Admin User (Master Trainer)
  const adminUser = {
    id: currentId++,
    phoneNumber: '+10000000000',
    email: 'admin@gym.com',
    name: 'Admin Trainer',
    role: 'ADMIN' as const,
    password: adminHashedPassword,
    activationStatus: 'ACTIVATED' as const,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };

  const adminTrainer = {
    userId: adminUser.id,
    experience: '10+ Years (Admin)',
    bio: 'Head Trainer and System Administrator',
    createdAt: adminUser.createdAt,
    updatedAt: adminUser.updatedAt,
  };

  const users: User[] = [adminUser];
  const trainers: Trainer[] = [adminTrainer];
  const trainees: Trainee[] = [];

  // Generate Trainers
  for (let i = 0; i < trainerCount; i++) {
    const user = {
      id: currentId++,
      phoneNumber: faker.phone.number(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: 'TRAINER' as const,
      password: trainerHashedPassword,
      activationStatus: 'ACTIVATED' as const,
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    };
    users.push(user);
    trainers.push({
      userId: user.id,
      experience: `${faker.number.int({ min: 1, max: 8 })} Years`,
      bio: faker.person.bio(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  // Generate Trainees linked to generated Trainers
  const trainerIds = trainers.map((t) => t.userId);

  for (let i = 0; i < traineeCount; i++) {
    const user = {
      id: currentId++,
      phoneNumber: faker.phone.number(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: 'TRAINEE' as const,
      password: traineeHashedPassword,
      activationStatus: faker.helpers.arrayElement(['ACTIVATED', 'PENDING']) as 'ACTIVATED' | 'PENDING',
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    };

    users.push(user);
    trainees.push({
      userId: user.id,
      gender: faker.helpers.arrayElement(['MALE', 'FEMALE']) as 'MALE' | 'FEMALE',
      birthDate: faker.date.birthdate({ min: 18, max: 60, mode: 'age' }).toISOString(),
      bodyMetrics: {
        weightKg: faker.number.int({ min: 55, max: 110 }),
        heightCm: faker.number.int({ min: 155, max: 195 }),
        targetWeightKg: faker.number.int({ min: 50, max: 90 }),
      },
      trainerId: faker.helpers.arrayElement(trainerIds),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  return { users, trainers, trainees };
}