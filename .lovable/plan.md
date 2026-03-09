

## Comprehensive SEO Implementation Plan

### Overview
Add dynamic per-page SEO meta tags, Open Graph/Twitter cards, JSON-LD structured data, sitemap.xml, and updated robots.txt using `react-helmet-async`.

### 1. Install dependency
- Add `react-helmet-async` package

### 2. Create `src/components/SEO.tsx`
Reusable component accepting `title`, `description`, `image`, `url`, `type`, `noIndex`, and `jsonLd` props. Renders `<Helmet>` with:
- `<title>`, `<meta name="description">`, `<link rel="canonical">`
- Open Graph tags (og:title, og:description, og:image, og:url, og:type, og:site_name)
- Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image)
- JSON-LD `<script>` blocks from the `jsonLd` prop

### 3. Modify `src/App.tsx`
- Import `HelmetProvider` from `react-helmet-async`
- Wrap entire app with `<HelmetProvider>`

### 4. Add `<SEO>` to each public page

| Page | Title | JSON-LD Schema |
|------|-------|----------------|
| **Home** | `Silvaine — Premium Italian Sneakers \| Milano` | `WebSite` with search action |
| **Shop** | `Shop All \| Silvaine` | `ItemList` with product entries |
| **ProductDetail** | `{product.name} \| Silvaine` (dynamic) | `Product` schema (name, image, price, SKU, availability, brand, rating) |
| **About** | `About Silvaine \| Our Story` | `Organization` (founder, address, founding date) |
| **Contact** | `Contact Us \| Silvaine` | `LocalBusiness` (address, phone, email) |
| **Cart** | `Shopping Bag \| Silvaine` | None, `noIndex: true` |
| **Login** | `Sign In \| Silvaine` | None, `noIndex: true` |
| **Register** | `Create Account \| Silvaine` | None, `noIndex: true` |
| **ResetPassword** | `Reset Password \| Silvaine` | None, `noIndex: true` |
| **OrderSuccess** | `Order Confirmed \| Silvaine` | None, `noIndex: true` |
| **Checkout** | `Checkout \| Silvaine` | None, `noIndex: true` |

### 5. Create `public/sitemap.xml`
Static XML sitemap listing: `/`, `/shop`, `/about`, `/contact`, `/login`, `/register`

### 6. Update `public/robots.txt`
- Add `Disallow: /admin`
- Add `Disallow: /checkout`
- Add `Sitemap: https://silvaine-sneaker-boutique.lovable.app/sitemap.xml`

### 7. Enhance `index.html`
- Add `<meta name="robots" content="index, follow">`
- Add `<meta name="author" content="Silvaine">`
- Keep existing OG/Twitter tags as fallbacks

### Files changed
- **New**: `src/components/SEO.tsx`
- **New**: `public/sitemap.xml`
- **Modified**: `src/App.tsx`, `index.html`, `public/robots.txt`
- **Modified**: `Home.tsx`, `Shop.tsx`, `ProductDetail.tsx`, `About.tsx`, `Contact.tsx`, `Cart.tsx`, `Login.tsx`, `Register.tsx`, `ResetPassword.tsx`, `OrderSuccess.tsx`, `Checkout.tsx` (add `<SEO>` at top of each return)

