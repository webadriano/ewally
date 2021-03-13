import { Request, Response } from 'express';
import { validateTituloDigits, validateConvenioDigits } from '../helpers/boleto.helpers'
import { handleError } from '../helpers/error.helpers';
import ErrorHandler from '../errorHandlers';

export default class BoletoController {
    public async boleto(req: Request, res: Response): Promise<Response> {
        try {
            const barCode = req.params.barCode;

            if (!/^\d+$/.test(barCode)) throw new ErrorHandler(400, "O código de barras deve conter apenas números");

            if (barCode.length < 44) throw new ErrorHandler(400, "Código de barras inválido");

            let result;

            if (barCode.charAt(0) === "8") {
                result = validateConvenioDigits(barCode);
            } else {
                result = validateTituloDigits(barCode);
            }

            return res.status(200).json(result);
        } catch (error) {
            return handleError(error, res);
        }
    }
}