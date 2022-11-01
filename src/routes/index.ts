import {Router} from 'express';
import userRouter from './user_routes';

const routes = Router();
routes.use('/users', userRouter);
export default routes; 