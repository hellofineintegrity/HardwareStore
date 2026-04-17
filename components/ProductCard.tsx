// =============================================================================
// components/ProductCard.tsx
// Reusable product card used in the Product Listing Page grid and
// the "Related Products" section on the PDP.
// =============================================================================

import Link from 'next/link';
import Image from 'next/image';
import { formatINR, cloudinaryTransform, truncate } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  locale?: 'en' | 'mr';
}

export default function ProductCard({ product, locale = 'en' }: ProductCardProps) {
  const name        = locale === 'mr' ? product.name_mr        : product.name_en;
  const description = locale === 'mr' ? product.description_mr : product.description_en;
  const imageUrl    = cloudinaryTransform(product.image_url, { width: 400, height: 300 });

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200
                 bg-white shadow-sm transition-all duration-200
                 hover:-translate-y-1 hover:shadow-lg hover:border-amber-200"
    >
      {/* ── Product image ─────────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {imageUrl && imageUrl !== '/placeholder.jpg' ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          /* Placeholder when no image is set */
          <div className="flex h-full w-full items-center justify-center text-4xl text-gray-300">
            🏗️
          </div>
        )}

        {/* Stock badge */}
        {product.stock_quantity === 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
            Out of Stock
          </span>
        )}
      </div>

      {/* ── Card body ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category label */}
        {product.categories && (
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-600">
            {locale === 'mr'
              ? (product.categories as { name_mr: string }).name_mr
              : (product.categories as { name_en: string }).name_en}
          </p>
        )}

        {/* Product name */}
        <h3 className={`text-sm font-bold leading-snug text-gray-900 ${locale === 'mr' ? 'font-mr' : ''}`}>
          {name}
        </h3>

        {/* Short description */}
        {description && (
          <p className={`mt-1.5 flex-1 text-xs leading-relaxed text-gray-500 ${locale === 'mr' ? 'font-mr' : ''}`}>
            {truncate(description, 80)}
          </p>
        )}

        {/* ── Price row ──────────────────────────────────────────────── */}
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-lg font-bold text-gray-900">
              {formatINR(product.price_inr)}
            </p>
            <p className="text-xs text-gray-400">per {product.unit}</p>
          </div>

          {/* CTA arrow — appears on hover */}
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                       bg-amber-50 text-amber-600 transition-colors
                       group-hover:bg-amber-600 group-hover:text-white"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
