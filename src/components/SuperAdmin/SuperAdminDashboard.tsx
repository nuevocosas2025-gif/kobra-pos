import React, { useState } from 'react';
import { 
  Store, Plus, Edit, LogOut, Check,
  QrCode, Image as ImageIcon, UserCheck, Trash2
} from 'lucide-react';
import { TenantStore, BusinessProfile } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface SuperAdminDashboardProps {
  tenants: TenantStore[];
  adminEmail: string;
  onSelectTenantToOperate: (tenant: TenantStore) => void;
  onSaveTenant: (tenant: TenantStore) => void;
  onDeleteTenant: (tenantId: string) => void;
  onLogout: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  tenants,
  adminEmail,
  onSelectTenantToOperate,
  onSaveTenant,
  onDeleteTenant,
  onLogout
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantStore | null>(null);

  // Form State
  const [storeName, setStoreName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [plan, setPlan] = useState<'standard' | 'pro' | 'vitalicio'>('pro');
  const [ruc, setRuc] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [ticketFooter, setTicketFooter] = useState('¡Gracias por su compra! Vuelva pronto.');
  const [currencySymbol, setCurrencySymbol] = useState('S/');
  const [currency, setCurrency] = useState('PEN');

  // Images in Base64
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [yapeName, setYapeName] = useState('');
  const [yapeNumber, setYapeNumber] = useState('');
  const [yapeQrPreview, setYapeQrPreview] = useState<string>('');

  const [plinName, setPlinName] = useState('');
  const [plinNumber, setPlinNumber] = useState('');
  const [plinQrPreview, setPlinQrPreview] = useState<string>('');

  const handleOpenCreate = () => {
    soundEngine.playClick();
    setEditingTenant(null);
    setStoreName('');
    setOwnerEmail('');
    setOwnerPassword('kobra' + Math.floor(100 + Math.random() * 900));
    setPlan('pro');
    setRuc('20' + Math.floor(100000000 + Math.random() * 900000000));
    setPhone('');
    setAddress('');
    setTicketFooter('¡Gracias por su compra! Vuelva pronto.');
    setCurrencySymbol('S/');
    setCurrency('PEN');
    setLogoPreview('');
    setYapeName('');
    setYapeNumber('');
    setYapeQrPreview('https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=YAPE-DEMO');
    setPlinName('');
    setPlinNumber('');
    setPlinQrPreview('');
    setShowModal(true);
  };

  const handleOpenEdit = (tenant: TenantStore) => {
    soundEngine.playClick();
    setEditingTenant(tenant);
    setStoreName(tenant.business.name);
    setOwnerEmail(tenant.ownerEmail);
    setOwnerPassword(tenant.ownerPassword);
    setPlan(tenant.plan);
    setRuc(tenant.business.ruc);
    setPhone(tenant.business.phone);
    setAddress(tenant.business.address);
    setTicketFooter(tenant.business.ticketFooter);
    setCurrencySymbol(tenant.business.currencySymbol);
    setCurrency(tenant.business.currency);
    setLogoPreview(tenant.business.logoBase64 || tenant.business.logoUrl || '');
    setYapeName(tenant.business.yapeName);
    setYapeNumber(tenant.business.yapeNumber);
    setYapeQrPreview(tenant.business.yapeQrBase64 || tenant.business.yapeQrUrl || '');
    setPlinName(tenant.business.plinName);
    setPlinNumber(tenant.business.plinNumber);
    setPlinQrPreview(tenant.business.plinQrBase64 || tenant.business.plinQrUrl || '');
    setShowModal(true);
  };

  // Helper for image upload to base64
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (base64: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setter(reader.result as string);
        soundEngine.playClick();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !ownerEmail.trim() || !ownerPassword.trim()) return;

    soundEngine.playCashRegister();

    const tenantId = editingTenant ? editingTenant.id : `tenant-${Date.now()}`;
    const businessData: BusinessProfile = {
      id: tenantId,
      name: storeName.trim(),
      ruc: ruc.trim(),
      phone: phone.trim(),
      address: address.trim(),
      ticketFooter: ticketFooter.trim(),
      currency,
      currencySymbol,
      logoBase64: logoPreview || undefined,
      yapeName: yapeName.trim(),
      yapeNumber: yapeNumber.trim(),
      yapeQrBase64: yapeQrPreview || undefined,
      yapeQrUrl: yapeQrPreview || undefined,
      plinName: plinName.trim(),
      plinNumber: plinNumber.trim(),
      plinQrBase64: plinQrPreview || undefined,
      plinQrUrl: plinQrPreview || undefined
    };

    const savedTenant: TenantStore = {
      id: tenantId,
      business: businessData,
      ownerEmail: ownerEmail.trim().toLowerCase(),
      ownerPassword: ownerPassword.trim(),
      status: 'active',
      plan,
      createdAt: editingTenant ? editingTenant.createdAt : new Date().toISOString()
    };

    onSaveTenant(savedTenant);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 p-4 max-w-xl mx-auto space-y-4 pb-20 animate-fade-in">
      {/* Super Admin Master Header */}
      <div className="p-4 rounded-3xl glass-card border border-amber-500/30 bg-gradient-to-r from-obsidian-900 via-amber-950/20 to-obsidian-900 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-obsidian-950 font-black text-xl shadow-lg shadow-amber-500/20">
            👑
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-white">Super Administrador</h1>
              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                KOBRA Master
              </span>
            </div>
            <p className="text-xs text-amber-300/80 font-mono">{adminEmail}</p>
          </div>
        </div>

        <button
          onClick={() => {
            soundEngine.playClick();
            onLogout();
          }}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/5 transition-all active:scale-95"
          title="Cerrar sesión de Super Admin"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Action Bar & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white">Negocios / Clientes Activos</h2>
          <p className="text-[11px] text-slate-400">{tenants.length} licencias configuradas</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-kobra-neon hover:from-emerald-400 hover:to-emerald-300 text-obsidian-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Vender Nueva Tienda</span>
        </button>
      </div>

      {/* Tenants List */}
      <div className="space-y-3">
        {tenants.map((tenant) => (
          <div
            key={tenant.id}
            className="p-4 rounded-3xl glass-card border border-white/5 hover:border-emerald-500/30 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-obsidian-900 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {tenant.business.logoBase64 || tenant.business.logoUrl ? (
                    <img 
                      src={tenant.business.logoBase64 || tenant.business.logoUrl} 
                      alt="Logo" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <Store className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-white">{tenant.business.name}</h3>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                      {tenant.plan}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">RUC: {tenant.business.ruc || 'Sin RUC'}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(tenant)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors active:scale-90"
                  title="Editar datos y QR"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar la tienda "${tenant.business.name}"?`)) {
                      onDeleteTenant(tenant.id);
                    }
                  }}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 flex items-center justify-center transition-colors active:scale-90"
                  title="Eliminar tienda"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Merchant Access Credentials Box */}
            <div className="p-2.5 rounded-2xl bg-obsidian-950/80 border border-white/5 text-[11px] font-mono space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Usuario / Correo:</span>
                <span className="text-emerald-400 font-bold">{tenant.ownerEmail}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Contraseña del cliente:</span>
                <span className="text-amber-400 font-bold">{tenant.ownerPassword}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-0.5">
                <span>QR de Yape:</span>
                <span className="text-slate-200">
                  {tenant.business.yapeQrBase64 || tenant.business.yapeQrUrl ? '✓ QR Configurado' : 'Sin QR'}
                </span>
              </div>
            </div>

            {/* Action to enter into the store */}
            <button
              onClick={() => {
                soundEngine.playClick();
                onSelectTenantToOperate(tenant);
              }}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 border border-white/5 hover:border-emerald-500/40 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Operar / Entrar al POS de esta Tienda</span>
            </button>
          </div>
        ))}
      </div>

      {/* Modal: Adaptar / Crear Tienda para un Cliente */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end sm:justify-center sm:p-4 animate-fade-in">
          <div className="w-full max-w-md mx-auto bg-obsidian-900 rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between bg-obsidian-950/70">
              <span className="text-xs font-extrabold text-white">
                {editingTenant ? 'Adaptar Tienda del Cliente' : 'Vender & Configurar Nueva Tienda'}
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="w-6 h-6 rounded-full bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-4 overflow-y-auto no-scrollbar space-y-4 flex-1">
              {/* Sección 1: Credenciales de Acceso para el Comprador */}
              <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-amber-500/30 space-y-2.5">
                <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider block">
                  1. Credenciales para el Cliente (Comprador)
                </span>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    Correo de Acceso del Cliente *
                  </label>
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="cliente@bodega.com"
                    className="w-full px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    Contraseña que usará el Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    placeholder="Ej: Bodega2026"
                    className="w-full px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Sección 2: Datos del Negocio */}
              <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/10 space-y-2.5">
                <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider block">
                  2. Datos del Negocio
                </span>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Nombre del Negocio *</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ej: Bodega Santa Rosa"
                    className="w-full px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white"
                  />
                </div>

                {/* Subir Logo */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">
                    Logo del Negocio (Foto o Imagen)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-obsidian-900 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                    <label className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold cursor-pointer transition-colors active:scale-95">
                      <span>Seleccionar Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, setLogoPreview)}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">RUC / DNI</label>
                    <input
                      type="text"
                      value={ruc}
                      onChange={(e) => setRuc(e.target.value)}
                      placeholder="20999876543"
                      className="w-full px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="987654321"
                      className="w-full px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Dirección</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Av. Principal 123"
                    className="w-full px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white"
                  />
                </div>

                {/* Moneda */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Moneda</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { sym: 'S/', code: 'PEN' },
                      { sym: '$', code: 'USD' },
                      { sym: '€', code: 'EUR' }
                    ].map(c => (
                      <button
                        key={c.sym}
                        type="button"
                        onClick={() => {
                          setCurrencySymbol(c.sym);
                          setCurrency(c.code);
                        }}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          currencySymbol === c.sym 
                            ? 'bg-emerald-500 text-obsidian-950 border-emerald-400' 
                            : 'bg-white/5 border-white/5 text-slate-400'
                        }`}
                      >
                        {c.sym}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sección 3: Cargar QR de Yape (¡Respuesta a tu pregunta!) */}
              <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-purple-500/30 space-y-3">
                <div className="flex items-center gap-1.5 text-purple-300 font-extrabold text-[11px] uppercase tracking-wider">
                  <QrCode className="w-4 h-4 text-purple-400" />
                  <span>3. Código QR de Yape del Negocio</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-white p-1 border border-purple-400 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                    {yapeQrPreview ? (
                      <img src={yapeQrPreview} alt="QR Yape" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[9px] text-slate-400 font-bold">Sin QR</span>
                    )}
                  </div>
                  <div>
                    <label className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer transition-colors active:scale-95 inline-block">
                      <span>Subir Foto del QR de Yape</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, setYapeQrPreview)}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Sube una captura de pantalla del QR de tu Yape.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Titular de Yape..."
                    value={yapeName}
                    onChange={(e) => setYapeName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white"
                  />
                  <input
                    type="tel"
                    placeholder="Número de Yape..."
                    value={yapeNumber}
                    onChange={(e) => setYapeNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Botón Guardar */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-kobra-neon hover:from-emerald-400 hover:to-emerald-300 text-obsidian-950 font-black text-xs tracking-wide shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Guardar y Habilitar Tienda</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
