import type { IncomingMessage, ServerResponse } from 'http';
import { generateQuizWithGemini, checkRateLimit } from '../src/server/geminiService';
import { QuizConfig, QuizMaterial } from '../src/types/quiz';

interface ExtendedRequest extends IncomingMessage {
  body?: {
    config?: QuizConfig;
    material?: QuizMaterial;
  };
  headers: Record<string, string | string[] | undefined>;
}

interface ExtendedResponse extends ServerResponse {
  status?: (code: number) => ExtendedResponse;
  json?: (data: unknown) => void;
}

export default async function handler(req: ExtendedRequest, res: ExtendedResponse) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed. Use POST.' }));
    return;
  }

  // Rate limiting
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  if (!checkRateLimit(ip)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'Too many requests. Please wait a minute before generating another quiz.',
      })
    );
    return;
  }

  try {
    // Parse body if not parsed by Express/Vercel
    let body = req.body;
    if (!body) {
      body = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => {
          data += chunk;
          if (data.length > 25 * 1024 * 1024) {
            reject(new Error('Payload too large (max 25MB).'));
          }
        });
        req.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error('Invalid JSON request body.'));
          }
        });
        req.on('error', (err) => reject(err));
      });
    }

    const { config, material } = body as { config: QuizConfig; material: QuizMaterial };

    if (!config || !material) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Missing required "config" or "material" payloads.',
        })
      );
      return;
    }

    // Check if material has some text or files
    const hasText = material.textNotes && material.textNotes.trim().length > 10;
    const hasFiles = material.files && material.files.length > 0;
    const hasTopic = material.topic && material.topic.trim().length > 3;

    if (!hasText && !hasFiles && !hasTopic) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Please provide notes, upload a study document, or enter a topic to generate questions from.',
        })
      );
      return;
    }

    const quizResponse = await generateQuizWithGemini(config, material);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(quizResponse));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const isApiKeyError = message.includes('GEMINI_API_KEY');

    res.statusCode = isApiKeyError ? 401 : 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: message,
        isApiKeyMissing: isApiKeyError,
      })
    );
  }
}
