import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query
      )}&types=(cities)&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (!data.predictions) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = data.predictions.map(
      (prediction: { description: string }) => prediction.description
    );

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching place suggestions:', error);
    return NextResponse.json({ suggestions: [] });
  }
} 