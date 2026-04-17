// =============================================================================
// app/api/products/route.ts
// Next.js App Router API Route — Product CRUD
//
// Endpoints:
//   GET  /api/products          → List visible products (public)
//   POST /api/products          → Create a product (admin; uploads image to Cloudinary)
//   PUT  /api/products          → Update a product (admin)
//
// Security model:
//   • Reads use the Supabase anon client (RLS enforces is_visible = TRUE).
//   • Writes use the Supabase SERVICE_ROLE client (bypasses RLS; server-only).
//   • The SERVICE_ROLE_KEY is NEVER sent to the browser — it lives only in
//     server-side environment variables.
//
// Environment variables required (add to .env.local):
//   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
//   SUPABASE_SERVICE_ROLE_KEY=eyJ...        ← SERVER ONLY, never NEXT_PUBLIC_
//   CLOUDINARY_CLOUD_NAME=your_cloud
//   CLOUDINARY_API_KEY=123456789012345
//   CLOUDINARY_API_SECRET=your_secret
//   ADMIN_SECRET=a_random_secret_token      ← Simple bearer token for admin routes
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import type { ApiResponse, Product } from '@/types';

// ---------------------------------------------------------------------------
// Cloudinary configuration (runs once at module load on the server)
// ---------------------------------------------------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure:     true, // Always use HTTPS delivery URLs
});

// ---------------------------------------------------------------------------
// Supabase clients
// ---------------------------------------------------------------------------

/**
 * Admin client — uses SERVICE_ROLE_KEY which bypasses RLS.
 * MUST stay server-side. Never expose this key in the browser bundle.
 */
const getAdminSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        // Disable auto-refresh in server context (no browser session)
        autoRefreshToken: false,
        persistSession:   false,
      },
    }
  );

/**
 * Public client — uses ANON_KEY. RLS is enforced (is_visible = TRUE filter).
 * Safe to use for unauthenticated reads.
 */
const getPublicSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// ---------------------------------------------------------------------------
// Auth helper — simple bearer token check for admin mutations
// ---------------------------------------------------------------------------

/**
 * Validates the Authorization header against ADMIN_SECRET.
 *
 * Expected header: Authorization: Bearer <ADMIN_SECRET>
 *
 * In production you would swap this for Supabase Auth JWT validation or
 * NextAuth session checks. This simple approach is suitable for a solo
 * business-owner admin where the secret is stored securely on the device.
 */
function isAdminAuthorised(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization') ?? '';
  const [scheme, token] = authHeader.split(' ');
  return scheme === 'Bearer' && token === process.env.ADMIN_SECRET;
}

// ---------------------------------------------------------------------------
// Cloudinary upload helper
// ---------------------------------------------------------------------------

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

/**
 * Uploads a File/Blob to Cloudinary and returns the CDN URL + public_id.
 *
 * We convert the file to a base64 data URI and use the upload stream API.
 * The `construction-catalog` folder keeps all product images organised.
 * `eager` transforms generate a WebP thumbnail preemptively.
 */
async function uploadToCloudinary(
  file: File,
  existingPublicId?: string
): Promise<CloudinaryUploadResult> {
  // Convert File → ArrayBuffer → Buffer for Node.js Cloudinary SDK
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uploadOptions: Record<string, any> = {
      folder: 'construction-catalog',
      // If updating, overwrite the existing asset to keep the same URL
      ...(existingPublicId ? { public_id: existingPublicId, overwrite: true } : {}),
      // Generate a WebP thumbnail (400×400, crop to fill) eagerly on upload
      eager: [{ width: 400, height: 400, crop: 'fill', format: 'webp' }],
      // Automatic quality optimisation
      quality: 'auto',
      fetch_format: 'auto',
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error || !result) {
          reject(new Error(error?.message ?? 'Cloudinary upload failed'));
          return;
        }
        resolve({
          secure_url: result.secure_url,
          public_id:  result.public_id,
        });
      }
    );

    // Write the buffer to the upload stream
    uploadStream.end(buffer);
  });
}

