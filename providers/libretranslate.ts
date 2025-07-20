import { TranslationProvider } from './types.js';
import type { TranslationResponse } from './types.js';

interface LibreTranslateLanguage {
  code: string;
  name: string;
}

interface LibreTranslateResponse {
  translatedText: string;
}

export class LibreTranslateProvider extends TranslationProvider {
  name = 'libretranslate';
  
  private supportedLanguages = new Set<string>();
  private languagesFetched = false;

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResponse> {
    const url = process.env.LIBRETRANSLATE_URL;
    
    if (!url) {
      throw new Error('LIBRETRANSLATE_URL environment variable not set');
    }

    const apiKey = process.env.LIBRETRANSLATE_API_KEY;
    const baseUrl = url.endsWith('/') ? url : url + '/';
    
    const params = new URLSearchParams({
      q: text,
      source: sourceLang || 'auto',
      target: targetLang,
    });

    if (apiKey) {
      params.append('api_key', apiKey);
    }

    const response = await fetch(`${baseUrl}translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LibreTranslate API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as LibreTranslateResponse;

    if (!data.translatedText) {
      throw new Error('Invalid response from LibreTranslate API');
    }

    return {
      translated_text: data.translatedText,
      source_lang: sourceLang || 'auto',
      target_lang: targetLang,
      provider: this.name
    };
  }

  supportsLanguage(languageCode: string): boolean {
    return this.supportedLanguages.has(languageCode.toLowerCase()) || languageCode === 'auto';
  }

  isAvailable(): boolean {
    if (!process.env.LIBRETRANSLATE_URL) {
      return false;
    }

    // Ensure languages are pre-loaded
    if (!this.languagesFetched) {
      this.fetchLanguages();
    }

    return true;
  }

  // FIXME: Figure out a way to slot LibreTranslate in between free and paid providers
  // Translation quality is hit or miss depending on language
  isFree(): boolean {
    return false;
  }

  getMaxTextLength(): number {
    // LibreTranslate usually limits to 2000, but can be configured higher
    return 2000;
  }

  // No known constraints on text type
  supportsText(text: string): boolean {
    return true;
  }

  private async fetchLanguages(): Promise<void> {
    if (this.languagesFetched) {
      return;
    }
    try {
      const url = process.env.LIBRETRANSLATE_URL;
      if (!url) {
        return;
      }

      const baseUrl = url.endsWith('/') ? url : url + '/';
      const apiKey = process.env.LIBRETRANSLATE_API_KEY;
      
      let languagesUrl = `${baseUrl}languages`;
      if (apiKey) {
        languagesUrl += `?api_key=${encodeURIComponent(apiKey)}`;
      }

      const response = await fetch(languagesUrl);
      
      if (response.ok) {
        const languages = await response.json() as LibreTranslateLanguage[];
        this.supportedLanguages = new Set(
          languages.map(lang => lang.code.toLowerCase())
        );
      } else {
        // Fallback to common languages if API call fails
        this.supportedLanguages = new Set([
          'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 
          'ar', 'hi', 'tr', 'pl', 'nl', 'sv', 'da', 'no', 'fi', 'cs'
        ]);
      }
    } catch (error) {
      console.warn('Failed to fetch LibreTranslate languages, using fallback list:', error);
      // Fallback to common languages
      this.supportedLanguages = new Set([
        'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 
        'ar', 'hi', 'tr', 'pl', 'nl', 'sv', 'da', 'no', 'fi', 'cs'
      ]);
    } finally {
      this.languagesFetched = true;
    }
  }
}