// =============================================================================
// components/Navbar.tsx
// Responsive Mega Menu Navigation Bar.
//
// Desktop: Full nav with a "Products" trigger that opens a multi-column
//          category mega menu panel on hover.
// Mobile:  Hamburger button → slide-in drawer with accordion category list.
//
// Props:   categories — fetched server-side (RSC) and passed in, keeping
//          this component purely presentational with minimal client state.
// =============================================================================

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavCategory } from '@/types';
import Logo from '@/components/Logo';

// ---------------------------------------------------------------------------
// Sub-component: CategoryIcon
// Renders a simple SVG icon matched by name. Extend as needed.
// Using inline SVGs avoids an icon library dependency.
// ---------------------------------------------------------------------------
const CategoryIcon: React.FC<{ name: string | null; className?: string }> = ({
  name,
  className = 'w-5 h-5',
}) => {
  const paths: Record<string, React.ReactNode> = {
    layers: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3M6.429 9.75 12 6.75l5.571 3"
      />
    ),
    'grid-3x3': (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
      />
    ),
    square: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z"
      />
    ),
    triangle: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3 L21 3 L12 20 Z"
      />
    ),
    'paint-bucket': (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
      />
    ),
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      {name && paths[name] ? paths[name] : null}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Sub-component: MegaMenuPanel
// The desktop dropdown panel — shown on hover over the "Products" trigger.
// ---------------------------------------------------------------------------
interface MegaMenuPanelProps {
  categories: NavCategory[];
  locale: 'en' | 'mr';
  isOpen: boolean;
  onClose: () => void;
}

const MegaMenuPanel: React.FC<MegaMenuPanelProps> = ({
  categories,
  locale,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    // Absolutely-positioned panel below the navbar.
    // Uses onMouseLeave to close when cursor exits the panel.
    <div
      className="absolute left-0 right-0 top-full z-50 hidden md:block"
      onMouseLeave={onClose}
      role="navigation"
      aria-label="Product categories"
    >
      {/* Subtle shadow + border to separate from page content */}
      <div className="border-t border-amber-100 bg-white shadow-xl">
        <div className="mx-auto max-w-7xl px-6 py-8">
          {/* Grid of category cards — 5 columns on lg, 3 on md */}
          <div className="grid grid-cols-3 gap-4 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                onClick={onClose}
                className="group flex flex-col items-center gap-3 rounded-xl border border-transparent p-4 text-center
                           transition-all duration-200 hover:border-amber-200 hover:bg-amber-50"
              >
                {/* Icon badge */}
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full
                              bg-amber-100 text-amber-700 transition-colors
                              group-hover:bg-amber-600 group-hover:text-white"
                >
                  <CategoryIcon name={cat.icon} className="h-6 w-6" />
                </span>

                {/* Category name — shows locale-appropriate label */}
                <span className="text-sm font-semibold leading-tight text-gray-800 group-hover:text-amber-700">
                  {locale === 'mr' ? cat.name_mr : cat.name_en}
                </span>
              </Link>
            ))}
          </div>

          {/* Footer CTA inside the mega panel */}
          <div className="mt-6 border-t border-gray-100 pt-4 text-center">
            <Link
              href="/products"
              onClick={onClose}
              className="text-sm font-medium text-amber-700 hover:text-amber-900 hover:underline"
            >
              View all products →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sub-component: MobileDrawer
