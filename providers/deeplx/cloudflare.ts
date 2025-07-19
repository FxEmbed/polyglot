import { TranslationProvider } from '../types.js';
import type { TranslationResponse } from '../types.js';

export class DeepLXCloudflareProvider extends TranslationProvider {
  name = 'deeplx-cloudflare';

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
      text: data.data,
      source_lang: data.source_lang,
      target_lang: data.target_lang,
      provider: 'deepl'
    };
  }
} 