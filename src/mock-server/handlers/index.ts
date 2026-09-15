import { authHandlers } from "./auth.handlers";
import { trainerHandlers } from "./trainer.handlers";
import {userHandlers} from "./user.handlers";


export const handlers = [
  ...authHandlers,
  ...trainerHandlers,
  ...userHandlers
];