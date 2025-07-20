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

  // Get providers that support the target language and can handle the text length, separated by free/paid
  private getProvidersForLanguage(targetLang: string, text: string): { free: TranslationProvider[], paid: TranslationProvider[] } {
    const compatibleProviders = this.availableProviders.filter(provider => {
      const supportsLanguage = provider.supportsLanguage(targetLang);
      const canHandleText = provider.supportsText(text);
      const canHandleLength = provider.getMaxTextLength() >= text.length;
      
      if (!supportsLanguage) {
        console.log(`Provider ${provider.name} does not support language: ${targetLang}`);
      }
      if (!canHandleLength) {
        console.log(`Provider ${provider.name} cannot handle text length ${text.length} (max: ${provider.getMaxTextLength()})`);
      }
      if (!canHandleText) {
        console.log(`Provider ${provider.name} cannot handle text: ${text}`);
      }
      
      return supportsLanguage && canHandleLength && canHandleText;
    });

    const free = compatibleProviders.filter(provider => provider.isFree());
    const paid = compatibleProviders.filter(provider => !provider.isFree());

    return { free, paid };
  }

  private selectProvider(targetLang: string, text: string): TranslationProvider | null {
    const { free, paid } = this.getProvidersForLanguage(targetLang, text);
    
    // Prefer free providers first
    if (free.length > 0) {
      const randomIndex = Math.floor(Math.random() * free.length);
      console.log(`Selected free provider: ${free[randomIndex]?.name} (${free.length} free providers available)`);
      return free[randomIndex] || null;
    }
    
    // Fall back to paid providers if no free ones available
    if (paid.length > 0) {
      const randomIndex = Math.floor(Math.random() * paid.length);
      console.log(`No free providers available, using paid provider: ${paid[randomIndex]?.name} (${paid.length} paid providers available)`);
      return paid[randomIndex] || null;
    }
    
    return null;
  }

  // Get other providers for fallback, prioritizing free over paid
  private getOtherProviders(excludeProvider: TranslationProvider, targetLang: string, text: string): TranslationProvider[] {
    const { free, paid } = this.getProvidersForLanguage(targetLang, text);
    
    // Remove the excluded provider from both lists
    const availableFree = free.filter(provider => provider !== excludeProvider);
    const availablePaid = paid.filter(provider => provider !== excludeProvider);
    
    // Return free providers first, then paid providers
    return [...availableFree, ...availablePaid];
  }

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResponse> {
    const textLength = text.length;
    const primaryProvider = this.selectProvider(targetLang, text);
    
    if (!primaryProvider) {
      throw new Error(`No providers available for language: ${targetLang}, length ${textLength} chars`);
    }

    const fallbackProviders = this.getOtherProviders(primaryProvider, targetLang, text);

    // Try primary provider
    try {
      console.log(`Attempting translation with ${primaryProvider.name}`);
      return await primaryProvider.translate(text, targetLang, sourceLang);
    } catch (error) {
      console.error(`${primaryProvider.name} failed:`, error);

      // Try fallback providers so at least we get SOMETHING
      for (const provider of fallbackProviders) {
        try {
          console.log(`Falling back to ${provider.name}...`);
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