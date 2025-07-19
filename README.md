# 🌍 Polyglot - Scalable Translation Service

A fast, reliable, and modular translation API that supports multiple translation providers with automatic fallback mechanisms. It uses a mixture of free undocumented APIs as well as official ones requiring API keys. It's been designed to be scalable to meet FxEmbed's needs, intended to run across many web hosting providers behind load balancing to have the highest rate limits possible across different translation services.

## ✨ Features

- 🔄 **Multi-Provider Architecture**: Google Translate, DeepLX, Bing Translate so far, more to come
- ⚖️ **Load Balancing and Rate Limit Leveling**: Distributes requests across providers
- 🛡️ **Automatic Fallback**: If one provider fails, automatically tries others

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
curl -X POST http://localhost:3000/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, world!", "target_lang": "es"}'

# With source language specified
curl -X POST http://localhost:3000/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Bonjour le monde", "source_lang": "fr", "target_lang": "en"}'
```

## 📄 License

This project is licensed under AGPL
