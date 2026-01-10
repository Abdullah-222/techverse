/**
 * Exchanges Management Page
 * 
 * Shows:
 * - Pending exchange requests (for owners)
 * - User's exchange history
 * - Exchange status and actions
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import {
  getPendingExchangeRequestsAction,
  getUserExchangesAction,
  approveExchangeAction,
  rejectExchangeAction,
  cancelExchangeAction,
} from '@/app/actions/exchanges'

interface Exchange {
  id: string
  bookId: string
  fromUserId: string
  toUserId: string
  pointsUsed: number
  status: string
  createdAt: Date
  completedAt: Date | null
  book: {
    id: string
    title: string
    author: string
    condition: string
  }
  fromUser: {
    id: string
    name: string | null
    points?: number
  }
  toUser: {
    id: string
    name: string | null
    points?: number
  }
}

export default function ExchangesPage() {
  const { user, isAuthenticated } = useAuth()
  const [pendingRequests, setPendingRequests] = useState<Exchange[]>([])
  const [userExchanges, setUserExchanges] = useState<Exchange[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending')

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const [pendingResult, historyResult] = await Promise.all([
        getPendingExchangeRequestsAction(),
        getUserExchangesAction(),
      ])

      if (pendingResult.success) {
        setPendingRequests(pendingResult.exchanges || [])
      }

      if (historyResult.success) {
        setUserExchanges(historyResult.exchanges || [])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load exchanges')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (exchangeId: string) => {
    if (!confirm('Approve this exchange? Points will be deducted from the requester and transferred to you.')) {
      return
    }

    setError('')
    try {
      const result = await approveExchangeAction(exchangeId)

      if (!result.success) {
        setError(result.error || 'Failed to approve exchange')
        return
      }

      await loadData()
      alert('Exchange approved! Book ownership has been transferred.')
    } catch (err: any) {
      setError(err.message || 'Failed to approve exchange')
    }
  }

  const handleReject = async (exchangeId: string) => {
    if (!confirm('Reject this exchange request?')) {
      return
    }

    setError('')
    try {
      const result = await rejectExchangeAction(exchangeId)

      if (!result.success) {
        setError(result.error || 'Failed to reject exchange')
        return
      }

      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to reject exchange')
    }
  }

  const handleCancel = async (exchangeId: string) => {
    if (!confirm('Cancel this exchange request?')) {
      return
    }

    setError('')
    try {
      const result = await cancelExchangeAction(exchangeId)

      if (!result.success) {
        setError(result.error || 'Failed to cancel exchange')
        return
      }

      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to cancel exchange')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
      case 'APPROVED':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      case 'COMPLETED':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'REJECTED':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      case 'DISPUTED':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Please sign in to view your exchanges
          </p>
          <Link
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Exchanges
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your book exchanges
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-4 px-2 font-semibold transition-colors ${
                activeTab === 'pending'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Pending Requests ({pendingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-4 px-2 font-semibold transition-colors ${
                activeTab === 'history'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Exchange History ({userExchanges.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">Loading exchanges...</p>
          </div>
        ) : activeTab === 'pending' ? (
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <p className="text-zinc-600 dark:text-zinc-400">
                  No pending exchange requests
                </p>
              </div>
            ) : (
              pendingRequests.map((exchange) => (
                <div
                  key={exchange.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Link
                        href={`/book/${exchange.bookId}`}
                        className="text-xl font-bold text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {exchange.book.title}
                      </Link>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        by {exchange.book.author}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                        Requested by: {exchange.toUser.name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-500">
                        Points: {exchange.pointsUsed}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(exchange.status)}`}>
                      {exchange.status}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(exchange.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(exchange.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {userExchanges.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <p className="text-zinc-600 dark:text-zinc-400">
                  No exchange history
                </p>
              </div>
            ) : (
              userExchanges.map((exchange) => {
                const isRequester = exchange.toUserId === user?.id
                const isOwner = exchange.fromUserId === user?.id

                return (
                  <div
                    key={exchange.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Link
                          href={`/book/${exchange.bookId}`}
                          className="text-xl font-bold text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {exchange.book.title}
                        </Link>
                        <p className="text-zinc-600 dark:text-zinc-400">
                          by {exchange.book.author}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                          {isRequester
                            ? `You requested from ${exchange.fromUser.name || 'Anonymous'}`
                            : `${exchange.toUser.name || 'Anonymous'} requested from you`}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-500">
                          Points: {exchange.pointsUsed} | {isRequester ? 'Spent' : 'Earned'}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">
                          {new Date(exchange.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(exchange.status)}`}>
                        {exchange.status}
                      </span>
                    </div>
                    {exchange.status === 'REQUESTED' && isRequester && (
                      <button
                        onClick={() => handleCancel(exchange.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}

