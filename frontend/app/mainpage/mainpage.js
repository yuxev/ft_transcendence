globalThis.IsAI = 0;
var Cnt = 0;

var FinishMultGame = document.getElementById("finishMultiGameEngine");
FinishMultGame.addEventListener('click', ()=>{
    window.showView && window.showView('home');
})

function blockUserUntilFilled() {
    return new Promise((resolve) => {
        Cnt++;
        if (Cnt > 1) {
            resolve();
            return;
        }

        const overlay = document.createElement("div");
        overlay.id = "input-overlay";
        document.body.appendChild(overlay);

        const container = document.createElement("div");
        container.id = "input-container";

        // First input for Player 1
        const input1 = document.createElement("input");
        input1.type = "text";
        input1.placeholder = "Enter first name";
        input1.id = "input1";

        // Second input for Player 2
        const input2 = document.createElement("input");
        input2.type = "text";
        input2.placeholder = "Enter second name";
        input2.id = "input2";

        // AI Checkbox
        const aiCheckboxLabel = document.createElement("label");
        aiCheckboxLabel.textContent = "Play against AI";
        aiCheckboxLabel.style.marginLeft = "10px";

        const aiCheckbox = document.createElement("input");
        aiCheckbox.type = "checkbox";
        aiCheckbox.id = "aiCheckbox";
        
        // Toggle AI mode
        aiCheckbox.addEventListener("change", function () {
            if (aiCheckbox.checked) {
                input2.value = "AI Player";
                globalThis.IsAI = 1;
                input2.disabled = true;
            } else {
                input2.value = "";
                globalThis.IsAI = 0;
                input2.disabled = false;
            }
        });

        // Finish Button
        const finishButton = document.createElement("button");
        finishButton.id = "verify";
        finishButton.textContent = "Finish";

        container.appendChild(input1);
        container.appendChild(input2);
        container.appendChild(aiCheckbox);
        container.appendChild(aiCheckboxLabel);
        container.appendChild(finishButton);
        overlay.appendChild(container);

        function checkInputs() {
            return input1.value.trim() !== "" && (input2.value.trim() !== "" || aiCheckbox.checked);
        }

        finishButton.addEventListener("click", function () {
            if (checkInputs()) {
                document.getElementById("player1Name").textContent = input1.value;
                document.getElementById("player2Name").textContent = input2.value;
                document.body.removeChild(overlay);
                resolve();
            } else {
                alert("Please fill in both names before proceeding.");
            }
        });
    });
}


// Run function to block user


document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing application...');
    
    // Check authentication
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        window.location.href = '/index.html';
        return;
    }
    
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Update profile display
    updateUserProfile(userData);
    
    // Initialize SPA navigation
    initSpaNavigation();
    
    // Check if there's a saved view to restore after refresh
    const savedView = localStorage.getItem('currentView');
    console.log(`Saved view found: ${savedView}`);
    
    if (savedView) {
        if (savedView === 'game') {
            // Handle game restoration - check if it's tournament or regular game
            if (localStorage.getItem('currentMatch')) {
                console.log('Restoring tournament game...');
                startTournamentGame();
            } else {
                console.log('Restoring regular game...');
                blockUserUntilFilled().then(() => {
                    startGame();  // This will only execute after the promise is resolved
                });
            }
        } else if (savedView === 'tournament') {
            // Special case for tournament with active match
            if (localStorage.getItem('currentMatch') && !localStorage.getItem('matchResult')) {
                // No result means we were in the middle of a game
                console.log('Restoring tournament game in progress...');
                startTournamentGame();
            } else {
                console.log('Restoring tournament view...');
                showView('tournament');
            }
        } else {
            // For other views, just restore normally
            console.log(`Restoring view: ${savedView}`);
            showView(savedView);
        }
    } else {
        // Default to home view
        console.log('No saved view, defaulting to home');
        showView('home');
    }

    // Set up settings icon to open profile
    document.querySelector('.settings').addEventListener('click', function() {
        showView('profile');
    });

    // Set up logout button
    document.getElementById('logoutButton').addEventListener('click', function() {
        logout();
    });

    // Set up password change functionality
    document.getElementById('changePasswordButton').addEventListener('click', function() {
        changePassword();
    });

    // Initialize language switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-language');
            localStorage.setItem('language', lang);
            
            // Update active button
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Load and apply translations
            if (window.I18n) {
                window.I18n.setLanguage(lang);
            }
        });
    });
    
    // Set active language button
    updateLanguageButtons();
});

