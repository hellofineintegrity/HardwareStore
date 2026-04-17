-- ============================================================
-- Construction Catalog — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID generation (already enabled on Supabase by default,
-- but listed here for completeness / local dev parity)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- TABLE: categories
-- Stores the top-level product categories shown in the Mega Menu.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug         TEXT        UNIQUE NOT NULL,          -- URL-safe identifier e.g. "cement-binding"
  name_en      TEXT        NOT NULL,                  -- English label
  name_mr      TEXT        NOT NULL,                  -- Marathi label (Devanagari)
  icon         TEXT,                                  -- Lucide/Heroicon name or emoji fallback
  sort_order   INTEGER     NOT NULL DEFAULT 0,        -- Controls display order in nav
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.categories            IS 'Product categories shown in the storefront mega menu.';
COMMENT ON COLUMN public.categories.slug       IS 'URL-safe slug used in /category/[slug] routes.';
COMMENT ON COLUMN public.categories.name_mr    IS 'Category name in Marathi (Devanagari script).';


-- ============================================================
-- TABLE: products
-- Core inventory table with bilingual fields, Cloudinary image
-- reference, pricing in INR, and a JSONB specifications bag.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id                    UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relationship
  category_id           UUID          REFERENCES public.categories(id) ON DELETE SET NULL,

  -- Bilingual content fields
  name_en               TEXT          NOT NULL,
  name_mr               TEXT          NOT NULL,
  description_en        TEXT,
  description_mr        TEXT,

  -- Pricing & inventory
  price_inr             NUMERIC(12,2),                -- NULL means "price on request"
  unit                  TEXT          NOT NULL,        -- e.g. '50kg Bag', 'Brass', 'Metric Tonne'
  stock_quantity        INTEGER       NOT NULL DEFAULT 0,

  -- Cloudinary image references
  image_url             TEXT,                          -- Full Cloudinary delivery URL
  cloudinary_public_id  TEXT,                          -- Used for image deletion/transforms

  -- Admin controls
  is_visible            BOOLEAN       NOT NULL DEFAULT TRUE,

  -- SEO
  seo_keywords          TEXT[]        NOT NULL DEFAULT '{}',

  -- Flexible specification bag: { "Grade": "OPC 53", "IS Code": "IS 269:2015" }
  specifications        JSONB         NOT NULL DEFAULT '{}',

  -- Audit timestamps
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.products                       IS 'Full product catalog with bilingual (EN/MR) fields.';
COMMENT ON COLUMN public.products.price_inr             IS 'Price in Indian Rupees. NULL = price on request.';
COMMENT ON COLUMN public.products.unit                  IS 'Standard construction unit: 50kg Bag, Brass, Metric Tonne, Cubic Meter, Per Piece, etc.';
COMMENT ON COLUMN public.products.cloudinary_public_id  IS 'Cloudinary public_id for image management (delete, transform).';
COMMENT ON COLUMN public.products.specifications        IS 'Flexible key-value JSONB for product-specific specs.';


-- ============================================================
-- FUNCTION + TRIGGER: auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- INDEXES: optimise the most common query patterns
-- ============================================================
-- Category filter on PLP
CREATE INDEX IF NOT EXISTS idx_products_category_id  ON public.products(category_id);
-- Admin toggle visibility queries
CREATE INDEX IF NOT EXISTS idx_products_is_visible   ON public.products(is_visible);
-- Full-text search over English product names
CREATE INDEX IF NOT EXISTS idx_products_name_en_fts
  ON public.products USING gin(to_tsvector('english', name_en));


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Strategy:
--   • Public visitors → SELECT visible products & all categories (anon key)
--   • Service role (used by the Next.js API route server-side) → full access
--   • No direct authenticated user writes from the browser
-- ============================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products   ENABLE ROW LEVEL SECURITY;

-- ── Categories ──────────────────────────────────────────────
-- Anyone (including unauthenticated visitors) can read categories.
CREATE POLICY "categories_public_select"
  ON public.categories
  FOR SELECT
  USING (TRUE);

-- Only the service role (server-side API) may mutate categories.
CREATE POLICY "categories_service_role_all"
  ON public.categories
  FOR ALL
  USING      (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── Products ────────────────────────────────────────────────
-- Public visitors may only read visible products.
CREATE POLICY "products_public_select_visible"
  ON public.products
  FOR SELECT
  USING (is_visible = TRUE);

-- The server-side API route uses the SERVICE_ROLE_KEY which
-- bypasses RLS entirely — this policy is a safety fallback
-- for any future direct authenticated-user admin UI.
CREATE POLICY "products_service_role_all"
  ON public.products
  FOR ALL
  USING      (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ============================================================
-- SEED: Category rows (matches the Mega Menu structure)
-- ============================================================
INSERT INTO public.categories (slug, name_en, name_mr, icon, sort_order) VALUES
  ('cement-binding',  'Cement & Binding',   'सिमेंट व बाईंडिंग',    'layers',       1),
  ('steel-tmt',       'Steel & TMT Bars',   'स्टील व टीएमटी बार',    'grid-3x3',    2),
  ('bricks-blocks',   'Bricks & Blocks',    'विटा व ब्लॉक्स',        'square',       3),
  ('sand-aggregates', 'Sand & Aggregates',  'वाळू व खडी',            'triangle',     4),
  ('finishing',       'Finishing',          'फिनिशिंग',              'paint-bucket', 5)
ON CONFLICT (slug) DO NOTHING;
