export const mathTranslatorService = {
   translateToEquation(prompt: string): string | null {
      // Remove common words and convert to lowercase
      let equation = prompt
         .toLowerCase()
         .replace(/what is|calculate|compute|solve|equals|equal to|is/gi, '')
         .replace(/plus/gi, '+')
         .replace(/minus/gi, '-')
         .replace(/times|multiplied by/gi, '*')
         .replace(/divided by|divide/gi, '/')
         .replace(/to the power of/gi, '^')
         .replace(/squared/gi, '^2')
         .replace(/cubed/gi, '^3')
         .replace(/square root of|sqrt/gi, 'sqrt')
         .replace(/percent of|% of/gi, '* 0.01 *')
         .replace(/×/g, '*')
         .replace(/÷/g, '/')
         .replace(/(\d)\s*x\s*(\d)/gi, '$1*$2') // Convert "2x3" or "2 x 3" to "2*3"
         .replace(/\bx\b/gi, '*') // Convert standalone "x" to "*"
         .trim();

      // Clean up extra spaces around operators and remove punctuation
      equation = equation
         .replace(/\s+/g, ' ')
         .replace(/\s*([+\-*/^()])\s*/g, '$1')
         .replace(/[?!.,;:]/g, '') // Remove question marks and punctuation
         .trim();

      if (!equation) {
         return null;
      }

      return equation;
   },

   async calculateFromPrompt(prompt: string, equation?: string | null) {
      const resolvedEquation =
         equation ?? mathTranslatorService.translateToEquation(prompt);

      if (!resolvedEquation) {
         return 'I could not translate the problem to math.';
      }

      try {
         const { evaluate } = await import('mathjs');
         const result = evaluate(resolvedEquation);
         return `${resolvedEquation} = ${result}`;
      } catch (error) {
         console.error('Math calculation error:', error);
         return `Error calculating: ${resolvedEquation}`;
      }
   },
};