// Simple SPA navigation
function initSpaNavigation() {
    console.log('Initializing SPA navigation...');
    
    // Handle link clicks
    document.querySelectorAll('.spa-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const path = this.getAttribute('data-path');
            console.log(`Link clicked: ${path}`);
            
            // Set window location hash to track path
            window.location.hash = path;
            
            // Extract view name from path (remove leading slash)
            let viewName = path.replace('/', '');
            
            // Fix for space-shooter path to match the spaceShooterView ID
            if (viewName === 'space-shooter') {
                viewName = 'spaceShooter';
            }
            
            // Show corresponding view
            if (viewName === 'game') {
                blockUserUntilFilled().then(() => {
                    startGame();  // This will only execute after the promise is resolved
                });
            } else if (viewName === 'tournament' && path !== '/tournament/match') {
                showView('tournament');
            } else {
                showView(viewName);
            }
        });
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('hashchange', function() {
        console.log(`Hash changed: ${window.location.hash}`);
        
        // Extract view name from hash
        let viewName = window.location.hash.replace('#/', '');
        
        if (viewName === 'space-shooter')
            viewName = 'spaceShooter';
        if (viewName === 'game')
        {
            blockUserUntilFilled().then(() => {
                startGame();  // This will only execute after the promise is resolved
            });
        }
        else if (viewName === 'tournament' && window.location.hash !== '/tournament/match')
            showView('tournament');
        else if (viewName)
            showView(viewName);
        else
            showView('home');
    });
}

function showView(viewName) {
    console.log(`Switching to view: ${viewName}`);
    
    if (document.getElementById("multiGscript"))
        document.getElementById("multiGscript").remove();
    if (document.getElementById("spaceShtrScript"))
        document.getElementById("spaceShtrScript").remove();
    if (document.getElementById("UpldgameScript"))
        document.getElementById("UpldgameScript").remove();

    // Clean up previous view if needed
    if (viewName !== 'game' && window.GameEngine)
        window.GameEngine.cleanup();
    
    if (viewName !== 'spaceShooter' && window.SpaceShooter)
        window.SpaceShooter.cleanup();
    if (viewName !== 'multiplayer' && window.MultiGameEngine)
        window.MultiGameEngine.cleanup();
    
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.style.display = 'none';
    });
    
    // Disable all game-specific styles
    const spaceShooterStyles = document.getElementById('spaceShooterStyles');
    if (spaceShooterStyles)
        spaceShooterStyles.media = "none";
    
    // Enable styles for current view only
    if (viewName === 'spaceShooter') {
        if (spaceShooterStyles)
            spaceShooterStyles.media = "all";
    }
    
    // Show the requested view
    const viewElement = document.getElementById(`${viewName}View`);
    if (!viewElement) {
        console.error(`View element not found: ${viewName}View`);
        return;
    }
    
    viewElement.style.display = 'block';
    
    // Save current view to localStorage for all views
    localStorage.setItem('currentView', viewName);
    
    // Handle specific view initialization

    if (viewName === 'tournament')
        loadTournamentResources();
    else if (viewName === 'spaceShooter')
        startSpaceShooter();
    else if (viewName === 'profile')
        updateProfileInfo();
    else if (viewName === 'multiplayer')
        LoadMultiPlayerMood();
    else if (viewName === 'home')
        Cnt = 0;
    
    // Update active state in navigation
    document.querySelectorAll('.spa-link').forEach(link => {
        link.classList.remove('active');
        const linkPath = link.getAttribute('data-path');
        if (linkPath && linkPath.replace('/', '') === viewName) {
            link.classList.add('active');
        }
    });
}



