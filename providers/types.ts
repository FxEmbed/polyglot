export interface TranslationRequest {
  text: string;
  source_lang?: string;
  target_lang: string;
}

export interface TranslationResponse {
  translated_text: string;
  source_lang?: string;
  target_lang: string;
  provider: string;
}

// Abstract translation provider interface
export abstract class TranslationProvider {
  abstract name: string;
  abstract translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResponse>;
  
  // Check if provider supports a specific language
  abstract supportsLanguage(languageCode: string): boolean;
  
  // Check if provider is available (has required configuration)
  abstract isAvailable(): boolean;
  
  // Check if provider is free (true) or paid (false)
  abstract isFree(): boolean;
  
  // Get maximum text length this provider can handle (in characters)
  abstract getMaxTextLength(): number;
} 