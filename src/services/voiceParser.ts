import { Product, UnitType } from '../types';

export interface ParsedVoiceCommand {
  action: 'add' | 'remove' | 'clear' | 'checkout' | 'unknown';
  matchedProduct?: Product;
  customItem?: {
    name: string;
    quantity: number;
    price: number;
    unitType: UnitType;
  };
  feedbackMessage: string;
}

const SPANISH_NUMBERS: Record<string, number> = {
  'un': 1,
  'uno': 1,
  'una': 1,
  'dos': 2,
  'tres': 3,
  'cuatro': 4,
  'cinco': 5,
  'seis': 6,
  'siete': 7,
  'ocho': 8,
  'nueve': 9,
  'diez': 10,
  'once': 11,
  'doce': 12,
  'docena': 12,
  'trece': 13,
  'catorce': 14,
  'quince': 15,
  'veinte': 20,
  'medio': 0.5,
  'media': 0.5,
  'cuarto': 0.25,
};

// Remove accents and normalize text for robust audio matching
const normalizeText = (s: string) => 
  s.toLowerCase()
   .normalize('NFD')
   .replace(/[\u0300-\u036f]/g, '')
   .trim();

export function parseVoiceInput(text: string, catalog: Product[]): ParsedVoiceCommand {
  const clean = normalizeText(text);

  if (!clean) {
    return { action: 'unknown', feedbackMessage: 'No se escuchó ningún comando.' };
  }

  // Check actions: Clear Cart
  if (
    clean.includes('vaciar') || 
    clean.includes('limpiar') || 
    clean.includes('borrar') ||
    clean.includes('cancelar venta')
  ) {
    return { action: 'clear', feedbackMessage: 'Carrito vaciado' };
  }

  // Check actions: Checkout
  if (
    clean.includes('cobrar') || 
    clean.includes('pagar') || 
    clean.includes('cuenta') || 
    clean.includes('total') || 
    clean.includes('cuanto es') ||
    clean.includes('cerrar venta') ||
    clean.includes('finalizar')
  ) {
    return { action: 'checkout', feedbackMessage: 'Abriendo caja para cobro' };
  }

  // Parse Quantity
  let quantity = 1;
  let unitType: UnitType = 'uds';

  if (clean.includes('kilo') || clean.includes('kg')) {
    unitType = 'kg';
  } else if (clean.includes('litro') || clean.includes('lt')) {
    unitType = 'uds';
  }

  const words = clean.split(/\s+/);
  
  // Find quantity in words or digits
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const num = parseFloat(word);
    if (!isNaN(num) && num > 0) {
      quantity = num;
      break;
    } else if (SPANISH_NUMBERS[word] !== undefined) {
      quantity = SPANISH_NUMBERS[word];
      break;
    }
  }

  // Detect explicit price (e.g. "a 3.50", "a 2 soles", "precio 5", "costo 1.20")
  let price: number | null = null;
  const priceMatch = clean.match(/(?:a|por|precio|costo)\s+([0-9]+(?:[\.,][0-9]{1,2})?)/);
  if (priceMatch) {
    price = parseFloat(priceMatch[1].replace(',', '.'));
  }

  // Match against catalog products
  let bestMatch: Product | null = null;
  let highestScore = 0;

  for (const product of catalog) {
    const prodName = normalizeText(product.name);
    const prodWords = prodName.split(/\s+/);

    // Calculate match score
    let score = 0;
    if (clean.includes(prodName)) {
      score += 10;
    } else {
      for (const pw of prodWords) {
        if (pw.length > 2 && clean.includes(pw)) {
          score += 2;
        }
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
        quantity: quantity,
        price: price ?? bestMatch.salePrice,
        unitType: bestMatch.unitType || unitType
      },
      feedbackMessage: `Añadido: ${quantity} ${bestMatch.unitType} de ${bestMatch.name}`
    };
  }

  // If not in catalog, treat as ad-hoc custom product entry
  // Extract clean name by stripping numbers and filler keywords
  const filteredWords = words.filter(w => 
    !SPANISH_NUMBERS[w] && 
    isNaN(Number(w)) && 
    !['kilo', 'kilos', 'kg', 'soles', 'sol', 'a', 'de', 'un', 'una', 'por', 'precio', 'costo', 'agrega', 'agregar', 'pon', 'poner', 'dame', 'lleva'].includes(w)
  );

  const guessedName = filteredWords.join(' ').trim();
  const finalName = guessedName.length > 1 
    ? guessedName.charAt(0).toUpperCase() + guessedName.slice(1) 
    : 'Producto Rápido';

  const finalPrice = price !== null && price > 0 ? price : 1.00;

  return {
    action: 'add',
    customItem: {
      name: finalName,
      quantity: quantity,
      price: finalPrice,
      unitType: unitType
    },
    feedbackMessage: `Añadido: ${quantity} ${unitType} de ${finalName} (S/ ${finalPrice.toFixed(2)})`
  };
}
