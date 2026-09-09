import { authHandlers } from './auth.handlers';
import { trainerHandlers } from './trainer.handlers';
    
export const handlers = [
  ...authHandlers,
  ...trainerHandlers,
];