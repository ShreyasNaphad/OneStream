"use client";

import { useState, useEffect, useMemo } from "react";
import { FeedCard } from "@/components/FeedCard";
import { CompactFeedCard } from "@/components/CompactFeedCard";
import { AddSourceModal } from "@/components/AddSourceModal";
import {
  Search,
  Plus,
  Bell,
  TrendingUp,
  Zap,
  PlusCircle,
  Globe,
  RefreshCw,
  X,
} from "lucide-react";
import { useSourceStore } from "@/store/useSourceStore";
import { SOURCE_CATALOG } from "@/lib/sourceCatalog";

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export default function DashboardPage() {
  const { sources, addSourceById, feedCache, lastFetchTime, setFeedCache, cacheDuration } = useSourceStore();
  const [activeFeedData, setActiveFeedData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch feed articles
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
          // Merge API data with frontend store UI info (Icons/Names)
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

  // Client-side search filtering of feed articles
  const filteredFeed = useMemo(() => {
    if (!searchQuery.trim()) return activeFeedData;
    const q = searchQuery.toLowerCase();
    return activeFeedData.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.excerpt?.toLowerCase().includes(q) ||
        item.sourceName?.toLowerCase().includes(q) ||
        item.categories?.some((c: string) => c.toLowerCase().includes(q))
    );
  }, [activeFeedData, searchQuery]);

  // Derive trending topics from article categories
  const trendingTopics = useMemo(() => {
    const counts: Record<string, number> = {};
    activeFeedData.forEach((article) => {
      article.categories?.forEach((cat: string) => {
        counts[cat] = (counts[cat] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));
  }, [activeFeedData]);

  const mostActiveSources = useMemo(() => {
    const counts: Record<string, { count: number; sourceInfo: any }> = {};
    activeFeedData.forEach((article) => {
      if (article.sourceName) {
        if (!counts[article.sourceName]) {
          counts[article.sourceName] = { 
            count: 0, 
            sourceInfo: {
              iconType: article.sourceIconType,
              iconContent: article.sourceIcon,
              bgColor: article.sourceBgColor,
              textColor: article.sourceTextColor,
            }
          };
        }
        counts[article.sourceName].count += 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 4)
      .map(([name, data]) => ({ name, count: data.count, sourceInfo: data.sourceInfo }));
  }, [activeFeedData]);

  // Suggested sources: from catalog, not yet in user's list
  const suggestedSources = useMemo(() => {
    const existingIds = new Set(sources.map((s) => s.id));
    return SOURCE_CATALOG.filter((s) => !existingIds.has(s.id)).slice(0, 3);
  }, [sources]);

  // Loading skeleton block UI
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
    <>
      <header className="fixed top-14 md:top-0 left-0 md:left-64 right-0 z-40 bg-surface/80 backdrop-blur-xl h-16 flex items-center justify-between px-4 md:px-8 shadow-[0_20px_40px_rgba(184,195,255,0.04)]">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              className="w-full bg-surface-container-lowest border-none rounded-lg pl-10 pr-10 py-2 text-sm text-on-surface focus:ring-1 focus:ring-primary/20 focus:outline-none placeholder-slate-600 font-body"
              placeholder="Search articles by title, topic, or source..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-on-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className={`p-2 text-slate-400 hover:text-primary hover:bg-surface-container rounded-full transition-colors ${isLoading ? 'animate-spin' : ''}`}
            title="Refresh feed"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-container text-on-primary-container px-6 py-2 rounded-full text-sm font-bold font-headline flex items-center gap-2 hover:bg-surface-container-high transition-colors active:scale-95 duration-200"
          >
            <Plus className="w-4 h-4" /> Add Source
          </button>
          <div className="relative group cursor-pointer">
            <button className="p-2 text-slate-400 hover:bg-surface-container-high rounded-full transition-colors relative">
              <Bell className="w-6 h-6" />
              {activeFeedData.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_12px_#b8c3ff]"></span>
              )}
            </button>
          </div>
          <div className="h-8 w-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/15 cursor-pointer flex items-center justify-center">
            <span className="text-xs font-bold text-primary">S</span>
          </div>
        </div>
      </header>

      <div className="flex h-full pt-28 md:pt-16 pb-10">
        {/* Main Feed Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-8 pb-10">
            {/* Search results indicator */}
            {searchQuery.trim() && !isLoading && (
              <div className="flex items-center justify-between bg-surface-container-low rounded-lg px-4 py-3 border border-outline-variant/10">
                <p className="text-sm text-outline">
                  Showing <span className="text-on-surface font-bold">{filteredFeed.length}</span> result{filteredFeed.length !== 1 ? 's' : ''} for &quot;<span className="text-primary">{searchQuery}</span>&quot;
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  Clear
                </button>
              </div>
            )}

            {isLoading ? (
              <>
                <FeedSkeleton />
                <FeedSkeleton />
                <FeedSkeleton />
              </>
            ) : filteredFeed.length > 0 ? (
              <div className="space-y-10">
                {/* Top Stories Grid */}
                <div>
                  <h3 className="font-headline text-lg font-black text-on-surface mb-4">Top Stories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredFeed.slice(0, 2).map((item, index) => (
                      <FeedCard key={`${item.link}-${index}`} {...item} onCategoryClick={(cat) => setSearchQuery(cat)} />
                    ))}
                  </div>
                </div>

                {/* Latest Updates Compact List */}
                {filteredFeed.length > 2 && (
                  <div>
                    <h3 className="font-headline text-lg font-black text-on-surface mb-4">Latest Updates</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredFeed.slice(2).map((item, index) => (
                        <CompactFeedCard key={`${item.link}-${index}`} {...item} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 opacity-50">
                <Search className="w-10 h-10 mx-auto text-outline-variant mb-4" />
                <p className="font-headline font-bold text-lg text-on-surface">
                  {searchQuery ? "No articles match your search" : "Your stream is empty"}
                </p>
                <p className="text-sm text-outline">
                  {searchQuery
                    ? "Try a different keyword or clear the search."
                    : "Enable sources from the Sources tab to start tracking updates."}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-6 px-6 py-2 bg-primary-container text-on-primary-container rounded-full text-sm font-bold hover:brightness-110 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Your First Source
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Widgets — hidden on mobile */}
        <aside className="hidden lg:flex w-80 flex-col bg-surface-container-low border-l border-outline-variant/10 overflow-y-auto px-6 py-8 space-y-10 custom-scrollbar pb-12">
          {/* Trending Topics — derived from real feed data */}
          <div>
            <h3 className="font-headline text-xs tracking-widest uppercase text-slate-400 mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Trending Topics
            </h3>
            <div className="space-y-4">
              {trendingTopics.length > 0 ? (
                trendingTopics.map(({ topic, count }) => (
                  <div
                    key={topic}
                    className="group cursor-pointer"
                    onClick={() => setSearchQuery(topic)}
                  >
                    <p className="text-sm font-bold font-headline text-on-surface group-hover:text-primary transition-colors">
                      #{topic.replace(/\s+/g, "")}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {count} article{count !== 1 ? 's' : ''} in feed
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">
                  {isLoading ? "Loading..." : "No data yet — add sources to see trends"}
                </p>
              )}
            </div>
          </div>

          {/* Most Active Sources — derived from real feed data */}
          <div>
            <h3 className="font-headline text-xs tracking-widest uppercase text-slate-400 mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Most Active Sources
            </h3>
            <div className="space-y-5">
              {mostActiveSources.length > 0 ? (
                mostActiveSources.map(({ name, count, sourceInfo }) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${sourceInfo.bgColor || 'bg-surface-container-highest'}`}>
                        {sourceInfo.iconType === 'text' ? (
                          <span className={`font-black text-[10px] ${sourceInfo.textColor || 'text-on-surface'}`}>
                            {sourceInfo.iconContent}
                          </span>
                        ) : (
                          <Globe className="w-4 h-4 text-outline-variant" />
                        )}
                      </div>
                      <span className="text-xs font-bold font-headline truncate">{name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">
                      {count} article{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">
                  {isLoading ? "Loading..." : "No active sources yet"}
                </p>
              )}
            </div>
          </div>

          {/* Suggested Sources — from catalog */}
          <div>
            <h3 className="font-headline text-xs tracking-widest uppercase text-slate-400 mb-6 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-primary" /> Suggested Sources
            </h3>
            <div className="space-y-4">
              {suggestedSources.length > 0 ? (
                suggestedSources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between bg-surface-container rounded-lg p-3 group hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${source.bgColor || 'bg-surface-container-highest'}`}>
                        {source.iconType === 'text' ? (
                          <span className={`${source.textColor || 'text-on-surface'} font-black text-[10px]`}>
                            {source.iconContent}
                          </span>
                        ) : (
                          <Globe className="w-4 h-4 text-outline-variant" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold font-headline truncate">{source.name}</p>
                        <p className="text-[9px] text-slate-500 truncate">{source.handle}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => addSourceById(source.id)}
                      className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">
                  All sources added! 🎉
                </p>
              )}

              {suggestedSources.length > 0 && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full text-center text-xs text-primary font-bold hover:underline py-2"
                >
                  Browse all sources →
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Add Source Modal */}
      <AddSourceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </>
  );
}
