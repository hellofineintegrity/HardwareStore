// =============================================================================
// app/products/page.tsx  — Product Listing Page (PLP)  [Server Component]
//
// URL patterns:
//   /products                 → all visible products
//   /products?category=cement-binding  → filtered by category slug
//   /products?q=cement        → search query (future)
//
// Data is fetched server-side → page is statically renderable at the edge.
// Category filter tabs are rendered as links (no client JS required).
// =============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchCategories, fetchProducts } from '@/lib/data';
import ProductCard from '@/components/ProductCard';

interface PLPPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

// Dynamic metadata per category
export async function generateMetadata({ searchParams }: PLPPageProps): Promise<Metadata> {
  const params = await searchParams;
  const categories = await fetchCategories();
  const activeCategory = categories.find((c) => c.slug === params.category);

  return {
    title: activeCategory
      ? `${activeCategory.name_en} — Shardul Enterprises`
      : 'All Products — Shardul Enterprises',
    description: `Browse ${activeCategory?.name_en ?? 'all'} construction materials at wholesale prices in Maharashtra.`,
  };
}

export default async function ProductsPage({ searchParams }: PLPPageProps) {
  const { category } = await searchParams;
  const activeSlug = category ?? '';

  // Fetch in parallel
  const [categories, products] = await Promise.all([
    fetchCategories(),
    fetchProducts(activeSlug || undefined),
  ]);

  const activeCategory = categories.find((c) => c.slug === activeSlug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {activeCategory ? activeCategory.name_en : 'All Products'}
        </h1>
        {activeCategory && (
          <p className="font-mr mt-1 text-gray-500">{activeCategory.name_mr}</p>
        )}
        <p className="mt-1 text-sm text-gray-400">
          {products.length} product{products.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* ── Category filter tabs ──────────────────────────────────────── */}
      {/* Rendered as <Link> — no JS needed, full SSR compatibility */}
      <div className="mb-8 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {/* "All" tab */}
        <Link
          href="/products"
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition
            ${!activeSlug
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300 hover:text-amber-700'
            }`}
        >
          All
        </Link>

        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/products?category=${cat.slug}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition
              ${activeSlug === cat.slug
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300 hover:text-amber-700'
              }`}
          >
            {cat.name_en}
          </Link>
        ))}
      </div>

      {/* ── Product grid ─────────────────────────────────────────────── */}
      {products.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <span className="text-5xl">🏗️</span>
          <h3 className="mt-4 text-lg font-semibold text-gray-700">
            No products in this category yet
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Check back soon, or browse other categories.
          </p>
          <Link
            href="/products"
            className="mt-5 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
          >
            View All Products
          </Link>
        </div>
      )}

      {/* ── WhatsApp bulk order banner ────────────────────────────────── */}
      <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-green-700 p-8 text-center sm:flex-row sm:text-left">
        <div className="flex-1">
          <p className="text-lg font-bold text-white">Need Bulk Quantities?</p>
          <p className="mt-1 text-sm text-green-200">
            Contact us directly on WhatsApp for special wholesale pricing and custom delivery.
          </p>
        </div>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919028835913'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-bold text-green-700
                     shadow transition hover:bg-green-50 active:scale-95"
        >
          💬 Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
