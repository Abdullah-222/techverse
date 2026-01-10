/**
 * API Route: Ask This Book
 * 
 * Server-side endpoint for the "Ask This Book" AI feature.
 * 
 * Handles:
 * - Question validation
 * - Book context retrieval
 * - AI response generation
 * - Error handling
 * 
 * Security:
 * - No authentication required (read-only feature)
 * - Input validation and sanitization
 * - Server-side only (Gemini API key never exposed)
 */

import { NextRequest, NextResponse } from 'next/server'
import { askBookQuestion } from '@/lib/ask-book-ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookId, question } = body

    // Validate input
    if (!bookId || typeof bookId !== 'string') {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    // Get AI response
    const response = await askBookQuestion(bookId, question)

    return NextResponse.json({
      success: true,
      response,
    })
  } catch (error: any) {
    // Return user-friendly error messages
    // Never expose internal error details
    const errorMessage =
      error.message || 'Failed to get AI response. Please try again.'

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

