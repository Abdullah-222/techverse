'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Stripe Page - Redirects to Points Purchase Page
 * 
 * This page redirects users to the dedicated points purchase page
 * instead of showing a generic Stripe checkout form.
 */
export default function StripePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to points purchase page
    router.replace('/points')
  }, [router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-zinc-600">Redirecting to points page...</p>
      </div>
    </div>
  )
}

