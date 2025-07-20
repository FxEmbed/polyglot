import { TranslationProvider } from './types.js';
import type { TranslationResponse } from './types.js';

interface DeepLTranslateResponse {
  translations: Array<{
    detected_source_language: string;
    text: string;
  }>;
}

export class DeepLProvider extends TranslationProvider {
  name = 'deepl';

  // DeepL officially supported languages (from official documentation)
  private supportedLanguages = new Set([
    'ar', 'bg', 'cs', 'da', 'de', 'el', 'en', 'en-gb', 'en-us', 'es', 'et', 'fi', 'fr', 'hu', 'id', 'it', 
    'ja', 'ko', 'lt', 'lv', 'nb', 'nl', 'pl', 'pt', 'pt-br', 'pt-pt', 'ro', 'ru', 'sk', 'sl', 'sv', 'tr', 
    'uk', 'zh', 'zh-hans', 'zh-hant'
  ]);

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResponse> {
    const apiKey = process.env.DEEPL_API_KEY;
    
    if (!apiKey) {
      throw new Error('DeepL API key not configured');
    }

    const baseUrl = 'https://api-free.deepl.com/v2/translate';

    const params = new URLSearchParams({
      auth_key: apiKey,
      text,
      target_lang: targetLang.toUpperCase(),
    });

    if (sourceLang) {
      params.append('source_lang', sourceLang.toUpperCase());
    }

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepL API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as DeepLTranslateResponse;
    const result = data.translations[0];

    if (!result) {
      throw new Error('Invalid response from DeepL API');
    }

    return {
      text: result.text,
      source_lang: sourceLang || result.detected_source_language.toLowerCase(),
      target_lang: targetLang,
      provider: this.name
    };
  }

  supportsLanguage(languageCode: string): boolean {
    const normalized = languageCode.toLowerCase();
    // Handle common variations
    if (normalized === 'zh-cn' || normalized === 'zh-tw') {
      return true;
    }
    return this.supportedLanguages.has(normalized);
  }

  isAvailable(): boolean {
    return !!process.env.DEEPL_API_KEY;
  }
}