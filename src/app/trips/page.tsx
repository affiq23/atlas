'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { Nav } from '@/components/ui/nav'
import Link from 'next/link'
import { TripCard } from '@/components/TripCard'
import { motion } from 'framer-motion'

type Trip = {
  id: string
  destination: string
  start_date: string
  end_date: string
  preferences?: string
  suggestions?: string[]
  user_id: string
}

export default function TripsPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check active session and load trips
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadTrips(supabase, session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadTrips(supabase, session.user.id)
      } else {
        setTrips([])
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadTrips = async (supabase: any, userId: string) => {
    try {
      console.log('Loading trips for user:', userId);
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trips:', error);
        throw error;
      }

      // Process the suggestions to ensure they're in the correct format
      const processedTrips = data?.map((trip: Trip) => ({
        ...trip,
        suggestions: Array.isArray(trip.suggestions) ? trip.suggestions : []
      })) || [];

      console.log('Processed trips:', processedTrips);
      setTrips(processedTrips);
    } catch (error) {
      console.error('Error loading trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTrip = async (tripId: string) => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId)
        .eq('user_id', session.user.id)

      if (error) {
        console.error('Delete error:', error)
        alert(`Failed to delete trip. Error: ${error.message}`)
        return
      }

      setTrips(trips.filter(trip => trip.id !== tripId))
      setSelectedTrip(null)
    } catch (error) {
      console.error('Error in deleteTrip:', error)
      alert('Failed to delete trip. Please try again.')
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
            <h2 className="text-2xl font-semibold text-gray-900">Sign in to view your trips</h2>
            <p className="mt-2 text-gray-600">Create and manage your travel plans with Atlas</p>
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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">My Trips</h1>
            <Link
              href="/trips/new"
              className="rounded-lg bg-[#0EA5E9] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0284c7] focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Create Trip
            </Link>
          </div>

          {trips.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-lg bg-white p-8 text-center shadow-sm"
            >
              <h3 className="text-lg font-medium text-gray-900">No trips yet</h3>
              <p className="mt-2 text-gray-500">
                Get started by creating your first trip
              </p>
            </motion.div>
          ) : (
            <motion.div 
              className="mt-8 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onDelete={deleteTrip}
                  isSelected={selectedTrip === trip.id}
                  onSelect={() => setSelectedTrip(selectedTrip === trip.id ? null : trip.id)}
                />
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </>
  )
} 