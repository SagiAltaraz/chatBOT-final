import { llmClient } from '../llm/client';
import routerAdvancedPrompt from '../prompts/router-advanced.txt';

interface OrchestrationStep {
   step: number;
   tool: string;
   parameters: Record<string, any>;
   description: string;
}

interface OrchestrationPlan {
   steps: OrchestrationStep[];
   final_answer_synthesis_required: boolean;
}

interface RouterResponse {
   intent: string;
   parameters:
      | {
           city?: string;
           target?: string;
           from?: string;
           to?: string;
           amount?: number | null;
           equation?: string;
           product_name?: string;
           query?: string;
           review_text?: string;
        }
      | Record<string, any>
      | null;
   confidence: number;
   plan?: OrchestrationPlan | null;
}

export const intentService = {
   async classify(userPrompt: string): Promise<RouterResponse> {
      const startTime = Date.now();

      const response = await llmClient.generateText({
         model: 'gpt-4o-mini',
         instructions: routerAdvancedPrompt,
         prompt: `Return json. User Input: "${userPrompt}"`,
         temperature: 0,
         maxTokens: 800,
         textFormat: { type: 'json_object' },
      });

      const classificationTime = Date.now() - startTime;

      try {
         const cleanText = response.text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

         const parsedResponse = JSON.parse(cleanText) as RouterResponse;

         console.log(
            `Router classified: ${parsedResponse.intent} (${classificationTime}ms)`
         );

         if (parsedResponse.intent === 'orchestrate' && parsedResponse.plan) {
            console.log(
               `  Orchestration plan: ${parsedResponse.plan.steps.length} steps`
            );
         }

         return parsedResponse;
      } catch (error) {
         console.error('Router Parsing Failed. Raw text:', response.text);
         return { intent: 'chat', parameters: null, confidence: 0, plan: null };
      }
   },
};
