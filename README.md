# QuickBaazar — Next.js storefront

App Router · TypeScript · server-rendered catalogue pages · cookie-session cart/wishlist/orders.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Pick a look with `NEXT_PUBLIC_THEME` (`nuvo`, `colorblock`, `editorial`, `luxury`, `trust`, `stickybuy`).

## Admin panel
Open **/admin** (log in with `admin@quickbaazar.com` / `admin123` in development).
Manage products, banners, blog posts, coupons, orders, customers, enquiries, newsletter subscribers, system logs and store settings.
Also included: abandoned-checkout recovery (copy link / WhatsApp), wishlist insights, review moderation, inventory editor, analytics funnel, CSV import/export with image URLs, bulk delete / activate / price change, and Google Tag Manager / GA4 / Meta Pixel tracking (Settings → Tracking).
Everything you add shows on the storefront immediately. Data is stored in `data/db.json`; uploads go to `public/uploads`.
Set `ADMIN_USER`, `ADMIN_PASSWORD`, `ADMIN_SECRET` in `.env.local` before deploying (see `.env.example`).

## API (all under `/api`)
| Area | Endpoint |
|---|---|
| Catalogue | `GET /products?category&q&sort&minPrice&maxPrice&rating&discount&brand&page&limit` · `GET /products/:id` · `GET/POST /products/:id/reviews` · `GET /categories` · `GET /brands` · `GET /search/suggest?q=` · `GET /home` |
| Cart | `GET/POST/PATCH/DELETE /cart` · `POST/DELETE /cart/coupon` · `POST /coupons/validate` |
| Wishlist | `GET/POST/DELETE /wishlist` |
| Orders | `GET/POST /orders` · `GET /orders/:id` · `GET /track?orderId=` |
| Auth | `POST /auth/otp` · `POST /auth/verify` · `POST /auth/logout` · `GET /me` |
| Other | `GET /offers` · `GET /pincode/:pin` · `POST /contact` · `POST /newsletter` |

## Going to production
Everything is served from `lib/db.ts` (in-memory, resets on restart) and `lib/data.ts` (seed catalogue).
Replace those functions with your database / backend — the routes and pages don't change.
Still to wire: real SMS OTP, payment gateway (Razorpay/Stripe) before `placeOrder`, image CDN, persistent sessions (Redis/DB).
