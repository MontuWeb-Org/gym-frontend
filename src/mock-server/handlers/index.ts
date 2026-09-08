import { authHandlers } from './auth.handlers';
<<<<<<< HEAD
import { trainerHandlers } from './trainer.handlers';
    
export const handlers = [
  ...authHandlers,
  ...trainerHandlers,
=======
import { dashboardHandlers } from './dashboard.handlers';

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
>>>>>>> 5d1ed07 (feat: implement dynamic dashboard and wireframe alignment)
];