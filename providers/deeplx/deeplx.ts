import { translate as deeplxTranslate, type Language } from 'deeplx';
import { TranslationProvider } from '../types.js';
import type { TranslationResponse } from '../types.js';

export class DeepLXProvider extends TranslationProvider {
  name = 'deeplx';

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResponse> {
    const result = await deeplxTranslate(text, targetLang as Language, sourceLang as Language);
    return {
      text: result,
      source_lang: sourceLang,
      target_lang: targetLang,
      provider: 'deepl'
    };
  }
} 