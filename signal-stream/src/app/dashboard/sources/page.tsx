"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon, Plus } from "lucide-react";
import { useSourceStore } from "@/store/useSourceStore";
import { SourceCard } from "@/components/SourceCard";
import { AddSourceModal } from "@/components/AddSourceModal";

export default function SourcesPage() {
  const { sources, toggleSource, removeSource } = useSourceStore();
  const [activeFilter, setActiveFilter] = useState("All Sources");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Derive filter list from actual sources' categories
  const dynamicCategories = Array.from(
    new Set(sources.flatMap((s) => s.category))
  ).sort();
  const filters = ["All Sources", ...dynamicCategories];

  const filteredSources = sources.filter((s) => {
    const matchesFilter =
      activeFilter === "All Sources" || s.category.includes(activeFilter);
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.handle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!isMounted) return null;

  return (
    <main className="pt-24 pb-12 px-6 md:px-12 max-w-[1600px] w-full overflow-y-auto custom-scrollbar h-full">
      {/* Header Section */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2">
              Manage Your Sources
            </h2>
            <p className="text-outline max-w-lg">
              Curate your intelligence stream by connecting blogs, newsrooms,
              and channels. High-signal content, zero noise.
            </p>
          </div>
          <div className="w-full md:w-auto">
            <div className="flex items-center gap-2 p-1.5 bg-surface-container rounded-xl shadow-inner max-w-md border border-outline-variant/10">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant w-4 h-4" />
                <input
                  className="w-full bg-transparent border-none py-2 pl-9 pr-4 text-sm focus:ring-0 focus:outline-none placeholder:text-outline-variant text-on-surface"
                  placeholder="Search by name..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-primary-container text-on-primary-container font-bold rounded-lg text-sm transition-all hover:brightness-110 active:scale-95"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="mb-10">
        <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? "bg-primary text-on-primary font-semibold"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* Source Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSources.map((source) => (
          <SourceCard
            key={source.id}
            source={source}
            onToggle={toggleSource}
            onRemove={removeSource}
          />
        ))}

        {/* Add New Source Button Empty State */}
        <div
          onClick={() => setShowAddModal(true)}
          className="border-2 border-dashed border-outline-variant/20 rounded-xl flex flex-col items-center justify-center p-8 hover:bg-surface-container-low hover:border-primary/40 transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="text-primary w-6 h-6" />
          </div>
          <p className="font-bold text-on-surface-variant group-hover:text-primary transition-colors">
            Add New Source
          </p>
          <p className="text-xs text-outline text-center mt-1">
            Browse 24+ tech publications
          </p>
        </div>
      </div>



      {/* Add Source Modal */}
      <AddSourceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </main>
  );
}
