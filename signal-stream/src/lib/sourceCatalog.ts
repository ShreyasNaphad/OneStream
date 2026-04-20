// Single source of truth for all available RSS sources in OneStream.
// Used by the store (defaults), the feed API (URLs), and the discovery modal (search).

export interface CatalogSource {
  id: string;
  name: string;
  handle: string;         // Short descriptor like "Tech News" or "AI Research"
  feedUrl: string;
  categories: string[];
  iconType: 'image' | 'text' | 'icon';
  iconContent: string;    // URL for image, letter(s) for text, icon name for icon
  bgColor?: string;
  textColor?: string;
  description: string;
}

export const SOURCE_CATALOG: CatalogSource[] = [
  // ─── Tech News ─────────────────────────────────────────────
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    handle: 'Tech News',
    feedUrl: 'https://techcrunch.com/feed/',
    categories: ['Tech News', 'Startups'],
    iconType: 'text',
    iconContent: 'TC',
    bgColor: 'bg-[#00a300]/10',
    textColor: 'text-[#00a300]',
    description: 'Startup and technology news, funding rounds and product launches.',
  },
  {
    id: 'the-verge',
    name: 'The Verge',
    handle: 'Tech News',
    feedUrl: 'https://www.theverge.com/rss/index.xml',
    categories: ['Tech News'],
    iconType: 'text',
    iconContent: 'V',
    bgColor: 'bg-[#FA4B2A]/10',
    textColor: 'text-[#FA4B2A]',
    description: 'Technology, science, art, and culture coverage.',
  },
  {
    id: 'ars-technica',
    name: 'Ars Technica',
    handle: 'Tech News',
    feedUrl: 'https://feeds.arstechnica.com/arstechnica/index',
    categories: ['Tech News'],
    iconType: 'text',
    iconContent: 'Ars',
    bgColor: 'bg-[#ff4400]/10',
    textColor: 'text-[#ff4400]',
    description: 'In-depth technology journalism and analysis since 1998.',
  },
  {
    id: 'wired',
    name: 'Wired',
    handle: 'Tech News',
    feedUrl: 'https://www.wired.com/feed/rss',
    categories: ['Tech News'],
    iconType: 'text',
    iconContent: 'W',
    bgColor: 'bg-[#000]/10',
    textColor: 'text-white',
    description: 'In-depth coverage of current and future trends in technology.',
  },
  {
    id: 'ap-news',
    name: 'AP News',
    handle: 'Tech News',
    feedUrl: 'https://rsshub.app/apnews/topics/technology',
    categories: ['Tech News'],
    iconType: 'text',
    iconContent: 'AP',
    bgColor: 'bg-[#CC0000]/10',
    textColor: 'text-[#CC0000]',
    description: 'Breaking news and global tech coverage from The Associated Press.',
  },
  {
    id: 'bbc-tech',
    name: 'BBC Technology',
    handle: 'Tech News',
    feedUrl: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    categories: ['Tech News'],
    iconType: 'text',
    iconContent: 'BBC',
    bgColor: 'bg-[#BB1919]/10',
    textColor: 'text-[#BB1919]',
    description: 'Technology news from the BBC.',
  },
  {
    id: 'venturebeat',
    name: 'VentureBeat',
    handle: 'Tech News',
    feedUrl: 'https://venturebeat.com/feed/',
    categories: ['Tech News', 'AI & ML'],
    iconType: 'text',
    iconContent: 'VB',
    bgColor: 'bg-[#880CE8]/10',
    textColor: 'text-[#880CE8]',
    description: 'Transformative tech coverage with focus on AI and enterprise.',
  },

  // ─── AI & ML ───────────────────────────────────────────────
  {
    id: 'openai',
    name: 'OpenAI Blog',
    handle: 'AI Research',
    feedUrl: 'https://openai.com/blog/rss.xml',
    categories: ['AI & ML'],
    iconType: 'icon',
    iconContent: 'BrainCircuit',
    bgColor: 'bg-on-background/5',
    description: 'Research and product updates from OpenAI.',
  },
  {
    id: 'google-ai',
    name: 'Google AI Blog',
    handle: 'AI Research',
    feedUrl: 'https://blog.research.google/feeds/posts/default?alt=rss',
    categories: ['AI & ML', 'Tech Giants'],
    iconType: 'text',
    iconContent: 'G',
    bgColor: 'bg-[#4285F4]/10',
    textColor: 'text-[#4285F4]',
    description: 'Latest research and breakthroughs from Google AI.',
  },
  {
    id: 'deepmind',
    name: 'DeepMind Blog',
    handle: 'AI Research',
    feedUrl: 'https://deepmind.google/blog/rss.xml',
    categories: ['AI & ML'],
    iconType: 'text',
    iconContent: 'DM',
    bgColor: 'bg-[#0097A7]/10',
    textColor: 'text-[#0097A7]',
    description: 'AI research from Google DeepMind.',
  },
  {
    id: 'mit-tech-review',
    name: 'MIT Technology Review',
    handle: 'AI & Research',
    feedUrl: 'https://www.technologyreview.com/feed/',
    categories: ['AI & ML', 'Tech News'],
    iconType: 'text',
    iconContent: 'MIT',
    bgColor: 'bg-[#AB0000]/10',
    textColor: 'text-[#AB0000]',
    description: 'Emerging technologies and their impact from MIT.',
  },
  {
    id: 'towards-data-science',
    name: 'Towards Data Science',
    handle: 'AI & Data',
    feedUrl: 'https://towardsdatascience.com/feed',
    categories: ['AI & ML', 'Coding'],
    iconType: 'text',
    iconContent: 'TDS',
    bgColor: 'bg-[#03A87C]/10',
    textColor: 'text-[#03A87C]',
    description: 'Data science, ML, and AI tutorials and deep dives.',
  },

  // ─── Startups & VC ─────────────────────────────────────────
  {
    id: 'y-combinator',
    name: 'Hacker News',
    handle: 'Startups / Dev',
    feedUrl: 'https://news.ycombinator.com/rss',
    categories: ['Startups', 'Coding'],
    iconType: 'text',
    iconContent: 'Y',
    bgColor: 'bg-[#ff6600]/10',
    textColor: 'text-[#ff6600]',
    description: 'Top stories from Y Combinator\'s Hacker News.',
  },
  {
    id: 'product-hunt',
    name: 'Product Hunt',
    handle: 'Products',
    feedUrl: 'https://www.producthunt.com/feed',
    categories: ['Startups', 'Products'],
    iconType: 'text',
    iconContent: 'PH',
    bgColor: 'bg-[#DA552F]/10',
    textColor: 'text-[#DA552F]',
    description: 'The best new products, every day.',
  },
  {
    id: 'a16z',
    name: 'Andreessen Horowitz',
    handle: 'VC / Startups',
    feedUrl: 'https://a16z.com/feed/',
    categories: ['Startups', 'Finance'],
    iconType: 'text',
    iconContent: 'a16z',
    bgColor: 'bg-[#000]/10',
    textColor: 'text-white',
    description: 'Insights from one of Silicon Valley\'s top VC firms.',
  },
  {
    id: 'first-round',
    name: 'First Round Review',
    handle: 'Startups',
    feedUrl: 'https://review.firstround.com/feed.xml',
    categories: ['Startups'],
    iconType: 'text',
    iconContent: 'FR',
    bgColor: 'bg-[#00B67A]/10',
    textColor: 'text-[#00B67A]',
    description: 'In-depth advice for building startups from First Round Capital.',
  },

  // ─── Coding & Dev ──────────────────────────────────────────
  {
    id: 'github-blog',
    name: 'GitHub Blog',
    handle: 'Coding / Dev',
    feedUrl: 'https://github.blog/feed/',
    categories: ['Coding'],
    iconType: 'text',
    iconContent: 'GH',
    bgColor: 'bg-[#333]/10',
    textColor: 'text-white',
    description: 'Updates, ideas, and inspiration from GitHub.',
  },
  {
    id: 'dev-to',
    name: 'DEV Community',
    handle: 'Coding / Dev',
    feedUrl: 'https://dev.to/feed',
    categories: ['Coding'],
    iconType: 'text',
    iconContent: 'DEV',
    bgColor: 'bg-[#000]/10',
    textColor: 'text-white',
    description: 'A community of software developers sharing ideas.',
  },
  {
    id: 'css-tricks',
    name: 'CSS-Tricks',
    handle: 'Frontend',
    feedUrl: 'https://css-tricks.com/feed/',
    categories: ['Coding'],
    iconType: 'text',
    iconContent: 'CSS',
    bgColor: 'bg-[#E8A427]/10',
    textColor: 'text-[#E8A427]',
    description: 'Tips, tricks, and tutorials on web design and CSS.',
  },
  {
    id: 'smashing-magazine',
    name: 'Smashing Magazine',
    handle: 'Frontend / Design',
    feedUrl: 'https://www.smashingmagazine.com/feed/',
    categories: ['Coding'],
    iconType: 'text',
    iconContent: 'SM',
    bgColor: 'bg-[#D33A2C]/10',
    textColor: 'text-[#D33A2C]',
    description: 'Web development and design articles from industry experts.',
  },
  {
    id: 'freecodecamp',
    name: 'freeCodeCamp',
    handle: 'Coding / Tutorials',
    feedUrl: 'https://www.freecodecamp.org/news/rss/',
    categories: ['Coding'],
    iconType: 'text',
    iconContent: 'fCC',
    bgColor: 'bg-[#0A0A23]/10',
    textColor: 'text-[#0A0A23]',
    description: 'Learn to code and build projects for nonprofits.',
  },
  {
    id: 'infoq',
    name: 'InfoQ',
    handle: 'Architecture',
    feedUrl: 'https://feed.infoq.com/infoq/infoq',
    categories: ['Coding'],
    iconType: 'text',
    iconContent: 'IQ',
    bgColor: 'bg-[#007BFF]/10',
    textColor: 'text-[#007BFF]',
    description: 'Professional software development news and tutorials.',
  },
  {
    id: 'lobsters',
    name: 'Lobsters',
    handle: 'Coding / Dev',
    feedUrl: 'https://lobste.rs/rss',
    categories: ['Coding'],
    iconType: 'text',
    iconContent: 'L',
    bgColor: 'bg-[#AC130D]/10',
    textColor: 'text-[#AC130D]',
    description: 'Computing-focused community link aggregation.',
  },
];

// Quick lookup helpers
export const getCatalogSource = (id: string) => SOURCE_CATALOG.find(s => s.id === id);
export const getCatalogFeedUrl = (id: string) => getCatalogSource(id)?.feedUrl;
export const getDefaultSourceIds = (): string[] => [
  'techcrunch', 'the-verge', 'openai', 'google-ai', 'y-combinator', 'github-blog'
];

// Search the catalog by query (name, handle, description, categories)
export function searchCatalog(query: string, excludeIds: string[] = []): CatalogSource[] {
  const q = query.toLowerCase().trim();
  if (!q) return SOURCE_CATALOG.filter(s => !excludeIds.includes(s.id));
  
  return SOURCE_CATALOG.filter(s => {
    if (excludeIds.includes(s.id)) return false;
    return (
      s.name.toLowerCase().includes(q) ||
      s.handle.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.categories.some(c => c.toLowerCase().includes(q))
    );
  });
}
