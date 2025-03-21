'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Nav } from '@/components/ui/nav'
import { GlobeAmericasIcon, MapIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const features = [
    {
      title: 'AI-Powered Planning',
      description: 'Get personalized itineraries based on your preferences and travel style.',
      icon: SparklesIcon
    },
    {
      title: 'Interactive Maps',
      description: 'Visualize your journey with beautiful maps and route planning.',
      icon: MapIcon
    },
    {
      title: 'Smart Suggestions',
      description: 'Discover hidden gems and local favorites along your route.',
      icon: GlobeAmericasIcon
    }
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <>
      <Nav />
      <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-gray-200/50 [mask-image:radial-gradient(ellipse_at_center,white_60%,transparent_100%)]" />
        
        {/* Decorative blobs */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#0EA5E9]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#38BDF8]/10 rounded-full blur-3xl" />
        
        <motion.div 
          className="relative z-10 max-w-6xl w-full text-center px-6 py-24 md:py-32"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Plan Your Perfect Trip with{' '}
            <span className="text-[#0EA5E9] whitespace-nowrap">Atlas</span>
          </motion.h1>
          
          <motion.p 
            className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Let Atlas help you create personalized travel itineraries with interactive maps and smart suggestions.
          </motion.p>

          <motion.div 
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href="/trips/new"
              className="w-full sm:w-auto rounded-lg bg-[#0EA5E9] px-8 py-3 text-base font-medium text-white shadow-lg shadow-blue-500/25 hover:bg-[#0284c7] transition-all duration-200 hover:scale-105 active:scale-100"
            >
              Start Planning
            </Link>
            <Link 
              href="/trips" 
              className="w-full sm:w-auto text-base font-medium text-gray-900 hover:text-[#0EA5E9] transition-colors flex items-center justify-center gap-2 group"
            >
              View My Trips 
              <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </motion.div>

          {/* Feature cards */}
          <motion.div 
            className="mt-32 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-5xl mx-auto px-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {features.map((feature, i) => (
              <motion.div 
                key={i} 
                className="relative group h-full"
                variants={item}
              >
                <div className="absolute -inset-px bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] rounded-xl opacity-25 group-hover:opacity-100 transition-opacity blur-sm" />
                <div className="relative h-full p-6 bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-100/50">
                  <feature.icon className="w-8 h-8 text-[#0EA5E9] mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </>
  )
}
