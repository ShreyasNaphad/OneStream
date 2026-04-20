"use client";

import { Bookmark, BookmarkCheck, Globe } from "lucide-react";
import { useSourceStore } from "@/store/useSourceStore";

interface CompactFeedCardProps {
  sourceName: string;
  sourceIcon: string;
  sourceIconType?: string;
  sourceBgColor?: string;
  sourceTextColor?: string;
  timestamp: string;
  title: string;
  link?: string;
}

export function CompactFeedCard({
  sourceName,
  sourceIcon,
  sourceIconType,
  sourceBgColor,
  sourceTextColor,
  timestamp,
  title,
  link,
}: CompactFeedCardProps) {
  const { toggleBookmark, isBookmarked } = useSourceStore();
  const saved = link ? isBookmarked(link) : false;

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!link) return;
    // For compact cards we might lack the abstract/categories but they're still saved.
    toggleBookmark({ link, title, excerpt: "", sourceName, sourceIcon, timestamp, categories: [] });
  };

  const renderSourceAvatar = () => {
    if (sourceIcon && (sourceIcon.startsWith('http') || sourceIcon.startsWith('/'))) {
      return (
        <img
          alt={sourceName}
          className="w-5 h-5 rounded object-cover"
          src={sourceIcon}
        />
      );
    }
    
    if (sourceIconType === 'text' && sourceIcon) {
      return (
        <div className={`w-5 h-5 rounded flex items-center justify-center ${sourceBgColor || 'bg-surface-container-highest'}`}>
          <span className={`${sourceTextColor || 'text-on-surface'} font-black text-[8px]`}>
            {sourceIcon}
          </span>
        </div>
      );
    }

    const initial = sourceName?.charAt(0)?.toUpperCase() || "?";
    return (
      <div className="w-5 h-5 rounded bg-primary/15 flex items-center justify-center">
        <span className="text-primary font-black text-[10px]">{initial}</span>
      </div>
    );
  };

  return (
    <div 
      className="flex gap-4 p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group border border-transparent hover:border-outline-variant/10"
      onClick={() => link && window.open(link, "_blank", "noopener,noreferrer")}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          {renderSourceAvatar()}
          <span className="text-xs font-bold font-headline text-on-surface truncate">{sourceName}</span>
          <span className="text-[10px] text-slate-500 whitespace-nowrap hidden sm:inline-block">• {timestamp}</span>
        </div>
        <h3 className="font-headline font-bold text-sm text-surface-tint leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
      </div>
      <button
        onClick={handleBookmark}
        className={`shrink-0 transition-colors self-center p-2 rounded-lg ${
          saved ? "text-primary bg-primary/10" : "text-slate-500 hover:text-primary hover:bg-primary/5 opacity-0 group-hover:opacity-100"
        }`}
      >
        {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
      </button>
    </div>
  );
}
