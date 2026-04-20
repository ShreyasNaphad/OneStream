import { Trash2, PlaySquare, Rss, Globe, Podcast, Terminal } from "lucide-react";
import type { Source } from "@/store/useSourceStore";

interface SourceCardProps {
  source: Source;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function SourceCard({ source, onToggle, onRemove }: SourceCardProps) {
  // Render icon based on type
  const renderIcon = () => {
    if (source.iconType === 'image' && source.iconContent) {
      return (
        <img
          alt={`${source.name} icon`}
          className="w-full h-full object-cover"
          src={source.iconContent}
        />
      );
    }
    if (source.iconType === 'text' && source.iconContent) {
      return (
        <span className={`${source.textColor || 'text-on-surface'} font-black text-lg`}>
          {source.iconContent}
        </span>
      );
    }
    // generic fallback for iconType === 'icon'
    return (
      <Globe className="w-8 h-8 text-on-surface" />
    );
  };

  // Select handle icon
  const renderHandleIcon = () => {
    const s = source.handle.toLowerCase();
    if (s.includes('x platform')) return <Globe className="w-4 h-4" />;
    if (s.includes('blog') || s.includes('news')) return <Rss className="w-4 h-4" />;
    if (s.includes('tech news')) return <Globe className="w-4 h-4" />;
    if (s.includes('youtube')) return <PlaySquare className="w-4 h-4" />;
    if (s.includes('research')) return <Rss className="w-4 h-4" />;
    if (s.includes('startup') || s.includes('vc')) return <Podcast className="w-4 h-4" />;
    if (s.includes('coding') || s.includes('dev') || s.includes('frontend')) return <Terminal className="w-4 h-4" />;
    if (s.includes('architecture')) return <Terminal className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  return (
    <div className={`group relative p-6 rounded-xl transition-all duration-300 hover:shadow-[0px_20px_40px_rgba(0,0,0,0.4)] ${!source.enabled ? 'opacity-60 bg-surface-container-lowest' : 'bg-surface-container-low hover:bg-surface-container'}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden transition-all ${source.iconType === 'image' ? 'ring-4 ring-primary/5 group-hover:ring-primary/20 bg-white' : source.bgColor || 'bg-surface-container'}`}>
          {renderIcon()}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative inline-flex items-center cursor-pointer" onClick={() => onToggle(source.id)}>
            <input
              type="checkbox"
              className="sr-only peer"
              checked={source.enabled}
              readOnly
            />
            <div className="w-10 h-5 bg-surface-container-highest rounded-full peer-checked:bg-primary-container after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
          </div>
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <h3 className="font-headline font-bold text-lg text-on-surface flex items-center gap-1.5">
          {source.name}
        </h3>
        <div className="flex items-center gap-2 text-outline text-xs font-label uppercase tracking-widest">
          {renderHandleIcon()}
          {source.handle}
        </div>
      </div>

      {/* Category tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {source.category.map(cat => (
          <span key={cat} className="px-2 py-0.5 bg-surface-container-highest rounded text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {cat}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/10">
        <div className="text-xs">
          {!source.enabled ? (
            <span className="text-outline-variant font-bold italic">Disabled</span>
          ) : (
            <span className="text-primary font-bold">Active</span>
          )}
        </div>
        <button 
          onClick={() => onRemove(source.id)} 
          className="p-2 text-outline-variant hover:text-error transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
