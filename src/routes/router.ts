import { Router } from 'express';
import BoletoController from '../controllers/Boleto';

const boletoRouter = Router();
const boletoController = new BoletoController;

boletoRouter.get('/:barCode', boletoController.boleto);

export default boletoRouter;