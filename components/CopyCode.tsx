'use client';
import { useStore } from './Store';

export default function CopyCode({ code }: { code: string }) {
  const { toast } = useStore();
  return <button onClick={() => { navigator.clipboard?.writeText(code); toast('Copied ' + code); }}>Copy</button>;
}
