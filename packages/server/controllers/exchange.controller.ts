import type { Request, Response } from 'express';
import { exchangeService } from '../services/exchange.service';
import { conversationRepository } from '../repositories/conversation.repository';
import { isHebrew } from '../utils/language';

export const exchangeController = {
   async getExchangeRate(req: Request, res: Response) {
      const data = await exchangeService.convertCurrency(
         String(req.params.from || 'ILS'),
         String(req.params.to || req.params.target || 'USD'),
         Number(req.params.amount) || 1
      );

      const prompt = req.body.prompt || '';
      const message = isHebrew(prompt)
         ? `${data.amount} ${data.from} שווה ${data.result} ${data.to}`
         : `${data.amount} ${data.from} = ${data.result} ${data.to}`;

      if (req.body.conversationId) {
         await conversationRepository.saveSession(
            req.body.conversationId,
            prompt,
            { id: req.body.conversationId, text: message }
         );
      }

      res.json({ message });
   },
};
