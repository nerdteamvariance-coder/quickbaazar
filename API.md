# QuickBaazar API reference

Base URL: `http://localhost:3000/api` · All bodies and responses are JSON.

## Conventions

| | |
|---|---|
| **Session** | The first call to a cart, wishlist, order, auth or `/me` endpoint sets an `httpOnly` cookie `qb_sid`. Send cookies on every request (`credentials: 'same-origin'` in the browser, `-b cookies.txt` in curl). |
| **Success** | `200 OK` for reads and updates, `201 Created` for new resources. |
| **Failure** | Every handled failure returns `{ "error": "Human-readable message" }` with a `4xx` status. |
| **Unhandled** | A malformed JSON body or an unexpected exception returns Next.js's default `500`. |

### Shared objects

**Product**
```json
{ "id": 2, "brand": "Puma", "name": "Unisex Rickie Classic Sneakers", "category": "footwear", "gender": "men",
  "mrp": 5999, "price": 2279, "rating": 4.5, "ratings": 1203, "tag": "Bestseller", "image": "sneaker2", "stock": 9 }
```
`tag` is optional. `image` is an image key; the CDN URL is built from it.

**Cart**
```json
{ "items": [ { "id": 0, "productId": 2, "size": "8", "qty": 2, "product": { "...Product": "" } } ],
  "count": 2, "mrp": 11998, "subtotal": 4558, "discount": 7440,
  "coupon": "QUICK10", "couponOff": 300, "shipping": 0, "total": 4258, "freeShipLeft": 0 }
```
`items[].id` is the line's index in the cart. Use it as `index` for `PATCH` and `DELETE`.

**Order**
```json
{ "id": "QB-15487", "userId": "guest", "date": "2026-10-12T04:59:01.047Z", "status": "Paid",
  "items": [ { "productId": 2, "size": "8", "qty": 2, "price": 2279 } ], "total": 4258,
  "payment": "upi", "address": { "name": "Harish", "phone": "9876543210", "line1": "House 4", "pin": "201309", "city": "Noida" } }
```
`status` is `Paid` for prepaid methods and `Packed` for `cod`.

---

## 1. Catalogue

### `GET /api/products`
List and filter products.

| Query | Type | Notes |
|---|---|---|
| `category` | string | `all`, `men`, `women`, `kids`, `footwear`, `beauty`. Matches category or gender. |
| `q` | string | Searches brand, name and category. Overrides `category`. |
| `sort` | string | `lo`, `hi`, `off`, `rate`. Anything else keeps the default order. |
| `minPrice`, `maxPrice` | number | Selling price range. |
| `rating` | number | Minimum rating. |
| `discount` | number | Minimum % off. |
| `brand` | string, repeatable | `?brand=Puma&brand=HRX` |
| `page`, `limit` | number | Defaults `1` and `24`. |

**200**
```json
{ "total": 6, "page": 1, "limit": 24, "brands": ["Puma", "Campus"], "items": [ { "...Product": "" } ] }
```
No match is still `200` with `"total": 0` and `"items": []`. There is no 4xx for this endpoint.

### `GET /api/products/:id`
**200** `{ "product": { ...Product }, "related": [ ...Product ] }`
**404** `{ "error": "Not found" }`

### `GET /api/products/:id/reviews`
**200**
```json
[ { "id": 1, "name": "Aarav S.", "rating": 5, "text": "Exactly as shown.", "date": "2 weeks ago", "helpful": 24 } ]
```

### `POST /api/products/:id/reviews`
Body: `{ "name": "Meera", "rating": 5, "text": "Great fit" }`. `name` defaults to `Shopper`.

**201** `{ "id": 1760244000000, "name": "Meera", "rating": 5, "text": "Great fit", "date": "Just now", "helpful": 0 }`
**400** `{ "error": "Rating (1-5) and text required" }`

### `GET /api/categories`
**200** Mega-menu tree keyed by label:
```json
{ "Men": { "key": "men", "image": "tee", "title": "Basics, sorted", "cols": [["Topwear", ["T-shirts", "Shirts"]]] } }
```

