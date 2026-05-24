# RoastMyBlog

Ever written something and wondered if it's actually any good? This tool will tell you—honestly. Submit your blog post or article, and get honest AI-powered feedback on what's working and what needs work.

## What It Does

RoastMyBlog analyzes your written content and provides critical, constructive feedback. You can:

- Paste a blog URL and get it analyzed
- Get AI feedback on writing quality, clarity, and engagement
- Track your analysis history
- See what you've improved over time

The roasting is real but fair—designed to help you write better, not just make you feel bad.

## Tech Stack

- **Next.js 15** - Modern React framework with full-stack capabilities
- **React 19** - For building interactive interfaces
- **TypeScript** - Type-safe development
- **MongoDB** - Database for storing analysis history
- **Google Generative AI & Groq SDK** - Two powerful AI models for better analysis
- **Web Scraping** - Cheerio, JSDOM, and Readability to extract blog content
- **Tailwind CSS** - Clean, utility-first styling

## Getting Started

### Prerequisites

Make sure you have Node.js installed. Grab it from [nodejs.org](https://nodejs.org) if you need it.

You'll also need:
- MongoDB instance (local or Atlas)
- Google Generative AI API key
- Groq API key

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env.local` file in the root directory:

```
MONGODB_URI=your_mongodb_connection_string
GOOGLE_API_KEY=your_google_generative_ai_key
GROQ_API_KEY=your_groq_api_key
```

### Running It

Start the dev server:

```bash
npm run dev
```

Head to [http://localhost:3000](http://localhost:3000) to start roasting some blogs.

## Project Structure

```
src/
├── app/          # Pages and API routes
├── analyzers/    # AI analysis logic
├── components/   # React components
├── services/     # External service integrations
├── models/       # MongoDB schemas
├── lib/          # Utilities and helpers
├── types/        # TypeScript definitions
├── utils/        # Common utilities
public/           # Static assets
```

## How It Works

1. **Input** - You provide a blog URL or paste content
2. **Scraping** - The app fetches and extracts the blog content
3. **Analysis** - AI models analyze the writing for quality, clarity, structure, and engagement
4. **Output** - You get feedback with specific suggestions for improvement

The app uses both Google Generative AI and Groq to give you multiple perspectives, ensuring the feedback is balanced and useful.

## Available Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Check code quality

## Recent Changes

This project was recently upgraded from a separate client/server architecture to a unified Next.js full-stack application. The functionality remains the same—faster, cleaner codebase.

See [MIGRATION.md](MIGRATION.md) for details about what changed under the hood.

## Features

- **AI-Powered Analysis** - Using cutting-edge language models
- **Web Scraping** - Analyze blogs from URLs directly
- **History Tracking** - Keep a record of your analyses
- **Multiple AI Models** - Get feedback from different perspectives
- **Real-Time** - Quick feedback without waiting around

## Tips for Best Results

- Submit complete blog posts (not just snippets) for better analysis
- Update your URLs to the most recent version of your post
- Read the feedback carefully—it's designed to be actionable
- Use the suggestions to iterate and improve

## Troubleshooting

**API keys not working?** Make sure they're in `.env.local` and restart the dev server.

**MongoDB connection failing?** Check your connection string and network access if using Atlas.

**Blog not loading?** Some sites block scraping. Try a different blog to test.

---

Ready to see what your blog really needs? Fire it up and find out.
