import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — Shardul Enterprises',
  description: 'Get in touch with Shardul Enterprises for bulk pricing, delivery queries, or product information.',
};

export default function ContactPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919876543210';

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">

      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Contact Us</h1>
        <p className="font-mr mt-2 text-lg text-gray-500">संपर्क करा</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Contact details */}
        <div className="flex flex-col gap-4">

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-green-200 bg-green-50 p-6
                       transition hover:border-green-400 hover:shadow-sm"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </span>
            <div>
              <p className="font-bold text-green-800">WhatsApp</p>
              <p className="text-sm text-green-700">Chat with us for instant quotes</p>
              <p className="mt-0.5 text-xs text-green-600">+{whatsappNumber}</p>
            </div>
          </a>

          {/* Phone */}
          <a
            href={`tel:+${whatsappNumber}`}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6
                       transition hover:border-amber-300 hover:shadow-sm"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-2xl">
              📞
            </span>
            <div>
              <p className="font-bold text-gray-800">Call Us</p>
              <p className="text-sm text-gray-500">Mon–Sat, 9 AM – 7 PM</p>
              <p className="mt-0.5 text-xs text-amber-700">+{whatsappNumber}</p>
            </div>
          </a>

          {/* Location */}
          <a
            href="https://maps.app.goo.gl/5aTJVSosnUx7ouzF9"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6
                       transition hover:border-amber-300 hover:shadow-sm"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-2xl">
              📍
            </span>
            <div>
              <p className="font-bold text-gray-800">Location</p>
              <p className="text-sm text-gray-500">Chiplun, Maharashtra, India</p>
              <p className="mt-0.5 text-xs text-amber-600 underline">View on Google Maps →</p>
            </div>
          </a>

          {/* Hours */}
          <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-2xl">
              🕐
            </span>
            <div>
              <p className="font-bold text-gray-800">Business Hours</p>
              <p className="text-sm text-gray-500">Monday – Saturday</p>
              <p className="mt-0.5 text-xs text-gray-400">9:00 AM – 7:00 PM IST</p>
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-6">
            <h2 className="font-bold text-gray-900 mb-3">How to Order</h2>
            <ol className="space-y-3 text-sm text-gray-600">
              {[
                'Browse our product catalog and note the product name.',
                'Click "Request Quote on WhatsApp" on any product page.',
                'Share your quantity, delivery location, and contact details.',
                'Receive a custom quote within 30 minutes during business hours.',
                'Confirm the order and schedule delivery.',
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-3">We Supply To</h2>
            <div className="flex flex-wrap gap-2">
              {['Individual Homeowners','Builders & Developers','Contractors','Architects','Government Projects','Real Estate Companies'].map((type) => (
                <span key={type} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Google Map ──────────────────────────────────────────────────── */}
      <div className="mt-10">
        <h2 className="mb-3 text-lg font-bold text-gray-900">Find Us Here</h2>
        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <iframe
            title="Shardul Enterprises Location"
            src="https://maps.google.com/maps?q=17.511873,73.572465&z=16&output=embed"
            width="100%"
            height="380"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">
          Chiplun, Maharashtra, India ·{' '}
          <a
            href="https://maps.app.goo.gl/5aTJVSosnUx7ouzF9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 hover:underline"
          >
            Open in Google Maps
          </a>
        </p>
      </div>
    </div>
  );
}
