import axios from 'axios';
import { NewsArticle } from '@prisma/client';
import prisma from '../lib/prisma';

interface NewsApiResponseArticle {
    source: { id: string | null; name: string };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
}

interface NewsApiResponse {
    status: string;
    totalResults: number;
    articles: NewsApiResponseArticle[];
}

export type ProcessedArticle = Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt'>;

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2/everything';

export async function fetchAiNewsFromApi(): Promise<ProcessedArticle[]> {
    if (!NEWS_API_KEY) {
        throw new Error('NewsAPI key is not configured in environment variables.');
    }

    console.log('Fetching AI news from NewsAPI...');

    try {
        const response = await axios.get<NewsApiResponse>(NEWS_API_BASE_URL, {
            params: {
                q: '"artificial intelligence" OR "machine learning" OR "AI ethics" OR "LLM" OR "large language model"',
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: 50,
                apiKey: NEWS_API_KEY,
                domains: 'techcrunch.com,wired.com,arstechnica.com,theverge.com'

            },
            headers: {
                'User-Agent': 'AIVerse Backend Fetcher/1.0'
            }
        });

        if (response.data.status !== 'ok') {
            throw new Error(`NewsAPI request failed with status: ${response.data.status}`);
        }

        console.log(`Workspaceed ${response.data.articles.length} articles from NewsAPI.`);

        const processedArticles: ProcessedArticle[] = response.data.articles
            .filter(article => article.url && article.title)
            .map(article => ({
                title: article.title,
                url: article.url,
                sourceName: article.source.name || null,
                description: article.description || null,
                publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
                imageUrl: article.urlToImage || null,
            }));

        return processedArticles;

    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error fetching from NewsAPI:', error.response?.data || error.message);
        } else {
            console.error('Error fetching or processing NewsAPI data:', error);
        }
        return [];
    }
}

export async function saveArticlesToDb(articles: ProcessedArticle[]): Promise<{ count: number }> {
    if (articles.length === 0) {
        console.log('No new articles to save.');
        return { count: 0 };
    }

    console.log(`Attempting to save ${articles.length} articles to the database...`);
    let savedCount = 0;

    for (const article of articles) {
        try {
            await prisma.newsArticle.upsert({
                where: { url: article.url }, // Use the unique URL to check existence
                update: { // Fields to update if the article *already* exists (optional)
                    // title: article.title, // You might want to update fields if they change
                    // description: article.description,
                    // imageUrl: article.imageUrl,
                    // publishedAt: article.publishedAt,
                },
                create: { // Fields to set when creating a *new* article
                    title: article.title,
                    url: article.url,
                    sourceName: article.sourceName,
                    description: article.description,
                    publishedAt: article.publishedAt,
                    imageUrl: article.imageUrl,
                },
            });
            savedCount++;
        } catch (error: any) {
            // Log specific errors, e.g., validation errors from Prisma
            console.error(`Failed to upsert article: ${article.url}`, error.message);
            // Continue with the next article even if one fails
            continue;
        }
    }

    console.log(`Successfully saved/updated ${savedCount} articles.`);
    return { count: savedCount };
}

export async function fetchAndSaveAiNews(): Promise<{ fetched: number; saved: number }> {
    const fetchedArticles = await fetchAiNewsFromApi();
    const saveResult = await saveArticlesToDb(fetchedArticles);
    return { fetched: fetchedArticles.length, saved: saveResult.count };
}