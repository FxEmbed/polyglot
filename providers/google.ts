import { translate as googleTranslate } from '@vitalets/google-translate-api';
import { TranslationProvider } from './types.js';
import type { TranslationResponse } from './types.js';
import type { TranslateOptions } from '@vitalets/google-translate-api/dist/cjs/types.js';

export class GoogleTranslateProvider extends TranslationProvider {
  name = 'google';

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResponse> {
    const options: TranslateOptions = { to: targetLang };
    if (sourceLang) {
      options.from = sourceLang;
    }
    
    const result = await googleTranslate(text, options);
    return {
      text: result.text,
      source_lang: sourceLang,
      target_lang: targetLang,
      provider: 'google'
    };
  }
} 