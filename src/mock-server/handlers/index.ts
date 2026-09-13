import { authHandlers } from "./auth.handlers";
import { trainerHandlers } from "./trainer.handlers";
import { templateHandlers } from "./templates.handlers";
import { workoutHandlers } from "./workouts.handlers";

export const handlers = [
  ...authHandlers,
  ...trainerHandlers,
  ...templateHandlers,
  ...workoutHandlers,
];