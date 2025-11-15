const mongoose = require('mongoose');
const Tournament = require('./models/Tournament');
const Organizer = require('./models/Organizer');
const Player = require('./models/Player');
const Transaction = require('./models/Transaction');

async function seedData() {
  try {
    // Connect to MongoDB (adjust URI if needed)
    await mongoose.connect('mongodb://localhost:27017/esports', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await Tournament.deleteMany({});
    await Organizer.deleteMany({});
    await Player.deleteMany({});
    await Transaction.deleteMany({});

    console.log('Cleared existing data');

    // Create Organizer
    const organizer = new Organizer({
      name: 'Test Organizer',
      email: 'organizer@test.com',
      phone: '+1234567890',
      id: 'ORG001',
      experience: 'Experienced in organizing esports events.',
      walletBalance: 10000,
      lockedPrizePool: 0,
    });
    await organizer.save();
    console.log('Created organizer');

    // Create Player
    const player = new Player({
      firstName: 'John',
      lastName: 'Doe',
      email: 'player@test.com',
      phone: '+0987654321',
      id: 'PLY001',
      age: 25,
      country: 'india',
      gender: 'male',
      walletBalance: 5000,
    });
    await player.save();
    console.log('Created player');

    // Current date: 15 November 2025
    const now = new Date('2025-11-15T00:00:00Z');
    const pastDeadline = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
    const futureDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now
    const startDatePast = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
    const startDateFuture = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

    // Tournament 1: Registration deadline passed (CLOSED)
    const tournament1 = new Tournament({
      id: 'TOUR001',
      tournamentName: 'Past Deadline Tournament',
      description: 'This tournament\'s registration deadline has passed.',
      game: 'cod',
      mode: 'solo',
      prizePool: 5000,
      entryFee: 100,
      hasEntryFee: true,
      maxTeams: 50,
      currentParticipants: 10,
      status: 'registration-open', // Will be overridden by UI
      registrationDeadline: pastDeadline,
      startDate: startDateFuture,
      endDate: null,
      organizerId: organizer.id,
      organizerName: organizer.name,
      participants: [],
      streamUrl: 'https://example.com/stream1',
      discordUrl: 'https://discord.gg/example1',
      createdAt: now,
    });
    await tournament1.save();

    // Tournament 2: Registration open (OPEN)
    const tournament2 = new Tournament({
      id: 'TOUR002',
      tournamentName: 'Active Tournament',
      description: 'This tournament is currently accepting registrations.',
      game: 'valorant',
      mode: 'squad',
      prizePool: 10000,
      entryFee: 200,
      hasEntryFee: true,
      maxTeams: 20,
      currentParticipants: 5,
      status: 'registration-open',
      registrationDeadline: futureDeadline,
      startDate: startDateFuture,
      endDate: null,
      organizerId: organizer.id,
      organizerName: organizer.name,
      participants: [],
      streamUrl: 'https://example.com/stream2',
      discordUrl: 'https://discord.gg/example2',
      createdAt: now,
    });
    await tournament2.save();

    // Tournament 3: Started (Live)
    const tournament3 = new Tournament({
      id: 'TOUR003',
      tournamentName: 'Live Tournament',
      description: 'This tournament has started.',
      game: 'pubg',
      mode: 'duo',
      prizePool: 8000,
      entryFee: 150,
      hasEntryFee: true,
      maxTeams: 30,
      currentParticipants: 25,
      status: 'ongoing',
      registrationDeadline: pastDeadline,
      startDate: startDatePast,
      endDate: null,
      organizerId: organizer.id,
      organizerName: organizer.name,
      participants: [],
      streamUrl: 'https://example.com/stream3',
      discordUrl: 'https://discord.gg/example3',
      createdAt: now,
    });
    await tournament3.save();

    console.log('Created sample tournaments');

    // Sample transactions
    const transaction1 = new Transaction({
      id: 'TXN001',
      userId: organizer.id,
      userType: 'organizer',
      type: 'deposit',
      amount: 10000,
      reference: 'Initial deposit',
      createdAt: now,
    });
    await transaction1.save();

    const transaction2 = new Transaction({
      id: 'TXN002',
      userId: player.id,
      userType: 'player',
      type: 'deposit',
      amount: 5000,
      reference: 'Initial deposit',
      createdAt: now,
    });
    await transaction2.save();

    console.log('Created sample transactions');

    console.log('Seeding completed successfully');
    console.log('Organizer ID:', organizer._id);
    console.log('Player ID:', player._id);
    console.log('Tournament IDs:', tournament1._id, tournament2._id, tournament3._id);

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedData();