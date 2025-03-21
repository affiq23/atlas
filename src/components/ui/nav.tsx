'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapIcon } from '@heroicons/react/24/outline'

export function Nav() {
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
        </div>
      </nav>
    </motion.header>
  )
} 