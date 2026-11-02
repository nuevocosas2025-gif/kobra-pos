import React from 'react';
import { ArrowLeft, Share2, Printer } from 'lucide-react';
import { SaleTicket, BusinessProfile } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface TicketDetailModalProps {
  ticket: SaleTicket;
  business: BusinessProfile;
  currencySymbol: string;
  onClose: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  business,
  currencySymbol,
  onClose
}) => {
  const handleShare = () => {
    soundEngine.playClick();
    const itemsList = ticket.items
      .map(it => `• ${it.quantity} ${it.unitType} x ${it.productName} = ${currencySymbol} ${it.subtotal.toFixed(2)}`)
      .join('\n');

    const msg = `🧾 *TICKET DE VENTA - ${business.name}*\n` +
      `Ticket: ${ticket.ticketNumber}\n` +
      `Fecha: ${new Date(ticket.timestamp).toLocaleString('es-PE')}\n\n` +
      `*DETALLE:*\n${itemsList}\n\n` +
      `*TOTAL: ${currencySymbol} ${ticket.total.toFixed(2)}*\n` +
      `Método: ${ticket.paymentMethod.toUpperCase()}\n` +
      `\n_${business.ticketFooter}_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-obsidian-900 rounded-3xl border border-white/10 shadow-2xl p-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-white">Comprobante Digital</span>
          <div className="w-8" />
        </div>

        <div className="overflow-y-auto no-scrollbar space-y-4 flex-1">
          {/* Thermal Paper View */}
          <div className="bg-white text-slate-900 rounded-2xl p-4 shadow-xl font-mono text-xs border-dashed border-2 border-slate-300">
            <div className="text-center pb-2.5 border-b border-dashed border-slate-300">
              <h3 className="font-extrabold text-sm uppercase">{business.name}</h3>
              <p className="text-[10px] text-slate-600">RUC: {business.ruc}</p>
              <p className="text-[10px] text-slate-600">{business.address}</p>
              <div className="mt-1 py-0.5 px-2 bg-slate-100 rounded inline-block text-[11px] font-bold">
                {ticket.ticketNumber}
              </div>
            </div>

            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              {ticket.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate max-w-[170px]">{it.quantity} {it.unitType} {it.productName}</span>
                  <span className="font-bold">{currencySymbol} {it.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between text-sm font-black pt-0.5">
                <span>TOTAL:</span>
                <span>{currencySymbol} {ticket.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>Método:</span>
                <span className="font-bold uppercase">{ticket.paymentMethod}</span>
              </div>
              {ticket.paymentMethod === 'efectivo' && ticket.cashReceived && (
                <>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>Recibido:</span>
                    <span>{currencySymbol} {ticket.cashReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-emerald-700">
                    <span>Vuelto:</span>
                    <span>{currencySymbol} {(ticket.changeGiven || 0).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 text-center text-[10px] text-slate-500 italic">
              <p>{new Date(ticket.timestamp).toLocaleString('es-PE')}</p>
              <p className="mt-0.5">{business.ticketFooter}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShare}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => window.print()}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