### `GET /api/brands`
**200** `["Allen Solly", "Anouk", "Bacca Bucci"]`

### `GET /api/search/suggest?q=`
**200** `{ "trending": ["sneakers", "kurta set"], "products": [ ...up to 5 Product ] }`
`products` is empty when `q` is empty.

### `GET /api/home`
**200** `{ "hero": [...], "stories": [...], "trending": [...Product], "flashDeals": [...Product], "recommended": [...Product] }`

---

## 2. Cart

### `GET /api/cart`
**200** Cart. An empty session returns the Cart object with `"items": []` and `"freeShipLeft": 799`.

### `POST /api/cart`
Add a line. Body: `{ "productId": 2, "size": "8", "qty": 2 }`. `qty` defaults to `1`. The same product and size increases the existing line.

**200** Cart
**400** `{ "error": "productId and size required" }`

### `PATCH /api/cart`
Change a quantity. Body: `{ "index": 0, "qty": 3 }`. `qty` below `1` removes the line.

**200** Cart. An out-of-range `index` is ignored and the unchanged Cart is returned.

### `DELETE /api/cart`
Body `{ "index": 0 }` removes one line. An empty body clears the cart.

**200** Cart

### `POST /api/cart/coupon`
Apply a coupon. Body: `{ "code": "QUICK10" }`.

**200** Cart (with `coupon` and `couponOff` set)
**422** `{ "error": "That code isn’t valid" }`
**422** `{ "error": "QUICK10 needs ₹999 or more in your bag" }`
**422** `{ "error": "FREESHIP needs ₹499 or more in your bag" }`

| Code | Effect |
|---|---|
| `QUICK10` | 10% off, max ₹300, bag ≥ ₹999 |
| `FIRST100` | ₹100 off |
| `HDFC10` | 10% off, max ₹1,500 |
| `FREESHIP` | Free delivery, bag ≥ ₹499 |

### `DELETE /api/cart/coupon`
**200** Cart (with `coupon: null`)

### `POST /api/coupons/validate`
Check a code without applying it. Body: `{ "code": "QUICK10", "subtotal": 1500 }`.

**200** `{ "ok": true, "code": "QUICK10", "message": "QUICK10 applied" }`
**200** `{ "ok": false, "message": "QUICK10 needs ₹999 or more in your bag" }`

This endpoint always returns `200`. Check `ok`.

---

## 3. Wishlist

### `GET /api/wishlist`
**200** `{ "ids": [2, 7], "items": [ ...Product ] }`

### `POST /api/wishlist`
Body: `{ "productId": 2 }`. Adding twice is safe.
**200** `{ "ids": [2] }`

### `DELETE /api/wishlist`
Body: `{ "productId": 2 }`
**200** `{ "ids": [] }`

---

## 4. Orders

### `POST /api/orders`
Place an order from the current cart. The cart and coupon are cleared on success.

Body:
```json
{ "address": { "name": "Harish", "phone": "9876543210", "line1": "House 4, Sector 62", "pin": "201309", "city": "Noida" },
  "payment": "upi" }
```
`payment` is one of `upi`, `card`, `netbanking`, `cod`. It defaults to `upi`.

**201** Order
**422** `{ "error": "Name, phone, address and a 6-digit pincode are required" }`
**400** `{ "error": "Cart is empty" }`

### `GET /api/orders`
**200** `[ ...Order ]`, newest first. `[]` if none.

### `GET /api/orders/:id`
**200** Order
**404** `{ "error": "Order not found" }`

### `GET /api/track?orderId=QB-10482`
**200**
```json
{ "orderId": "QB-10482",
  "stages": [ { "label": "Order placed", "done": true }, { "label": "Packed", "done": true }, { "label": "Shipped", "done": false },
              { "label": "Out for delivery", "done": false }, { "label": "Delivered", "done": false } ],
  "eta": "2026-10-16T04:59:01.305Z" }
```
**400** `{ "error": "orderId required" }`

---

## 5. Auth

