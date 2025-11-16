# Testing Guide: Auto Winner Selection & Prize Distribution

## Overview
This feature allows tournament organizers to automatically declare results by randomly selecting 3 winners from participants and distributing prizes according to the configured prize distribution ratio.

## Changes Made

### Backend (`routes/tournaments.js`)
- **POST `/tables/tournaments/:id/declare-result`** route completely rewritten:
  - ✅ Validates organizer ownership and timing requirements
  - ✅ Checks minimum 3 participants requirement
  - ✅ Parses `prizeDistribution` ratio (e.g., "60-30-10")
  - ✅ Randomly shuffles participants array
  - ✅ Selects first 3 as winners
  - ✅ Calculates prize amounts proportionally
  - ✅ Credits player wallets with prizes
  - ✅ Creates transaction records
  - ✅ Deducts from organizer locked prize pool
  - ✅ Sets `resultsVisible=true` for public display
  - ✅ Updates tournament status to 'completed'

### Database Schema (`models/Tournament.js`)
- Added `resultDeclaredAt: Date` field
- Added `resultsVisible: Boolean` field (default: false)

### Frontend (`tournament.html`)
1. **Public Winners Display** (visible to everyone):
   - New section shows when `resultsVisible===true`
   - Displays winners with medals (🥇🥈🥉)
   - Shows player name, position, and prize amount
   - Styled with gradient cards and hover effects

2. **Simplified Organizer UI**:
   - Removed manual winner input fields (playerId, playerName, prize)
   - Single "Declare Results (Auto-Select Winners)" button
   - Shows participant count and distribution ratio in note
   - Confirmation dialog before triggering
   - Disabled after results declared

## Testing Steps

### Prerequisites
1. Server running on port 3001: `npm start`
2. MongoDB connected
3. Seed data loaded (organizer ORG001, player PLY001, sample tournaments)

### Test Scenario 1: Create Tournament & Verify Setup
```bash
# 1. Login as organizer (ORG001)
# 2. Create a tournament with:
#    - Prize Pool: 10000
#    - Entry Fee: 100
#    - Prize Distribution: 60-30-10 (default)
#    - Max Teams: 10
#    - Registration Deadline: 30 minutes from now
#    - Start Date: 1 hour from now
# 3. Note the tournament ID
```

### Test Scenario 2: Register Multiple Players
```bash
# Need at least 3 participants to test winner selection
# Option A: Manually (if you have 3+ player accounts)
# 1. Login as player 1, join tournament
# 2. Login as player 2, join tournament  
# 3. Login as player 3, join tournament

# Option B: Use seed script with multiple players
# Modify seed.js to create 5 test players and auto-register them
```

### Test Scenario 3: Trigger Result Declaration
```bash
# 1. Wait for match end time (or set endDate to past in DB for testing)
# 2. Login as organizer who created the tournament
# 3. Visit tournament detail page
# 4. Scroll to "Organizer Actions" section
# 5. Verify "Declare Result" block appears with:
#    - Participant count message
#    - Prize distribution ratio (60-30-10)
#    - "Declare Results (Auto-Select Winners)" button enabled
# 6. Click the button
# 7. Confirm the dialog
# 8. Verify success toast message
```

### Test Scenario 4: Verify Results
**Backend Validation (MongoDB):**
```javascript
// Check tournament document
db.tournaments.findOne({id: "<tournament-id>"})
// Verify:
// - winners array has 3 entries
// - Each winner has: position, playerId, playerName, prize
// - resultsVisible: true
// - resultDeclaredAt: <timestamp>
// - status: 'completed'
// - prizeLocked reduced by total prize amount
```

**Check Player Wallets:**
```javascript
// Winners should have increased wallet balance
db.players.find({id: {$in: [<winner1_id>, <winner2_id>, <winner3_id>]}})
// Verify walletBalance increased by prize amount
```

**Check Organizer:**
```javascript
db.organizers.findOne({id: "<organizer-id>"})
// Verify lockedPrizePool reduced by total distributed amount
```

**Check Transactions:**
```javascript
db.transactions.find({reference: /prize_distribute|prize-credit/})
// Verify:
// - 3 'prize-credit' transactions for winners
// - 1 'prize-distribute' transaction for organizer
```

### Test Scenario 5: Public Winner Display
```bash
# 1. Logout (or use incognito)
# 2. Visit the tournament detail page
# 3. Verify "Tournament Winners" section is visible
# 4. Check display shows:
#    - Position medals (🥇🥈🥉)
#    - Winner names
#    - Prize amounts formatted as ₹X,XXX
#    - Gradient card styling
# 5. Hover over cards to see border transition
```

