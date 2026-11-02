import React from 'react';
import { Volume2, VolumeX, Bell, Store, LogOut } from 'lucide-react';
import { BusinessProfile, CashShift, UserAccount } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface HeaderProps {
  business: BusinessProfile;
  shift: CashShift;
  currentUser: UserAccount | null;
  lowStockCount: number;
  onOpenShiftModal: () => void;
  onOpenNotifications: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSuperAdmin?: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  business,
  shift,
  currentUser,
  lowStockCount,
  onOpenShiftModal,
  onOpenNotifications,
  isMuted,
  onToggleMute,
  onOpenSuperAdmin,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 py-2.5 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand & Shift Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-kobra-neon to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden">
            {business.logoBase64 || business.logoUrl ? (
              <img src={business.logoBase64 || business.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-5 h-5 text-obsidian-950 font-bold" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                KOBRA
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  POS
                </span>
              </h1>
              {currentUser?.role === 'superadmin' && (
                <button
                  onClick={onOpenSuperAdmin}
                  className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/30 flex items-center gap-0.5 animate-pulse"
                  title="Volver al Panel Super Admin"
                >
                  <span>👑 Admin</span>
                </button>
              )}
            </div>
            <button 
              onClick={onOpenShiftModal}
              className="flex items-center gap-1.5 text-xs text-left group transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${shift.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white uppercase tracking-wider">
                {shift.isOpen ? 'Caja Abierta' : 'Caja Cerrada'}
              </span>
              <span className="text-[10px] text-slate-500 truncate max-w-[110px]">({business.name})</span>
            </button>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              onToggleMute();
              soundEngine.playClick();
            }}
            title={isMuted ? "Activar sonidos" : "Silenciar"}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-transform active:scale-90"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onOpenNotifications}
            className="relative w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-transform active:scale-90"
            title="Alertas de Inventario"
          >
            <Bell className="w-4 h-4" />
            {lowStockCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-obsidian-950 font-bold text-[9px] flex items-center justify-center shadow-md">
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onLogout();
            }}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 flex items-center justify-center transition-transform active:scale-90"
            title="Cerrar Sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
