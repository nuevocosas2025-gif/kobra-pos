import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  onToggleFilter?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  onToggleFilter
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar por nombre, código..."
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-[10px]"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {onToggleFilter && (
        <button
          onClick={onToggleFilter}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors active:scale-95"
          title="Filtros"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
