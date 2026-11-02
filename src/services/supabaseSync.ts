import { supabase } from './supabaseClient';
import { Product, SaleTicket, Debtor, TenantStore } from '../types';

export type SyncState = 'online-synced' | 'offline' | 'syncing' | 'error';

interface QueueItem {
  id: string;
  type: 'sale_ticket' | 'product_upsert' | 'product_delete' | 'debtor_upsert' | 'tenant_upsert';
  payload: unknown;
  timestamp: number;
}

const QUEUE_STORAGE_KEY = 'kobra_offline_sync_queue_v1';

export class SupabaseSyncService {
  private queue: QueueItem[] = [];
  private syncState: SyncState = navigator.onLine ? 'online-synced' : 'offline';
  private statusListeners: ((state: SyncState, pendingCount: number) => void)[] = [];
  private isSyncing = false;

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.updateState(this.queue.length > 0 ? 'syncing' : 'online-synced');
        this.processQueue();
      });

      window.addEventListener('offline', () => {
        this.updateState('offline');
      });

      // Auto-sync attempt every 30 seconds if online
      setInterval(() => {
        if (navigator.onLine && this.queue.length > 0) {
          this.processQueue();
        }
      }, 30000);
    }
  }

  private loadQueue() {
    try {
      const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
      this.queue = raw ? JSON.parse(raw) : [];
    } catch {
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (err) {
      console.error('Error al guardar cola offline:', err);
    }
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public getSyncState(): SyncState {
    return this.syncState;
  }

  public onStatusChange(callback: (state: SyncState, pendingCount: number) => void) {
    this.statusListeners.push(callback);
    callback(this.syncState, this.queue.length);
    return () => {
      this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    };
  }

  private updateState(state: SyncState) {
    this.syncState = state;
    this.notifyListeners();
  }

  private notifyListeners() {
    this.statusListeners.forEach(cb => cb(this.syncState, this.queue.length));
  }

  /**
   * Queue a mutation locally (guaranteed 0ms offline execution)
   */
  public enqueue(type: QueueItem['type'], payload: unknown) {
    const item: QueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      payload,
      timestamp: Date.now()
    };
    this.queue.push(item);
    this.saveQueue();

    if (navigator.onLine) {
      this.processQueue();
    } else {
      this.updateState('offline');
    }
  }

  /**
   * Flush all pending mutations to Supabase in the background
   */
  public async processQueue(): Promise<void> {
    if (!navigator.onLine || this.isSyncing || this.queue.length === 0) return;

    this.isSyncing = true;
    this.updateState('syncing');

    const remainingItems: QueueItem[] = [];

    for (const item of this.queue) {
      try {
        if (item.type === 'sale_ticket') {
          const t = item.payload as SaleTicket & { storeId?: string };
          const { error } = await supabase.from('kobra_tickets').upsert({
            id: t.id,
            store_id: t.storeId || 'tenant-1',
            ticket_number: t.ticketNumber,
            timestamp: t.timestamp,
            items: t.items,
            subtotal: t.subtotal,
            discount: t.discount,
            total: t.total,
            payment_method: t.paymentMethod,
            cash_received: t.cashReceived,
            change_given: t.changeGiven,
            customer_name: t.customerName,
            notes: t.notes
          });
          if (error) throw error;
        } else if (item.type === 'product_upsert') {
          const p = item.payload as Product & { storeId?: string };
          const { error } = await supabase.from('kobra_products').upsert({
            id: p.id,
            store_id: p.storeId || 'tenant-1',
            name: p.name,
            barcode: p.barcode,
            category: p.category,
            unit_type: p.unitType,
            cost_price: p.costPrice,
            sale_price: p.salePrice,
            stock: p.stock,
            min_stock: p.minStock,
            image_url: p.imageUrl,
            sku: p.sku,
            description: p.description
          });
          if (error) throw error;
        } else if (item.type === 'debtor_upsert') {
          const d = item.payload as Debtor & { storeId?: string };
          const { error } = await supabase.from('kobra_debtors').upsert({
            id: d.id,
            store_id: d.storeId || 'tenant-1',
            name: d.name,
            phone: d.phone,
            total_credit: d.totalCredit,
            total_paid: d.totalPaid,
            current_balance: d.currentBalance,
            last_ticket_code: d.lastTicketCode,
            notes: d.notes,
            updated_at: d.updatedAt
          });
          if (error) throw error;
        } else if (item.type === 'tenant_upsert') {
          const t = item.payload as TenantStore;
          const { error } = await supabase.from('kobra_tenants').upsert({
            id: t.id,
            name: t.business.name,
            owner_email: t.ownerEmail,
            owner_password: t.ownerPassword,
            status: t.status,
            plan: t.plan,
            business_data: t.business
          });
          if (error) throw error;
        }
      } catch (err) {
        console.warn('Error al sincronizar item con Supabase (se mantendrá en cola offline):', err);
        remainingItems.push(item);
      }
    }

    this.queue = remainingItems;
    this.saveQueue();
    this.isSyncing = false;

    if (!navigator.onLine) {
      this.updateState('offline');
    } else if (this.queue.length > 0) {
      this.updateState('error');
    } else {
      this.updateState('online-synced');
    }
  }

  /**
   * Pull latest data from Supabase for a specific store (if online)
   */
  public async pullStoreData(storeId: string): Promise<{
    products?: Product[];
    tickets?: SaleTicket[];
    debtors?: Debtor[];
  } | null> {
    if (!navigator.onLine) return null;

    try {
      const [prodRes, tickRes, debRes] = await Promise.all([
        supabase.from('kobra_products').select('*').eq('store_id', storeId),
        supabase.from('kobra_tickets').select('*').eq('store_id', storeId).order('timestamp', { ascending: false }).limit(50),
        supabase.from('kobra_debtors').select('*').eq('store_id', storeId)
      ]);

      const result: { products?: Product[]; tickets?: SaleTicket[]; debtors?: Debtor[] } = {};

      if (prodRes.data && prodRes.data.length > 0) {
        result.products = prodRes.data.map(row => ({
          id: row.id,
          name: row.name,
          barcode: row.barcode,
          category: row.category,
          unitType: row.unit_type,
          costPrice: Number(row.cost_price),
          salePrice: Number(row.sale_price),
          stock: Number(row.stock),
          minStock: Number(row.min_stock),
          imageUrl: row.image_url,
          sku: row.sku,
          description: row.description
        }));
      }

      if (tickRes.data && tickRes.data.length > 0) {
        result.tickets = tickRes.data.map(row => ({
          id: row.id,
          ticketNumber: row.ticket_number,
          timestamp: row.timestamp,
          items: row.items,
          subtotal: Number(row.subtotal),
          discount: Number(row.discount),
          total: Number(row.total),
          paymentMethod: row.payment_method,
          cashReceived: row.cash_received ? Number(row.cash_received) : undefined,
          changeGiven: row.change_given ? Number(row.change_given) : undefined,
          customerName: row.customer_name,
          notes: row.notes
        }));
      }

      if (debRes.data && debRes.data.length > 0) {
        result.debtors = debRes.data.map(row => ({
          id: row.id,
          name: row.name,
          phone: row.phone,
          totalCredit: Number(row.total_credit),
          totalPaid: Number(row.total_paid),
          currentBalance: Number(row.current_balance),
          lastTicketCode: row.last_ticket_code,
          notes: row.notes,
          updatedAt: row.updated_at || new Date().toISOString(),
          createdAt: row.created_at || new Date().toISOString()
        }));
      }

      return result;
    } catch {
      return null;
    }
  }
}

export const syncService = new SupabaseSyncService();
