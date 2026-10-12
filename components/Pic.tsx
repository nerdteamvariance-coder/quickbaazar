'use client';
import { useState } from 'react';
import { imgUrl } from '@/lib/data';

/** Product / editorial image with graceful fallback to the gradient behind it. */
export default function Pic({ k, w = 700, alt = '', style }: { k: string; w?: number; alt?: string; style?: React.CSSProperties }) {
  const [bad, setBad] = useState(false);
  if (bad) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={imgUrl(k, w)} alt={alt} loading="lazy" style={style} onError={() => setBad(true)} />;
}
