import { TranslationProvider, GoogleTranslateProvider, DeepLXProvider, DeepLXCloudflareProvider, BingTranslateProvider } from './providers/index.js';
import type { TranslationResponse } from './providers/index.js';

export class TranslationService {
  private providers: TranslationProvider[] = [
    new GoogleTranslateProvider(),
    new DeepLXProvider(),
    new DeepLXCloudflareProvider(),
    // new DeepLXVercelProvider(),
    new BingTranslateProvider(),
  ];

  // Get random provider
  // TODO: Filter out providers that won't work for this job (i.e. language unsupported, length requirements, etc)
  private getRandomProvider(): TranslationProvider {
    const randomIndex = Math.floor(Math.random() * this.providers.length);
    return this.providers[randomIndex]!;
  }

  // Get other providers (for fallback)
  private getOtherProviders(excludeProvider: TranslationProvider): TranslationProvider[] {
    return this.providers.filter(provider => provider !== excludeProvider);
  }

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResponse> {
    const primaryProvider = this.getRandomProvider();
    const fallbackProviders = this.getOtherProviders(primaryProvider);

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