### `POST /api/auth/otp`
Body: `{ "phone": "9876543210" }`
**200** `{ "sent": true, "demoHint": "Any 4 digits will verify in this demo" }`
**422** `{ "error": "Enter a 10-digit mobile number" }`

### `POST /api/auth/verify`
Body: `{ "phone": "9876543210", "code": "1234", "name": "Harish" }`. `name` is optional and used for sign-up.
**200** `{ "user": { "phone": "9876543210", "name": "Harish" } }`
**401** `{ "error": "Invalid code" }`

### `POST /api/auth/logout`
**200** `{ "ok": true }`

### `GET /api/me`
**200** `{ "user": { "phone": "9876543210", "name": "Harish" } }`
**200** `{ "user": null }` when logged out. This is not an error.

---

## 6. Other

### `GET /api/offers`
**200** `[ { "code": "QUICK10", "title": "10% off, up to ₹300", "note": "On orders above ₹999" } ]`

### `GET /api/pincode/:pin`
**200** `{ "serviceable": true, "cod": true, "freeDelivery": true, "eta": "2026-10-16T04:59:01.305Z", "city": "Your city" }`
**200** `{ "serviceable": false, "message": "Enter a valid 6-digit pincode" }`

An invalid pincode is `200` with `serviceable: false`, not a 4xx.

### `POST /api/contact`
Body: `{ "name": "Harish", "email": "h@x.com", "orderId": "QB-10482", "topic": "Order status", "message": "Where is it?" }`
**201** `{ "ticketId": "T-244000" }`
**422** `{ "error": "Email and message required" }`

### `POST /api/newsletter`
Body: `{ "email": "h@x.com" }`
**201** `{ "subscribed": true }`
**422** `{ "error": "Enter a valid email" }`

---

---

## 7. Admin API (`/api/admin/*`)

Every admin route needs the `qb_admin` cookie from `POST /api/admin/login`. Without it: **401** `{ "error": "Admin login required" }`.
Defaults for local use: `admin@quickbaazar.com` / `admin123`. Set `ADMIN_USER`, `ADMIN_PASSWORD` and `ADMIN_SECRET` in `.env.local` before going live.

| Method | Path | Success | Failure |
|---|---|---|---|
| POST | `/admin/login` `{email,password}` | 200 `{ok:true}` + cookie | 422 `Email and password are required` · 401 `Wrong email or password` |
| POST | `/admin/logout` | 200 `{ok:true}` | |
| GET | `/admin/stats` | 200 dashboard numbers | 401 |
| POST | `/admin/purge` | 200 `{ok:true}` (refreshes cached storefront pages) | 401 |
| GET / PUT | `/admin/settings` | 200 settings | 422 `{error, fields:{freeShipAbove:"Enter a number, 0 or more"}}` · 400 `Invalid JSON body` |
| POST | `/admin/upload` multipart `file` | 201 `{url:"/uploads/123.png"}` | 400 `Choose an image file to upload` · 415 `Only JPG, PNG, WebP, GIF or AVIF images are allowed` · 413 `Image is larger than 5 MB` |

### Generic CRUD: `/api/admin/:resource`

`resource` is one of `products`, `banners`, `blogs`, `coupons`, `orders`, `customers`, `enquiries`, `subscribers`, `logs`.

| Method | Path | Success | Failure |
|---|---|---|---|
| GET | `/admin/:resource?q=&page=&limit=&status=` | 200 `{total,page,limit,items[]}` | 404 `Unknown resource` |
| POST | `/admin/:resource` | 201 the new item | 422 `{error:"Please fix the highlighted fields", fields:{name:"Product name is required"}}` · 400 `Invalid JSON body` · 405 `Orders can’t be created here` |
| GET | `/admin/:resource/:id` | 200 item | 404 `Product not found` |
| PUT / PATCH | `/admin/:resource/:id` | 200 updated item | 422 field errors · 404 · 405 `Logs can’t be edited` |
| DELETE | `/admin/:resource/:id` | 200 `{ok:true}` | 404 · 405 `Orders can’t be deleted` |

