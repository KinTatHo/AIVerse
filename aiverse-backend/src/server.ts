import express, { Request, Response, Application } from 'express';
import prisma from './lib/prisma';
import cors from 'cors';
import cron from 'node-cron';
import { fetchAndSaveAiNews } from './services/newsApiFetcher';
import { fetchAndSaveYouTubeVideos } from './services/youtubeFetcher';

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

// --- News API Route ---
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

// --- Videos API Route ---
app.get('/api/videos', async (req: Request, res: Response) => {
    try {
      const videos = await prisma.youTubeVideo.findMany({
        orderBy: { publishedAt: 'desc' },
        take: 20, // Adjust limit as needed
      });
      res.json(videos);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
      res.status(500).json({ error: 'Failed to retrieve videos from database.' });
    }
});

// 1. News Fetch (Every Hour) - Keep this
cron.schedule('0 * * * *', async () => { // Runs at the start of every hour
    console.log(`[${new Date().toISOString()}] Running scheduled AI news fetch...`);
    try {
      const result = await fetchAndSaveAiNews();
      console.log(`[${new Date().toISOString()}] Scheduled news fetch finished. Fetched: ${result.fetched}, Saved/Updated: ${result.saved}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Scheduled news fetch failed:`, error);
    }
  }, {
    scheduled: true,
    timezone: "America/Santiago" // Set your timezone
  });
  console.log('News fetch job scheduled to run every hour.');
  
  
  // 2. YouTube Video Fetch (Every 6 Hours) - Add this
  cron.schedule('*/5 * * * *', async () => { // Temporary: Every 5 mins for testing
    const jobStartTime = new Date().toISOString();
    console.log(`[${jobStartTime}] Cron Job Triggered: Running scheduled YouTube video fetch...`);
    try {
      // Optional check: Verify ENV VARs are loaded in this context
      console.log(`[${jobStartTime}] Cron Check: YT Key Loaded: ${!!process.env.YOUTUBE_API_KEY}, DB URL Loaded: ${!!process.env.DATABASE_URL}`);
  
      const result = await fetchAndSaveYouTubeVideos(); // This function needs good internal logging too
  
      console.log(`[${new Date().toISOString()}] Cron Job Success: YouTube fetch finished. Fetched: ${result.fetched}, Saved: ${result.saved}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Cron Job FAILED: YouTube fetch failed:`, error); // Log the specific error
    } finally {
       console.log(`[${new Date().toISOString()}] Cron Job Attempt Finished.`); // Log completion regardless of outcome
    }
  }, {
    scheduled: true,
    timezone: "America/Santiago" // Set your timezone
  });
  console.log('YouTube video fetch job scheduled to run every 6 hours.');
  



app.listen(PORT, () => {
    console.log(`AIVerse backend is running on http://localhost:${PORT}`);
    // Run fetch once immediately on server start
    console.log('Running initial news fetch on server start...');
    fetchAndSaveAiNews().catch(error => console.error('Initial fetch failed:', error));
});       