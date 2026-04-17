import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us — Shardul Enterprises',
  description: 'Learn about Shardul Enterprises, Maharashtra\'s trusted construction materials supplier with over 10 years of experience.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">

      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900">About Shardul Enterprises</h1>
        <p className="font-mr mt-2 text-lg text-gray-500">आमच्याबद्दल</p>
      </div>

      {/* Story */}
      <div className="rounded-2xl bg-white border border-gray-200 p-8 shadow-sm mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Our Story</h2>
        <p className="text-sm leading-relaxed text-gray-600">
          Shardul Enterprises was founded with a single mission — to make quality construction materials accessible
          to every builder, contractor, and homeowner across Maharashtra. With over 10 years of experience
          in the industry, we have built strong relationships with leading manufacturers like UltraTech,
          TATA Tiscon, and others to bring you genuine, IS-certified products at wholesale prices.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          From our warehouse in Maharashtra, we serve customers across Pune, Mumbai, Nashik, Aurangabad,
          Nagpur and all major towns — delivering on time, every time.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        {[
          { value: '10+',   label: 'Years Experience' },
          { value: '500+',  label: 'Happy Customers' },
          { value: '5',     label: 'Product Categories' },
          { value: '100%',  label: 'IS Certified' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-amber-50 border border-amber-100 p-5 text-center">
            <p className="text-3xl font-bold text-amber-700">{stat.value}</p>
            <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Values */}
      <div className="rounded-2xl bg-white border border-gray-200 p-8 shadow-sm mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Why Choose Us</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: '✅', title: 'IS Certified Products',    desc: 'Every product meets Bureau of Indian Standards specifications.' },
            { icon: '💰', title: 'Wholesale Pricing',        desc: 'Direct from manufacturer partnerships — best rates in Maharashtra.' },
            { icon: '🚚', title: 'Reliable Delivery',        desc: 'Timely delivery across Maharashtra with dedicated logistics.' },
            { icon: '📞', title: 'Expert Guidance',          desc: 'Our team helps you choose the right material for your project.' },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-amber-600 p-8 text-center">
        <h2 className="text-xl font-bold text-white">Ready to Build?</h2>
        <p className="mt-2 text-sm text-amber-100">Browse our catalog or get in touch for bulk pricing.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-amber-700 hover:bg-amber-50"
          >
            Browse Products
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border-2 border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/20"
          >
            Contact Us
          </Link>
        </div>
      </div>

    </div>
  );
}
