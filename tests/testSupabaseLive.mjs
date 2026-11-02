import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wzrvrexpfskisxneiabd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Mw8Zyi8Ky45f5cml3dV6RQ_MTcHu-YN';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('Testing Supabase tables...');

  // 1. Check tenants
  const { data: tenants, error: errT } = await supabase.from('kobra_tenants').select('*');
  if (errT) {
    console.error('Error tenants:', errT);
  } else {
    console.log('Tenants table OK, rows:', tenants.length);
  }

  // 2. Check products
  const { data: products, error: errP } = await supabase.from('kobra_products').select('*');
  if (errP) {
    console.error('Error products:', errP);
  } else {
    console.log('Products table OK, rows:', products.length);
  }

  // 3. Check tickets
  const { data: tickets, error: errTk } = await supabase.from('kobra_tickets').select('*');
  if (errTk) {
    console.error('Error tickets:', errTk);
  } else {
    console.log('Tickets table OK, rows:', tickets.length);
  }

  // 4. Check debtors
  const { data: debtors, error: errD } = await supabase.from('kobra_debtors').select('*');
  if (errD) {
    console.error('Error debtors:', errD);
  } else {
    console.log('Debtors table OK, rows:', debtors.length);
  }

  // 5. Insert initial demo tenant into Supabase
  const { data: inserted, error: errIns } = await supabase.from('kobra_tenants').upsert({
    id: 'tenant-1',
    name: 'Bodega San Jose (Demo)',
    owner_email: 'bodegademo@kobra.pe',
    owner_password: 'demo123',
    status: 'active',
    plan: 'pro',
    business_data: {
      id: 'tenant-1',
      name: 'Bodega San Jose (Demo)',
      ruc: '20999876543',
      phone: '987654321',
      address: 'Av. Primavera 450',
      currency: 'PEN',
      currencySymbol: 'S/',
      ticketFooter: 'Gracias por su compra!'
    }
  }).select();

  if (errIns) {
    console.error('Error upserting tenant:', errIns);
  } else {
    console.log('Upsert tenant OK:', inserted[0]?.name);
  }
}

testConnection();
