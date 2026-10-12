// Seed catalogue. Replace the functions in lib/db.ts with real DB / backend calls.
export type Product = {
  id: number; brand: string; name: string; category: string; gender: string;
  mrp: number; price: number; rating: number; ratings: number; tag?: string; image: string;
  stock: number; active?: boolean; description?: string;
};

export const IMG: Record<string, string> = {
  sneaker1: '1542291026-7eec264c27ff', sneaker2: '1549298916-b41d501d3772', sneaker3: '1595950653106-6c9ebd614d3a',
  sneaker4: '1552374196-1ab2a1c593e8', sneaker5: '1460353581641-37baddab0fa2', shoe: '1491553895911-0055eca6402d',
  w1: '1515886657613-9f3515b0c78f', w2: '1483985988355-763728e1935b', w3: '1539109136881-3be0616acf4b',
  w4: '1581044777550-4cfa60707c03', f1: '1445205170230-053b83016050', rack: '1523381210434-271e8be1f52b',
  cloth: '1434389677669-e08b4cac3105', tee: '1503342217505-b0a15ec3261c', knit: '1620799140408-edc6dcb6d633',
  store: '1441986300917-64674bd600d8',
};
export const imgUrl = (key: string, w = 700) =>
  /^(https?:)?\/\//.test(key) || key.startsWith('/') ? key : `https://images.unsplash.com/photo-${IMG[key] || key}?auto=format&fit=crop&w=${w}&q=70`;

export const PRODUCTS: Product[] = [
  { id: 1, brand: 'Puma', name: 'Shuffle Kikcsma Women Sneakers', category: 'footwear', gender: 'women', mrp: 5499, price: 2309, rating: 4.3, ratings: 248, tag: 'Price Crash', image: 'sneaker1', stock: 40 },
  { id: 2, brand: 'Puma', name: 'Unisex Rickie Classic Sneakers', category: 'footwear', gender: 'men', mrp: 5999, price: 2279, rating: 4.5, ratings: 1203, tag: 'Bestseller', image: 'sneaker2', stock: 9 },
  { id: 3, brand: 'Bacca Bucci', name: 'Mesh Running Sports Shoes', category: 'footwear', gender: 'men', mrp: 4999, price: 1805, rating: 4.0, ratings: 248, tag: 'Rising Star', image: 'sneaker3', stock: 60 },
  { id: 4, brand: 'Zoom Shoes', name: 'Men Round Toe Leather Boots', category: 'footwear', gender: 'men', mrp: 3499, price: 2350, rating: 4.1, ratings: 87, image: 'shoe', stock: 6 },
  { id: 5, brand: 'Roadster', name: 'Pure Cotton Boxy Fit T-shirt', category: 'men', gender: 'men', mrp: 1499, price: 449, rating: 4.2, ratings: 5402, tag: 'Under 499', image: 'tee', stock: 300 },
  { id: 6, brand: 'HRX', name: 'Ribbed Merino Crew Sweater', category: 'men', gender: 'men', mrp: 3299, price: 1319, rating: 4.4, ratings: 610, image: 'knit', stock: 80 },
  { id: 7, brand: 'Libas', name: 'Printed Straight Kurta Set', category: 'women', gender: 'women', mrp: 3999, price: 1199, rating: 4.1, ratings: 2301, tag: 'Festive', image: 'w1', stock: 120 },
  { id: 8, brand: 'Anouk', name: 'Floral Fit & Flare Midi Dress', category: 'women', gender: 'women', mrp: 4599, price: 1379, rating: 4.3, ratings: 932, image: 'w2', stock: 55 },
  { id: 9, brand: 'Mast & Harbour', name: 'Oversized Co-ord Set', category: 'women', gender: 'women', mrp: 2999, price: 1049, rating: 4.0, ratings: 421, tag: 'New', image: 'w3', stock: 70 },
  { id: 10, brand: 'Tokyo Talkies', name: 'Tailored Blazer Dress', category: 'women', gender: 'women', mrp: 3799, price: 1519, rating: 4.2, ratings: 178, image: 'w4', stock: 35 },
  { id: 11, brand: 'QuickBaazar Studio', name: 'Linen Shirt Dress, Sand', category: 'women', gender: 'women', mrp: 2799, price: 979, rating: 4.6, ratings: 64, tag: 'Own label', image: 'f1', stock: 25 },
  { id: 12, brand: 'Campus', name: 'Cloud Foam Lace-up Trainers', category: 'footwear', gender: 'men', mrp: 2999, price: 1199, rating: 3.9, ratings: 3320, image: 'sneaker4', stock: 200 },
  { id: 13, brand: 'Skechers', name: 'Arch Fit Walking Sneakers', category: 'footwear', gender: 'women', mrp: 6499, price: 3899, rating: 4.6, ratings: 770, tag: 'Top rated', image: 'sneaker5', stock: 18 },
  { id: 14, brand: 'Allen Solly', name: 'Slim Fit Casual Shirt', category: 'men', gender: 'men', mrp: 2299, price: 919, rating: 4.2, ratings: 1500, image: 'cloth', stock: 90 },
  { id: 15, brand: 'Max Kids', name: 'Boys Graphic Co-ord Set', category: 'kids', gender: 'kids', mrp: 1599, price: 559, rating: 4.4, ratings: 310, image: 'rack', stock: 75 },
  { id: 16, brand: 'H&M Kids', name: 'Girls Tiered Party Dress', category: 'kids', gender: 'kids', mrp: 2199, price: 899, rating: 4.5, ratings: 205, image: 'w2', stock: 44 },
];

