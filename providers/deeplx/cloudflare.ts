import { SUPPORTED_LANGUAGES } from 'deeplx';
import { TranslationProvider } from '../types.js';
import type { TranslationResponse } from '../types.js';

export class DeepLXCloudflareProvider extends TranslationProvider {
  name = 'deeplx-cloudflare';

  // Dynamic language support from DeepLX package
  private supportedLanguages = new Set(
    SUPPORTED_LANGUAGES.map(lang => lang.code.toLowerCase())
  );

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResponse> {
    const url = process.env.DEEPLX_CLOUDFLARE_URL;
    if (!url) {
      throw new Error('DEEPLX_CLOUDFLARE_URL is not set');
    }
    const response = await fetch(`${url}/translate`, {
      method: 'POST',
      body: JSON.stringify({ 
        text,
        target_lang: targetLang,
        source_lang: sourceLang
       }),
    });
    const data = await response.json() as { code: number, data: string, source_lang: string, target_lang: string };
    if (data.code !== 200) {
      throw new Error(`DeepLX Cloudflare API error: ${JSON.stringify(data)}`);
    }
    return {
      translated_text: data.data,
      source_lang: data.source_lang,
      target_lang: data.target_lang,
      provider: 'deepl'
    };
  }

  supportsLanguage(languageCode: string): boolean {
    return this.supportedLanguages.has(languageCode.toLowerCase());
  }

  isAvailable(): boolean {
    return !!process.env.DEEPLX_CLOUDFLARE_URL;
  }

  isFree(): boolean {
    return true;
  }

  getMaxTextLength(): number {
    return 5000;
  }

  // No known constraints on text type
  supportsText(text: string): boolean {
    return true;
  }
} 