function LoadMultiPlayerMood() {
    console.log("Loading multiplayer resources");
    // window.MultiGameEngine.init();
    // window.showView && window.showView('multiplayer');
    // Load multiplayer JS
    localStorage.setItem('currentView', 'multiplayer');
    // if (!window.MultiGameEngine) {
    //     alert("hererefff");
        const multipscript = document.createElement('script');
        multipscript.id = "multiGscript"
        multipscript.src = '../myultiPlayerGmae/main.js';
        multipscript.onload = function() {
            console.log("multiplayer script loaded");
            window.MultiGameEngine.initialized = true;
            
            // Initialize multiplayer after a short delay to ensure DOM is ready
            setTimeout(() => {
                if (typeof window.setupmultiplayerDirectly === 'function') {
                    console.log("Initializing multiplayer directly");
                    window.setupmultiplayerDirectly();
                }
                
                if (typeof callback === 'function') {
                    callback();
                }
            }, 100);
        };
        document.body.appendChild(multipscript);
    // }
}

function updateUserProfile(userData) {
    console.log("Updating user profile with data:", userData);
    
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    
    // Update username display
    if (userName && userData.name) {
        userName.textContent = userData.name;
        console.log("Set user name to:", userData.name);
    } else if (userName) {
        // Get user info from backend if we don't have it
        fetchUserInfo();
    }
    // Update avatar if available
    if (userAvatar && userData.image_url)
        userAvatar.src = userData.image_url;
    // Update language buttons when profile is updated
    updateLanguageButtons();
}

function fetchUserInfo() {
    console.log("Fetching user info from backend");
    
    const jwt = localStorage.getItem('jwt');
    if (!jwt) return Promise.resolve(null);
    
    return fetch('http://localhost:8000/api/user', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${jwt}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        return response.json();
    })
    .then(data => {
        console.log("Received user data from backend:", data);
        
        // Store user data in localStorage
        localStorage.setItem('userData', JSON.stringify(data));
        
        // Update UI with fetched data
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = data.name;
            console.log("Set user name to:", data.name);
        }
        
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar && data.image_url) {
            userAvatar.src = data.image_url;
        }
        
        return data;
    })
    .catch(error => {
        console.error("Error fetching user data:", error);
        return null;
    });
}

function logout() {
    const API_URL = 'http://localhost:8000';
    
    fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
    })
    .then(() => {
        // Clean up ALL localStorage items related to the app
        localStorage.removeItem('jwt');
        localStorage.removeItem('userData');
        localStorage.removeItem('isLoggedIn');
        
        // Important - clear view and game state
        localStorage.removeItem('currentView');
        localStorage.removeItem('currentMatch');
        localStorage.removeItem('matchResult');
        
        // Clear any session storage items too
        sessionStorage.clear();
        
        // Redirect to login page
        window.location.href = '/index.html';
    })
    .catch(error => {
        console.error('Error during logout:', error);
        
        // Force logout even if the server request fails
        // Clean up ALL localStorage items related to the app
        localStorage.removeItem('jwt');
        localStorage.removeItem('userData');
        localStorage.removeItem('isLoggedIn');
        
        // Important - clear view and game state
        localStorage.removeItem('currentView');
        localStorage.removeItem('currentMatch');
        localStorage.removeItem('matchResult');
        
        // Clear any session storage items too
        sessionStorage.clear();
        
        // Redirect to login page
        window.location.href = '/index.html';
    });
}

function startGame() {
    console.log("Starting regular game");
    
    // Show game view immediately
    document.querySelectorAll('.view').forEach(view => {
        view.style.display = 'none';
    });
    
    const gameView = document.getElementById('gameView');
    if (gameView) {
        gameView.style.display = 'block';
    } else {
        console.error("Game view not found!");
        return;
    }
    
    // Save view state specifically for regular games
    localStorage.setItem('currentView', 'game');
    localStorage.removeItem('currentMatch'); // Ensure we're in regular game mode
    
    // Load game resources
    loadGameResources(() => {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const player1 = userData.name || document.getElementById('userName')?.textContent || 'Player 1';
        
        console.log("Initializing game with player:", player1);
        
        // Initialize the game
        if (window.GameEngine) {
            window.GameEngine.init({
                player1: player1,
                player2: 'Player 2',
                winningScore: 5,
                onGameOver: function(winner, score1, score2) {
                    console.log(`Game over: ${winner} wins ${score1}-${score2}`);
                    
                    if (window.GameEngine.elements.finishButton) {
                        window.GameEngine.elements.finishButton.textContent = 'Return to Home';
                        window.GameEngine.elements.finishButton.style.display = 'flex';
                        
                        // Set up finish button handler
                        if (window.GameEngine.handlers.finish) {
                            window.GameEngine.elements.finishButton.removeEventListener('click', window.GameEngine.handlers.finish);
                        }
                        
                        window.GameEngine.handlers.finish = function() {
                            window.GameEngine.cleanup();
                            showView('home');
                        };
                        
                        window.GameEngine.elements.finishButton.addEventListener('click', window.GameEngine.handlers.finish);
                    }
                }
            });
        } else {
            console.error("GameEngine not found after loading resources!");
        }
    });
}

