import React, { useState } from 'react';
import { Barcode, Camera, Zap, Power } from 'lucide-react';
import { RealCameraScanner } from '../Common/RealCameraScanner';
import { soundEngine } from '../../services/soundEngine';

interface ScannerViewProps {
  onBarcodeDetected: (barcode: string) => void;
  catalogBarcodes: { barcode: string; name: string }[];
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  onBarcodeDetected,
  catalogBarcodes
}) => {
  const [manualCode, setManualCode] = useState('');
  const [showSimModal, setShowSimModal] = useState(false);
  // Default to FALSE (camera off initially to save battery and allow user to turn on explicitly)
  const [cameraActive, setCameraActive] = useState(false);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      soundEngine.playScannerBeep();
      onBarcodeDetected(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Camera Barcode Scanner Section */}
      <div className="relative">
        {cameraActive ? (
          <div className="space-y-2 animate-fade-in">
            <RealCameraScanner
              onScanSuccess={(code) => {
                onBarcodeDetected(code);
              }}
              onClose={() => setCameraActive(false)}
            />

            {/* Dedicated full-width Turn Off button below video */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setCameraActive(false);
              }}
              className="w-full py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md"
            >
              <Power className="w-4 h-4 text-rose-400 stroke-[2.5]" />
              <span>Apagar Cámara (Ahorrar Batería)</span>
            </button>
          </div>
        ) : (
          /* Clean Turn On Camera Panel */
          <div className="w-full p-3.5 rounded-2xl glass-card border border-white/10 bg-gradient-to-r from-obsidian-900 via-obsidian-900 to-emerald-950/20 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-inner">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">Escáner de Cámara</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono font-medium">
                    Apagada
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Prende la cámara solo cuando vayas a escanear
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setCameraActive(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <Power className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Prender Cámara</span>
            </button>
          </div>
        )}

        {/* Demo button */}
        <div className="flex items-center justify-end mt-1 px-1">
          <button
            type="button"
            onClick={() => setShowSimModal(true)}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 py-0.5"
          >
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>Probar Códigos Demo</span>
          </button>
        </div>
      </div>

      {/* Manual Barcode Input Bar */}
      <form onSubmit={handleManualSubmit} className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Barcode className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Digitar código de barras o SKU..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
          />
        </div>
        <button
          type="submit"
          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 text-xs font-black transition-all active:scale-95 shadow-md shadow-emerald-500/20"
        >
          Añadir
        </button>
      </form>

      {/* Simulation Modal for Fast Testing on PC or if Camera is Not Available */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-4 border border-emerald-500/40 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                Catálogo de Códigos de Barra
              </h3>
              <button
                type="button"
                onClick={() => setShowSimModal(false)}
                className="w-6 h-6 rounded-full bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Haz clic en cualquiera para simular su lectura instantánea:
            </p>
            <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar">
              {catalogBarcodes.map((item) => (
                <button
                  key={item.barcode}
                  type="button"
                  onClick={() => {
                    soundEngine.playScannerBeep();
                    onBarcodeDetected(item.barcode);
                    setShowSimModal(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/40 flex items-center justify-between transition-all group"
                >
                  <span className="text-xs text-slate-200 group-hover:text-emerald-300 font-medium truncate max-w-[170px]">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 group-hover:text-emerald-400">
                    {item.barcode}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
