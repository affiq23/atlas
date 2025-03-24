import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not found' }, { status: 500 });
  }

  // Test the API key with a simple geocoding request
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=tokyo&key=${apiKey}`
  );

  const data = await response.json();

  return NextResponse.json({
    keyLength: apiKey.length,
    keyStart: apiKey.substring(0, 8),
    status: data.status,
    error: data.error_message,
    raw: data
  });
} 