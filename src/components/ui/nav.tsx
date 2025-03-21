'use client'

import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export function Nav() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSignInMenu, setShowSignInMenu] = useState(false)

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById('sign-in-menu')
      if (menu && !menu.contains(event.target as Node)) {
        setShowSignInMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      subscription.unsubscribe()
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignIn = async (provider: 'google') => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account'
        }
      }
    })
  }

  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-gray-900 hover:text-[#0EA5E9] transition-colors">
          <MapIcon className="w-6 h-6" />
          <span className="font-semibold text-lg">Atlas</span>
        </Link>
        
        <div className="flex items-center gap-6">
          {!loading && (
            user ? (
              <>
                <Link 
                  href="/trips" 
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  My Trips
                </Link>
                <Link 
                  href="/trips/new" 
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-[#0EA5E9] text-white hover:bg-[#0284c7] transition-colors"
                >
                  New Trip
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setShowSignInMenu(!showSignInMenu)}
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-[#0EA5E9] text-white hover:bg-[#0284c7] transition-colors"
                >
                  Sign In
                </button>
                {showSignInMenu && (
                  <div 
                    id="sign-in-menu"
                    className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div className="p-2">
                      <button
                        onClick={() => handleSignIn('google')}
                        className="group flex w-full items-center rounded-lg px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg className="mr-3 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                          <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Continue with Google
                      </button>
                      {/* Add more providers here in the future */}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </nav>
    </motion.header>
  )
} 