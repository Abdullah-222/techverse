/**
 * Resend Email Client
 * 
 * Centralized Resend client configuration.
 * Uses environment variable RESEND_SECRET_KEY (server-side only).
 * 
 * Security:
 * - API key is never exposed to client
 * - All email operations are server-side only
 */

import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_SECRET_KEY

if (!resendApiKey) {
  console.warn('RESEND_SECRET_KEY is not set. Email functionality will be disabled.')
}

// Create Resend client instance
export const resend = resendApiKey ? new Resend(resendApiKey) : null

// Default sender email (update this to your verified domain)
export const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@zalnex.me'

// Base URL for app links
export const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
  : 'http://localhost:3000'

