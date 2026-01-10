/**
 * Wishlist Management Utilities
 * 
 * Wishlist functionality supports:
 * - Users adding books to their wishlist
 * - Wishlist count as demand signal for AI point valuation
 * - Efficient queries for matching and discovery
 * 
 * Security:
 * - Only authenticated users can manage wishlists
 * - Users can only modify their own wishlist
 */

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'

/**
 * Add a book to user's wishlist
 * 
 * @param bookId - Book UUID to add to wishlist
 * @returns Wishlist entry
 */
export async function addToWishlist(bookId: string) {
  const user = await requireAuth()

  // Verify book exists
  const book = await prisma.book.findUnique({
    where: { id: bookId },
  })

  if (!book) {
    throw new Error('Book not found')
  }

  // Check if already in wishlist
  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId: bookId,
      },
    },
  })

  if (existing) {
    throw new Error('Book is already in your wishlist')
  }

  // Verify user exists in database before creating wishlist entry
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true },
  })

  if (!dbUser) {
    throw new Error('Your account is not valid. Please sign in again.')
  }

  // Add to wishlist
  try {
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: user.id,
        bookId: bookId,
      },
      include: {
        book: {
          include: {
            currentOwner: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // Trigger point recalculation if wishlist count crosses threshold
    // Threshold: recalculate every 3 wishlist items (significant change)
    const wishlistCount = await prisma.wishlist.count({
      where: { bookId },
    })
    
    if (wishlistCount % 3 === 0) {
      // Significant change - recalculate points
      const { recalculateBookPointsIfNeeded } = await import('./book-points')
      await recalculateBookPointsIfNeeded(bookId)
    }

    return wishlistItem
  } catch (error: any) {
    // Handle Prisma errors gracefully
    if (error.code === 'P2003') {
      // Foreign key constraint violation
      throw new Error('Unable to add to wishlist. Please try again.')
    }
    
    if (error.code === 'P2002') {
      // Unique constraint violation (already in wishlist)
      throw new Error('Book is already in your wishlist')
    }

    // Log the actual error for debugging, but return user-friendly message
    console.error('Wishlist creation error:', error)
    throw new Error('Failed to add book to wishlist. Please try again.')
  }
}

/**
 * Remove a book from user's wishlist
 * 
 * @param bookId - Book UUID to remove from wishlist
 */
export async function removeFromWishlist(bookId: string) {
  const user = await requireAuth()

  // Verify wishlist entry exists and belongs to user
  const wishlistItem = await prisma.wishlist.findUnique({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId: bookId,
      },
    },
  })

  if (!wishlistItem) {
    throw new Error('Book is not in your wishlist')
  }

  // Remove from wishlist
  await prisma.wishlist.delete({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId: bookId,
      },
    },
  })

  // Trigger point recalculation if wishlist count crosses threshold
  const wishlistCount = await prisma.wishlist.count({
    where: { bookId },
  })
  
  if (wishlistCount % 3 === 0) {
    // Significant change - recalculate points
    const { recalculateBookPointsIfNeeded } = await import('./book-points')
    await recalculateBookPointsIfNeeded(bookId)
  }
}

/**
 * Get user's wishlist
 * 
 * @param userId - User ID (optional, defaults to current user)
 * @returns List of books in wishlist
 */
export async function getUserWishlist(userId?: string) {
  const user = await requireAuth()
  const targetUserId = userId || user.id

  // Only allow users to see their own wishlist
  if (targetUserId !== user.id) {
    throw new Error('Unauthorized: You can only view your own wishlist')
  }

  const wishlistItems = await prisma.wishlist.findMany({
    where: {
      userId: targetUserId,
    },
    include: {
      book: {
        include: {
          currentOwner: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              wishlistItems: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return wishlistItems
}

/**
 * Check if a book is in user's wishlist
 * 
 * @param bookId - Book UUID
 * @returns true if book is in wishlist, false otherwise
 */
export async function isInWishlist(bookId: string): Promise<boolean> {
  try {
    const user = await requireAuth()

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: bookId,
        },
      },
    })

    return !!wishlistItem
  } catch {
    // If not authenticated, return false
    return false
  }
}

