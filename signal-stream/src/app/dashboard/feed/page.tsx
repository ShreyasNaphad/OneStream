"use client";

import { useState, useEffect, useMemo } from "react";
import { FeedCard } from "@/components/FeedCard";
import { Search, X, RefreshCw, Filter } from "lucide-react";
import { useSourceStore } from "@/store/useSourceStore";

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export default function FeedPage() {
  const { sources, feedCache, lastFetchTime, setFeedCache, cacheDuration } = useSourceStore();
  const [activeFeedData, setActiveFeedData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchFeed = async () => {
      setIsLoading(true);

      const enabledSources = sources.filter((s) => s.enabled);
      if (enabledSources.length === 0) {
        setActiveFeedData([]);
        setIsLoading(false);
        return;
      }

      // Check cache unless we just hit the refresh button
      if (refreshKey === 0 && feedCache.length > 0 && (Date.now() - lastFetchTime < cacheDuration * 60 * 1000)) {
        setActiveFeedData(feedCache);
        setIsLoading(false);
        return;
      }

      const sourceIds = enabledSources.map((s) => s.id).join(",");

      try {
        const response = await fetch(`/api/feed?sources=${sourceIds}`);
        const data = await response.json();

        if (data.articles) {
          const mergedData = data.articles.map((article: any) => {
            const matchingSource = enabledSources.find(
              (s) => s.id === article.storeId
            );
            return {
              ...article,
              sourceName: matchingSource?.name || "Unknown Source",
              sourceIcon: matchingSource?.iconContent || "",
              sourceIconType: matchingSource?.iconType || "icon",
              sourceBgColor: matchingSource?.bgColor || "",
              sourceTextColor: matchingSource?.textColor || "",
            };
          });
          setActiveFeedData(mergedData);
          setFeedCache(mergedData);
        }
      } catch (e) {
        console.error("Failed to load feed", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeed();
  }, [sources, refreshKey]);

  // Derive categories from feed
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    activeFeedData.forEach((a) =>
      a.categories?.forEach((c: string) => cats.add(c))
    );
    return ["All", ...Array.from(cats).sort()];
  }, [activeFeedData]);

  // Filter
  const filteredFeed = useMemo(() => {
    let data = activeFeedData;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.excerpt?.toLowerCase().includes(q) ||
          item.sourceName?.toLowerCase().includes(q)
      );
    }
    if (activeCategory !== "All") {
      data = data.filter((item) =>
        item.categories?.includes(activeCategory)
      );
    }
    return data;
  }, [activeFeedData, searchQuery, activeCategory]);

  const FeedSkeleton = () => (
    <article className="bg-surface-container-low rounded-xl p-6 border border-transparent animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 rounded-full bg-surface-container"></div>
          <div className="space-y-2 w-1/3">
            <div className="h-4 bg-surface-container rounded"></div>
            <div className="h-2 bg-surface-container-highest rounded w-2/3"></div>
          </div>
        </div>
      </div>
      <div className="h-6 bg-surface-container rounded mb-3 w-3/4"></div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-surface-container-highest rounded w-full"></div>
        <div className="h-3 bg-surface-container-highest rounded w-5/6"></div>
      </div>
    </article>
  );

  if (!isMounted) return null;

  return (
    <main className="pt-20 md:pt-20 pb-16 px-4 md:px-12 max-w-[1100px] mx-auto w-full overflow-y-auto custom-scrollbar h-full">
      {/* Header */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2">
              Feed
            </h2>
            <p className="text-outline max-w-lg">
              All articles from your enabled sources, sorted newest first.
            </p>
          </div>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className={`flex items-center gap-2 px-5 py-2 bg-primary-container/20 text-primary rounded-lg text-sm font-bold hover:bg-primary-container/40 transition-colors active:scale-95 shrink-0 ${isLoading ? "animate-pulse" : ""}`}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </section>

      {/* Search + Category Filters */}
      <section className="mb-8 space-y-4">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant w-4 h-4" />
          <input
            className="w-full bg-surface-container border border-outline-variant/10 rounded-xl pl-10 pr-10 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/30 focus:outline-none placeholder-slate-600 font-body"
            placeholder="Search articles..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-on-surface"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-outline-variant mr-1" />
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Articles */}
      <div className="space-y-6">
        {isLoading ? (
          <>
            <FeedSkeleton />
            <FeedSkeleton />
            <FeedSkeleton />
            <FeedSkeleton />
          </>
        ) : filteredFeed.length > 0 ? (
          filteredFeed.map((item, index) => (
            <FeedCard key={`${item.link}-${index}`} {...item} onCategoryClick={(cat) => setActiveCategory(cat)} />
          ))
        ) : (
          <div className="text-center py-20 opacity-50">
            <Search className="w-10 h-10 mx-auto text-outline-variant mb-4" />
            <p className="font-headline font-bold text-lg text-on-surface">
              {searchQuery || activeCategory !== "All"
                ? "No articles match your filters"
                : "No articles available"}
            </p>
            <p className="text-sm text-outline">
              {searchQuery
                ? "Try different keywords or clear the filters."
                : "Enable more sources to see articles here."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
