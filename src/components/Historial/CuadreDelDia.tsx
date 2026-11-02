import React, { useState } from 'react';
import { TrendingUp, Banknote, QrCode, CreditCard, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { SaleTicket, PaymentMethod } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface CuadreDelDiaProps {
  tickets: SaleTicket[];
  currencySymbol: string;
  onSelectTicket: (ticket: SaleTicket) => void;
}

export const CuadreDelDia: React.FC<CuadreDelDiaProps> = ({
  tickets,
  currencySymbol,
  onSelectTicket
}) => {
  const [timeFilter, setTimeFilter] = useState<'hoy' | 'semana' | 'mes'>('hoy');

  // Filter tickets by date
  const now = new Date();
  const filteredTickets = tickets.filter(t => {
    const tDate = new Date(t.timestamp);
    if (timeFilter === 'hoy') {
      return tDate.toDateString() === now.toDateString();
    } else if (timeFilter === 'semana') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return tDate >= oneWeekAgo;
    } else {
      return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    }
  });

  const totalSales = filteredTickets.reduce((acc, t) => acc + t.total, 0);
  const totalCount = filteredTickets.length;
  const avgTicket = totalCount > 0 ? (totalSales / totalCount) : 0;

  // Breakdown by payment method
  const breakdown: Record<PaymentMethod, number> = {
    efectivo: 0,
    yape: 0,
    plin: 0,
    tarjeta: 0,
    fiado: 0
  };

  filteredTickets.forEach(t => {
    if (breakdown[t.paymentMethod] !== undefined) {
      breakdown[t.paymentMethod] += t.total;
    }
  });

  const getPercent = (amount: number) => {
    if (totalSales === 0) return 0;
    return Math.round((amount / totalSales) * 100);
  };

  return (
    <div className="space-y-3.5 pb-24">
      {/* Time filter pills */}
      <div className="flex items-center gap-1.5 bg-obsidian-900 p-1 rounded-xl border border-white/5">
        {(['hoy', 'semana', 'mes'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => {
              soundEngine.playClick();
              setTimeFilter(filter);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all active:scale-95 ${
              timeFilter === filter
                ? 'bg-emerald-500 text-obsidian-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Cuadre del Día Card */}
      <div className="p-4 rounded-3xl glass-card border border-emerald-500/30 bg-gradient-to-b from-obsidian-900 to-obsidian-950 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-300 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Cuadre de Ventas ({timeFilter})</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">
            {totalCount} tickets
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Venta Total Acumulada</span>
          <div className="text-3xl font-black font-mono text-white mt-0.5">
            {currencySymbol} {totalSales.toFixed(2)}
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-obsidian-950/80 border border-white/5">
          <div>
            <span className="text-[10px] text-slate-400 block">Transacciones</span>
            <span className="text-xs font-mono font-bold text-white">{totalCount} ventas</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Ticket Promedio</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {currencySymbol} {avgTicket.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Visual Proportional Bar */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Desglose por método de pago
          </span>
          <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden flex">
            <div style={{ width: `${getPercent(breakdown.efectivo)}%` }} className="bg-emerald-500" title="Efectivo" />
            <div style={{ width: `${getPercent(breakdown.yape)}%` }} className="bg-purple-500" title="Yape" />
            <div style={{ width: `${getPercent(breakdown.plin)}%` }} className="bg-cyan-500" title="Plin" />
            <div style={{ width: `${getPercent(breakdown.tarjeta)}%` }} className="bg-blue-500" title="Tarjeta" />
            <div style={{ width: `${getPercent(breakdown.fiado)}%` }} className="bg-amber-500" title="Fiado" />
          </div>
        </div>

        {/* Payment Methods Grid Cards (Matching Video Layout) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {/* Efectivo */}
          <div className="p-2.5 rounded-xl bg-obsidian-950 border border-emerald-500/20">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Efectivo ({getPercent(breakdown.efectivo)}%)
              </span>
              <Banknote className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="font-mono font-bold text-xs text-white mt-1">
              {currencySymbol} {breakdown.efectivo.toFixed(2)}
            </div>
          </div>

          {/* Yape */}
          <div className="p-2.5 rounded-xl bg-obsidian-950 border border-purple-500/20">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                Yape ({getPercent(breakdown.yape)}%)
              </span>
              <QrCode className="w-3 h-3 text-purple-400" />
            </div>
            <div className="font-mono font-bold text-xs text-white mt-1">
              {currencySymbol} {breakdown.yape.toFixed(2)}
            </div>
          </div>

          {/* Plin */}
          <div className="p-2.5 rounded-xl bg-obsidian-950 border border-cyan-500/20">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Plin ({getPercent(breakdown.plin)}%)
              </span>
              <QrCode className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="font-mono font-bold text-xs text-white mt-1">
              {currencySymbol} {breakdown.plin.toFixed(2)}
            </div>
          </div>

          {/* Tarjeta */}
          <div className="p-2.5 rounded-xl bg-obsidian-950 border border-blue-500/20">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Tarjeta ({getPercent(breakdown.tarjeta)}%)
              </span>
              <CreditCard className="w-3 h-3 text-blue-400" />
            </div>
            <div className="font-mono font-bold text-xs text-white mt-1">
              {currencySymbol} {breakdown.tarjeta.toFixed(2)}
            </div>
          </div>

          {/* Fiado */}
          <div className="p-2.5 rounded-xl bg-obsidian-950 border border-amber-500/20 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Fiado ({getPercent(breakdown.fiado)}%)
              </span>
              <BookOpen className="w-3 h-3 text-amber-400" />
            </div>
            <div className="font-mono font-bold text-xs text-amber-300 mt-1">
              {currencySymbol} {breakdown.fiado.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-300 px-1">Historial Reciente de Tickets</h3>
        {filteredTickets.length === 0 ? (
          <div className="text-center py-6 glass-card rounded-2xl text-slate-500 text-xs">
            No hay tickets registrados en este periodo.
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => {
                soundEngine.playClick();
                onSelectTicket(ticket);
              }}
              className="w-full text-left p-3 rounded-2xl glass-card border border-white/5 hover:border-emerald-500/30 transition-all flex items-center justify-between group active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-obsidian-900 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-emerald-400">
                  {ticket.ticketNumber.replace('T-', '')}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{ticket.ticketNumber}</span>
                    <span className="text-[10px] text-slate-400">• {ticket.customerName || 'Cliente'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(ticket.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>•</span>
                    <span className="uppercase font-semibold text-slate-400">{ticket.paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-white">
                  {currencySymbol} {ticket.total.toFixed(2)}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
