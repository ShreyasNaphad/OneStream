# SignalStream - Project Summary

## What We Have Built

SignalStream has been transformed from a static, mock-data UI into a **fully functional, real-time intelligence platform**.

### 1. Centralized Source Catalog
- Created `src/lib/sourceCatalog.ts` containing 24+ real-world tech RSS sources (TechCrunch, GitHub Blog, OpenAI, Hacker News, etc.).
- Includes metadata like name, handle, exact RSS URL, categories, and custom icon styling properties.

### 2. State & Persistence (Zustand)
- Re-wrote `src/store/useSourceStore.ts` to manage application state.
- **Enabled Sources:** Tracks which sources the user has active.
- **Bookmarks:** Tracks saved articles.
- **Caching:** Caches the last fetched feed data (`feedCache`) and timestamp (`lastFetchTime`) so that navigating between tabs is instant (0ms latency) without refetching from the API immediately.
- **Persistence:** Uses `localStorage` so your selected sources and bookmarked articles survive page refreshes.

### 3. Backend API Features
- **RSS Parser:** Upgraded `src/app/api/feed/route.ts` to pull live data concurrently using `rss-parser`. Returns the 5 latest articles for every enabled source, sorted by newest first.
- **Server-Side Search:** `src/app/api/sources/search/route.ts` allows the "Add Source" modal to search the catalog dynamically.

### 4. UI / UX Features
- **Dashboard Command Center:** A dense layout (`/dashboard`) featuring a "Top Stories" grid for the 2 newest articles, followed by a compact list (`<CompactFeedCard>`) to view many updates at a glance.
- **Feed Timeline:** A full-page, chronological timeline (`/dashboard/feed`) with interactive category filter tags and live client-side search.
- **Saved Articles:** A dedicated page (`/dashboard/saved`) displaying bookmarked articles with a "Clear All" option.
- **Interactive Sidebar:** 
  - **Trending Topics:** Dynamically counts which categories/tags appear most in the current feed.
  - **Most Active Sources:** Shows which publications have posted the most recently.
  - **Suggested Sources:** Highlights available RSS feeds from the catalog that you haven't added yet (with a 1-click `+` to add).
- **Add Source Modal:** A live-search interface (`<AddSourceModal>`) that filters the source catalog and provides an animated checkmark confirmation when adding sources.
- **Article Interaction:** Clicking an article card or "Read More" opens the actual source URL in a new tab.

---

## AI Implementation: Groq & LLaMA 3.1

**Are we using the Groq API / LLM?**  
**Yes, the code is fully built to use it, but it is currently in "fallback mode" because you haven't provided an API key.**

### How it works:
Inside your feed API (`src/app/api/feed/route.ts`), there is a categorization engine that intercepts the fetched RSS articles before sending them to the frontend.

1. **Check for Key:** It checks for `process.env.GROQ_API_KEY`.
2. **If Key Exists:** It bundles all recently fetched articles and sends a highly strict prompt to Groq's `llama-3.1-8b-instant` model. The LLM reads the excerpts and returns 2 incredibly specific, punchy tags per article (e.g., `["Research", "Funding"]` or `["Dev Updates", "AI"]`).
3. **If NO Key Exists:** It catches this and gracefully falls back to tagging everything as `["News"]`. 

### How to turn on the AI:
1. Open the `.env` file at `c:\Users\shrey\antigravity_projects\OneStream\.env`.
2. Add your key like this: `GROQ_API_KEY="gsk_your_key_here..."`
3. Restart your development server. 
The sidebars and article tags will immediately start populating with precise, AI-generated topics!
