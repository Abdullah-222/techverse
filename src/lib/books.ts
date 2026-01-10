/**
 * Book Management Utilities
 * 
 * This file contains server-side functions for book operations:
 * - Adding books with ownership enforcement
 * - Browsing and searching books
 * - Wishlist management
 * 
 * Security:
 * - All functions require authentication where appropriate
 * - Ownership is enforced at the database level
 * - Input validation prevents invalid data
 */

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'

// BookCondition type - matches Prisma enum
export type BookCondition = 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT'

/**
 * Add a new book to the platform
 * 
 * CRITICAL: Ownership is assigned immediately upon creation
 * The creator becomes the current owner - this is enforced by the database
 * 
 * @param bookData - Book information
 * @returns Created book with owner information
 */
export async function addBook(bookData: {
  title: string
  author: string
  description?: string
  condition: BookCondition
  images?: string[]
  location: string
}) {
  // Require authentication - only logged-in users can add books
  const user = await requireAuth()

  // Validate required fields
  if (!bookData.title || !bookData.author || !bookData.location) {
    throw new Error('Title, author, and location are required')
  }

  // Validate title and author are not just whitespace
  if (bookData.title.trim().length === 0 || bookData.author.trim().length === 0) {
    throw new Error('Title and author cannot be empty')
  }

  // CRITICAL: Verify user exists in database before creating book
  // This prevents foreign key constraint violations
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true },
  })

  if (!dbUser) {
    // User exists in session but not in database - session is invalid
    throw new Error('Your account is not valid. Please sign in again.')
  }

  try {
    // Create book with current user as owner
    // currentOwnerId is set to the authenticated user's ID
    // This enforces single ownership from creation
    const book = await prisma.book.create({
      data: {
        title: bookData.title.trim(),
        author: bookData.author.trim(),
        description: bookData.description?.trim() || null,
        condition: bookData.condition,
        images: bookData.images || [],
        location: bookData.location.trim(),
        currentOwnerId: user.id, // Ownership assigned immediately
        isAvailable: true, // New books are available by default
      },
      include: {
        currentOwner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            wishlistItems: true,
          },
        },
      },
    })

    // Calculate and cache AI-based point value
    // This happens asynchronously after book creation to avoid blocking
    // The points will be available when the first exchange is requested
    try {
      const { getBookPoints } = await import('./book-points')
      const { recalculateRarityForBooks } = await import('./book-points')
      
      // Calculate points for this book
      await getBookPoints(book.id, true) // Force calculation for new book
      
      // Recalculate rarity for all books with same title+author
      // This updates points for existing books when a new copy is added
      await recalculateRarityForBooks(book.title, book.author)
    } catch (error: any) {
      // If AI valuation fails or fields don't exist yet, log but don't fail book creation
      // This ensures books can still be created even if AI system isn't fully set up
      console.warn('AI point calculation failed (non-critical):', error.message)
      // Book is still created successfully, points can be calculated later
    }

    // Send book added email notification (non-blocking)
    try {
      const { sendBookAddedEmail } = await import('./emailHelpers')
      sendBookAddedEmail(book.id, user.id).catch((error) => {
        console.error('Failed to send book added email:', error)
      })
    } catch (error) {
      console.error('Error setting up book added email:', error)
    }

    return book
  } catch (error: any) {
    // Handle Prisma errors gracefully
    // Convert database errors to user-friendly messages
    if (error.code === 'P2003') {
      // Foreign key constraint violation
      throw new Error('Unable to create book. Please try signing in again.')
    }
    
    if (error.code === 'P2002') {
      // Unique constraint violation (shouldn't happen for books, but handle it)
      throw new Error('A book with these details already exists.')
    }

    // Log the actual error for debugging, but return user-friendly message
    console.error('Book creation error:', error)
    throw new Error('Failed to create book. Please try again.')
  }
}

/**
 * Get all available books with optional search and filtering
 * 
 * This is a PUBLIC function - unauthenticated users can browse books
 * but cannot request exchanges or add to wishlist
 * 
 * @param options - Search and filter options
 * @returns List of books matching criteria
 */
