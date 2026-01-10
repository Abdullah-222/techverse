/**
 * Email Templates
 * 
 * Reusable email templates for transactional emails.
 * Templates are simple HTML with minimal styling.
 * 
 * Tone: Friendly, professional, community-driven
 */

import { APP_BASE_URL } from './resend'

/**
 * Welcome email template
 */
export function getWelcomeEmailTemplate(data: {
  userName: string | null
  userEmail: string
}) {
  const name = data.userName || 'there'
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to BooksExchange</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📚 Welcome to BooksExchange!</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Welcome to BooksExchange! We're excited to have you join our community of book lovers.
          </p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            You've received <strong>20 points</strong> to get started. Use them to request books from other members!
          </p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              <strong>Getting Started:</strong><br>
              • Browse books in the community<br>
              • Request exchanges using your points<br>
              • Share your own books to earn more points
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_BASE_URL}/books" style="display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Browse Books
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Happy reading!<br>
            The BooksExchange Team
          </p>
        </div>
      </body>
    </html>
  `
}

/**
 * Exchange request notification (to book owner)
 */
export function getExchangeRequestEmailTemplate(data: {
  ownerName: string | null
  requesterName: string | null
  bookTitle: string
  bookAuthor: string
  points: number
  exchangeId: string
}) {
  const ownerName = data.ownerName || 'there'
  const requesterName = data.requesterName || 'Someone'
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Exchange Request</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📖 New Exchange Request</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${ownerName},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            <strong>${requesterName}</strong> has requested to exchange your book:
          </p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0; font-size: 18px; font-weight: 600;">${data.bookTitle}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">by ${data.bookAuthor}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #059669;">
              <strong>${data.points} points</strong>
            </p>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            You can approve or reject this request from your exchanges page.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_BASE_URL}/exchanges" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              View Exchange
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Best regards,<br>
            BooksExchange
          </p>
        </div>
      </body>
    </html>
  `
}

/**
 * Exchange approved notification (to requester)
 */
export function getExchangeApprovedEmailTemplate(data: {
  requesterName: string | null
  ownerName: string | null
  bookTitle: string
  bookAuthor: string
  points: number
  exchangeId: string
}) {
  const requesterName = data.requesterName || 'there'
  const ownerName = data.ownerName || 'the owner'
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Exchange Approved!</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✅ Exchange Approved!</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${requesterName},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Great news! <strong>${ownerName}</strong> has approved your exchange request for:
          </p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0; font-size: 18px; font-weight: 600;">${data.bookTitle}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">by ${data.bookAuthor}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #059669;">
              <strong>${data.points} points</strong> deducted
            </p>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            The book is now yours! You can view it in your books collection.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_BASE_URL}/books" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              View My Books
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Happy reading!<br>
            BooksExchange
          </p>
        </div>
      </body>
    </html>
  `
}

/**
 * Exchange rejected notification (to requester)
 */
export function getExchangeRejectedEmailTemplate(data: {
  requesterName: string | null
  ownerName: string | null
  bookTitle: string
  bookAuthor: string
}) {
  const requesterName = data.requesterName || 'there'
  const ownerName = data.ownerName || 'the owner'
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Exchange Request Rejected</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Exchange Request Rejected</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${requesterName},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Unfortunately, <strong>${ownerName}</strong> has rejected your exchange request for:
          </p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <p style="margin: 0; font-size: 18px; font-weight: 600;">${data.bookTitle}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">by ${data.bookAuthor}</p>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Don't worry! Your points were not deducted. You can browse other books and make new requests.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_BASE_URL}/books" style="display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Browse More Books
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Best regards,<br>
            BooksExchange
          </p>
        </div>
      </body>
    </html>
  `
}

/**
 * Exchange completed notification (to both parties)
 */
export function getExchangeCompletedEmailTemplate(data: {
  userName: string | null
  otherPartyName: string | null
  bookTitle: string
  bookAuthor: string
  points: number
  isOwner: boolean
}) {
  const userName = data.userName || 'there'
  const otherPartyName = data.otherPartyName || 'the other party'
  const action = data.isOwner ? 'earned' : 'spent'
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Exchange Completed</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Exchange Completed!</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Your exchange with <strong>${otherPartyName}</strong> has been completed!
          </p>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; font-size: 18px; font-weight: 600;">${data.bookTitle}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">by ${data.bookAuthor}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #2563eb;">
              <strong>${data.points} points</strong> ${action}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_BASE_URL}/exchanges" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              View Exchange Details
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Thank you for using BooksExchange!<br>
            BooksExchange Team
          </p>
        </div>
      </body>
    </html>
  `
}

/**
 * Exchange disputed notification
 */
export function getExchangeDisputedEmailTemplate(data: {
  userName: string | null
  otherPartyName: string | null
  bookTitle: string
  reason: string
  exchangeId: string
}) {
  const userName = data.userName || 'there'
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Exchange Disputed</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Exchange Disputed</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            An exchange has been marked as disputed:
          </p>
          
          <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-size: 18px; font-weight: 600;">${data.bookTitle}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
              <strong>Reason:</strong> ${data.reason}
            </p>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Our team will review this dispute and get back to you soon. Points and ownership are temporarily frozen until resolution.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_BASE_URL}/exchanges" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              View Exchange
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            We'll keep you updated,<br>
            BooksExchange Support Team
          </p>
        </div>
      </body>
    </html>
  `
}

/**
 * Book added successfully notification
 */
export function getBookAddedEmailTemplate(data: {
  userName: string | null
  bookTitle: string
  bookAuthor: string
  bookId: string
}) {
  const name = data.userName || 'there'
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Book Added Successfully</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📚 Book Added!</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Your book has been successfully added to BooksExchange:
          </p>
          
          <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
            <p style="margin: 0; font-size: 18px; font-weight: 600;">${data.bookTitle}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">by ${data.bookAuthor}</p>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Your book is now available for exchange! Other members can request it using their points.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_BASE_URL}/book/${data.bookId}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              View Your Book
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Happy sharing!<br>
            BooksExchange
          </p>
        </div>
      </body>
    </html>
  `
}

/**
 * Insufficient points notification
 */
export function getInsufficientPointsEmailTemplate(data: {
  userName: string | null
  bookTitle: string
  requiredPoints: number
  currentPoints: number
}) {
  const name = data.userName || 'there'
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Insufficient Points</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Insufficient Points</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            You tried to request <strong>${data.bookTitle}</strong>, but you don't have enough points.
          </p>
          
          <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-size: 14px;">
              <strong>Required:</strong> ${data.requiredPoints} points<br>
              <strong>You have:</strong> ${data.currentPoints} points<br>
              <strong>Need:</strong> ${data.requiredPoints - data.currentPoints} more points
            </p>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Share your own books to earn more points! Each exchange earns you points equal to your book's value.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_BASE_URL}/add-book" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Add a Book
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Best regards,<br>
            BooksExchange
          </p>
        </div>
      </body>
    </html>
  `
}

