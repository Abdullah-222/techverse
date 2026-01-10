/**
 * Book Detail Page
 * 
 * Public page for viewing individual book details.
 * Shows:
 * - Book information
 * - Current owner
 * - Wishlist count (demand signal)
 * - Wishlist toggle for authenticated users
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { getBookByIdAction } from '@/app/actions/books'
import {
  addToWishlistAction,
  removeFromWishlistAction,
  isInWishlistAction,
} from '@/app/actions/wishlist'
import { updateBookAvailabilityAction, deleteBookAction } from '@/app/actions/books'
import { requestExchangeAction } from '@/app/actions/exchanges'
import { getBookPointsAction } from '@/app/actions/book-points'
import { generateBookHistoryUrl } from '@/lib/qr-code'
import type { BookCondition } from '@/lib/books'
import AskBookModal from '@/components/AskBookModal'

const BOOK_CONDITIONS: { value: BookCondition; label: string }[] = [
  { value: 'POOR', label: 'Poor - Significant wear' },
  { value: 'FAIR', label: 'Fair - Noticeable wear' },
  { value: 'GOOD', label: 'Good - Minor wear' },
  { value: 'EXCELLENT', label: 'Excellent - Like new' },
]

interface Book {
  id: string
  title: string
  author: string
  description: string | null
  condition: BookCondition
  images: string[]
  location: string
  isAvailable: boolean
  computedPoints: number | null
  createdAt: Date
  currentOwner: {
    id: string
    name: string | null
    email: string
  }
  _count: {
    wishlistItems: number
  }
}

export default function BookDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const bookId = params.id as string

  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [inWishlist, setInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [updatingAvailability, setUpdatingAvailability] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [requestingExchange, setRequestingExchange] = useState(false)
  const [userPoints, setUserPoints] = useState<number | null>(null)
  const [bookPoints, setBookPoints] = useState<number | null>(null)
  const [loadingPoints, setLoadingPoints] = useState(false)
  const [askBookModalOpen, setAskBookModalOpen] = useState(false)

  const isOwner = book && user && book.currentOwner.id === user.id

  // Load AI-computed points for the book
  useEffect(() => {
    if (book) {
      loadBookPoints()
    }
  }, [book])

  const loadBookPoints = async () => {
    if (!book) return
    
    setLoadingPoints(true)
    try {
      const result = await getBookPointsAction(book.id)
      if (result.success && result.points !== undefined) {
        setBookPoints(result.points)
      }
    } catch (err) {
      // Ignore errors, will use fallback
    } finally {
      setLoadingPoints(false)
    }
  }

  const requiredPoints = bookPoints || 10 // Fallback to 10 if not yet calculated

  useEffect(() => {
    loadBook()
  }, [bookId])

  useEffect(() => {
    if (isAuthenticated && book) {
      checkWishlistStatus()
      loadUserPoints()
    }
  }, [isAuthenticated, book])

  const loadUserPoints = async () => {
    if (!user) return
    // Get user points from session or API
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      if (data.user) {
        setUserPoints(data.user.points)
      }
    } catch {
      // Ignore errors
    }
  }

  const loadBook = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await getBookByIdAction(bookId)

      if (!result.success) {
        setError(result.error || 'Book not found')
        return
      }

      setBook(result.book)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const checkWishlistStatus = async () => {
    if (!isAuthenticated || !book) return

    try {
      const result = await isInWishlistAction(book.id)
      setInWishlist(result.success ? result.inWishlist : false)
    } catch {
      setInWishlist(false)
    }
  }

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/book/${bookId}`)
      return
    }

    if (!book) return

    setWishlistLoading(true)
    try {
      if (inWishlist) {
        await removeFromWishlistAction(book.id)
        setInWishlist(false)
      } else {
        await addToWishlistAction(book.id)
        setInWishlist(true)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update wishlist')
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleToggleAvailability = async () => {
    if (!book) return

    setUpdatingAvailability(true)
    try {
      await updateBookAvailabilityAction(book.id, !book.isAvailable)
      setBook({ ...book, isAvailable: !book.isAvailable })
    } catch (err: any) {
      setError(err.message || 'Failed to update availability')
    } finally {
      setUpdatingAvailability(false)
    }
  }

  const handleDelete = async () => {
    if (!book) return

    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      await deleteBookAction(book.id)
      router.push('/books')
    } catch (err: any) {
      setError(err.message || 'Failed to delete book')
      setDeleting(false)
    }
  }

  const handleRequestExchange = async () => {
    if (!book) return

    if (!confirm(`Request this book for ${requiredPoints} points? Points will be deducted when the owner approves.`)) {
      return
    }

    setRequestingExchange(true)
    setError('')

    try {
      const result = await requestExchangeAction(book.id)

      if (!result.success) {
        setError(result.error || 'Failed to request exchange')
        setRequestingExchange(false)
        return
      }

      // Success - reload book to show updated status
      await loadBook()
      alert('Exchange request sent! The owner will be notified.')
    } catch (err: any) {
      setError(err.message || 'Failed to request exchange')
    } finally {
      setRequestingExchange(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading book...</p>
      </div>
    )
  }

  if (error && !book) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Link
            href="/books"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Books
          </Link>
        </div>
      </div>
    )
  }

  if (!book) return null

  return (
    <div className="min-h-screen bg-white dark:bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/books"
          className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block"
        >
          ← Back to Books
        </Link>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Images */}
            <div>
              {book.images && book.images.length > 0 ? (
                <div className="space-y-4">
                  <div className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
                    <img
                      src={book.images[0]}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {book.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {book.images.slice(1, 5).map((image, idx) => (
                        <div
                          key={idx}
                          className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden"
                        >
                          <img
                            src={image}
                            alt={`${book.title} ${idx + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                  <span className="text-zinc-400 dark:text-zinc-600 text-6xl">
                    📚
                  </span>
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                  {book.title}
                </h1>
                <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-4">
                  by {book.author}
                </p>

                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-sm">
                    {
                      BOOK_CONDITIONS.find((c) => c.value === book.condition)
                        ?.label || book.condition
                    }
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-500">
                    📍 {book.location}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-500">
                    {book._count.wishlistItems} wishlist
                    {book._count.wishlistItems !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="mb-4">
                  <span
                    className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                      book.isAvailable
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {book.isAvailable ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>

              {book.description && (
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                    Description
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                    {book.description}
                  </p>
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                  Current Owner
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {book.currentOwner.name || 'Anonymous User'}
                </p>
              </div>

              {/* QR Code */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
                  📱 Book History QR Code
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Scan this QR code to view this book's journey through different readers
                </p>
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-zinc-200 dark:border-zinc-700">
                    <img
                      src={`/api/qr-code/${book.id}`}
                      alt={`QR code for ${book.title}`}
                      className="w-64 h-64"
                      width={256}
                      height={256}
                    />
                  </div>
                  <Link
                    href={`/book-history/${book.id}`}
                    className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Book History →
                  </Link>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                {/* Ask This Book - Available to everyone */}
                <button
                  onClick={() => setAskBookModalOpen(true)}
                  className="w-full py-3 px-4 rounded-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                >
                  🤖 Ask This Book
                </button>

                {isAuthenticated && !isOwner && book.isAvailable && (
                  <div className="space-y-2">
                    <button
                      onClick={handleRequestExchange}
                      disabled={requestingExchange || loadingPoints || (userPoints !== null && userPoints < requiredPoints)}
                      className="w-full py-3 px-4 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {requestingExchange
                        ? 'Requesting...'
                        : loadingPoints
                        ? 'Calculating points...'
                        : `📖 Request Exchange (${requiredPoints} points)`}
                    </button>
                    {userPoints !== null && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                        Your points: {userPoints} | Required: {requiredPoints}
                        {loadingPoints && (
                          <span className="block text-blue-500 mt-1">
                            AI calculating value...
                          </span>
                        )}
                        {!loadingPoints && userPoints < requiredPoints && (
                          <span className="block text-red-500 mt-1">
                            Insufficient points
                          </span>
                        )}
                      </p>
                    )}
                    {bookPoints && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center italic">
                        💡 Value calculated using AI based on condition, demand, and rarity
                      </p>
                    )}
                  </div>
                )}

                {isAuthenticated && (
                  <button
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                      inWishlist
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    } hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50`}
                  >
                    {wishlistLoading
                      ? 'Loading...'
                      : inWishlist
                      ? '❤️ Remove from Wishlist'
                      : '🤍 Add to Wishlist'}
                  </button>
                )}

                {isOwner && (
                  <>
                    <button
                      onClick={handleToggleAvailability}
                      disabled={updatingAvailability}
                      className="w-full py-2 px-4 rounded-lg font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    >
                      {updatingAvailability
                        ? 'Updating...'
                        : book.isAvailable
                        ? 'Mark as Unavailable'
                        : 'Mark as Available'}
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="w-full py-2 px-4 rounded-lg font-semibold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 transition-colors disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Delete Book'}
                    </button>
                  </>
                )}

                {!isAuthenticated && (
                  <Link
                    href={`/login?callbackUrl=/book/${bookId}`}
                    className="block w-full py-2 px-4 rounded-lg font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-center"
                  >
                    Sign in to add to wishlist
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ask This Book Modal */}
      <AskBookModal
        bookId={book.id}
        bookTitle={book.title}
        isOpen={askBookModalOpen}
        onClose={() => setAskBookModalOpen(false)}
      />
    </div>
  )
}

