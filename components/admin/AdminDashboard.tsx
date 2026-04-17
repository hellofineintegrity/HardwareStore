// =============================================================================
// components/admin/AdminDashboard.tsx  [Client Component]
// Full admin dashboard: product list, visibility toggle, add/edit flow.
// Receives initial data from the Server Component (page.tsx) as props.
// =============================================================================

'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { formatINR, cloudinaryTransform } from '@/lib/utils';
import ProductUploadForm from '@/components/admin/ProductUploadForm';
import type { Category, Product } from '@/types';

interface AdminDashboardProps {
  initialProducts:  Product[];
  categories:       Category[];
}

type View = 'list' | 'add' | 'edit';

const SESSION_KEY = 'bm_admin_token';

/** Reads the admin token from sessionStorage — set by AdminGate */
function getToken(): string {
  return sessionStorage.getItem(SESSION_KEY) ?? '';
}

export default function AdminDashboard({
  initialProducts,
  categories,
}: AdminDashboardProps) {
  const [products,       setProducts]       = useState<Product[]>(initialProducts);
  const [view,           setView]           = useState<View>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [togglingId,     setTogglingId]     = useState<string | null>(null);

  // ── Visibility toggle ──────────────────────────────────────────────────────
  const handleToggleVisibility = useCallback(async (product: Product) => {
    setTogglingId(product.id);
    try {
      const form = new FormData();
      form.append('id',         product.id);
      form.append('is_visible', String(!product.is_visible));

      const res = await fetch('/api/products', {
        method:  'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
        body:    form,
      });

      if (!res.ok) throw new Error('Toggle failed');

      // Optimistic update — flip the flag locally without a full refetch
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_visible: !p.is_visible } : p
        )
      );
    } catch (err) {
      console.error('Visibility toggle error:', err);
      alert('Failed to update visibility. Check your admin token.');
    } finally {
      setTogglingId(null);
    }
  }, []);

  // ── After successful form submission ───────────────────────────────────────
  const handleProductSaved = useCallback(
    (savedProduct: Product) => {
      if (editingProduct) {
        // Update existing product in the list
        setProducts((prev) =>
          prev.map((p) => (p.id === savedProduct.id ? savedProduct : p))
        );
      } else {
        // Prepend new product
        setProducts((prev) => [savedProduct, ...prev]);
      }
      setView('list');
      setEditingProduct(null);
    },
    [editingProduct]
  );

  // ── Edit button ────────────────────────────────────────────────────────────
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setView('edit');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">

      {/* ── Dashboard header ──────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {view === 'list' ? 'Inventory'  :
             view === 'add'  ? 'Add Product' : 'Edit Product'}
          </h1>
          <p className="text-sm text-gray-500">
            {view === 'list' ? `${products.length} total products` : ''}
          </p>
        </div>

        {/* Action button */}
        {view === 'list' ? (
          <button
            onClick={() => { setEditingProduct(null); setView('add'); }}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5
                       text-sm font-bold text-white shadow-sm transition
                       hover:bg-amber-700 active:scale-95"
          >
            + Add Product
          </button>
        ) : (
          <button
            onClick={() => { setView('list'); setEditingProduct(null); }}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold
                       text-gray-600 transition hover:border-gray-400"
          >
            ← Back to List
          </button>
        )}
      </div>

      {/* ── PRODUCT LIST VIEW ─────────────────────────────────────────── */}
      {view === 'list' && (
        <div className="space-y-3">
          {products.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
              <p className="text-gray-400">No products yet. Add your first product!</p>
            </div>
          )}

          {products.map((product) => {
            const imageUrl = cloudinaryTransform(product.image_url, { width: 120, height: 90 });

            return (
              <div
                key={product.id}
                className={`flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm
                            transition ${!product.is_visible ? 'opacity-60 border-gray-200' : 'border-gray-200'}`}
              >
                {/* Thumbnail */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-20 sm:w-20">
                  {imageUrl && imageUrl !== '/placeholder.jpg' ? (
                    <Image
                      src={imageUrl}
                      alt={product.name_en}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">🏗️</div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">{product.name_en}</p>
                  <p className="font-mr truncate text-xs text-gray-500">{product.name_mr}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">
                      {formatINR(product.price_inr)}
                    </span>
                    <span className="text-xs text-gray-400">/ {product.unit}</span>
                    {/* Visibility badge */}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold
                        ${product.is_visible
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'}`}
                    >
                      {product.is_visible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  {/* Visibility toggle */}
                  <button
                    onClick={() => handleToggleVisibility(product)}
                    disabled={togglingId === product.id}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition
                      ${product.is_visible
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                      } disabled:opacity-50`}
                    title={product.is_visible ? 'Hide from store' : 'Show on store'}
                  >
                    {togglingId === product.id
                      ? '...'
                      : product.is_visible ? '👁 Hide' : '👁 Show'}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleEdit(product)}
                    className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold
                               text-amber-700 transition hover:bg-amber-100"
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ADD / EDIT FORM VIEW ──────────────────────────────────────── */}
      {(view === 'add' || view === 'edit') && (
        <ProductUploadForm
          categories={categories}
          existingProduct={editingProduct ?? undefined}
          onSuccess={handleProductSaved}
        />
      )}
    </div>
  );
}
