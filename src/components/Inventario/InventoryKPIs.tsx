import React from 'react';
import { Package, DollarSign, AlertTriangle } from 'lucide-react';
import { Product } from '../../types';

interface InventoryKPIsProps {
  products: Product[];
  currencySymbol: string;
}

export const InventoryKPIs: React.FC<InventoryKPIsProps> = ({
  products,
  currencySymbol
}) => {
  const totalProducts = products.length;
  const totalValuationCost = products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
  const totalValuationSale = products.reduce((acc, p) => acc + (p.salePrice * p.stock), 0);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  return (
    <div className="grid grid-cols-3 gap-2 my-2">
      {/* Total Products */}
      <div className="p-3 rounded-2xl glass-card border border-white/5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-bold uppercase tracking-wider">Productos</span>
          <Package className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="mt-1 font-mono font-black text-lg text-white">
          {totalProducts}
        </div>
        <span className="text-[9px] text-slate-500">en catálogo</span>
      </div>

      {/* Stock Valuation */}
      <div className="p-3 rounded-2xl glass-card border border-white/5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-bold uppercase tracking-wider">Valor Stock</span>
          <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="mt-1 font-mono font-black text-sm text-cyan-400 truncate">
          {currencySymbol} {totalValuationSale.toFixed(0)}
        </div>
        <span className="text-[9px] text-slate-500">Costo: {currencySymbol}{totalValuationCost.toFixed(0)}</span>
      </div>

      {/* Low Stock Warning */}
      <div className={`p-3 rounded-2xl glass-card border flex flex-col justify-between ${
        lowStockProducts.length > 0 ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/5'
      }`}>
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-bold uppercase tracking-wider">Por Agotar</span>
          <AlertTriangle className={`w-3.5 h-3.5 ${lowStockProducts.length > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
        </div>
        <div className={`mt-1 font-mono font-black text-lg ${lowStockProducts.length > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
          {lowStockProducts.length}
        </div>
        <span className="text-[9px] text-slate-500">bajo mín. stock</span>
      </div>
    </div>
  );
};
