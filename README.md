# 🎮 Esports Tournament Management System

A comprehensive platform for managing esports tournaments with organizer registration, player registration, and tournament creation features.

## ✨ Features

### For Organizers
- **Register & Login** - Create organizer accounts with verification
- **Create Tournaments** - Set up tournaments with customizable settings
- **Tournament Management** - Track participants and manage events

### For Players
- **Player Registration** - Sign up to participate in tournaments
- **Browse Tournaments** - View active tournaments and join
- **Track Performance** - Monitor tournament history and earnings

### System Features
- **MongoDB Integration** - Persistent data storage
- **RESTful API** - Complete backend API for all operations
- **Responsive Design** - Works on desktop and mobile devices
- **Real-time Updates** - Live tournament status and participant counts

## 🏗️ Project Structure

```
esports-tournament-management/
├── server.js                    # Express server & MongoDB setup
├── package.json                 # Dependencies
├── .env                        # Environment variables
├── index.html                  # Main homepage
├── create-tournament.html      # Tournament creation page
├── player-registration.html    # Player signup page
├── tournaments.html            # All tournaments listing
├── js/
│   ├── app.js                 # Main frontend logic
│   ├── auth.js                # Authentication functions
│   └── utilities.js           # Helper functions
├── models/
│   ├── Organizer.js          # Organizer schema
│   ├── Tournament.js         # Tournament schema
│   └── Player.js             # Player schema
├── routes/
│   ├── organizers.js         # Organizer API routes
│   ├── tournaments.js        # Tournament API routes
│   └── players.js            # Player API routes
└── docs/
    ├── HOW_TO_RUN.md        # Detailed setup guide
    └── QUICK_START.md       # Quick reference

```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start MongoDB:**
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or check if already running
mongosh --eval "db.version()"
```

3. **Start the server:**
```bash
node server.js
```

4. **Access the application:**
- Homepage: http://localhost:3000
- Create Tournament: http://localhost:3000/create-tournament
- Player Registration: http://localhost:3000/player-registration
- All Tournaments: http://localhost:3000/tournaments.html

## 📚 Documentation

- **[HOW_TO_RUN.md](HOW_TO_RUN.md)** - Complete setup and troubleshooting guide
- **[QUICK_START.md](QUICK_START.md)** - Quick reference for daily use

## 🎯 Supported Games

- **PUBG Mobile** - Battle Royale (Solo, Duo, Squad)
- **Valorant** - Tactical FPS (Team-based)
- **Call of Duty** - FPS (Multiple Modes)

## 🔌 API Endpoints

### Organizers
- `GET /tables/organizers` - List organizers
- `POST /tables/organizers` - Register organizer
- `GET /tables/organizers/:id` - Get organizer details

### Tournaments
- `GET /tables/tournaments` - List tournaments
- `POST /tables/tournaments` - Create tournament
- `GET /tables/tournaments/:id` - Get tournament details
- `POST /tables/tournaments/:id/register` - Register participant

### Players
- `GET /tables/players` - List players
- `POST /tables/players` - Register player
- `GET /tables/players/:id` - Get player details

### System
- `GET /api/health` - Server health check

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript
- **Authentication:** localStorage-based sessions
- **Icons:** Font Awesome

## 📊 Database Collections

- **organizers** - Tournament organizers with approval status
- **tournaments** - Tournament details and participant lists
- **players** - Registered players with statistics

## 🔒 Environment Variables

Create a `.env` file (optional):
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/esports_tournament_db
NODE_ENV=development
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👥 Author

MCA II Students - SE Theory Project

---

**Need Help?** Check [HOW_TO_RUN.md](HOW_TO_RUN.md) for detailed instructions.