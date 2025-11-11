// Global state management
window.appState = {
    currentUser: null,
    userType: 'organizer', // Only organizers supported
    currentSection: 'home',
    organizers: []
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadDashboardStats();
    loadTournaments();
    // Update header buttons based on auth state
    if (typeof updateHeaderButtons === 'function') {
        updateHeaderButtons();
    }
});

// Initialize application
function initializeApp() {
    // Check for existing session
    if (typeof checkUserSession === 'function') {
        checkUserSession();
    }
    
    // Set up event listeners
    setupEventListeners();
}

// Show coming soon modal/notification
function showComingSoon() {
    showNotification('This feature is coming soon! Stay tuned for updates.', 'info');
}

// Section navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
        appState.currentSection = sectionId;
        
        // Load section-specific data if needed
        if (typeof loadSectionData === 'function') {
            loadSectionData(sectionId);
        }
    }
}

// Load section-specific data
// function loadSectionData(sectionId) {
//     switch(sectionId) {
//         case 'tournaments':
//             loadTournaments();
//             break;
//         case 'leaderboards':
//             loadLeaderboards();
//             break;
//         case 'live':
//             loadLiveMatches();
//             break;
//         case 'admin':
//             loadAdminData();
//             break;
//         default:
//             break;
//     }
//}

// Tab management for player auth forms
function showPlayerTab(tab) {
    // Update tab button styles
    document.querySelectorAll('#player-auth-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('border-gaming-accent');
        btn.classList.add('border-transparent');
    });

    // Hide all forms
    document.querySelectorAll('#player-login .auth-form').forEach(form => {
        form.classList.add('hidden');
        form.classList.remove('active');
    });

    // Activate clicked tab
    if (event && event.target) {
        event.target.classList.add('border-gaming-accent');
        event.target.classList.remove('border-transparent');
    }

    // Show selected form
    const formEl = document.getElementById(`player-${tab}-form`);
    if (formEl) {
        formEl.classList.remove('hidden');
        formEl.classList.add('active');
    }
}

function showOrganizerTab(tab) {
    document.querySelectorAll('#organizer-auth-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('border-gaming-primary');
        btn.classList.add('border-transparent');
    });
    
    document.querySelectorAll('#organizer-login .auth-form').forEach(form => {
        form.classList.add('hidden');
        form.classList.remove('active');
    });
    
    event.target.classList.add('border-gaming-primary');
    event.target.classList.remove('border-transparent');
    
    document.getElementById(`organizer-${tab}-form`).classList.remove('hidden');
    document.getElementById(`organizer-${tab}-form`).classList.add('active');
}

// Utility functions
function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Notification system
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification bg-gray-800 border-l-4 ${getNotificationColor(type)} p-4 rounded shadow-lg transform translate-x-full transition-transform duration-300`;
    
    // Convert line breaks to <br> tags for multi-line messages
    const formattedMessage = message.replace(/\n/g, '<br>');
    
    notification.innerHTML = `
        <div class="flex items-start">
            <i class="fas ${getNotificationIcon(type)} mr-3 mt-1"></i>
            <span style="white-space: pre-line;">${formattedMessage}</span>
            <button onclick="removeNotification(this)" class="ml-auto text-gray-400 hover:text-white">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.getElementById('notifications').appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after specified duration
    setTimeout(() => {
        removeNotification(notification.querySelector('button'));
    }, duration);
}

