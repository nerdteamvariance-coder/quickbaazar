// Declarative description of every admin-managed collection. Drives the admin tables, forms, CSV import/export and the generic CRUD API.
import { ORDER_STATUSES } from './data';

export type Field = {
  name: string; label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'bool' | 'image' | 'date';
  options?: string[]; required?: boolean; list?: boolean; readonly?: boolean; help?: string; placeholder?: string; wide?: boolean; computed?: boolean;
};
export type Resource = {
  key: string; label: string; singular: string; collection: string; icon: string; group: string;
  fields: Field[]; canCreate: boolean; canEdit: boolean; canDelete: boolean; search: string[]; defaults: Record<string, any>; sortBy?: string;
  unique?: string[];           // columns that identify an existing row during CSV import (besides id)
  io?: boolean;                // show Import / Export buttons
  tabs?: { value: string; label: string }[];
  bulk?: boolean;              // row checkboxes + bulk actions
};

const CATS = ['men', 'women', 'kids', 'footwear', 'beauty'];
export const RESOURCES: Resource[] = [
  { key: 'products', label: 'Products', singular: 'Product', collection: 'products', icon: '▦', group: 'Catalog', canCreate: true, canEdit: true, canDelete: true, io: true, bulk: true, unique: ['brand', 'name'],
    search: ['brand', 'name', 'category'], sortBy: 'id', defaults: { active: true, stock: 50, rating: 4.2, ratings: 0, gender: 'men', category: 'men' },
    fields: [
      { name: 'image', label: 'Image', type: 'image', list: true, required: true, help: 'Upload a file or paste an image URL.', wide: true },
      { name: 'brand', label: 'Brand', type: 'text', required: true, list: true },
      { name: 'name', label: 'Product name', type: 'text', required: true, list: true },
      { name: 'category', label: 'Category', type: 'select', options: CATS, required: true, list: true },
      { name: 'gender', label: 'Gender', type: 'select', options: ['men', 'women', 'kids'] },
      { name: 'mrp', label: 'MRP (₹)', type: 'number', required: true },
      { name: 'price', label: 'Selling price (₹)', type: 'number', required: true, list: true },
      { name: 'stock', label: 'Stock', type: 'number', list: true },
      { name: 'tag', label: 'Badge', type: 'text', placeholder: 'Bestseller, New, Price Crash' },
      { name: 'rating', label: 'Rating (1–5)', type: 'number' },
      { name: 'ratings', label: 'Rating count', type: 'number' },
      { name: 'description', label: 'Description', type: 'textarea', wide: true },
      { name: 'active', label: 'Visible in store', type: 'bool', list: true },
    ] },
  { key: 'reviews', label: 'Reviews', singular: 'Review', collection: 'reviews', icon: '★', group: 'Catalog', canCreate: false, canEdit: true, canDelete: true, bulk: true, io: true, search: ['name', 'text', 'productName'], defaults: {},
    tabs: [{ value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }],
    fields: [
      { name: 'productName', label: 'Product', type: 'text', readonly: true, computed: true, list: true },
      { name: 'name', label: 'Reviewer', type: 'text', readonly: true, list: true },
      { name: 'rating', label: 'Rating', type: 'number', readonly: true, list: true },
      { name: 'text', label: 'Review', type: 'textarea', readonly: true, wide: true, list: true },
      { name: 'date', label: 'Posted', type: 'text', readonly: true },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'approved'], list: true, help: 'Only approved reviews show on the product page.' },
    ] },
  { key: 'banners', label: 'Banners', singular: 'Banner', collection: 'banners', icon: '▣', group: 'Content', canCreate: true, canEdit: true, canDelete: true, bulk: true, io: true, search: ['title', 'chip'], sortBy: 'sort',
    defaults: { active: true, placement: 'hero', sort: 10, href: '/shop/all' },
    fields: [
      { name: 'image', label: 'Banner image', type: 'image', list: true, required: true, wide: true },
      { name: 'title', label: 'Headline', type: 'text', required: true, list: true, help: 'Wrap a word in *stars* to highlight it, e.g. Wear it *loud*.' },
      { name: 'subtitle', label: 'Sub-text', type: 'text' },
      { name: 'chip', label: 'Small label', type: 'text', placeholder: 'Big Fashion Festival · live now' },
      { name: 'href', label: 'Button link', type: 'text', placeholder: '/shop/women' },
      { name: 'placement', label: 'Placement', type: 'select', options: ['hero', 'promo'], list: true },
      { name: 'sort', label: 'Order', type: 'number', list: true },
      { name: 'active', label: 'Live', type: 'bool', list: true },
    ] },
  { key: 'blogs', label: 'Blog posts', singular: 'Post', collection: 'blogs', icon: '✎', group: 'Content', canCreate: true, canEdit: true, canDelete: true, bulk: true, io: true, unique: ['slug'], search: ['title', 'author', 'tags'], sortBy: 'date',
    defaults: { published: true, author: 'QuickBaazar Editorial' },
    fields: [
      { name: 'image', label: 'Cover image', type: 'image', list: true, wide: true },
      { name: 'title', label: 'Title', type: 'text', required: true, list: true },
      { name: 'slug', label: 'URL slug', type: 'text', help: 'Leave empty to generate from the title.' },
      { name: 'author', label: 'Author', type: 'text', list: true },
      { name: 'tags', label: 'Tags', type: 'text', placeholder: 'guide, footwear' },
      { name: 'excerpt', label: 'Short summary', type: 'textarea', wide: true },
      { name: 'content', label: 'Article', type: 'textarea', required: true, wide: true, help: 'Separate paragraphs with a blank line.' },
      { name: 'date', label: 'Publish date', type: 'date', list: true },
      { name: 'published', label: 'Published', type: 'bool', list: true },
    ] },
  { key: 'coupons', label: 'Coupons & offers', singular: 'Coupon', collection: 'coupons', icon: '%', group: 'Promotions', canCreate: true, canEdit: true, canDelete: true, bulk: true, io: true, unique: ['code'], search: ['code', 'title'],
    defaults: { active: true, type: 'percent', value: 10, max: 0, minOrder: 0 },
    fields: [
      { name: 'code', label: 'Code', type: 'text', required: true, list: true, placeholder: 'SAVE20' },
      { name: 'title', label: 'Offer title', type: 'text', required: true, list: true },
      { name: 'note', label: 'Fine print', type: 'text', wide: true },
      { name: 'type', label: 'Discount type', type: 'select', options: ['percent', 'flat', 'freeship'], list: true },
      { name: 'value', label: 'Value (% or ₹)', type: 'number', list: true },
      { name: 'max', label: 'Max discount (₹, 0 = none)', type: 'number' },
      { name: 'minOrder', label: 'Minimum order (₹)', type: 'number', list: true },
      { name: 'expiresAt', label: 'Expires on', type: 'date' },
      { name: 'active', label: 'Active', type: 'bool', list: true },
    ] },
  { key: 'checkouts', label: 'Abandoned checkouts', singular: 'Checkout', collection: 'checkouts', icon: '⚑', group: 'Sales', canCreate: false, canEdit: true, canDelete: true, bulk: true, io: true,
    search: ['name', 'phone', 'email'], sortBy: 'updatedAt', defaults: {},
    tabs: [{ value: 'abandoned', label: 'Abandoned' }, { value: 'open', label: 'Still shopping' }, { value: 'reminded', label: 'Reminded' }, { value: 'recovered', label: 'Recovered' }, { value: 'converted', label: 'Converted' }],
    fields: [
      { name: 'updatedAt', label: 'Last activity', type: 'date', readonly: true, list: true },
      { name: 'name', label: 'Name', type: 'text', readonly: true, list: true },
      { name: 'phone', label: 'Phone', type: 'text', readonly: true, list: true },
      { name: 'email', label: 'Email', type: 'text', readonly: true, list: true },
      { name: 'itemsCount', label: 'Items', type: 'number', readonly: true, computed: true, list: true },
      { name: 'total', label: 'Cart value (₹)', type: 'number', readonly: true, list: true },
      { name: 'stage', label: 'Reached', type: 'text', readonly: true, list: true },
      { name: 'status', label: 'Status', type: 'select', options: ['open', 'reminded', 'recovered', 'converted'], list: true },
    ] },
  { key: 'wishlists', label: 'Wishlist insights', singular: 'Wishlist', collection: 'wishlists', icon: '♡', group: 'Sales', canCreate: false, canEdit: false, canDelete: false, io: true, search: ['brand', 'name'], defaults: {},
    fields: [
      { name: 'image', label: 'Image', type: 'image', readonly: true, computed: true, list: true },
      { name: 'brand', label: 'Brand', type: 'text', readonly: true, computed: true, list: true },
      { name: 'name', label: 'Product', type: 'text', readonly: true, computed: true, list: true },
      { name: 'users', label: 'Shoppers who saved it', type: 'number', readonly: true, computed: true, list: true },
      { name: 'price', label: 'Price (₹)', type: 'number', readonly: true, computed: true, list: true },
      { name: 'stock', label: 'Stock', type: 'number', readonly: true, computed: true, list: true },
    ] },
  { key: 'orders', label: 'Orders', singular: 'Order', collection: 'orders', icon: '▤', group: 'Sales', canCreate: false, canEdit: true, canDelete: false, bulk: true, io: true, search: ['id', 'phone', 'status', 'customer'], sortBy: 'date', defaults: {},
    tabs: ORDER_STATUSES.map(s => ({ value: s, label: s })),
    fields: [
      { name: 'id', label: 'Order ID', type: 'text', readonly: true, list: true },
      { name: 'date', label: 'Placed on', type: 'date', readonly: true, list: true },
      { name: 'customer', label: 'Customer', type: 'text', readonly: true, computed: true, list: true },
      { name: 'phone', label: 'Phone', type: 'text', readonly: true, list: true },
      { name: 'total', label: 'Total (₹)', type: 'number', readonly: true, list: true },
      { name: 'payment', label: 'Payment', type: 'text', readonly: true, list: true },
      { name: 'status', label: 'Status', type: 'select', options: ORDER_STATUSES, list: true, required: true },
      { name: 'courier', label: 'Courier', type: 'text', placeholder: 'Delhivery, Blue Dart…' },
      { name: 'trackingId', label: 'Tracking number', type: 'text' },
      { name: 'note', label: 'Internal note', type: 'textarea', wide: true, help: 'Only visible to your team.' },
    ] },
  { key: 'customers', label: 'Customers', singular: 'Customer', collection: 'customers', icon: '☺', group: 'Sales', canCreate: false, canEdit: true, canDelete: true, bulk: true, io: true, search: ['name', 'phone'], defaults: {},
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, list: true },
      { name: 'phone', label: 'Phone', type: 'text', readonly: true, list: true },
      { name: 'orders', label: 'Orders', type: 'number', readonly: true, computed: true, list: true },
      { name: 'spent', label: 'Total spent (₹)', type: 'number', readonly: true, computed: true, list: true },
      { name: 'joined', label: 'Joined', type: 'date', readonly: true, list: true },
    ] },
  { key: 'enquiries', label: 'Enquiries', singular: 'Enquiry', collection: 'enquiries', icon: '✉', group: 'Sales', canCreate: false, canEdit: true, canDelete: true, bulk: true, io: true, search: ['name', 'email', 'topic', 'message'], defaults: {},
    tabs: [{ value: 'new', label: 'New' }, { value: 'resolved', label: 'Resolved' }],
    fields: [
      { name: 'name', label: 'Name', type: 'text', readonly: true, list: true },
      { name: 'email', label: 'Email', type: 'text', readonly: true, list: true },
      { name: 'topic', label: 'Topic', type: 'text', readonly: true, list: true },
      { name: 'orderId', label: 'Order ID', type: 'text', readonly: true },
      { name: 'message', label: 'Message', type: 'textarea', readonly: true, wide: true },
      { name: 'date', label: 'Received', type: 'date', readonly: true, list: true },
      { name: 'status', label: 'Status', type: 'select', options: ['new', 'resolved'], list: true },
    ] },
  { key: 'subscribers', label: 'Newsletter', singular: 'Subscriber', collection: 'subscribers', icon: '✦', group: 'Sales', canCreate: true, canEdit: false, canDelete: true, bulk: true, io: true, unique: ['email'], search: ['email'], defaults: {},
    fields: [
      { name: 'email', label: 'Email', type: 'text', required: true, list: true },
      { name: 'date', label: 'Subscribed', type: 'date', readonly: true, list: true },
    ] },
  { key: 'logs', label: 'System logs', singular: 'Log', collection: 'logs', icon: '☰', group: 'System', canCreate: false, canEdit: false, canDelete: false, io: true, search: ['user', 'action', 'resource'], defaults: {},
    fields: [
      { name: 'date', label: 'When', type: 'date', list: true },
      { name: 'user', label: 'Admin', type: 'text', list: true },
      { name: 'action', label: 'Action', type: 'text', list: true },
      { name: 'resource', label: 'Section', type: 'text', list: true },
      { name: 'itemId', label: 'Item', type: 'text', list: true },
    ] },
];
export const getResource = (k: string) => RESOURCES.find(r => r.key === k);
