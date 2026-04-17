// =============================================================================
// lib/utils.ts
// Shared utility functions used across the entire application.
// =============================================================================

import type { Product } from '@/types';

// ---------------------------------------------------------------------------
// Currency — Indian Rupee formatter
// Uses the Intl API so it correctly groups digits in the Indian style:
//   1,00,000  (lakh) instead of  100,000 (western)
// ---------------------------------------------------------------------------
const INR = new Intl.NumberFormat('en-IN', {
  style:    'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatINR(amount: number | null | undefined): string {
  if (amount == null) return 'Price on Request';
  return INR.format(amount);
}

// ---------------------------------------------------------------------------
// WhatsApp deep-link builder
// Opens a pre-filled chat to the business number.
// ---------------------------------------------------------------------------
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919028835913';

export function buildWhatsAppUrl(product: Pick<Product, 'name_en' | 'unit' | 'price_inr'>): string {
  const price  = product.price_inr ? formatINR(product.price_inr) : 'price on request';
  const message =
    `Hello! I would like to request a quote for:\n\n` +
    `*${product.name_en}*\n` +
    `Unit: ${product.unit}\n` +
    `Listed price: ${price}\n\n` +
    `Please share your best bulk pricing. Thank you.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// ---------------------------------------------------------------------------
// Class name merger — lightweight cx() without a library
// ---------------------------------------------------------------------------
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Cloudinary URL transformer
// Takes any Cloudinary URL and applies on-the-fly transformations.
// ---------------------------------------------------------------------------
export function cloudinaryTransform(
  url: string | null | undefined,
  opts: { width?: number; height?: number; crop?: string } = {}
): string {
  if (!url || !url.includes('cloudinary.com')) return url ?? '/placeholder.jpg';
  const { width = 800, height = 600, crop = 'fill' } = opts;
  // Insert transform segment before /upload/
  return url.replace(
    '/upload/',
    `/upload/w_${width},h_${height},c_${crop},f_auto,q_auto/`
  );
}

// ---------------------------------------------------------------------------
// Truncate text to a character limit
// ---------------------------------------------------------------------------
export function truncate(text: string | null | undefined, limit = 120): string {
  if (!text) return '';
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}