// ---------------------------------------------------------------------------
// GET /api/products
// Public endpoint — returns all visible products with joined category name.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('category');
  const search       = searchParams.get('q');

  const supabase = getPublicSupabase();

  let query = supabase
    .from('products')
    .select(
      `
      id, name_en, name_mr, description_en, description_mr,
      price_inr, unit, stock_quantity, image_url, is_visible,
      seo_keywords, specifications, created_at,
      categories ( name_en, name_mr, slug )
      `
    )
    // RLS already enforces is_visible = TRUE for the anon key
    .order('created_at', { ascending: false });

  // Optional category filter — join via the categories table slug
  if (categorySlug) {
    query = query.eq('categories.slug', categorySlug);
  }

  // Optional full-text search on the English product name
  if (search) {
    query = query.textSearch('name_en', search, { type: 'websearch' });
  }

  const { data, error } = await query;

  if (error) {
    console.error('[GET /api/products] Supabase error:', error.message);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch products.' },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResponse<Product[]>>(
    { success: true, data: data as unknown as Product[] },
    {
      status: 200,
      // Cache for 60 seconds on the CDN edge; revalidate in background (ISR-like)
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    }
  );
}

// ---------------------------------------------------------------------------
// POST /api/products
// Admin endpoint — parses multipart/form-data, uploads to Cloudinary,
// then inserts a new product row into Supabase.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Auth check ────────────────────────────────────────────────────────────
  if (!isAdminAuthorised(request)) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorised.' },
      { status: 401 }
    );
  }

  try {
    // ── Parse multipart/form-data ─────────────────────────────────────────
    // Next.js App Router exposes request.formData() natively — no busboy needed.
    const formData = await request.formData();

    // ── Extract and validate required fields ──────────────────────────────
    const imageFile = formData.get('image');
    const name_en   = (formData.get('name_en')   as string | null)?.trim();
    const name_mr   = (formData.get('name_mr')   as string | null)?.trim();
    const category_id = (formData.get('category_id') as string | null)?.trim();
    const unit        = (formData.get('unit')        as string | null)?.trim();

    if (!imageFile || !(imageFile instanceof File) || imageFile.size === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Product image is required.' },
        { status: 400 }
      );
    }
    if (!name_en || !name_mr || !category_id || !unit) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'name_en, name_mr, category_id and unit are required.' },
        { status: 400 }
      );
    }

    // ── Validate image MIME type ──────────────────────────────────────────
    const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!ALLOWED_MIME.includes(imageFile.type)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Only JPEG, PNG, WebP, and HEIC images are accepted.' },
        { status: 400 }
      );
    }

    // ── File size guard (10 MB) ───────────────────────────────────────────
    const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
    if (imageFile.size > MAX_BYTES) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Image must be smaller than 10 MB.' },
        { status: 400 }
      );
    }

    // ── Upload image to Cloudinary ────────────────────────────────────────
    const { secure_url, public_id } = await uploadToCloudinary(imageFile);

    // ── Parse optional / nullable fields ─────────────────────────────────
    const description_en = (formData.get('description_en') as string | null)?.trim() || null;
    const description_mr = (formData.get('description_mr') as string | null)?.trim() || null;

    const priceRaw = (formData.get('price_inr') as string | null)?.trim();
    const price_inr = priceRaw ? parseFloat(priceRaw) : null;
    if (price_inr !== null && isNaN(price_inr)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'price_inr must be a valid number.' },
        { status: 400 }
      );
    }

    const stockRaw     = (formData.get('stock_quantity') as string | null)?.trim();
    const stock_quantity = stockRaw ? parseInt(stockRaw, 10) : 0;

    // Parse comma-separated keywords → string[]
    const keywordsRaw   = (formData.get('seo_keywords') as string | null) ?? '';
    const seo_keywords  = keywordsRaw
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    // Parse specifications JSON string → Record<string, string>
    const specsRaw  = (formData.get('specifications') as string | null) ?? '{}';
    let specifications: Record<string, string> = {};
    try {
      specifications = JSON.parse(specsRaw);
    } catch {
      // Non-fatal: default to empty object if malformed JSON is sent
      console.warn('[POST /api/products] Failed to parse specifications JSON:', specsRaw);
    }

    const is_visible = formData.get('is_visible') !== 'false'; // defaults to true

    // ── Insert into Supabase ──────────────────────────────────────────────
    const supabase = getAdminSupabase();

    const { data: product, error: dbError } = await supabase
      .from('products')
      .insert({
        category_id,
        name_en,
        name_mr,
        description_en,
        description_mr,
        price_inr,
        unit,
        stock_quantity,
        image_url:           secure_url,
        cloudinary_public_id: public_id,
        is_visible,
        seo_keywords,
        specifications,
      })
      .select()
      .single(); // Returns the newly created row

    if (dbError) {
      // If DB insert fails after Cloudinary upload, clean up the orphaned image
      console.error('[POST /api/products] Supabase insert error:', dbError.message);
      try {
        await cloudinary.uploader.destroy(public_id);
      } catch (cleanupErr) {
        console.error('[POST /api/products] Cloudinary cleanup failed:', cleanupErr);
      }

      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to save product to database.' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<Product>>(
      { success: true, data: product as Product },
      { status: 201 }
    );

  } catch (err) {
    console.error('[POST /api/products] Unexpected error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/products
// Admin endpoint — update an existing product.
// If a new image file is provided, it replaces the old Cloudinary asset.
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest): Promise<NextResponse> {
  if (!isAdminAuthorised(request)) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorised.' },
      { status: 401 }
    );
  }

  try {
    const formData  = await request.formData();
    const productId = (formData.get('id') as string | null)?.trim();

    if (!productId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Product id is required for update.' },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    // ── Fetch existing product to get the current Cloudinary public_id ────
    const { data: existing, error: fetchError } = await supabase
      .from('products')
      .select('cloudinary_public_id')
      .eq('id', productId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Product not found.' },
        { status: 404 }
      );
    }

    // ── Build update payload ──────────────────────────────────────────────
    // Only include fields that were actually sent in the form
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {};

    const fields = [
      'category_id', 'name_en', 'name_mr',
      'description_en', 'description_mr', 'unit',
    ] as const;

    for (const field of fields) {
      const val = (formData.get(field) as string | null)?.trim();
      if (val !== null && val !== undefined) updates[field] = val || null;
    }

    const priceRaw = (formData.get('price_inr') as string | null)?.trim();
    if (priceRaw !== null && priceRaw !== undefined) {
      updates.price_inr = priceRaw ? parseFloat(priceRaw) : null;
    }

    const stockRaw = (formData.get('stock_quantity') as string | null)?.trim();
    if (stockRaw) updates.stock_quantity = parseInt(stockRaw, 10);

    const isVisibleRaw = formData.get('is_visible');
    if (isVisibleRaw !== null) updates.is_visible = isVisibleRaw !== 'false';

    const keywordsRaw = formData.get('seo_keywords') as string | null;
    if (keywordsRaw !== null) {
      updates.seo_keywords = keywordsRaw.split(',').map((k) => k.trim()).filter(Boolean);
    }

    const specsRaw = formData.get('specifications') as string | null;
    if (specsRaw) {
      try {
        updates.specifications = JSON.parse(specsRaw);
      } catch {
        console.warn('[PUT /api/products] Failed to parse specifications:', specsRaw);
      }
    }

    // ── Handle optional new image ─────────────────────────────────────────
    const newImageFile = formData.get('image');
    if (newImageFile instanceof File && newImageFile.size > 0) {
      // Overwrite the existing Cloudinary asset (keeps the same public_id / CDN URL)
      const { secure_url, public_id } = await uploadToCloudinary(
        newImageFile,
        existing.cloudinary_public_id ?? undefined
      );
      updates.image_url            = secure_url;
      updates.cloudinary_public_id = public_id;
    }

    // ── Update in Supabase ────────────────────────────────────────────────
    const { data: updatedProduct, error: dbError } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (dbError) {
      console.error('[PUT /api/products] Supabase update error:', dbError.message);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to update product.' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<Product>>(
      { success: true, data: updatedProduct as Product },
      { status: 200 }
    );

  } catch (err) {
    console.error('[PUT /api/products] Unexpected error:', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
