# 🌍 Polyglot - Scalable Translation Service

A fast, reliable, and modular translation API designed to meet the scale required by FxEmbed.

## 🔄 Native Multi-Provider Architecture

We support both scraping free translations from popular services like Google Translate, Bing Translate, and DeepL, as well as paid APIs such as Azure, DeepL API
- 🎯 **Dynamic Selection**: Chooses between providers based on target language and availability
- ⚖️ **Load Balancing and Rate Limit Leveling**: Distributes requests across providers
- 🛡️ **Automatic Failover**: If one provider fails, automatically tries others
- 🐍 **Designed to Scale**: Use higher rate limits for free services by scaling across servers and network providers

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) runtime installed

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd polyglot

# Install dependencies
bun install

# Start the server
bun run index.ts
```

The API will be available at `http://localhost:3000`

### Optional: Configure Paid APIs

Relying on free services alone is not ideal since requests can be throttled or blocked (DeepL in particular is very aggressive at this). So we support a variety of paid translation providers, which luckily have free tiers:
Azure AI Translator - 2M characters free per month
DeepL - 500K characters free per month
AWS - 2M characters free per month, 12 months only

```
# Azure AI Translator 
AZURE_TRANSLATOR_KEY="your_azure_key"
AZURE_TRANSLATOR_REGION="eastus"

# DeepL Official API  
DEEPL_API_KEY="your_deepl_key"

# DeepLX Cloudflare Worker (if deployed)
DEEPLX_CLOUDFLARE_URL="https://deeplx.example.workers.dev"

# AWS Translate
AWS_ACCESS_KEY_ID="your_access_key_id"
AWS_SECRET_ACCESS_KEY="your_access_key"
AWS_REGION="your_region" # optional, defaults to us-east-1
```

**Note**: Free providers (Google Translate, Bing, DeepLX) work without configuration. Paid APIs are only used if environment variables are provided.

## 📖 API Usage

### Translate Text

**Endpoint:** `POST /translate`

**Request Body:**
```json
{
  "text": "Hello, world!",
  "target_lang": "es",
  "source_lang": "en"  // Optional - auto-detected if not provided
}
```

**Response:**
```json
{
  "text": "¡Hola Mundo!",
  "source_lang": "en",
  "target_lang": "es",
  "provider": "google"
}
```

### Example with cURL

```bash
# Basic translation, auto detect language
curl -X POST http://localhost:3220/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, world!", "target_lang": "es"}'

# With source language specified
curl -X POST http://localhost:3220/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Bonjour le monde", "source_lang": "fr", "target_lang": "en"}'
```

## 📄 License

This project is licensed under AGPL
