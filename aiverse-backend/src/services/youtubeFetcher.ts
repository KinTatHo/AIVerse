import axios from 'axios';
import prisma from '../lib/prisma';
import { YouTubeVideo } from '@prisma/client';

// --- Configuration ---
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

// List of YouTube Channel IDs known for AI content (Find these on YouTube)
const AI_CHANNEL_IDS = [
    'UCbfYPyITQ-7l4upoX8nvctg', // Two Minute Papers
    'UCKMpcjL1gI4gMqwheajm86g', // Yannic Kilcher
    'UCJUJb1EKvUhCLX4hEWHr42Q', // Lex Clips (AI often discussed)
    // Add more channel IDs here
    'UCSHZKyawb77ixDdsGog4iWA', // Lex Fridman (Full Podcast)
    'UCPqrgba4U1a9SPqnslBEstab', // DeepMind (Less Frequent)
    'UC2J-0g_nxlwcD9JBK1eTleQ', // Marques Brownlee (Less Frequent)
];

// Define the structure we expect from the Youtube API response item's snippet
interface YouTubeApiSnippet {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
        default?: { url: string; width: number; height: number };
        medium?: { url: string; width: number; height: number };
        high?: { url: string; width: number; height: number };
    };
    channelTitle: string;
    liveBroadcastContent: string; // 'none', 'live', 'upcoming'
}

// Define the structure for each item in the search results
interface YouTubeApiSearchItem {
    kind: string;
    etag: string;
    id: {
        kind: string; // e.g., 'youtube#video'
        videoId: string;
    };
    snippet: YouTubeApiSnippet;
}

// Define the structure of the entire Youtube API response
interface YouTubeApiResponse {
    kind: string;
    etag: string;
    nextPageToken?: string;
    regionCode?: string;
    pageInfo: {
        totalResults: number;
        resultsPerPage: number;
    };
    items: YouTubeApiSearchItem[];
}

// Type for the processed video data ready for DB insertion
export type ProcessedYouTubeVideo = Omit<YouTubeVideo, 'id' | 'createdAt' | 'updatedAt' | 'topics'>; // Exclude topics for now

// --- Fetching Logic ---
async function fetchYouTubeVideosForChannel(channelId: string, maxResults = 10): Promise<ProcessedYouTubeVideo[]> {
    if (!YOUTUBE_API_KEY) {
        console.warn(`YouTube API key not configured. Skipping fetch for channel ${channelId}.`);
        return [];
    }

    console.log(`Workspaceing latest videos for YouTube channel ${channelId}...`);
    try {
        const response = await axios.get<YouTubeApiResponse>(YOUTUBE_API_BASE_URL, {
            params: {
                part: 'snippet', // We need snippet info
                channelId: channelId,
                maxResults: maxResults, // Limit results per channel per fetch
                order: 'date', // Get the most recent videos
                type: 'video', // Only search for videos
                key: YOUTUBE_API_KEY,
            },
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'AIVerse Backend Fetcher/1.0'
            }
        });

        if (!response.data || !response.data.items) {
            console.warn(`No items found or invalid response for channel ${channelId}.`);
            return [];
        }

        console.log(`Workspaceed ${response.data.items.length} video items for channel ${channelId}.`);

        // Transform API response to our database model structure
        const processedVideos: ProcessedYouTubeVideo[] = response.data.items
            .filter(item => item.id?.kind === 'youtube#video' && item.snippet && item.id.videoId) // Ensure it's a video with needed data
            .map(item => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description || null,
                channelId: item.snippet.channelId,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt ? new Date(item.snippet.publishedAt) : null,
                // Prefer medium or high thumbnail, fall back to default
                thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || null,
            }));

        return processedVideos;

    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error(`Axios error fetching YouTube data for channel ${channelId}:`, error.response?.data?.error?.message || error.message);
        } else {
            console.error(`Error fetching/processing YouTube data for channel ${channelId}:`, error);
        }
        // Check for quota errors specifically
        if (error.response?.data?.error?.errors?.[0]?.reason === 'quotaExceeded') {
            console.error('!!! YouTube API Quota Exceeded !!!');
            // Consider implementing exponential backoff or stopping further fetches
        }
        return []; // Return empty on error to avoid breaking sequence
    }
}

// --- Saving Logic ---
export async function saveVideosToDb(videos: ProcessedYouTubeVideo[]): Promise<{ count: number }> {
    if (videos.length === 0) {
        console.log('No new YouTube videos to save.');
        return { count: 0 };
    }

    console.log(`Attempting to save ${videos.length} YouTube videos to the database...`);
    let savedCount = 0;
    let failedCount = 0;

    for (const video of videos) {
        try {
            await prisma.youTubeVideo.upsert({
                where: { videoId: video.videoId }, // Use the unique YouTube video ID
                update: { // Fields to update if video exists (e.g., title if it changes)
                    title: video.title,
                    description: video.description,
                    thumbnailUrl: video.thumbnailUrl,
                    // Avoid updating publishedAt unless absolutely necessary
                },
                create: { // Fields to set when creating a new video record
                    videoId: video.videoId,
                    title: video.title,
                    description: video.description,
                    channelId: video.channelId,
                    channelTitle: video.channelTitle,
                    publishedAt: video.publishedAt,
                    thumbnailUrl: video.thumbnailUrl,
                    // topics: [] // Initialize topics if you add the field later
                },
            });
            savedCount++;
        } catch (error: any) {
            failedCount++;
            console.error(`Failed to upsert video (ID: ${video.videoId}): ${video.title}`, error.message);
            // Log Prisma validation errors if needed: error instanceof Prisma.PrismaClientValidationError
        }
    }

    console.log(`Successfully saved/updated ${savedCount} videos. Failed: ${failedCount}.`);
    return { count: savedCount };
}

// --- Combined Fetch and Save Logic ---
export async function fetchAndSaveYouTubeVideos(): Promise<{ fetched: number; saved: number }> {
    console.log('Starting YouTube video fetch and save process...');
    let totalFetched = 0;
    let totalSaved = 0;
    const allProcessedVideos: ProcessedYouTubeVideo[] = [];

    // Fetch videos for each channel sequentially to be nicer to the API
    for (const channelId of AI_CHANNEL_IDS) {
        try {
            // Fetch only a few recent videos per channel to manage quota/processing
            const processedVideos = await fetchYouTubeVideosForChannel(channelId, 5); // Fetch latest 5 videos
            if (processedVideos.length > 0) {
                allProcessedVideos.push(...processedVideos);
            }
            // Optional: Add a small delay between channel fetches
            // await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        } catch (error) {
             console.error(`Failed to process channel ${channelId}:`, error);
             // Continue to next channel even if one fails
        }
    }

    totalFetched = allProcessedVideos.length;

    if (totalFetched > 0) {
        // Remove potential duplicates fetched if a video appears in multiple searches (unlikely with channelId search)
        const uniqueVideos = Array.from(new Map(allProcessedVideos.map(v => [v.videoId, v])).values());
        totalFetched = uniqueVideos.length; // Update count after deduplication

        const saveResult = await saveVideosToDb(uniqueVideos);
        totalSaved = saveResult.count;
    } else {
         console.log("No videos fetched from any channel.");
    }


    console.log('YouTube video fetch and save process finished.');
    return { fetched: totalFetched, saved: totalSaved };
}