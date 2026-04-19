# RoastMyBlog - Next.js Version

## Overview

RoastMyBlog has been successfully converted from a separate client/server architecture (Vite/React + Express) to a unified **Next.js** full-stack application.

### What Changed

**Before:** 
- `client/` - Vite + React frontend
- `server/` - Express backend running on port 4000

**After:**
- Single Next.js 15 project
- Unified codebase with App Router
- API routes at `/api/analyze` and `/api/stats`
- Server-side services integrated into API routes

### Key Features Preserved

✅ **Exact same UI** - All components and styling remain unchanged  
✅ **Same functionality** - Blog analysis, roasting, and improvement suggestions work identically  
✅ **All dependencies installed** - Groq API, MongoDB, web scraping, readability analysis  
✅ **Tailwind CSS v4** - Modern styling pipeline with @tailwindcss/postcss  

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/    # POST endpoint for blog analysis
│   │   └── stats/      # GET endpoint for stats
│   ├── layout.tsx      # Root layout with metadata
│   ├── page.tsx        # Home page (main app component)
│   └── globals.css     # Global styles + Tailwind
├── components/
│   ├── Hero.tsx        # Landing page component
│   ├── Loading.tsx     # Loading state component
│   └── Results.tsx     # Results display component
├── lib/
│   └── api.ts          # Client-side API client
├── services/
│   ├── scraperService.ts      # Blog scraping logic
│   ├── analyzerService.ts     # Content analysis
│   ├── groqService.ts         # AI roasting with Groq
│   └── roastDbService.ts      # MongoDB operations
├── analyzers/
│   ├── structureAnalyzer.ts   # Document structure checks
│   └── readabilityAnalyzer.ts # Readability metrics
├── models/
│   └── Roast.ts              # MongoDB schema
├── types/
│   └── index.ts              # TypeScript interfaces
└── utils/
    └── textUtil.ts           # Text processing utilities
```

---

## Getting Started

### Installation

All dependencies are already installed. To reinstall:

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

---

## Environment Variables

Required in `.env.local`:

```env
GROQ_API_KEY=your_groq_api_key_here
MONGO_URI=your_mongodb_connection_string
```

---

## API Routes

### POST `/api/analyze`

Analyzes a blog URL and generates a roast.

**Request:**
```json
{ "url": "https://example.com/blog" }
```

**Response:**
```json
{
  "title": "Blog Title",
  "roast": "Multi-paragraph roast text...",
  "improvements": ["Suggestion 1", "Suggestion 2", ...],
  "count": 42,
  "recent": [...]
}
```

### GET `/api/stats`

Returns total roast count and recently roasted blogs.

**Response:**
```json
{
  "count": 42,
  "recent": [
    {
      "url": "example.com",
      "snippet": "First 100 chars of roast...",
      "avatar": "seed123",
      "timestamp": 1234567890
    }
  ]
}
```

---

## Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with @tailwindcss/postcss
- **Database:** MongoDB + Mongoose
- **AI:** Groq API (Llama 3.3 70B)
- **Scraping:** Axios + JSDOM + Mozilla Readability
- **Package Manager:** npm

---

## File Sizes

Optimized Next.js build:
- **Root page:** 3.04 kB (+ 105 kB First Load JS)
- **API routes:** ~124 B each

---

## Notes

- The UI remains **exactly the same** - no design changes
- All backend logic is preserved with zero functionality loss
- The project can be deployed to Vercel directly
- Environment variables must be set before deployment

---

## Migration Details

### Services Migrated
- ✅ Blog scraping (Readability + Axios)
- ✅ Content analysis (Structure + Readability checks)
- ✅ AI roast generation (Groq API)
- ✅ MongoDB operations (Mongoose)
- ✅ Recent roasts stats

### Components Migrated
- ✅ Hero landing page
- ✅ Loading state
- ✅ Results display

### Styling Preserved
- ✅ Custom animations (fade-in, pulse-glow, marquee)
- ✅ Color scheme (#de7356 brand color, dark mode)
- ✅ Typography (Space Grotesk font)
- ✅ Responsive design

---

## Deployment

Ready for production. Deploy to:
- **Vercel** (recommended for Next.js)
- **Any Node.js host**

Build output: `.next/` directory

---

## Backup

Original separate client/server setup backed up at: `RoastMyBlog-backup/`
