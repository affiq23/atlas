'use client'

import { useState, useEffect } from 'react'
import { Nav } from '@/components/ui/nav'
import { motion } from 'framer-motion'
import { BuildingOfficeIcon, GlobeAltIcon, SunIcon, MapIcon } from '@heroicons/react/24/outline'
import { CitySearch } from '@/components/CitySearch'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { Map } from '@/components/Map'

type FeaturedDestination = {
  id: string
  title: string
  description: string
  coordinates: [number, number]
  imageUrl: string
  region: string
}

const categories = [
  {
    id: 1,
    name: 'Urban Escapes',
    icon: BuildingOfficeIcon,
    description: 'Discover iconic cities and cultural hubs'
  },
  {
    id: 2,
    name: 'Cultural Heritage',
    icon: GlobeAltIcon,
    description: 'Explore ancient temples and historic sites'
  },
  {
    id: 3,
    name: 'Coastal Paradise',
    icon: SunIcon,
    description: 'Visit beautiful beaches and island getaways'
  },
  {
    id: 4,
    name: 'Mountain & Nature',
    icon: MapIcon,
    description: 'Experience stunning landscapes and wilderness'
  }
]

// Function to get random items from array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

const continents = [
  { id: 'all', name: 'All Destinations' },
  { id: 'namerica', name: 'North America' },
  { id: 'europe', name: 'Europe' },
  { id: 'samerica', name: 'South America' },
  { id: 'asia', name: 'Asia' },
  { id: 'seasia', name: 'Southeast Asia' },
  { id: 'oceania', name: 'Oceania' },
  { id: 'africa', name: 'Africa' }
]

