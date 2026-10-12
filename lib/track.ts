// Ecommerce tracking. Pushes GA4-style events to dataLayer (Google Tag Manager), gtag (plain GA4) and Meta Pixel.
// Which of those exist is decided by the IDs saved in Admin → Settings → Tracking.
declare global { interface Window { dataLayer?: any[]; gtag?: (...a: any[]) => void; fbq?: (...a: any[]) => void; __qbGtm?: boolean } }

export type TItem = { item_id: string; item_name?: string; item_brand?: string; item_category?: string; item_variant?: string; price?: number; quantity?: number };
export const toItem = (p: { id: number; name: string; brand: string; price: number; category?: string }, quantity = 1, size?: string): TItem =>
  ({ item_id: String(p.id), item_name: p.name, item_brand: p.brand, item_category: p.category, item_variant: size, price: p.price, quantity });

const META: Record<string, string> = { view_item: 'ViewContent', add_to_cart: 'AddToCart', add_to_wishlist: 'AddToWishlist', begin_checkout: 'InitiateCheckout', purchase: 'Purchase', search: 'Search' };

export function track(event: string, data: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;
  const payload: Record<string, any> = { currency: 'INR', ...data };
  (window.dataLayer ||= []).push({ ecommerce: null });
  window.dataLayer.push({ event, ecommerce: payload });
  if (window.gtag && !window.__qbGtm) window.gtag('event', event, payload);
  if (window.fbq && META[event]) {
    const items: TItem[] = payload.items || [];
    const fb: Record<string, any> = { currency: 'INR', value: payload.value, content_type: 'product', content_ids: items.map(i => i.item_id), num_items: items.reduce((a, i) => a + (i.quantity || 1), 0) };
    if (event === 'search') window.fbq('track', 'Search', { search_string: payload.search_term });
    else window.fbq('track', META[event], fb);
  }
}
