# AIVerse

## The Ultimate Aggregator for AI & Tech News, Videos, and Trends

AIVerse brings together the latest developments in artificial intelligence and technology from across the web into a single, streamlined platform. Stay informed on cutting-edge innovations, industry trends, and breakthrough technologies all in one place.

![AIVerse Banner](./public/images/aiverse-banner.png)

## Project Overview

AIVerse is built using a robust Node.js backend with Express.js framework and PostgreSQL database, providing a scalable and maintainable foundation for content aggregation and delivery.

## Features

- **Comprehensive News Aggregation**: Curated articles from leading tech publications
- **Video Content Hub**: Latest tech talks, demos, and reviews from multiple platforms
- **Trend Analysis Dashboard**: Data-visualization of emerging technologies and market movements
- **Personalized Feed Algorithm**: Custom content based on user preferences and behavior
- **Advanced Search**: Semantic search functionality for precise content discovery
- **Responsive Design**: Optimized for all devices and screen sizes

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Task Scheduling**: node-cron for automated content fetching

### Frontend (If applicable)
- **Framework**: React/Next.js
- **State Management**: Redux/Context API
- **Styling**: Tailwind CSS/Styled Components

## Project Structure

```
AIVerse/
├── src/
│   ├── config/           # Configuration files and environment variables
│   ├── controllers/      # Request handlers
│   ├── models/           # Database models and schemas
│   ├── routes/           # API routes
│   ├── services/         # Business logic and external API integrations
│   │   ├── fetchers/     # Services for fetching from external sources
│   │   ├── parsers/      # Content parsing utilities
│   │   └── schedulers/   # Cron job schedulers
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── app.ts            # Express application setup
├── prisma/               # Prisma schema and migrations
├── public/               # Static assets
├── tests/                # Test files
├── .env                  # Environment variables
├── .gitignore            # Git ignore file
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/kintatho/AIVerse.git
cd AIVerse
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your database connection string and API keys
```

4. Set up the database
```bash
npx prisma migrate dev
```

5. Start the development server
```bash
npm run dev
# or
yarn dev
```

6. Your server should now be running at `http://localhost:3000`

## Database Schema

The PostgreSQL database uses the following core models:

- **Article**: News articles from various sources
- **Video**: Video content from platforms like YouTube
- **Source**: Information about content sources
- **Category**: Content categorization
- **User**: User information and preferences (if implementing user accounts)

## API Endpoints

### News Endpoints
- `GET /api/news` - Get latest news articles
- `GET /api/news/trending` - Get trending news
- `GET /api/news/category/:category` - Get news by category

### Video Endpoints
- `GET /api/videos` - Get latest videos
- `GET /api/videos/trending` - Get trending videos
- `GET /api/videos/category/:category` - Get videos by category

### Search Endpoint
- `GET /api/search?q=:query` - Search across all content types

## External APIs Integration

AIVerse integrates with various external APIs to aggregate content:

- **News APIs**: NewsAPI, The Guardian, New York Times
- **Video APIs**: YouTube Data API, Vimeo API
- **Social Media**: Twitter API for trend analysis
- **Tech Platforms**: GitHub API, Stack Overflow API

## Deployment

### Production Setup
1. Build the TypeScript project
```bash
npm run build
# or
yarn build
```

2. Start the production server
```bash
npm start
# or
yarn start
```

### Hosting Options
- **Heroku**: Easy deployment with PostgreSQL add-on
- **DigitalOcean**: App Platform or Droplets for more control
- **AWS**: EC2 instances or Elastic Beanstalk
- **Railway.app**: Simple deployment with built-in PostgreSQL

## Future Roadmap

- [ ] User authentication and personalized feeds
- [ ] Machine learning recommendation system
- [ ] Real-time notifications for breaking news
- [ ] Mobile application development
- [ ] AI-summarization of lengthy articles
- [ ] Newsletter integration
- [ ] Community features and discussion forums

## Contributing

We welcome contributions to AIVerse! Please check out our [contributing guidelines](CONTRIBUTING.md) for details on how to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- Website: [aiverse.tech](https://aiverse.tech)
- Email: hello@aiverse.tech
- Twitter: [@AIVerseHQ](https://twitter.com/AIVerseHQ)

---

© 2025 AIVerse. All Rights Reserved.