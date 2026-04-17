// =============================================================================
// app/admin/page.tsx  [Server Component]
//
// The admin page is a thin server shell that:
//   1. Fetches all products (including hidden) using the service_role client
//   2. Passes them to the AdminDashboard client component
//   3. Wraps everything in AdminGate for password protection
//
// The heavy UI work (list, toggle, form) happens client-side in AdminDashboard.
// =============================================================================

import type { Metadata } from 'next';
import { fetchAllProductsAdmin, fetchCategories } from '@/lib/data';
import AdminGate       from '@/components/admin/AdminGate';
import AdminDashboard  from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title:  'Admin — BuildMart',
  robots: 'noindex, nofollow', // Prevent indexing of the admin panel
};

// Opt out of static caching — admin always needs fresh data
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Fetch all products (visible + hidden) and categories in parallel
  const [allProducts, categories] = await Promise.all([
    fetchAllProductsAdmin(),
    fetchCategories(),
  ]);

  return (
    <AdminGate>
      <AdminDashboard
        initialProducts={allProducts}
        categories={categories}
      />
    </AdminGate>
  );
}
