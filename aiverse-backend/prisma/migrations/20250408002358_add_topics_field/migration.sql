-- AlterTable
ALTER TABLE "NewsArticle" ADD COLUMN     "topics" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "YouTubeVideo" ADD COLUMN     "topics" TEXT[] DEFAULT ARRAY[]::TEXT[];
