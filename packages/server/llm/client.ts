import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env if not already loaded
if (!process.env.OPENAI_API_KEY) {
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.dirname(__filename);
   dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') });
}

// Lazy initialization - create client only when needed
let client: OpenAI | null = null;

function getClient(): OpenAI {
   if (!client) {
      client = new OpenAI({
         apiKey: process.env.OPENAI_API_KEY,
      });
   }
   return client;
}

type GenerateTextOptions = {
   model?: string;
   prompt: string;
   instructions?: string;
   temperature?: number;
   maxTokens?: number;
   previouseResponceId?: string;
   textFormat?: {
      type: 'json_object';
   };
};

export type GenerateTextResult = {
   id: string;
   text: string;
};

export const llmClient = {
   async generateText({
      model = 'gpt-4o-mini',
      prompt,
      instructions,
      temperature = 0.2,
      maxTokens = 300,
      previouseResponceId,
      textFormat,
   }: GenerateTextOptions): Promise<GenerateTextResult> {
      const messages: Array<{ role: 'system' | 'user'; content: string }> = [];

      if (instructions) {
         messages.push({ role: 'system', content: instructions });
      }

      messages.push({ role: 'user', content: prompt });

      const response = await getClient().chat.completions.create({
         model,
         messages,
         temperature,
         max_tokens: maxTokens,
         ...(textFormat ? { response_format: { type: 'json_object' } } : {}),
      });

      return {
         id: response.id,
         text: response.choices[0]?.message?.content || '',
      };
   },
};
