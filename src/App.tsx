import { useState, useEffect } from 'react';
import { 
  getStoredProducts, saveProducts,
  getStoredTickets, saveTickets,
  getStoredDebtors, saveDebtors,
  getStoredBusiness, saveBusiness,
  getStoredShift, saveShift
} from './services/storage';
import { 
  getCurrentUser, logoutUser,
  getStoredTenants, saveTenants
} from './services/auth';
import { Product, CartItem, SaleTicket, Debtor, BusinessProfile, CashShift, ActiveTab, UserAccount, TenantStore } from './types';
import { soundEngine } from './services/soundEngine';
import { parseVoiceInput } from './services/voiceParser';

// Components
import { LoginScreen } from './components/Auth/LoginScreen';
import { SuperAdminDashboard } from './components/SuperAdmin/SuperAdminDashboard';
import { Header } from './components/Layout/Header';
import { BottomNav } from './components/Layout/BottomNav';
import { ScannerView } from './components/Venta/ScannerView';
import { VoiceAssistant } from './components/Venta/VoiceAssistant';
import { CartList } from './components/Venta/CartList';
import { CheckoutModal } from './components/Venta/CheckoutModal';
import { CategoryPills } from './components/Catalogo/CategoryPills';
import { SearchBar } from './components/Catalogo/SearchBar';
import { ProductGrid } from './components/Catalogo/ProductGrid';
import { InventoryKPIs } from './components/Inventario/InventoryKPIs';
import { StockTable } from './components/Inventario/StockTable';
import { ProductFormModal } from './components/Inventario/ProductFormModal';
import { CuadreDelDia } from './components/Historial/CuadreDelDia';
import { CuadernoFiados } from './components/Historial/CuadernoFiados';
import { TicketDetailModal } from './components/Historial/TicketDetailModal';
import { BusinessSettings } from './components/Ajustes/BusinessSettings';

