import test from 'node:test';
import assert from 'node:assert/strict';

// Test implementation of voice parsing
const SPANISH_NUMBERS = {
  'un': 1, 'uno': 1, 'una': 1, 'dos': 2, 'tres': 3, 'cuatro': 4,
  'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
  'medio': 0.5, 'media': 0.5, 'cuarto': 0.25,
};

function parseVoiceInput(text, catalog) {
  const clean = text.toLowerCase().trim();
  if (!clean) return { action: 'unknown' };
  if (clean.includes('vaciar')) return { action: 'clear' };
  if (clean.includes('cobrar') || clean.includes('pagar')) return { action: 'checkout' };

  let quantity = 1;
  let unitType = 'uds';
  if (clean.includes('kilo') || clean.includes('kg')) unitType = 'kg';

  const words = clean.split(/\s+/);
  for (const word of words) {
    const num = parseFloat(word);
    if (!isNaN(num) && num > 0) {
      quantity = num;
      break;
    } else if (SPANISH_NUMBERS[word] !== undefined) {
      quantity = SPANISH_NUMBERS[word];
      break;
    }
  }

  let price = null;
  const priceMatch = clean.match(/(?:a|por|precio|costo)\s+([0-9]+(?:[\.,][0-9]{1,2})?)/);
  if (priceMatch) price = parseFloat(priceMatch[1].replace(',', '.'));

  let bestMatch = null;
  let highestScore = 0;
  for (const product of catalog) {
    const prodName = product.name.toLowerCase();
    let score = 0;
    if (clean.includes(prodName)) score += 10;
    else {
      for (const pw of prodName.split(/\s+/)) {
        if (pw.length > 2 && clean.includes(pw)) score += 2;
      }
    }
    if (score > highestScore && score >= 2) {
      highestScore = score;
      bestMatch = product;
    }
  }

  if (bestMatch) {
    return {
      action: 'add',
      matchedProduct: bestMatch,
      customItem: {
        name: bestMatch.name,
        quantity,
        price: price ?? bestMatch.salePrice,
        unitType: bestMatch.unitType || unitType
      }
    };
  }

  return {
    action: 'add',
    customItem: {
      name: 'Custom',
      quantity,
      price: price ?? 1.0,
      unitType
    }
  };
}

const mockCatalog = [
  { id: '1', name: 'Morochas Snack', salePrice: 2.00, unitType: 'uds' },
  { id: '2', name: 'Cebolla Roja', salePrice: 3.50, unitType: 'kg' },
  { id: '3', name: 'Inca Kola 500ml', salePrice: 3.00, unitType: 'uds' },
];

test('Voice parser: recognizes catalog item and quantity', () => {
  const res = parseVoiceInput('dos morochas', mockCatalog);
  assert.equal(res.action, 'add');
  assert.equal(res.matchedProduct.name, 'Morochas Snack');
  assert.equal(res.customItem.quantity, 2);
  assert.equal(res.customItem.price, 2.00);
});

test('Voice parser: recognizes weight in kilos', () => {
  const res = parseVoiceInput('medio kilo de cebolla', mockCatalog);
  assert.equal(res.action, 'add');
  assert.equal(res.matchedProduct.name, 'Cebolla Roja');
  assert.equal(res.customItem.quantity, 0.5);
  assert.equal(res.customItem.unitType, 'kg');
});

test('Voice parser: recognizes checkout trigger', () => {
  const res = parseVoiceInput('vamos a cobrar', mockCatalog);
  assert.equal(res.action, 'checkout');
});

test('Voice parser: recognizes cart clear trigger', () => {
  const res = parseVoiceInput('vaciar carrito por favor', mockCatalog);
  assert.equal(res.action, 'clear');
});
