// =============================================================================
// app/products/[id]/page.tsx  — Product Detail Page (PDP)  [Server Component]
//
// Features:
//   • Bilingual toggle (English / Marathi) via URL query param `?lang=mr`
//   • Full specifications table from JSONB
//   • WhatsApp "Request Quote" CTA with pre-filled message
//   • Related products from the same category
//   • Structured data (JSON-LD) for Google SEO
// =============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchProductById, fetchRelatedProducts } from '@/lib/data';
import { formatINR, buildWhatsAppUrl, cloudinaryTransform } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';

interface PDPPageProps {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ lang?: 'en' | 'mr' }>;
}

// Dynamic <title> and <meta description> for each product
export async function generateMetadata({ params }: PDPPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) return { title: 'Product Not Found — Shardul Enterprises' };

  return {
    title:       `${product.name_en} — Shardul Enterprises`,
    description: product.description_en?.slice(0, 155) ?? `Buy ${product.name_en} at wholesale price.`,
    keywords:    product.seo_keywords.join(', '),
    openGraph: {
      title:  product.name_en,
      description: product.description_en ?? '',
      images: product.image_url ? [{ url: product.image_url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params, searchParams }: PDPPageProps) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  // Language toggle — defaults to English
  const lang: 'en' | 'mr' = sp.lang === 'mr' ? 'mr' : 'en';

  const product = await fetchProductById(id);
  if (!product) notFound();

  const name        = lang === 'mr' ? product.name_mr        : product.name_en;
  const description = lang === 'mr' ? product.description_mr : product.description_en;
  const imageUrl    = cloudinaryTransform(product.image_url, { width: 800, height: 600 });
  const whatsAppUrl = buildWhatsAppUrl(product);

  // Related products (parallel fetch, doesn't block rendering)
  const related = product.category_id
    ? await fetchRelatedProducts(product.category_id, product.id)
    : [];

  // Structured data for Google rich results
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type':    'Product',
    name:       product.name_en,
    description: product.description_en,
    image:      product.image_url,
    offers: {
      '@type':        'Offer',
      priceCurrency:  'INR',
      price:          product.price_inr ?? 0,
      availability:   product.stock_quantity > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

        {/* ── Breadcrumb ───────────────────────────────────────────────── */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-700">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-amber-700">Products</Link>
          {product.categories && (
            <>
              <span>/</span>
              <Link
                href={`/products?category=${(product.categories as { slug: string }).slug}`}
                className="hover:text-amber-700"
              >
                {(product.categories as { name_en: string }).name_en}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="font-medium text-gray-700 truncate max-w-[150px]">{product.name_en}</span>
        </nav>

        {/* ── Main content: image + details ────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-2">

          {/* LEFT: Product image */}
          <div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100">
              {imageUrl && imageUrl !== '/placeholder.jpg' ? (
                <Image
                  src={imageUrl}
                  alt={name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-7xl text-gray-300">
                  🏗️
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product info */}
          <div className="flex flex-col gap-5">

            {/* Language toggle */}
            <div className="flex gap-2">
              <Link
                href={`/products/${product.id}`}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition
                  ${lang === 'en' ? 'bg-amber-600 text-white' : 'border border-gray-300 text-gray-600 hover:border-amber-400'}`}
              >
                English
              </Link>
              <Link
                href={`/products/${product.id}?lang=mr`}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition
                  ${lang === 'mr' ? 'bg-amber-600 text-white' : 'border border-gray-300 text-gray-600 hover:border-amber-400'}`}
              >
                मराठी
              </Link>
            </div>

            {/* Category tag */}
            {product.categories && (
              <Link
                href={`/products?category=${(product.categories as { slug: string }).slug}`}
                className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-200"
              >
                {lang === 'mr'
                  ? (product.categories as { name_mr: string }).name_mr
                  : (product.categories as { name_en: string }).name_en}
              </Link>
            )}

            {/* Name */}
            <h1 className={`text-3xl font-bold leading-tight text-gray-900 ${lang === 'mr' ? 'font-mr' : ''}`}>
              {name}
            </h1>

            {/* Price */}
            <div className="rounded-2xl bg-amber-50 p-5">
              <p className="text-3xl font-bold text-gray-900">
                {formatINR(product.price_inr)}
              </p>
              <p className="mt-0.5 text-sm text-gray-500">per {product.unit}</p>

              {/* Stock indicator */}
              <div className="mt-3 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium text-gray-700">
                  {product.stock_quantity > 0
                    ? `In Stock (${product.stock_quantity.toLocaleString('en-IN')} ${product.unit}s available)`
                    : 'Currently Out of Stock'}
                </span>
              </div>
            </div>

            {/* Description */}
            {description && (
              <div>
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
                  Description
                </h2>
                <p className={`text-sm leading-relaxed text-gray-700 ${lang === 'mr' ? 'font-mr' : ''}`}>
                  {description}
                </p>
              </div>
            )}

            {/* WhatsApp CTA — primary action */}
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 rounded-2xl bg-green-600 py-4
                         text-base font-bold text-white shadow-lg transition
                         hover:bg-green-700 active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Request Quote on WhatsApp
            </a>

            {/* Call CTA — secondary */}
            <a
              href={`tel:+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919028835913'}`}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-200
                         py-3.5 text-sm font-bold text-gray-700 transition hover:border-amber-400 hover:text-amber-700"
            >
              📞 Call for Bulk Pricing
            </a>
          </div>
        </div>

        {/* ── Specifications table ──────────────────────────────────────── */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Technical Specifications</h2>
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value], index) => (
                    <tr
                      key={key}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-5 py-3.5 font-semibold text-gray-700 w-2/5 border-r border-gray-200">
                        {key}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Related Products ──────────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-5 text-xl font-bold text-gray-900">Related Products</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((rel) => (
                <ProductCard key={rel.id} product={rel} locale={lang} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
