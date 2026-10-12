import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: { default: 'QuickBaazar — Fashion, Footwear & Beauty', template: '%s · QuickBaazar' },
  description: 'Shop fashion, footwear and beauty from 2,000+ brands. Free delivery over ₹799, 14-day returns, cash on delivery.',
};
export const viewport: Viewport = { themeColor: '#2A1740', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Pick a look with NEXT_PUBLIC_THEME = nuvo | colorblock | editorial | luxury | trust | stickybuy
  const theme = process.env.NEXT_PUBLIC_THEME || 'nuvo';
  return (
    <html lang="en" data-t={theme}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Manrope:wght@500;700;800&family=Cormorant+Garamond:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
