let selectedPlayerCount = 0;
let players = [];
let tournamentState = {
    currentRound: 0,
    matches: [],
    results: {},
    currentMatch: null
};

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

// fetch("../game/game.html")
// .then(Response => {
//     return Response.text();
// })
// .then(Data => {
//     document.querySelector("body").innerHTML = Data;
//     console.log(Data);
// })

document.querySelector('.generate-bracket-button').addEventListener('click', function() {
    const inputs = document.querySelectorAll('.player-name-input');
    const errorMessage = document.querySelector('.error-message');
    players = [];

    let allFilled = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            allFilled = false;
        }
        players.push(input.value.trim());
    });

    if (!allFilled) {
        errorMessage.style.display = 'block';
        return;
    }
    errorMessage.style.display = 'none';

    players = shuffleArray(players);

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

    generateBracket();
    document.querySelector('.tournament-container').classList.add('show');
    document.querySelector('.start-button').style.display = 'block';
    document.getElementsByClassName('setup-section')[0].remove();
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

    const round1 = document.createElement('div');
    round1.className = 'round';
    for (let i = 0; i < players.length; i += 2) {
        const matchPair = document.createElement('div');
        matchPair.className = 'match-pair';
        matchPair.innerHTML = `
            <div class="player">${players[i]}</div>
            <div class="player">${players[i + 1]}</div>
            <div class="connector"></div>
            <div class="vertical-connector"></div>
        `;
        round1.appendChild(matchPair);
    }
    bracket.appendChild(round1);

    const semiFinals = document.createElement('div');
    semiFinals.className = 'round';
    for (let i = 0; i < players.length / 4; i++) {
        const matchPair = document.createElement('div');
        matchPair.className = 'match-pair';
        matchPair.innerHTML = `
            <div class="player"></div>
            <div class="player"></div>
            <div class="connector"></div>
            <div class="vertical-connector"></div>
        `;
        semiFinals.appendChild(matchPair);
    }
    bracket.appendChild(semiFinals);

    const finals = document.createElement('div');
    finals.className = 'round';
    finals.innerHTML = `
        <div class="match-pair">
            <div class="player"></div>
        </div>
    `;
    bracket.appendChild(finals);
}
let i = 0;


document.querySelector('.start-button').addEventListener('click', function() {
    const currentMatch = tournamentState.matches.find(match => match.winner === null);
    if (currentMatch) {
        // Store current match info
        localStorage.setItem('currentMatch', JSON.stringify(currentMatch));
        
        // Instead of changing location, load game content
        loadGameContent();
    }
});

function reattachEventListeners() {
    // Player count buttons
    document.querySelectorAll('.count-button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.count-button').forEach(btn => 
                btn.classList.remove('active'));
            this.classList.add('active');
            selectedPlayerCount = parseInt(this.dataset.count);
            generatePlayerInputs(selectedPlayerCount);
            document.querySelector('.player-inputs').classList.add('show');
            document.querySelector('.tournament-container').classList.remove('show');
            document.querySelector('.start-button').style.display = 'none';
        });
    });

    // Generate bracket button
    const generateButton = document.querySelector('.generate-bracket-button');
    if (generateButton) {
        generateButton.addEventListener('click', function() {
            // ... existing generate bracket logic ...
        });
    }

    // Start button
    const startButton = document.querySelector('.start-button');
    if (startButton) {
        startButton.addEventListener('click', async function() {
            // ... existing start button logic ...
        });
    }
}

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
async function loadGameContent() {
    try {
        // Fetch game HTML
        const response = await fetch('../game/game.html');
        const html = await response.text();
        
        // Create temporary container to parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract game content
        const gameContent = doc.querySelector('.container').innerHTML;
        
        // Update main container
        const container = document.querySelector('.container');
        container.innerHTML = gameContent;
        
        // Add game styles if not already present
        if (!document.querySelector('link[href="../game/style.css"]')) {
            const gameStyles = document.createElement('link');
            gameStyles.rel = 'stylesheet';
            gameStyles.href = '../game/style.css';
            document.head.appendChild(gameStyles);
        }
        
        // Load game script
        await new Promise((resolve, reject) => {
            const gameScript = document.createElement('script');
            gameScript.src = '../game/script.js';
            gameScript.onload = resolve;
            gameScript.onerror = reject;
            document.body.appendChild(gameScript);
        });
        
        // Initialize game
        if (window.initializeGame) {
            window.initializeGame();
        } else {
            console.error('Game initialization function not found');
        }
        
    } catch (error) {
        console.error('Error loading game content:', error);
    }
}

async function loadTournamentContent() {
    try {
        // Fetch tournament HTML
        const response = await fetch('./tournament/main.html');
        const html = await response.text();
        
        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract tournament content
        const tournamentContent = doc.querySelector('.container').innerHTML;
        
        // Update container
        document.querySelector('.container').innerHTML = tournamentContent;
        
        // Reinitialize tournament state
        initializeTournament();
        
    } catch (error) {
        console.error('Error loading tournament content:', error);
        location.reload(); // Fallback to page reload if loading fails
    }
}

// Add this function to initialize tournament state
function initializeTournament() {
    // Reattach event listeners
    reattachEventListeners();
    
    // Load saved tournament state if it exists
    const savedState = localStorage.getItem('tournamentState');
    if (savedState) {
        tournamentState = JSON.parse(savedState);
        updateBracketDisplay();
    }
}
