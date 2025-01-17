let selectedPlayerCount = 0;
let players = [];


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

document.querySelector('.start-button').addEventListener('click', function() {
    alert('Tournament is starting with the following matches:\n' + 
          players.map((player, i) => 
            i % 2 === 0 ? `${player} vs ${players[i + 1]}` : '').filter(match => match).join('\n'));
});
