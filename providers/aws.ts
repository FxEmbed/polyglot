import { TranslationProvider } from './types.js';
import type { TranslationResponse } from './types.js';

interface AWSTranslateResponse {
  TranslatedText: string;
  SourceLanguageCode: string;
  TargetLanguageCode: string;
}

export class AWSProvider extends TranslationProvider {
  name = 'aws';

  // AWS Translate supported languages
  // https://docs.aws.amazon.com/translate/latest/dg/what-is-languages.html
  private supportedLanguages = new Set([
    'af', 'sq', 'am', 'ar', 'hy', 'az', 'bn', 'bs', 'bg', 'ca', 'zh', 'zh-tw', 'hr', 'cs', 'da', 'fa-af', 
    'nl', 'en', 'et', 'fa', 'tl', 'fi', 'fr', 'fr-ca', 'ka', 'de', 'el', 'gu', 'ht', 'ha', 'he', 'hi', 
    'hu', 'is', 'id', 'ga', 'it', 'ja', 'kn', 'kk', 'ko', 'lv', 'lt', 'mk', 'ms', 'ml', 'mt', 'mr', 'mn', 
    'no', 'ps', 'pl', 'pt', 'pt-pt', 'pa', 'ro', 'ru', 'sr', 'si', 'sk', 'sl', 'so', 'es', 'es-mx', 'sw', 
    'sv', 'ta', 'te', 'th', 'tr', 'uk', 'ur', 'uz', 'vi', 'cy'
  ]);

  private async sign(stringToSign: string, key: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const dataToSign = encoder.encode(stringToSign);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataToSign);
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // 💀
  // https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv-create-signed-request.html
  private async createAuthHeader(
    method: string,
    url: string,
    headers: Record<string, string>,
    payload: string,
    accessKey: string,
    secretKey: string,
    region: string
  ): Promise<string> {
    const urlObj = new URL(url);
    const host = urlObj.hostname;
    const path = urlObj.pathname;
    
    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const date = timestamp.substr(0, 8);
    
    // Create canonical request
    const canonicalHeaders = Object.entries(headers)
      .map(([key, value]) => `${key.toLowerCase()}:${value}`)
      .sort()
      .join('\n') + '\n';
    
    const signedHeaders = Object.keys(headers)
      .map(key => key.toLowerCase())
      .sort()
      .join(';');
    
    const payloadHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
    const payloadHashHex = Array.from(new Uint8Array(payloadHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const canonicalRequest = [
      method,
      path,
      '', // query string (empty for POST)
      canonicalHeaders,
      signedHeaders,
      payloadHashHex
    ].join('\n');
    
    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${date}/${region}/translate/aws4_request`;
    const canonicalRequestHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest));
    const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const stringToSign = [
      algorithm,
      timestamp,
      credentialScope,
      canonicalRequestHashHex
    ].join('\n');
    
    // Calculate signature
    const kDate = await this.sign(date, `AWS4${secretKey}`);
    const kRegion = await this.sign(region, kDate);
    const kService = await this.sign('translate', kRegion);
    const kSigning = await this.sign('aws4_request', kService);
    const signature = await this.sign(stringToSign, kSigning);
    
    return `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  }

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResponse> {
    const accessKey = process.env.AWS_ACCESS_KEY_ID;
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'us-east-1';

    if (!accessKey || !secretKey) {
      throw new Error('AWS credentials not configured');
    }

    const url = `https://translate.${region}.amazonaws.com/`;
    const payload = JSON.stringify({
      Text: text,
      SourceLanguageCode: sourceLang || 'auto',
      TargetLanguageCode: targetLang
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSShineFrontendService_20170701.TranslateText',
      'Host': `translate.${region}.amazonaws.com`,
      'X-Amz-Date': new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '')
    };

    const authHeader = await this.createAuthHeader(
      'POST',
      url,
      headers,
      payload,
      accessKey,
      secretKey,
      region
    );

    headers['Authorization'] = authHeader;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: payload
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AWS Translate API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as AWSTranslateResponse;

    if (!data.TranslatedText) {
      throw new Error('Invalid response from AWS Translate API');
    }

    return {
      text: data.TranslatedText,
      source_lang: sourceLang || data.SourceLanguageCode || 'auto',
      target_lang: targetLang,
      provider: this.name
    };
  }

  supportsLanguage(languageCode: string): boolean {
    const normalized = languageCode.toLowerCase();
    // Handle common variations
    if (normalized === 'zh-cn') return this.supportedLanguages.has('zh');
    if (normalized === 'zh-tw') return this.supportedLanguages.has('zh-tw');
    return this.supportedLanguages.has(normalized);
  }

  isAvailable(): boolean {
    return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  }

  isFree(): boolean {
    return false;
  }
}