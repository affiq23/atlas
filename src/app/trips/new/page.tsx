'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Nav } from '@/components/ui/nav'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

// Form validation schema
const tripSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  preferences: z.string().optional(),
})

type TripFormData = z.infer<typeof tripSchema>

export default function NewTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
  })

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
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create New Trip</h1>
            
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
                {error}
              </div>
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
                    {...register('endDate')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#0EA5E9] focus:outline-none focus:ring-[#0EA5E9] sm:text-sm"
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="preferences" className="block text-sm font-medium text-gray-700">
                  Travel Preferences
                </label>
                <textarea
                  id="preferences"
                  {...register('preferences')}
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#0EA5E9] focus:outline-none focus:ring-[#0EA5E9] sm:text-sm"
                  placeholder="Tell us about your interests (e.g., food, culture, adventure) and any specific requirements..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[#0EA5E9] px-6 py-3 text-base font-medium text-white transition-all duration-200 hover:bg-[#0284c7] hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? 'Creating...' : 'Create Trip'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  )
} 