// =============================================================================
// app/layout.tsx
// Root layout — wraps every page with Navbar + footer.
// Categories are fetched HERE (server component) once per request and passed
// down to the Navbar so it never needs its own data fetch.
// =============================================================================

import type { Metadata } from 'next';
import { fetchCategories } from '@/lib/data';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title:       'Shardul Enterprises — Maharashtra Construction Materials',
  description: 'Premium construction materials supplier in Maharashtra. Cement, TMT Steel, AAC Blocks, Sand, Aggregates and Finishing materials at wholesale prices.',
  keywords:    'construction materials Maharashtra, cement price, TMT bars, AAC blocks, building materials, Shardul Enterprises',
  openGraph: {
    title:       'Shardul Enterprises — Maharashtra Construction Materials',
    description: 'Your trusted construction materials supplier in Maharashtra.',
    type:        'website',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch categories on the server — passed to Navbar as a prop.
  // This keeps the Navbar as a Client Component (for interactivity)
  // while data fetching stays server-side (fast, no client waterfall).
  const categories = await fetchCategories();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Google Font — Tiro Devanagari Hindi handles Marathi script beautifully */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">

        {/* ── Navigation ── */}
        <Navbar categories={categories} />

        {/* ── Page content ── */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>

        {/* ── Footer ── */}
        <footer className="mt-16 border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

              {/* Brand */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-600 text-white text-xs font-bold">SE</span>
                  <span className="font-bold text-gray-900">Shardul Enterprises</span>
                </div>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                  Maharashtra&apos;s trusted construction materials supplier. Quality assured, timely delivery.
                </p>
              </div>

              {/* Quick links */}
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-3">Quick Links</p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><a href="/" className="hover:text-amber-700">Home</a></li>
                  <li><a href="/products" className="hover:text-amber-700">All Products</a></li>
                  <li><a href="/about" className="hover:text-amber-700">About Us</a></li>
                  <li><a href="/contact" className="hover:text-amber-700">Contact</a></li>
                </ul>
              </div>

              {/* Categories */}
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-3">Categories</p>
                <ul className="space-y-2 text-sm text-gray-500">
                  {categories.slice(0, 5).map((cat) => (
                    <li key={cat.slug}>
                      <a href={`/products?category=${cat.slug}`} className="hover:text-amber-700">
                        {cat.name_en}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-3">Contact Us</p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li>📍 Maharashtra, India</li>
                  <li>
                    <a href={`tel:+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919028835913'}`} className="hover:text-amber-700">
                      📞 +{process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919028835913'}
                    </a>
                  </li>
                  <li>
                    <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919028835913'}`} target="_blank" rel="noopener noreferrer" className="hover:text-amber-700">
                      💬 WhatsApp Us
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
              © {new Date().getFullYear()} Shardul Enterprises. All rights reserved. | Maharashtra, India
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
