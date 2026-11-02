import React, { useState } from 'react';
import { ArrowLeft, Check, QrCode, CreditCard, Banknote, BookOpen, Share2, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, PaymentMethod, BusinessProfile, Debtor, SaleTicket } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface CheckoutModalProps {
  items: CartItem[];
  totalAmount: number;
  business: BusinessProfile;
  debtors: Debtor[];
  currencySymbol: string;
  onClose: () => void;
  onCompleteSale: (ticket: SaleTicket, debtorId?: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  items,
  totalAmount,
  business,
  debtors,
  currencySymbol,
  onClose,
  onCompleteSale
}) => {
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [cashTendered, setCashTendered] = useState<number>(totalAmount);
  const [selectedDebtorId, setSelectedDebtorId] = useState<string>(debtors[0]?.id || '');
  const [newDebtorName, setNewDebtorName] = useState('');
  const [newDebtorPhone, setNewDebtorPhone] = useState('');
  const [issuedTicket, setIssuedTicket] = useState<SaleTicket | null>(null);

  const finalTotal = Math.max(0, totalAmount - discount);
  const changeDue = Math.max(0, cashTendered - finalTotal);

  const handleSelectQuickCash = (billAmount: number) => {
    soundEngine.playClick();
    setCashTendered(billAmount);
  };

  const handleConfirmSale = () => {
    soundEngine.playCashRegister();

    // Trigger victory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10B981', '#34D399', '#F59E0B', '#8B5CF6']
      });
    } catch {}

    const ticketNumber = `T-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: SaleTicket = {
      id: `tick-${Date.now()}`,
      ticketNumber,
      timestamp: new Date().toISOString(),
      items: items.map(it => ({
        productId: it.product.id,
        productName: it.product.name,
        quantity: it.quantity,
        unitPrice: it.product.salePrice,
        subtotal: it.subtotal,
        unitType: it.product.unitType
      })),
      subtotal: totalAmount,
      discount,
      total: finalTotal,
      paymentMethod,
      cashReceived: paymentMethod === 'efectivo' ? cashTendered : undefined,
      changeGiven: paymentMethod === 'efectivo' ? changeDue : undefined,
      customerName: paymentMethod === 'fiado' 
        ? (debtors.find(d => d.id === selectedDebtorId)?.name || newDebtorName || 'Cliente Crédito')
        : (paymentMethod === 'yape' ? 'Cliente Yape' : 'Cliente Mostrador'),
      notes: notes.trim() || undefined
    };

    setIssuedTicket(newTicket);
    onCompleteSale(newTicket, paymentMethod === 'fiado' ? selectedDebtorId : undefined);
  };

  // WhatsApp receipt generator
  const handleShareWhatsApp = () => {
    if (!issuedTicket) return;
    const itemsList = issuedTicket.items
      .map(it => `• ${it.quantity} ${it.unitType} x ${it.productName} = ${currencySymbol} ${it.subtotal.toFixed(2)}`)
      .join('\n');

    const msg = `🧾 *TICKET DE VENTA - ${business.name}*\n` +
      `Ticket: ${issuedTicket.ticketNumber}\n` +
      `Fecha: ${new Date(issuedTicket.timestamp).toLocaleString('es-PE')}\n\n` +
      `*DETALLE:*\n${itemsList}\n\n` +
      `*TOTAL: ${currencySymbol} ${issuedTicket.total.toFixed(2)}*\n` +
      `Método de Pago: ${issuedTicket.paymentMethod.toUpperCase()}\n` +
      `${issuedTicket.paymentMethod === 'efectivo' ? `Pagó con: ${currencySymbol} ${issuedTicket.cashReceived?.toFixed(2)} | Vuelto: ${currencySymbol} ${issuedTicket.changeGiven?.toFixed(2)}\n` : ''}` +
      `\n_${business.ticketFooter}_`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end sm:justify-center sm:p-4 animate-fade-in">
      <div className="w-full max-w-md mx-auto bg-obsidian-900 rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between bg-obsidian-950/70">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors active:scale-90"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <h2 className="text-sm font-extrabold text-white">Revisar Orden</h2>
            <p className="text-[10px] text-slate-400">{business.name}</p>
          </div>
          <div className="w-8" /> {/* Spacer */}
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto no-scrollbar space-y-4 flex-1">
          {issuedTicket ? (
            /* Digital Thermal Ticket View */
            <div className="animate-scale-up space-y-4">
              <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-2xl font-mono text-xs border-dashed border-2 border-slate-300 relative">
                {/* Decorative cut notch */}
                <div className="text-center pb-3 border-b border-dashed border-slate-300">
                  <h3 className="font-extrabold text-base uppercase tracking-tight">{business.name}</h3>
                  <p className="text-[10px] text-slate-600">RUC: {business.ruc}</p>
                  <p className="text-[10px] text-slate-600">{business.address}</p>
                  <p className="text-[10px] text-slate-600">Tel: {business.phone}</p>
                  <div className="mt-2 py-0.5 px-2 bg-slate-100 rounded inline-block text-[11px] font-bold">
                    {issuedTicket.ticketNumber}
                  </div>
                </div>

                <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
                  {issuedTicket.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="truncate max-w-[190px]">{it.quantity} {it.unitType} {it.productName}</span>
                      <span className="font-bold">{currencySymbol} {it.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                  {issuedTicket.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Descuento:</span>
                      <span>-{currencySymbol} {issuedTicket.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black pt-1">
                    <span>TOTAL A PAGAR:</span>
                    <span>{currencySymbol} {issuedTicket.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 pt-1">
                    <span>Método:</span>
                    <span className="font-bold uppercase">{issuedTicket.paymentMethod}</span>
                  </div>
                  {issuedTicket.paymentMethod === 'efectivo' && (
                    <>
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span>Recibido:</span>
                        <span>{currencySymbol} {issuedTicket.cashReceived?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-emerald-700">
                        <span>Vuelto:</span>
                        <span>{currencySymbol} {issuedTicket.changeGiven?.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-3 text-center text-[10px] text-slate-600 italic">
                  <p>{business.ticketFooter}</p>
                  <p className="mt-1 font-sans text-[9px] text-slate-400">Generado con KOBRA POS</p>
                </div>
              </div>

              {/* Ticket Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Enviar WhatsApp</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir ESC/POS</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 font-extrabold text-xs transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                Nueva Venta (Completado)
              </button>
            </div>
          ) : (
            /* Normal Checkout Configuration */
            <>
              {/* Total Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-obsidian-900 to-obsidian-900 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total a Cobrar</span>
                  <div className="text-2xl font-black text-white font-mono mt-0.5">
                    {currencySymbol} {finalTotal.toFixed(2)}
                  </div>
                </div>
                {discount > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                    Ahorro: {currencySymbol} {discount.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Discount & Notes */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">Descuento ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0.00"
                    className="w-full px-3 py-1.5 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">Notas / Observaciones</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej: Para llevar..."
                    className="w-full px-3 py-1.5 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Methods Grid */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 mb-2 block">Método de Pago</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { soundEngine.playClick(); setPaymentMethod('efectivo'); }}
                    className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 flex items-center gap-2 ${
                      paymentMethod === 'efectivo'
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md shadow-emerald-500/10'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Efectivo</div>
                      <div className="text-[9px] text-slate-400">Caja chica</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { soundEngine.playClick(); setPaymentMethod('yape'); }}
                    className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 flex items-center gap-2 ${
                      paymentMethod === 'yape'
                        ? 'bg-purple-600/30 border-purple-400 text-white shadow-md shadow-purple-500/20'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Yape</div>
                      <div className="text-[9px] text-slate-400">QR / Celular</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { soundEngine.playClick(); setPaymentMethod('plin'); }}
                    className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 flex items-center gap-2 ${
                      paymentMethod === 'plin'
                        ? 'bg-cyan-600/30 border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Plin</div>
                      <div className="text-[9px] text-slate-400">Interbancario</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { soundEngine.playClick(); setPaymentMethod('tarjeta'); }}
                    className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 flex items-center gap-2 ${
                      paymentMethod === 'tarjeta'
                        ? 'bg-blue-600/30 border-blue-400 text-white shadow-md shadow-blue-500/20'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Tarjeta POS</div>
                      <div className="text-[9px] text-slate-400">Izipay / Niubiz</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { soundEngine.playClick(); setPaymentMethod('fiado'); }}
                    className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 flex items-center gap-2 col-span-2 sm:col-span-1 ${
                      paymentMethod === 'fiado'
                        ? 'bg-amber-600/30 border-amber-400 text-white shadow-md shadow-amber-500/20'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Crédito Fiado</div>
                      <div className="text-[9px] text-slate-400">Cuenta corriente</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Method Details Panel */}
              {paymentMethod === 'efectivo' && (
                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Monto Recibido</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Vuelto: {currencySymbol} {changeDue.toFixed(2)}
                    </span>
                  </div>

                  <input
                    type="number"
                    step="0.5"
                    value={cashTendered || ''}
                    onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-obsidian-900 border border-white/10 text-base font-bold font-mono text-white focus:border-emerald-500 focus:outline-none"
                  />

                  {/* Quick Cash Buttons */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[finalTotal, 10, 20, 50].map((bill) => (
                      <button
                        key={bill}
                        type="button"
                        onClick={() => handleSelectQuickCash(bill)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 ${
                          cashTendered === bill
                            ? 'bg-emerald-500 text-obsidian-950 shadow-md shadow-emerald-500/20'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        {currencySymbol} {bill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(paymentMethod === 'yape' || paymentMethod === 'plin') && (
                <div className="p-4 rounded-2xl bg-obsidian-950 border border-purple-500/30 text-center space-y-2.5">
                  <span className="text-xs font-bold text-slate-300">Escanea para pagar</span>
                  <div className="w-40 h-40 mx-auto rounded-xl bg-white p-2 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <img
                      src={paymentMethod === 'yape' ? (business.yapeQrBase64 || business.yapeQrUrl) : (business.plinQrBase64 || business.plinQrUrl)}
                      alt="Código QR"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-white">
                      {paymentMethod === 'yape' ? business.yapeName : business.plinName}
                    </p>
                    <p className="text-xs font-mono font-bold text-purple-400">
                      {paymentMethod === 'yape' ? business.yapeNumber : business.plinNumber}
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'fiado' && (
                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-amber-500/30 space-y-2.5">
                  <span className="text-xs font-bold text-amber-300">Asignar a Cliente Deudor</span>
                  <select
                    value={selectedDebtorId}
                    onChange={(e) => setSelectedDebtorId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    {debtors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} (Saldo actual: {currencySymbol} {d.currentBalance.toFixed(2)})
                      </option>
                    ))}
                    <option value="new">+ Registrar Nuevo Cliente</option>
                  </select>

                  {selectedDebtorId === 'new' && (
                    <div className="space-y-2 pt-1 border-t border-white/5">
                      <input
                        type="text"
                        value={newDebtorName}
                        onChange={(e) => setNewDebtorName(e.target.value)}
                        placeholder="Nombre completo del cliente..."
                        className="w-full px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white"
                      />
                      <input
                        type="tel"
                        value={newDebtorPhone}
                        onChange={(e) => setNewDebtorPhone(e.target.value)}
                        placeholder="WhatsApp / Teléfono..."
                        className="w-full px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Button */}
              <button
                type="button"
                onClick={handleConfirmSale}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-kobra-neon hover:from-emerald-400 hover:to-emerald-300 text-obsidian-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Confirmar Venta y Emitir Ticket</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
