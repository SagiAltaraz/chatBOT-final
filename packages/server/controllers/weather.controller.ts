import type { Request, Response } from 'express';
import { weatherService } from '../services/weather.service';
import type { Weather } from '../services/weather.service';
import { conversationRepository } from '../repositories/conversation.repository';
import { isHebrew } from '../utils/language';

export const weatherController = {
   async getWeather(req: Request, res: Response) {
      const city = String(req.params.city).trim();
      if (!city || city.length === 0)
         return res.status(400).json({ error: 'City is required' });

      const weather: Weather = await weatherService.recieveWeather(city);
      const prompt = req.body.prompt || '';

      // Format message based on language
      const message = isHebrew(prompt)
         ? `מזג האוויר ב${weather.city}: ${weather.temperature}°C, ${weather.description}`
         : `Weather in ${weather.city}: ${weather.temperature}°C, ${weather.description}`;

      if (req.body.conversationId) {
         conversationRepository.saveSession(req.body.conversationId, prompt, {
            id: req.body.conversationId,
            text: message,
         });
      }

      res.json({ message });
   },
};
