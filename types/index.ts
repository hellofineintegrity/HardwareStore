// =============================================================================
// types/index.ts
// Centralised TypeScript types shared across the entire application.
// Import from here to maintain a single source of truth.
// =============================================================================

// -----------------------------------------------------------------------------
// Database row shapes (mirrors the Supabase schema exactly)
// -----------------------------------------------------------------------------

/** Row shape for the `categories` table. */
export interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_mr: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

/** Row shape for the `products` table. */
export interface Product {
  id: string;
  category_id: string | null;
  name_en: string;
  name_mr: string;
  description_en: string | null;
  description_mr: string | null;
  price_inr: number | null;
  unit: string;
  stock_quantity: number;
  image_url: string | null;
  cloudinary_public_id: string | null;
  is_visible: boolean;
  seo_keywords: string[];
  specifications: Record<string, string>;
  created_at: string;
  updated_at: string;
  /** Joined from categories table (via Supabase foreign key select) */
  categories?: Pick<Category, 'name_en' | 'name_mr' | 'slug'> | null;
}

// -----------------------------------------------------------------------------
// API payload types (used in the /api/products route)
// -----------------------------------------------------------------------------

/**
 * Fields accepted by POST /api/products.
 * Sent as multipart/form-data from the Admin upload form.
 */
export interface CreateProductPayload {
  category_id: string;
  name_en: string;
  name_mr: string;
  description_en?: string;
  description_mr?: string;
  price_inr?: number;
  unit: string;
  stock_quantity?: number;
  seo_keywords?: string; // Comma-separated string from form, parsed server-side
  specifications?: string; // JSON string from form, parsed server-side
}

/** Standard API response envelope. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// -----------------------------------------------------------------------------
// UI/Component prop types
// -----------------------------------------------------------------------------

/** Supported locale keys for bilingual content. */
export type Locale = 'en' | 'mr';

/** Helper to pick the correct locale field from a bilingual object. */
export type BilingualField<T extends string> = `${T}_en` | `${T}_mr`;

/** Mega Menu navigation item shape consumed by Navbar.tsx */
export interface NavCategory {
  slug: string;
  name_en: string;
  name_mr: string;
  icon: string | null;
}
