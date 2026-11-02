import React from 'react';
import { Plus, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Product } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface ProductGridProps {
  products: Product[];
  currencySymbol: string;
  onAddToCart: (product: Product) => void;
  cartTotal: number;
  cartItemCount: number;
  onGoToCheckout: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  currencySymbol,
  onAddToCart,
  cartTotal,
  cartItemCount,
  onGoToCheckout
}) => {
  return (
    <div className="relative pb-24">
      {products.length === 0 ? (
        <div className="py-12 text-center text-slate-500 glass-card rounded-2xl border border-white/5 p-6">
          <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs font-bold text-slate-400">No se encontraron productos</p>
          <p className="text-[11px] text-slate-600 mt-0.5">Intenta con otro término o categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {products.map((prod) => {
            const isLowStock = prod.stock <= prod.minStock;

            return (
              <div
                key={prod.id}
                className="rounded-2xl glass-card border border-white/5 hover:border-emerald-500/30 overflow-hidden flex flex-col justify-between group transition-all"
              >
                {/* Top Image & Badges */}
                <div className="relative aspect-square w-full bg-obsidian-900 overflow-hidden">
                  {prod.imageUrl ? (
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                  )}

                  {/* Stock Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono shadow-md backdrop-blur-md ${
                      isLowStock 
                        ? 'bg-amber-500 text-obsidian-950 border border-amber-400' 
                        : 'bg-obsidian-950/80 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {prod.stock} {prod.unitType}
                    </span>
                  </div>

                  {/* Low stock warning chip */}
                  {isLowStock && (
                    <div className="absolute top-2 right-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/90 text-obsidian-950 flex items-center justify-center shadow" title="Stock bajo">
                        <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
                      </span>
                    </div>
                  )}
                </div>

                {/* Info & Add Action */}
                <div className="p-2.5 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">
                      {prod.category}
                    </span>
                    <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug mt-0.5">
                      {prod.name}
                    </h3>
                  </div>

                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black font-mono text-emerald-400">
                        {currencySymbol} {prod.salePrice.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        por {prod.unitType}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        soundEngine.playScannerBeep();
                        onAddToCart(prod);
                      }}
                      className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 flex items-center justify-center font-bold transition-all active:scale-90 shadow-md shadow-emerald-500/20"
                      title="Añadir al carrito"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Bar (Like in Video) */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-16 left-4 right-4 max-w-md mx-auto z-30 animate-slide-up">
          <button
            onClick={() => {
              soundEngine.playClick();
              onGoToCheckout();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-kobra-neon to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-obsidian-950 font-black text-xs shadow-xl shadow-emerald-500/30 flex items-center justify-between active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-obsidian-950/20 flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
              <span>
                {cartItemCount} {cartItemCount === 1 ? 'producto' : 'productos'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-sm">
              <span>{currencySymbol} {cartTotal.toFixed(2)}</span>
              <span className="text-base font-extrabold">→</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
