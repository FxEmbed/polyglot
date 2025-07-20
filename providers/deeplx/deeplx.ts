import { translate as deeplxTranslate, type Language, SUPPORTED_LANGUAGES } from 'deeplx';
import { TranslationProvider } from '../types.js';
import type { TranslationResponse } from '../types.js';

export class DeepLXProvider extends TranslationProvider {
  name = 'deeplx';

  // Dynamic language support from DeepLX package
  private supportedLanguages = new Set(
    SUPPORTED_LANGUAGES.map(lang => lang.code.toLowerCase())
  );

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResponse> {
    const result = await deeplxTranslate(text, targetLang as Language, sourceLang as Language);
    return {
      text: result,
      source_lang: sourceLang,
      target_lang: targetLang,
      provider: 'deepl'
    };
  }

  supportsLanguage(languageCode: string): boolean {
    return this.supportedLanguages.has(languageCode.toLowerCase());
  }

  isAvailable(): boolean {
    return true;
  }

  isFree(): boolean {
    return true;
  }
} 