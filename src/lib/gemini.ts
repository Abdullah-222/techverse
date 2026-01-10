/**
 * Google Gemini API Integration
 * 
 * This module provides server-side access to Google Gemini API for AI-based book valuation.
 * 
 * CRITICAL SECURITY:
 * - API key is NEVER exposed to client
 * - All calls happen server-side only
 * - Environment variable: GEMINI_API_KEY
 * 
 * Why AI for valuation:
 * - Dynamic pricing based on real demand signals
 * - Fair and resistant to manipulation
 * - Adapts to community preferences
 * - More sophisticated than fixed pricing
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

/**
 * Call Google Gemini API
 * 
 * @param prompt - The prompt to send to Gemini
 * @returns Response from Gemini API
 */
export async function callGeminiAPI(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }

  try {
    const response = await fetch(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
      )
    }

    const data = await response.json()

    // Extract text from Gemini response
    // Response structure: data.candidates[0].content.parts[0].text
    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text
    ) {
      return data.candidates[0].content.parts[0].text.trim()
    }

    throw new Error('Invalid response format from Gemini API')
  } catch (error: any) {
    console.error('Gemini API call failed:', error)
    throw error
  }
}

