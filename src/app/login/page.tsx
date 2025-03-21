'use client'

import { AuthButton } from '@/components/ui/auth-button'
import { motion } from 'framer-motion'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-gray-200/50 [mask-image:radial-gradient(ellipse_at_center,white_60%,transparent_100%)]" />
      
      {/* Decorative blobs */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#0EA5E9]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#38BDF8]/10 rounded-full blur-3xl" />
      
      <motion.div 
        className="relative z-10 w-full max-w-md px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Welcome to Atlas
            </h1>
            <p className="text-sm text-gray-600">
              Sign in to start planning your next adventure
            </p>
          </div>

          <div className="space-y-4">
            <AuthButton />
            
            <p className="text-xs text-center text-gray-500">
              By continuing, you agree to our{' '}
              <a href="#" className="text-[#0EA5E9] hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-[#0EA5E9] hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  )
} 