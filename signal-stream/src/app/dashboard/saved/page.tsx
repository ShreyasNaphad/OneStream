"use client";

import { useState, useEffect } from "react";
import { useSourceStore, type BookmarkedArticle } from "@/store/useSourceStore";
import { FeedCard } from "@/components/FeedCard";
import { Bookmark, Trash2 } from "lucide-react";

export default function SavedPage() {
  const { bookmarks, toggleBookmark } = useSourceStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sort bookmarks by most recently saved first
  const sortedBookmarks = [...bookmarks].sort((a, b) => b.savedAt - a.savedAt);

  const handleClearAll = () => {
    sortedBookmarks.forEach((b) => toggleBookmark(b));
  };

  if (!isMounted) return null;

  return (
    <main className="pt-24 pb-16 px-6 md:px-12 max-w-[1100px] mx-auto w-full overflow-y-auto custom-scrollbar h-full">
      {/* Header */}
      <section className="mb-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2">
              Saved Articles
            </h2>
            <p className="text-outline max-w-lg">
              Your bookmarked articles from across all sources. Click any
              article to read the full piece.
            </p>
          </div>
          {sortedBookmarks.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-5 py-2 bg-error-container/20 text-error rounded-lg text-sm font-bold hover:bg-error-container/40 transition-colors active:scale-95 shrink-0"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>
      </section>

      {/* Bookmarked Articles */}
      {sortedBookmarks.length > 0 ? (
        <div className="space-y-6">
          {sortedBookmarks.map((article) => (
            <FeedCard
              key={article.link}
              sourceName={article.sourceName}
              sourceIcon={article.sourceIcon}
              timestamp={article.timestamp}
              title={article.title}
              excerpt={article.excerpt}
              categories={article.categories}
              link={article.link}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 opacity-50">
          <Bookmark className="w-12 h-12 mx-auto text-outline-variant mb-4" />
          <p className="font-headline font-bold text-xl text-on-surface mb-2">
            No saved articles yet
          </p>
          <p className="text-sm text-outline max-w-md mx-auto">
            Bookmark articles from your feed by clicking the bookmark icon on
            any article card. They&apos;ll appear here for easy access.
          </p>
        </div>
      )}
    </main>
  );
}
