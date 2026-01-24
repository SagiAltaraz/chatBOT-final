import axios from 'axios';
import { llmClient } from '../llm/client';
import ragPrompt from '../prompts/rag-generation.txt';

const PYTHON_SERVICE_URL =
   process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

interface RAGChunk {
   content: string;
   metadata: {
      product_name: string;
      filename: string;
      chunk_index: number;
      total_chunks: number;
   };
   distance: number;
}

interface PythonRAGResponse {
   query: string;
   chunks: RAGChunk[];
   retrieval_time_ms: number;
}

interface RAGServiceResponse {
   answer: string;
   sources: string[];
   retrieval_time_ms: number;
   generation_time_ms: number;
}

export const ragService = {
   /**
    * Search the knowledge base and generate an answer
    */
   async searchAndGenerate(
      productName: string,
      query: string,
      n_results: number = 3
   ): Promise<RAGServiceResponse> {
      const startTime = Date.now();

      try {
         // Step 1: Retrieve relevant chunks from Python service
         const retrievalStart = Date.now();
         const searchResponse = await axios.post<PythonRAGResponse>(
            `${PYTHON_SERVICE_URL}/search_kb`,
            {
               query: `${productName} ${query}`,
               n_results,
            },
            {
               timeout: 10000,
               headers: {
                  'Content-Type': 'application/json',
               },
            }
         );

         const { chunks, retrieval_time_ms } = searchResponse.data;
         const retrievalTime = Date.now() - retrievalStart;

         // If no chunks found
         if (!chunks || chunks.length === 0) {
            return {
               answer:
                  "I don't have information about that in the product documentation.",
               sources: [],
               retrieval_time_ms: retrieval_time_ms || retrievalTime,
               generation_time_ms: 0,
            };
         }

         // Step 2: Build context from retrieved chunks
         const context = chunks
            .map((chunk, index) => {
               return `[Source ${index + 1}: ${chunk.metadata.product_name}]\n${chunk.content}`;
            })
            .join('\n\n---\n\n');

         // Extract unique sources
         const sources = [
            ...new Set(chunks.map((chunk) => chunk.metadata.product_name)),
         ];

         // Step 3: Generate answer using LLM with RAG prompt
         const generationStart = Date.now();
         const prompt = ragPrompt
            .replace('{context}', context)
            .replace('{query}', query);

         const llmResponse = await llmClient.generateText({
            model: 'gpt-4o-mini',
            instructions: '',
            prompt: prompt,
            temperature: 0.1,
            maxTokens: 500,
         });

         const generationTime = Date.now() - generationStart;

         return {
            answer: llmResponse.text.trim(),
            sources,
            retrieval_time_ms: retrieval_time_ms || retrievalTime,
            generation_time_ms: generationTime,
         };
      } catch (error: any) {
         console.error('RAG Service Error:', error);

         // Handle specific error cases
         if (error.code === 'ECONNREFUSED') {
            throw new Error(
               'Python RAG service is not running. Please start it with: cd python-service && python3 server.py'
            );
         }

         if (error.response) {
            throw new Error(
               `Python service error: ${error.response.data?.error || error.message}`
            );
         }

         throw new Error(`RAG service failed: ${error.message}`);
      }
   },

   /**
    * Check if Python RAG service is available
    */
   async checkHealth(): Promise<boolean> {
      try {
         const response = await axios.get(`${PYTHON_SERVICE_URL}/health`, {
            timeout: 5000,
         });
         return response.status === 200;
      } catch (error) {
         return false;
      }
   },

   /**
    * Check if knowledge base is indexed
    */
   async checkIndexStatus(): Promise<{
      indexed: boolean;
      total_chunks: number;
   }> {
      try {
         const response = await axios.get(
            `${PYTHON_SERVICE_URL}/index_status`,
            {
               timeout: 5000,
            }
         );
         return {
            indexed: response.data.indexed,
            total_chunks: response.data.total_chunks || 0,
         };
      } catch (error) {
         return {
            indexed: false,
            total_chunks: 0,
         };
      }
   },
};
