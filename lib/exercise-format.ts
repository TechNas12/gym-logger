/**
 * Utilities for formatting exercise instructions, steps, images, and multilingual content
 */

export const SUPPORTED_LANGUAGES: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  hi: 'हिन्दी',
  it: 'Italiano',
  ko: '한국어',
  pl: 'Polski',
  ru: 'Русский',
  tr: 'Türkçe',
  zh: '中文',
};

/**
 * Extract clean, sequential instruction steps for a given language (defaults to 'en').
 * Handles JSON strings, structured language objects, and plain text fallbacks.
 */
export function parseExerciseSteps(
  instructionSteps: any,
  rawInstructions: any,
  lang: string = 'en'
): string[] {
  // 1. Try instruction_steps first
  let stepsObj = instructionSteps;
  if (typeof stepsObj === 'string') {
    try {
      stepsObj = JSON.parse(stepsObj);
    } catch {
      // not JSON
    }
  }

  if (stepsObj && typeof stepsObj === 'object') {
    // If keyed by language
    if (Array.isArray(stepsObj[lang]) && stepsObj[lang].length > 0) {
      return stepsObj[lang].filter((s: unknown) => typeof s === 'string' && s.trim());
    }
    // Fallback to English
    if (Array.isArray(stepsObj.en) && stepsObj.en.length > 0) {
      return stepsObj.en.filter((s: unknown) => typeof s === 'string' && s.trim());
    }
    // If it's a direct array of strings
    if (Array.isArray(stepsObj) && stepsObj.length > 0) {
      return stepsObj.filter((s: unknown) => typeof s === 'string' && s.trim());
    }
  }

  // 2. Fallback to raw instructions
  let instObj = rawInstructions;
  if (typeof instObj === 'string' && instObj.trim().startsWith('{')) {
    try {
      instObj = JSON.parse(instObj);
    } catch {
      // not JSON
    }
  }

  if (instObj && typeof instObj === 'object') {
    const text = instObj[lang] || instObj.en;
    if (typeof text === 'string' && text.trim()) {
      return splitParagraphIntoSteps(text);
    }
  }

  if (typeof instObj === 'string' && instObj.trim()) {
    return splitParagraphIntoSteps(instObj);
  }

  return [];
}

/**
 * Splits a single paragraph into numbered step sentences.
 */
function splitParagraphIntoSteps(paragraph: string): string[] {
  // Split on periods followed by spaces or newlines, preserving sentences
  const cleaned = paragraph.trim();
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  return sentences.length > 0 ? sentences : [cleaned];
}

/**
 * Get available language codes for a given exercise's instructions.
 */
export function getAvailableInstructionLanguages(
  instructionSteps: any,
  rawInstructions: any
): { code: string; label: string }[] {
  const codes = new Set<string>();

  const checkObj = (obj: any) => {
    if (!obj) return;
    let parsed = obj;
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        return;
      }
    }
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      Object.keys(parsed).forEach((k) => {
        if (SUPPORTED_LANGUAGES[k]) {
          codes.add(k);
        }
      });
    }
  };

  checkObj(instructionSteps);
  checkObj(rawInstructions);

  if (codes.size === 0) {
    return [{ code: 'en', label: 'English' }];
  }

  // Ensure 'en' is first
  const list = Array.from(codes).map((code) => ({
    code,
    label: SUPPORTED_LANGUAGES[code] || code.toUpperCase(),
  }));

  list.sort((a, b) => {
    if (a.code === 'en') return -1;
    if (b.code === 'en') return 1;
    return a.label.localeCompare(b.label);
  });

  return list;
}
