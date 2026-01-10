/**
 * Server Actions for Book History
 * 
 * These are Next.js Server Actions for book history operations.
 */

'use server'

import { revalidatePath } from 'next/cache'
import {
  getBookHistory as getBookHistoryLib,
  addHistoryEntry as addHistoryEntryLib,
  getBookWithHistory as getBookWithHistoryLib,
} from '@/lib/book-history'

/**
 * Server Action: Get book history
 */
export async function getBookHistoryAction(bookId: string) {
  try {
    const entries = await getBookHistoryLib(bookId)
    return { success: true, entries }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch book history' }
  }
}

/**
 * Server Action: Get book with history
 */
export async function getBookWithHistoryAction(bookId: string) {
  try {
    const book = await getBookWithHistoryLib(bookId)
    return { success: true, book }
  } catch (error: any) {
    return { success: false, error: error.message || 'Book not found' }
  }
}

/**
 * Server Action: Add history entry
 */
export async function addHistoryEntryAction(
  bookId: string,
  entryData: {
    city: string
    readingDuration?: string
    notes?: string
  }
) {
  try {
    const entry = await addHistoryEntryLib(bookId, entryData)
    revalidatePath(`/book-history/${bookId}`)
    revalidatePath(`/book/${bookId}`)
    return { success: true, entry }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add history entry' }
  }
}

