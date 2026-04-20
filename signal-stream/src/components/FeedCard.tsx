"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, ChevronRight, Globe, Sparkles, Loader2, X } from "lucide-react";
import { useSourceStore } from "@/store/useSourceStore";

interface FeedCardProps {
  sourceName: string;
  sourceIcon: string;
  sourceIconType?: string;
  sourceBgColor?: string;
  sourceTextColor?: string;
  timestamp: string;
  title: string;
  excerpt: string;
  categories: string[];
  link?: string;
  thumbnail?: string;
  onCategoryClick?: (category: string) => void;
}

export function FeedCard({
  sourceName,
  sourceIcon,
  sourceIconType,
  sourceBgColor,
  sourceTextColor,
  timestamp,
  title,
  excerpt,
  categories,
  link,
  thumbnail,
  onCategoryClick,
}: FeedCardProps) {
  const { toggleBookmark, isBookmarked } = useSourceStore();
  const saved = link ? isBookmarked(link) : false;
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!link) return;
    toggleBookmark({ link, title, excerpt, sourceName, sourceIcon, timestamp, categories });
  };

  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleSummarize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Toggle off if already showing
    if (showSummary && summary) {
      setShowSummary(false);
      return;
    }

    // If we already have a cached summary, just show it
    if (summary) {
      setShowSummary(true);
      return;
    }

    setIsSummarizing(true);
    setShowSummary(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt, url: link }),
      });
      const data = await res.json();
      setSummary(data.summary || "Could not summarize.");
    } catch {
      setSummary("Failed to generate summary. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  // Render the publication icon/avatar
  const renderSourceAvatar = () => {
    if (sourceIcon && (sourceIcon.startsWith('http') || sourceIcon.startsWith('/'))) {
      return (
        <div className="w-10 h-10 rounded-full bg-white overflow-hidden flex items-center justify-center ring-2 ring-primary/10">
          <img
            alt={sourceName}
            className="w-full h-full object-cover"
            src={sourceIcon}
          />
        </div>
      );
    }
    
    if (sourceIconType === 'text' && sourceIcon) {
      return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sourceBgColor || 'bg-surface-container-highest'}`}>
          <span className={`${sourceTextColor || 'text-on-surface'} font-black text-xs`}>
            {sourceIcon}
          </span>
        </div>
      );
    }

    // Fallback: generate a colored avatar from the source name
    const initial = sourceName?.charAt(0)?.toUpperCase() || "?";
    return (
      <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
        <span className="text-primary font-black text-sm">{initial}</span>
      </div>
    );
  };

  return (
    <article
      className="bg-surface-container-low rounded-xl overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-[0px_10px_30px_rgba(0,0,0,0.3)] group cursor-pointer border border-transparent hover:border-outline-variant/10"
      onClick={() => link && window.open(link, "_blank", "noopener,noreferrer")}
    >
      {/* Thumbnail */}
      {thumbnail && (
        <div className="w-full h-44 overflow-hidden bg-surface-container">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {renderSourceAvatar()}
          <div>
            <h4 className="text-sm font-bold font-headline text-on-surface">
              {sourceName}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">{timestamp}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleSummarize}
            className={`transition-all p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
              showSummary
                ? "text-primary bg-primary/10"
                : "text-slate-500 hover:text-primary hover:bg-primary/5"
            }`}
            title="AI Summary"
          >
            {isSummarizing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleBookmark}
            className={`transition-colors p-1 rounded-lg ${
              saved ? "text-primary bg-primary/10" : "text-slate-500 hover:text-primary hover:bg-primary/5"
            }`}
            title={saved ? "Remove bookmark" : "Bookmark this article"}
          >
            {saved ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold font-headline text-surface-tint mb-3 leading-tight group-hover:text-primary transition-colors">
        {title}
      </h2>

      {/* AI Summary Panel */}
      {showSummary && (
        <div
          className="mb-4 p-4 rounded-lg bg-primary/5 border border-primary/15 animate-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold font-headline text-primary">AI Briefing</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setShowSummary(false); }}
              className="text-slate-500 hover:text-on-surface p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {isSummarizing ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Analyzing article...
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant leading-relaxed font-body">
              {summary}
            </p>
          )}
        </div>
      )}

      <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2 mb-4 font-body">
        {excerpt}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onCategoryClick?.(cat);
              }}
              className="px-2 py-1 bg-surface-container-highest rounded text-[10px] font-bold text-slate-400 tracking-wider uppercase hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          onClick={handleReadMore}
          className="text-primary text-xs font-bold font-headline flex items-center gap-1 hover:underline shrink-0"
        >
          Read More <ChevronRight className="w-4 h-4" />
        </button>
        </div>
      </div>
    </article>
  );
}
