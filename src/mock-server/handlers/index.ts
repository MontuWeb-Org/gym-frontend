import { authHandlers } from "./auth.handlers";
import { trainerHandlers } from "./trainer.handlers";
import { templateHandlers } from "./templates.handlers";
import { weekHandlers } from "./week.handlers";
import { workoutHandlers } from "./workouts.handlers";
import { assignmentHandlers } from "./assignment.handlers";

export const handlers = [
  ...authHandlers,
  ...trainerHandlers,
  ...templateHandlers,
  ...weekHandlers,
  ...workoutHandlers,
  ...assignmentHandlers,
];
console.log(
  "[MSW] Registered handlers:",
  handlers.length
);
