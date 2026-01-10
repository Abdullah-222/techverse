# Ask This Book - AI Feature Documentation

## Overview

"Ask This Book" is an AI-powered feature that allows users to chat with a context-aware assistant about a specific book. The assistant uses book metadata and community knowledge to provide helpful, book-specific responses.

## Key Features

### 1. **Book-Specific Context**
- Each book has its own AI assistant
- Responses are tailored to the specific book
- Uses community notes from previous readers to enhance understanding

### 2. **Copyright Safety**
- Does NOT use full book text
- Does NOT invent quotes
- Does NOT reference specific page numbers or chapters
- Only uses publicly available metadata and community notes

### 3. **Anti-Hallucination Safeguards**
- AI explicitly states uncertainty when unsure
- Does not invent plot details
- Redirects requests for copyrighted content
- Validates and sanitizes all user input

### 4. **Server-Side Security**
- All Gemini API calls happen on the server
- API key never exposed to client
- Input validation and sanitization
- Error handling with user-friendly messages

## Architecture

### Components

1. **AI Service** (`src/lib/ask-book-ai.ts`)
   - Core logic for AI interactions
   - Prompt construction
   - Community notes compilation
   - Safety validation

2. **API Route** (`src/app/api/ask-book/route.ts`)
   - Server-side endpoint
   - Handles POST requests
   - Validates input
   - Returns AI responses

3. **UI Component** (`src/components/AskBookModal.tsx`)
   - Chat interface modal
   - Message display
   - Input handling
   - Loading states

4. **Integration** (`src/app/book/[id]/page.tsx`)
   - "Ask This Book" button
   - Modal state management
   - User interaction

## Data Sources

The AI assistant uses ONLY the following inputs:

1. **Book Metadata**
   - Title
   - Author
   - Description

2. **Community Knowledge**
   - Notes from Book History entries (previous readers)
   - Reading duration and location context

## Safety Features

### Input Validation
- Maximum question length: 500 characters
- Blocks obvious attempts to get copyrighted content
- Sanitizes all user input

### Response Limits
- Maximum response length: 2000 characters
- Prevents overly long responses
- Keeps interactions concise

### Content Filtering
- Rejects requests for full book text
- Blocks requests for copyrighted content
- Redirects inappropriate requests politely

## Usage

### For Users

1. Navigate to any book detail page
2. Click the "🤖 Ask This Book" button
3. Type your question in the chat interface
4. Receive AI-generated response based on book context
5. Continue conversation (up to 10 messages per session)

### Example Questions

- "What are the main themes of this book?"
- "Is this book suitable for beginners?"
- "What did other readers think about this book?"
- "Can you help me understand the ending?"
- "What reading level is this book?"

## Technical Details

### Prompt Structure

The system prompt includes:
- Book information (title, author, description)
- Community notes from previous readers
- Clear rules about copyright and spoilers
- Instructions for helpful, reader-friendly responses

### API Integration

- Uses existing Gemini API integration (`src/lib/gemini.ts`)
- Server-side only (no client-side API calls)
- Environment variable: `GEMINI_API_KEY`

### Session Management

- Stateless (no message persistence)
- Message limit: 10 messages per session
- No authentication required (read-only feature)
- Modal-based UI (easy to close and restart)

## Error Handling

- Graceful fallback if Gemini API fails
- User-friendly error messages
- No exposure of internal errors
- Logging for debugging (server-side only)

## Future Enhancements (Optional)

- Message persistence (optional)
- Streaming responses
- Conversation history
- Integration with forum discussions
- Multi-language support

## Demo Notes

This feature is perfect for hackathon demos because:
- ✅ Easy to explain (book-specific AI assistant)
- ✅ Visually impressive (chat interface)
- ✅ Demonstrates AI integration
- ✅ Shows community-driven features
- ✅ Copyright-safe implementation
- ✅ No complex setup required

## Files Created

1. `src/lib/ask-book-ai.ts` - AI service logic
2. `src/app/api/ask-book/route.ts` - API endpoint
3. `src/components/AskBookModal.tsx` - UI component
4. Updated `src/app/book/[id]/page.tsx` - Integration

## Testing Checklist

- [ ] Open book detail page
- [ ] Click "Ask This Book" button
- [ ] Verify modal opens
- [ ] Ask a question about the book
- [ ] Verify AI response appears
- [ ] Test multiple questions (up to 10)
- [ ] Verify message limit works
- [ ] Test error handling (invalid input)
- [ ] Test with books that have community notes
- [ ] Test with books without community notes
- [ ] Verify copyright safety (try requesting full text)

