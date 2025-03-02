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


document.querySelector('.start-button').addEventListener('click', async function() {
    if (!tournamentState || !tournamentState.matches) {
        console.error('Tournament state not initialized');
        return;
    }

    const currentMatch = tournamentState.matches.find(match => match.winner === null);
    if (currentMatch) {
        localStorage.setItem('currentMatch', JSON.stringify({
            player1: currentMatch.player1,
            player2: currentMatch.player2,
            roundNumber: currentMatch.roundNumber
        }));
        
        try {
            // Store current tournament page state
            const tournamentState = {
                html: document.body.innerHTML,
                styles: Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
                    .map(link => ({
                        href: link.href,
                        id: link.id
                    }))
            };
            localStorage.setItem('tournamentPageState', JSON.stringify(tournamentState));

            // Load game resources
            const [htmlResponse, cssResponse, scriptResponse] = await Promise.all([
                fetch('../game/game.html'),
                fetch('../game/style.css'),
                fetch('../game/script.js')
            ]);

            const [gameHTML, gameCSS, gameScript] = await Promise.all([
                htmlResponse.text(),
                cssResponse.text(),
                scriptResponse.text()
            ]);

            // Clean up everything from the current page
            // Remove all scripts
            document.querySelectorAll('script').forEach(script => script.remove());
            
            // Remove all stylesheets
            document.querySelectorAll('link[rel="stylesheet"], style').forEach(style => style.remove());
            
            // Clear the body
            document.body.innerHTML = '';
            
            // Clear the head (except meta tags)
            Array.from(document.head.children).forEach(child => {
                if (child.tagName !== 'META') {
                    child.remove();
                }
            });

            // Add new game CSS
            // const styleElement = document.createElement('style');
            // styleElement.id = 'game-styles';
            // styleElement.textContent = gameCSS;
            // document.head.appendChild(styleElement);

            // Add new game HTML
            document.body.innerHTML = gameHTML;

            // Add new game script
            // const scriptElement = document.createElement('script');
            // scriptElement.id = 'game-script';
            // scriptElement.textContent = gameScript;
            // document.body.appendChild(scriptElement);

            // Add return button handler
            document.getElementById('finishGame').addEventListener('click', () => {
                // Store match result before cleanup
                const matchResult = localStorage.getItem('matchResult');

                // Clean up everything again
                document.querySelectorAll('script').forEach(script => script.remove());
                document.querySelectorAll('link[rel="stylesheet"], style').forEach(style => style.remove());
                document.body.innerHTML = '';
                Array.from(document.head.children).forEach(child => {
                    if (child.tagName !== 'META') {
                        child.remove();
                    }
                });

                // Restore tournament page state
                const savedState = JSON.parse(localStorage.getItem('tournamentPageState'));
                
                // Restore HTML
                document.body.innerHTML = savedState.html;

                // Restore styles
                savedState.styles.forEach(style => {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = style.href;
                    if (style.id) link.id = style.id;
                    document.head.appendChild(link);
                });

                // Process match results
                if (matchResult) {
                    updateTournamentProgress(JSON.parse(matchResult));
                    localStorage.removeItem('matchResult');
                }

                // Clean up stored state
                localStorage.removeItem('tournamentPageState');

                // Reattach event listeners
                reattachEventListeners();
            });

        } catch (error) {
            console.error('Error loading game:', error);
        }
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