Validation examples returned in `fields`: selling price above MRP, duplicate coupon code, percent coupon outside 1–100, duplicate blog slug, banner link not starting with `/` or `https://`, order status not in `Placed, Packed, Shipped, Out for delivery, Delivered, Cancelled, Returned`.

Fields for each resource are declared in `lib/resources.ts`.

### New public endpoints that read admin data
`GET /api/banners?placement=hero|promo` · `GET /api/blogs` · `GET /api/blogs/:slug` (404 `Post not found`) · `GET /api/settings`

### Abandoned checkouts, bulk actions, import / export

| Method | Path | Success | Failure |
|---|---|---|---|
| POST | `/api/checkout/capture` `{name?,phone?,email?}` (shopper) | 200 `{saved:true}` | 422 `Enter a 10-digit phone number or a valid email` · 400 `Your bag is empty` |
| GET | `/recover/:token` (shopper link) | 307 to `/checkout` with the cart restored | 307 to `/bag` when the link is unknown |
| POST | `/api/admin/:resource/bulk` `{action:'delete'\|'set'\|'priceAdjust', ids:[…], field?, value?, percent?}` | 200 `{affected, failed, errors[]}` | 400 `Select at least one item` · 400 `You can change at most 500 items at once` · 400 `That field can’t be changed in bulk` · 422 `Enter a percentage between -90 and 500 (not 0)` · 405 `<Section> doesn’t support bulk actions` |
| GET | `/api/admin/:resource/export[?ids=1,2][&template=1]` | 200 CSV download (images as full URLs) | 404 `Unknown resource` |
| POST | `/api/admin/:resource/import?dryRun=1&fetchImages=1` multipart `file` | 200 `{total, created, updated, failed, imagesDownloaded, dryRun, errors:[{row,error}]}` | 400 `Choose a CSV file to import` · 413 `File is larger than 4 MB` · 422 `Missing required columns: image, name, mrp` · 422 `Import up to 2,000 rows at a time` · 405 |

Extra admin resources: `checkouts` (abandoned carts, status `open / reminded / recovered / converted`), `reviews` (`pending / approved`), `wishlists` (read-only product demand).
Orders also accept `courier`, `trackingId` and `note`; `GET /api/track` returns `courier` and `trackingId`.
Settings also hold `gtmId`, `ga4Id`, `metaPixelId`, `abandonAfterMin`, `lowStockAt` and `recoveryMessage`. Invalid IDs return 422 with `fields`, for example `{"gtmId":"Looks like GTM-XXXXXXX"}`.
New reviews posted to `POST /api/products/:id/reviews` start as `pending` until approved in the admin panel.

---

## Status code summary

| Code | Used for |
|---|---|
| 200 | Reads, updates, and validation results |
| 201 | Review, order, contact ticket, newsletter signup created |
| 400 | Missing cart fields, empty cart on checkout, missing `orderId`, bad review |
| 401 | Wrong OTP, wrong admin login, or missing admin cookie |
| 404 | Unknown product or order |
| 405 | Admin action not allowed for that resource |
| 413 / 415 | Upload too large / not an image |
| 422 | Failed validation (coupon, address, phone, email, contact form, admin forms) |
| 500 | Malformed JSON or an unexpected server error |

## Not in this version

These are gaps to close before production:

- **Protected routes:** orders and the profile don't require a logged-in user. Add `401 { "error": "Login required" }` once real auth is in.
- **Order lookup:** `GET /api/orders/:id` and `/api/track` don't check who owns the order. Require the phone number, or the logged-in user.
- **Rate limiting:** no `429` on OTP, login or review endpoints.
- **Stock checks:** `POST /api/cart` and `POST /api/orders` don't check `stock`. Add a `409 { "error": "Only 3 left in size 8" }`.
- **Payments:** no payment-gateway step, no `402 / 502` for a failed charge, and no refund or return endpoints.
- **Cart input:** `POST /api/cart` doesn't check that `productId` exists. A bad id is silently dropped from the priced cart.
- **Bad JSON:** a malformed body should return `400 { "error": "Invalid JSON" }` instead of `500`.
