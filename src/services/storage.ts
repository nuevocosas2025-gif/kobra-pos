import { Product, SaleTicket, Debtor, BusinessProfile, CashShift } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'kobra_products_v1',
  TICKETS: 'kobra_tickets_v1',
  DEBTORS: 'kobra_debtors_v1',
  BUSINESS: 'kobra_business_v1',
  CASH_SHIFT: 'kobra_shift_v1',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Morochas Snack',
    barcode: '7750151001234',
    category: 'Snacks',
    unitType: 'uds',
    costPrice: 1.40,
    salePrice: 2.00,
    stock: 24,
    minStock: 6,
    imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&auto=format&fit=crop&q=80',
    sku: 'SNK-001'
  },
  {
    id: 'prod-2',
    name: 'Cheese Tris 45g',
    barcode: '7750151002345',
    category: 'Snacks',
    unitType: 'uds',
    costPrice: 1.10,
    salePrice: 1.50,
    stock: 18,
    minStock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&auto=format&fit=crop&q=80',
    sku: 'SNK-002'
  },
  {
    id: 'prod-3',
    name: 'Doritos Mega Queso',
    barcode: '7750151003456',
    category: 'Snacks',
    unitType: 'uds',
    costPrice: 1.80,
    salePrice: 2.50,
    stock: 12,
    minStock: 4,
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80',
    sku: 'SNK-003'
  },
  {
    id: 'prod-4',
    name: 'CuaCua Mini',
    barcode: '7750151004567',
    category: 'Snacks',
    unitType: 'uds',
    costPrice: 0.80,
    salePrice: 1.20,
    stock: 30,
    minStock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=400&auto=format&fit=crop&q=80',
    sku: 'SNK-004'
  },
  {
    id: 'prod-5',
    name: 'Cebolla Roja',
    barcode: '2000000000018',
    category: 'Verduras',
    unitType: 'kg',
    costPrice: 2.20,
    salePrice: 3.50,
    stock: 18.5,
    minStock: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop&q=80',
    sku: 'VRD-001'
  },
  {
    id: 'prod-6',
    name: 'Ají-No-Moto 100g',
    barcode: '7750151005678',
    category: 'Abarrotes',
    unitType: 'uds',
    costPrice: 1.10,
    salePrice: 1.50,
    stock: 23,
    minStock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&auto=format&fit=crop&q=80',
    sku: 'ABR-001'
  },
  {
    id: 'prod-7',
    name: 'Inca Kola 500ml',
    barcode: '7750151006789',
    category: 'Bebidas',
    unitType: 'uds',
    costPrice: 2.30,
    salePrice: 3.00,
    stock: 15,
    minStock: 6,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80',
    sku: 'BEB-001'
  },
  {
    id: 'prod-8',
    name: 'Leche Gloria Azul 400g',
    barcode: '7750151007890',
    category: 'Lácteos',
    unitType: 'uds',
    costPrice: 3.60,
    salePrice: 4.50,
    stock: 16,
    minStock: 4,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
    sku: 'LAC-001'
  },
  {
    id: 'prod-9',
    name: 'Pan Francés / Ciabatta',
    barcode: '2000000000025',
    category: 'Panadería',
    unitType: 'uds',
    costPrice: 0.25,
    salePrice: 0.40,
    stock: 60,
    minStock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
    sku: 'PAN-001'
  }
];

export const INITIAL_DEBTORS: Debtor[] = [
  {
    id: 'deb-1',
    name: 'Mateo Veintimilla',
    phone: '987654321',
    totalCredit: 25.00,
    totalPaid: 15.00,
    currentBalance: 10.00,
    lastTicketCode: '#FC731358',
    updatedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: 'Vecino del piso 2'
  },
  {
    id: 'deb-2',
    name: 'María Fernández',
    phone: '912345678',
    totalCredit: 34.95,
    totalPaid: 30.00,
    currentBalance: 4.95,
    lastTicketCode: '#2B5944EC',
    updatedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Pasa a pagar en las tardes'
  },
  {
    id: 'deb-3',
    name: 'Don Carlos (Herrería)',
    phone: '998877665',
    totalCredit: 48.00,
    totalPaid: 20.00,
    currentBalance: 28.00,
    lastTicketCode: '#9A1488C1',
    updatedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    notes: 'Liquida los viernes'
  }
];

