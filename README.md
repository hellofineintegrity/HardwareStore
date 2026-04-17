# BuildMart — Construction Materials Catalog
Maharashtra's construction materials web catalog built with Next.js + Supabase + Cloudinary.

## Quick Start

### Step 1: Install
```bash
npx create-next-app@latest . --typescript --tailwind --app
npm install @supabase/supabase-js cloudinary
```

### Step 2: Environment variables
Rename `.env.local.example` to `.env.local` and fill in your values.

### Step 3: Database
Run `schema.sql` in Supabase SQL Editor (supabase.com > SQL Editor).

### Step 4: Run
```bash
npm run dev
```

## Pages
| URL | Description |
|-----|-------------|
| `/` | Homepage with hero, categories, latest products |
| `/products` | Product listing with category filter tabs |
| `/products/[id]` | Product detail — bilingual, specs, WhatsApp CTA |
| `/admin` | Admin dashboard (password protected) |

## Note on [id] folder
The folder `app/products/id_placeholder/` should be renamed to `app/products/[id]/`
after extracting the ZIP. The brackets are required by Next.js for dynamic routes.