export const MENU: Record<string, { key: string; cols: [string, string[]][]; image: string; title: string }> = {
  Men: { key: 'men', image: 'tee', title: 'Basics, sorted', cols: [['Topwear', ['T-shirts', 'Shirts', 'Sweaters', 'Jackets']], ['Bottomwear', ['Jeans', 'Trousers', 'Shorts', 'Track pants']], ['Footwear', ['Sneakers', 'Formal shoes', 'Sandals', 'Boots']], ['Accessories', ['Watches', 'Belts', 'Wallets', 'Sunglasses']]] },
  Women: { key: 'women', image: 'w3', title: 'Festive edit', cols: [['Ethnic', ['Kurta sets', 'Sarees', 'Lehengas', 'Dupattas']], ['Western', ['Dresses', 'Tops', 'Co-ords', 'Jeans']], ['Footwear', ['Sneakers', 'Heels', 'Flats', 'Boots']], ['Accessories', ['Bags', 'Jewellery', 'Watches', 'Sunglasses']]] },
  Kids: { key: 'kids', image: 'rack', title: 'Mini wardrobe', cols: [['Boys', ['T-shirts', 'Sets', 'Shorts', 'Ethnic']], ['Girls', ['Dresses', 'Tops', 'Sets', 'Ethnic']], ['Infants', ['Rompers', 'Sets', 'Sleepwear', 'Essentials']], ['Footwear', ['Sneakers', 'Sandals', 'School shoes', 'Slippers']]] },
  Footwear: { key: 'footwear', image: 'sneaker1', title: 'Sneaker drop', cols: [['Casual', ['Sneakers', 'Loafers', 'Slip-ons', 'Boots']], ['Sports', ['Running', 'Training', 'Football', 'Walking']], ['Formal', ['Oxfords', 'Derbies', 'Monk straps', 'Loafers']], ['Brands', ['Puma', 'Skechers', 'Campus', 'Bacca Bucci']]] },
  Beauty: { key: 'beauty', image: 'w4', title: 'Glow up', cols: [['Makeup', ['Lipstick', 'Foundation', 'Kajal', 'Palettes']], ['Skincare', ['Cleansers', 'Moisturisers', 'Serums', 'Sunscreen']], ['Hair', ['Shampoo', 'Conditioner', 'Oils', 'Styling']], ['Fragrance', ['Perfumes', 'Deodorants', 'Body mist', 'Gift sets']]] },
};

export const HERO = [
  { image: 'sneaker1', chip: 'Big Fashion Festival · live now', h: 'Kick *off* the season', t: 'Sneakers up to 60% off from Puma, Skechers & Campus.', href: '/shop/footwear' },
  { image: 'w3', chip: 'Women’s edit', h: 'Wear it *loud*', t: 'Co-ords, kurta sets and dresses from ₹499.', href: '/shop/women' },
  { image: 'tee', chip: 'Men · under ₹999', h: 'Basics, *sorted*', t: 'Everyday tees, shirts and knits that actually fit.', href: '/shop/men' },
];

export const STORIES = [
  { name: 'New in', image: 'w3', slides: [{ image: 'w3', title: 'Festive fits<br>just landed', href: '/shop/women', cta: 'Shop women' }, { image: 'w1', title: 'Kurta sets<br>from ₹499', href: '/shop/women', cta: 'Shop kurtas' }] },
  { name: 'Sneakers', image: 'sneaker1', slides: [{ image: 'sneaker1', title: 'The sneaker<br>drop', href: '/shop/footwear', cta: 'Shop sneakers' }, { image: 'sneaker3', title: 'Up to 64% off<br>this week', href: '/shop/footwear', cta: 'See deals' }] },
  { name: 'Men', image: 'tee', slides: [{ image: 'tee', title: 'Basics,<br>sorted', href: '/shop/men', cta: 'Shop men' }] },
  { name: 'Under ₹999', image: 'cloth', slides: [{ image: 'cloth', title: 'Everything<br>under ₹999', href: '/shop/all?maxPrice=999', cta: 'Shop the edit' }] },
  { name: 'Kids', image: 'rack', slides: [{ image: 'rack', title: 'Mini<br>wardrobe', href: '/shop/kids', cta: 'Shop kids' }] },
];

export const ORDER_STATUSES = ['Placed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled', 'Returned'];

export const COUPONS = [
  { code: 'QUICK10', title: '10% off, up to ₹300', note: 'On orders above ₹999' },
  { code: 'FIRST100', title: '₹100 off your first order', note: 'No minimum, new customers' },
  { code: 'HDFC10', title: '10% instant discount', note: 'HDFC credit cards & EMI, up to ₹1,500' },
  { code: 'FREESHIP', title: 'Free delivery', note: 'On any order above ₹499' },
];

export const FAQ = [
  ['How do I return an item?', 'Open My orders, pick the item and tap Return. Choose a pickup slot; we collect it from your door within 48 hours.'],
  ['When will my refund arrive?', 'Refunds go to your original payment method within 48 hours of pickup. COD refunds go to your bank account or QuickCash.'],
  ['Can I change my delivery address?', 'Until the order is packed, yes — from My orders. After that, contact us and we’ll try to redirect it.'],
  ['Is cash on delivery available?', 'Yes, on orders up to ₹20,000 at most pin codes. You’ll see the option at checkout.'],
  ['How do coupons work?', 'Pick a coupon in the bag or at checkout. Only one coupon applies per order, and bank offers stack on top.'],
];
