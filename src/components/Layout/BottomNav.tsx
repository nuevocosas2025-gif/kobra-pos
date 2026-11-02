import React from 'react';
import { ScanBarcode, LayoutGrid, Package, Receipt, Settings } from 'lucide-react';
import { ActiveTab } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  cartCount: number;
  debtorCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  cartCount,
  debtorCount
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'venta', label: 'Venta', icon: ScanBarcode, badge: cartCount },
    { id: 'catalogo', label: 'Catálogo', icon: LayoutGrid },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'historial', label: 'Historial', icon: Receipt, badge: debtorCount },
    { id: 'ajustes', label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-nav pb-safe transition-all">
      <div className="max-w-md mx-auto grid grid-cols-5 px-1 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playClick();
                onTabChange(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive 
                  ? 'text-emerald-400 font-semibold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active glow pill */}
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
              )}

              <div className="relative mb-0.5">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-obsidian-950 font-black text-[10px] flex items-center justify-center shadow-md animate-scale">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
