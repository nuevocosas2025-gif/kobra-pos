import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag, Sparkles } from 'lucide-react';
import { CartItem } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface CartListProps {
  items: CartItem[];
  currencySymbol: string;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onSwitchToCatalog: () => void;
}

export const CartList: React.FC<CartListProps> = ({
  items,
  currencySymbol,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSwitchToCatalog
}) => {
  const totalItemsCount = items.reduce((acc, it) => acc + (it.product.unitType === 'kg' ? 1 : it.quantity), 0);

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between py-2 border-b border-white/5 mb-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white tracking-tight">Carrito actual</h2>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold">
            {totalItemsCount} {totalItemsCount === 1 ? 'ítem' : 'ítems'}
          </span>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onClearCart();
            }}
            className="flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors active:scale-95 px-2 py-1 rounded-lg hover:bg-rose-500/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vaciar</span>
          </button>
        )}
      </div>

      {/* Item List */}
      {items.length === 0 ? (
        <div className="py-8 px-4 text-center rounded-2xl glass-card border border-white/5 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 mb-2.5">
            <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
          </div>
          <p className="text-xs font-bold text-slate-300 mb-1">El carrito está vacío</p>
          <p className="text-[11px] text-slate-500 max-w-[220px] mb-3">
            Escanea un código de barras arriba, dicta con VozKobra o añade desde el catálogo.
          </p>
          <button
            onClick={() => {
              soundEngine.playClick();
              onSwitchToCatalog();
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-emerald-400 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Abrir Catálogo</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto no-scrollbar pb-2">
          {items.map(({ product, quantity, subtotal }) => (
            <div
              key={product.id}
              className="p-2.5 rounded-2xl glass-card border border-white/5 hover:border-emerald-500/30 transition-all flex items-center justify-between group"
            >
              {/* Product Thumbnail & Details */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
                <div className="w-11 h-11 rounded-xl bg-obsidian-900 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                    />
                  ) : (
                    <ShoppingBag className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-white truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <span>{currencySymbol} {product.salePrice.toFixed(2)} c/{product.unitType}</span>
                  </div>
                </div>
              </div>

              {/* Quantity Stepper & Subtotal */}
              <div className="flex items-center gap-3">
                {/* Stepper */}
                <div className="flex items-center gap-1.5 bg-obsidian-950/80 px-1.5 py-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      if (quantity <= (product.unitType === 'kg' ? 0.25 : 1)) {
                        onRemoveItem(product.id);
                      } else {
                        onUpdateQuantity(product.id, product.unitType === 'kg' ? -0.25 : -1);
                      }
                    }}
                    className="w-5 h-5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center text-xs active:scale-90"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <span className="min-w-[28px] text-center font-mono font-bold text-xs text-white">
                    {product.unitType === 'kg' ? quantity.toFixed(2) : quantity}
                  </span>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onUpdateQuantity(product.id, product.unitType === 'kg' ? 0.25 : 1);
                    }}
                    className="w-5 h-5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center text-xs active:scale-90"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-[55px]">
                  <span className="font-mono font-bold text-xs text-emerald-400">
                    {currencySymbol} {subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