function getNotificationColor(type) {
    const colors = {
        success: 'border-green-500',
        error: 'border-red-500',
        warning: 'border-yellow-500',
        info: 'border-blue-500'
    };
    return colors[type] || colors.info;
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

function removeNotification(button) {
    const notification = button.closest('.notification');
    notification.classList.add('translate-x-full');
    setTimeout(() => {
        notification.remove();
    }, 300);
}

// Loading management
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

// Session management
function checkUserSession() {
    const savedUser = localStorage.getItem('esports_user');
    const savedUserType = localStorage.getItem('esports_user_type');
    
    if (savedUser && savedUserType) {
        appState.currentUser = JSON.parse(savedUser);
        appState.userType = savedUserType;
        updateUIForUser();
    }
}

function saveUserSession(user, userType) {
    localStorage.setItem('esports_user', JSON.stringify(user));
    localStorage.setItem('esports_user_type', userType);
    appState.currentUser = user;
    appState.userType = userType;
    updateUIForUser();
}

function clearUserSession() {
    localStorage.removeItem('esports_user');
    localStorage.removeItem('esports_user_type');
    appState.currentUser = null;
    appState.userType = null;
    updateUIForUser();
}

function updateUIForUser() {
    // Update navigation based on user type
    if (appState.currentUser) {
        // User is logged in - customize UI
        showNotification(`Welcome back, ${appState.currentUser.name || appState.currentUser.username}!`, 'success');
    }
}

// Event listeners setup
function setupEventListeners() {
    // Tournament filters
    const gameFilter = document.getElementById('game-filter');
    const modeFilter = document.getElementById('mode-filter');
    
    if (gameFilter) {
        gameFilter.addEventListener('change', filterTournaments);
    }
    
    if (modeFilter) {
        modeFilter.addEventListener('change', filterTournaments);
    }
}

// Dashboard stats
async function loadDashboardStats() {
    try {
        // Load organizers
        const organizersResponse = await fetch('/tables/organizers');
        const organizersData = await organizersResponse.json();
        
        // Calculate stats
        const totalOrganizers = organizersData.total || 0;
        const verifiedOrganizers = organizersData.data ? organizersData.data.filter(org => org.verified_at).length : 0;
        const activeOrganizers = organizersData.data ? organizersData.data.filter(org => org.status === 'approved').length : 0;
        
        // Update UI
        updateStatCounter('stat-organizers', totalOrganizers);
        updateStatCounter('stat-verified', verifiedOrganizers);
        updateStatCounter('stat-active', activeOrganizers);
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Set default values if API fails
        updateStatCounter('stat-organizers', 0);
        updateStatCounter('stat-verified', 0);
        updateStatCounter('stat-active', 0);
    }
}

function updateStatCounter(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        // Animate counter
        const startValue = parseInt(element.textContent) || 0;
        const endValue = typeof value === 'string' ? value : parseInt(value);
        
        if (typeof endValue === 'number') {
            animateCounter(element, startValue, endValue, 1000);
        } else {
            element.textContent = value;
        }
    }
}

