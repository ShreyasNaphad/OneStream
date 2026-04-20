import { NextResponse } from "next/server";
import Parser from "rss-parser";
import Groq from "groq-sdk";
import { getCatalogFeedUrl } from "@/lib/sourceCatalog";

const parser = new Parser({
  customFields: {
    item: [
      'media:content',
      'media:thumbnail',
      'content:encoded',
      ['media:content', 'media:content', { keepArray: true }],
    ]
  }
});

// Initialize Groq client. Falls back if no key is provided gracefully.
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// Timeout wrapper function
const fetchWithTimeout = async <T>(promise: Promise<T>, ms: number = 7000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout after ' + ms + 'ms')), ms))
  ]);
};

// Helper to strip HTML from RSS excerpts
const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '').trim();

// Decode HTML entities like &#8217; &#8220; &amp; etc.
const decodeEntities = (str: string): string => {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&#[0-9]+;/g, (match) => {
      const code = parseInt(match.slice(2, -1), 10);
      return String.fromCharCode(code);
    });
};

// Extract a thumbnail URL from RSS item fields
const extractThumbnail = (item: any): string => {
  // Try media:content (most common in tech RSS feeds)
  const mediaContent = item['media:content'];
  if (mediaContent) {
    if (typeof mediaContent === 'object' && mediaContent.$?.url) return mediaContent.$.url;
    if (Array.isArray(mediaContent)) {
      const img = mediaContent.find((m: any) => m.$?.medium === 'image' || m.$?.type?.startsWith('image'));
      if (img?.$?.url) return img.$.url;
      if (mediaContent[0]?.$?.url) return mediaContent[0].$.url;
    }
  }
  // Try media:thumbnail
  const mediaThumbnail = item['media:thumbnail'];
  if (mediaThumbnail?.$?.url) return mediaThumbnail.$.url;
  // Try enclosure (podcasts / some feeds use this for images)
  if (item.enclosure?.url && item.enclosure?.type?.startsWith('image')) return item.enclosure.url;
  // Try to extract first <img> from content HTML
  const content = item.content || item['content:encoded'] || '';
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]) return imgMatch[1];
  return '';
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sourcesParam = searchParams.get("sources");
  const searchQuery = searchParams.get("q")?.toLowerCase().trim() || "";
  
  if (!sourcesParam) {
    return NextResponse.json({ error: "Missing sources parameter" }, { status: 400 });
  }

  const activeSourceIds = sourcesParam.split(",");
  let allArticles: any[] = [];

  // 1. Fetch RSS Feeds Concurrently with Timeout
  const fetchPromises = activeSourceIds.map(async (storeId) => {
    // Look up the feed URL from the centralized catalog
    const feedUrl = getCatalogFeedUrl(storeId);
    if (!feedUrl) return []; // Skip if we have no mapping for this ID

    try {
      // Respectful robust fetch with 7-second graceful timeout limit
      const feed = await fetchWithTimeout(parser.parseURL(feedUrl));
      
      // We take the top 5 articles from each source
      const topItems = feed.items.slice(0, 5).map(item => ({
        storeId,
        title: decodeEntities(item.title || 'Untitled'),
        // Extract a clean excerpt up to 280 characters
        excerpt: decodeEntities(stripHtml(item.contentSnippet || item.content || '').substring(0, 280)) + '...',
        link: item.link || '#',
        pubDateRaw: item.pubDate || '',
        timestamp: item.pubDate ? new Date(item.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now',
        thumbnail: extractThumbnail(item),
        // Default categories applied immediately in case AI categorization fails
        categories: ['News']
      }));

      return topItems;
    } catch (e) {
      console.warn(`[RSS FETCH WARNING] Failed to fetch feed for ${storeId} (${feedUrl}):`, e);
      return []; // Return empty array on failure so the rest of the dashboard doesn't crash
    }
  });

  const resultsList = await Promise.all(fetchPromises);
  allArticles = resultsList.flat();

  // 2. Apply search filter if query provided
  if (searchQuery && allArticles.length > 0) {
    allArticles = allArticles.filter(article => 
      article.title.toLowerCase().includes(searchQuery) ||
      article.excerpt.toLowerCase().includes(searchQuery)
    );
  }

  if (allArticles.length === 0) {
    return NextResponse.json({ articles: [] });
  }

  // 3. Groq Categorization Engine
  // We'll bundle articles into a strict JSON generation prompt to be very token efficient
  if (groq) {
    try {
      // Limit to first 20 articles to stay within token budget
      const articlesToCategorize = allArticles.slice(0, 20);
      const articlesMap = articlesToCategorize.reduce((acc, curr, index) => {
        acc[index] = { t: curr.title.substring(0, 80) };
        return acc;
      }, {} as Record<number, any>);

      const prompt = `Categorize each article. Output JSON: {id:[tag1,tag2]}. Each tag is 1-2 words max.
Articles: ${JSON.stringify(articlesMap)}`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
        max_tokens: 400,
        response_format: { type: "json_object" },
      });

      const jsonResponseStr = completion.choices[0]?.message?.content;
      if (jsonResponseStr) {
        const categoriesMap = JSON.parse(jsonResponseStr);
        // Inject tags back into array
        articlesToCategorize.forEach((article, idx) => {
          if (categoriesMap[idx] && Array.isArray(categoriesMap[idx])) {
            article.categories = categoriesMap[idx];
          }
        });
      }
    } catch (apiErr) {
      console.error("[GROQ API WARNING] Failed to categorize news articles:", apiErr);
      // We gracefully swallow the error here because the articles already have the default "News" category.
    }
  } else {
    console.warn("GROQ_API_KEY holds no value. Falling back to default categories.");
  }

  // Sort by publication date, newest first
  allArticles.sort((a, b) => {
    const dateA = a.pubDateRaw ? new Date(a.pubDateRaw).getTime() : 0;
    const dateB = b.pubDateRaw ? new Date(b.pubDateRaw).getTime() : 0;
    return dateB - dateA;
  });

  return NextResponse.json({ articles: allArticles });
}
