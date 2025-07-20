import { translate as googleTranslate } from '@vitalets/google-translate-api';
import { TranslationProvider } from './types.js';
import type { TranslationResponse } from './types.js';
import type { TranslateOptions } from '@vitalets/google-translate-api/dist/cjs/types.js';

export class GoogleTranslateProvider extends TranslationProvider {
  name = 'google';

  // Google Translate supported languages (comprehensive list)
  // Note: This is manually maintained as Google Translate API doesn't export language constants
  // Based on official Google Translate documentation as of 2024
  private supportedLanguages = new Set([
    'auto', 'af', 'ak', 'sq', 'am', 'ar', 'hy', 'as', 'ay', 'az', 'bm', 'eu', 'be', 'bn', 'bho', 'bs', 'bg', 
    'ca', 'ceb', 'ny', 'zh', 'zh-cn', 'zh-tw', 'co', 'hr', 'cs', 'da', 'dv', 'doi', 'nl', 'en', 'eo', 'et', 
    'ee', 'tl', 'fi', 'fr', 'fy', 'gl', 'ka', 'de', 'el', 'gn', 'gu', 'ht', 'ha', 'haw', 'he', 'hi', 'hmn', 
    'hu', 'is', 'ig', 'ilo', 'id', 'ga', 'it', 'ja', 'jw', 'kn', 'kk', 'km', 'rw', 'gom', 'ko', 'kri', 'ku', 
    'ckb', 'ky', 'lo', 'la', 'lv', 'ln', 'lt', 'lg', 'lb', 'mk', 'mai', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 
    'mni-mtei', 'lus', 'mn', 'my', 'ne', 'no', 'or', 'om', 'ps', 'fa', 'pl', 'pt', 'pa', 'qu', 'ro', 'ru', 
    'sm', 'sa', 'gd', 'nso', 'sr', 'st', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'es', 'su', 'sw', 'sv', 'tg', 
    'ta', 'tt', 'te', 'th', 'ti', 'ts', 'tr', 'tk', 'ak', 'uk', 'ur', 'ug', 'uz', 'vi', 'cy', 'xh', 'yi', 
    'yo', 'zu'
  ]);

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResponse> {
    const options: TranslateOptions = { to: targetLang };
    if (sourceLang) {
      options.from = sourceLang;
    }
    
    const result = await googleTranslate(text, options);
    return {
      translated_text: result.text,
      source_lang: sourceLang,
      target_lang: targetLang,
      provider: 'google'
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

  getMaxTextLength(): number {
    return 5000;
  }
} 