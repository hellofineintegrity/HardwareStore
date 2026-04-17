// =============================================================================
// next.config.js
// =============================================================================
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Allow Cloudinary images for next/image optimisation
        protocol: 'https',
        hostname:  'res.cloudinary.com',
        pathname:  '/**',
      },
    ],
  },
};

module.exports = nextConfig;


// =============================================================================
// tailwind.config.ts  (save as a separate file: tailwind.config.ts)
// =============================================================================
/*
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**\/*.{ts,tsx}',
    './components/**\/*.{ts,tsx}',
    './lib/**\/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mr:   ['Tiro Devanagari Hindi', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
*/


// =============================================================================
// .env.local  (create this file — NEVER commit to git)
// =============================================================================
/*
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOURPROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Admin portal password
ADMIN_SECRET=choose_a_long_random_string_here

# WhatsApp number (include country code, no + sign)
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
*/


// =============================================================================
// package.json dependencies to install
// Run:  npm install @supabase/supabase-js cloudinary
// =============================================================================
/*
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "cloudinary": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
*/
