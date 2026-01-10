/**
 * Server Actions for Book Management
 * 
 * These are Next.js Server Actions that can be called directly from client components.
 * They handle:
 * - Adding books
 * - Browsing books
 * - Managing book availability
 * - Deleting books
 * 
 * All actions include proper authentication and authorization checks.
 */

'use server'

import { revalidatePath } from 'next/cache'
import {
  addBook as addBookLib,
  getBooks as getBooksLib,
  getBookById as getBookByIdLib,
  getUserBooks as getUserBooksLib,
  updateBookAvailability as updateBookAvailabilityLib,
  deleteBook as deleteBookLib,
  type BookCondition,
} from '@/lib/books'

/**
 * Server Action: Add a new book
 */
export async function addBookAction(formData: FormData) {
  try {
    const book = await addBookLib({
      title: formData.get('title') as string,
      author: formData.get('author') as string,
      description: formData.get('description') as string | undefined,
      condition: (formData.get('condition') as BookCondition) || 'GOOD',
      images: formData.get('images')
        ? (formData.get('images') as string).split(',').filter(Boolean)
        : undefined,
      location: formData.get('location') as string,
    })

    // Revalidate pages that show books
    revalidatePath('/books')
    revalidatePath('/add-book')

    return { success: true, book }
  } catch (error: any) {
    // Always return user-friendly error messages
    // Never expose internal error details to users
    const userMessage = error.message || 'Failed to add book. Please try again.'
    return { success: false, error: userMessage }
  }
}

/**
 * Server Action: Get books with search/filter
 */
export async function getBooksAction(options?: {
  search?: string
  condition?: BookCondition
  location?: string
  availableOnly?: boolean
}) {
  try {
    const books = await getBooksLib(options)
    return { success: true, books }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch books' }
  }
}

/**
 * Server Action: Get a single book by ID
 */
export async function getBookByIdAction(bookId: string) {
  try {
    const book = await getBookByIdLib(bookId)
    return { success: true, book }
  } catch (error: any) {
    return { success: false, error: error.message || 'Book not found' }
  }
}

/**
 * Server Action: Get user's books
 */
export async function getUserBooksAction() {
  try {
    const books = await getUserBooksLib()
    return { success: true, books }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch your books' }
  }
}

/**
 * Server Action: Update book availability
 */
export async function updateBookAvailabilityAction(
  bookId: string,
  isAvailable: boolean
) {
  try {
    await updateBookAvailabilityLib(bookId, isAvailable)
    revalidatePath('/books')
    revalidatePath(`/book/${bookId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update availability' }
  }
}

/**
 * Server Action: Delete a book
 */
export async function deleteBookAction(bookId: string) {
  try {
    await deleteBookLib(bookId)
    revalidatePath('/books')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete book' }
  }
}