// Helper function to load game resources - this needs to be fixed
function loadGameResources(callback) {
    console.log("Loading game resources");
    
    // Check if game resources are already loaded - UPDATED CHECK
    if (window.GameEngine && document.getElementById('gameCssLoaded')) {
        console.log("Game resources already loaded");
        callback();
        return;
    }
    
    // Load game CSS
    if (!document.getElementById('gameCssLoaded')) {
        console.log("Loading game CSS");
        const gameCss = document.createElement('link');
        gameCss.id = 'gameCssLoaded';
        gameCss.rel = 'stylesheet';
        gameCss.href = '../game/game.css';
        document.head.appendChild(gameCss);
    }
    
    // Load game JS - UPDATED CHECK
    if (!window.GameEngine) {
        console.log("Loading game JS");
        const gameScript = document.createElement('script');
        gameScript.id = "UpldgameScript"
        gameScript.src = '../game/game.js';
        gameScript.onload = function() {
            console.log("Game script loaded");
            setTimeout(callback, 100); // Give it time to initialize
        };
        document.body.appendChild(gameScript);
    } else {
        callback();
    }
}

function joinTournament() {
    // Switch to tournament view
    showView('tournament');
    
    // Load tournament resources if not already loaded
    loadTournamentResources();
}

function createTournament() {
    // Switch to tournament view
    showView('tournament');
    
    // Load tournament resources if not already loaded
    loadTournamentResources();
}

// Helper function to load tournament resources
function loadTournamentResources(callback) {
    globalThis.IsAI = 0;
    console.log("Loading tournament resources");
    
    // Load tournament CSS
    if (!document.getElementById('tournamentCssLoaded')) {
        const tournamentCss = document.createElement('link');
        tournamentCss.id = 'tournamentCssLoaded';
        tournamentCss.rel = 'stylesheet';
        tournamentCss.href = '../tournament/tournament.css';
        document.head.appendChild(tournamentCss);
    }
    
    // Load tournament JS
    if (!window.tournamentInitialized && !document.getElementById("upldtournamentScript")) {
        const tournamentScript = document.createElement('script');
        tournamentScript.id = "upldtournamentScript"
        tournamentScript.src = '../tournament/tournament.js';
        tournamentScript.onload = function() {
            console.log("Tournament script loaded");
            window.tournamentInitialized = true;
            
            // Initialize tournament after a short delay to ensure DOM is ready
            setTimeout(() => {
                if (typeof window.setupTournamentDirectly === 'function') {
                    console.log("Initializing tournament directly");
                    window.setupTournamentDirectly();
                }
                
                if (typeof callback === 'function') {
                    callback();
                }
            }, 100);
        };
        document.body.appendChild(tournamentScript);
    } else {
        // Scripts already loaded, just call the callback
        if (typeof window.setupTournamentDirectly === 'function') {
            window.setupTournamentDirectly();
        }
        
        if (typeof callback === 'function') {
            setTimeout(callback, 10);
        }
    }
}

