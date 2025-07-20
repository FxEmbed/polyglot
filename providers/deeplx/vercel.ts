import { SUPPORTED_LANGUAGES } from 'deeplx';
import { TranslationProvider } from '../types.js';
import type { TranslationResponse } from '../types.js';

export class DeepLXVercelProvider extends TranslationProvider {
  name = 'deeplx-vercel';

  // Dynamic language support from DeepLX package
  private supportedLanguages = new Set(
    SUPPORTED_LANGUAGES.map(lang => lang.code.toLowerCase())
  );

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResponse> {
    const response = await fetch(`${process.env.DEEPLX_VERCEL_URL}/translate`, {
      method: 'POST',
      body: JSON.stringify({ 
        text,
        target_lang: targetLang,
        source_lang: sourceLang
       }),
    });
    if (!response.ok) {
      throw new Error(`DeepLX Vercel API error: ${response.statusText}`);
    }
    const data = await response.json() as { code: number, data: string, source_lang: string, target_lang: string };
    if (data.code !== 200) {
      throw new Error(`DeepLX Vercel API error: ${JSON.stringify(data)}`);
    }
    return {
      text: data.data,
      source_lang: data.source_lang,
      target_lang: data.target_lang,
      provider: 'deepl'
    };
  }
  supportsLanguage(languageCode: string): boolean {
    return this.supportedLanguages.has(languageCode.toLowerCase());
  }

  isAvailable(): boolean {
    return !!process.env.DEEPLX_VERCEL_URL;
  }
} 