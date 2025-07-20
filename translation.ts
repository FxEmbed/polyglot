import { TranslationProvider, GoogleTranslateProvider, DeepLXProvider, DeepLXCloudflareProvider, BingTranslateProvider, AzureProvider, DeepLProvider, DeepLXVercelProvider, AWSProvider, LibreTranslateProvider } from './providers/index.js';
import type { TranslationResponse } from './providers/index.js';

export class TranslationService {
  private allProviders: TranslationProvider[] = [
    new GoogleTranslateProvider(),
    new DeepLXProvider(),
    new DeepLXCloudflareProvider(),
    new DeepLXVercelProvider(),
    new BingTranslateProvider(),
    new AzureProvider(),
    new DeepLProvider(),
    new AWSProvider(),
    new LibreTranslateProvider(),
  ];

  private availableProviders: TranslationProvider[];

  constructor() {
    // Only include providers that are available (have required configuration)
    this.availableProviders = this.allProviders.filter(provider => {
      const isAvailable = provider.isAvailable();
      if (!isAvailable) {
        console.log(`Provider ${provider.name} not configured`);
      }
      return isAvailable;
    });

    console.log(`Initialized with ${this.availableProviders.length} available providers: ${this.availableProviders.map(p => p.name).join(', ')}`);
  }

  // Get providers that support the target language
  private getProvidersForLanguage(targetLang: string): TranslationProvider[] {
    return this.availableProviders.filter(provider => {
      const supports = provider.supportsLanguage(targetLang);
      if (!supports) {
        console.log(`Provider ${provider.name} does not support language: ${targetLang}`);
      }
      return supports;
    });
  }

  // Get random provider from language-compatible providers
  private getRandomProvider(targetLang: string): TranslationProvider | null {
    const compatibleProviders = this.getProvidersForLanguage(targetLang);
    if (compatibleProviders.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * compatibleProviders.length);
    return compatibleProviders[randomIndex] || null;
  }

  // Get other providers (for fallback) that support the language
  private getOtherProviders(excludeProvider: TranslationProvider, targetLang: string): TranslationProvider[] {
    return this.getProvidersForLanguage(targetLang).filter(provider => provider !== excludeProvider);
  }

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResponse> {
    const primaryProvider = this.getRandomProvider(targetLang);
    
    if (!primaryProvider) {
      throw new Error(`No providers available for language: ${targetLang}`);
    }

    const fallbackProviders = this.getOtherProviders(primaryProvider, targetLang);

    // Try primary provider
    try {
      console.log(`Attempting translation with ${primaryProvider.name}`);
      return await primaryProvider.translate(text, targetLang, sourceLang);
    } catch (error) {
      console.error(`${primaryProvider.name} failed:`, error);

      // Try fallback providers so at least we get SOMETHING
      for (const provider of fallbackProviders) {
        try {
          console.log(`Falling back to ${provider.name}`);
          return await provider.translate(text, targetLang, sourceLang);
        } catch (fallbackError) {
          console.error(`${provider.name} fallback failed:`, fallbackError);
        }
      }

      // well this sucks lol
      throw new Error('All translation providers failed');
    }
  }
} 