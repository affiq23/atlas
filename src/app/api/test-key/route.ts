import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    keyLength: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.length
  });
} 