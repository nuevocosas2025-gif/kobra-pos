import React from 'react';
import { Plus, Minus, Edit3, AlertTriangle, PlusCircle } from 'lucide-react';
import { Product } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface StockTableProps {
  products: Product[];
  currencySymbol: string;
  onAdjustStock: (productId: string, delta: number) => void;
  onEditProduct: (product: Product) => void;
  onAddNewProduct: () => void;
}

export const StockTable: React.FC<StockTableProps> = ({
  products,
  currencySymbol,
  onAdjustStock,
  onEditProduct,
  onAddNewProduct
}) => {
  return (
    <div className="space-y-3 pb-24">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white">Listado de Existencias</h2>
        <button
          onClick={() => {
            soundEngine.playClick();
            onAddNewProduct();
          }}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 text-xs font-bold transition-all active:scale-95 shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Product List */}
      <div className="space-y-2">
        {products.map((prod) => {
          const isLow = prod.stock <= prod.minStock;

          return (
            <div
              key={prod.id}
              className="p-3 rounded-2xl glass-card border border-white/5 hover:border-emerald-500/30 transition-all flex items-center justify-between group"
            >
              {/* Product Info */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
                <div className="w-10 h-10 rounded-xl bg-obsidian-900 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {prod.imageUrl ? (
                    <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-slate-500">{prod.name.charAt(0)}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-xs">
                      {prod.name}
                    </h3>
                    {isLow && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30 flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Bajo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                    <span>Venta: <strong className="text-emerald-400">{currencySymbol} {prod.salePrice.toFixed(2)}</strong></span>
                    <span>•</span>
                    <span>Costo: {currencySymbol} {prod.costPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Inline Stock Adjuster */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 bg-obsidian-950/80 px-1.5 py-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onAdjustStock(prod.id, prod.unitType === 'kg' ? -1 : -1);
                    }}
                    className="w-5 h-5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs active:scale-90"
                    title="Reducir stock"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <div className="min-w-[36px] text-center font-mono font-bold text-xs text-white">
                    {prod.stock} <span className="text-[9px] text-slate-400 font-normal">{prod.unitType}</span>
                  </div>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onAdjustStock(prod.id, prod.unitType === 'kg' ? 1 : 1);
                    }}
                    className="w-5 h-5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs active:scale-90"
                    title="Aumentar stock"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onEditProduct(prod);
                  }}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors active:scale-90"
                  title="Editar producto"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
