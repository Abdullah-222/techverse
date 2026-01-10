/**
 * Supabase Storage Server Client
 * 
 * This module provides secure server-side access to Supabase Storage.
 * 
 * CRITICAL SECURITY:
 * - Uses SUPABASE_SERVICE_ROLE_KEY (never exposed to client)
 * - All uploads happen on the server
 * - Client never sees service role key
 * 
 * Why server-side uploads:
 * - Service role key has admin access - must stay on server
 * - Prevents unauthorized access to storage
 * - Allows server-side validation and security checks
 * - Enables proper error handling and logging
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
    'This is required for server-side storage operations.'
  )
}

/**
 * Create Supabase client with service role key
 * 
 * Service role key bypasses RLS (Row Level Security) and has admin access.
 * This is safe because it's ONLY used on the server, never exposed to clients.
 */
export function createStorageClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

