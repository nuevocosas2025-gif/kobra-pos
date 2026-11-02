export type UnitType = 'uds' | 'kg';

export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  unitType: UnitType;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  imageUrl?: string;
  sku?: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export type PaymentMethod = 'efectivo' | 'yape' | 'plin' | 'tarjeta' | 'fiado';

export interface SaleTicket {
  id: string;
  ticketNumber: string;
  timestamp: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    unitType: UnitType;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  changeGiven?: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface Debtor {
  id: string;
  name: string;
  phone: string;
  totalCredit: number;
  totalPaid: number;
  currentBalance: number;
  lastTicketCode: string;
  updatedAt: string;
  createdAt: string;
  notes?: string;
}

export interface BusinessProfile {
  id?: string;
  name: string;
  ruc: string;
  phone: string;
  address: string;
  ticketFooter: string;
  currency: string;
  currencySymbol: string;
  logoUrl?: string;
  logoBase64?: string;
  yapeName: string;
  yapeNumber: string;
  yapeQrUrl?: string;
  yapeQrBase64?: string;
  plinName: string;
  plinNumber: string;
  plinQrUrl?: string;
  plinQrBase64?: string;
}

export interface CashShift {
  isOpen: boolean;
  openedAt: string;
  closedAt?: string;
  initialFloat: number;
  notes?: string;
}

export type ActiveTab = 'venta' | 'catalogo' | 'inventario' | 'historial' | 'ajustes' | 'superadmin';

export type UserRole = 'superadmin' | 'merchant';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessId: string;
  createdAt: string;
}

export interface TenantStore {
  id: string;
  business: BusinessProfile;
  ownerEmail: string;
  ownerPassword: string;
  status: 'active' | 'suspended';
  plan: 'standard' | 'pro' | 'vitalicio';
  createdAt: string;
}
