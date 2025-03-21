// Tournament System
const Tournament = {
    // Tournament state
    state: {
        players: [],
        rounds: [],
        currentMatchId: null,
        isComplete: false
    },
    
    // Initialize tournament system
    init: function() {
        console.log("Initializing tournament system");
        
        // Fetch user data if needed
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (!userData.name && typeof window.fetchUserInfo === 'function') {
            window.fetchUserInfo();
        }
        
        // Clear any standalone game data
        localStorage.removeItem('currentGame');
        
        // Attach event listeners
        this.attachEventListeners();
        
        // Try to restore state if exists
        this.loadState();
        
        // Check for match results
        this.checkMatchResults();
        
        // Update UI based on current state
        this.updateUI();
    },
    
    // Attach all event listeners
    attachEventListeners: function() {
        // Player count buttons
        const countButtons = document.querySelectorAll('#tournamentView .count-button');
        countButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Activate this button
                countButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Create player inputs
                const playerCount = parseInt(button.dataset.count);
                this.createPlayerInputs(playerCount);
                
                // Show player inputs section
                document.querySelector('.player-inputs').classList.add('show');
                
                // Update progress indicator
                this.setActiveStep(1);
            });
        });
        
        // Generate bracket button
        const generateButton = document.querySelector('.generate-bracket-button');
        if (generateButton) {
            generateButton.addEventListener('click', () => this.generateTournament());
        }
        
        // Start match button
        const startButton = document.querySelector('.start-button');
        if (startButton) {
            startButton.addEventListener('click', () => this.startNextMatch());
        }
        
        // Restart tournament button
        const restartButton = document.querySelector('.restart-tournament-btn');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.resetTournament());
        }
    },
    
    // Create input fields for players
    createPlayerInputs: function(count) {
        const container = document.getElementById('players-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Get logged in user data - improved username retrieval
        let loggedInUserName = 'Player 1';
        
        // First try to get it from localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData && userData.name) {
            loggedInUserName = userData.name;
        } 
        // Then try to get it from the DOM
        else if (document.getElementById('userName') && document.getElementById('userName').textContent) {
            loggedInUserName = document.getElementById('userName').textContent.trim();
        }
        
        console.log("Setting up tournament with user:", loggedInUserName);
        
        // First input is always for the logged-in user
        const userInputDiv = document.createElement('div');
        userInputDiv.className = 'player-input user-player';
        userInputDiv.innerHTML = `
            <input type="text" value="${loggedInUserName}" class="player-name-input" readonly>
            <span class="user-badge">You</span>
        `;
        container.appendChild(userInputDiv);
        
        // Create remaining player inputs with AI players by default
        for (let i = 1; i < count; i++) {
            const inputDiv = document.createElement('div');
            inputDiv.className = 'player-input';
            inputDiv.innerHTML = `<input type="text" value="AI Player ${i}" class="player-name-input">`;
            container.appendChild(inputDiv);
        }
    },
    
    // Generate tournament from player inputs
    generateTournament: function() {
        // Get player names from inputs
        const inputs = document.querySelectorAll('.player-name-input');
        const players = [];
        let allFilled = true;
        
        inputs.forEach(input => {
            const name = input.value.trim();
            if (!name) {
                allFilled = false;
            } else {
                players.push(name);
            }
        });
        
        // Check that all inputs are filled
        if (!allFilled) {
            document.querySelector('.error-message').classList.add('show');
            return;
        } else {
            document.querySelector('.error-message').classList.remove('show');
        }
        
        // Store player names
        this.state.players = this.shuffleArray(players);
        
        // Generate rounds
        this.generateRounds();
        
        // Show tournament bracket
        this.showBracket();
        
        // Hide setup section
        document.querySelector('.setup-section').classList.add('hide');
        
        // Show tournament container
        document.querySelector('.tournament-container').classList.add('show');
        
        // Show start button
        document.querySelector('.start-button').style.display = 'block';
        
        // Update progress steps
        this.setActiveStep(2);
        
        // Save tournament state
        this.saveState();
        
        console.log("Tournament generated with players:", this.state.players);
    },
    
    // Generate tournament rounds
    generateRounds: function() {
        this.state.rounds = [];
        
        // Create first round matches
        const firstRound = {
            name: 'Round 1',
            matches: []
        };
        
        // Create matches based on player count
        for (let i = 0; i < this.state.players.length; i += 2) {
            if (i + 1 < this.state.players.length) {
                firstRound.matches.push({
                    id: `match-${this.state.rounds.length}-${firstRound.matches.length}`,
                    player1: this.state.players[i],
                    player2: this.state.players[i + 1],
                    winner: null,
                    score: null
                });
            } else {
                // Handle odd number of players with a "bye"
                firstRound.matches.push({
                    id: `match-${this.state.rounds.length}-${firstRound.matches.length}`,
                    player1: this.state.players[i],
                    player2: 'BYE',
                    winner: this.state.players[i],
                    score: 'BYE'
                });
            }
        }
        
        this.state.rounds.push(firstRound);
    },
    
    // Show the bracket in the UI
    showBracket: function() {
        const bracket = document.getElementById('tournament-bracket');
        if (!bracket) return;
        
        bracket.innerHTML = '';
        
        // Create rounds
        this.state.rounds.forEach((round, roundIndex) => {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'round';
            
            const roundHeader = document.createElement('div');
            roundHeader.className = 'round-header';
            roundHeader.textContent = round.name;
            roundDiv.appendChild(roundHeader);
            
            // Special highlight for final round
            if (round.matches.length === 1 && roundIndex === this.state.rounds.length - 1) {
                roundDiv.classList.add('final-round');
                roundHeader.textContent = 'Final';
            }
            
            // Create matches
            round.matches.forEach(match => {
                const matchDiv = document.createElement('div');
                matchDiv.className = 'match';
                matchDiv.setAttribute('data-match-id', match.id);
                
                // Player 1
                const player1Div = document.createElement('div');
                player1Div.className = 'match-player';
                if (match.winner === match.player1) player1Div.classList.add('winner');
                
                const player1Name = document.createElement('span');
                player1Name.className = 'player-name';
                player1Name.textContent = match.player1;
                player1Div.appendChild(player1Name);
                
                // Player 2
                const player2Div = document.createElement('div');
                player2Div.className = 'match-player';
                if (match.winner === match.player2) player2Div.classList.add('winner');
                
                const player2Name = document.createElement('span');
                player2Name.className = 'player-name';
                player2Name.textContent = match.player2;
                player2Div.appendChild(player2Name);
                
                // Match status
                const matchStatus = document.createElement('div');
                matchStatus.className = 'match-status';
                
                if (match.winner) {
                    matchStatus.classList.add('complete');
                    matchStatus.innerHTML = `<i class="fas fa-check-circle"></i> ${match.score || 'Complete'}`;
                } else {
                    matchStatus.classList.add('pending');
                    matchStatus.innerHTML = '<i class="fas fa-clock"></i> Pending';
                }
                
                // Append all elements to match div
                matchDiv.appendChild(player1Div);
                matchDiv.appendChild(player2Div);
                matchDiv.appendChild(matchStatus);
                
                // Add to round
                roundDiv.appendChild(matchDiv);
            });
            
            // Add round to bracket
            bracket.appendChild(roundDiv);
        });
        
        // Special handling for the tournament winner
        if (this.state.isComplete) {
            const winner = this.getWinner();
            if (winner) {
                this.showWinner(winner);
            }
        }
    },
    
    // Check for match results from completed games
    checkMatchResults: function() {
        console.log("Checking for match results");
        
        const matchResult = localStorage.getItem('matchResult');
        if (!matchResult) return;
        
        try {
            const result = JSON.parse(matchResult);
            const currentMatchId = this.state.currentMatchId;
            
            if (!currentMatchId) {
                console.log("No current match ID found");
                localStorage.removeItem('matchResult');
                return;
            }
            
            console.log(`Processing result for match ${currentMatchId}: Winner=${result.winner}`);
            
            // Find the match and update it
            let match = null;
            let matchRoundIndex = -1;
            
            for (let i = 0; i < this.state.rounds.length; i++) {
                const round = this.state.rounds[i];
                const foundMatch = round.matches.find(m => m.id === currentMatchId);
                if (foundMatch) {
                    match = foundMatch;
                    matchRoundIndex = i;
                    break;
                }
            }
            
            if (match) {
                // Update the match with the result
                match.winner = result.winner;
                match.score = result.score;
                
                console.log(`Updated match ${match.id}: Winner = ${match.winner}`);
                
                // Check if round is complete
                const round = this.state.rounds[matchRoundIndex];
                const isRoundComplete = round.matches.every(m => m.winner);
                
                if (isRoundComplete) {
                    console.log(`Round ${matchRoundIndex + 1} complete`);
                    
                    // Check if this was the final round
                    if (round.matches.length === 1) {
                        console.log("Final match complete! Tournament winner:", match.winner);
                        this.state.isComplete = true;
                        this.showWinner(match.winner);
                    } else if (matchRoundIndex === this.state.rounds.length - 1) {
                        // This was the last round but not a single match, create final round
                        console.log("Moving to final round");
                        this.advanceWinners(matchRoundIndex);
                    }
                }
                
                // Save the updated state
                this.saveState();
                
                // Update the UI
                this.updateUI();
            }
            
            // Clear the match result from localStorage
            localStorage.removeItem('matchResult');
            localStorage.removeItem('currentMatch');
            this.state.currentMatchId = null;
            
        } catch (error) {
            console.error("Error processing match result:", error);
            localStorage.removeItem('matchResult');
        }
    },
    
    // Start the next pending match
    startNextMatch: function() {
        console.log("Starting next tournament match");
        
        // Find the next pending match
        let nextMatch = null;
        
        for (let i = 0; i < this.state.rounds.length; i++) {
            const round = this.state.rounds[i];
            for (let j = 0; j < round.matches.length; j++) {
                if (!round.matches[j].winner) {
                    nextMatch = round.matches[j];
                    break;
                }
            }
            if (nextMatch) break;
        }
        
        if (nextMatch) {
            console.log(`Found next match: ${nextMatch.player1} vs ${nextMatch.player2}`);
            
            // Store the current match ID
            this.state.currentMatchId = nextMatch.id;
            this.saveState();
            
            // Store match info for the game engine
            localStorage.setItem('currentMatch', JSON.stringify({
                id: nextMatch.id,
                player1: nextMatch.player1,
                player2: nextMatch.player2,
                roundIndex: nextMatch.roundIndex,
                isTournament: true
            }));
            
            // Navigate to game view (using showView from mainpage.js)
            if (typeof window.startTournamentGame === 'function') {
                window.startTournamentGame();
            } else {
                console.error("startTournamentGame function not found");
                
                // Fallback direct navigation
                const gameView = document.getElementById('gameView');
                if (gameView) {
                    document.querySelectorAll('.view').forEach(view => {
                        view.style.display = 'none';
                    });
                    gameView.style.display = 'block';
                    
                    // Initialize game directly if GameEngine exists
                    if (window.GameEngine) {
                        window.GameEngine.init({
                            player1: nextMatch.player1,
                            player2: nextMatch.player2,
                            winningScore: 3,
                            onGameOver: function(winner, score1, score2) {
                                console.log(`Tournament match completed: ${winner} wins ${score1}-${score2}`);
                                
                                localStorage.setItem('matchResult', JSON.stringify({
                                    winner: winner,
                                    score: `${score1}-${score2}`
                                }));
                                
                                if (window.GameEngine.elements.finishButton) {
                                    window.GameEngine.elements.finishButton.textContent = 'Return to Tournament';
                                    window.GameEngine.elements.finishButton.style.display = 'flex';
                                    
                                    if (window.GameEngine.handlers.finish) {
                                        window.GameEngine.elements.finishButton.removeEventListener('click', window.GameEngine.handlers.finish);
                                    }
                                    
                                    window.GameEngine.handlers.finish = function() {
                                        window.GameEngine.cleanup();
                                        window.showView && window.showView('tournament');
                                    };
                                    
                                    window.GameEngine.elements.finishButton.addEventListener('click', window.GameEngine.handlers.finish);
                                }
                            }
                        });
                    }
                }
            }
        } else {
            console.log("No pending matches found");
        }
    },
    
    // Start a tournament game directly using the Game Engine
    startTournamentGame: function(match) {
        console.log('Starting tournament match:', match);
        
        // Show game view
        document.querySelectorAll('.view').forEach(view => {
            view.style.display = 'none';
        });
        document.getElementById('gameView').style.display = 'block';
        
        // Load game resources
        if (!window.GameEngine) {
            const script = document.createElement('script');
            script.src = '../game/game.js';
            script.onload = () => this.initializeTournamentGame(match);
            document.body.appendChild(script);
        } else {
            this.initializeTournamentGame(match);
        }
    },
    
    // Initialize the game with tournament settings
    initializeTournamentGame: function(match) {
        // Initialize game engine with tournament settings
        window.GameEngine.init({
            player1: match.player1,
            player2: match.player2,
            winningScore: 3, // Tournament games need less points to win
            onGameOver: (winner, score1, score2) => {
                console.log(`Tournament match completed: ${winner} wins ${score1}-${score2}`);
                
                // Save match result
                localStorage.setItem('matchResult', JSON.stringify({
                    winner: winner,
                    score: `${score1}-${score2}`
                }));
                
                // Update finish button to return to tournament
                if (window.GameEngine.elements.finishButton) {
                    window.GameEngine.elements.finishButton.textContent = 'Return to Tournament';
                    window.GameEngine.elements.finishButton.style.display = 'flex';
                    
                    // Replace the button click handler
                    if (window.GameEngine.handlers.finish) {
                        window.GameEngine.elements.finishButton.removeEventListener('click', window.GameEngine.handlers.finish);
                    }
                    
                    window.GameEngine.handlers.finish = () => {
                        window.GameEngine.cleanup();
                        window.showView('tournament');
                    };
                    
                    window.GameEngine.elements.finishButton.addEventListener('click', window.GameEngine.handlers.finish);
                }
            }
        });
    },
    
    // Get the tournament winner
    getWinner: function() {
        // If tournament is complete, get the winner from the final match
        if (this.state.isComplete && this.state.rounds.length > 0) {
            const finalRound = this.state.rounds[this.state.rounds.length - 1];
            if (finalRound.matches.length > 0) {
                return finalRound.matches[0].winner;
            }
        }
        return null;
    },
    
    // Show the winner announcement
    showWinner: function(winner) {
        // Check if winner announcement already exists
        if (document.querySelector('.winner-announcement')) {
            return;
        }
        
        console.log("Showing winner announcement for:", winner);
        
        const tournamentView = document.getElementById('tournamentView');
        if (!tournamentView) return;
        
        const winnerAnnouncement = document.createElement('div');
        winnerAnnouncement.className = 'winner-announcement';
        winnerAnnouncement.innerHTML = `
            <div class="winner-trophy">🏆</div>
            <h2>Tournament Champion</h2>
            <div class="winner-name">${winner}</div>
            <p>Congratulations to the tournament winner!</p>
            <button class="new-tournament-btn">Start New Tournament</button>
        `;
        
        tournamentView.appendChild(winnerAnnouncement);
        
        // Add event listener to new tournament button
        const newTournamentBtn = winnerAnnouncement.querySelector('.new-tournament-btn');
        if (newTournamentBtn) {
            newTournamentBtn.addEventListener('click', () => {
                this.resetTournament();
                winnerAnnouncement.remove();
            });
        }
    },
    
    // Reset tournament
    resetTournament: function() {
        console.log("Resetting tournament");
        
        // Clear tournament state
        this.state = {
            players: [],
            rounds: [],
            currentMatchId: null,
            isComplete: false
        };
        
        // Clear localStorage
        localStorage.removeItem('tournamentState');
        localStorage.removeItem('currentMatch');
        localStorage.removeItem('matchResult');
        
        // Show setup section
        const setupSection = document.querySelector('.setup-section');
        if (setupSection) {
            setupSection.classList.remove('hide');
        }
        
        // Hide tournament container
        const tournamentContainer = document.querySelector('.tournament-container');
        if (tournamentContainer) {
            tournamentContainer.classList.remove('show');
        }
        
        // Reset player count buttons
        document.querySelectorAll('.count-button').forEach(btn => btn.classList.remove('active'));
        
        // Clear player inputs
        const playersContainer = document.getElementById('players-container');
        if (playersContainer) {
            playersContainer.innerHTML = '';
        }
        
        // Remove winner announcement
        const announcement = document.querySelector('.winner-announcement');
        if (announcement) announcement.remove();
        
        // Reset progress steps
        this.setActiveStep(0);
        
        // Make sure tournament view is visible
        document.querySelector('#tournamentView').style.display = 'block';
        
        console.log("Tournament has been reset");
    },
    
    // Save state to localStorage
    saveState: function() {
        try {
            console.log("Saving tournament state:", this.state);
            localStorage.setItem('tournamentState', JSON.stringify(this.state));
        } catch (error) {
            console.error("Error saving tournament state:", error);
        }
    },
    
    // Load state from localStorage
    loadState: function() {
        try {
            const savedState = localStorage.getItem('tournamentState');
            if (savedState) {
                console.log("Found saved tournament state");
                this.state = JSON.parse(savedState);
                
                // Update UI based on loaded state
                if (this.state.players.length > 0) {
                    // Hide setup section
                    document.querySelector('.setup-section').classList.add('hide');
                    
                    // Show tournament container
                    document.querySelector('.tournament-container').classList.add('show');
                    
                    // Update start button visibility
                    const hasNextMatch = this.hasNextMatch();
                    document.querySelector('.start-button').style.display = hasNextMatch ? 'block' : 'none';
                    
                    // Set active step to bracket view
                    this.setActiveStep(2);
                }
            } else {
                console.log("No saved tournament state found");
            }
        } catch (error) {
            console.error("Error loading tournament state:", error);
        }
    },
    
    // Update UI based on current state
    updateUI: function() {
        if (this.state.rounds.length > 0) {
            // We have tournament data, show the bracket
            this.showBracket();
            
            // Hide setup section
            document.querySelector('.setup-section').classList.add('hide');
            
            // Update progress step
            this.setActiveStep(this.state.isComplete ? 3 : 2);
            
            // Show/hide start button based on state
            const startButton = document.querySelector('.start-button');
            if (startButton) {
                startButton.style.display = this.state.isComplete ? 'none' : 'block';
            }
        }
    },
    
    // Set active step in progress indicator
    setActiveStep: function(stepIndex) {
        document.querySelectorAll('.step').forEach((step, index) => {
            if (index <= stepIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    },
    
    // Shuffle array (Fisher-Yates algorithm)
    shuffleArray: function(array) {
        const arrayCopy = [...array];
        for (let i = arrayCopy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
        }
        return arrayCopy;
    },
    
    // Add method to create next round
    createNextRound: function(completedRound) {
        // Get index of completed round
        const roundIndex = this.state.rounds.findIndex(r => r === completedRound);
        
        // Get winners from completed round
        const winners = completedRound.matches.map(m => m.winner);
        
        // If only one winner, tournament is complete
        if (winners.length === 1) {
            this.state.isComplete = true;
            return;
        }
        
        // Create matches for next round
        const nextRound = {
            name: `Round ${roundIndex + 2}`,
            matches: []
        };
        
        // Create matches pairing winners
        for (let i = 0; i < winners.length; i += 2) {
            if (i + 1 < winners.length) {
                // Normal match between two winners
                nextRound.matches.push({
                    id: `match-${roundIndex + 1}-${i/2}`,
                    player1: winners[i],
                    player2: winners[i + 1],
                    winner: null,
                    score: null,
                    roundIndex: roundIndex + 1
                });
            } else {
                // Last player gets a bye if odd number
                nextRound.matches.push({
                    id: `match-${roundIndex + 1}-${i/2}`,
                    player1: winners[i],
                    player2: 'BYE',
                    winner: winners[i],
                    score: 'BYE',
                    roundIndex: roundIndex + 1
                });
            }
        }
        
        // Add new round to tournament
        this.state.rounds.push(nextRound);
        
        console.log(`Created next round with ${nextRound.matches.length} matches`);
    },
    
    // Check if tournament is complete
    checkTournamentComplete: function() {
        // Check if all rounds are complete
        const isComplete = this.state.rounds.every(round => round.matches.every(match => match.winner));
        this.state.isComplete = isComplete;
        
        // Update UI
        this.updateUI();
    },
    
    // Add method to advance winners to next round
    advanceWinners: function(roundIndex) {
        console.log(`Advancing winners from round ${roundIndex}`);
        
        // Get winners from the completed round
        const winners = this.state.rounds[roundIndex].matches.filter(m => m.winner).map(m => m.winner);
        
        console.log(`Winners advancing: ${winners.join(', ')}`);
        
        // If only one winner, tournament is complete
        if (winners.length === 1) {
            console.log('Only one winner, tournament complete!');
            this.state.isComplete = true;
            this.showWinner(winners[0]);
            return;
        }
        
        // Create next round
        const nextRound = {
            name: `Round ${roundIndex + 2}`,
            matches: []
        };
        
        // Create matches for next round
        for (let i = 0; i < winners.length; i += 2) {
            if (i + 1 < winners.length) {
                // Normal match between two winners
                nextRound.matches.push({
                    id: `match-${roundIndex + 1}-${i/2}`,
                    player1: winners[i],
                    player2: winners[i + 1],
                    winner: null,
                    score: null,
                    roundIndex: roundIndex + 1
                });
            } else {
                // Last player gets a bye if odd number
                nextRound.matches.push({
                    id: `match-${roundIndex + 1}-${i/2}`,
                    player1: winners[i],
                    player2: 'BYE',
                    winner: winners[i],
                    score: 'BYE',
                    roundIndex: roundIndex + 1
                });
            }
        }
        
        // Add new round to tournament
        this.state.rounds.push(nextRound);
        
        console.log(`Created next round with ${nextRound.matches.length} matches`);
        
        // Check if this is the final round (only 1 match)
        if (nextRound.matches.length === 1) {
            console.log('Created final round with 1 match');
        }
    }
};

// Make Tournament globally accessible
window.Tournament = Tournament;

// Expose functions needed by mainpage.js
window.setupTournamentDirectly = function() {
    Tournament.init();
};

window.resetTournament = function() {
    Tournament.resetTournament();
}; 