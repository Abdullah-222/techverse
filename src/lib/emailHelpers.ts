/**
 * Email Helper Functions
 * 
 * Event-specific email sending functions.
 * These are called from the appropriate places in the application.
 * 
 * All functions are non-blocking and fail gracefully.
 */

import { sendEmailAsync } from './sendEmail'
import {
  getWelcomeEmailTemplate,
  getExchangeRequestEmailTemplate,
  getExchangeApprovedEmailTemplate,
  getExchangeRejectedEmailTemplate,
  getExchangeCompletedEmailTemplate,
  getExchangeDisputedEmailTemplate,
  getBookAddedEmailTemplate,
  getInsufficientPointsEmailTemplate,
} from './emailTemplates'
import { prisma } from './prisma'

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })

    if (!user) {
      console.warn('User not found for welcome email:', userId)
      return
    }

    sendEmailAsync({
      to: user.email,
      subject: 'Welcome to BooksExchange! 📚',
      html: getWelcomeEmailTemplate({
        userName: user.name,
        userEmail: user.email,
      }),
    })
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }
}

/**
 * Send exchange request notification to book owner
 */
export async function sendExchangeRequestEmail(exchangeId: string) {
  try {
    const exchange = await prisma.exchange.findUnique({
      where: { id: exchangeId },
      include: {
        book: {
          select: {
            title: true,
            author: true,
          },
        },
        fromUser: {
          select: {
            email: true,
            name: true,
          },
        },
        toUser: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!exchange) {
      console.warn('Exchange not found for email:', exchangeId)
      return
    }

    sendEmailAsync({
      to: exchange.fromUser.email,
      subject: `New Exchange Request: ${exchange.book.title}`,
      html: getExchangeRequestEmailTemplate({
        ownerName: exchange.fromUser.name,
        requesterName: exchange.toUser.name,
        bookTitle: exchange.book.title,
        bookAuthor: exchange.book.author,
        points: exchange.pointsUsed,
        exchangeId: exchange.id,
      }),
    })
  } catch (error) {
    console.error('Error sending exchange request email:', error)
  }
}

/**
 * Send exchange approved notification to requester
 */
export async function sendExchangeApprovedEmail(exchangeId: string) {
  try {
    const exchange = await prisma.exchange.findUnique({
      where: { id: exchangeId },
      include: {
        book: {
          select: {
            title: true,
            author: true,
          },
        },
        fromUser: {
          select: {
            name: true,
          },
        },
        toUser: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (!exchange) {
      console.warn('Exchange not found for email:', exchangeId)
      return
    }

    sendEmailAsync({
      to: exchange.toUser.email,
      subject: `Exchange Approved: ${exchange.book.title} ✅`,
      html: getExchangeApprovedEmailTemplate({
        requesterName: exchange.toUser.name,
        ownerName: exchange.fromUser.name,
        bookTitle: exchange.book.title,
        bookAuthor: exchange.book.author,
        points: exchange.pointsUsed,
        exchangeId: exchange.id,
      }),
    })
  } catch (error) {
    console.error('Error sending exchange approved email:', error)
  }
}

/**
 * Send exchange rejected notification to requester
 */
export async function sendExchangeRejectedEmail(exchangeId: string) {
  try {
    const exchange = await prisma.exchange.findUnique({
      where: { id: exchangeId },
      include: {
        book: {
          select: {
            title: true,
            author: true,
          },
        },
        fromUser: {
          select: {
            name: true,
          },
        },
        toUser: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (!exchange) {
      console.warn('Exchange not found for email:', exchangeId)
      return
    }

    sendEmailAsync({
      to: exchange.toUser.email,
      subject: `Exchange Request Rejected: ${exchange.book.title}`,
      html: getExchangeRejectedEmailTemplate({
        requesterName: exchange.toUser.name,
        ownerName: exchange.fromUser.name,
        bookTitle: exchange.book.title,
        bookAuthor: exchange.book.author,
      }),
    })
  } catch (error) {
    console.error('Error sending exchange rejected email:', error)
  }
}

/**
 * Send exchange completed notification to both parties
 */
export async function sendExchangeCompletedEmail(exchangeId: string) {
  try {
    const exchange = await prisma.exchange.findUnique({
      where: { id: exchangeId },
      include: {
        book: {
          select: {
            title: true,
            author: true,
          },
        },
        fromUser: {
          select: {
            email: true,
            name: true,
          },
        },
        toUser: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (!exchange) {
      console.warn('Exchange not found for email:', exchangeId)
      return
    }

    // Send to owner (earned points)
    sendEmailAsync({
      to: exchange.fromUser.email,
      subject: `Exchange Completed: ${exchange.book.title} 🎉`,
      html: getExchangeCompletedEmailTemplate({
        userName: exchange.fromUser.name,
        otherPartyName: exchange.toUser.name,
        bookTitle: exchange.book.title,
        bookAuthor: exchange.book.author,
        points: exchange.pointsUsed,
        isOwner: true,
      }),
    })

    // Send to requester (spent points)
    sendEmailAsync({
      to: exchange.toUser.email,
      subject: `Exchange Completed: ${exchange.book.title} 🎉`,
      html: getExchangeCompletedEmailTemplate({
        userName: exchange.toUser.name,
        otherPartyName: exchange.fromUser.name,
        bookTitle: exchange.book.title,
        bookAuthor: exchange.book.author,
        points: exchange.pointsUsed,
        isOwner: false,
      }),
    })
  } catch (error) {
    console.error('Error sending exchange completed email:', error)
  }
}

/**
 * Send exchange disputed notification to both parties
 */
export async function sendExchangeDisputedEmail(
  exchangeId: string,
  reason: string
) {
  try {
    const exchange = await prisma.exchange.findUnique({
      where: { id: exchangeId },
      include: {
        book: {
          select: {
            title: true,
          },
        },
        fromUser: {
          select: {
            email: true,
            name: true,
          },
        },
        toUser: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (!exchange) {
      console.warn('Exchange not found for email:', exchangeId)
      return
    }

    // Send to owner
    sendEmailAsync({
      to: exchange.fromUser.email,
      subject: `Exchange Disputed: ${exchange.book.title} ⚠️`,
      html: getExchangeDisputedEmailTemplate({
        userName: exchange.fromUser.name,
        otherPartyName: exchange.toUser.name,
        bookTitle: exchange.book.title,
        reason,
        exchangeId: exchange.id,
      }),
    })

    // Send to requester
    sendEmailAsync({
      to: exchange.toUser.email,
      subject: `Exchange Disputed: ${exchange.book.title} ⚠️`,
      html: getExchangeDisputedEmailTemplate({
        userName: exchange.toUser.name,
        otherPartyName: exchange.fromUser.name,
        bookTitle: exchange.book.title,
        reason,
        exchangeId: exchange.id,
      }),
    })
  } catch (error) {
    console.error('Error sending exchange disputed email:', error)
  }
}

/**
 * Send book added successfully notification
 */
export async function sendBookAddedEmail(bookId: string, userId: string) {
  try {
    const [book, user] = await Promise.all([
      prisma.book.findUnique({
        where: { id: bookId },
        select: { title: true, author: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      }),
    ])

    if (!book || !user) {
      console.warn('Book or user not found for email:', { bookId, userId })
      return
    }

    sendEmailAsync({
      to: user.email,
      subject: `Book Added: ${book.title} 📚`,
      html: getBookAddedEmailTemplate({
        userName: user.name,
        bookTitle: book.title,
        bookAuthor: book.author,
        bookId: book.id,
      }),
    })
  } catch (error) {
    console.error('Error sending book added email:', error)
  }
}

/**
 * Send insufficient points notification
 */
export async function sendInsufficientPointsEmail(
  userId: string,
  bookTitle: string,
  requiredPoints: number,
  currentPoints: number
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })

    if (!user) {
      console.warn('User not found for insufficient points email:', userId)
      return
    }

    sendEmailAsync({
      to: user.email,
      subject: `Insufficient Points for ${bookTitle}`,
      html: getInsufficientPointsEmailTemplate({
        userName: user.name,
        bookTitle,
        requiredPoints,
        currentPoints,
      }),
    })
  } catch (error) {
    console.error('Error sending insufficient points email:', error)
  }
}

