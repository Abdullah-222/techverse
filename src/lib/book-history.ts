/**
 * Book History Management Utilities
 * 
 * Handles immutable book history entries that survive user deletion.
 * 
 * CRITICAL DESIGN PRINCIPLES:
 * 
 * 1. History is IMMUTABLE:
 *    - Entries are NEVER deleted
 *    - History belongs to the BOOK, not users
 *    - History survives user account deletion
 * 
 * 2. Access Control:
 *    - Public: Anyone can READ history
 *    - Authenticated: Only current owner can ADD entries
 *    - Past owners: CANNOT modify history
 * 
 * 3. Why No userId Reference:
 *    - If user deletes account, history remains
 *    - History is about book's journey, not ownership
 *    - Prevents data loss and maintains book identity
 */

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'

/**
 * Get all history entries for a book
 * 
 * PUBLIC function - no authentication required
 * This allows anyone to view book history via QR code
 * 
 * @param bookId - Book UUID
 * @returns List of history entries in chronological order
 */
export async function getBookHistory(bookId: string) {
  const entries = await prisma.bookHistoryEntry.findMany({
    where: {
      bookId,
    },
    orderBy: {
      createdAt: 'asc', // Chronological order (oldest first)
    },
  })

  return entries
}

/**
 * Add a new history entry to a book
 * 
 * CRITICAL: Only the CURRENT OWNER can add entries
 * This prevents unauthorized history modification
 * 
 * Rules:
 * - Requester must be authenticated
 * - Requester must be the current owner
 * - Book must exist
 * - Entry is created (never modified)
 * 
 * @param bookId - Book UUID
 * @param entryData - History entry data
 * @returns Created history entry
 */
export async function addHistoryEntry(
  bookId: string,
  entryData: {
    city: string
    readingDuration?: string
    notes?: string
  }
) {
  // Require authentication
  const user = await requireAuth()

  // Get book with current owner
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: {
      id: true,
      currentOwnerId: true,
      currentOwner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!book) {
    throw new Error('Book not found')
  }

  // CRITICAL: Only the current owner can add history entries
  if (book.currentOwnerId !== user.id) {
    throw new Error(
      'Only the current owner can add history entries to this book'
    )
  }

  // Validate required fields
  if (!entryData.city || entryData.city.trim().length === 0) {
    throw new Error('City is required')
  }

  // Create history entry
  // Note: We store displayName as a snapshot (not userId reference)
  // This ensures history survives even if user deletes their account
  try {
    const entry = await prisma.bookHistoryEntry.create({
      data: {
        bookId: book.id,
        city: entryData.city.trim(),
        readingDuration: entryData.readingDuration?.trim() || null,
        notes: entryData.notes?.trim() || null,
        displayName: book.currentOwner.name || null, // Snapshot of name at time of entry
      },
    })

    return entry
  } catch (error: any) {
    // Handle Prisma errors gracefully
    if (error.code === 'P2003') {
      // Foreign key constraint violation
      throw new Error('Unable to add history entry. Please try again.')
    }

    // Log the actual error for debugging, but return user-friendly message
    console.error('History entry creation error:', error)
    throw new Error('Failed to add history entry. Please try again.')
  }
}

/**
 * Get book with history entries
 * 
 * PUBLIC function - used for displaying book history page
 * 
 * @param bookId - Book UUID
 * @returns Book with history entries
 */
export async function getBookWithHistory(bookId: string) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      currentOwner: {
        select: {
          id: true,
          name: true,
        },
      },
      historyEntries: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  if (!book) {
    throw new Error('Book not found')
  }

  return book
}

