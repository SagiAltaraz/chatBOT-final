import express from 'express';
import type { Request, Response } from 'express';
import { chatController } from './controllers/chat.controller.js';
import { reviewController } from './controllers/review.controller.js';
import { weatherController } from './controllers/weather.controller.js';
import { calculateController } from './controllers/calculate.controller.js';
import { exchangeController } from './controllers/exchange.controller.js';
import { productController } from './controllers/product.controller.js';
import { chatMiddleware } from './middleware/chat.middleware';
import { chatMessagesController } from './controllers/chatMessages.controller.js';
import { chatClearController } from './controllers/chat-clear.controller.js';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
   res.send('Hello, World!');
});

router.get('/api/hello', (req: Request, res: Response) => {
   res.json({ message: 'Hello from the API!' });
});

// Main chat endpoint - handles all intents including orchestration
router.post(
   '/api/chat',
   chatMiddleware.classifyMessage,
   chatController.sendMassage
);

// Chat history
router.post('/api/getMessages', chatMessagesController.getMessages);
router.post('/api/chat/clear', chatClearController.clearChat);

// Product information (RAG)
router.post('/api/products/search', productController.getProductInfo);
router.get('/api/products/health', productController.checkHealth);

// Reviews
router.get('/api/products/:id/reviews', reviewController.getReviews);
router.post(
   '/api/products/:id/reviews/summarize',
   reviewController.summerizeReviews
);

// Direct tool endpoints (Task 1)
router.get('/api/weather/:city', weatherController.getWeather);
router.get('/api/calculate/:equation', calculateController.calculateEquation);
router.get('/api/exchangerate/:target', exchangeController.getExchangeRate);

export default router;
