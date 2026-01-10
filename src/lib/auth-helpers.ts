/**
 * Server-side authentication helpers
 * 
 * These utilities help access the current user session in server components
 * and server actions.
 * 
 * Usage:
 * - In Server Components: const session = await getServerSession()
 * - In Server Actions: const session = await getServerSession()
 * - In API Routes: Use auth() from @/auth directly
 */

import { auth } from '@/auth'
import { redirect } from 'next/navigation'

/**
 * Get the current server session
 * Returns null if user is not authenticated
 * 
 * @returns Session object with user data, or null if not authenticated
 */
export async function getServerSession() {
  return auth()
}

/**
 * Get the current authenticated user
 * Returns null if user is not authenticated
 * 
 * @returns User object from session, or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

/**
 * Require authentication - throws redirect if not authenticated
 * Use this in server components or server actions that require auth
 * 
 * @returns User object (never null)
 * @throws Redirects to login if not authenticated
 */
export async function requireAuth() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }
  
  return session.user
}

/**
 * Get user points from session
 * Returns 0 if user is not authenticated
 * 
 * @returns User's current points balance
 */
export async function getUserPoints(): Promise<number> {
  const user = await getCurrentUser()
  return user?.points ?? 0
}

