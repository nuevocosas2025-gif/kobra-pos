import React, { useState } from 'react';
import { Flashlight, RefreshCw, Barcode, Camera, Zap } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface ScannerViewProps {
  onBarcodeDetected: (barcode: string) => void;
  catalogBarcodes: { barcode: string; name: string }[];
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  onBarcodeDetected,
  catalogBarcodes
}) => {
  const [torchOn, setTorchOn] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showSimModal, setShowSimModal] = useState(false);

  const toggleTorch = () => {
    soundEngine.playClick();
    setTorchOn(!torchOn);
  };

  const switchCamera = () => {
    soundEngine.playClick();
    setIsFrontCamera(!isFrontCamera);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      soundEngine.playScannerBeep();
      onBarcodeDetected(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <div className="w-full">
      {/* Scanner Viewport */}
      <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-obsidian-900 border border-emerald-500/30 shadow-xl group">
        {/* Background Camera Simulation / Feed */}
        <div className={`absolute inset-0 bg-gradient-to-b from-slate-900 via-obsidian-950 to-slate-900 flex items-center justify-center transition-all ${torchOn ? 'brightness-125' : ''}`}>
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        {/* Status bar inside scanner */}
        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-obsidian-950/80 backdrop-blur-md border border-emerald-500/30 text-[11px] font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Cámara lista para escanear</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTorch}
              className={`w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-md border transition-all ${
                torchOn 
                  ? 'bg-amber-400 text-obsidian-950 border-amber-300 shadow-md shadow-amber-400/30' 
                  : 'bg-obsidian-950/70 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
              title="Linterna"
            >
              <Flashlight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={switchCamera}
              className="w-7 h-7 rounded-lg bg-obsidian-950/70 text-slate-300 border border-white/10 hover:bg-white/10 flex items-center justify-center backdrop-blur-md transition-transform active:rotate-180"
              title="Girar cámara"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Viewfinder Target Frame */}
        <div className="absolute inset-x-8 top-10 bottom-8 flex flex-col items-center justify-center pointer-events-none">
          <div className="relative w-full max-w-[240px] h-20 rounded-lg border-2 border-dashed border-emerald-400/60 flex items-center justify-center">
            {/* Corner brackets */}
            <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
            <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />

            {/* Laser scanning beam */}
            <div className="scanner-laser" />

            <Barcode className="w-8 h-8 text-emerald-400/30 animate-pulse" />
          </div>
          <p className="mt-2 text-[10px] text-slate-300 font-medium tracking-wide drop-shadow-md bg-obsidian-950/60 px-2 py-0.5 rounded-full">
            Alinea el código de barras en el marco
          </p>
        </div>

        {/* Fast scan simulator trigger */}
        <button
          onClick={() => setShowSimModal(true)}
          className="absolute bottom-2 right-2.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 backdrop-blur-md transition-all active:scale-95 z-20"
        >
          <Zap className="w-3 h-3 text-emerald-400" />
          <span>Escanear Demo</span>
        </button>
      </div>

      {/* Manual Barcode Input Bar */}
      <form onSubmit={handleManualSubmit} className="mt-2 flex items-center gap-1.5">
        <div className="relative flex-1">
          <Barcode className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Digitar código de barras o SKU..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
          />
        </div>
        <button
          type="submit"
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 text-xs font-bold transition-all active:scale-95 shadow-md shadow-emerald-500/20"
        >
          Añadir
        </button>
      </form>

      {/* Simulation Modal for Fast Testing on PC */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm glass-panel rounded-2xl p-4 border border-emerald-500/40 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                Simulador de Escáner Físico
              </h3>
              <button
                onClick={() => setShowSimModal(false)}
                className="w-6 h-6 rounded-full bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Haz clic sobre cualquier producto de la bodega para simular el escaneo con la cámara:
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
                  <span className="text-xs text-slate-200 group-hover:text-emerald-300 font-medium">
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
