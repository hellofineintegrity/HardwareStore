'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatINR, cloudinaryTransform } from '@/lib/utils';
import type { Product } from '@/types';

interface HeroCarouselProps {
  products: Product[];
}

export default function HeroCarousel({ products }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % products.length);
  }, [products.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + products.length) % products.length);
  }, [products.length]);

  // Auto-advance every 3.5 s, pause on hover
  useEffect(() => {
    if (paused || products.length <= 1) return;
    const id = setInterval(next, 3500);
    return () => clearInterval(id);
  }, [paused, next, products.length]);

  if (products.length === 0) return null;

  const product = products[current];
  const imageUrl = cloudinaryTransform(product.image_url, { width: 600, height: 450 });

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Slide ─────────────────────────────────────────────────────── */}
      <Link
        href={`/products/${product.id}`}
        className="group relative flex-1 overflow-hidden rounded-t-2xl"
      >
        <div className="relative h-64 w-full sm:h-72 lg:h-80">
          {imageUrl && imageUrl !== '/placeholder.jpg' ? (
            <Image
              key={product.id}
              src={imageUrl}
              alt={product.name_en}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-amber-800/40 text-8xl">
              🏗️
            </div>
          )}
          {/* Gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Product info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          {product.categories && (
            <span className="mb-1 inline-block rounded-full bg-amber-500/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              {(product.categories as { name_en: string }).name_en}
            </span>
          )}
          <p className="line-clamp-1 text-base font-bold leading-snug drop-shadow">
            {product.name_en}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-amber-300 drop-shadow">
            {formatINR(product.price_inr)}
            <span className="ml-1 text-xs font-normal text-white/70">/ {product.unit}</span>
          </p>
        </div>
      </Link>

      {/* ── Controls row ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-b-2xl bg-black/20 px-4 py-2.5">
        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Prev / Next arrows */}
        <div className="flex gap-1">
          <button
            onClick={prev}
            aria-label="Previous product"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20
                       text-white transition hover:bg-white/40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next product"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20
                       text-white transition hover:bg-white/40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
