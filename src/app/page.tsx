'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function Home() {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
              Welcome{user ? `, ${user.name || user.email}` : ''}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              {user ? 'Manage your uploads and account' : 'Get started by signing in'}
            </p>
          </div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/login"
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Content */}
        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/upload"
              className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">📤</div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                Upload Image
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Upload images to your Supabase storage bucket
              </p>
            </Link>

            <Link
              href="/upload-video"
              className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">🎥</div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                Upload Video
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Upload videos to your Supabase storage bucket
              </p>
            </Link>

            <Link
              href="/chat"
              className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">💬</div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                Chat Rooms
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Join chat rooms and start conversations
              </p>
            </Link>

            <Link
              href="/send-email"
              className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">📧</div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                Send Email
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Send emails using Resend to logged in users
              </p>
            </Link>

            <Link
              href="/stripe"
              className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">💳</div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                Stripe Checkout
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Create payment checkout sessions with Stripe
              </p>
            </Link>

            <Link
              href="/meeting"
              className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">🎥</div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                Video Meeting
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Join 100ms video streaming meetings
              </p>
            </Link>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Please sign in to access the upload features
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/login"
                className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
