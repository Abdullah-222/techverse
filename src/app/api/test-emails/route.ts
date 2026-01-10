/**
 * Test Emails API Route
 * 
 * Allows testing all email templates.
 * Requires authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import {
  sendWelcomeEmail,
  sendExchangeRequestEmail,
  sendExchangeApprovedEmail,
  sendExchangeRejectedEmail,
  sendExchangeCompletedEmail,
  sendExchangeDisputedEmail,
  sendBookAddedEmail,
  sendInsufficientPointsEmail,
} from '@/lib/emailHelpers'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { emailType } = body

    if (!emailType) {
      return NextResponse.json(
        { success: false, error: 'emailType is required' },
        { status: 400 }
      )
    }

    // Test different email types
    switch (emailType) {
      case 'welcome':
        await sendWelcomeEmail(user.id)
        return NextResponse.json({
          success: true,
          message: 'Welcome email sent',
        })

      case 'exchange-request': {
        // Create a mock exchange for testing
        const mockBook = await prisma.book.findFirst({
          where: { currentOwnerId: { not: user.id } },
          select: { id: true },
        })

        if (!mockBook) {
          return NextResponse.json({
            success: false,
            error: 'No books available for testing. Add a book first.',
          })
        }

        // Create a temporary exchange for testing
        const testExchange = await prisma.exchange.create({
          data: {
            bookId: mockBook.id,
            fromUserId: (await prisma.book.findUnique({
              where: { id: mockBook.id },
              select: { currentOwnerId: true },
            }))!.currentOwnerId,
            toUserId: user.id,
            pointsUsed: 10,
            status: 'REQUESTED',
          },
        })

        await sendExchangeRequestEmail(testExchange.id)

        // Clean up test exchange
        await prisma.exchange.delete({ where: { id: testExchange.id } })

        return NextResponse.json({
          success: true,
          message: 'Exchange request email sent',
        })
      }

      case 'exchange-approved': {
        // Find or create a mock exchange
        const mockBook = await prisma.book.findFirst({
          where: { currentOwnerId: { not: user.id } },
          select: { id: true },
        })

        if (!mockBook) {
          return NextResponse.json({
            success: false,
            error: 'No books available for testing. Add a book first.',
          })
        }

        const ownerId = (
          await prisma.book.findUnique({
            where: { id: mockBook.id },
            select: { currentOwnerId: true },
          })
        )!.currentOwnerId

        const testExchange = await prisma.exchange.create({
          data: {
            bookId: mockBook.id,
            fromUserId: ownerId,
            toUserId: user.id,
            pointsUsed: 10,
            status: 'APPROVED',
          },
        })

        await sendExchangeApprovedEmail(testExchange.id)

        await prisma.exchange.delete({ where: { id: testExchange.id } })

        return NextResponse.json({
          success: true,
          message: 'Exchange approved email sent',
        })
      }

      case 'exchange-rejected': {
        const mockBook = await prisma.book.findFirst({
          where: { currentOwnerId: { not: user.id } },
          select: { id: true },
        })

        if (!mockBook) {
          return NextResponse.json({
            success: false,
            error: 'No books available for testing. Add a book first.',
          })
        }

        const ownerId = (
          await prisma.book.findUnique({
            where: { id: mockBook.id },
            select: { currentOwnerId: true },
          })
        )!.currentOwnerId

        const testExchange = await prisma.exchange.create({
          data: {
            bookId: mockBook.id,
            fromUserId: ownerId,
            toUserId: user.id,
            pointsUsed: 10,
            status: 'REJECTED',
          },
        })

        await sendExchangeRejectedEmail(testExchange.id)

        await prisma.exchange.delete({ where: { id: testExchange.id } })

        return NextResponse.json({
          success: true,
          message: 'Exchange rejected email sent',
        })
      }

      case 'exchange-completed': {
        const mockBook = await prisma.book.findFirst({
          where: { currentOwnerId: { not: user.id } },
          select: { id: true },
        })

        if (!mockBook) {
          return NextResponse.json({
            success: false,
            error: 'No books available for testing. Add a book first.',
          })
        }

        const ownerId = (
          await prisma.book.findUnique({
            where: { id: mockBook.id },
            select: { currentOwnerId: true },
          })
        )!.currentOwnerId

        const testExchange = await prisma.exchange.create({
          data: {
            bookId: mockBook.id,
            fromUserId: ownerId,
            toUserId: user.id,
            pointsUsed: 10,
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        })

        await sendExchangeCompletedEmail(testExchange.id)

        await prisma.exchange.delete({ where: { id: testExchange.id } })

        return NextResponse.json({
          success: true,
          message: 'Exchange completed email sent',
        })
      }

      case 'exchange-disputed': {
        const mockBook = await prisma.book.findFirst({
          where: { currentOwnerId: { not: user.id } },
          select: { id: true },
        })

        if (!mockBook) {
          return NextResponse.json({
            success: false,
            error: 'No books available for testing. Add a book first.',
          })
        }

        const ownerId = (
          await prisma.book.findUnique({
            where: { id: mockBook.id },
            select: { currentOwnerId: true },
          })
        )!.currentOwnerId

        const testExchange = await prisma.exchange.create({
          data: {
            bookId: mockBook.id,
            fromUserId: ownerId,
            toUserId: user.id,
            pointsUsed: 10,
            status: 'DISPUTED',
            completedAt: new Date(),
          },
        })

        await sendExchangeDisputedEmail(testExchange.id, 'Test dispute reason')

        await prisma.exchange.delete({ where: { id: testExchange.id } })

        return NextResponse.json({
          success: true,
          message: 'Exchange disputed email sent',
        })
      }

      case 'book-added': {
        // Find user's most recent book or create a mock one
        const userBook = await prisma.book.findFirst({
          where: { currentOwnerId: user.id },
          select: { id: true },
        })

        if (!userBook) {
          return NextResponse.json({
            success: false,
            error: 'No books found. Add a book first to test this email.',
          })
        }

        await sendBookAddedEmail(userBook.id, user.id)

        return NextResponse.json({
          success: true,
          message: 'Book added email sent',
        })
      }

      case 'insufficient-points': {
        await sendInsufficientPointsEmail(
          user.id,
          'Test Book Title',
          50,
          user.points
        )

        return NextResponse.json({
          success: true,
          message: 'Insufficient points email sent',
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid email type' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to send test email',
      },
      { status: 500 }
    )
  }
}

