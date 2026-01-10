'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function TestEmailsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, any>>({})

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white pt-28 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-zinc-600 mb-4">Please sign in to test emails</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const testEmail = async (emailType: string) => {
    setLoading(emailType)
    setResults((prev) => ({ ...prev, [emailType]: null }))

    try {
      const response = await fetch('/api/test-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailType }),
      })

      const data = await response.json()
      setResults((prev) => ({ ...prev, [emailType]: data }))
    } catch (error: any) {
      setResults((prev) => ({
        ...prev,
        [emailType]: { success: false, error: error.message },
      }))
    } finally {
      setLoading(null)
    }
  }

  const emailTests = [
    {
      id: 'welcome',
      name: 'Welcome Email',
      description: 'Test welcome email sent on signup',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      id: 'exchange-request',
      name: 'Exchange Request',
      description: 'Test email when someone requests your book',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      id: 'exchange-approved',
      name: 'Exchange Approved',
      description: 'Test email when your exchange request is approved',
      color: 'bg-emerald-500 hover:bg-emerald-600',
    },
    {
      id: 'exchange-rejected',
      name: 'Exchange Rejected',
      description: 'Test email when your exchange request is rejected',
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      id: 'exchange-completed',
      name: 'Exchange Completed',
      description: 'Test email when an exchange is completed',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      id: 'exchange-disputed',
      name: 'Exchange Disputed',
      description: 'Test email when an exchange is disputed',
      color: 'bg-yellow-500 hover:bg-yellow-600',
    },
    {
      id: 'book-added',
      name: 'Book Added',
      description: 'Test email when you successfully add a book',
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      id: 'insufficient-points',
      name: 'Insufficient Points',
      description: 'Test email when you try to request a book without enough points',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ]

  return (
    <div className="min-h-screen bg-white pt-28 pb-16 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            📧 Email Testing
          </h1>
          <p className="text-zinc-600">
            Test all email templates. Emails will be sent to: <strong>{user?.email}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {emailTests.map((test) => (
            <div
              key={test.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                {test.name}
              </h3>
              <p className="text-sm text-zinc-600 mb-4">{test.description}</p>
              
              <button
                onClick={() => testEmail(test.id)}
                disabled={loading === test.id}
                className={`w-full py-2.5 px-4 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${test.color}`}
              >
                {loading === test.id ? 'Sending...' : 'Send Test Email'}
              </button>

              {results[test.id] && (
                <div
                  className={`mt-4 p-3 rounded-lg text-sm ${
                    results[test.id].success
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {results[test.id].success ? (
                    <div>
                      <p className="font-semibold">✅ Email sent successfully!</p>
                      {results[test.id].messageId && (
                        <p className="text-xs mt-1">
                          Message ID: {results[test.id].messageId}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold">❌ Failed to send email</p>
                      <p className="text-xs mt-1">{results[test.id].error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📝 Testing Notes
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>
              • Check your email inbox (and spam folder) for test emails
            </li>
            <li>
              • Some emails require exchange/book data - they'll use mock data
            </li>
            <li>
              • Check browser console for detailed logs
            </li>
            <li>
              • Verify <code className="bg-blue-100 px-1 rounded">RESEND_SECRET_KEY</code> is set in environment variables
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

