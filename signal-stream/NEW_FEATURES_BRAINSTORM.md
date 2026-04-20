# SignalStream — Limitations & Future Improvements

## Current Known Limitations

### 1. Groq Free Tier Rate Limits (6,000 TPM)
The Groq free plan allows only 6,000 tokens per minute. Because of this:
- **AI Categorization** only processes the first 20 articles per fetch. Articles 21+ get the default `"News"` tag instead of real AI categories.
- **AI Summarization** can also hit 429 errors if you click the ✨ button on many articles rapidly.
- **Fix:** Upgrade to Groq Dev Tier ($0 but higher limits), or batch categorization across multiple calls with a delay between them.

### 2. No Article Images / Thumbnails
Most RSS feeds include `media:content` or `og:image` data, but we don't render these yet. Every card is text-only, which limits visual appeal and scannability.
- **Fix:** Extract `media:content` or `media:thumbnail` from RSS items (the parser already supports it) and render them in FeedCard.

### 3. Summarization Uses Excerpt Only, Not Full Article
The AI Briefing is generated from the article's title + 280-char excerpt. It does NOT read the full article text. This means summaries can be shallow or generic for short excerpts.
- **Fix:** Add a server-side scraper (using `cheerio` or similar) to fetch and extract the full article body text before sending it to the LLM.

### 4. HTML Entities Not Decoded in Titles
Some article titles show raw HTML entities like `&#8217;` instead of `'`. This is because RSS feeds sometimes include encoded HTML.
- **Fix:** Add an HTML entity decoder utility (e.g. `he` npm package or a simple regex) in the feed API route.

### 5. Reuters Feed is Down
The Reuters Technology RSS feed (`feeds.reuters.com`) returns a DNS error (`ENOTFOUND`). Reuters has deprecated their public RSS feeds.
- **Fix:** Remove Reuters from the source catalog or replace it with an alternative like Reuters via a third-party mirror.

### 6. Light Mode Has Hardcoded Slate Colors
While the core theme variables switch between light/dark correctly, many UI elements use hardcoded Tailwind colors like `text-slate-500`, `text-slate-400`, `text-slate-300` which look fine in dark mode but can appear too light or washed out in light mode.
- **Fix:** Replace all `text-slate-*` with theme-aware tokens like `text-outline`, `text-on-surface-variant`, etc.

### 7. No Mobile Responsiveness
The layout uses a fixed 256px (`w-64`) sidebar and assumes a desktop viewport. On mobile or tablet screens, the sidebar overlaps or the content is inaccessible.
- **Fix:** Add a hamburger menu toggle for the sidebar on screens below `md` breakpoint, and hide the right sidebar widgets on small screens.

### 8. No User Authentication / Cloud Sync
All data (sources, bookmarks, theme, cache) is stored in `localStorage`. If you clear your browser data or switch devices, everything is lost.
- **Fix:** Add a lightweight auth system (e.g. NextAuth.js with Google/GitHub OAuth) and sync user preferences to a database (Supabase, Firebase, or Postgres).

---

## Potential New Features

### 1. Article Thumbnail Images
Extract and display `og:image` or `media:content` from RSS feeds. Show a thumbnail on each FeedCard to make the feed visually richer and more magazine-like.

### 2. Full-Article Native Reader (Slide-Over Panel)
Instead of opening articles in a new tab, build a slide-over reader panel that:
- Fetches and renders the full article content inside the app
- Provides a distraction-free reading experience
- Keeps the user inside SignalStream

### 3. Reading History & "Mark as Read"
Track which articles the user has already clicked/read:
- Dim or visually distinguish "read" articles
- Add a "Mark all as read" button
- Persist read state in localStorage or Zustand

### 4. Background Auto-Refresh with Notifications
Set up a polling interval (e.g. every 10 minutes) that silently checks for new articles:
- Show a toast notification: "12 new articles available"
- Optionally use the browser Notifications API for system-level alerts

### 5. OPML Import/Export
Many developers already have curated RSS lists from tools like Feedly or Inoreader:
- **Import:** Parse `.opml` files and bulk-add feeds to the source catalog
- **Export:** Generate an `.opml` file from the user's current sources for backup or sharing

### 6. Keyboard Shortcuts
Power-user keyboard navigation:
- `j/k` to move between articles
- `b` to bookmark
- `s` to summarize
- `o` to open in new tab
- `r` to refresh feed
- `/` to focus search

### 7. Custom RSS URL Input
Allow users to paste any RSS feed URL directly (not just from the catalog). This would let users add niche blogs, personal websites, or company-specific feeds that aren't in our predefined list.

### 8. Compact / Expanded View Toggle on Feed Page
Add a view mode switch in the Feed page header:
- **Expanded:** Current large FeedCard format
- **Compact:** Ultra-dense HackerNews-style list showing 15+ articles on screen

### 9. Article Sharing
Add a share button on each FeedCard that copies the article URL to clipboard, or opens a native share dialog on mobile.

### 10. Analytics Dashboard Widget
A small analytics section that shows:
- Total articles read this week
- Most-read sources
- Reading time estimates
- Activity heatmap (days you were most active)
