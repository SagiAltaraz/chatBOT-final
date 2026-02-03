import { llmClient } from '../llm/client';
import orchestrationSynthesisPrompt from '../prompts/orchestration-synthesis.txt';
import { weatherService } from './weather.service';
import { exchangeService } from './exchange.service';
import { mathTranslatorService } from './math_translator.service';
import { ragService } from './rag.service';
import { getLanguage } from '../utils/language';

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

interface StepResult {
   step: number;
   tool: string;
   description: string;
   result: string;
   execution_time_ms: number;
   error?: string;
}

interface OrchestrationResult {
   original_query: string;
   plan: OrchestrationPlan;
   step_results: StepResult[];
   final_answer: string;
   total_execution_time_ms: number;
}

export const orchestrationService = {
   /**
    * Execute a multi-step orchestration plan
    */
   async executePlan(
      originalQuery: string,
      plan: OrchestrationPlan
   ): Promise<OrchestrationResult> {
      const startTime = Date.now();
      const stepResults: StepResult[] = [];

      console.log('\n=== Starting Orchestration ===');
      console.log(`Query: ${originalQuery}`);
      console.log(`Steps: ${plan.steps.length}`);

      // Execute each step sequentially
      for (const step of plan.steps) {
         const stepStartTime = Date.now();
         console.log(`\nExecuting Step ${step.step}: ${step.tool}`);

         try {
            // Replace placeholders with previous results
            const resolvedParameters = orchestrationService.resolvePlaceholders(
               step.parameters,
               stepResults
            );

            // Execute the step
            const result = await orchestrationService.executeStep(
               step.tool,
               resolvedParameters
            );

            const executionTime = Date.now() - stepStartTime;

            stepResults.push({
               step: step.step,
               tool: step.tool,
               description: step.description,
               result: result,
               execution_time_ms: executionTime,
            });

            console.log(`✓ Step ${step.step} completed in ${executionTime}ms`);
            console.log(`  Result: ${result.substring(0, 100)}...`);
         } catch (error: any) {
            const executionTime = Date.now() - stepStartTime;
            const errorMessage = error.message || 'Unknown error';

            console.error(`✗ Step ${step.step} failed:`, errorMessage);

            stepResults.push({
               step: step.step,
               tool: step.tool,
               description: step.description,
               result: `Error: ${errorMessage}`,
               execution_time_ms: executionTime,
               error: errorMessage,
            });

            // Continue with next steps even if one fails
         }
      }

      // Synthesize final answer
      let finalAnswer: string;

      if (plan.final_answer_synthesis_required) {
         console.log('\nSynthesizing final answer...');
         finalAnswer = await orchestrationService.synthesizeAnswer(
            originalQuery,
            stepResults
         );
      } else {
         // If synthesis not required, just return the last step result
         finalAnswer =
            stepResults[stepResults.length - 1]?.result ||
            'No results available';
      }

      const totalTime = Date.now() - startTime;
      console.log(`\n=== Orchestration Complete in ${totalTime}ms ===\n`);

      return {
         original_query: originalQuery,
         plan,
         step_results: stepResults,
         final_answer: finalAnswer,
         total_execution_time_ms: totalTime,
      };
   },

   /**
    * Replace placeholders like <result_from_step_0> with actual results
    */
   resolvePlaceholders(
      parameters: Record<string, any>,
      previousResults: StepResult[]
   ): Record<string, any> {
      const resolved: Record<string, any> = {};

      for (const [key, value] of Object.entries(parameters)) {
         if (
            typeof value === 'string' &&
            value.includes('<result_from_step_')
         ) {
            // Extract step number from placeholder
            const match = value.match(/<result_from_step_(\d+)>/);
            if (match && match[1]) {
               const stepNumber = parseInt(match[1]);
               const stepResult = previousResults.find(
                  (r) => r.step === stepNumber
               );

               if (stepResult) {
                  // Extract numeric value from result if possible
                  const numericMatch = stepResult.result.match(/[\d,]+\.?\d*/);
                  const numericValue = numericMatch
                     ? parseFloat(numericMatch[0].replace(/,/g, ''))
                     : stepResult.result;

                  // Replace placeholder with actual result
                  resolved[key] = value.replace(
                     `<result_from_step_${stepNumber}>`,
                     String(numericValue)
                  );
               } else {
                  console.warn(
                     `Warning: Step ${stepNumber} result not found for placeholder`
                  );
                  resolved[key] = value;
               }
            } else {
               resolved[key] = value;
            }
         } else {
            resolved[key] = value;
         }
      }

      return resolved;
   },

   /**
    * Execute a single step based on the tool name
    */
   async executeStep(
      tool: string,
      parameters: Record<string, any>
   ): Promise<string> {
      switch (tool) {
         case 'getWeather': {
            const city = parameters.city;
            if (!city) throw new Error('Missing city parameter');

            const weather = await weatherService.recieveWeather(city);
            return `Weather in ${weather.city}: ${weather.description}, ${weather.temperature}°C`;
         }

         case 'getExchangeRate': {
            const from = parameters.from || 'ILS';
            const to = parameters.to;
            const amount = parameters.amount || 1;

            if (!to) throw new Error('Missing currency parameter');

            const result = await exchangeService.convertCurrency(
               from,
               to,
               amount
            );
            return `${result.amount} ${result.from} = ${result.result} ${result.to}`;
         }

         case 'calculateMath': {
            const equation = parameters.equation;
            if (!equation) throw new Error('Missing equation parameter');

            const result = await mathTranslatorService.calculateFromPrompt(
               equation,
               equation
            );
            return result;
         }

         case 'getProductInformation': {
            const productName = parameters.product_name;
            const query = parameters.query;

            if (!productName || !query) {
               throw new Error('Missing product_name or query parameter');
            }

            const result = await ragService.searchAndGenerate(
               productName,
               query,
               3
            );
            return result.answer;
         }

         case 'analyzeReview': {
            const reviewText = parameters.review_text;
            if (!reviewText) throw new Error('Missing review_text parameter');

            // Simple sentiment analysis using LLM
            const response = await llmClient.generateText({
               model: 'gpt-4o-mini',
               instructions:
                  'Analyze the sentiment of this review. Respond with: Positive, Negative, or Mixed, followed by a brief explanation.',
               prompt: `Review: "${reviewText}"`,
               temperature: 0,
               maxTokens: 150,
            });

            return response.text.trim();
         }

         default:
            throw new Error(`Unknown tool: ${tool}`);
      }
   },

   /**
    * Synthesize multiple step results into a coherent final answer
    */
   async synthesizeAnswer(
      originalQuery: string,
      stepResults: StepResult[]
   ): Promise<string> {
      // Format step results for the prompt
      const stepsFormatted = stepResults
         .map((result) => {
            const status = result.error ? '❌ FAILED' : '✓ SUCCESS';
            return `Step ${result.step} [${result.tool}] ${status}:
Description: ${result.description}
Result: ${result.result}
Time: ${result.execution_time_ms}ms`;
         })
         .join('\n\n');

      const lang = getLanguage(originalQuery);
      const prompt = orchestrationSynthesisPrompt
         .replace('{original_query}', originalQuery)
         .replace('{steps_results}', stepsFormatted)
         .replace(/{language}/g, lang);

      // Generate synthesized answer
      const response = await llmClient.generateText({
         model: 'gpt-4o-mini',
         instructions: '',
         prompt: prompt,
         temperature: 0.3,
         maxTokens: 600,
      });

      return response.text.trim();
   },
};
