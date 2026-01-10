/**
 * "Ask This Book" AI Service
 * 
 * This module provides an AI assistant for individual books.
 * The assistant is context-aware and uses:
 * - Book metadata (title, author, description)
 * - Community knowledge (notes from previous readers)
 * 
 * CRITICAL DESIGN PRINCIPLES:
 * 
 * 1. Book-Specific Context:
 *    - Each book has its own AI assistant
 *    - Responses are tailored to the specific book
 *    - Uses community notes to enhance understanding
 * 
 * 2. Copyright Safety:
 *    - Does NOT use full book text
 *    - Does NOT invent quotes
 *    - Does NOT reference specific page numbers or chapters
 *    - Only uses publicly available metadata and community notes
 * 
 * 3. Anti-Hallucination:
 *    - If unsure, AI explicitly states uncertainty
 *    - Does not invent plot details
 *    - Redirects requests for copyrighted content
 * 
 * 4. Server-Side Only:
 *    - All Gemini API calls happen on the server
 *    - API key never exposed to client
 *    - Input validation and sanitization
 */

import { callGeminiAPI } from './gemini'
import { prisma } from './prisma'

/**
 * Maximum question length (characters)
 * Prevents abuse and keeps responses manageable
 */
const MAX_QUESTION_LENGTH = 500

/**
 * Maximum response length (characters)
 * Keeps responses concise and readable
 */
const MAX_RESPONSE_LENGTH = 2000

/**
 * Compile community notes from book history entries
 * 
 * Extracts notes from previous readers to provide context to the AI.
 * This helps the AI understand:
 * - What readers found interesting
 * - Common themes or questions
 * - Reading experiences
 * 
 * @param bookId - Book UUID
 * @returns Compiled notes string
 */
async function compileCommunityNotes(bookId: string): Promise<string> {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      historyEntries: {
        where: {
          notes: {
            not: null,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10, // Limit to most recent 10 entries with notes
      },
    },
  })

  if (!book || book.historyEntries.length === 0) {
    return 'No community notes available yet.'
  }

  // Compile notes from history entries
  const notes = book.historyEntries
    .map((entry) => {
      const parts: string[] = []
      if (entry.city) {
        parts.push(`Location: ${entry.city}`)
      }
      if (entry.readingDuration) {
        parts.push(`Reading duration: ${entry.readingDuration}`)
      }
      if (entry.notes) {
        parts.push(`Notes: ${entry.notes}`)
      }
      return parts.length > 0 ? `- ${parts.join(', ')}` : null
    })
    .filter(Boolean)
    .join('\n')

  return notes || 'No detailed community notes available yet.'
}

/**
 * Construct the system prompt for the book assistant
 * 
 * This prompt sets the context and rules for the AI assistant.
 * It ensures:
 * - Book-specific responses
 * - No spoilers (unless requested)
 * - No hallucination
 * - Helpful and reader-friendly tone
 * 
 * @param bookMetadata - Book information
 * @param communityNotes - Compiled notes from previous readers
 * @returns System prompt string
 */
function constructSystemPrompt(
  bookMetadata: {
    title: string
    author: string
    description: string | null
  },
  communityNotes: string
): string {
  return `You are an AI assistant helping readers understand and engage with a specific book.

Book Information:
Title: ${bookMetadata.title}
Author: ${bookMetadata.author}
Description: ${bookMetadata.description || 'No description available.'}

Community Notes from Previous Readers:
${communityNotes}

IMPORTANT RULES:
1. Answer questions clearly and concisely
2. Avoid spoilers unless the user explicitly requests them
3. If you are unsure about something, explicitly state that you are unsure
4. Do NOT invent quotes from the book
5. Do NOT reference specific page numbers or chapters (we don't have the full text)
6. Do NOT provide copyrighted content
7. Keep responses helpful, reader-friendly, and encouraging
8. Use the community notes to provide additional context when relevant
9. If asked for full book text or copyrighted content, politely explain that you can only discuss themes, general plot, and community insights
10. Keep responses under ${MAX_RESPONSE_LENGTH} characters

You can help with:
- Understanding themes and messages
- Reading guidance and recommendations
- Interpretations and analysis
- Determining if the book suits their reading level
- Non-spoiler questions about the book
- General discussion about the book's impact

Remember: You are discussing this specific book, not a generic assistant.`
}

/**
 * Validate and sanitize user question
 * 
 * Safety checks:
 * - Length limits
 * - Basic content filtering
 * - Prevents abuse
 * 
 * @param question - User's question
 * @returns Sanitized question or throws error
 */
function validateQuestion(question: string): string {
  // Trim whitespace
  const trimmed = question.trim()

  // Check length
  if (trimmed.length === 0) {
    throw new Error('Question cannot be empty')
  }

  if (trimmed.length > MAX_QUESTION_LENGTH) {
    throw new Error(
      `Question is too long. Maximum ${MAX_QUESTION_LENGTH} characters allowed.`
    )
  }

  // Basic content check - reject obvious attempts to get copyrighted content
  const lowerQuestion = trimmed.toLowerCase()
  const blockedPatterns = [
    'send me the full book',
    'give me the entire text',
    'copy the whole book',
    'paste the complete',
  ]

  for (const pattern of blockedPatterns) {
    if (lowerQuestion.includes(pattern)) {
      throw new Error(
        'I cannot provide copyrighted book content. I can help you understand themes, discuss the book, or answer questions about it.'
      )
    }
  }

  return trimmed
}

/**
 * Ask a question about a specific book
 * 
 * This is the main function that:
 * 1. Validates the question
 * 2. Gets book metadata
 * 3. Compiles community notes
 * 4. Constructs the prompt
 * 5. Calls Gemini API
 * 6. Returns the response
 * 
 * @param bookId - Book UUID
 * @param question - User's question
 * @returns AI response
 */
export async function askBookQuestion(
  bookId: string,
  question: string
): Promise<string> {
  // Validate question
  const sanitizedQuestion = validateQuestion(question)

  // Get book metadata
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: {
      id: true,
      title: true,
      author: true,
      description: true,
    },
  })

  if (!book) {
    throw new Error('Book not found')
  }

  // Compile community notes
  const communityNotes = await compileCommunityNotes(bookId)

  // Construct system prompt
  const systemPrompt = constructSystemPrompt(
    {
      title: book.title,
      author: book.author,
      description: book.description,
    },
    communityNotes
  )

  // Construct full prompt with user question
  const fullPrompt = `${systemPrompt}

User Question: ${sanitizedQuestion}

Please provide a helpful response:`

  try {
    // Call Gemini API
    let response = await callGeminiAPI(fullPrompt)

    // Clamp response length
    if (response.length > MAX_RESPONSE_LENGTH) {
      response = response.substring(0, MAX_RESPONSE_LENGTH) + '...'
    }

    return response.trim()
  } catch (error: any) {
    // Handle Gemini API errors gracefully
    console.error('Ask Book AI error:', error)

    // Return user-friendly error message
    throw new Error(
      'Unable to get AI response at this time. Please try again later.'
    )
  }
}

