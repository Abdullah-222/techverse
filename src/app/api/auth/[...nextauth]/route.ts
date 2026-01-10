/**
 * NextAuth API Route Handler
 * 
 * This route handles all NextAuth authentication requests:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/session
 * - /api/auth/csrf
 * - etc.
 * 
 * This is the standard NextAuth v5 route handler pattern.
 */

import { handlers } from '@/auth'

export const { GET, POST } = handlers