// Full-height slide-in sidebar for small screens.
// ---------------------------------------------------------------------------
interface MobileDrawerProps {
  categories: NavCategory[];
  locale: 'en' | 'mr';
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({
  categories,
  locale,
  isOpen,
  onClose,
  pathname,
}) => {
  const navLinks = [
    {
      href: '/',
      label: 'Home',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round"
          d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      ),
    },
    {
      href: '/products',
      label: 'All Products',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      ),
    },
    {
      href: '/about',
      label: 'About Us',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round"
          d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
      ),
    },
    {
      href: '/contact',
      label: 'Contact',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
      ),
    },
  ];

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden
                    ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Drawer panel ─────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col bg-white shadow-2xl
                    transition-transform duration-300 ease-in-out md:hidden
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Mobile navigation"
        role="navigation"
      >
        {/* ── Header: amber gradient strip with logo ───────────── */}
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-3.5">
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
            <Logo variant="icon" className="h-8 w-8" />
            <div>
              <p className="text-sm font-bold leading-tight text-white">Shardul Enterprises</p>
              <p className="text-[10px] leading-none text-amber-200">Chiplun&apos;s Construction Hub</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20
                       text-white transition hover:bg-white/30"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ───────────────────────────────────── */}
        <div className="min-h-0 flex-1 overflow-y-auto">

          {/* Primary nav links */}
          <nav className="px-3 pt-4">
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Menu
            </p>
            {navLinks.map(({ href, label, icon }) => {
              const active = pathname === href || (href === '/products' && pathname.startsWith('/products'));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all
                    ${active
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    strokeWidth={1.8} stroke="currentColor"
                    className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-amber-500'}`}>
                    {icon}
                  </svg>
                  {label}
                  {active && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                      className="ml-auto h-4 w-4 text-white/70">
                      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="mx-4 my-3 border-t border-gray-100" />

          {/* Category list */}
          <div className="px-3">
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Categories
            </p>
            <div className="space-y-0.5">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm
                             text-gray-700 transition hover:bg-amber-50 hover:text-amber-700"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                    <CategoryIcon name={cat.icon} className="h-4 w-4 text-amber-600" />
                  </span>
                  <span className="font-medium">
                    {locale === 'mr' ? cat.name_mr : cat.name_en}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                    className="ml-auto h-3.5 w-3.5 text-gray-300">
                    <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer: contact CTAs pinned at bottom ─────────────── */}
        <div className="border-t border-gray-100 bg-gray-50 p-3 space-y-2">
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919028835913'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm
                       font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            WhatsApp for Bulk Quote
          </a>
          <a
            href={`tel:+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919028835913'}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white
                       py-2.5 text-sm font-semibold text-gray-700 transition hover:border-amber-300 hover:text-amber-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={1.8} stroke="currentColor" className="h-4 w-4 text-amber-500">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
            </svg>
            Call Us
          </a>
        </div>
      </aside>
    </>
  );
};

// ---------------------------------------------------------------------------
// Main Component: Navbar
// ---------------------------------------------------------------------------

export interface NavbarProps {
  /** Categories fetched by the parent Server Component */
  categories: NavCategory[];
  /** Active locale, defaults to English */
  locale?: 'en' | 'mr';
}

const Navbar: React.FC<NavbarProps> = ({ categories, locale = 'en' }) => {
  const pathname = usePathname();

  // ── State ─────────────────────────────────────────────────────────────────
  /** Controls the mobile slide-in drawer */
  const [mobileOpen, setMobileOpen] = useState(false);
  /** Controls the desktop mega menu panel */
  const [megaOpen, setMegaOpen] = useState(false);

  /** Ref for the "Products" desktop trigger — used for keyboard focus management */
  const productsButtonRef = useRef<HTMLButtonElement>(null);

  // ── Close mega menu when route changes (e.g. user clicks a category link) ─
  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // ── Close mega menu on Escape key ─────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMegaOpen(false);
        setMobileOpen(false);
        productsButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMegaMouseEnter = useCallback(() => setMegaOpen(true), []);
  const handleMegaClose = useCallback(() => setMegaOpen(false), []);

  // ── Active link helper ────────────────────────────────────────────────────
  const isActive = (href: string) =>
    pathname === href
      ? 'text-amber-700 font-semibold'
      : 'text-gray-700 hover:text-amber-700';

  return (
    <>
    {/* Sticky top bar — uses a layered z-index so the mega menu sits over content */}
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">

        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <Link href="/" className="flex shrink-0 items-center">
          <Logo variant="full" className="h-9 w-9" />
        </Link>

        {/* ── Desktop Navigation ───────────────────────────────────────────── */}
        {/* The relative wrapper is critical for mega menu absolute positioning */}
        <nav className="relative hidden flex-1 items-center justify-center gap-8 md:flex" aria-label="Main navigation">
          <Link href="/" className={`text-sm transition-colors ${isActive('/')}`}>
            Home
          </Link>

          {/* Products trigger — hover opens mega menu */}
          <div
            onMouseEnter={handleMegaMouseEnter}
            className="relative"
          >
            <button
              ref={productsButtonRef}
              onClick={() => setMegaOpen((prev) => !prev)}
              aria-expanded={megaOpen}
              aria-haspopup="true"
              className={`flex items-center gap-1 text-sm transition-colors ${
                pathname.startsWith('/products') ? 'font-semibold text-amber-700' : 'text-gray-700 hover:text-amber-700'
              }`}
            >
              Products
              {/* Animated chevron */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`h-4 w-4 transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`}
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Mega panel is positioned relative to the nav wrapper above,
                not this button, so it spans full width */}
          </div>

          <Link href="/about" className={`text-sm transition-colors ${isActive('/about')}`}>
            About Us
          </Link>
          <Link href="/contact" className={`text-sm transition-colors ${isActive('/contact')}`}>
            Contact
          </Link>
        </nav>

        {/* ── Desktop Right Actions ────────────────────────────────────────── */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Locale toggle */}
          <button
            className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600
                       transition hover:border-amber-300 hover:text-amber-700"
            aria-label="Toggle language"
          >
            {locale === 'en' ? 'मराठी' : 'English'}
          </button>

          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919028835913'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold
                       text-white shadow-sm transition hover:bg-green-700 active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Get Quote
          </a>
        </div>

        {/* ── Mobile Hamburger ─────────────────────────────────────────────── */}
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {/* ── Desktop Mega Menu Panel ───────────────────────────────────────── */}
      {/* Must be INSIDE <header> so it inherits sticky positioning correctly */}
      <MegaMenuPanel
        categories={categories}
        locale={locale}
        isOpen={megaOpen}
        onClose={handleMegaClose}
      />
    </header>

    {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
    {/* MUST be OUTSIDE <header> — backdrop-filter on header creates a new   */}
    {/* CSS containing block that clips fixed children to the header height. */}
    <MobileDrawer
      categories={categories}
      locale={locale}
      isOpen={mobileOpen}
      onClose={() => setMobileOpen(false)}
      pathname={pathname}
    />
    </>
  );
};

export default Navbar;
