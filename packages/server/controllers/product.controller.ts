import type { Request, Response } from 'express';
import { ragService } from '../services/rag.service';
import z from 'zod';

const productQuerySchema = z.object({
   product_name: z.string().trim().min(1),
   query: z.string().trim().min(1),
});

export const productController = {
   /**
    * Get product information using RAG
    */
   async getProductInfo(req: Request, res: Response) {
      const parseResult = productQuerySchema.safeParse(req.body);

      if (!parseResult.success) {
         res.status(400).json(z.treeifyError(parseResult.error));
         return;
      }

      const { product_name, query } = req.body;

      try {
         const result = await ragService.searchAndGenerate(
            product_name,
            query,
            3
         );

         res.json({
            answer: result.answer,
            sources: result.sources,
            retrieval_time_ms: result.retrieval_time_ms,
            generation_time_ms: result.generation_time_ms,
         });
      } catch (error: any) {
         console.error('Product Controller Error:', error);
         res.status(500).json({
            error: 'Failed to get product information',
            message: error.message,
         });
      }
   },

   /**
    * Check RAG service health
    */
   async checkHealth(req: Request, res: Response) {
      try {
         const isHealthy = await ragService.checkHealth();
         const indexStatus = await ragService.checkIndexStatus();

         res.json({
            python_service_healthy: isHealthy,
            knowledge_base_indexed: indexStatus.indexed,
            total_chunks: indexStatus.total_chunks,
         });
      } catch (error: any) {
         res.status(503).json({
            error: 'RAG service unavailable',
            message: error.message,
         });
      }
   },
};