export function App() {
  // Auth Session State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(getCurrentUser);
  const [tenants, setTenants] = useState<TenantStore[]>(getStoredTenants);

  // Main state
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    currentUser?.role === 'superadmin' ? 'superadmin' : 'venta'
  );
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tickets, setTickets] = useState<SaleTicket[]>(getStoredTickets);
  const [debtors, setDebtors] = useState<Debtor[]>(getStoredDebtors);
  const [business, setBusiness] = useState<BusinessProfile>(getStoredBusiness);
  const [shift, setShift] = useState<CashShift>(getStoredShift);

  // Sub-navigation / Modals
  const [historialSubTab, setHistorialSubTab] = useState<'cuadre' | 'fiados'>('cuadre');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inspectingTicket, setInspectingTicket] = useState<SaleTicket | null>(null);
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [voiceFeedback, setVoiceFeedback] = useState<string>('');

  // Persist state changes
  useEffect(() => { saveProducts(products); }, [products]);
  useEffect(() => { saveTickets(tickets); }, [tickets]);
  useEffect(() => { saveDebtors(debtors); }, [debtors]);
  useEffect(() => { saveBusiness(business); }, [business]);
  useEffect(() => { saveShift(shift); }, [shift]);
  useEffect(() => { saveTenants(tenants); }, [tenants]);

  // Handle Login Success
  const handleLoginSuccess = (user: UserAccount, biz?: BusinessProfile) => {
    setCurrentUser(user);
    if (user.role === 'superadmin') {
      setActiveTab('superadmin');
    } else {
      if (biz) {
        setBusiness(biz);
      }
      setActiveTab('venta');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setCart([]);
  };

  // Cart calculations
  const cartTotal = cart.reduce((acc, it) => acc + it.subtotal, 0);
  const cartItemsCount = cart.reduce((acc, it) => acc + (it.product.unitType === 'kg' ? 1 : it.quantity), 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const activeDebtorsCount = debtors.filter(d => d.currentBalance > 0).length;

  // Categories list with counts
  const categoriesMap: Record<string, number> = {};
  products.forEach(p => {
    categoriesMap[p.category] = (categoriesMap[p.category] || 0) + 1;
  });
  const categoriesList = Object.entries(categoriesMap).map(([name, count]) => ({ name, count }));

  // Filtered products for catalog
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.barcode.includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  // Add product to cart
  const handleAddToCart = (product: Product, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + qty;
        return prev.map(item => item.product.id === product.id ? {
          ...item,
          quantity: newQty,
          subtotal: Number((newQty * product.salePrice).toFixed(2))
        } : item);
      } else {
        return [...prev, {
          product,
          quantity: qty,
          subtotal: Number((qty * product.salePrice).toFixed(2))
        }];
      }
    });
  };

  // Barcode scanner trigger
  const handleBarcodeDetected = (code: string) => {
    const found = products.find(p => p.barcode === code || p.sku === code);
    if (found) {
      handleAddToCart(found, found.unitType === 'kg' ? 1 : 1);
      setVoiceFeedback(`Escaneado: ${found.name}`);
    } else {
      soundEngine.playError();
      setVoiceFeedback(`Código no encontrado: ${code}`);
    }
  };

  // Voice command processor ("VozKobra")
  const handleVoiceCommand = (transcript: string) => {
    const parsed = parseVoiceInput(transcript, products);
    setVoiceFeedback(parsed.feedbackMessage);

    if (parsed.action === 'clear') {
      setCart([]);
      soundEngine.playClick();
    } else if (parsed.action === 'checkout') {
      if (cart.length > 0) {
        setShowCheckoutModal(true);
      } else {
        soundEngine.playError();
        setVoiceFeedback('El carrito está vacío. Añade productos primero.');
      }
    } else if (parsed.action === 'add') {
      if (parsed.matchedProduct && parsed.customItem) {
        handleAddToCart(parsed.matchedProduct, parsed.customItem.quantity);
        soundEngine.playScannerBeep();
      } else if (parsed.customItem) {
        const tempProduct: Product = {
          id: `custom-${Date.now()}`,
          name: parsed.customItem.name,
          barcode: `V-${Date.now().toString().slice(-6)}`,
          category: 'Varios',
          unitType: parsed.customItem.unitType,
          costPrice: parsed.customItem.price * 0.7,
          salePrice: parsed.customItem.price,
          stock: 99,
          minStock: 5
        };
        handleAddToCart(tempProduct, parsed.customItem.quantity);
        soundEngine.playScannerBeep();
      }
    }
  };

  // Update cart quantity
  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(0.25, Number((item.quantity + delta).toFixed(2)));
        return {
          ...item,
          quantity: newQty,
          subtotal: Number((newQty * item.product.salePrice).toFixed(2))
        };
      }
      return item;
    }));
  };

  // Remove from cart
  const handleRemoveFromCart = (productId: string) => {
    soundEngine.playClick();
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Complete checkout sale
  const handleCompleteSale = (ticket: SaleTicket, debtorId?: string) => {
    setTickets(prev => [ticket, ...prev]);

    setProducts(prev => prev.map(prod => {
      const soldItem = ticket.items.find(it => it.productId === prod.id);
      if (soldItem) {
        return {
          ...prod,
          stock: Math.max(0, Number((prod.stock - soldItem.quantity).toFixed(2)))
        };
      }
      return prod;
    }));

    if (ticket.paymentMethod === 'fiado') {
      if (debtorId && debtorId !== 'new') {
        setDebtors(prev => prev.map(d => {
          if (d.id === debtorId) {
            return {
              ...d,
              totalCredit: Number((d.totalCredit + ticket.total).toFixed(2)),
              currentBalance: Number((d.currentBalance + ticket.total).toFixed(2)),
              lastTicketCode: ticket.ticketNumber,
              updatedAt: new Date().toISOString()
            };
          }
          return d;
        }));
      } else if (ticket.customerName) {
        const newDebtor: Debtor = {
          id: `deb-${Date.now()}`,
          name: ticket.customerName,
          phone: '',
          totalCredit: ticket.total,
          totalPaid: 0,
          currentBalance: ticket.total,
          lastTicketCode: ticket.ticketNumber,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        setDebtors(prev => [newDebtor, ...prev]);
      }
    }

    setCart([]);
  };

  // Record abono
  const handleRecordAbono = (debtorId: string, amount: number) => {
    setDebtors(prev => prev.map(d => {
      if (d.id === debtorId) {
        const newPaid = Number((d.totalPaid + amount).toFixed(2));
        const newBal = Math.max(0, Number((d.currentBalance - amount).toFixed(2)));
        return {
          ...d,
          totalPaid: newPaid,
          currentBalance: newBal,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    }));

    const debtor = debtors.find(d => d.id === debtorId);
    const abonoTicket: SaleTicket = {
      id: `abono-${Date.now()}`,
      ticketNumber: `AB-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      items: [{
        productId: 'abono',
        productName: `Abono a Cuenta Fiado (${debtor?.name})`,
        quantity: 1,
        unitPrice: amount,
        subtotal: amount,
        unitType: 'uds'
      }],
      subtotal: amount,
      discount: 0,
      total: amount,
      paymentMethod: 'efectivo',
      customerName: debtor?.name
    };
    setTickets(prev => [abonoTicket, ...prev]);
  };

  // Adjust stock
  const handleAdjustStock = (productId: string, delta: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newStock = Math.max(0, Number((p.stock + delta).toFixed(2)));
        return { ...p, stock: newStock };
      }
      return p;
    }));
  };

  // Save product
  const handleSaveProduct = (product: Product) => {
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = product;
        return copy;
      }
      return [product, ...prev];
    });
    setShowProductModal(false);
    setEditingProduct(null);
  };

  // Save tenant from SuperAdmin
  const handleSaveTenant = (tenant: TenantStore) => {
    setTenants(prev => {
      const idx = prev.findIndex(t => t.id === tenant.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = tenant;
        return copy;
      }
      return [tenant, ...prev];
    });
    // If the active business is this tenant, update it
    if (business.id === tenant.id) {
      setBusiness(tenant.business);
    }
  };

  // Delete tenant
  const handleDeleteTenant = (tenantId: string) => {
    setTenants(prev => prev.filter(t => t.id !== tenantId));
  };

  // Switch to operate tenant POS
  const handleSelectTenantToOperate = (tenant: TenantStore) => {
    setBusiness(tenant.business);
    setActiveTab('venta');
  };

  // IF NOT AUTHENTICATED -> RENDER LOGIN SCREEN
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // IF SUPERADMIN TAB ACTIVE -> RENDER SUPER ADMIN DASHBOARD
  if (currentUser.role === 'superadmin' && activeTab === 'superadmin') {
    return (
      <SuperAdminDashboard
        tenants={tenants}
        adminEmail={currentUser.email}
        onSelectTenantToOperate={handleSelectTenantToOperate}
        onSaveTenant={handleSaveTenant}
        onDeleteTenant={handleDeleteTenant}
        onLogout={handleLogout}
      />
    );
  }

  // OTHERWISE -> RENDER POS INTERFACE
  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        business={business}
        shift={shift}
        currentUser={currentUser}
        lowStockCount={lowStockCount}
        onOpenShiftModal={() => setActiveTab('ajustes')}
        onOpenNotifications={() => setActiveTab('inventario')}
        isMuted={isMuted}
        onToggleMute={() => {
          const next = !isMuted;
          soundEngine.setMuted(next);
          setIsMuted(next);
        }}
        onOpenSuperAdmin={() => setActiveTab('superadmin')}
        onLogout={handleLogout}
      />

      {/* Main Screen Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-3.5 py-3 overflow-y-auto">
        {/* TAB 1: VENTA (POS & SCANNER) */}
        {activeTab === 'venta' && (
          <div className="space-y-2.5 pb-24 animate-fade-in">
            <ScannerView
              onBarcodeDetected={handleBarcodeDetected}
              catalogBarcodes={products.map(p => ({ barcode: p.barcode, name: p.name }))}
            />

            <VoiceAssistant
              onProcessCommand={handleVoiceCommand}
              lastFeedback={voiceFeedback}
            />

            <CartList
              items={cart}
              currencySymbol={business.currencySymbol}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveFromCart}
              onClearCart={() => setCart([])}
              onSwitchToCatalog={() => setActiveTab('catalogo')}
            />

            {cart.length > 0 && (
              <div className="fixed bottom-16 left-4 right-4 max-w-md mx-auto z-30 animate-slide-up">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setShowCheckoutModal(true);
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-kobra-neon to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-obsidian-950 font-black text-xs shadow-xl shadow-emerald-500/30 flex items-center justify-between active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-obsidian-950 animate-ping" />
                    <span>Revisar Orden ({cartItemsCount} ítems)</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-sm">
                    <span>{business.currencySymbol} {cartTotal.toFixed(2)}</span>
                    <span className="text-base font-extrabold">→</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CATÁLOGO */}
        {activeTab === 'catalogo' && (
          <div className="space-y-3 pb-24 animate-fade-in">
            <SearchBar
              query={searchQuery}
              onQueryChange={setSearchQuery}
            />

            <CategoryPills
              categories={categoriesList}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <ProductGrid
              products={filteredProducts}
              currencySymbol={business.currencySymbol}
              onAddToCart={(p) => handleAddToCart(p, 1)}
              cartTotal={cartTotal}
              cartItemCount={cartItemsCount}
              onGoToCheckout={() => setShowCheckoutModal(true)}
            />
          </div>
        )}

        {/* TAB 3: INVENTARIO */}
        {activeTab === 'inventario' && (
          <div className="space-y-3 animate-fade-in">
            <InventoryKPIs
              products={products}
              currencySymbol={business.currencySymbol}
            />

            <StockTable
              products={products}
              currencySymbol={business.currencySymbol}
              onAdjustStock={handleAdjustStock}
              onEditProduct={(p) => {
                setEditingProduct(p);
                setShowProductModal(true);
              }}
              onAddNewProduct={() => {
                setEditingProduct(null);
                setShowProductModal(true);
              }}
            />
          </div>
        )}

        {/* TAB 4: HISTORIAL & CUADRE & CUADERNO DE FIADOS */}
        {activeTab === 'historial' && (
          <div className="space-y-3 animate-fade-in">
            <div className="grid grid-cols-2 gap-1.5 bg-obsidian-900 p-1 rounded-2xl border border-white/5">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setHistorialSubTab('cuadre');
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  historialSubTab === 'cuadre'
                    ? 'bg-emerald-500 text-obsidian-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Historial de Tickets
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setHistorialSubTab('fiados');
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                  historialSubTab === 'fiados'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Cuaderno de Fiados</span>
                {activeDebtorsCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    historialSubTab === 'fiados' ? 'bg-obsidian-950/40 text-white' : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {activeDebtorsCount}
                  </span>
                )}
              </button>
            </div>

            {historialSubTab === 'cuadre' ? (
              <CuadreDelDia
                tickets={tickets}
                currencySymbol={business.currencySymbol}
                onSelectTicket={(t) => setInspectingTicket(t)}
              />
            ) : (
              <CuadernoFiados
                debtors={debtors}
                business={business}
                currencySymbol={business.currencySymbol}
                onRecordAbono={handleRecordAbono}
                onAddNewDebtor={(name, phone, initialDebt) => {
                  const newDebtor: Debtor = {
                    id: `deb-${Date.now()}`,
                    name,
                    phone,
                    totalCredit: initialDebt,
                    totalPaid: 0,
                    currentBalance: initialDebt,
                    lastTicketCode: `INIT-${Math.floor(100 + Math.random() * 900)}`,
                    updatedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                  };
                  setDebtors(prev => [newDebtor, ...prev]);
                }}
              />
            )}
          </div>
        )}

        {/* TAB 5: AJUSTES */}
        {activeTab === 'ajustes' && (
          <div className="animate-fade-in">
            <BusinessSettings
              business={business}
              shift={shift}
              onSaveBusiness={(updated) => setBusiness(updated)}
              onToggleShift={(isOpen, floatAmount) => {
                setShift({
                  isOpen,
                  openedAt: isOpen ? new Date().toISOString() : shift.openedAt,
                  closedAt: !isOpen ? new Date().toISOString() : undefined,
                  initialFloat: floatAmount
                });
              }}
            />
          </div>
        )}
      </main>

      {/* MODALS */}
      {showCheckoutModal && (
        <CheckoutModal
          items={cart}
          totalAmount={cartTotal}
          business={business}
          debtors={debtors}
          currencySymbol={business.currencySymbol}
          onClose={() => setShowCheckoutModal(false)}
          onCompleteSale={handleCompleteSale}
        />
      )}

      {showProductModal && (
        <ProductFormModal
          product={editingProduct}
          categories={Object.keys(categoriesMap)}
          currencySymbol={business.currencySymbol}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {inspectingTicket && (
        <TicketDetailModal
          ticket={inspectingTicket}
          business={business}
          currencySymbol={business.currencySymbol}
          onClose={() => setInspectingTicket(null)}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cartCount={cartItemsCount}
        debtorCount={activeDebtorsCount}
      />
    </div>
  );
}
export default App;