export async function getBooks(options?: {
  search?: string // Search in title or author
  condition?: BookCondition
  location?: string
  availableOnly?: boolean
  limit?: number
  offset?: number
}) {
  const where: any = {}

  // Filter by availability
  if (options?.availableOnly !== false) {
    where.isAvailable = true
  }

  // Filter by condition
  if (options?.condition) {
    where.condition = options.condition
  }

  // Filter by location
  if (options?.location) {
    where.location = {
      contains: options.location,
      mode: 'insensitive',
    }
  }

  // Search in title or author
  if (options?.search) {
    where.OR = [
      {
        title: {
          contains: options.search,
          mode: 'insensitive',
        },
      },
      {
        author: {
          contains: options.search,
          mode: 'insensitive',
        },
      },
    ]
  }

  const books = await prisma.book.findMany({
    where,
    include: {
      currentOwner: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          wishlistItems: true, // Include wishlist count for demand signal
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // Newest first
    },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  })

  return books
}

/**
 * Get a single book by ID
 * 
 * @param bookId - Book UUID
 * @returns Book with owner and wishlist count
 */
export async function getBookById(bookId: string) {
  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        currentOwner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            wishlistItems: true,
          },
        },
      },
    })

    if (!book) {
      throw new Error('Book not found')
    }

    // Return book with computedPoints (may be null if not yet calculated)
    // Using include instead of select to avoid field errors during migration
    return book
  } catch (error: any) {
    // Handle Prisma errors gracefully
    if (error.message?.includes('Unknown field')) {
      // Field doesn't exist yet - likely during migration
      // Fetch without computedPoints
      const book = await prisma.book.findUnique({
        where: { id: bookId },
        include: {
          currentOwner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              wishlistItems: true,
            },
          },
        },
      })

      if (!book) {
        throw new Error('Book not found')
      }

      // Add null computedPoints for compatibility
      return {
        ...book,
        computedPoints: null,
        pointsLastCalculatedAt: null,
      }
    }
    throw error
  }
}

/**
 * Get books owned by a specific user
 * 
 * @param userId - User ID (optional, defaults to current user)
 * @returns List of books owned by the user
 */
export async function getUserBooks(userId?: string) {
  const user = await requireAuth()
  const targetUserId = userId || user.id

  // Only allow users to see their own books (or if they're viewing their own)
  if (targetUserId !== user.id) {
    throw new Error('Unauthorized: You can only view your own books')
  }

  const books = await prisma.book.findMany({
    where: {
      currentOwnerId: targetUserId,
    },
    include: {
      _count: {
        select: {
          wishlistItems: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return books
}

/**
 * Update book availability
 * 
 * CRITICAL: Only the current owner can modify availability
 * This enforces ownership rights
 * 
 * @param bookId - Book UUID
 * @param isAvailable - New availability status
 */
export async function updateBookAvailability(
  bookId: string,
  isAvailable: boolean
) {
  const user = await requireAuth()

  // First, verify the user owns the book
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { currentOwnerId: true },
  })

  if (!book) {
    throw new Error('Book not found')
  }

  if (book.currentOwnerId !== user.id) {
    throw new Error('Unauthorized: Only the book owner can modify availability')
  }

  // Update availability
  await prisma.book.update({
    where: { id: bookId },
    data: { isAvailable },
  })
}

/**
 * Delete a book
 * 
 * CRITICAL: Only the current owner can delete a book
 * 
 * Note: In a production system, we might want to soft-delete
 * to preserve history. For hackathon MVP, we use hard delete.
 * 
 * @param bookId - Book UUID
 */
export async function deleteBook(bookId: string) {
  const user = await requireAuth()

  // Verify ownership
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { currentOwnerId: true },
  })

  if (!book) {
    throw new Error('Book not found')
  }

  if (book.currentOwnerId !== user.id) {
    throw new Error('Unauthorized: Only the book owner can delete the book')
  }

  // Delete the book
  // Cascade deletes will remove wishlist entries automatically
  await prisma.book.delete({
    where: { id: bookId },
  })
}

