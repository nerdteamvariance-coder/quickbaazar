import { NextResponse } from 'next/server';
import { sendOtp } from '@/lib/db';
// POST { phone } -> sends OTP (plug in an SMS provider such as MSG91 or Twilio)
export async function POST(req: Request) { const { phone } = await req.json(); if (!/^\d{10}$/.test(phone || '')) return NextResponse.json({ error: 'Enter a 10-digit mobile number' }, { status: 422 }); return NextResponse.json(sendOtp(phone)); }
