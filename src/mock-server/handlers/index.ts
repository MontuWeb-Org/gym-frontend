import { authHandlers } from "./auth.handlers";
import { trainerHandlers } from "./trainer.handlers";
import { programHandlers } from "./programs.handlers";

export const handlers = [
  ...authHandlers,
  ...trainerHandlers,
  ...programHandlers,
];