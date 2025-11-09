# 🚀 Quick Start - Esports Tournament Management

## ⚡ Run in 3 Steps:

### 1️⃣ Install Dependencies (First time only)
```bash
npm install
```

### 2️⃣ Start MongoDB
```bash
# macOS
brew services start mongodb-community

# Or check if already running:
mongosh --eval "db.version()"
```

### 3️⃣ Start Server
```bash
node server.js
```

You should see:
```
🚀 Server running on http://localhost:3000
📊 MongoDB Compass Connection: mongodb://localhost:27017/esports_tournament_db
🌐 Frontend available at: http://localhost:3000
✅ Connected to MongoDB successfully!
```

## 🌐 Access Application
- **Homepage**: http://localhost:3000
- **Create Tournament**: http://localhost:3000/create-tournament
- **Player Registration**: http://localhost:3000/player-registration
- **All Tournaments**: http://localhost:3000/tournaments.html

---

## 🛑 Stop Server
```bash
# Press Ctrl + C in the terminal where server is running
```

## 🔄 Restart Server
```bash
# Stop with Ctrl + C, then:
node server.js
```

---

## ✅ Current Status
Your server is **RUNNING** at http://localhost:3000

Check health: http://localhost:3000/api/health

---

For detailed instructions, see **HOW_TO_RUN.md**
