# OneStream

OneStream is a personal intelligence platform built to aggregate, curate, and surface information from your favorite sources (Twitter/X, Reddit, Hacker News, tech blogs) into a single, unified workspace without the distraction of algorithmic feeds.

## Features

- **Live Stream**: View updates from all connected sources in a single chronological feed.
- **Source Management**: Add or remove content providers easily to shape your feed.
- **Intelligent Categorization**: Uses the Groq API under the hood to lightly categorize incoming stories when you provide a key. 
- **Dark Mode by Default**: Designed with a cinematic UI intended for low-fatigue reading.
- **Optimized Performance**: Cached requests and optimistic state updates for a very snappy user experience.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: Zustand
- **Feed Data**: `rss-parser` running on Next.js API routes

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ShreyasNaphad/OneStream.git
   cd OneStream/signal-stream
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open the app**:
   Navigate to `http://localhost:3000` to access the application.

## Configuration

If you want to use the AI categorization features, add your Groq API key in the **Settings** panel directly in the UI. No environment variables are strictly required to run the core feed reader locally.