### Test Scenario 6: Edge Cases

**A. Insufficient Participants:**
```bash
# 1. Create tournament with only 2 participants
# 2. Try to declare results
# Expected: Error "Minimum 3 participants required"
```

**B. Already Declared:**
```bash
# 1. Declare results on a tournament
# 2. Try to declare again
# Expected: Button shows "Results Declared", disabled
```

**C. Wrong Organizer:**
```bash
# 1. Login as different organizer
# 2. Try to access declare button
# Expected: Organizer Actions section not visible
```

**D. Match Not Ended:**
```bash
# 1. Try to declare before endDate
# Expected: Declare Result block not visible
```

**E. Custom Prize Distribution:**
```bash
# 1. Create tournament with prizeDistribution: "50-30-20"
# 2. Declare results
# 3. Verify prizes calculated correctly:
#    - 1st place: 50% of pool
#    - 2nd place: 30% of pool
#    - 3rd place: 20% of pool
```

## Expected Prize Calculation
For a prize pool of ₹10,000 with distribution "60-30-10":
- 🥇 1st Place: ₹6,000 (60%)
- 🥈 2nd Place: ₹3,000 (30%)
- 🥉 3rd Place: ₹1,000 (10%)
- **Total Distributed:** ₹10,000

## API Endpoint Testing

### Manual API Test (using curl/Postman)
```bash
# POST /tables/tournaments/:id/declare-result
curl -X POST http://localhost:3001/tables/tournaments/<tournament-id>/declare-result \
  -H "Content-Type: application/json" \
  -d '{
    "organizerId": "ORG001"
  }'

# Expected Response:
{
  "success": true,
  "message": "Results declared",
  "data": {
    "tournamentId": "<tournament-id>",
    "winners": [
      {
        "position": 1,
        "playerId": "PLY003",
        "playerName": "Player Three",
        "teamName": null,
        "prize": 6000
      },
      {
        "position": 2,
        "playerId": "PLY001",
        "playerName": "Player One",
        "teamName": null,
        "prize": 3000
      },
      {
        "position": 3,
        "playerId": "PLY002",
        "playerName": "Player Two",
        "teamName": null,
        "prize": 1000
      }
    ]
  }
}
```

## Validation Checklist
- [ ] Minimum 3 participants validated
- [ ] Random selection appears fair (different winners on multiple tests)
- [ ] Prize amounts calculated correctly based on ratio
- [ ] Player wallets credited correctly
- [ ] Organizer locked pool deducted correctly
- [ ] Transactions created for all winners + organizer
- [ ] Tournament status updated to 'completed'
- [ ] resultsVisible flag set to true
- [ ] Public winners display visible to all users
- [ ] Winners sorted by position (1st, 2nd, 3rd)
- [ ] UI shows medals and formatted prize amounts
- [ ] Button disabled after declaration
- [ ] Cannot declare twice on same tournament

## Known Behaviors
1. **Random Selection:** Winners are randomly selected on each declaration, ensuring fairness
2. **Prize Rounding:** Uses `Math.floor()` to avoid decimal issues with currency
3. **Public Visibility:** Results visible to everyone (logged in or not) once declared
4. **One-Time Action:** Cannot undo or re-declare results
5. **Organizer Only:** Only the tournament creator can declare results
6. **Time-Gated:** Can only declare after match end time

## Troubleshooting

### Issue: "Minimum 3 participants required"
**Solution:** Ensure at least 3 players have joined the tournament before declaring

### Issue: Declare button not visible
**Check:**
- Are you logged in as the tournament creator organizer?
- Has the match end time passed?
- Are results already declared?

### Issue: Prize amounts incorrect
**Verify:**
- `prizeDistribution` field in tournament document
- Calculate manually: (pool × percentage) / 100
- Check for rounding with `Math.floor()`

### Issue: Winners not displayed publicly
**Check:**
- `resultsVisible` field should be `true`
- `tournament.winners` array populated
- Browser console for JavaScript errors

## Files Modified
1. `models/Tournament.js` - Added resultDeclaredAt, resultsVisible fields
2. `routes/tournaments.js` - Rewrote declare-result route with auto-selection
3. `tournament.html` - Simplified organizer UI, added public winner display

## Next Steps for Enhancement
- [ ] Add option to exclude specific participants from random selection
- [ ] Support variable number of winners (not just 3)
- [ ] Add result announcement notification to participants
- [ ] Export results as PDF/CSV
- [ ] Add replay/highlight video link in results
- [ ] Show runner-up positions (4th, 5th, etc.)
