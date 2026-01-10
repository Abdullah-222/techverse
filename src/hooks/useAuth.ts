/**
 * Client-side authentication hook
 * 
 * Provides access to current user session in client components.
 * Uses NextAuth's useSession hook under the hood.
 * 
 * Usage:
 * const { user, loading, signOut } = useAuth()
 */

'use client'

import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const user = session?.user ?? null
  const loading = status === 'loading'

  /**
   * Sign out the current user
   * Clears session and redirects to home page
   */
  const signOut = async () => {
    try {
      await nextAuthSignOut({ redirect: false })
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  }
}