// Updated startTournamentGame function to properly map player names
function startTournamentGame() {
    console.log("Starting tournament game");
    
    // Get the current match data
    const currentMatchStr = localStorage.getItem('currentMatch');
    if (!currentMatchStr) {
        console.error("No current match data found");
        showView('tournament');
        return;
    }
    
    const currentMatch = JSON.parse(currentMatchStr);
    console.log("Tournament match data:", currentMatch);
    
    // Show game view
    document.querySelectorAll('.view').forEach(view => {
        view.style.display = 'none';
    });
    
    const gameView = document.getElementById('gameView');
    if (!gameView) {
        console.error("Game view not found");
        return;
    }
    
    gameView.style.display = 'block';
    
    // Reset player name elements in the DOM before game init
    const player1El = document.getElementById('player1Name');
    const player2El = document.getElementById('player2Name');
    
    if (player1El) {
        player1El.innerHTML = '<i class="fas fa-user"></i><span>Player 1</span>';
    }
    if (player2El) {
        player2El.innerHTML = '<i class="fas fa-user"></i><span>Player 2</span>';
    }
    
    // Load game resources and initialize the game
    loadGameResources(() => {
        if (!window.GameEngine) {
            console.error("GameEngine not available");
            return;
        }
        
        // Make sure we have the most updated player names
        console.log(`Initializing tournament game: ${currentMatch.player1} vs ${currentMatch.player2}`);
        
        window.GameEngine.init({
            player1: currentMatch.player1,
            player2: currentMatch.player2,
            winningScore: 3, // Tournament games are shorter
            onGameOver: function(winner, score1, score2) {
                console.log(`Tournament match completed: ${winner} wins ${score1}-${score2}`);
                
                // FIX: Map "Player 1" or "Player 2" to the actual player name
                let actualWinner;
                if (winner === "Player 1") {
                    actualWinner = currentMatch.player1;
                } else if (winner === "Player 2") {
                    actualWinner = currentMatch.player2;
                } else {
                    actualWinner = winner; // In case it's already the correct name
                }
                
                // Save result with correct player name
                localStorage.setItem('matchResult', JSON.stringify({
                    winner: actualWinner,
                    score: `${score1}-${score2}`
                }));
                
                // Update finish button
                if (window.GameEngine.elements.finishButton) {
                    window.GameEngine.elements.finishButton.textContent = 'Return to Tournament';
                    window.GameEngine.elements.finishButton.style.display = 'flex';
                    
                    // Set up finish button handler
                    if (window.GameEngine.handlers.finish) {
                        window.GameEngine.elements.finishButton.removeEventListener('click', window.GameEngine.handlers.finish);
                    }
                    
                    window.GameEngine.handlers.finish = function() {
                        window.GameEngine.cleanup();
                        showView('tournament');
                    };
                    
                    window.GameEngine.elements.finishButton.addEventListener('click', window.GameEngine.handlers.finish);
                }
            }
        });
    });
}

// Export this function for tournament.js to use
window.startTournamentGame = startTournamentGame;

// Export the fetchUserInfo function for tournament use
window.fetchUserInfo = fetchUserInfo;

// Update profile info handling
function updateProfileInfo() {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // If no data, try to fetch it
    if (!userData.name || !userData.email) {
        fetchUserInfo().then(data => {
            if (data) {
                updateProfileDisplay(data);
                setupProfileEditors(data);
                checkOAuthUser();
            }
        });
    } else {
        updateProfileDisplay(userData);
        setupProfileEditors(userData);
        checkOAuthUser();
    }
}

// Function to set up profile edit functionality
function setupProfileEditors(userData) {
    // Set up edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        const field = btn.getAttribute('data-field');
        
        btn.addEventListener('click', () => {
            // Hide the display, show the edit field
            const parent = btn.closest('.profile-field');
            
            // Get current value
            const currentValue = field === 'name' ? userData.name : userData.email;
            
            // Set input value
            const input = document.getElementById(`${field}Input`);
            if (input) input.value = currentValue;
            
            // Toggle display/edit mode
            parent.querySelector('h2, p').style.display = 'none';
            parent.querySelector('.edit-field').style.display = 'flex';
        });
    });
    
    // Set up cancel buttons
    document.querySelectorAll('.cancel-field-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.closest('.profile-field');
            parent.querySelector('h2, p').style.display = 'block';
            parent.querySelector('.edit-field').style.display = 'none';
        });
    });
    
    // Set up save field buttons
    document.querySelectorAll('.save-field-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.getAttribute('data-field');
            const input = document.getElementById(`${field}Input`);
            const value = input.value.trim();
            
            if (!value) return;
            
            // Update local display
            const displayEl = field === 'name' ? document.getElementById('profileName') : document.getElementById('profileEmail');
            displayEl.textContent = value;
            
            // Update local data
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            userData[field] = value;
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Update UI
            updateUserProfile(userData);
            
            // Switch back to display mode
            const parent = btn.closest('.profile-field');
            parent.querySelector('h2, p').style.display = 'block';
            parent.querySelector('.edit-field').style.display = 'none';
        });
    });
    
    // Set up avatar upload
    const avatarUpload = document.getElementById('avatarUpload');
    avatarUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Preview image
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('profileAvatar').src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
    
    // Set up save button
    document.getElementById('saveProfileButton').addEventListener('click', () => {
        saveProfile();
    });
}

