// app/not-found.tsx
// Shown when notFound() is called (e.g. product not found in the DB)

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl">🏗️</span>
      <h1 className="mt-4 text-3xl font-bold text-gray-900">Page Not Found</h1>
      <p className="mt-2 text-gray-500">
        The product or page you&apos;re looking for doesn&apos;t exist.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/products"
          className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700"
        >
          Browse Products
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700 hover:border-gray-400"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
