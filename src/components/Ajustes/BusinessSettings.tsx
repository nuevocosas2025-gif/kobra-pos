import React, { useState } from 'react';
import { Save, Store, QrCode, Lock, Unlock, DollarSign, Check } from 'lucide-react';
import { BusinessProfile, CashShift } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface BusinessSettingsProps {
  business: BusinessProfile;
  shift: CashShift;
  onSaveBusiness: (biz: BusinessProfile) => void;
  onToggleShift: (isOpen: boolean, floatAmount: number) => void;
}

export const BusinessSettings: React.FC<BusinessSettingsProps> = ({
  business,
  shift,
  onSaveBusiness,
  onToggleShift
}) => {
  const [formData, setFormData] = useState<BusinessProfile>(business);
  const [showSavedPill, setShowSavedPill] = useState(false);
  const [floatInput, setFloatInput] = useState<number>(shift.initialFloat);

  const handleChange = (field: keyof BusinessProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playClick();
    onSaveBusiness(formData);
    setShowSavedPill(true);
    setTimeout(() => setShowSavedPill(false), 2500);
  };

  const handleShiftChange = () => {
    soundEngine.playClick();
    onToggleShift(!shift.isOpen, floatInput);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Shift Control Banner */}
      <div className={`p-4 rounded-3xl glass-card border transition-all ${
        shift.isOpen ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              shift.isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {shift.isOpen ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">
                {shift.isOpen ? 'Caja Abierta (Turno Activo)' : 'Caja Cerrada'}
              </h3>
              <p className="text-[10px] text-slate-400">
                Fondo inicial: {formData.currencySymbol} {shift.initialFloat.toFixed(2)}
              </p>
            </div>
          </div>

          <button
            onClick={handleShiftChange}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md ${
              shift.isOpen
                ? 'bg-amber-500 hover:bg-amber-400 text-obsidian-950'
                : 'bg-emerald-500 hover:bg-emerald-400 text-obsidian-950'
            }`}
          >
            {shift.isOpen ? 'Cerrar Caja' : 'Abrir Caja'}
          </button>
        </div>

        {!shift.isOpen && (
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
            <label className="text-[10px] font-bold text-slate-400">Sencillo inicial en caja:</label>
            <input
              type="number"
              step="5"
              value={floatInput || ''}
              onChange={(e) => setFloatInput(parseFloat(e.target.value) || 0)}
              className="w-24 px-2 py-1 rounded-lg bg-obsidian-950 border border-white/10 text-xs font-mono font-bold text-white"
            />
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* Datos del Negocio */}
        <div className="p-4 rounded-3xl glass-card border border-white/5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Store className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Datos del Negocio
            </h3>
          </div>

          {/* Logo del negocio con selector de foto */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Logo del Negocio</label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-obsidian-900 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {formData.logoBase64 || formData.logoUrl ? (
                  <img src={formData.logoBase64 || formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-5 h-5 text-slate-600" />
                )}
              </div>
              <label className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold cursor-pointer transition-colors active:scale-95">
                <span>Subir Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const r = new FileReader();
                      r.onload = () => {
                        setFormData(prev => ({ ...prev, logoBase64: r.result as string }));
                        soundEngine.playClick();
                      };
                      r.readAsDataURL(f);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Nombre Comercial *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">RUC / DNI</label>
              <input
                type="text"
                value={formData.ruc}
                onChange={(e) => handleChange('ruc', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Teléfono / WhatsApp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Dirección del Local</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Mensaje de Pie de Ticket</label>
            <input
              type="text"
              value={formData.ticketFooter}
              onChange={(e) => handleChange('ticketFooter', e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white"
            />
          </div>

          {/* Moneda de Caja */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1.5">Moneda de Caja</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { sym: 'S/', code: 'PEN', label: 'Soles (S/)' },
                { sym: '$', code: 'USD', label: 'Dólares ($)' },
                { sym: '€', code: 'EUR', label: 'Euros (€)' },
              ].map((cur) => (
                <button
                  key={cur.sym}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setFormData(prev => ({ ...prev, currencySymbol: cur.sym, currency: cur.code }));
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1 ${
                    formData.currencySymbol === cur.sym
                      ? 'bg-emerald-500 text-obsidian-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-white/5 border-white/5 text-slate-400'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>{cur.sym}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Métodos de Pago Digitales */}
        <div className="p-4 rounded-3xl glass-card border border-white/5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <QrCode className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Billeteras Digitales (QR)
            </h3>
          </div>

          {/* Yape Config */}
          <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-purple-500/20 space-y-3">
            <span className="text-xs font-bold text-purple-300">Configuración Yape</span>

            {/* Subida directa de imagen del QR de Yape */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-white p-1 border border-purple-400 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                {formData.yapeQrBase64 || formData.yapeQrUrl ? (
                  <img src={formData.yapeQrBase64 || formData.yapeQrUrl} alt="QR Yape" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[9px] text-slate-400 font-bold">Sin QR</span>
                )}
              </div>
              <div>
                <label className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer transition-colors active:scale-95 inline-block">
                  <span>Subir Foto de mi QR Yape</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const r = new FileReader();
                        r.onload = () => {
                          const base64 = r.result as string;
                          setFormData(prev => ({ ...prev, yapeQrBase64: base64, yapeQrUrl: base64 }));
                          soundEngine.playClick();
                        };
                        r.readAsDataURL(f);
                      }
                    }}
                  />
                </label>
                <p className="text-[10px] text-slate-400 mt-1">
                  Sube la captura de tu QR de Yape para que tus clientes paguen al escanear.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Titular Yape..."
                value={formData.yapeName}
                onChange={(e) => handleChange('yapeName', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white"
              />
              <input
                type="tel"
                placeholder="Número Yape..."
                value={formData.yapeNumber}
                onChange={(e) => handleChange('yapeNumber', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Plin Config */}
          <div className="p-3 rounded-2xl bg-obsidian-950 border border-cyan-500/20 space-y-2">
            <span className="text-xs font-bold text-cyan-300">Configuración Plin</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Titular Plin..."
                value={formData.plinName}
                onChange={(e) => handleChange('plinName', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white"
              />
              <input
                type="tel"
                placeholder="Número Plin..."
                value={formData.plinNumber}
                onChange={(e) => handleChange('plinNumber', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-kobra-neon hover:from-emerald-400 hover:to-emerald-300 text-obsidian-950 font-black text-xs tracking-wide shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {showSavedPill ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>¡Configuración Guardada!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Guardar Ajustes</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
