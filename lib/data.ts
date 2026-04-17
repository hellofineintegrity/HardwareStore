// =============================================================================
// lib/data.ts
// Server-side data fetching functions.
// All functions run on the server (in Server Components or API routes).
// They use the public Supabase client so RLS is enforced.
// =============================================================================

import { getPublicClient, getAdminClient } from '@/lib/supabase';
import type { Category, Product } from '@/types';

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

/** Fetch all categories ordered by sort_order — used in Navbar and filters */
export async function fetchCategories(): Promise<Category[]> {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[fetchCategories]', error.message);
    return [];
  }
  return data as Category[];
}

// ---------------------------------------------------------------------------
// Products — public storefront queries
// ---------------------------------------------------------------------------

/**
 * Fetch visible products with optional category slug filter.
 * Used by the Product Listing Page (PLP).
 */
export async function fetchProducts(categorySlug?: string): Promise<Product[]> {
  const supabase = getPublicClient();

  let query = supabase
    .from('products')
    .select(`
      id, name_en, name_mr, price_inr, unit, stock_quantity,
      image_url, is_visible, seo_keywords, specifications,
      created_at,
      categories ( id, slug, name_en, name_mr )
    `)
    .eq('is_visible', true)
    .order('created_at', { ascending: false });

  if (categorySlug) {
    // Join filter: only return products whose category.slug matches
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (cat) query = query.eq('category_id', cat.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[fetchProducts]', error.message);
    return [];
  }
  return data as unknown as Product[];
}

/**
 * Fetch a single visible product by ID.
 * Used by the Product Detail Page (PDP).
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  const supabase = getPublicClient();

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories ( id, slug, name_en, name_mr )
    `)
    .eq('id', id)
    .eq('is_visible', true)
    .single();

  if (error) {
    console.error('[fetchProductById]', error.message);
    return null;
  }
  return data as unknown as Product;
}

/** Fetch 4 related products from the same category (excluding current) */
export async function fetchRelatedProducts(
  categoryId: string,
  excludeId: string
): Promise<Product[]> {
  const supabase = getPublicClient();

  const { data, error } = await supabase
    .from('products')
    .select('id, name_en, name_mr, price_inr, unit, image_url')
    .eq('category_id', categoryId)
    .eq('is_visible', true)
    .neq('id', excludeId)
    .limit(4);

  if (error) return [];
  return data as unknown as Product[];
}

// ---------------------------------------------------------------------------
// Products — admin queries (uses service_role to see hidden products too)
// ---------------------------------------------------------------------------

/** Admin: fetch ALL products regardless of visibility */
export async function fetchAllProductsAdmin(): Promise<Product[]> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories ( id, slug, name_en, name_mr )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[fetchAllProductsAdmin]', error.message);
    return [];
  }
  return data as unknown as Product[];
}
