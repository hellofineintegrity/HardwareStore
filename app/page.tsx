// =============================================================================
// app/page.tsx  — Homepage (Server Component)
// Sections:
//   1. Hero banner with WhatsApp CTA
//   2. Category shortcut grid
//   3. Featured / latest products
//   4. Trust badges (delivery, quality, pricing)
// =============================================================================

import Link from 'next/link';
import { fetchCategories, fetchProducts } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import HeroCarousel from '@/components/HeroCarousel';

export default async function HomePage() {
  // Fetch in parallel — server components support concurrent awaits
  const [categories, latestProducts] = await Promise.all([
    fetchCategories(),
    fetchProducts(), // no filter → all visible products, newest first
  ]);

  const featured = latestProducts.slice(0, 8); // Show up to 8 on homepage

  return (
    <>
      {/* ================================================================
          HERO SECTION
      ================================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800">
        {/* Decorative background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">

            {/* ── LEFT: Text content ──────────────────────────────────── */}
            <div>
              {/* Badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                🏗️ Maharashtra&apos;s Trusted Supplier Since 2010
              </span>

              {/* Headline */}
              <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
                Shardul Enterprises<br />
                <span className="text-amber-200">Build with Confidence</span>
              </h1>

              {/* Marathi subline */}
              <p className="font-mr mt-2 text-lg text-amber-100">
                दर्जेदार बांधकाम साहित्य, वाजवी किमतीत
              </p>

              <p className="mt-4 text-sm leading-relaxed text-amber-100/90 sm:text-base">
                Premium cement, TMT steel, AAC blocks, sand and finishing
                materials delivered across Maharashtra. Wholesale pricing for
                builders, contractors and individuals.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-amber-700
                             shadow-lg transition hover:bg-amber-50 active:scale-95"
                >
                  Browse Products
                </Link>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919028835913'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border-2 border-white/40 bg-white/10
                             px-6 py-3 text-sm font-bold text-white backdrop-blur-sm
                             transition hover:bg-white/20 active:scale-95"
                >
                  💬 Get Bulk Quote
                </a>
              </div>

              {/* Social proof numbers */}
              <div className="mt-10 flex flex-wrap gap-6">
                {[
                  { value: '500+', label: 'Happy Customers' },
                  { value: '10+', label: 'Years Experience' },
                  { value: '5', label: 'Product Categories' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-amber-200">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Product carousel ─────────────────────────────── */}
            <div className="hidden lg:block">
              <HeroCarousel products={featured} />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          CATEGORY GRID
      ================================================================ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-sm text-gray-500">श्रेणीनुसार खरेदी करा</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-amber-700 hover:underline">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-200
                         bg-white p-5 text-center shadow-sm transition-all
                         hover:-translate-y-1 hover:border-amber-300 hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-2xl
                               transition-colors group-hover:bg-amber-600 group-hover:text-white">
                {cat.icon === 'layers'        ? '🏛️' :
                 cat.icon === 'grid-3x3'     ? '⚙️' :
                 cat.icon === 'square'       ? '🧱' :
                 cat.icon === 'triangle'     ? '🏔️' :
                 cat.icon === 'paint-bucket' ? '🎨' : '📦'}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-amber-700">
                  {cat.name_en}
                </p>
                <p className="font-mr mt-0.5 text-xs text-gray-400">
                  {cat.name_mr}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================================================================
          FEATURED PRODUCTS
      ================================================================ */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Latest Products</h2>
            <p className="text-sm text-gray-500">नवीन उत्पादने</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-amber-700 hover:underline">
            View all →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <p className="text-gray-400">No products available yet.</p>
            <p className="mt-1 text-sm text-gray-400">Check back soon!</p>
          </div>
        )}
      </section>

      {/* ================================================================
          TRUST BADGES
      ================================================================ */}
      <section className="border-t border-gray-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: '🚚', title: 'Fast Delivery',   sub: 'Across Maharashtra' },
              { icon: '✅', title: 'IS Certified',    sub: 'All products tested' },
              { icon: '💰', title: 'Wholesale Price', sub: 'Best market rates' },
              { icon: '📱', title: 'WhatsApp Order',  sub: 'Chat to place order' },
            ].map((badge) => (
              <div key={badge.title} className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-2xl">
                  {badge.icon}
                </span>
                <div>
                  <p className="font-semibold text-gray-800">{badge.title}</p>
                  <p className="text-sm text-gray-500">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