const allDestinations: FeaturedDestination[] = [
  // North America
  {
    id: 'newyork',
    title: 'New York City, USA',
    description: 'The city that never sleeps',
    coordinates: [40.7128, -74.0060],
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9',
    region: 'namerica'
  },
  {
    id: 'sanfrancisco',
    title: 'San Francisco, USA',
    description: 'Tech hub with iconic bridges',
    coordinates: [37.7749, -122.4194],
    imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
    region: 'namerica'
  },
  {
    id: 'chicago',
    title: 'Chicago, USA',
    description: 'Architectural marvels and lakeside beauty',
    coordinates: [41.8781, -87.6298],
    imageUrl: 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f',
    region: 'namerica'
  },
  {
    id: 'losangeles',
    title: 'Los Angeles, USA',
    description: 'Entertainment capital and coastal charm',
    coordinates: [34.0522, -118.2437],
    imageUrl: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da',
    region: 'namerica'
  },
  {
    id: 'miami',
    title: 'Miami, USA',
    description: 'Tropical vibes and cultural fusion',
    coordinates: [25.7617, -80.1918],
    imageUrl: 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3',
    region: 'namerica'
  },
  {
    id: 'lasvegas',
    title: 'Las Vegas, USA',
    description: 'Entertainment and desert adventures',
    coordinates: [36.1699, -115.1398],
    imageUrl: 'https://images.unsplash.com/photo-1581351721010-8cf859cb14a4',
    region: 'namerica'
  },
  {
    id: 'seattle',
    title: 'Seattle, USA',
    description: 'Coffee culture and tech innovation',
    coordinates: [47.6062, -122.3321],
    imageUrl: 'https://images.unsplash.com/photo-1502175353174-a7a70e73b362',
    region: 'namerica'
  },
  {
    id: 'boston',
    title: 'Boston, USA',
    description: 'Historic charm and academic excellence',
    coordinates: [42.3601, -71.0589],
    imageUrl: 'https://images.unsplash.com/photo-1501979376754-2ff867a4f659',
    region: 'namerica'
  },
  {
    id: 'austin',
    title: 'Austin, USA',
    description: 'Live music and tech innovation',
    coordinates: [30.2672, -97.7431],
    imageUrl: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934',
    region: 'namerica'
  },
  {
    id: 'denver',
    title: 'Denver, USA',
    description: 'Mountain views and outdoor adventures',
    coordinates: [39.7392, -104.9903],
    imageUrl: 'https://images.unsplash.com/photo-1546156929-a4c0ac411f47',
    region: 'namerica'
  },
  {
    id: 'portland',
    title: 'Portland, USA',
    description: 'Quirky culture and natural beauty',
    coordinates: [45.5155, -122.6789],
    imageUrl: 'https://images.unsplash.com/photo-1541457523724-95f54f7740cc',
    region: 'namerica'
  },
  {
    id: 'nashville',
    title: 'Nashville, USA',
    description: 'Country music and southern hospitality',
    coordinates: [36.1627, -86.7816],
    imageUrl: 'https://images.unsplash.com/photo-1545973392-edda0f8366d7',
    region: 'namerica'
  },
  {
    id: 'neworleans',
    title: 'New Orleans, USA',
    description: 'Jazz, culture, and Creole cuisine',
    coordinates: [29.9511, -90.0715],
    imageUrl: 'https://images.unsplash.com/photo-1571893544028-06b07af6dade',
    region: 'namerica'
  },
  {
    id: 'vancouver',
    title: 'Vancouver, Canada',
    description: 'Mountains meet ocean in perfect harmony',
    coordinates: [49.2827, -123.1207],
    imageUrl: 'https://images.unsplash.com/photo-1559511260-66a654ae982a',
    region: 'namerica'
  },
  {
    id: 'toronto',
    title: 'Toronto, Canada',
    description: 'Cultural diversity and urban innovation',
    coordinates: [43.6532, -79.3832],
    imageUrl: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f',
    region: 'namerica'
  },

  // Europe
  {
    id: 'paris',
    title: 'Paris, France',
    description: 'Discover the city of love, art, and gastronomy',
    coordinates: [48.8566, 2.3522],
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    region: 'europe'
  },
  {
    id: 'london',
    title: 'London, UK',
    description: 'Historic landmarks meet modern attractions',
    coordinates: [51.5074, -0.1278],
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
    region: 'europe'
  },
  {
    id: 'rome',
    title: 'Rome, Italy',
    description: 'Ancient history and world-class cuisine',
    coordinates: [41.9028, 12.4964],
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
    region: 'europe'
  },
  {
    id: 'barcelona',
    title: 'Barcelona, Spain',
    description: 'Unique architecture and Mediterranean charm',
    coordinates: [41.3851, 2.1734],
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded',
    region: 'europe'
  },
  {
    id: 'amsterdam',
    title: 'Amsterdam, Netherlands',
    description: 'Historic canals and cycling culture',
    coordinates: [52.3676, 4.9041],
    imageUrl: 'https://images.unsplash.com/photo-1576924542622-772b4a5456e1',
    region: 'europe'
  },
  {
    id: 'berlin',
    title: 'Berlin, Germany',
    description: 'Dynamic art scene and compelling history',
    coordinates: [52.5200, 13.4050],
    imageUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047',
    region: 'europe'
  },
  {
    id: 'prague',
    title: 'Prague, Czech Republic',
    description: 'Fairy-tale architecture and rich heritage',
    coordinates: [50.0755, 14.4378],
    imageUrl: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439',
    region: 'europe'
  },
  {
    id: 'venice',
    title: 'Venice, Italy',
    description: 'Romantic canals and historic architecture',
    coordinates: [45.4408, 12.3155],
    imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0',
    region: 'europe'
  },

  // South America
  {
    id: 'rio',
    title: 'Rio de Janeiro, Brazil',
    description: 'Beaches, culture, and stunning landscapes',
    coordinates: [-22.9068, -43.1729],
    imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325',
    region: 'samerica'
  },
  {
    id: 'buenosaires',
    title: 'Buenos Aires, Argentina',
    description: 'Tango and European-style architecture',
    coordinates: [-34.6037, -58.3816],
    imageUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849',
    region: 'samerica'
  },
  {
    id: 'lima',
    title: 'Lima, Peru',
    description: 'Culinary capital with coastal views',
    coordinates: [-12.0464, -77.0428],
    imageUrl: 'https://images.unsplash.com/photo-1531968455001-5c5272a41129',
    region: 'samerica'
  },
  {
    id: 'santiago',
    title: 'Santiago, Chile',
    description: 'Modern city amid mountain peaks',
    coordinates: [-33.4489, -70.6693],
    imageUrl: 'https://images.unsplash.com/photo-1534308795632-e69d13f3f85e',
    region: 'samerica'
  },

  // Asia
  {
    id: 'tokyo',
    title: 'Tokyo, Japan',
    description: 'Experience the perfect blend of tradition and modernity',
    coordinates: [35.6762, 139.6503],
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
    region: 'asia'
  },
  {
    id: 'kyoto',
    title: 'Kyoto, Japan',
    description: 'Ancient temples, traditional gardens, and timeless beauty',
    coordinates: [35.0116, 135.7681],
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
    region: 'asia'
  },
  {
    id: 'seoul',
    title: 'Seoul, South Korea',
    description: 'K-pop culture meets ancient palaces in this dynamic metropolis',
    coordinates: [37.5665, 126.9780],
    imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241',
    region: 'asia'
  },
  {
    id: 'shanghai',
    title: 'Shanghai, China',
    description: 'Modern China at its most dynamic and cosmopolitan',
    coordinates: [31.2304, 121.4737],
    imageUrl: 'https://images.unsplash.com/photo-1548919973-5cef591cdbc9',
    region: 'asia'
  },
  {
    id: 'beijing',
    title: 'Beijing, China',
    description: 'Ancient wonders meet modern ambitions',
    coordinates: [39.9042, 116.4074],
    imageUrl: 'https://images.unsplash.com/photo-1508411739743-c968b3d85b3a',
    region: 'asia'
  },

  // Southeast Asia
  {
    id: 'bangkok',
    title: 'Bangkok, Thailand',
    description: 'Temples, street food, and vibrant nightlife',
    coordinates: [13.7563, 100.5018],
    imageUrl: 'https://images.unsplash.com/photo-1583491470869-ca0e85bd6b49',
    region: 'seasia'
  },
  {
    id: 'singapore',
    title: 'Singapore',
    description: 'A perfect blend of cultures with futuristic architecture',
    coordinates: [1.3521, 103.8198],
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd',
    region: 'seasia'
  },
  {
    id: 'hongkong',
    title: 'Hong Kong',
    description: 'Towering skyline and rich cultural heritage',
    coordinates: [22.3193, 114.1694],
    imageUrl: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1',
    region: 'seasia'
  },
  {
    id: 'bali',
    title: 'Bali, Indonesia',
    description: 'Immerse yourself in tropical paradise and rich cultural heritage',
    coordinates: [-8.4095, 115.1889],
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
    region: 'seasia'
  },
  {
    id: 'hanoi',
    title: 'Hanoi, Vietnam',
    description: 'Rich history and vibrant street culture',
    coordinates: [21.0285, 105.8542],
    imageUrl: 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07d',
    region: 'seasia'
  },

  // Oceania
  {
    id: 'sydney',
    title: 'Sydney, Australia',
    description: 'Iconic harbor and beautiful beaches',
    coordinates: [-33.8688, 151.2093],
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9',
    region: 'oceania'
  },
  {
    id: 'melbourne',
    title: 'Melbourne, Australia',
    description: 'Culture, coffee, and sports',
    coordinates: [-37.8136, 144.9631],
    imageUrl: 'https://images.unsplash.com/photo-1514395462725-fb4566210144',
    region: 'oceania'
  },
  {
    id: 'auckland',
    title: 'Auckland, New Zealand',
    description: 'City of Sails with natural beauty',
    coordinates: [-36.8509, 174.7645],
    imageUrl: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad',
    region: 'oceania'
  },

  // Africa
  {
    id: 'capetown',
    title: 'Cape Town, South Africa',
    description: 'Where mountains meet oceans',
    coordinates: [-33.9249, 18.4241],
    imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99',
    region: 'africa'
  },
  {
    id: 'cairo',
    title: 'Cairo, Egypt',
    description: 'Ancient pyramids and rich history',
    coordinates: [30.0444, 31.2357],
    imageUrl: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a',
    region: 'africa'
  },
  {
    id: 'marrakech',
    title: 'Marrakech, Morocco',
    description: 'Ancient medinas and vibrant souks',
    coordinates: [31.6295, -7.9811],
    imageUrl: 'https://images.unsplash.com/photo-1597212618440-806262de4f6e',
    region: 'africa'
  }
]

