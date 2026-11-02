import React, { useEffect, useRef, useState, useId } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, Flashlight, AlertCircle, RefreshCw, X } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface RealCameraScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose?: () => void;
  active?: boolean;
}

export const RealCameraScanner: React.FC<RealCameraScannerProps> = ({
  onScanSuccess,
  onClose,
  active = true
}) => {
  const containerId = useId().replace(/:/g, '_');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    let isMounted = true;
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        setErrorMessage(null);
        const config = {
          fps: 12,
          qrbox: { width: 260, height: 130 },
          aspectRatio: 1.777778,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE
          ]
        };

        const facing = isFrontCamera ? 'user' : 'environment';

        await scanner.start(
          { facingMode: facing },
          config,
          (decodedText) => {
            const now = Date.now();
            // Debounce scan to avoid duplicate reads within 1.5 seconds
            if (now - lastScanTimeRef.current > 1500) {
              lastScanTimeRef.current = now;
              soundEngine.playScannerBeep();
              onScanSuccess(decodedText);
            }
          },
          () => {
            // Frame scan without barcode, normal silent ignore
          }
        );

        if (isMounted) {
          setIsScanning(true);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setIsScanning(false);
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
            setErrorMessage('Permiso de cámara denegado. Habilita la cámara en los permisos de tu navegador.');
          } else if (msg.includes('NotFoundError')) {
            setErrorMessage('No se encontró ninguna cámara disponible en tu dispositivo.');
          } else {
            setErrorMessage('No se pudo acceder a la cámara en vivo. Verifica que estés usando HTTPS.');
          }
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scanner.isScanning) {
        scanner.stop().then(() => scanner.clear()).catch(() => {});
      } else {
        scanner.clear();
      }
    };
  }, [containerId, isFrontCamera, active, onScanSuccess]);

  const toggleTorch = async () => {
    if (!scannerRef.current || !isScanning) return;
    try {
      soundEngine.playClick();
      const nextState = !torchOn;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (scannerRef.current as any).applyVideoConstraints({
        advanced: [{ torch: nextState }]
      });
      setTorchOn(nextState);
    } catch {
      // Torch not supported on some front cameras or browser versions
    }
  };

  const switchCamera = () => {
    soundEngine.playClick();
    setIsFrontCamera(!isFrontCamera);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-obsidian-900 border border-emerald-500/40 shadow-2xl">
      {/* HTML5 QR Code Mount Node */}
      <div 
        id={containerId} 
        className="w-full aspect-[4/3] max-h-64 sm:max-h-72 overflow-hidden bg-black flex items-center justify-center relative [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
      />

      {/* Target Crosshair & Laser beam */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
          <div className="relative w-64 h-32 rounded-xl border-2 border-dashed border-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400" />
            <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400" />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400" />
            <div className="scanner-laser" />
          </div>
          <span className="mt-2 text-[10px] font-bold text-white bg-obsidian-950/80 px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/10">
            Apunta la cámara al código de barras
          </span>
        </div>
      )}

      {/* Top Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-obsidian-950/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-bold text-emerald-400 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{isScanning ? 'Cámara Activa' : 'Iniciando Cámara...'}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTorch}
            className={`w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-md border transition-all active:scale-90 ${
              torchOn 
                ? 'bg-amber-400 text-obsidian-950 border-amber-300 shadow-lg shadow-amber-400/40' 
                : 'bg-obsidian-950/80 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
            title="Linterna"
          >
            <Flashlight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={switchCamera}
            className="w-8 h-8 rounded-xl bg-obsidian-950/80 text-slate-300 border border-white/10 hover:bg-white/10 flex items-center justify-center backdrop-blur-md transition-transform active:rotate-180"
            title="Cambiar Cámara"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-obsidian-950/80 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center backdrop-blur-md active:scale-90"
              title="Cerrar escáner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error Message Display if Permission Denied */}
      {errorMessage && (
        <div className="absolute inset-0 bg-obsidian-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-30">
          <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
          <h4 className="text-xs font-bold text-white mb-1">Permiso de Cámara Requerido</h4>
          <p className="text-[11px] text-slate-400 max-w-[240px] mb-3 leading-relaxed">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Reintentar Permiso</span>
          </button>
        </div>
      )}
    </div>
  );
};
