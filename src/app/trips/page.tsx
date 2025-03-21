'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { Nav } from '@/components/ui/nav'
import Link from 'next/link'

export default function TripsPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

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
      <div className="min-h-screen bg-gray-50 pt-16">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">My Trips</h1>
          </div>

          <div className="mt-8 rounded-lg bg-white p-8 shadow-sm">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Ready to plan your next adventure?</h3>
              <p className="mt-2 text-gray-500">
                Create your first trip and start exploring
              </p>
              <div className="mt-6">
                <Link
                  href="/trips/new"
                  className="inline-flex items-center rounded-lg bg-[#0EA5E9] px-6 py-3 text-base font-medium text-white transition-all duration-200 hover:bg-[#0284c7] hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                  Create Trip
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
} 