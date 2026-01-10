/**
 * Server Actions for Book Points Management
 * 
 * These are Next.js Server Actions for managing AI-computed book points.
 */

'use server'

import { revalidatePath } from 'next/cache'
import {
  getBookPoints,
  recalculateBookPointsIfNeeded,
} from '@/lib/book-points'

/**
 * Server Action: Get book points
 */
export async function getBookPointsAction(bookId: string) {
  try {
    const points = await getBookPoints(bookId, false)
    return { success: true, points }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get book points' }
  }
}

/**
 * Server Action: Recalculate book points
 */
export async function recalculateBookPointsAction(bookId: string) {
  try {
    const points = await getBookPoints(bookId, true) // Force recalculation
    revalidatePath(`/book/${bookId}`)
    revalidatePath('/books')
    return { success: true, points }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to recalculate points' }
  }
}

