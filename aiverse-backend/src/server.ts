import express, { Request, Response, Application } from 'express';
import prisma from './lib/prisma';
import cors from 'cors';
import cron from 'node-cron';
import { fetchAndSaveAiNews } from './services/newsApiFetcher';

const app: Application = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ["GET", "POST", "PUT", "DELETE"],
 }));

app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.get('/api/news', async (req: Request, res: Response) => {
  try {
    const articles = await prisma.newsArticle.findMany({
      orderBy: {
        publishedAt: 'desc',
      },
      take: 20,
    });
    res.json(articles);
  } catch (error) {
    console.error("Failed to fetch news:", error);
    res.status(500).json({ error: 'Failed to retrieve news articles from database.' });
  }
});

// --- Scheduled Task ---
// Schedule fetchAndSaveAiNews to run every hour (at the start of the hour)
// Cron format: 'minute hour day(month) month day(week)'
// '0 * * * *' means at minute 0 of every hour
cron.schedule('0 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Running scheduled AI news fetch...`);
    try {
      const result = await fetchAndSaveAiNews();
      console.log(`[${new Date().toISOString()}] Scheduled fetch finished. Fetched: ${result.fetched}, Saved/Updated: ${result.saved}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Scheduled fetch failed:`, error);
    }
  }, {
    scheduled: true,
    timezone: "America/Santiago" // Optional: Set your timezone (Chile/Santiago)
  });

console.log('News fetch job scheduled to run every hour.');



app.listen(PORT, () => {
    console.log(`AIVerse backend is running on http://localhost:${PORT}`);
    // Run fetch once immediately on server start
    console.log('Running initial news fetch on server start...');
    fetchAndSaveAiNews().catch(error => console.error('Initial fetch failed:', error));
});       