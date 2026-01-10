/**
 * Image Upload Utilities
 * 
 * Handles secure server-side image uploads to Supabase Storage.
 * 
 * Storage Structure:
 * techverse/
 *  └── books/
 *      └── {bookId}/
 *          └── {timestamp}-{originalFilename}
 * 
 * Why this structure:
 * - Organized by book ID for easy management
 * - Timestamp prevents filename conflicts
 * - Original filename preserved for reference
 * - Easy to clean up when book is deleted
 */

import { createStorageClient } from './supabase-storage'
import { requireAuth } from './auth-helpers'

const BUCKET_NAME = 'techverse'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

/**
 * Validate uploaded file
 * 
 * @param file - File to validate
 * @throws Error if validation fails
 */
function validateFile(file: File): void {
  // Check MIME type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }

  // Check specific allowed types
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      `File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
    )
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    )
  }

  // Check file name
  if (!file.name || file.name.trim().length === 0) {
    throw new Error('File must have a name')
  }
}

/**
 * Generate storage path for book image
 * 
 * Structure: books/{bookId}/{timestamp}-{originalFilename}
 * 
 * @param bookId - Book UUID
 * @param originalFilename - Original file name
 * @returns Storage path
 */
function generateStoragePath(bookId: string, originalFilename: string): string {
  // Sanitize filename (remove path separators and special chars)
  const sanitizedFilename = originalFilename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.\./g, '_')

  // Generate unique filename with timestamp
  const timestamp = Date.now()
  const filename = `${timestamp}-${sanitizedFilename}`

  return `books/${bookId}/${filename}`
}

/**
 * Upload a single image file
 * 
 * @param file - File to upload
 * @param bookId - Book UUID (or 'temp' for temporary uploads)
 * @returns Public URL of uploaded image
 */
export async function uploadBookImage(
  file: File,
  bookId: string = 'temp'
): Promise<string> {
  // Require authentication - only logged-in users can upload
  await requireAuth()

  // Validate file
  validateFile(file)

  // Generate storage path
  const storagePath = generateStoragePath(bookId, file.name)

  // Create Supabase client with service role key
  const supabase = createStorageClient()

  // Convert File to ArrayBuffer for upload
  // Note: Supabase Storage accepts ArrayBuffer, Blob, or File
  const arrayBuffer = await file.arrayBuffer()

  // Upload to Supabase Storage
  // Using ArrayBuffer directly (works in both Node.js and Edge runtime)
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false, // Do not overwrite - each upload is unique
    })

  if (error) {
    console.error('Supabase upload error:', error)
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath)

  if (!publicUrl) {
    throw new Error('Failed to generate public URL for uploaded image')
  }

  return publicUrl
}

/**
 * Upload multiple images
 * 
 * @param files - Array of files to upload
 * @param bookId - Book UUID (or 'temp' for temporary uploads)
 * @returns Array of public URLs
 */
export async function uploadBookImages(
  files: File[],
  bookId: string = 'temp'
): Promise<string[]> {
  // Require authentication
  await requireAuth()

  if (!files || files.length === 0) {
    return []
  }

  // Validate all files first
  files.forEach(validateFile)

  // Upload all files in parallel
  const uploadPromises = files.map((file) => uploadBookImage(file, bookId))

  try {
    const urls = await Promise.all(uploadPromises)
    return urls
  } catch (error: any) {
    throw new Error(`Failed to upload images: ${error.message}`)
  }
}

/**
 * Delete an image from storage
 * 
 * @param imageUrl - Public URL of the image to delete
 */
export async function deleteBookImage(imageUrl: string): Promise<void> {
  // Require authentication
  await requireAuth()

  // Extract path from URL
  // URL format: https://{project}.supabase.co/storage/v1/object/public/techverse/books/{bookId}/{filename}
  const urlParts = imageUrl.split('/storage/v1/object/public/')
  if (urlParts.length !== 2) {
    throw new Error('Invalid image URL format')
  }

  const storagePath = urlParts[1].replace(`${BUCKET_NAME}/`, '')

  const supabase = createStorageClient()

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([storagePath])

  if (error) {
    console.error('Supabase delete error:', error)
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}

