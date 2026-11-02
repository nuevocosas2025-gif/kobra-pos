import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Volume2 } from 'lucide-react';
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
  const [supported, setSupported] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recognition, setRecognition] = useState<any>(null);
  const [liveTranscript, setLiveTranscript] = useState('');

  useEffect(() => {
    // Check Web Speech API support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'es-PE'; // Spanish (Peru / Latam)

      rec.onstart = () => {
        setIsListening(true);
        soundEngine.playVoicePing(true);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onresult = (event: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const text = Array.from(event.results).map((r: any) => r[0].transcript).join('');
        setLiveTranscript(text);
      };

      rec.onend = () => {
        setIsListening(false);
        soundEngine.playVoicePing(false);
      };

      rec.onerror = () => {
        setIsListening(false);
        soundEngine.playError();
      };

      setRecognition(rec);
    } else {
      setSupported(false);
    }
  }, []);

  const toggleListen = () => {
    if (!recognition) {
      // Fallback demo simulation
      triggerDemoPhrase("2 morochas snack a 2 soles");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      setLiveTranscript('');
      try {
        recognition.start();
      } catch {
        // If already started or restricted
        setIsListening(false);
      }
    }
  };

  const triggerDemoPhrase = (phrase: string) => {
    soundEngine.playVoicePing(true);
    setLiveTranscript(phrase);
    setTimeout(() => {
      onProcessCommand(phrase);
      soundEngine.playVoicePing(false);
    }, 300);
  };

  return (
    <div className="w-full my-2.5 p-3 rounded-2xl glass-card border border-kobra-purple/30 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-purple-950/20 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={toggleListen}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-md ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-red-500/40'
                  : 'bg-kobra-purple hover:bg-purple-500 text-white shadow-purple-500/20'
              }`}
              title={supported ? "Hablar con VozKobra" : "Probar comando de voz"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            {isListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-400 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                VozKobra
              </span>
              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                Manos Libres
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isListening 
                ? (liveTranscript || "Escuchando... Di ej: '2 doritos'...")
                : (lastFeedback || "Toca el mic o una sugerencia rápida:")}
            </p>
          </div>
        </div>

        {/* Live speech feedback pill */}
        <div className="hidden sm:flex items-center gap-1 text-[10px] text-purple-300">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Voz activa</span>
        </div>
      </div>

      {/* Quick Test Voice Chips for Merchant Convenience */}
      <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => triggerDemoPhrase("dos morochas")}
          className="text-[10px] px-2 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 text-purple-200 border border-purple-500/20 hover:border-purple-400/40 transition-colors whitespace-nowrap active:scale-95"
        >
          🗣️ "2 morochas"
        </button>
        <button
          onClick={() => triggerDemoPhrase("medio kilo de cebolla")}
          className="text-[10px] px-2 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 text-purple-200 border border-purple-500/20 hover:border-purple-400/40 transition-colors whitespace-nowrap active:scale-95"
        >
          🗣️ "1/2 kg cebolla"
        </button>
        <button
          onClick={() => triggerDemoPhrase("tres panes a 40 centavos")}
          className="text-[10px] px-2 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 text-purple-200 border border-purple-500/20 hover:border-purple-400/40 transition-colors whitespace-nowrap active:scale-95"
        >
          🗣️ "3 panes"
        </button>
        <button
          onClick={() => triggerDemoPhrase("vamos a cobrar")}
          className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors whitespace-nowrap active:scale-95"
        >
          ⚡ "Cobrar"
        </button>
      </div>
    </div>
  );
};
