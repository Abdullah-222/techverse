/**
 * Public Book History Page
 * 
 * This page is accessible via QR code and shows the book's journey.
 * 
 * Features:
 * - No authentication required (public access)
 * - Timeline view of book's history
 * - Emotional, community-driven design
 * - Shows book's journey through different readers
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { getBookWithHistoryAction, addHistoryEntryAction } from '@/app/actions/book-history'

interface BookHistoryEntry {
  id: string
  city: string
  readingDuration: string | null
  notes: string | null
  displayName: string | null
  createdAt: Date
}

interface Book {
  id: string
  title: string
  author: string
  description: string | null
  images: string[]
  condition: string
  location: string
  currentOwner: {
    id: string
    name: string | null
  }
  historyEntries: BookHistoryEntry[]
}

export default function BookHistoryPage() {
  const params = useParams()
  const { user, isAuthenticated } = useAuth()
  const bookId = params.bookId as string

  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    city: '',
    readingDuration: '',
    notes: '',
  })

  const isOwner = book && user && book.currentOwner.id === user.id

  useEffect(() => {
    loadBook()
  }, [bookId])

  const loadBook = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await getBookWithHistoryAction(bookId)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const result = await addHistoryEntryAction(bookId, {
        city: formData.city,
        readingDuration: formData.readingDuration || undefined,
        notes: formData.notes || undefined,
      })

      if (!result.success) {
        setError(result.error || 'Failed to add history entry')
        setSubmitting(false)
        return
      }

      // Reset form and reload
      setFormData({ city: '', readingDuration: '', notes: '' })
      setShowAddForm(false)
      await loadBook()
    } catch (err: any) {
      setError(err.message || 'Failed to add history entry')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading book history...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Book Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                {book.title}
              </h1>
              <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-6">
                by {book.author}
              </p>
              
              {book.description && (
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  {book.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500">
                <span>📍 {book.location}</span>
                <span>📚 {book.historyEntries.length} reader{book.historyEntries.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg border-2 border-zinc-200 dark:border-zinc-700">
                <img
                  src={`/api/qr-code/${bookId}`}
                  alt={`QR code for ${book.title}`}
                  className="w-64 h-64"
                  width={256}
                  height={256}
                />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 text-center max-w-[200px]">
                Scan to view this book's journey
              </p>
            </div>
          </div>
        </div>

        {/* Add History Entry (Owner Only) */}
        {isOwner && !showAddForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              ✍️ Add Your Reading Experience
            </button>
          </div>
        )}

        {isOwner && showAddForm && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
              Share Your Reading Experience
            </h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Where did you read this book?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Reading Duration
                </label>
                <input
                  type="text"
                  value={formData.readingDuration}
                  onChange={(e) => setFormData({ ...formData, readingDuration: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2 weeks, 1 month"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your thoughts, favorite quotes, or reading experience..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add to History'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setFormData({ city: '', readingDuration: '', notes: '' })
                    setError('')
                  }}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
            📖 This Book's Journey
          </h2>

          {book.historyEntries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                This book's journey hasn't started yet.
              </p>
              {isOwner && (
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  Be the first to share your reading experience!
                </p>
              )}
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 to-indigo-600 dark:from-blue-600 dark:to-indigo-800"></div>

              {/* Timeline Entries */}
              <div className="space-y-8">
                {book.historyEntries.map((entry, index) => (
                  <div key={entry.id} className="relative pl-12">
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-2 w-8 h-8 bg-blue-600 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>

                    {/* Entry Content */}
                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-zinc-900 dark:text-white">
                            {entry.displayName || 'Anonymous Reader'}
                          </h3>
                          <p className="text-sm text-zinc-500 dark:text-zinc-500">
                            📍 {entry.city}
                          </p>
                        </div>
                        <p className="text-xs text-zinc-400 dark:text-zinc-600">
                          {new Date(entry.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>

                      {entry.readingDuration && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                          ⏱️ Reading duration: {entry.readingDuration}
                        </p>
                      )}

                      {entry.notes && (
                        <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            href={`/book/${bookId}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← View Book Details
          </Link>
        </div>
      </div>
    </div>
  )
}

