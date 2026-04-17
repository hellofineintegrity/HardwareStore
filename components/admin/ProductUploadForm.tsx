// =============================================================================
// components/admin/ProductUploadForm.tsx
// Mobile-First Admin Product Upload / Edit Form
//
// Key features:
//   1. Camera integration via <input capture="environment"> — triggers the
//      device's rear-facing camera on supported mobile browsers.
//   2. Live image preview before upload.
//   3. Bilingual fields (English + Marathi) side-by-side on tablet+, stacked
//      on mobile to maximise touch target size.
//   4. Specification key-value builder (dynamic rows).
//   5. Submits as multipart/form-data to POST /api/products.
//   6. Full TypeScript with exhaustive error handling.
// =============================================================================

'use client';

import React, {
  useState,
  useRef,
  useCallback,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import type { Category, Product } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One row in the dynamic specifications builder */
interface SpecRow {
  key: string;
  value: string;
}

/** Form field state (matches the DB schema) */
interface FormState {
  category_id: string;
  name_en: string;
  name_mr: string;
  description_en: string;
  description_mr: string;
  price_inr: string; // stored as string for controlled input; parsed on submit
  unit: string;
  stock_quantity: string;
  seo_keywords: string; // comma-separated for simplicity
  is_visible: boolean;
}

/** Submission state machine */
type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Common Indian construction units — shown in a datalist for quick input */
const COMMON_UNITS = [
  '50kg Bag',
  'Metric Tonne',
  'Brass',
  'Cubic Meter',
  'Per 1000 Pieces',
  'Per Piece',
  'Running Meter',
  'Square Meter',
  'Litre',
];

const INITIAL_FORM: FormState = {
  category_id: '',
  name_en: '',
  name_mr: '',
  description_en: '',
  description_mr: '',
  price_inr: '',
  unit: '',
  stock_quantity: '0',
  seo_keywords: '',
  is_visible: true,
};

// ---------------------------------------------------------------------------
// Sub-component: ImageCapture
// Encapsulates all camera / file selection logic in its own composable unit.
// ---------------------------------------------------------------------------

interface ImageCaptureProps {
  /** Called whenever the user picks or captures a new image */
  onFileChange: (file: File | null) => void;
  /** Object URL for preview rendering (managed by parent) */
  previewUrl: string | null;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({ onFileChange, previewUrl }) => {
  /**
   * We maintain TWO separate <input> elements:
   *   1. camera — uses capture="environment" to invoke the rear camera directly
   *   2. gallery — standard file picker (for selecting from device gallery or desktop)
   *
   * This pattern is intentional: some Android browsers require the capture
   * attribute on the element to correctly trigger camera mode. Sharing one
   * input and toggling the attribute programmatically is unreliable across
   * browsers. Two dedicated inputs ensures correct UX on all devices.
   */
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  /** Fired when either input has a file selected */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFileChange(file);
    // Reset the input value so the same file triggers onChange again if re-selected
    e.target.value = '';
  };

  const handleClearImage = () => {
    onFileChange(null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Product Photo <span className="text-red-500">*</span>
      </label>

      {/* Preview area ────────────────────────────────────────────────────── */}
      <div
        className="relative flex h-52 w-full items-center justify-center overflow-hidden
                   rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50
                   transition-colors hover:border-amber-400 hover:bg-amber-50"
      >
        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Product preview"
              className="h-full w-full object-cover"
            />
            {/* Overlay clear button */}
            <button
              type="button"
              onClick={handleClearImage}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center
                         rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700"
              aria-label="Remove image"
            >
              ✕
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-10 w-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
            <p className="text-sm">No photo selected</p>
          </div>
        )}
      </div>

      {/* Action buttons ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/*
         * ── CAMERA BUTTON ────────────────────────────────────────────────
         * capture="environment" instructs the browser to:
         *   • Open the rear-facing camera directly on iOS/Android
         *   • Skip the file picker on supported mobile browsers
         * accept="image/*" restricts to images only.
         * The hidden input is triggered programmatically by button click.
         */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-amber-200
                     bg-amber-50 py-3 text-sm font-semibold text-amber-800
                     transition hover:border-amber-400 hover:bg-amber-100 active:scale-95"
        >
          📷 Take Photo
        </button>

        {/* Hidden camera input */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"     // ← The key attribute for rear camera
          onChange={handleChange}
          className="sr-only"       // Visually hidden; triggered by the button above
          aria-hidden="true"
          tabIndex={-1}
        />

        {/*
         * ── GALLERY BUTTON ───────────────────────────────────────────────
         * No capture attribute = standard file picker / photo library.
         * Essential fallback for iOS PWAs, desktop Chrome, and Firefox.
         */}
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200
                     bg-white py-3 text-sm font-semibold text-gray-700
                     transition hover:border-gray-400 hover:bg-gray-50 active:scale-95"
        >
          🖼️ Choose File
        </button>

        {/* Hidden gallery input (no capture attribute) */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      <p className="text-xs text-gray-400">
        JPG or PNG · Max 10MB · Use rear camera for best inventory photos
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sub-component: SpecificationsBuilder
// Dynamic key-value rows for the product specifications JSONB field.
// ---------------------------------------------------------------------------

interface SpecificationsBuilderProps {
  rows: SpecRow[];
  onChange: (rows: SpecRow[]) => void;
}

const SpecificationsBuilder: React.FC<SpecificationsBuilderProps> = ({ rows, onChange }) => {
  const addRow = () => onChange([...rows, { key: '', value: '' }]);

  const updateRow = (index: number, field: keyof SpecRow, value: string) => {
    const updated = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    onChange(updated);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        Specifications
        <span className="ml-2 text-xs font-normal text-gray-400">(e.g. Grade, IS Code)</span>
      </label>

      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={row.key}
            onChange={(e) => updateRow(index, 'key', e.target.value)}
            placeholder="Property (e.g. Grade)"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                       focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
          <input
            type="text"
            value={row.value}
            onChange={(e) => updateRow(index, 'value', e.target.value)}
            placeholder="Value (e.g. OPC 53)"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                       focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
          <button
            type="button"
            onClick={() => removeRow(index)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
                       text-gray-400 hover:bg-red-50 hover:text-red-500"
            aria-label="Remove specification"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900"
      >
        <span className="text-lg leading-none">+</span> Add specification
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Component: ProductUploadForm
// ---------------------------------------------------------------------------

export interface ProductUploadFormProps {
  /** Categories fetched server-side for the category selector */
  categories: Pick<Category, 'id' | 'name_en' | 'name_mr'>[];
  /** When editing an existing product, pre-populate the form */
  existingProduct?: Product;
  /** Called after a successful submission so the parent can refresh data */
  onSuccess?: (product: Product) => void;
}

const ProductUploadForm: React.FC<ProductUploadFormProps> = ({
  categories,
  existingProduct,
  onSuccess,
}) => {
  // ── Image state ────────────────────────────────────────────────────────────
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    existingProduct?.image_url ?? null
  );

  // ── Form field state ───────────────────────────────────────────────────────
  const [form, setForm] = useState<FormState>({
    category_id:    existingProduct?.category_id ?? '',
    name_en:        existingProduct?.name_en ?? '',
    name_mr:        existingProduct?.name_mr ?? '',
    description_en: existingProduct?.description_en ?? '',
    description_mr: existingProduct?.description_mr ?? '',
    price_inr:      existingProduct?.price_inr?.toString() ?? '',
    unit:           existingProduct?.unit ?? '',
    stock_quantity: existingProduct?.stock_quantity?.toString() ?? '0',
    seo_keywords:   existingProduct?.seo_keywords?.join(', ') ?? '',
    is_visible:     existingProduct?.is_visible ?? true,
  });

  // ── Specifications dynamic rows ────────────────────────────────────────────
  const [specRows, setSpecRows] = useState<SpecRow[]>(() => {
    if (!existingProduct?.specifications) return [];
    return Object.entries(existingProduct.specifications).map(([key, value]) => ({
      key,
      value,
    }));
  });

  // ── Submission state ───────────────────────────────────────────────────────
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // ── Handlers ───────────────────────────────────────────────────────────────

  /** Updates a single form field, keeping the rest intact */
  const handleFieldChange = useCallback(
    (field: keyof FormState) =>
      (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value =
          e.target.type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
      },
    []
  );

  /** Handles image file selection from either camera or gallery input */
  const handleFileChange = useCallback((file: File | null) => {
    setImageFile(file);

    // Revoke any previous object URL to prevent memory leaks
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(existingProduct?.image_url ?? null);
    }
  }, [previewUrl, existingProduct?.image_url]);

  /** Form submission — builds FormData and POSTs to our API route */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ── Client-side validation ─────────────────────────────────────────────
    if (!existingProduct && !imageFile) {
      setErrorMessage('Please select or capture a product photo.');
      return;
    }
    if (!form.name_en.trim()) {
      setErrorMessage('English product name is required.');
      return;
    }
    if (!form.category_id) {
      setErrorMessage('Please select a category.');
      return;
    }

    setSubmitStatus('submitting');
    setErrorMessage('');

    try {
      // ── Build multipart/form-data ────────────────────────────────────────
      const payload = new FormData();

      // Append image file only if a new one was selected
      if (imageFile) {
        payload.append('image', imageFile);
      }

      // Scalar fields
      payload.append('category_id',   form.category_id);
      payload.append('name_en',       form.name_en.trim());
      payload.append('name_mr',       form.name_mr.trim());
      payload.append('description_en', form.description_en.trim());
      payload.append('description_mr', form.description_mr.trim());
      payload.append('unit',          form.unit.trim());
      payload.append('stock_quantity', form.stock_quantity);
      payload.append('is_visible',    String(form.is_visible));

      // Optional price (omit if blank → NULL in DB)
      if (form.price_inr.trim()) {
        payload.append('price_inr', form.price_inr.trim());
      }

      // SEO keywords (comma-separated string → parsed to array server-side)
      payload.append('seo_keywords', form.seo_keywords);

      // Specifications → serialise to JSON string → parsed server-side
      const specsObject = specRows
        .filter((row) => row.key.trim() && row.value.trim())
        .reduce<Record<string, string>>((acc, row) => {
          acc[row.key.trim()] = row.value.trim();
          return acc;
        }, {});
      payload.append('specifications', JSON.stringify(specsObject));

      // If editing, include the product ID
      if (existingProduct) {
        payload.append('id', existingProduct.id);
      }

      // ── API call ─────────────────────────────────────────────────────────
      const method = existingProduct ? 'PUT' : 'POST';
      const response = await fetch('/api/products', {
        method,
        headers: { Authorization: `Bearer ${sessionStorage.getItem('bm_admin_token') ?? ''}` },
        body: payload,
        // DO NOT set Content-Type header — the browser sets it automatically
        // with the correct multipart boundary when using FormData.
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? `Server error: ${response.status}`);
      }

      const result = await response.json();
      setSubmitStatus('success');
      onSuccess?.(result.data);

      // Reset form if creating a new product
      if (!existingProduct) {
        setForm(INITIAL_FORM);
        setSpecRows([]);
        setImageFile(null);
        setPreviewUrl(null);
      }
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      );
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const isEditing = Boolean(existingProduct);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto max-w-2xl space-y-8 pb-24" // pb-24 gives thumb room on mobile
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEditing
            ? 'Update the details below and tap Save.'
            : 'Fill in the details and tap Save to publish.'}
        </p>
      </div>

      {/* ── Image capture section ───────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <ImageCapture onFileChange={handleFileChange} previewUrl={previewUrl} />
      </section>

      {/* ── Basic info ──────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-gray-800">Product Details</h2>

        <div className="space-y-4">
          {/* Category selector */}
          <div>
            <label htmlFor="category_id" className="mb-1.5 block text-sm font-semibold text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category_id"
              value={form.category_id}
              onChange={handleFieldChange('category_id')}
              required
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm
                         focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_en} / {cat.name_mr}
                </option>
              ))}
            </select>
          </div>

          {/* Bilingual name fields — stacked on mobile, side-by-side on tablet */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name_en" className="mb-1.5 block text-sm font-semibold text-gray-700">
                Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                id="name_en"
                type="text"
                value={form.name_en}
                onChange={handleFieldChange('name_en')}
                placeholder="e.g. OPC 53 Grade Cement"
                required
                className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm
                           focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
            </div>
            <div>
              <label htmlFor="name_mr" className="mb-1.5 block text-sm font-semibold text-gray-700">
                Name (मराठी) <span className="text-red-500">*</span>
              </label>
              <input
                id="name_mr"
                type="text"
                value={form.name_mr}
                onChange={handleFieldChange('name_mr')}
                placeholder="उदा. ओपीसी ५३ ग्रेड सिमेंट"
                required
                /* Use a monospace-friendly font for Devanagari script input */
                lang="mr"
                className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm
                           focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>

          {/* Bilingual description fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="description_en" className="mb-1.5 block text-sm font-semibold text-gray-700">
                Description (English)
              </label>
              <textarea
                id="description_en"
                value={form.description_en}
                onChange={handleFieldChange('description_en')}
                rows={4}
                placeholder="Describe the product in English..."
                className="w-full resize-none rounded-xl border border-gray-300 px-3.5 py-3 text-sm
                           focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
            </div>
            <div>
              <label htmlFor="description_mr" className="mb-1.5 block text-sm font-semibold text-gray-700">
                वर्णन (मराठी)
              </label>
              <textarea
                id="description_mr"
                value={form.description_mr}
                onChange={handleFieldChange('description_mr')}
                rows={4}
                lang="mr"
                placeholder="मराठीत उत्पादनाचे वर्णन करा..."
                className="w-full resize-none rounded-xl border border-gray-300 px-3.5 py-3 text-sm
                           focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing & stock ─────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-gray-800">Pricing & Stock</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Price (₹) */}
          <div>
            <label htmlFor="price_inr" className="mb-1.5 block text-sm font-semibold text-gray-700">
              Price (₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-sm text-gray-500">
                ₹
              </span>
              <input
                id="price_inr"
                type="number"
                min="0"
                step="0.01"
                value={form.price_inr}
                onChange={handleFieldChange('price_inr')}
                placeholder="0.00"
                className="w-full rounded-xl border border-gray-300 py-3 pl-7 pr-3.5 text-sm
                           focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">Leave blank for &quot;Price on Request&quot;</p>
          </div>

          {/* Unit — uses datalist for suggestions, allows custom input */}
          <div>
            <label htmlFor="unit" className="mb-1.5 block text-sm font-semibold text-gray-700">
              Unit <span className="text-red-500">*</span>
            </label>
            <input
              id="unit"
              type="text"
              list="unit-suggestions"
              value={form.unit}
              onChange={handleFieldChange('unit')}
              placeholder="e.g. 50kg Bag"
              required
              className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm
                         focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
            {/* datalist provides autocomplete without constraining to options */}
            <datalist id="unit-suggestions">
              {COMMON_UNITS.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </div>

          {/* Stock */}
          <div>
            <label htmlFor="stock_quantity" className="mb-1.5 block text-sm font-semibold text-gray-700">
              Stock Qty
            </label>
            <input
              id="stock_quantity"
              type="number"
              min="0"
              value={form.stock_quantity}
              onChange={handleFieldChange('stock_quantity')}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm
                         focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </div>
        </div>
      </section>

      {/* ── Specifications ──────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <SpecificationsBuilder rows={specRows} onChange={setSpecRows} />
      </section>

      {/* ── SEO ─────────────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-gray-800">SEO Keywords</h2>
        <input
          id="seo_keywords"
          type="text"
          value={form.seo_keywords}
          onChange={handleFieldChange('seo_keywords')}
          placeholder="cement price Maharashtra, OPC 53 bag, ..."
          className="w-full rounded-xl border border-gray-300 px-3.5 py-3 text-sm
                     focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        />
        <p className="mt-1.5 text-xs text-gray-400">Comma-separated keywords for search engine indexing.</p>
      </section>

      {/* ── Visibility toggle ───────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">Visible on Storefront</p>
            <p className="text-xs text-gray-500">
              Toggle off to hide this product without deleting it.
            </p>
          </div>
          {/* Custom toggle switch */}
          <div className="relative">
            <input
              type="checkbox"
              checked={form.is_visible}
              onChange={handleFieldChange('is_visible')}
              className="peer sr-only"
            />
            <div className="h-7 w-12 rounded-full bg-gray-300 peer-checked:bg-amber-500 transition-colors" />
            <div
              className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow
                         transition-transform peer-checked:translate-x-5"
            />
          </div>
        </label>
      </section>

      {/* ── Error / Success feedback ────────────────────────────────────── */}
      {submitStatus === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}
      {submitStatus === 'success' && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700" role="status">
          ✅ Product {isEditing ? 'updated' : 'created'} successfully!
        </div>
      )}

      {/* ── Submit button ───────────────────────────────────────────────── */}
      {/* Fixed bottom bar on mobile so it's always accessible with one thumb */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white px-4 py-3 md:static md:border-0 md:bg-transparent md:px-0 md:py-0">
        <button
          type="submit"
          disabled={submitStatus === 'submitting'}
          className="w-full rounded-xl bg-amber-600 py-3.5 text-base font-bold text-white
                     shadow-md transition hover:bg-amber-700 active:scale-[0.98]
                     disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitStatus === 'submitting' ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading...
            </span>
          ) : (
            `💾 ${isEditing ? 'Save Changes' : 'Save Product'}`
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductUploadForm;
