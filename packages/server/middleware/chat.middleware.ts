import type { Request, Response, NextFunction } from 'express';
import { intentService } from '../services/intent.service.js';
import { orchestrationService } from '../services/orchestration.service.js';
import { ragService } from '../services/rag.service.js';
import { weatherController } from '../controllers/weather.controller';
import { exchangeController } from '../controllers/exchange.controller.js';
import { calculateController } from '../controllers/calculate.controller.js';

// Simple math detection without AI
function isMathQuery(prompt: string): boolean {
   const lower = prompt.toLowerCase();

   // Don't catch orchestration queries (multi-step with "and")
   if (/\band\b/i.test(prompt) && prompt.split(/\band\b/i).length > 1) {
      return false;
   }

   // Don't catch product queries
   const productNames =
      /\b(evophone|coffee maker|electric car|printer|laptop|techbook)\b/i;
   if (productNames.test(lower)) {
      return false;
   }

   // Don't catch queries about specifications/features
   const specKeywords =
      /\b(specification|feature|material|support|capacity|battery|ram|processor|display|camera)\b/i;
   if (
      specKeywords.test(lower) &&
      !(/\bcalculate\b/i.test(lower) || /\bwhat is\b/i.test(lower))
   ) {
      return false;
   }

   // Check for math keywords
   const mathKeywords = /\b(calculate|compute|solve|equals)\b/i;
   const simpleWhat = /^what\s+is\s+[\d\s\+\-\*\/\×\÷\^\(\)x]+[\?\s]*$/i;

   // Check for numbers and operators
   const hasNumbers = /\d/.test(prompt);
   const hasOperators =
      /[\+\-\*\/\×\÷\^]/.test(prompt) || /\d\s*x\s*\d/i.test(prompt);

   // Must have explicit math keywords OR simple "what is 2+2" pattern OR just numbers with operators
   return (
      (mathKeywords.test(lower) && hasNumbers) ||
      simpleWhat.test(prompt) ||
      (hasNumbers && hasOperators && prompt.split(/\s+/).length <= 5)
   );
}

export const chatMiddleware = {
   async classifyMessage(req: Request, res: Response, next: NextFunction) {
      const { prompt, conversationId } = req.body;

      // Quick math detection - bypass AI router for simple math
      if (isMathQuery(prompt)) {
         console.log('Math query detected:', prompt);
         return calculateController.calculateEquation(req, res);
      }

      const classification = await intentService.classify(prompt);
      const { intent, parameters, plan } = classification;
      const cookies = req.cookies;

      if (!cookies?.conversationId) {
         res.cookie('conversationId', conversationId);
      }

      // Handle orchestration
      if (intent === 'orchestrate' && plan) {
         try {
            console.log(
               `\n=== Orchestration Request ===\nQuery: ${prompt}\nSteps: ${plan.steps.length}`
            );

            const result = await orchestrationService.executePlan(prompt, plan);

            return res.json({
               message: result.final_answer,
               orchestration: {
                  steps: result.step_results.length,
                  execution_time_ms: result.total_execution_time_ms,
               },
            });
         } catch (error: any) {
            console.error('Orchestration Error:', error);
            return res.status(500).json({
               error: 'Orchestration failed',
               message: error.message,
            });
         }
      }

      // Handle product information queries
      if (intent === 'getProductInformation' && parameters) {
         try {
            const productName = String(parameters.product_name || '');
            const query = String(parameters.query || '');

            if (!productName || !query) {
               return res.status(400).json({
                  error: 'Missing product_name or query',
               });
            }

            const result = await ragService.searchAndGenerate(
               productName,
               query,
               3
            );

            return res.json({
               message: result.answer,
               sources: result.sources,
               retrieval_time_ms: result.retrieval_time_ms,
            });
         } catch (error: any) {
            console.error('RAG Error:', error);
            return res.status(500).json({
               error: 'Failed to get product information',
               message: error.message,
            });
         }
      }

      // Handle existing intents
      switch (intent) {
         case 'getWeather':
            req.params.city = String(parameters?.city);
            return weatherController.getWeather(req, res);

         case 'getExchangeRate':
            req.params = {
               from: String(parameters?.from),
               to: String(parameters?.to),
               amount: String(parameters?.amount),
            };
            return exchangeController.getExchangeRate(req, res);

         case 'calculate':
            // Keep original prompt in body for math translator
            return calculateController.calculateEquation(req, res);
      }

      // For chat and other intents, continue to chat controller
      next();
   },
};