// Function to save all profile changes
function saveProfile() {
    const statusEl = document.getElementById('profileUpdateStatus');
    statusEl.className = 'update-status';
    statusEl.textContent = 'Saving changes...';
    statusEl.style.display = 'block';
    
    // Get updated user data
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Check if we have a file to upload
    const avatarInput = document.getElementById('avatarUpload');
    const avatarFile = avatarInput.files[0];
    
    // Create form data for the update
    const formData = new FormData();
    formData.append('name', userData.name || '');
    formData.append('email', userData.email || '');
    
    if (avatarFile) {
        formData.append('avatar', avatarFile);
    }
    
    // Send update to server
    fetch('http://localhost:8000/api/user/update', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update profile');
        }
        return response.json();
    })
    .then(data => {
        console.log('Profile updated:', data);
        
        // Update localStorage with new data
        localStorage.setItem('userData', JSON.stringify(data));
        
        // Update all UI elements
        updateUserProfile(data);
        updateProfileDisplay(data);
        
        // Show success message
        statusEl.className = 'update-status success';
        statusEl.textContent = 'Profile updated successfully!';
        
        // Clear file input
        avatarInput.value = '';
        
        // Hide message after a delay
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 3000);
    })
    .catch(error => {
        console.error('Error updating profile:', error);
        
        // Show error message
        statusEl.className = 'update-status error';
        statusEl.textContent = 'Failed to update profile. Please try again.';
        
        // Hide message after a delay
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 3000);
    });
}

// Function to update profile display elements
function updateProfileDisplay(userData) {
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (profileName && userData.name) {
        profileName.textContent = userData.name;
    }
    
    if (profileEmail && userData.email) {
        profileEmail.textContent = userData.email;
    }
    
    if (profileAvatar && userData.image_url) {
        profileAvatar.src = userData.image_url;
    }
}

// Update the changePassword function to better handle OAuth users
function changePassword() {
    const statusEl = document.getElementById('passwordUpdateStatus');
    statusEl.className = 'update-status';
    statusEl.textContent = 'Updating password...';
    statusEl.style.display = 'block';
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Check if this is an OAuth user by seeing if the current password container is hidden
    const currentPasswordContainer = document.getElementById('currentPasswordContainer');
    const isCurrentPasswordVisible = currentPasswordContainer && 
        window.getComputedStyle(currentPasswordContainer).display !== 'none';
    
    console.log('Is current password field visible:', isCurrentPasswordVisible);
    
    // Basic validation for new password
    if (!newPassword) {
        statusEl.className = 'update-status error';
        statusEl.textContent = 'Please enter a new password';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        statusEl.className = 'update-status error';
        statusEl.textContent = 'New passwords do not match';
        return;
    }
    
    if (newPassword.length < 6) {
        statusEl.className = 'update-status error';
        statusEl.textContent = 'Password must be at least 6 characters';
        return;
    }
    
    // Only validate current password if it's required (not OAuth)
    if (isCurrentPasswordVisible && !currentPassword) {
        statusEl.className = 'update-status error';
        statusEl.textContent = 'Please enter your current password';
        return;
    }
    
    // Send password change request
    fetch('http://localhost:8000/api/user/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'Failed to change password');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Password updated:', data);
        
        // Show success message
        statusEl.className = 'update-status success';
        statusEl.textContent = 'Password updated successfully!';
        
        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        // Hide message after a delay
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 3000);
    })
    .catch(error => {
        console.error('Error updating password:', error);
        
        // Show error message
        statusEl.className = 'update-status error';
        statusEl.textContent = error.message || 'Failed to update password. Please try again.';
    });
}

