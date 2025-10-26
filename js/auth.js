// Authentication functions for organizers

// Helper function to generate unique ID
function generateId() {
    return 'org_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Update header buttons based on authentication state
function updateHeaderButtons() {
    const userData = getUserSession();
    const authButtons = document.getElementById('auth-buttons');
    const logoutButton = document.getElementById('logout-button');
    const userNameDisplay = document.getElementById('user-name-display');
    
    if (userData && userData.type === 'organizer') {
        // User is logged in - show logout button, hide auth buttons
        authButtons.classList.add('hidden');
        logoutButton.classList.remove('hidden');
        
        // Display organizer name
        if (userNameDisplay && userData.user) {
            userNameDisplay.textContent = userData.user.name || 'Organizer';
        }
    } else {
        // User is not logged in - show auth buttons, hide logout button
        authButtons.classList.remove('hidden');
        logoutButton.classList.add('hidden');
    }
}

// Logout function
function logout() {
    clearUserSession();
    updateHeaderButtons();
    showNotification('Logged out successfully', 'success');
    showSection('home');
}

// Player Authentication
// async function playerLogin(event) {
//     event.preventDefault();
//     showLoading();
    
//     const email = document.getElementById('player-email').value;
//     const playerId = document.getElementById('player-id').value;
    
//     try {
//         // Fetch player by email
//         const response = await fetch(`tables/players?search=${email}`);
//         const data = await response.json();
        
//         if (data.data.length > 0) {
//             const player = data.data[0];
            
//             // Simple ID verification (in production, use proper auth)
//             if (player.ingame_id === playerId) {
//                 saveUserSession(player, 'player');
//                 showNotification('Login successful!', 'success');
//                 showPlayerDashboard();
//             } else {
//                 showNotification('Invalid credentials', 'error');
//             }
//         } else {
//             showNotification('Player not found', 'error');
//         }
//     } catch (error) {
//         console.error('Login error:', error);
//         showNotification('Login failed', 'error');
//     }
    
//     hideLoading();
// }

// async function playerRegister(event) {
//     event.preventDefault();
//     showLoading();
    
//     const formData = {
//         id: generateId(),
//         username: document.getElementById('reg-username').value,
//         email: document.getElementById('reg-email').value,
//         ingame_id: document.getElementById('reg-ingame-id').value,
//         age: parseInt(document.getElementById('reg-age').value),
//         rank: document.getElementById('reg-rank').value,
//         platform: document.getElementById('reg-platform').value,
//         region: document.getElementById('reg-region').value,
//         wallet_balance: 0,
//         total_tournaments: 0,
//         wins: 0,
//         total_earnings: 0
//     };
    
//     try {
//         // Check if email or ingame_id already exists
//         const emailCheck = await fetch(`tables/players?search=${formData.email}`);
//         const emailData = await emailCheck.json();
        
//         if (emailData.data.length > 0) {
//             showNotification('Email already registered', 'error');
//             hideLoading();
//             return;
//         }
        
//         // Create new player
//         const response = await fetch('tables/players', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(formData)
//         });
        
//         if (response.ok) {
//             const newPlayer = await response.json();
//             saveUserSession(newPlayer, 'player');
//             showNotification('Registration successful!', 'success');
//             showPlayerDashboard();
//         } else {
//             throw new Error('Registration failed');
//         }
//     } catch (error) {
//         console.error('Registration error:', error);
//         showNotification('Registration failed', 'error');
//     }
    
//     hideLoading();
// }

// Organizer Authentication
async function organizerLogin(event) {
    event.preventDefault();
    showLoading();
    
    const email = document.getElementById('org-email').value;
    const orgId = document.getElementById('org-id').value;
    
    try {
        const response = await fetch(`tables/organizers?search=${email}`);
        const data = await response.json();
        
        if (data.data.length > 0) {
            const organizer = data.data[0];
            
            if (organizer.id === orgId) {
                if (organizer.status === 'approved') {
                    saveUserSession(organizer, 'organizer');
                    showNotification('Login successful! Welcome back!', 'success');
                    hideLoading();
                    
                    // Update header buttons to show logout
                    updateHeaderButtons();
                    
                    // Redirect to home page after successful login
                    setTimeout(() => {
                        showSection('home');
                        // Reload tournaments to show user they're logged in
                        loadTournaments();
                    }, 1500);
                    return;
                } else {
                    showNotification(`Account status: ${organizer.status}`, 'warning');
                }
            } else {
                showNotification('Invalid credentials', 'error');
            }
        } else {
            showNotification('Organizer not found', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed', 'error');
    }
    
    hideLoading();
    
    hideLoading();
}

async function organizerRegister(event) {
    event.preventDefault();
    showLoading();
    
    const formData = {
        id: generateId(),
        name: document.getElementById('org-reg-name').value,
        email: document.getElementById('org-reg-email').value,
        phone: document.getElementById('org-reg-phone').value,
        experience: document.getElementById('org-reg-experience').value,
        status: 'approved',
        verified_at: new Date().toISOString(),
        admin_notes: 'Auto-approved organizer account'
    };
    
    // Client-side validation
    const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(formData.phone)) {
        showNotification('Please enter a valid phone number (at least 8 digits)', 'error');
        hideLoading();
        return;
    }
    
    // Validate experience length
    if (formData.experience.length < 10) {
        showNotification('Experience description must be at least 10 characters long', 'error');
        hideLoading();
        return;
    }
    
    if (formData.experience.length > 1000) {
        showNotification('Experience description cannot exceed 1000 characters', 'error');
        hideLoading();
        return;
    }
    
    try {
        // Check if email already exists
        const emailCheck = await fetch(`tables/organizers?search=${formData.email}`);
        const emailData = await emailCheck.json();
        
        if (emailData.data.length > 0) {
            showNotification('Email already registered', 'error');
            hideLoading();
            return;
        }
        
        // Create new organizer
        const response = await fetch('tables/organizers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const newOrganizer = await response.json();
            
            // Show success message with Organizer ID
            const organizerId = newOrganizer.data.id;
            showNotification(`✅ Account created successfully!\n\n📋 Your Organizer ID: ${organizerId}\n\n⚠️ Please save this ID for future reference!`, 'success', 10000);
            
            // Clear form - find the actual form element inside the div
            const form = document.querySelector('#organizer-register-form form');
            if (form) {
                form.reset();
            }
            
            // Auto-login the user after successful registration
            saveUserSession(newOrganizer.data, 'organizer');
            
            hideLoading();
            
            // Switch to login tab after 10 seconds (after notification disappears)
            setTimeout(() => {
                showOrganizerTab('login');
            }, 10500);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        
        // Show more specific error message
        let errorMessage = 'Registration failed';
        if (error.message.includes('validation failed')) {
            errorMessage = 'Please check your input fields. Phone number should be at least 8 digits.';
        } else if (error.message.includes('already exists')) {
            errorMessage = 'Email already registered. Please use a different email.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showNotification(errorMessage, 'error');
    }
    
    hideLoading();
}

// Dashboard functions
// function showPlayerDashboard() {
//     // Create player dashboard content
//     const dashboardContent = `
//         <div class="max-w-7xl mx-auto px-4 py-8">
//             <div class="flex justify-between items-center mb-8">
//                 <div>
//                     <h2 class="text-3xl font-bold">Welcome, ${appState.currentUser.username}!</h2>
//                     <p class="text-gray-300">Player Dashboard</p>
//                 </div>
//                 <button onclick="logout()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors">
//                     <i class="fas fa-sign-out-alt mr-2"></i>Logout
//                 </button>
//             </div>
            
//             <!-- Player Stats -->
//             <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//                 <div class="bg-gray-800/50 rounded-xl p-6 text-center">
//                     <div class="text-3xl font-bold text-gaming-accent mb-2">${appState.currentUser.total_tournaments || 0}</div>
//                     <div class="text-gray-300">Tournaments</div>
//                 </div>
//                 <div class="bg-gray-800/50 rounded-xl p-6 text-center">
//                     <div class="text-3xl font-bold text-green-400 mb-2">${appState.currentUser.wins || 0}</div>
//                     <div class="text-gray-300">Wins</div>
//                 </div>
//                 <div class="bg-gray-800/50 rounded-xl p-6 text-center">
//                     <div class="text-3xl font-bold text-yellow-400 mb-2">${formatCurrency(appState.currentUser.total_earnings || 0)}</div>
//                     <div class="text-gray-300">Total Earnings</div>
//                 </div>
//                 <div class="bg-gray-800/50 rounded-xl p-6 text-center">
//                     <div class="text-3xl font-bold text-gaming-primary mb-2">${formatCurrency(appState.currentUser.wallet_balance || 0)}</div>
//                     <div class="text-gray-300">Wallet Balance</div>
//                 </div>
//             </div>
            
//             <!-- Action Buttons -->
//             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//                 <button onclick="showSection('tournaments')" class="bg-gaming-accent hover:bg-cyan-600 p-6 rounded-xl text-left transition-all transform hover:scale-105">
//                     <i class="fas fa-search text-2xl mb-4"></i>
//                     <h3 class="text-xl font-bold mb-2">Browse Tournaments</h3>
//                     <p class="text-gray-300">Find and join active tournaments</p>
//                 </button>
                
//                 <button onclick="showMyTournaments()" class="bg-gaming-primary hover:bg-gaming-secondary p-6 rounded-xl text-left transition-all transform hover:scale-105">
//                     <i class="fas fa-trophy text-2xl mb-4"></i>
//                     <h3 class="text-xl font-bold mb-2">My Tournaments</h3>
//                     <p class="text-gray-300">View your active and past tournaments</p>
//                 </button>
                
//                 <button onclick="showTeamManagement()" class="bg-gaming-secondary hover:bg-purple-600 p-6 rounded-xl text-left transition-all transform hover:scale-105">
//                     <i class="fas fa-users text-2xl mb-4"></i>
//                     <h3 class="text-xl font-bold mb-2">Team Management</h3>
//                     <p class="text-gray-300">Create or join teams</p>
//                 </button>
//             </div>
            
//             <!-- Recent Activity -->
//             <div class="bg-gray-800/50 rounded-xl p-6">
//                 <h3 class="text-xl font-bold mb-4">Recent Activity</h3>
//                 <div id="player-activity">
//                     <p class="text-gray-300">No recent activity</p>
//                 </div>
//             </div>
//         </div>
//     `;
    
//     showCustomSection('Player Dashboard', dashboardContent);
// }

// function showOrganizerDashboard() {
//     const dashboardContent = `
//         <div class="max-w-7xl mx-auto px-4 py-8">
//             <div class="flex justify-between items-center mb-8">
//                 <div>
//                     <h2 class="text-3xl font-bold">Welcome, ${appState.currentUser.name}!</h2>
//                     <p class="text-gray-300">Organizer Dashboard</p>
//                 </div>
//                 <button onclick="logout()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors">
//                     <i class="fas fa-sign-out-alt mr-2"></i>Logout
//                 </button>
//             </div>
            
//             <!-- Quick Actions -->
//             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//                 <button onclick="showCreateTournament()" class="bg-gaming-primary hover:bg-gaming-secondary p-6 rounded-xl text-left transition-all transform hover:scale-105">
//                     <i class="fas fa-plus-circle text-2xl mb-4"></i>
//                     <h3 class="text-xl font-bold mb-2">Create Tournament</h3>
//                     <p class="text-gray-300">Start a new tournament</p>
//                 </button>
                
//                 <button onclick="showMyTournaments()" class="bg-gaming-accent hover:bg-cyan-600 p-6 rounded-xl text-left transition-all transform hover:scale-105">
//                     <i class="fas fa-trophy text-2xl mb-4"></i>
//                     <h3 class="text-xl font-bold mb-2">My Tournaments</h3>
//                     <p class="text-gray-300">Manage active tournaments</p>
//                 </button>
                
//                 <button onclick="showOrganizerReports()" class="bg-green-600 hover:bg-green-700 p-6 rounded-xl text-left transition-all transform hover:scale-105">
//                     <i class="fas fa-chart-bar text-2xl mb-4"></i>
//                     <h3 class="text-xl font-bold mb-2">Reports</h3>
//                     <p class="text-gray-300">View tournament analytics</p>
//                 </button>
//             </div>
            
//             <!-- Tournament Overview -->
//             <div class="bg-gray-800/50 rounded-xl p-6">
//                 <h3 class="text-xl font-bold mb-4">Tournament Overview</h3>
//                 <div id="organizer-tournaments">
//                     <p class="text-gray-300">Loading tournaments...</p>
//                 </div>
//             </div>
//         </div>
//     `;
    
//     showCustomSection('Organizer Dashboard', dashboardContent);
//     loadOrganizerTournaments();
// }

// function showCustomSection(title, content) {
//     // Hide all existing sections
//     document.querySelectorAll('.section').forEach(section => {
//         section.classList.add('hidden');
//         section.classList.remove('active');
//     });
    
//     // Create or update custom section
//     let customSection = document.getElementById('custom-section');
//     if (!customSection) {
//         customSection = document.createElement('section');
//         customSection.id = 'custom-section';
//         customSection.className = 'section';
//         document.querySelector('main').appendChild(customSection);
//     }
    
//     customSection.innerHTML = content;
//     customSection.classList.remove('hidden');
//     customSection.classList.add('active');
// }

// async function loadOrganizerTournaments() {
//     if (!appState.currentUser) return;
    
//     try {
//         const response = await fetch(`tables/tournaments?organizer_id=${appState.currentUser.id}`);
//         const data = await response.json();
        
//         const container = document.getElementById('organizer-tournaments');
//         if (data.data.length === 0) {
//             container.innerHTML = '<p class="text-gray-300">No tournaments created yet.</p>';
//             return;
//         }
        
//         const tournamentsHTML = data.data.map(tournament => `
//             <div class="border border-gray-600 rounded-lg p-4 mb-4">
//                 <div class="flex justify-between items-start">
//                     <div>
//                         <h4 class="font-bold text-lg">${tournament.title}</h4>
//                         <p class="text-gray-300">${tournament.game} - ${tournament.mode}</p>
//                         <p class="text-sm text-gray-400">Prize Pool: ${formatCurrency(tournament.prize_pool)}</p>
//                     </div>
//                     <span class="px-3 py-1 rounded-full text-sm ${getTournamentStatusColor(tournament.status)}">${tournament.status}</span>
//                 </div>
//             </div>
//         `).join('');
        
//         container.innerHTML = tournamentsHTML;
//     } catch (error) {
//         console.error('Error loading organizer tournaments:', error);
//     }
// }

// function getTournamentStatusColor(status) {
//     const colors = {
//         draft: 'bg-gray-600 text-gray-200',
//         open: 'bg-green-600 text-white',
//         registration_closed: 'bg-yellow-600 text-white',
//         ongoing: 'bg-blue-600 text-white',
//         completed: 'bg-purple-600 text-white'
//     };
//     return colors[status] || 'bg-gray-600 text-gray-200';
// }

// // Utility functions
// async function createAdminNotification(title, message) {
//     try {
//         await fetch('tables/notifications', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 id: generateId(),
//                 recipient_id: 'admin',
//                 recipient_type: 'admin',
//                 title: title,
//                 message: message,
//                 type: 'tournament_update',
//                 read: false,
//                 priority: 'medium'
//             })
//         });
//     } catch (error) {
//         console.error('Error creating admin notification:', error);
//     }
// }

// function logout() {
//     clearUserSession();
//     showNotification('Logged out successfully', 'success');
//     showSection('home');
// }

// // Placeholder functions for dashboard actions
// function showMyTournaments() {
//     showNotification('My Tournaments feature coming soon', 'info');
// }

// function showTeamManagement() {
//     showNotification('Team Management feature coming soon', 'info');
// }

// // Tournament creation is now handled in tournament-creation.js

// function showOrganizerReports() {
//     showNotification('Reports feature coming soon', 'info');
// }
// Session Management Functions
function saveUserSession(userData, userType) {
    localStorage.setItem('esports_user', JSON.stringify(userData));
    localStorage.setItem('esports_user_type', userType);
    window.appState.currentUser = userData;
    window.appState.userType = userType;
}

function getUserSession() {
    const userData = localStorage.getItem('esports_user');
    const userType = localStorage.getItem('esports_user_type');
    if (userData && userType) {
        return {
            user: JSON.parse(userData),
            type: userType
        };
    }
    return null;
}

function clearUserSession() {
    localStorage.removeItem('esports_user');
    localStorage.removeItem('esports_user_type');
    window.appState.currentUser = null;
    window.appState.userType = null;
}

function checkUserSession() {
    const session = getUserSession();
    if (session) {
        window.appState.currentUser = session.user;
        window.appState.userType = session.type;
        return session;
    }
    return null;
}

// Helper function to get current organizer ID
function getCurrentOrganizerId() {
    const session = getUserSession();
    if (session && session.type === 'organizer') {
        return session.user.id;
    }
    return null;
}

// Helper function to get current organizer full data
function getCurrentOrganizer() {
    const session = getUserSession();
    if (session && session.type === 'organizer') {
        return session.user;
    }
    return null;
}

// Helper function to check if organizer is logged in
function isOrganizerLoggedIn() {
    const session = getUserSession();
    return session && session.type === 'organizer';
}
