import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Volume2, AlertCircle, RefreshCw, Send, Keyboard } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface VoiceAssistantProps {
  onProcessCommand: (transcript: string) => void;
  lastFeedback?: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onProcessCommand,
  lastFeedback
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [supported, setSupported] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showKeyboardInput, setShowKeyboardInput] = useState(false);
  const [manualText, setManualText] = useState('');

  // Refs to avoid stale closures in event handlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const transcriptBufferRef = useRef<string>('');
  const isHandsFreeRef = useRef<boolean>(false);
  const isManuallyStoppedRef = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(false);

  useEffect(() => {
    isHandsFreeRef.current = isHandsFree;
  }, [isHandsFree]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Vocalize feedback via SpeechSynthesis
  const speakFeedback = (text: string) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-PE';
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Silent catch if TTS is disabled or blocked
      }
    }
  };

  // Helper to dispatch parsed command
  const dispatchCommand = (phrase: string) => {
    const clean = phrase.trim();
    if (!clean) return;

    soundEngine.playCashRegister();
    onProcessCommand(clean);
    setStatusMessage(`✅ Procesado: "${clean}"`);
    setLiveTranscript('');
    speakFeedback(clean);

    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  // Initialize SpeechRecognition instance
  const initRecognition = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setSupported(false);
      setErrorMessage('Tu navegador no soporta reconocimiento de voz nativo. Usa los botones rápidos o el teclado.');
      return null;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = isHandsFreeRef.current;
      rec.interimResults = true;
      rec.lang = 'es-PE'; // Spanish Peru / Latam
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
        transcriptBufferRef.current = '';
        soundEngine.playVoicePing(true);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';
          if (item.isFinal) {
            finalText += text + ' ';
          } else {
            interimText += text;
          }
        }

        const currentSpoken = (finalText || interimText).trim();
        if (currentSpoken) {
          setLiveTranscript(currentSpoken);
          transcriptBufferRef.current = currentSpoken;
        }

        // If a final phrase was recognized in single-shot mode, process immediately
        if (finalText.trim() && !isHandsFreeRef.current) {
          const toProcess = finalText.trim();
          transcriptBufferRef.current = '';
          dispatchCommand(toProcess);
          try {
            rec.stop();
          } catch {
            // Already stopped
          }
        }
      };

      rec.onend = () => {
        setIsListening(false);
        soundEngine.playVoicePing(false);

        // If there was captured speech that hasn't been dispatched yet
        if (transcriptBufferRef.current.trim()) {
          const pending = transcriptBufferRef.current.trim();
          transcriptBufferRef.current = '';
          dispatchCommand(pending);
        }

        // In continuous hands-free mode, auto restart if not explicitly stopped
        if (isHandsFreeRef.current && !isManuallyStoppedRef.current) {
          setTimeout(() => {
            if (isHandsFreeRef.current && !isManuallyStoppedRef.current && !isListeningRef.current) {
              try {
                rec.start();
              } catch {
                // Ignore if browser throttles rapid restarts
              }
            }
          }, 400);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'no-speech') {
          // Normal silence, don't show scary error
          return;
        }

        setIsListening(false);
        soundEngine.playError();

        if (event.error === 'not-allowed') {
          setErrorMessage('Permiso de micrófono bloqueado. Toca el candado 🔒 en la barra de tu navegador y autoriza el micrófono.');
        } else if (event.error === 'network') {
          setErrorMessage('Error de conexión al procesar voz. Verifica tu señal.');
        } else if (event.error === 'audio-capture') {
          setErrorMessage('No se detectó ningún micrófono en este equipo.');
        } else {
          setErrorMessage(`Error de voz (${event.error}). Puedes reintentar tocar el mic.`);
        }
      };

      return rec;
    } catch (e) {
      console.error('Failed to create SpeechRecognition:', e);
      setSupported(false);
      return null;
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const toggleListen = async () => {
    setErrorMessage(null);
    soundEngine.playClick();

    if (isListening) {
      // User tapped to stop
      isManuallyStoppedRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          setIsListening(false);
        }
      }
      return;
    }

    // User tapped to start
    isManuallyStoppedRef.current = false;
    setLiveTranscript('');
    transcriptBufferRef.current = '';

    // Request microphone permission explicitly if available
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release immediate test stream
        stream.getTracks().forEach(track => track.stop());
      }
    } catch {
      // Permission might be handled by SpeechRecognition directly
    }

    const rec = initRecognition();
    if (!rec) return;

    recognitionRef.current = rec;

    try {
      rec.start();
    } catch (err) {
      console.warn('Error starting recognition:', err);
      try {
        rec.abort();
        setTimeout(() => rec.start(), 200);
      } catch {
        setIsListening(false);
      }
    }
  };

  const triggerDemoPhrase = (phrase: string) => {
    soundEngine.playVoicePing(true);
    setLiveTranscript(phrase);
    dispatchCommand(phrase);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualText.trim()) {
      dispatchCommand(manualText.trim());
      setManualText('');
      setShowKeyboardInput(false);
    }
  };

  return (
    <div className="w-full my-2.5 p-3.5 rounded-2xl glass-card border border-purple-500/30 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-purple-950/30 shadow-xl space-y-2.5">
      {/* Header bar: Mic Button + Status + Hands-free Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* Big Mic Button with Active Pulsing Ring */}
          <div className="relative">
            <button
              type="button"
              onClick={toggleListen}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-lg ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/50 scale-105'
                  : 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-purple-500/30'
              }`}
              title={!supported ? "Voz no compatible con este navegador" : isListening ? "Toca para detener y procesar" : "Toca para hablar"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            {isListening && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-400 animate-ping" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                VozKobra
              </span>
              <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-mono font-bold ${
                isHandsFree 
                  ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40' 
                  : 'bg-white/10 text-slate-400'
              }`}>
                {isHandsFree ? 'Manos Libres ON' : 'Tocar para Hablar'}
              </span>
            </div>

            {/* Dynamic Status / Speech Preview */}
            <p className="text-xs font-medium text-slate-300 mt-0.5 line-clamp-1">
              {isListening ? (
                <span className="text-emerald-300 font-bold flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {liveTranscript ? `"${liveTranscript}"` : "Escuchando... Di ej: '2 doritos'"}
                </span>
              ) : statusMessage ? (
                <span className="text-emerald-400 font-semibold">{statusMessage}</span>
              ) : (
                lastFeedback || "Toca el micro y habla libremente"
              )}
            </p>
          </div>
        </div>

        {/* Secondary controls: Hands-free toggle & Keyboard mode */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setIsHandsFree(!isHandsFree);
            }}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border transition-all active:scale-95 flex items-center gap-1 ${
              isHandsFree
                ? 'bg-purple-500 text-white border-purple-400 shadow-md shadow-purple-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
            }`}
            title="Activar o desactivar escucha continua"
          >
            <Volume2 className="w-3 h-3" />
            <span className="hidden sm:inline">Manos Libres</span>
          </button>

          <button
            type="button"
            onClick={() => setShowKeyboardInput(!showKeyboardInput)}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 flex items-center justify-center transition-all active:scale-90"
            title="Escribir comando"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Error Banner with Retry advice */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-[11px] text-amber-200 flex items-start gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="leading-snug">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={toggleListen}
            className="text-[10px] font-bold text-amber-300 hover:text-white underline flex items-center gap-1 ml-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* Optional Keyboard Fallback for Noisy Environments */}
      {showKeyboardInput && (
        <form onSubmit={handleManualSubmit} className="flex items-center gap-1.5 animate-slide-up pt-1">
          <input
            type="text"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Escribe orden: ej. '2 morochas', '1 kg papa', 'cobrar'..."
            className="flex-1 px-3 py-1.5 rounded-xl bg-obsidian-950 border border-purple-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center gap-1 shadow-md active:scale-95"
          >
            <Send className="w-3 h-3" />
            <span>Enviar</span>
          </button>
        </form>
      )}

      {/* Fast Voice Chips for Rapid 1-Tap Action */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">
          Rápidos:
        </span>
        <button
          type="button"
          onClick={() => triggerDemoPhrase("dos morochas")}
          className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 text-purple-200 border border-purple-500/20 hover:border-purple-400/40 transition-colors whitespace-nowrap active:scale-95"
        >
          🗣️ "2 morochas"
        </button>
        <button
          type="button"
          onClick={() => triggerDemoPhrase("medio kilo de cebolla")}
          className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 text-purple-200 border border-purple-500/20 hover:border-purple-400/40 transition-colors whitespace-nowrap active:scale-95"
        >
          🗣️ "1/2 kg cebolla"
        </button>
        <button
          type="button"
          onClick={() => triggerDemoPhrase("tres panes a 40 centavos")}
          className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 text-purple-200 border border-purple-500/20 hover:border-purple-400/40 transition-colors whitespace-nowrap active:scale-95"
        >
          🗣️ "3 panes"
        </button>
        <button
          type="button"
          onClick={() => triggerDemoPhrase("vamos a cobrar")}
          className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors whitespace-nowrap active:scale-95 font-bold"
        >
          ⚡ "Cobrar"
        </button>
        <button
          type="button"
          onClick={() => triggerDemoPhrase("vaciar carrito")}
          className="text-[10px] px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors whitespace-nowrap active:scale-95 font-bold"
        >
          🗑️ "Vaciar"
        </button>
      </div>
    </div>
  );
};
