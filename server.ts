import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateQuizWithGemini, checkRateLimit } from './src/server/geminiService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Body parsers with sufficient capacity for multi-page documents and base64 files
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Quizora AI API',
    timestamp: new Date().toISOString(),
    hasKeyConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

// Quiz Generation API Endpoint
app.post('/api/generate', async (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1';

  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait a minute before generating another quiz.',
    });
  }

  try {
    const { config, material } = req.body;

    if (!config || !material) {
      return res.status(400).json({
        error: 'Missing required configuration or material.',
      });
    }

    const hasText = material.textNotes && material.textNotes.trim().length > 10;
    const hasFiles = material.files && material.files.length > 0;
    const hasTopic = material.topic && material.topic.trim().length > 3;

    if (!hasText && !hasFiles && !hasTopic) {
      return res.status(400).json({
        error: 'Please provide notes, upload a study document, or enter a topic to generate questions from.',
      });
    }

    const quiz = await generateQuizWithGemini(config, material);
    return res.json(quiz);
  } catch (error: unknown) {
    const err = error as { message?: string };
    const message = err?.message || 'Failed to generate quiz.';
    const isApiKeyError = message.includes('GEMINI_API_KEY');

    return res.status(isApiKeyError ? 401 : 500).json({
      error: message,
      isApiKeyMissing: isApiKeyError,
    });
  }
});

// Setup Vite middleware in development or serve static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built assets from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Quizora AI running at http://0.0.0.0:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
