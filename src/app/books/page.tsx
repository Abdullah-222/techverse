/**
 * Books Browsing Page
 * 
 * Public page for browsing and discovering books.
 * - Unauthenticated users can browse
 * - Authenticated users can also add to wishlist
 * - Search and filter functionality
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { getBooksAction } from '@/app/actions/books'
import { addToWishlistAction, removeFromWishlistAction, isInWishlistAction } from '@/app/actions/wishlist'
import type { BookCondition } from '@/lib/books'

const BOOK_CONDITIONS: { value: BookCondition; label: string }[] = [
  { value: 'POOR', label: 'Poor' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'GOOD', label: 'Good' },
  { value: 'EXCELLENT', label: 'Excellent' },
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
  createdAt: Date
  currentOwner: {
    id: string
    name: string | null
  }
  _count: {
    wishlistItems: number
  }
}

export default function BooksPage() {
  const { user, isAuthenticated } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState({
    search: '',
    condition: '' as BookCondition | '',
    location: '',
  })

  const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>({})

  // Load books
  useEffect(() => {
    loadBooks()
  }, [filters])

  // Load wishlist status for authenticated users
  useEffect(() => {
    if (isAuthenticated && books.length > 0) {
      loadWishlistStatus()
    }
  }, [isAuthenticated, books])

  const loadBooks = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await getBooksAction({
        search: filters.search || undefined,
        condition: filters.condition || undefined,
        location: filters.location || undefined,
        availableOnly: true,
      })

      if (!result.success) {
        setError(result.error || 'Failed to load books')
        return
      }

      setBooks(result.books || [])
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const loadWishlistStatus = async () => {
    if (!isAuthenticated) return

    const status: Record<string, boolean> = {}
    for (const book of books) {
      try {
        const result = await isInWishlistAction(book.id)
        status[book.id] = result.success ? result.inWishlist : false
      } catch {
        status[book.id] = false
      }
    }
    setWishlistStatus(status)
  }

  const handleWishlistToggle = async (bookId: string) => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login?callbackUrl=/books'
      return
    }

    const isInWishlist = wishlistStatus[bookId]

    try {
      if (isInWishlist) {
        await removeFromWishlistAction(bookId)
        setWishlistStatus({ ...wishlistStatus, [bookId]: false })
      } else {
        await addToWishlistAction(bookId)
        setWishlistStatus({ ...wishlistStatus, [bookId]: true })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update wishlist')
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              Browse Books
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Discover books available for exchange
            </p>
          </div>
          {isAuthenticated && (
            <Link
              href="/add-book"
              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold py-2 px-4 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
            >
              Add Book
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder="Title or author..."
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Condition
              </label>
              <select
                value={filters.condition}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    condition: e.target.value as BookCondition | '',
                  })
                }
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Conditions</option>
                {BOOK_CONDITIONS.map((condition) => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
                placeholder="City or region..."
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Books Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">
              No books found. Be the first to add one!
            </p>
            {isAuthenticated && (
              <Link
                href="/add-book"
                className="mt-4 inline-block bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold py-2 px-4 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
              >
                Add First Book
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {book.images && book.images.length > 0 && (
                  <div className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={book.images[0]}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <Link href={`/book/${book.id}`}>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                    by {book.author}
                  </p>
                  {book.description && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-4 line-clamp-2">
                      {book.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">
                      {BOOK_CONDITIONS.find((c) => c.value === book.condition)
                        ?.label || book.condition}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-500">
                      📍 {book.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 dark:text-zinc-500">
                      {book._count.wishlistItems} wishlist
                      {book._count.wishlistItems !== 1 ? 's' : ''}
                    </span>
                    {isAuthenticated && (
                      <button
                        onClick={() => handleWishlistToggle(book.id)}
                        className={`text-sm px-3 py-1 rounded ${
                          wishlistStatus[book.id]
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        } hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors`}
                      >
                        {wishlistStatus[book.id] ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

