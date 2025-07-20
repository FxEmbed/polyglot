import { TranslationService } from './translation.js';
import type { TranslationRequest } from './providers/index.js';

const translationService = new TranslationService();

const server = Bun.serve({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3220,
  async fetch(req) {
    const url = new URL(req.url);
    
    if (url.pathname === "/translate" && req.method === "POST") {
      try {
        const body = await req.json() as TranslationRequest;
        const { text, source_lang, target_lang } = body;
        
        if (!text || !target_lang) {
          return new Response("Missing text or target_lang parameter", {
            status: 400,
            headers: {
              "Content-Type": "text/plain",
            },
          });
        }
        
        const result = await translationService.translate(text, target_lang, source_lang);
        
        return new Response(JSON.stringify(result), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Translation error:", error);
        return new Response(JSON.stringify({
          error: "Translation failed",
          message: error instanceof Error ? error.message : "Unknown error"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    }
    
    return new Response("Not Found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  },
});

console.log(`🗣️ Ready to translate (http://localhost:${server.port})`);