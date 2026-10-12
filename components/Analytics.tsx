'use client';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { track } from '@/lib/track';

const GTM = /^GTM-[A-Z0-9]{4,12}$/, GA4 = /^G-[A-Z0-9]{4,14}$/, PIXEL = /^\d{8,20}$/;

/** Loads Google Tag Manager / GA4 / Meta Pixel when their IDs are set in Admin → Settings, and reports page views. */
export default function Analytics({ gtm, ga4, pixel }: { gtm?: string; ga4?: string; pixel?: string }) {
  const path = usePathname(); const first = useRef(true);
  const useGtm = !!gtm && GTM.test(gtm), useGa4 = !useGtm && !!ga4 && GA4.test(ga4), usePixel = !!pixel && PIXEL.test(pixel);
  useEffect(() => { if (useGtm) window.__qbGtm = true; }, [useGtm]);
  useEffect(() => {
    const title = document.title;
    if (useGtm) (window.dataLayer ||= []).push({ event: 'page_view', page_path: path, page_title: title });
    else if (useGa4 && window.gtag) window.gtag('event', 'page_view', { page_path: path, page_title: title });
    if (usePixel && window.fbq && !first.current) window.fbq('track', 'PageView');
    first.current = false;
  }, [path, useGtm, useGa4, usePixel]);
  return (
    <>
      {useGtm && <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}</Script>}
      {useGa4 && <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="afterInteractive" />
        <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga4}',{send_page_view:false});`}</Script></>}
      {usePixel && <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}</Script>}
    </>
  );
}
