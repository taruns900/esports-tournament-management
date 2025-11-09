# 🎮 Esports Tournament Management System - Setup & Run Guide

## 📋 Prerequisites

Before running the project, ensure you have the following installed:

1. **Node.js** (v14 or higher)
   - Check: `node --version`
   - Download: https://nodejs.org/

2. **MongoDB** (v4.4 or higher)
   - Check: `mongod --version`
   - Download: https://www.mongodb.com/try/download/community
   - Or use MongoDB Compass (GUI): https://www.mongodb.com/try/download/compass

3. **npm** (comes with Node.js)
   - Check: `npm --version`

---

## 🚀 Quick Start Guide

### Step 1: Install Dependencies

```bash
cd "/Users/amansingh/Documents/MCA II/SE/Theory/Esports/esports-tournament-management"
npm install
```

This will install all required packages:
- express - Web framework
- mongoose - MongoDB ODM
- cors - Cross-origin resource sharing
- body-parser - Parse request bodies
- dotenv - Environment variables
- bcrypt - Password hashing
- jsonwebtoken - JWT authentication
- uuid - Unique ID generation

### Step 2: Start MongoDB

**Option A: Using MongoDB Service (macOS)**
```bash
# Start MongoDB service
brew services start mongodb-community

# Or if using mongod directly:
mongod --dbpath /usr/local/var/mongodb
```

**Option B: Using MongoDB Compass**
- Open MongoDB Compass
- Connect to: `mongodb://localhost:27017`

### Step 3: Start the Server

**Standard Start (Recommended):**
```bash
node server.js
```

When the server starts successfully, you'll see:
```
🚀 Server running on http://localhost:3000
📊 MongoDB Compass Connection: mongodb://localhost:27017/esports_tournament_db
🌐 Frontend available at: http://localhost:3000
✅ Connected to MongoDB successfully!
```

**Alternative Methods:**

*Development Mode (Auto-restart on file changes):*
```bash
npm run dev
```
Note: Requires `nodemon` to be installed.

*Using npm start:*
```bash
npm start
```

### Step 4: Access the Application

Open your browser and visit:
- **Main Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **Create Tournament**: http://localhost:3000/create-tournament
- **Player Registration**: http://localhost:3000/player-registration
- **All Tournaments**: http://localhost:3000/tournaments.html

---

## 📊 View Your Data

### Using MongoDB Compass:
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017/esports_tournament_db`
3. You'll see three collections:
   - `organizers` - Tournament organizers
   - `tournaments` - All tournaments
   - `players` - Registered players

### Using Command Line:
```bash
# Connect to MongoDB
mongosh

# Switch to database
use esports_tournament_db

# View organizers
db.organizers.find().pretty()

# View tournaments
db.tournaments.find().pretty()

# View players
db.players.find().pretty()

# Count documents
db.organizers.countDocuments()
db.tournaments.countDocuments()
db.players.countDocuments()
```

---

## 🛠️ Troubleshooting

### Issue: Port 3000 already in use
```bash
# Find and kill process using port 3000
lsof -i :3000
kill -9 <PID>

# Or use pkill
pkill -f "node server.js"
```

### Issue: MongoDB connection error
```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# Start MongoDB if not running
brew services start mongodb-community

# Or manually:
mongod --dbpath /usr/local/var/mongodb
```

### Issue: Dependencies not installed
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Issue: Server crashes immediately
```bash
# Check for syntax errors
node --check server.js

