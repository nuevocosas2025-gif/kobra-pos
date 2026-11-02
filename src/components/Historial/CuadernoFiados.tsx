import React, { useState } from 'react';
import { MessageSquare, CreditCard, PlusCircle, CheckCircle2 } from 'lucide-react';
import { Debtor, BusinessProfile } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface CuadernoFiadosProps {
  debtors: Debtor[];
  business: BusinessProfile;
  currencySymbol: string;
  onRecordAbono: (debtorId: string, amount: number) => void;
  onAddNewDebtor: (name: string, phone: string, initialDebt: number) => void;
}

export const CuadernoFiados: React.FC<CuadernoFiadosProps> = ({
  debtors,
  business,
  currencySymbol,
  onRecordAbono,
  onAddNewDebtor
}) => {
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  const [abonoAmount, setAbonoAmount] = useState<number>(0);
  const [showNewDebtorModal, setShowNewDebtorModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDebt, setNewDebt] = useState<number>(0);

  const totalOutstanding = debtors.reduce((acc, d) => acc + d.currentBalance, 0);

  // Send friendly WhatsApp collection reminder
  const sendWhatsAppReminder = (debtor: Debtor) => {
    soundEngine.playClick();
    const msg = `Hola *${debtor.name}*, te saludamos cordialmente de *${business.name}* 🛒.\n\n` +
      `Te recordamos que tienes una cuenta pendiente por un saldo de *${currencySymbol} ${debtor.currentBalance.toFixed(2)}* (Ticket ref: ${debtor.lastTicketCode}).\n\n` +
      `Puedes cancelarlo cuando gustes en tienda o cómodamente por Yape/Plin al número: *${business.yapeNumber}* (${business.yapeName}).\n\n` +
      `¡Muchas gracias por tu preferencia! ✨`;

    const cleanPhone = debtor.phone.replace(/[^0-9]/g, '');
    const url = cleanPhone 
      ? `https://wa.me/51${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    window.open(url, '_blank');
  };

  const handleConfirmAbono = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtor || abonoAmount <= 0) return;

    soundEngine.playCashRegister();
    onRecordAbono(selectedDebtor.id, abonoAmount);
    setSelectedDebtor(null);
    setAbonoAmount(0);
  };

  const handleCreateDebtor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    soundEngine.playClick();
    onAddNewDebtor(newName.trim(), newPhone.trim(), newDebt || 0);
    setShowNewDebtorModal(false);
    setNewName('');
    setNewPhone('');
    setNewDebt(0);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-3.5 pb-24">
      {/* Total Balance Outstanding Banner */}
      <div className="p-4 rounded-3xl glass-card border border-purple-500/30 bg-gradient-to-r from-obsidian-900 via-purple-950/20 to-obsidian-950 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total por Cobrar (Fiados)</span>
          <div className="text-2xl font-black font-mono text-purple-400 mt-0.5">
            {currencySymbol} {totalOutstanding.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400">{debtors.length} clientes con cuenta activa</span>
        </div>

        <button
          onClick={() => {
            soundEngine.playClick();
            setShowNewDebtorModal(true);
          }}
          className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Debtors Cards (Matching Video Layout) */}
      <div className="space-y-3">
        {debtors.length === 0 ? (
          <div className="text-center py-8 glass-card rounded-2xl text-slate-500 text-xs">
            ¡Felicitaciones! No tienes fiados ni cuentas pendientes por cobrar.
          </div>
        ) : (
          debtors.map((debtor) => (
            <div
              key={debtor.id}
              className="p-4 rounded-2xl glass-card border border-white/5 hover:border-purple-500/40 transition-all space-y-3"
            >
              {/* Header with Initials, Name & WhatsApp */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-extrabold text-xs shadow-md">
                    {getInitials(debtor.name)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{debtor.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {new Date(debtor.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {debtor.lastTicketCode}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => sendWhatsAppReminder(debtor)}
                  className="w-9 h-9 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition-all active:scale-90"
                  title="Enviar recordatorio cortés por WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>

              {/* Debt Breakdown Rows */}
              <div className="p-2.5 rounded-xl bg-obsidian-950/80 border border-white/5 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Vendido al crédito:</span>
                  <span>{currencySymbol} {debtor.totalCredit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Abonado:</span>
                  <span className="text-emerald-400">{currencySymbol} {debtor.totalPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-black pt-1 border-t border-white/5">
                  <span className="text-white">Saldo pendiente:</span>
                  <span className="text-purple-400">{currencySymbol} {debtor.currentBalance.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Button: Registrar Abono */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedDebtor(debtor);
                  setAbonoAmount(debtor.currentBalance);
                }}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 active:scale-95 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Registrar Abono</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal Registrar Abono */}
      {selectedDebtor && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-5 border border-purple-500/40 shadow-2xl">
            <h3 className="text-sm font-extrabold text-white mb-1">
              Registrar Abono a Cuenta
            </h3>
            <p className="text-xs text-purple-300 font-semibold mb-3">
              {selectedDebtor.name} (Saldo: {currencySymbol} {selectedDebtor.currentBalance.toFixed(2)})
            </p>

            <form onSubmit={handleConfirmAbono} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Monto del Abono ({currencySymbol})</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  max={selectedDebtor.currentBalance}
                  required
                  value={abonoAmount || ''}
                  onChange={(e) => setAbonoAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-base font-bold font-mono text-emerald-400 focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Quick settlement buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAbonoAmount(selectedDebtor.currentBalance)}
                  className="py-1.5 px-2 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30"
                >
                  Liquidar Todo ({currencySymbol}{selectedDebtor.currentBalance.toFixed(2)})
                </button>
                <button
                  type="button"
                  onClick={() => setAbonoAmount(selectedDebtor.currentBalance / 2)}
                  className="py-1.5 px-2 rounded-lg bg-white/5 text-slate-300 text-xs font-bold border border-white/10"
                >
                  Pagar Mitad 50%
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDebtor(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Cliente Fiado */}
      {showNewDebtorModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-5 border border-purple-500/40 shadow-2xl">
            <h3 className="text-sm font-extrabold text-white mb-3">
              Registrar Cliente en Cuaderno de Fiados
            </h3>

            <form onSubmit={handleCreateDebtor} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Carlos Mendizábal..."
                  className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">WhatsApp / Teléfono</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="987654321..."
                  className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Deuda Inicial ({currencySymbol})</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={newDebt || ''}
                  onChange={(e) => setNewDebt(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewDebtorModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
