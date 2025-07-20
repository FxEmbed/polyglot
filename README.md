# 🗣️ Polyglot - Scalable Translation Service

A fast, reliable, and modular translation API designed to meet the scale required by FxEmbed.

## 🔄 Native Multi-Provider Architecture

We support scraping free translations from popular services like Google Translate, Bing Translate, and DeepL, using official APIs such as Azure AI Translator, DeepL API, and AWS Translate, as well as self-hosted alternative LibreTranslate.

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
- [Azure AI Translator](https://azure.microsoft.com/en-us/products/ai-services/ai-translator) - 2M characters free per month, forever
- [DeepL](https://www.deepl.com/en/pro-api) - 500K characters free per month, forever
- [AWS Translate](https://aws.amazon.com/translate/) - 2M characters free per month, 12 months only

```
# Azure AI Translator 
AZURE_TRANSLATOR_KEY="your_azure_key"
AZURE_TRANSLATOR_REGION="eastus"

# DeepL Official API  
DEEPL_API_KEY="your_deepl_key"

# AWS Translate
AWS_ACCESS_KEY_ID="your_access_key_id"
AWS_SECRET_ACCESS_KEY="your_access_key"
AWS_REGION="your_region" # optional, defaults to us-east-1

# LibreTranslate (self-hosted or public instance)
LIBRETRANSLATE_URL="https://translate.example.com"
LIBRETRANSLATE_API_KEY="your_api_key_if_required" # optional for some instances
```

**Note**: Free providers (Google Translate, Bing, DeepLX) work without configuration.

## 📖 API Usage

### Translate Text

**Endpoint:** `POST /translate`

If you configured an `ACCESS_TOKEN`, please provide it in the `Authorization` header as `Bearer <token>`.

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

## 🐳 Docker Deployment

### Using Docker

```bash
# Pull and run the latest image
docker run -p 3220:3220 ghcr.io/fxembed/polyglot:latest

# Or run with environment variables for paid APIs
docker run -p 3220:3220 \
  -e AZURE_TRANSLATOR_KEY="your_azure_key" \
  -e AZURE_TRANSLATOR_REGION="eastus" \
  -e DEEPL_API_KEY="your_deepl_key" \
  ghcr.io/fxembed/polyglot:latest
```

### Using Docker Compose

Edit the `docker-compose.yml` file to set bound port and your API keys if you want to use paid translation providers.

```bash
# Start the service
docker-compose up -d
```

## 📄 License

This project is licensed under AGPL
