let selectedPlayerCount = 0;
let players = [];
let tournamentState = {
    currentRound: 0,
    matches: [],
    results: {},
    currentMatch: null
};

// Update start button click handler
document.querySelector('.start-button').addEventListener('click', function() {
    const currentMatch = tournamentState.matches.find(match => match.winner === null);
    if (currentMatch) {
        localStorage.setItem('currentMatch', JSON.stringify(currentMatch));
        router.navigate('/tournament/main.html', '/game/game.html');
    }
}); 

// Add at the beginning of file
window.addEventListener('load', () => {
    // Load saved tournament state if it exists
    const savedState = localStorage.getItem('tournamentState');
    if (savedState) {
        tournamentState = JSON.parse(savedState);
    }
    
    // Check for match results when returning from game
    // const matchResult = localStorage.getItem('matchResult');
    // if (matchResult) {
    //     updateTournamentProgress(JSON.parse(matchResult));
    //     localStorage.removeItem('matchResult'); // Clear result after processing
    // }
});

document.querySelectorAll('.count-button').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.count-button').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        selectedPlayerCount = parseInt(this.dataset.count);
        generatePlayerInputs(selectedPlayerCount);
        document.querySelector('.player-inputs').classList.add('show');
        document.querySelector('.tournament-container').classList.remove('show');
        document.querySelector('.start-button').style.display = 'none';
    });
});

function generatePlayerInputs(count) {
    const container = document.getElementById('players-container');
    container.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        container.innerHTML += `
            <div class="player-input">
                <input type="text" placeholder="Player ${i} Name" class="player-name-input">
            </div>
        `;
    }
}


document.querySelector('.generate-bracket-button').addEventListener('click', function() {
    const inputs = document.querySelectorAll('.player-name-input');
    const errorMessage = document.querySelector('.error-message');
    const setupSection = document.querySelector('.setup-section');
    const tournamentContainer = document.querySelector('.tournament-container');
    players = [];

    let allFilled = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            allFilled = false;
        }
        players.push(input.value.trim());
    });

    if (!allFilled) {
        errorMessage.classList.add('show');
        return;
    }
    errorMessage.classList.remove('show');

    players = shuffleArray(players);
    initializeTournament();
    generateBracket();
    
    // Properly hide/show sections
    setupSection.classList.add('hide');
    tournamentContainer.classList.add('show');
    document.querySelector('.start-button').style.display = 'flex';

    // Update progress steps
    document.querySelectorAll('.step').forEach((step, index) => {
        if (index <= 1) {
            step.classList.add('active');
        }
    });
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateBracket() {
    const bracket = document.getElementById('tournament-bracket');
    bracket.innerHTML = '';

    // Create rounds based on player count
    const roundCount = Math.log2(players.length);
    for (let i = 0; i < roundCount; i++) {
        const round = document.createElement('div');
        round.className = 'round';
        
        const matchCount = Math.pow(2, roundCount - i - 1);
        for (let j = 0; j < matchCount; j++) {
            const matchPair = document.createElement('div');
            matchPair.className = 'match-pair';
            
            if (i === 0) {
                // First round - fill with player names
                const playerIndex = j * 2;
                matchPair.innerHTML = `
                    <div class="match-header">Match ${j + 1}</div>
                    <div class="player">
                        <span class="player-name">${players[playerIndex] || ''}</span>
                        <span class="score">0</span>
                    </div>
                    <div class="player">
                        <span class="player-name">${players[playerIndex + 1] || ''}</span>
                        <span class="score">0</span>
                    </div>
                    <div class="match-status">Pending</div>
                `;
            } else {
                // Other rounds - empty slots
                matchPair.innerHTML = `
                    <div class="match-header">Match ${j + 1}</div>
                    <div class="player">
                        <span class="player-name"></span>
                        <span class="score"></span>
                    </div>
                    <div class="player">
                        <span class="player-name"></span>
                        <span class="score"></span>
                    </div>
                    <div class="match-status">Pending</div>
                `;
            }
            round.appendChild(matchPair);
        }
        bracket.appendChild(round);
    }
}
let i = 0;

// document.addEventListener('DOMContentLoaded', () => {
//     // Check if user is logged in
//     const userData = localStorage.getItem('userData');
//     if (!userData) {
//         window.location.href = '../usermanagment/login.html';
//         return;
//     }

