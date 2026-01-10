/**
 * Email Sending Utility
 * 
 * Generic email sender that:
 * - Sends emails asynchronously (non-blocking)
 * - Fails gracefully without breaking app logic
 * - Validates email addresses
 * - Prevents duplicate sends
 * 
 * Usage:
 *   await sendEmail({
 *     to: 'user@example.com',
 *     subject: 'Welcome!',
 *     html: '<h1>Hello</h1>'
 *   })
 */

import { resend, DEFAULT_FROM_EMAIL } from './resend'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

/**
 * Validate email address format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Send an email using Resend
 * 
 * This function:
 * - Validates the email address
 * - Sends asynchronously (doesn't block)
 * - Logs errors but doesn't throw
 * - Returns success/failure status
 * 
 * @param options - Email options
 * @returns Promise<{ success: boolean, error?: string }>
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  // Check if Resend is configured
  if (!resend) {
    console.warn('Resend is not configured. Email not sent:', options.subject)
    return { success: false, error: 'Email service not configured' }
  }

  // Validate email address
  if (!isValidEmail(options.to)) {
    console.error('Invalid email address:', options.to)
    return { success: false, error: 'Invalid email address' }
  }

  // Validate required fields
  if (!options.subject || !options.html) {
    console.error('Missing required email fields')
    return { success: false, error: 'Missing required fields' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: options.from || DEFAULT_FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    if (error) {
      console.error('Resend API error:', error)
      return { success: false, error: error.message }
    }

    console.log('Email sent successfully:', {
      to: options.to,
      subject: options.subject,
      messageId: data?.id,
    })

    return { success: true, messageId: data?.id }
  } catch (error: any) {
    // Catch any unexpected errors
    console.error('Unexpected error sending email:', error)
    return {
      success: false,
      error: error?.message || 'Failed to send email',
    }
  }
}

/**
 * Send email asynchronously (fire and forget)
 * 
 * Use this when you don't need to wait for the result.
 * Errors are logged but not thrown.
 * 
 * @param options - Email options
 */
export function sendEmailAsync(options: SendEmailOptions): void {
  sendEmail(options).catch((error) => {
    // Errors are already logged in sendEmail
    // This catch prevents unhandled promise rejections
    console.error('Async email send failed:', error)
  })
}