export default function ExplorePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedContinent, setSelectedContinent] = useState('all')
  const [displayedDestinations, setDisplayedDestinations] = useState(allDestinations)
  const [loadingCities, setLoadingCities] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (selectedContinent === 'all') {
      setDisplayedDestinations(allDestinations)
    } else {
      const filtered = allDestinations.filter(dest => dest.region === selectedContinent)
      setDisplayedDestinations(filtered)
    }
  }, [selectedContinent])

  const handleCitySelect = (city: any) => {
    router.push(`/trips/new?destination=${encodeURIComponent(city.description)}`)
  }

  const handleMarkerClick = (destinationId: string) => {
    const destination = displayedDestinations.find(d => d.id === destinationId)
    if (destination) {
      router.push(`/trips/new?destination=${encodeURIComponent(destination.title)}`)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <Nav />
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Sign in to explore destinations</h2>
            <p className="mt-2 text-gray-600">Plan your next adventure with Atlas</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Nav />
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Explore Destinations</h1>
          </div>

          {/* Search Section */}
          <div className="mb-12">
            <CitySearch
              onCitySelect={handleCitySelect}
              placeholder="Search for a city or destination..."
            />
          </div>

          {/* Categories */}
          <div className="mb-12">
            <motion.h2 
              className="text-xl font-semibold text-gray-900 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Explore by Type
            </motion.h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-[#0EA5E9]/10 p-3">
                      <category.icon className="h-6 w-6 text-[#0EA5E9]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <p className="mt-1 text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Map Section */}
          <div className="mb-12">
            <motion.div 
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-xl font-semibold text-gray-900">Interactive Map</h2>
            </motion.div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <Map 
                className="h-[400px] rounded-lg overflow-hidden"
                markers={displayedDestinations.map(dest => ({
                  id: dest.id,
                  coordinates: dest.coordinates,
                  title: dest.title
                }))}
                onMarkerClick={handleMarkerClick}
              />
            </div>
          </div>

          {/* Continent Filter */}
          <div className="mb-8">
            <motion.div 
              className="flex items-center gap-4 overflow-x-auto pb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {continents.map((continent) => (
                <button
                  key={continent.id}
                  onClick={() => setSelectedContinent(continent.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full transition-all ${
                    selectedContinent === continent.id
                      ? 'bg-[#0EA5E9] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {continent.name}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Destinations Grid */}
          <div className="mb-12">
            <motion.div 
              className="flex items-center justify-between mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedContinent === 'all' ? 'All Destinations' : `${continents.find(c => c.id === selectedContinent)?.name}`}
              </h2>
              <span className="text-gray-500 text-sm">{displayedDestinations.length} destinations</span>
            </motion.div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayedDestinations.map((destination, index) => (
                <motion.div
                  key={destination.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleCitySelect({ description: destination.title })}
                  className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="aspect-[16/9] relative rounded-t-xl overflow-hidden bg-gray-100">
                    <img
                      src={destination.imageUrl}
                      alt={destination.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2000&auto=format&fit=crop`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:opacity-30" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">{destination.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{destination.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  )
} 