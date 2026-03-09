

## Plan: Comprehensive SEO Enhancement

### Current State
- Only static meta tags in `index.html` (same title/description for all pages)
- No per-page dynamic titles or meta descriptions
- No `react-helmet-async` or equivalent for SPA meta management
- Basic `robots.txt` — no sitemap reference
- One JSON-LD schema (Organization) — no Product, BreadcrumbList, or other structured data
- No canonical URLs, no `sitemap.xml`

### Changes

**1. Install `react-helmet-async` and create an SEO component**
- New file: `src/components/SEO.tsx` — reusable component accepting `title`, `description`, `image`, `url`, `type`, and optional `jsonLd` props
- Sets `<title>`, `meta description`, Open Graph tags, Twitter Card tags, and canonical URL dynamically per page

**2. Add SEO wrapper to `App.tsx`**
- Wrap app with `<HelmetProvider>`

**3. Add `<SEO>` to every public page with unique content:**

| Page | Title | Description |
|------|-------|-------------|
| Home | `Silvaine — Premium Italian Sneakers \| Milano` | Luxury sneakers handcrafted in Milano... |
| Shop | `Shop All \| Silvaine` | Browse our collection of premium Italian leather sneakers... |
| ProductDetail | `{Product Name} \| Silvaine` (dynamic) | `{product.description}` (dynamic) |
| About | `About Silvaine \| Our Story` | Founded by Asif Hossain, crafted in Milano... |
| Contact | `Contact Us \| Silvaine` | Get in touch with our Milano atelier... |
| Cart | `Shopping Bag \| Silvaine` | Review your selections... |
| Login/Register | `Sign In \| Silvaine` / `Create Account \| Silvaine` | ... |

**4. Add JSON-LD structured data per page:**
- **Home**: `WebSite` schema with search action
- **ProductDetail**: `Product` schema (name, image, price, availability, brand, SKU, reviews/rating)
- **Shop**: `ItemList` schema listing products
- **About**: Enhanced `Organization` schema (logo, sameAs social links, foundingDate)
- **Contact**: `ContactPage` + `LocalBusiness` with address, phone, email

**5. Create `public/sitemap.xml`**
- Static sitemap listing all public routes (`/`, `/shop`, `/about`, `/contact`, `/login`, `/register`)
- Note: product pages are dynamic, so we include a `/shop` entry and optionally a few key product slugs

**6. Update `public/robots.txt`**
- Add `Sitemap: https://silvaine-sneaker-boutique.lovable.app/sitemap.xml`
- Add `Disallow: /admin` to block admin pages from indexing

**7. Enhance `index.html`**
- Add `<meta name="robots" content="index, follow">`
- Add `<meta name="author" content="Silvaine">`
- Add `<link rel="canonical" href="https://silvaine-sneaker-boutique.lovable.app/">`
- Keep existing OG/Twitter tags as fallbacks

### Files
- **New**: `src/components/SEO.tsx`
- **New**: `public/sitemap.xml`
- **Modified**: `src/App.tsx` (HelmetProvider wrap)
- **Modified**: `src/pages/Home.tsx`, `Shop.tsx`, `ProductDetail.tsx`, `About.tsx`, `Contact.tsx`, `Cart.tsx`, `Login.tsx`, `Register.tsx` (add `<SEO>`)
- **Modified**: `public/robots.txt` (sitemap + disallow admin)
- **Modified**: `index.html` (additional meta)

