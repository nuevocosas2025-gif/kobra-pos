import React, { useState } from 'react';
import { Barcode, Camera, Zap, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [cameraActive, setCameraActive] = useState(true);

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
      {/* Real Live Camera Barcode Scanner */}
      <div className="relative">
        {cameraActive ? (
          <RealCameraScanner
            onScanSuccess={(code) => {
              onBarcodeDetected(code);
            }}
          />
        ) : (
          <div className="w-full h-36 rounded-2xl glass-card border border-white/10 flex flex-col items-center justify-center text-slate-400 p-4">
            <Camera className="w-8 h-8 text-slate-600 mb-1.5" />
            <p className="text-xs font-semibold text-slate-300">Cámara pausada</p>
            <button
              onClick={() => {
                soundEngine.playClick();
                setCameraActive(true);
              }}
              className="mt-2 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 font-bold text-xs shadow-md active:scale-95"
            >
              Activar Cámara en Vivo
            </button>
          </div>
        )}

        {/* Toggle Camera button & Demo button */}
        <div className="flex items-center justify-between mt-1 px-1">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setCameraActive(!cameraActive);
            }}
            className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            {cameraActive ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{cameraActive ? 'Minimizar Cámara' : 'Abrir Cámara'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSimModal(true)}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
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
