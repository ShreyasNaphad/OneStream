import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SOURCE_CATALOG, getDefaultSourceIds, type CatalogSource } from '@/lib/sourceCatalog';

export interface Source {
  id: string;
  name: string;
  handle: string;
  icon: string;
  category: string[];
  followers: string;
  activity: string;
  enabled: boolean;
  paused: boolean;
  iconType?: 'image' | 'text' | 'icon';
  iconContent?: string;
  bgColor?: string;
  textColor?: string;
}

export interface BookmarkedArticle {
  link: string;
  title: string;
  excerpt: string;
  sourceName: string;
  sourceIcon: string;
  timestamp: string;
  categories: string[];
  savedAt: number; // epoch ms
}

// Convert a catalog entry to a store source
function catalogToSource(cat: CatalogSource): Source {
  return {
    id: cat.id,
    name: cat.name,
    handle: cat.handle,
    icon: '',
    category: cat.categories,
    followers: '',
    activity: 'Active',
    enabled: true,
    paused: false,
    iconType: cat.iconType,
    iconContent: cat.iconContent,
    bgColor: cat.bgColor,
    textColor: cat.textColor,
  };
}

// Build default sources from catalog
const defaultSources: Source[] = getDefaultSourceIds()
  .map(id => {
    const cat = SOURCE_CATALOG.find(s => s.id === id);
    return cat ? catalogToSource(cat) : null;
  })
  .filter(Boolean) as Source[];

interface SourceStore {
  sources: Source[];
  bookmarks: BookmarkedArticle[];
  toggleSource: (id: string) => void;
  removeSource: (id: string) => void;
  addSource: (catalogSource: CatalogSource) => void;
  addSourceById: (id: string) => void;
  toggleBookmark: (article: Omit<BookmarkedArticle, 'savedAt'>) => void;
  isBookmarked: (link: string) => boolean;
  feedCache: any[];
  lastFetchTime: number;
  setFeedCache: (feed: any[]) => void;
  theme: 'dark' | 'light';
  cacheDuration: number; // minutes
  setTheme: (theme: 'dark' | 'light') => void;
  setCacheDuration: (minutes: number) => void;
}

export const useSourceStore = create<SourceStore>()(
  persist(
    (set, get) => ({
      sources: defaultSources,
      bookmarks: [],
      feedCache: [],
      lastFetchTime: 0,
      theme: 'dark' as const,
      cacheDuration: 5,

      toggleSource: (id) => set((state) => ({
        sources: state.sources.map(src =>
          src.id === id ? { ...src, enabled: !src.enabled, paused: !src.enabled ? false : src.paused } : src
        )
      })),

      removeSource: (id) => set((state) => ({
        sources: state.sources.filter(src => src.id !== id)
      })),

      addSource: (catalogSource: CatalogSource) => {
        const existing = get().sources.find(s => s.id === catalogSource.id);
        if (existing) return; // already added
        set((state) => ({
          sources: [...state.sources, catalogToSource(catalogSource)]
        }));
      },

      addSourceById: (id: string) => {
        const cat = SOURCE_CATALOG.find(s => s.id === id);
        if (!cat) return;
        get().addSource(cat);
      },

      toggleBookmark: (article) => {
        const existing = get().bookmarks.find(b => b.link === article.link);
        if (existing) {
          set({ bookmarks: get().bookmarks.filter(b => b.link !== article.link) });
        } else {
          set({ bookmarks: [...get().bookmarks, { ...article, savedAt: Date.now() }] });
        }
      },

      isBookmarked: (link: string) => {
        return get().bookmarks.some(b => b.link === link);
      },

      setFeedCache: (feed) => {
        set({ feedCache: feed, lastFetchTime: Date.now() });
      },

      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.className = theme;
        }
      },

      setCacheDuration: (minutes) => {
        set({ cacheDuration: minutes });
      },
    }),
    {
      name: 'signal-stream-store',
      // Only persist sources and bookmarks
      partialize: (state) => ({
        sources: state.sources,
        bookmarks: state.bookmarks,
        theme: state.theme,
        cacheDuration: state.cacheDuration,
      }),
    }
  )
);
