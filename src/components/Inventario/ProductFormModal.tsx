import React, { useState } from 'react';
import { ArrowLeft, Save, Sparkles, Barcode } from 'lucide-react';
import { Product, UnitType } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface ProductFormModalProps {
  product?: Product | null;
  categories: string[];
  currencySymbol: string;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  currencySymbol,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState(product?.category || (categories[0] || 'Abarrotes'));
  const [newCat, setNewCat] = useState('');
  const [unitType, setUnitType] = useState<UnitType>(product?.unitType || 'uds');
  const [costPrice, setCostPrice] = useState<number>(product?.costPrice || 0);
  const [salePrice, setSalePrice] = useState<number>(product?.salePrice || 0);
  const [stock, setStock] = useState<number>(product?.stock || 0);
  const [minStock, setMinStock] = useState<number>(product?.minStock || 5);
  const [barcode, setBarcode] = useState(product?.barcode || '');
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');

  // Calculate profit margin
  const marginPercent = salePrice > 0 && costPrice > 0 
    ? (((salePrice - costPrice) / salePrice) * 100).toFixed(1) 
    : '0';

  const generateBarcode = () => {
    soundEngine.playScannerBeep();
    const randomEan = '775' + Math.floor(1000000000 + Math.random() * 9000000000).toString().slice(0, 10);
    setBarcode(randomEan);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundEngine.playClick();
    const finalCategory = newCat.trim() ? newCat.trim() : category;

    const savedProduct: Product = {
      id: product?.id || `prod-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      category: finalCategory,
      unitType,
      costPrice: Number(costPrice) || 0,
      salePrice: Number(salePrice) || 0,
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 5,
      barcode: barcode.trim() || `GEN-${Date.now().toString().slice(-6)}`,
      imageUrl: imageUrl.trim() || undefined,
      sku: product?.sku || `SKU-${Date.now().toString().slice(-4)}`
    };

    onSave(savedProduct);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end sm:justify-center sm:p-4 animate-fade-in">
      <div className="w-full max-w-md mx-auto bg-obsidian-900 rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between bg-obsidian-950/70">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors active:scale-90"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <h2 className="text-sm font-extrabold text-white">
              {product ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <p className="text-[10px] text-slate-400">Inventario y Precios</p>
          </div>
          <div className="w-8" />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto no-scrollbar space-y-3.5 flex-1">
          {/* Name */}
          <div>
            <label className="text-[10px] font-bold text-slate-300 block mb-1">Nombre del Producto *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Galletas Morochas..."
              className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Descripción (opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Paquete de 6 unidades..."
              className="w-full px-3 py-1.5 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="custom">+ Otra Categoría</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Nueva categoría</label>
              <input
                type="text"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="Nombre de categoría..."
                className="w-full px-3 py-1.5 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Se vende por: Unidad vs Kilos */}
          <div>
            <label className="text-[10px] font-bold text-slate-300 block mb-1.5">Se vende por</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { soundEngine.playClick(); setUnitType('uds'); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                  unitType === 'uds'
                    ? 'bg-emerald-500 text-obsidian-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-white/5 border-white/5 text-slate-400'
                }`}
              >
                <span>✓ Unidad (Uds)</span>
              </button>
              <button
                type="button"
                onClick={() => { soundEngine.playClick(); setUnitType('kg'); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                  unitType === 'kg'
                    ? 'bg-emerald-500 text-obsidian-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-white/5 border-white/5 text-slate-400'
                }`}
              >
                <span>⚖️ Por Kilos (Kg)</span>
              </button>
            </div>
          </div>

          {/* Prices & Profit Margin */}
          <div className="p-3 rounded-2xl bg-obsidian-950 border border-white/10 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Precio Compra ({currencySymbol})</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={costPrice || ''}
                  onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Precio Venta ({currencySymbol}) *</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  required
                  value={salePrice || ''}
                  onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-emerald-400 font-bold font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Profit margin pill */}
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
              <span className="text-slate-400">Margen de Ganancia:</span>
              <span className={`font-mono font-bold ${Number(marginPercent) > 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {marginPercent}% ({currencySymbol} {(salePrice - costPrice).toFixed(2)})
              </span>
            </div>
          </div>

          {/* Stock Actual & Min Stock */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Stock Actual ({unitType})</label>
              <input
                type="number"
                step={unitType === 'kg' ? '0.25' : '1'}
                value={stock || ''}
                onChange={(e) => setStock(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-3 py-1.5 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Stock Mínimo (Alerta)</label>
              <input
                type="number"
                step="1"
                value={minStock || ''}
                onChange={(e) => setMinStock(parseFloat(e.target.value) || 0)}
                placeholder="5"
                className="w-full px-3 py-1.5 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Barcode & Image URL */}
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-400">Código de Barras / SKU</label>
                <button
                  type="button"
                  onClick={generateBarcode}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generar Código</span>
                </button>
              </div>
              <div className="relative">
                <Barcode className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Escanea o escribe código..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">URL de Imagen (Opcional)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-1.5 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-kobra-neon hover:from-emerald-400 hover:to-emerald-300 text-obsidian-950 font-black text-xs tracking-wide shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Guardar Producto</span>
          </button>
        </form>
      </div>
    </div>
  );
};
