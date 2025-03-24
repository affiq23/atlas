import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Use OpenStreetMap Nominatim API for place search
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&addressdetails=1&limit=10`,
      {
        headers: {
          'User-Agent': 'Atlas Travel Planning App' // Required by Nominatim's usage policy
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch from Nominatim API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Nominatim raw response:', JSON.stringify(data, null, 2));

    // Format the results
    const formattedResults = data.map((place: any) => {
      // Extract city, state, and country from address details
      const address = place.address;
      const city = address.city || address.town || address.village || address.municipality || place.name;
      const state = address.state;
      const country = address.country;

      // Create a clean description
      const description = [city, state, country].filter(Boolean).join(', ');

      return {
        id: place.place_id,
        name: city,
        description: description,
        location: {
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon)
        },
        type: place.type,
        importance: place.importance
      };
    }).filter((place: any) => place.name && place.description.includes(',')); // Ensure we have at least city and country

    return NextResponse.json({ results: formattedResults });
  } catch (error) {
    console.error('Error searching places:', error);
    return NextResponse.json(
      { error: 'Failed to search places' },
      { status: 500 }
    );
  }
} 