# AI-Based Book Valuation System - Implementation Guide

## ✅ Completed Implementation

### 1. Database Schema
- ✅ Added `computedPoints` field to Book model (cached AI value)
- ✅ Added `pointsLastCalculatedAt` field for cache invalidation

### 2. Gemini API Integration
- ✅ Server-side Gemini API client (`src/lib/gemini.ts`)
- ✅ Secure API key handling (environment variable only)
- ✅ Error handling and fallback logic

### 3. AI Valuation Service
- ✅ Structured prompt with 3 signals only (condition, wishlist, rarity)
- ✅ Output validation and clamping (5-20 range)
- ✅ Deterministic fallback calculation
- ✅ Anti-abuse safeguards

### 4. Caching System
- ✅ Points cached in `Book.computedPoints`
- ✅ Recalculation triggers:
  - When book is created
  - When wishlist count changes significantly (every 3 items)
  - When rarity changes (new book with same title+author)
  - Manual recalculation

### 5. Exchange Integration
- ✅ Exchange system uses stored points (not computed on-the-fly)
- ✅ Ensures consistency during exchange
- ✅ Points calculated when book is created

## 🔑 Core Design Principles

### 1. Deterministic Output
- Always returns integer between 5-20
- No decimals or explanations
- Bounded range ensures fairness

### 2. Caching Strategy
- Points stored in database to avoid repeated API calls
- Recalculated only when signals change significantly
- Prevents point value changing mid-exchange

### 3. Fallback Logic
- If Gemini fails, uses deterministic heuristic
- Ensures system always produces a value
- Maintains fairness during API outages

### 4. Anti-Abuse
- Output strictly clamped to 5-20 range
- Inputs validated (no user-controlled free text)
- AI response validated before use

## 📊 Valuation Signals

### Inputs (Only 3)
1. **Condition**: POOR, FAIR, GOOD, EXCELLENT
2. **Wishlist Count**: Number of users who wishlisted the book
3. **Rarity**: Number of books with same title+author in database

### Output
- Single integer between 5-20
- No decimals
- No explanations

## 🔄 Valuation Flow

### Initial Calculation
1. Book is created
2. AI calculates points based on:
   - Condition (from form)
   - Wishlist count (initially 0)
   - Rarity (count of similar books)
3. Points cached in `Book.computedPoints`

### Recalculation Triggers
1. **Wishlist Changes**: Every 3 wishlist items added/removed
2. **Rarity Changes**: When new book with same title+author is added
3. **Manual**: Can be triggered via server action

### Exchange Usage
1. Exchange request uses stored `computedPoints`
2. Points are NOT recalculated during exchange
3. Ensures consistency and fairness

## 🛡️ Security & Anti-Abuse

### Input Validation
- ✅ Only 3 allowed signals (no user-controlled text)
- ✅ Condition is enum (cannot be manipulated)
- ✅ Wishlist count is system-calculated
- ✅ Rarity is system-calculated

### Output Validation
- ✅ Response parsed and validated
- ✅ Strictly clamped to 5-20 range
- ✅ Fallback used if validation fails

### API Security
- ✅ Gemini API key only on server
- ✅ Never exposed to client
- ✅ Environment variable required

## 💰 Fallback Calculation

If Gemini API fails, uses deterministic formula:

```
Base: 10 points
Condition multiplier:
  - EXCELLENT: 1.5x (15 points)
  - GOOD: 1.0x (10 points)
  - FAIR: 0.7x (7 points)
  - POOR: 0.5x (5 points)

Wishlist bonus: +1 per 3 items (max +3)
Rarity bonus: +1 if unique, +0.5 if rare (2-3 copies)

Final: Clamped to 5-20 range
```

## 🧪 Testing Checklist

### AI Valuation
- [ ] Book created → points calculated automatically
- [ ] Points displayed on book detail page
- [ ] Points used in exchange requests
- [ ] Gemini API called correctly
- [ ] Fallback works when API fails

### Caching
- [ ] Points cached after calculation
- [ ] Recalculation triggered on wishlist changes (every 3)
- [ ] Recalculation triggered on rarity changes
- [ ] Points don't change during exchange

### Validation
- [ ] Output clamped to 5-20 range
- [ ] Invalid AI responses use fallback
- [ ] Points are always integers

### Integration
- [ ] Exchange system uses stored points
- [ ] Book detail page shows AI-calculated points
- [ ] Points update when signals change

## 🚀 Setup Instructions

### 1. Environment Variable
Add to `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key
```

Get API key from: https://makersuite.google.com/app/apikey

### 2. Database Migration
```bash
npx prisma migrate dev --name add_ai_valuation
npx prisma generate
```

### 3. Test the System
1. Create a book → points should be calculated
2. Add to wishlist → points may recalculate (every 3 items)
3. Request exchange → uses stored points
4. Check book detail → shows AI-calculated points

## 📝 Important Notes

1. **Caching is Critical**: Points are cached to ensure consistency during exchanges and reduce API costs.

2. **Recalculation Triggers**: Points are recalculated when signals change significantly, not on every small change.

3. **Exchange Consistency**: Exchange system uses stored points, not computed on-the-fly. This ensures fairness.

4. **Fallback Always Works**: Even if Gemini API fails, the system produces a fair value using the deterministic formula.

5. **No User Manipulation**: Only system-calculated signals are used. Users cannot manipulate point values.

## 🎯 Judge-Friendly Features

- **Explainable**: Clear signals (condition, demand, rarity)
- **Fair**: Bounded range (5-20) ensures fairness
- **Resistant to Abuse**: No user-controlled inputs
- **Reliable**: Fallback ensures system always works
- **Efficient**: Caching reduces API calls and costs

---

**Status**: ✅ Ready for testing

All AI valuation functionality is implemented and ready for testing. Follow the setup instructions and testing checklist to verify everything works correctly.