//     // Initialize tournament if needed
//     const savedState = localStorage.getItem('tournamentState');
//     if (savedState) {
//         tournamentState = JSON.parse(savedState);
//         updateBracketDisplay();
//     }
// });

// document.querySelector('.start-button').addEventListener('click', function() {
//     const currentMatch = tournamentState.matches.find(match => match.winner === null);
//     if (currentMatch) {
//         localStorage.setItem('currentMatch', JSON.stringify(currentMatch));
//         window.location.href = '../game/game.html';
//     }
// });

function isRoundComplete() {
    return tournamentState.matches.every(match => 
        match.roundNumber === tournamentState.currentRound && match.winner
    );
}

function setupNextRound() {
    tournamentState.currentRound++;
    const winners = tournamentState.matches
        .filter(match => match.roundNumber === tournamentState.currentRound - 1)
        .map(match => match.winner);
    
    // Create next round matches
    for (let i = 0; i < winners.length; i += 2) {
        if (winners[i + 1]) {
            tournamentState.matches.push({
                player1: winners[i],
                player2: winners[i + 1],
                winner: null,
                roundNumber: tournamentState.currentRound
            });
        } else {
            // Handle bye or tournament winner
            announceWinner(winners[i]);
        }
    }
    
    // Update bracket display
    updateBracketDisplay();
}

function updateTournamentProgress(matchResult) {
    // Find and update the current match
    const currentMatch = tournamentState.matches.find(match => 
        match.player1 === currentMatch.player1 && 
        match.player2 === currentMatch.player2 &&
        match.winner === null
    );

    if (currentMatch) {
        currentMatch.winner = matchResult.winner;
        currentMatch.score = matchResult.score;
        
        // Check if round is complete
        if (isRoundComplete()) {
            setupNextRound();
        }
        
        // Save updated tournament state
        localStorage.setItem('tournamentState', JSON.stringify(tournamentState));
        
        // Update bracket display
        updateBracketDisplay();
    }
}

function updateBracketDisplay() {
    const bracket = document.getElementById('tournament-bracket');
    bracket.innerHTML = ''; // Clear existing bracket

    // Group matches by round
    const matchesByRound = {};
    tournamentState.matches.forEach(match => {
        if (!matchesByRound[match.roundNumber]) {
            matchesByRound[match.roundNumber] = [];
        }
        matchesByRound[match.roundNumber].push(match);
    });

    // Create rounds
    Object.keys(matchesByRound).forEach(roundNum => {
        const round = document.createElement('div');
        round.className = 'round';
        
        matchesByRound[roundNum].forEach(match => {
            const matchPair = document.createElement('div');
            matchPair.className = 'match-pair';
            matchPair.innerHTML = `
                <div class="player ${match.winner === match.player1 ? 'winner' : ''}">
                    <span class="player-name">${match.player1}</span>
                    ${match.score ? `<span class="score">${match.score.split('-')[0]}</span>` : ''}
                </div>
                <div class="player ${match.winner === match.player2 ? 'winner' : ''}">
                    <span class="player-name">${match.player2}</span>
                    ${match.score ? `<span class="score">${match.score.split('-')[1]}</span>` : ''}
                </div>
            `;
            round.appendChild(matchPair);
        });
        
        bracket.appendChild(round);
    });
}

// Add this to handle return from game
window.addEventListener('load', () => {
    const matchResult = localStorage.getItem('matchResult');
    if (matchResult) {
        updateTournamentProgress(JSON.parse(matchResult));
        localStorage.removeItem('matchResult');
    }
});
// Add these new functions for SPA navigation
// loadGameContent()
// loadTournamentContent()

// Add this function to initialize tournament state
function initializeTournament() {
    // Initialize tournament state
    tournamentState = {
        currentRound: 0,
        matches: [],
        results: {},
        currentMatch: null
    };

    // Create initial matches
    for (let i = 0; i < players.length; i += 2) {
        tournamentState.matches.push({
            player1: players[i],
            player2: players[i + 1],
            winner: null,
            roundNumber: 0
        });
    }

    // Save tournament state
    localStorage.setItem('tournamentState', JSON.stringify(tournamentState));
}

