export function isHebrew(text: string): boolean {
   return /[\u0590-\u05FF]/.test(text);
}

export function getLanguage(text: string): 'Hebrew' | 'English' {
   return isHebrew(text) ? 'Hebrew' : 'English';
}
