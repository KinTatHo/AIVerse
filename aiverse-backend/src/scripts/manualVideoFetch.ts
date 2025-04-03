// src/scripts/manualVideoFetch.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env' }); // Load .env variables explicitly

// --- Keep the rest of your imports ---
import { fetchAndSaveYouTubeVideos } from '../services/youtubeFetcher';
import prisma from '../lib/prisma';

async function runManualVideoFetch() {
    console.log('Starting manual YouTube video fetch...');
    // Log the DATABASE_URL to verify it's loaded (optional)
    // console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'Yes' : 'No');
    // console.log('YOUTUBE_API_KEY loaded:', process.env.YOUTUBE_API_KEY ? 'Yes' : 'No');
    try {
        const result = await fetchAndSaveYouTubeVideos();
        console.log(`Manual video fetch complete. Fetched: ${result.fetched}, Saved/Updated: ${result.saved}`);
    } catch (error) {
        console.error('Manual video fetch process error:', error);
    } finally {
        await prisma.$disconnect();
        console.log('Prisma disconnected.');
    }
}

runManualVideoFetch();