export const INITIAL_BUSINESS: BusinessProfile = {
  name: 'Bodega KOBRA',
  ruc: '20999876543',
  phone: '987654321',
  address: 'Av. Primavera 450, Urb. Jardines',
  ticketFooter: '¡Gracias por su compra! Vuelva pronto.',
  currency: 'PEN',
  currencySymbol: 'S/',
  yapeName: 'Jesús Valenzuela',
  yapeNumber: '987654321',
  yapeQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=YAPE-PAGO-987654321',
  plinName: 'Jesús Valenzuela',
  plinNumber: '987654321',
  plinQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PLIN-PAGO-987654321'
};

export const INITIAL_SHIFT: CashShift = {
  isOpen: true,
  openedAt: new Date().toISOString(),
  initialFloat: 50.00,
  notes: 'Caja abierta con sencillo inicial S/ 50.00'
};

export const INITIAL_TICKETS: SaleTicket[] = [
  {
    id: 'tick-1',
    ticketNumber: 'T-0014',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    items: [
      { productId: 'prod-1', productName: 'Morochas Snack', quantity: 2, unitPrice: 2.00, subtotal: 4.00, unitType: 'uds' },
      { productId: 'prod-7', productName: 'Inca Kola 500ml', quantity: 1, unitPrice: 3.00, subtotal: 3.00, unitType: 'uds' }
    ],
    subtotal: 7.00,
    discount: 0,
    total: 7.00,
    paymentMethod: 'yape',
    customerName: 'Cliente Yape'
  },
  {
    id: 'tick-2',
    ticketNumber: 'T-0013',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    items: [
      { productId: 'prod-5', productName: 'Cebolla Roja', quantity: 1.5, unitPrice: 3.50, subtotal: 5.25, unitType: 'kg' },
      { productId: 'prod-6', productName: 'Ají-No-Moto 100g', quantity: 2, unitPrice: 1.50, subtotal: 3.00, unitType: 'uds' }
    ],
    subtotal: 8.25,
    discount: 0,
    total: 8.25,
    paymentMethod: 'efectivo',
    cashReceived: 10.00,
    changeGiven: 1.75
  },
  {
    id: 'tick-3',
    ticketNumber: 'T-0012',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    items: [
      { productId: 'prod-8', productName: 'Leche Gloria Azul 400g', quantity: 2, unitPrice: 4.50, subtotal: 9.00, unitType: 'uds' }
    ],
    subtotal: 9.00,
    discount: 0,
    total: 9.00,
    paymentMethod: 'plin'
  },
  {
    id: 'tick-4',
    ticketNumber: 'T-0011',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    items: [
      { productId: 'prod-3', productName: 'Doritos Mega Queso', quantity: 1, unitPrice: 2.50, subtotal: 2.50, unitType: 'uds' },
      { productId: 'prod-4', productName: 'CuaCua Mini', quantity: 2, unitPrice: 1.20, subtotal: 2.40, unitType: 'uds' }
    ],
    subtotal: 4.90,
    discount: 0,
    total: 4.90,
    paymentMethod: 'fiado',
    customerName: 'María Fernández'
  }
];

// Helper methods to read/write with error resilience
export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (err) {
    console.error('Failed to save products:', err);
  }
}

export function getStoredTickets(): SaleTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return raw ? JSON.parse(raw) : INITIAL_TICKETS;
  } catch {
    return INITIAL_TICKETS;
  }
}

export function saveTickets(tickets: SaleTicket[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  } catch (err) {
    console.error('Failed to save tickets:', err);
  }
}

export function getStoredDebtors(): Debtor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEBTORS);
    return raw ? JSON.parse(raw) : INITIAL_DEBTORS;
  } catch {
    return INITIAL_DEBTORS;
  }
}

export function saveDebtors(debtors: Debtor[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DEBTORS, JSON.stringify(debtors));
  } catch (err) {
    console.error('Failed to save debtors:', err);
  }
}

export function getStoredBusiness(): BusinessProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUSINESS);
    return raw ? JSON.parse(raw) : INITIAL_BUSINESS;
  } catch {
    return INITIAL_BUSINESS;
  }
}

export function saveBusiness(biz: BusinessProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(biz));
  } catch (err) {
    console.error('Failed to save business:', err);
  }
}

export function getStoredShift(): CashShift {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CASH_SHIFT);
    return raw ? JSON.parse(raw) : INITIAL_SHIFT;
  } catch {
    return INITIAL_SHIFT;
  }
}

export function saveShift(shift: CashShift): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CASH_SHIFT, JSON.stringify(shift));
  } catch (err) {
    console.error('Failed to save shift:', err);
  }
}
