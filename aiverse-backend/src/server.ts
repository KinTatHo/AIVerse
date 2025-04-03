import express, { Request, Response, Application } from 'express';
import prisma from './lib/prisma';
import cors from 'cors';

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


app.listen(PORT, () => {
    console.log(`AIVerse backend is running on http://localhost:${PORT}`);
  });       