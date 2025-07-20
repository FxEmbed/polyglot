import { translate } from 'bing-translate-api';
// @ts-ignore - Import JSON file directly
import bingLanguages from 'bing-translate-api/src/lang.json' assert { type: 'json' };
import { TranslationProvider } from './types.js';
import type { TranslationResponse } from './types.js';

export class BingTranslateProvider extends TranslationProvider {
  name = 'bing';

  // Dynamic language support from Bing Translate API package
  private supportedLanguages = new Set(Object.keys(bingLanguages));

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResponse> {
    // Use null for auto-detect if sourceLang is not provided
    const result = await translate(text, sourceLang || null, targetLang);
    
    if (!result || !result.translation) {
      throw new Error('Bing translation failed: no result returned');
    }
    
    return {
      translated_text: result.translation,
      source_lang: sourceLang || result.language?.from || 'auto',
      target_lang: targetLang,
      provider: this.name
    };
  }

  supportsLanguage(languageCode: string): boolean {
    return this.supportedLanguages.has(languageCode.toLowerCase());
  }


  isAvailable(): boolean {
    // Always available since we don't need API keys
    return true;
  }

  isFree(): boolean {
    return true;
  }

  // smol
  getMaxTextLength(): number {
    return 1000;
  }
  // Bing Translate API doesn't support outputting newlines for some reason
  supportsText(text: string): boolean {
    return text.match(/\n/g) === null;
  }
} 