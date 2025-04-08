export interface NewsArticle {
    id: string;
    title: string;
    url: string;
    sourceName: string | null;
    description: string | null;
    publishedAt: string | null;
    imageUrl: string | null;
    topics?: string[];
  }
  
  export interface NewsCardProps {
    article: NewsArticle;
  }
  