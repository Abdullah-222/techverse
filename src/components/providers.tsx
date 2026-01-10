'use client'

import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'

/**
 * Providers component
 * 
 * Wraps the app with NextAuth SessionProvider
 * This enables useSession hook in client components
 */
export function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