function animateCounter(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Load initial stats
async function loadStats() {
    await loadDashboardStats();
}
// Load and display tournaments
async function loadTournaments() {
    console.log('🔄 loadTournaments() called');
    try {
    console.log('📡 Fetching top 3 active tournaments for home...');
    // Show at most 3 cards on homepage. Use a small limit for the dashboard preview.
    const response = await fetch('/tables/tournaments?limit=3&status=registration-open');
        console.log('📥 Response received:', response.status, response.statusText);
        
        const data = await response.json();
        console.log('📦 Data parsed:', data);
        console.log('📊 Total tournaments found:', data.total);
        console.log('🎮 Tournaments data:', data.data);
        
        const tournamentsContainer = document.getElementById('tournaments-list');
        console.log('🎯 Container element:', tournamentsContainer);
        
        if (data.success && data.data.length > 0) {
            // Determine current player id (if logged in as player)
            let currentPlayerId = null;
            try {
                const ut = localStorage.getItem('esports_user_type');
                const u = localStorage.getItem('esports_user');
                if (ut === 'player' && u) {
                    const parsed = JSON.parse(u);
                    currentPlayerId = parsed && parsed.id ? parsed.id : null;
                }
            } catch(_) {}
            // Filter out tournaments that started more than 2 hours ago
            const now = Date.now();
            const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
            const fresh = data.data.filter(t => {
                if (!t.startDate) return true; // if startDate missing, keep
                const startMs = new Date(t.startDate).getTime();
                return now - startMs < TWO_HOURS_MS; // keep if <2h old
            });
            console.log(`⏱ Filtered tournaments (<=2h old): ${fresh.length}/${data.data.length}`);
            
            if (fresh.length === 0) {
                tournamentsContainer.innerHTML = `
                <div class="text-center col-span-full py-12 text-gray-400">
                    <i class="fas fa-clock text-5xl mb-4 opacity-50"></i>
                    <p class="text-xl">No current tournaments within the last 2 hours</p>
                    <p class="text-sm mt-2">Check back soon or create a new one!</p>
                </div>`;
                console.log('⚠️ All tournaments are older than 2 hours.');
                return;
            }
            console.log('✅ Rendering', data.data.length, 'tournaments...');
            tournamentsContainer.innerHTML = fresh.map(tournament => {
                const alreadyJoined = !!(currentPlayerId && Array.isArray(tournament.participants) && tournament.participants.some(p => p.playerId === currentPlayerId));
                const btnLabel = alreadyJoined ? 'View Details' : 'View Details & Register';
                const btnAction = alreadyJoined 
                    ? `window.location.href = '/tournament.html?id=${encodeURIComponent(tournament.id)}'`
                    : `viewTournamentDetails('${tournament.id}')`;
                return `
                <div class="bg-gray-800/50 rounded-xl overflow-hidden hover:bg-gray-800/70 transition-all duration-300 transform hover:scale-105">
                    <div class="bg-gradient-to-r from-gaming-primary to-gaming-secondary p-4">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="text-xl font-bold text-white mb-1">${tournament.tournamentName}</h3>
                            </div>
                            <span class="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                OPEN
                            </span>
                        </div>
                    </div>
                    
                    <div class="p-6">
                        <div class="flex items-center gap-4 mb-4 text-sm">
                            <span class="flex items-center gap-2">
                                <i class="fas fa-gamepad text-gaming-accent"></i>
                                <span class="capitalize">${tournament.game}</span>
                            </span>
                            <span class="flex items-center gap-2">
                                <i class="fas fa-users text-gaming-primary"></i>
                                <span>${tournament.mode.toUpperCase()}</span>
                            </span>
                        </div>
                        
                        <div class="space-y-2 mb-4 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-400">Prize Pool:</span>
                                <span class="text-yellow-400 font-bold">₹${tournament.prizePool.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Players:</span>
                                <span class="text-white">${tournament.currentParticipants}/${tournament.maxTeams}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Entry Fee:</span>
                                <span class="text-white">${tournament.hasEntryFee ? '₹' + tournament.entryFee : 'FREE'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Registration Deadline:</span>
                                <span class="text-white">${new Date(tournament.registrationDeadline).toLocaleDateString()}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Start Date:</span>
                                <span class="text-white">${new Date(tournament.startDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                        
                        <button onclick="${btnAction}" class="w-full bg-gaming-primary hover:bg-gaming-secondary py-3 rounded-lg font-semibold transition-colors">
                            ${btnLabel}
                        </button>
                    </div>
                </div>
            `;}).join('');
            console.log('✅ Tournaments rendered successfully after time filter!');
            console.log('📝 Container HTML length:', tournamentsContainer.innerHTML.length);
        } else {
            console.log('⚠️ No tournaments found or invalid data');
            tournamentsContainer.innerHTML = `
                <div class="text-center col-span-full py-12 text-gray-400">
                    <i class="fas fa-trophy text-5xl mb-4 opacity-50"></i>
                    <p class="text-xl">No active tournaments yet</p>
                    <p class="text-sm mt-2">Be the first to create one!</p>
                </div>
            `;
        }
        console.log('✅ loadTournaments() completed successfully');
    } catch (error) {
        console.error('❌ Error loading tournaments:', error);
        console.error('Error stack:', error.stack);
        document.getElementById('tournaments-list').innerHTML = `
            <div class="text-center col-span-full py-12 text-red-400">
                <i class="fas fa-exclamation-triangle text-5xl mb-4"></i>
                <p>Error loading tournaments</p>
            </div>
        `;
    }
}

// View tournament details
function viewTournamentDetails(tournamentId) {
    try {
        const userType = localStorage.getItem('esports_user_type');
        if (!userType) {
            showNotification('Please login as a player to join tournaments', 'warning');
            return;
        }
        if (userType !== 'player') {
            showNotification('Switch to a player account to register', 'warning');
            return;
        }
        // Navigate to the lightweight join page
        window.location.href = `/join-tournament.html?id=${encodeURIComponent(tournamentId)}`;
    } catch (e) {
        console.error('viewTournamentDetails error:', e);
        showNotification('Unable to open tournament page', 'error');
    }
}
