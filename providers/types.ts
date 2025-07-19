export interface TranslationRequest {
  text: string;
  source_lang?: string;
  target_lang: string;
}

export interface TranslationResponse {
  text: string;
  source_lang?: string;
  target_lang: string;
  provider: string;
}

// Abstract translation provider interface
export abstract class TranslationProvider {
  abstract name: string;
  abstract translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResponse>;
} 