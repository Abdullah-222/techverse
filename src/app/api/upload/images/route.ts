/**
 * Image Upload API Route
 * 
 * Handles secure server-side image uploads.
 * 
 * Security:
 * - Requires authentication (NextAuth session)
 * - Validates file type and size
 * - Uses service role key (never exposed to client)
 * - Returns only public URLs (not storage paths)
 * 
 * Usage:
 * POST /api/upload/images
 * Body: FormData with 'images' field (FileList or File[])
 * Query: ?bookId={uuid} (optional, defaults to 'temp')
 */

import { NextRequest, NextResponse } from 'next/server'
import { uploadBookImages } from '@/lib/image-upload'

export async function POST(request: NextRequest) {
  try {
    // Get bookId from query params (optional)
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId') || 'temp'

    // Parse FormData
    const formData = await request.formData()
    const images = formData.getAll('images') as File[]

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    // Upload images
    const urls = await uploadBookImages(images, bookId)

    return NextResponse.json({
      success: true,
      urls,
      count: urls.length,
    })
  } catch (error: any) {
    console.error('Image upload error:', error)

    // Return appropriate error response
    if (error.message.includes('authentication') || error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error.message.includes('File must be') || error.message.includes('not allowed')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (error.message.includes('size exceeds')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to upload images' },
      { status: 500 }
    )
  }
}

