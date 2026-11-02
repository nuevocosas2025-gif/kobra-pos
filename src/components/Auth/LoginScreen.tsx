import React, { useState } from 'react';
import { Store, Lock, Mail, Eye, EyeOff, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { loginUser, SUPERADMIN_CREDENTIALS } from '../../services/auth';
import { UserAccount, BusinessProfile } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount, business?: BusinessProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { user, business } = loginUser(email, password);
      soundEngine.playCashRegister();
      onLoginSuccess(user, business);
    } catch (err: unknown) {
      soundEngine.playError();
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error al iniciar sesión.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFillSuperAdmin = () => {
    soundEngine.playClick();
    setEmail(SUPERADMIN_CREDENTIALS.email);
    setPassword(SUPERADMIN_CREDENTIALS.password);
    setError(null);
  };

  const handleQuickFillMerchant = () => {
    soundEngine.playClick();
    setEmail('bodegademo@kobra.pe');
    setPassword('demo123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col justify-center items-center p-4 selection:bg-kobra-neon selection:text-black">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-kobra-neon via-emerald-600 to-obsidian-900 p-0.5 shadow-xl shadow-emerald-500/20 mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-obsidian-950 rounded-[14px] flex items-center justify-center">
              <Store className="w-7 h-7 text-kobra-neon" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            KOBRA
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              POS MASTER
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Acceso seguro a tu punto de venta inteligente
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-kobra-neon hover:from-emerald-400 hover:to-emerald-300 text-obsidian-950 font-black text-xs tracking-wide shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>{isLoading ? 'Ingresando...' : 'Iniciar Sesión'}</span>
          </button>
        </form>

        {/* Quick Demo Access (For User's Convenience) */}
        <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-center">
            Accesos Rápidos de Prueba
          </span>

          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={handleQuickFillSuperAdmin}
              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">👑</span>
                <div>
                  <div className="text-[11px] font-bold text-amber-300">Super Administrador (Heiner)</div>
                  <div className="text-[9px] text-slate-400 font-mono">luisheinercastillo30@gmail.com</div>
                </div>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            </button>

            <button
              type="button"
              onClick={handleQuickFillMerchant}
              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">🏪</span>
                <div>
                  <div className="text-[11px] font-bold text-emerald-300">Cliente / Bodega Demo</div>
                  <div className="text-[9px] text-slate-400 font-mono">bodegademo@kobra.pe</div>
                </div>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
