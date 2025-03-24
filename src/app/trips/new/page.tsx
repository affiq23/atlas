'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Nav } from '@/components/ui/nav'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

// Form validation schema
const tripSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  preferences: z.string().optional(),
})

type TripFormData = z.infer<typeof tripSchema>

const examplePreferences = [
  'Food & Dining',
  'Cultural Experiences',
  'Adventure Activities',
  'Historical Sites',
  'Shopping',
  'Nature & Outdoors',
  'Local Markets',
  'Art & Museums'
]

export default function NewTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
  })

  // Get destination from URL and set it in the form
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const destination = params.get('destination')
    if (destination) {
      setValue('destination', destination)
    }
  }, [setValue])

  const preferences = watch('preferences') || ''
  const startDate = watch('startDate')
  const endDate = watch('endDate')

  // Calculate trip duration
  const getDurationText = () => {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return null;
    if (diffDays === 1) return '1 day';
    return `${diffDays} days, ${diffDays - 1} nights`;
  };

  const durationText = getDurationText();

  const addPreference = (pref: string) => {
    const currentPrefs = preferences.trim()
    const newPref = currentPrefs 
      ? currentPrefs + (currentPrefs.endsWith(',') ? ' ' : ', ') + pref
      : pref
    setValue('preferences', newPref)
  }

  // Get today's date in YYYY-MM-DD format for date input min
  const today = new Date().toISOString().split('T')[0]

  const onSubmit = async (data: TripFormData) => {
    try {
      setError(null);
      setLoading(true);

      // Create the trip with suggestions
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Get the current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Get suggestions from OpenAI
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: data.destination,
          startDate: data.startDate,
          endDate: data.endDate,
          preferences: data.preferences,
        }),
      });

      const suggestionsData = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }

      // Create trip in database
      const { error: insertError } = await supabase
        .from('trips')
        .insert([
          {
            user_id: session.user.id,
            destination: data.destination,
            start_date: data.startDate,
            end_date: data.endDate,
            preferences: data.preferences,
            suggestions: suggestionsData.suggestions,
          },
        ]);

      if (insertError) throw insertError;

      router.push('/trips');
    } catch (error) {
      console.error('Error creating trip:', error);
      setError('Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <div className="min-h-screen bg-gray-50 pt-16">
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="relative rounded-lg bg-white p-8 shadow-sm">
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm z-10"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-12 w-12 rounded-full border-4 border-[#0EA5E9] border-t-transparent animate-spin" />
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900">Creating your trip...</p>
                    <p className="text-sm text-gray-500">Generating personalized suggestions</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Create New Trip</h1>
              <button
                onClick={() => router.push('/trips')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Trips
              </button>
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-lg bg-red-50 p-4 text-red-700"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
                  Where do you want to go?
                </label>
                <input
                  type="text"
                  id="destination"
                  {...register('destination')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#0EA5E9] focus:outline-none focus:ring-[#0EA5E9] sm:text-sm"
                  placeholder="e.g., Tokyo, Japan"
                />
                {errors.destination && (
                  <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    min={today}
                    {...register('startDate')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#0EA5E9] focus:outline-none focus:ring-[#0EA5E9] sm:text-sm"
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    min={today}
                    {...register('endDate')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#0EA5E9] focus:outline-none focus:ring-[#0EA5E9] sm:text-sm"
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              {durationText && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <div className="h-1 w-1 rounded-full bg-gray-400"></div>
                  <span>{durationText}</span>
                </motion.div>
              )}

              <div>
                <label htmlFor="preferences" className="block text-sm font-medium text-gray-700">
                  Travel Preferences
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {examplePreferences.map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => addPreference(pref)}
                      className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      + {pref}
                    </button>
                  ))}
                </div>
                <textarea
                  id="preferences"
                  {...register('preferences')}
                  rows={4}
                  className="mt-3 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#0EA5E9] focus:outline-none focus:ring-[#0EA5E9] sm:text-sm"
                  placeholder="Tell us about your interests (e.g., food, culture, adventure) and any specific requirements..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative rounded-lg bg-[#0EA5E9] px-6 py-3 text-base font-medium text-white transition-all duration-200 hover:bg-[#0284c7] hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />
                      Creating...
                    </span>
                  ) : (
                    'Create Trip'
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  )
} 