# View detailed error logs
node server.js 2>&1 | tee server.log
```

---

## 📱 Application Features

### For Organizers:
1. **Register** - Create organizer account
2. **Login** - Access organizer dashboard
3. **Create Tournament** - Set up new tournaments with:
   - Game selection (PUBG, Valorant, COD)
   - Tournament mode (Solo, Duo, Squad)
   - Prize pool and entry fees
   - Registration deadlines
   - Tournament rules

### For Players:
1. **Register** - Create player account
2. **Browse Tournaments** - View active tournaments
3. **Join Tournaments** - Register for tournaments (coming soon)

---

## 🔌 API Endpoints

### Organizers
- `GET /tables/organizers` - List all organizers
- `POST /tables/organizers` - Register new organizer
- `GET /tables/organizers/:id` - Get organizer details
- `PUT /tables/organizers/:id` - Update organizer
- `DELETE /tables/organizers/:id` - Delete organizer

### Tournaments
- `GET /tables/tournaments` - List all tournaments
- `POST /tables/tournaments` - Create tournament
- `GET /tables/tournaments/:id` - Get tournament details
- `PUT /tables/tournaments/:id` - Update tournament
- `DELETE /tables/tournaments/:id` - Delete tournament
- `POST /tables/tournaments/:id/register` - Register participant

### Players
- `GET /tables/players` - List all players
- `POST /tables/players` - Register new player
- `GET /tables/players/:id` - Get player details
- `PUT /tables/players/:id` - Update player
- `DELETE /tables/players/:id` - Delete player

### System
- `GET /api/health` - Check server health

---

## 🧪 Testing the Application

### Test Organizer Registration:
```bash
curl -X POST http://localhost:3000/tables/organizers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Organizer",
    "email": "test@example.com",
    "phone": "9876543210",
    "experience": "5 years organizing esports tournaments"
  }'
```

### Test Tournament Creation:
```bash
curl -X POST http://localhost:3000/tables/tournaments \
  -H "Content-Type: application/json" \
  -d '{
    "tournamentName": "Test Championship",
    "organizerId": "org_xyz123",
    "organizerName": "Test Organizer",
    "game": "pubg",
    "mode": "squad",
    "format": "battle-royale",
    "startDate": "2025-11-15T10:00:00.000Z",
    "endDate": "2025-11-16T18:00:00.000Z",
    "registrationDeadline": "2025-11-14T23:59:00.000Z",
    "maxTeams": 32,
    "prizePool": 50000,
    "minAge": 13,
    "numberOfMatches": 5,
    "rules": "Standard tournament rules apply"
  }'
```

### Test Player Registration:
```bash
curl -X POST http://localhost:3000/tables/players \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "age": 22,
    "country": "india",
    "gender": "male"
  }'
```

---

## 📝 Environment Variables

Create a `.env` file in the project root (optional):

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/esports_tournament_db
NODE_ENV=development
```

---

## 🎯 Common Tasks

### Stop the Server:
```bash
# If running in foreground: Press Ctrl + C in the terminal
```

### Restart the Server:
```bash
# After stopping with Ctrl + C:
node server.js
```

### Clear Database (Reset):
```bash
mongosh esports_tournament_db --eval "db.dropDatabase()"
```

### View Server Logs:
```bash
# If you redirected output to a file:
tail -f server.log

# Or run with logging:
node server.js 2>&1 | tee server.log
```

---

## 📦 Project Structure

```
esports-tournament-management/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env                   # Environment variables
├── index.html            # Main homepage
├── create-tournament.html # Tournament creation page
├── player-registration.html # Player registration page
├── models/               # Database models
│   ├── Organizer.js
│   ├── Tournament.js
│   └── Player.js
├── routes/               # API routes
│   ├── organizers.js
│   ├── tournaments.js
│   └── players.js
└── js/                   # Frontend JavaScript
    ├── app.js
    ├── auth.js
    └── utilities.js
```

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the terminal for error messages
2. Verify MongoDB is running: `mongosh --eval "db.version()"`
3. Check if port 3000 is available: `lsof -i :3000`
4. Ensure all dependencies are installed: `npm install`
5. Check Node.js version: `node --version` (should be v14+)

---

## ✅ Success Indicators

Your server is running correctly when you see:
```
🚀 Server running on http://localhost:3000
📊 MongoDB Compass Connection: mongodb://localhost:27017/esports_tournament_db
🌐 Frontend available at: http://localhost:3000
✅ Connected to MongoDB successfully!
```

---

**Happy Gaming! 🎮🏆**