// Check if user is an OAuth user and adjust password form accordingly
function checkOAuthUser() {
    const jwt = localStorage.getItem('jwt');
    
    if (!jwt) {
        console.error('No JWT token found, cannot check OAuth status');
        return;
    }

    fetch('http://localhost:8000/api/user/is-oauth', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${jwt}`
        }
    })
    .then(response => {
        console.log('OAuth check response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('OAuth user check response:', data);
        
        // Only proceed if user is authenticated
        if (!data.authenticated) {
            console.error('User not authenticated for OAuth check, will try again after fetching user info');
            // Try to refresh user data and token
            fetchUserInfo().then(() => {
                console.log('Retrying OAuth check after user info refresh');
                setTimeout(checkOAuthUser, 1000); // Try again after 1 second
            });
            return;
        }
        
        const currentPasswordField = document.getElementById('currentPasswordContainer');
        const passwordTitle = document.querySelector('.password-section h3');
        const passwordInstructions = document.getElementById('passwordInstructions');
        
        if (data.is_oauth) {
            // OAuth user - hide current password field
            if (currentPasswordField) currentPasswordField.style.display = 'none';
            
            // Update title and add instructions
            if (passwordTitle) passwordTitle.textContent = 'Set Password';
            if (passwordInstructions) {
                passwordInstructions.textContent = 'As a 42 user, you can set a password to login directly in the future.';
                passwordInstructions.style.display = 'block';
            }
        } else {
            // Regular user - show current password field
            if (currentPasswordField) currentPasswordField.style.display = 'block';
            
            // Update title
            if (passwordTitle) passwordTitle.textContent = 'Change Password';
            if (passwordInstructions) passwordInstructions.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error checking OAuth status:', error);
    });
}

// Add this function to update the active language button
function updateLanguageButtons() {
    const currentLang = localStorage.getItem('language') || 'en';
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-language') === currentLang) {
            btn.classList.add('active');
        }
    });
}

// Helper function to load space shooter resources
function loadSpaceShooterResources(callback) {
    console.log("Loading Space Shooter resources");
    
    // Ensure the CSS is properly loaded but inactive until needed
    const spaceShooterStyles = document.getElementById('spaceShooterStyles');
    if (spaceShooterStyles) {
        spaceShooterStyles.media = "none"; // Make sure it's disabled initially
    }
    
    // Load JS if not already loaded
    if (!window.SpaceShooter) {
        console.log("Loading Space Shooter JS");
        const spaceShooterScript = document.createElement('script');
        spaceShooterScript.id = "spaceShtrScript"
        spaceShooterScript.src = '../space-shooter/space-shooter.js';
        spaceShooterScript.onload = function() {
            console.log("Space Shooter script loaded");
            
            // Now that the JS is loaded, enable the CSS
            if (document.getElementById('spaceShooterView').style.display === 'block') {
                spaceShooterStyles.media = "all";
            }
            
            setTimeout(callback, 100); // Give it time to initialize
        };
        document.body.appendChild(spaceShooterScript);
    } else {
        // If JS is already loaded and we're showing the space shooter view,
        // make sure CSS is enabled
        if (document.getElementById('spaceShooterView').style.display === 'block') {
            spaceShooterStyles.media = "all";
        }
        callback();
    }
}

// Start Space Shooter game
function startSpaceShooter() {
    console.log("Starting Space Shooter game");
    
    // Show space shooter view immediately
    document.querySelectorAll('.view').forEach(view => {
        view.style.display = 'none';
    });
    
    const spaceShooterView = document.getElementById('spaceShooterView');
    if (spaceShooterView) {
        spaceShooterView.style.display = 'block';
    } else {
        console.error("Space Shooter view not found!");
        return;
    }
    
    // Save view state
    localStorage.setItem('currentView', 'spaceShooter');
    
    // Load resources
    loadSpaceShooterResources(() => {
        if (window.SpaceShooter) {
            window.SpaceShooter.init();
        } else {
            console.error("SpaceShooter not found after loading resources!");
        }
    });
} 