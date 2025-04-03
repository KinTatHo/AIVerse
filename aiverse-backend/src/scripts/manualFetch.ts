import { fetchAndSaveAiNews } from '../services/newsApiFetcher';
import prisma from '../lib/prisma';

async function runManualFetch() {
    console.log('Starting manual fetch and save process...');
    try {
        const result = await fetchAndSaveAiNews();
        console.log(`Manual fetch completed. Fetched: ${result.fetched}, Saved/Updated: ${result.saved}`);
    } catch (error) {
        console.error('Manual fetch process encountered an error:', error);
    } finally {
        await prisma.$disconnect();
        console.log('Prisma client disconnected.');
    }
}

runManualFetch();