"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Plus, Check, Loader2, Rss, Globe } from "lucide-react";
import { useSourceStore } from "@/store/useSourceStore";
import type { CatalogSource } from "@/lib/sourceCatalog";

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSourceModal({ isOpen, onClose }: AddSourceModalProps) {
  const { sources, addSource } = useSourceStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogSource[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [justAdded, setJustAdded] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const existingIds = sources.map(s => s.id);

  const doSearch = useCallback(async (q: string) => {
    setIsSearching(true);
    try {
      const exclude = existingIds.join(",");
      const res = await fetch(`/api/sources/search?q=${encodeURIComponent(q)}&exclude=${encodeURIComponent(exclude)}`);
      const data = await res.json();
      setResults(data.sources || []);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [existingIds]);

  // Load all available sources on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setJustAdded(new Set());
      doSearch("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = (source: CatalogSource) => {
    addSource(source);
    setJustAdded(prev => new Set(prev).add(source.id));
    // Remove from results after a brief animation
    setTimeout(() => {
      setResults(prev => prev.filter(s => s.id !== source.id));
    }, 600);
  };

  // Close on escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-surface-container-low border border-outline-variant/15 rounded-2xl shadow-2xl overflow-hidden animate-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
          <div>
            <h2 className="font-headline font-bold text-xl text-on-surface">Add Source</h2>
            <p className="text-xs text-outline mt-1">Search 24+ tech publications and feeds</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-outline-variant/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant w-4 h-4" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/10 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary/30 focus:outline-none placeholder-slate-600 font-body"
              placeholder="Search by name, category, or topic..."
              type="text"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4 animate-spin" />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto custom-scrollbar p-2">
          {results.length === 0 && !isSearching && (
            <div className="text-center py-12 opacity-50">
              <Rss className="w-8 h-8 mx-auto text-outline-variant mb-3" />
              <p className="text-sm text-outline">
                {query ? "No matching sources found" : "All available sources are already added!"}
              </p>
            </div>
          )}
          
          {results.map((source) => {
            const wasJustAdded = justAdded.has(source.id);
            return (
              <div
                key={source.id}
                className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                  wasJustAdded
                    ? "bg-primary/10 scale-95 opacity-50"
                    : "hover:bg-surface-container cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${source.bgColor || 'bg-surface-container'}`}>
                    {source.iconType === 'text' ? (
                      <span className={`${source.textColor || 'text-on-surface'} font-black text-xs`}>
                        {source.iconContent}
                      </span>
                    ) : (
                      <Globe className="w-5 h-5 text-on-surface" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold font-headline text-on-surface truncate">
                      {source.name}
                    </p>
                    <p className="text-[10px] text-outline truncate">
                      {source.description}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {source.categories.map(cat => (
                        <span key={cat} className="px-1.5 py-0.5 bg-surface-container-highest rounded text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => !wasJustAdded && handleAdd(source)}
                  disabled={wasJustAdded}
                  className={`ml-3 p-2.5 rounded-xl transition-all duration-200 shrink-0 ${
                    wasJustAdded
                      ? "bg-primary/20 text-primary cursor-default"
                      : "text-primary hover:bg-primary/10 active:scale-90"
                  }`}
                >
                  {wasJustAdded ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/10 flex justify-between items-center">
          <p className="text-[10px] text-slate-500">
            {results.length} source{results.length !== 1 ? 's' : ''} available
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-surface-container text-on-surface font-bold text-sm rounded-lg hover:bg-surface-container-high transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
