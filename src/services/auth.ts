import { UserAccount, TenantStore, BusinessProfile } from '../types';
import { INITIAL_BUSINESS } from './storage';

const STORAGE_KEYS = {
  CURRENT_USER: 'kobra_auth_session_v1',
  TENANTS: 'kobra_tenants_v1',
};

// Super Administrator specified by the user
export const SUPERADMIN_CREDENTIALS = {
  email: 'luisheinercastillo30@gmail.com',
  password: 'Heiner30',
  name: 'Luis Heiner Castillo',
  role: 'superadmin' as const
};

export const INITIAL_TENANTS: TenantStore[] = [
  {
    id: 'tenant-1',
    business: {
      ...INITIAL_BUSINESS,
      id: 'tenant-1',
      name: 'Bodega San José (Demo)',
    },
    ownerEmail: 'bodegademo@kobra.pe',
    ownerPassword: 'demo123',
    status: 'active',
    plan: 'pro',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tenant-2',
    business: {
      ...INITIAL_BUSINESS,
      id: 'tenant-2',
      name: 'Minimarket Don Pepe',
      ruc: '10456789123',
      phone: '912345678',
      address: 'Jr. Comercio 312, Mercado Central',
      yapeName: 'José Pérez',
      yapeNumber: '912345678'
    },
    ownerEmail: 'donpepe@minimarket.com',
    ownerPassword: 'pepe2026',
    status: 'active',
    plan: 'vitalicio',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

export function getStoredTenants(): TenantStore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TENANTS);
    return raw ? JSON.parse(raw) : INITIAL_TENANTS;
  } catch {
    return INITIAL_TENANTS;
  }
}

export function saveTenants(tenants: TenantStore[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
  } catch (err) {
    console.error('Failed to save tenants:', err);
  }
}

export function getCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (err) {
    console.error('Failed to set current user:', err);
  }
}

export function loginUser(emailInput: string, passwordInput: string): { user: UserAccount; business?: BusinessProfile } {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  // 1. Check Super Administrator
  if (email === SUPERADMIN_CREDENTIALS.email.toLowerCase() && password === SUPERADMIN_CREDENTIALS.password) {
    const superAdminUser: UserAccount = {
      id: 'superadmin-heiner',
      email: SUPERADMIN_CREDENTIALS.email,
      name: SUPERADMIN_CREDENTIALS.name,
      role: 'superadmin',
      businessId: 'all',
      createdAt: new Date().toISOString()
    };
    setCurrentUser(superAdminUser);
    return { user: superAdminUser };
  }

  // 2. Check Tenant Merchants
  const tenants = getStoredTenants();
  const tenant = tenants.find(t => 
    t.ownerEmail.toLowerCase() === email && t.ownerPassword === password
  );

  if (tenant) {
    if (tenant.status !== 'active') {
      throw new Error('Esta cuenta de negocio se encuentra suspendida o inactiva. Contacta al Super Administrador.');
    }

    const merchantUser: UserAccount = {
      id: `user-${tenant.id}`,
      email: tenant.ownerEmail,
      name: tenant.business.name,
      role: 'merchant',
      businessId: tenant.id,
      createdAt: tenant.createdAt
    };
    setCurrentUser(merchantUser);
    return { user: merchantUser, business: tenant.business };
  }

  throw new Error('Correo o contraseña incorrectos. Verifica tus credenciales.');
}

export function logoutUser(): void {
  setCurrentUser(null);
}
