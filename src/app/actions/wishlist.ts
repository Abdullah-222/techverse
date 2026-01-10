/**
 * Server Actions for Wishlist Management
 * 
 * These are Next.js Server Actions for managing user wishlists.
 */

'use server'

import { revalidatePath } from 'next/cache'
import {
  addToWishlist as addToWishlistLib,
  removeFromWishlist as removeFromWishlistLib,
  getUserWishlist as getUserWishlistLib,
  isInWishlist as isInWishlistLib,
} from '@/lib/wishlist'

/**
 * Server Action: Add book to wishlist
 */
export async function addToWishlistAction(bookId: string) {
  try {
    const wishlistItem = await addToWishlistLib(bookId)
    revalidatePath('/books')
    revalidatePath(`/book/${bookId}`)
    revalidatePath('/wishlist')
    return { success: true, wishlistItem }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add to wishlist' }
  }
}

/**
 * Server Action: Remove book from wishlist
 */
export async function removeFromWishlistAction(bookId: string) {
  try {
    await removeFromWishlistLib(bookId)
    revalidatePath('/books')
    revalidatePath(`/book/${bookId}`)
    revalidatePath('/wishlist')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to remove from wishlist' }
  }
}

/**
 * Server Action: Get user's wishlist
 */
export async function getUserWishlistAction() {
  try {
    const wishlistItems = await getUserWishlistLib()
    return { success: true, wishlistItems }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch wishlist' }
  }
}

/**
 * Server Action: Check if book is in wishlist
 */
export async function isInWishlistAction(bookId: string) {
  try {
    const inWishlist = await isInWishlistLib(bookId)
    return { success: true, inWishlist }
  } catch (error: any) {
    return { success: false, inWishlist: false }
  }
}

