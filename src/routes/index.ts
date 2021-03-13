import { Router } from 'express';
import boletoRouter from './router';

const routes = Router();

routes.use('/boleto', boletoRouter);

export default routes;