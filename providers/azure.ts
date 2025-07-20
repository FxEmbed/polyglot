import { TranslationProvider } from './types.js';
import type { TranslationResponse } from './types.js';

interface AzureTranslateResponse {
  translations: Array<{
    text: string;
    to: string;
  }>;
  detectedLanguage?: {
    language: string;
    score: number;
  };
}

export class AzureProvider extends TranslationProvider {
  name = 'azure';

  // Azure Translator supported languages
  // https://learn.microsoft.com/en-us/azure/ai-services/translator/language-support
  private supportedLanguages = new Set([
    'af', 'am', 'ar', 'as', 'az', 'ba', 'bg', 'bn', 'bo', 'bs', 'ca', 'cs', 'cy', 'da', 'de', 'dsb', 'dv', 
    'el', 'en', 'es', 'et', 'eu', 'fa', 'fi', 'fj', 'fo', 'fr', 'fr-ca', 'ga', 'gl', 'gom', 'gu', 'ha', 
    'he', 'hi', 'hr', 'hsb', 'ht', 'hu', 'hy', 'id', 'ig', 'ikt', 'is', 'it', 'iu', 'iu-latn', 'ja', 'ka', 
    'kk', 'km', 'kmr', 'kn', 'ko', 'ks', 'ku', 'ky', 'ln', 'lo', 'lt', 'lug', 'lv', 'lzh', 'mai', 'mg', 
    'mi', 'mk', 'ml', 'mn-cyrl', 'mn-mong', 'mni', 'mr', 'ms', 'mt', 'mww', 'my', 'nb', 'ne', 'nl', 'nso', 
    'nya', 'or', 'otq', 'pa', 'pl', 'prs', 'ps', 'pt', 'pt-pt', 'ro', 'ru', 'run', 'rw', 'sd', 'si', 'sk', 
    'sl', 'sm', 'sn', 'so', 'sq', 'sr-cyrl', 'sr-latn', 'st', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'ti', 
    'tk', 'tlh-latn', 'tlh-piqd', 'tn', 'to', 'tr', 'tt', 'ty', 'ug', 'uk', 'ur', 'uz', 'vi', 'xh', 'yo', 
    'yua', 'yue', 'zh-hans', 'zh-hant', 'zu'
  ]);

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResponse> {
    const apiKey = process.env.AZURE_TRANSLATOR_KEY;
    const region = process.env.AZURE_TRANSLATOR_REGION || 'global';
    const endpoint = process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com';

    if (!apiKey) {
      throw new Error('Azure Translator API key not configured');
    }

    const url = `${endpoint}/translate?api-version=3.0&to=${targetLang}${sourceLang ? `&from=${sourceLang}` : ''}`;
    
    const headers: Record<string, string> = {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Content-Type': 'application/json',
    };

    // Add region header if not global
    if (region !== 'global') {
      headers['Ocp-Apim-Subscription-Region'] = region;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify([{ text }])
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure Translator API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as AzureTranslateResponse[];
    const result = data[0];

    if (!result?.translations?.[0]) {
      throw new Error('Invalid response from Azure Translator API');
    }

    return {
      text: result.translations[0].text,
      source_lang: sourceLang || result.detectedLanguage?.language || 'auto',
      target_lang: targetLang,
      provider: this.name
    };
  }

  supportsLanguage(languageCode: string): boolean {
    return this.supportedLanguages.has(languageCode.toLowerCase());
  }

  isAvailable(): boolean {
    return !!process.env.AZURE_TRANSLATOR_KEY;
  }

  isFree(): boolean {
    return false;
  }
}