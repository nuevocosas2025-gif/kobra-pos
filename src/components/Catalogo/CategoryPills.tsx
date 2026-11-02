import React from 'react';
import { soundEngine } from '../../services/soundEngine';

interface CategoryPillsProps {
  categories: { name: string; count: number }[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      <button
        onClick={() => {
          soundEngine.playClick();
          onSelectCategory('all');
        }}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 flex items-center gap-1.5 ${
          selectedCategory === 'all'
            ? 'bg-emerald-500 text-obsidian-950 shadow-md shadow-emerald-500/20'
            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
        }`}
      >
        <span>Todos</span>
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.name;
        return (
          <button
            key={cat.name}
            onClick={() => {
              soundEngine.playClick();
              onSelectCategory(cat.name);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 flex items-center gap-1.5 ${
              isSelected
                ? 'bg-emerald-500 text-obsidian-950 shadow-md shadow-emerald-500/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <span>{cat.name}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              isSelected ? 'bg-obsidian-950/40 text-obsidian-950 font-black' : 'bg-white/10 text-slate-400'
            }`}>
              {cat.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
