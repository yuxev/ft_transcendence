// Remove the global gameInitialized variable and wrap everything in an IIFE
(function() {
    // Check if script is already initialized
    if (window.gameInitialized) {
        return;
    }
    window.gameInitialized = true;

    function initializeGame() {
        // Wait for DOM elements to be available
        if (!document.querySelector(".arena")) {
            setTimeout(initializeGame, 100); // Retry after 100ms
            return;
        }

        let player = document.querySelector(".player");
        let arena = document.querySelector(".arena");
        let ball = document.querySelector(".ball");
        let playerScore = document.querySelector('#score1');
        let computerScore = document.querySelector('#score2');
        let arenaPosition = arena.getBoundingClientRect();
        console.log(arenaPosition);
        console.log(arena.clientHeight);

        let player1NameElement = document.querySelector('#player1Name span');
        let player2NameElement = document.querySelector('#player2Name span');

        const currentMatch = JSON.parse(localStorage.getItem('currentMatch'));
        if (currentMatch) {
            player1NameElement.textContent = currentMatch.player1;
            player2NameElement.textContent = currentMatch.player2;
        }

        let score = 1;
        let otherScore = 1;
        let WINNNGSCORE = 5;
        let MAXang = 5*Math.PI/12;
        let ang = -Math.PI / 7;
        let FistPlayer = 0;

        class PlayerObj {
            constructor() {
                this.Name = "Player";
                this.MoveUp = false;
                this.MoveDown = false;
                this.keyUP = 'w';
                this.keyDown = 's';
                this.speed = 14;
                if(!FistPlayer){
                    this.element = player.cloneNode(true);
                    arena.appendChild(this.element);
                    FistPlayer = 1;
                }
                else{
                    this.element = player;
                }
                this.Height = this.element.clientHeight;
                this.Width = this.element.clientWidth;
                this.x = - this.element.clientWidth / 2;
                this.y = arena.clientHeight / 2 - this.element.clientHeight / 2;
                this.element.style.left = `${this.x}px`;
                this.setupControls();
            }

            movePlayer(){
                if (this.MoveUp)
                    this.y = Math.max(this.y - this.speed, 0);
                if (this.MoveDown)
                    this.y = Math.min(this.y + this.speed, arena.clientHeight - this.Height);
                this.element.style.top =`${this.y}px`;
            }

            setNewKey(newKeyUp, newKeyDown) {
                this.keyUP = newKeyUp;
                this.keyDown = newKeyDown;
            }

            setNewX(newPostionX) {
                this.x = newPostionX;
                this.element.style.left = `${newPostionX}px`;
            }

            setName(newName) {
                this.Name = newName;
            }
            
            setupControls() {
                document.addEventListener('keydown', (event) => {
                    if (event.key === this.keyUP) {
                        this.MoveUp = true;
                    } else if (event.key === this.keyDown) {
                        this.MoveDown = true;
                    }
                });

                document.addEventListener('keyup', (event) => {
                    if (event.key === this.keyUP) {
                        this.MoveUp = false;
                    } else if (event.key === this.keyDown) {
                        this.MoveDown = false;
                    }
                });
            }
        };

        class BallObj {
            constructor() {
                this.Name = "ball";
                this.x = arena.clientWidth / 2 - ball.clientHeight / 2;
                this.y = arena.clientHeight / 2 -  ball.clientWidth / 2;
                this.speed = 4;
                this.r = ball.clientWidth;
                
                // Set initial ball position
                ball.style.left = `${this.x}px`;
                ball.style.top = `${this.y}px`;
            }

            moveBall(p1, p2){
                this.x = this.x + this.speed * Math.cos(ang);
                this.y = this.y - this.speed * Math.sin(ang);

                // Update ball position
                ball.style.left = `${this.x}px`;
                ball.style.top = `${this.y}px`;

                if (this.y > arena.clientHeight - 15 || this.y <= 0)
                {
                    console.log(this.y);
                    ang = (ang * -1) % (Math.PI * 2);
                }

                else if(this.x > arena.clientWidth - p2.Width / 2 - 1 - this.r && Math.abs(this.y - (p2.y + p2.Height / 2)) <=  p2.Height / 2)
                {
                    this.speed *= 1.05;
                    ang =  (this.y - (p2.y + p2.Height / 2)) / (p2.Height / 2) * MAXang - Math.PI;
                }

                else if(this.x < p1.Width / 2 + 1 && Math.abs(this.y - (p1.y + p1.Height / 2)) <=  p1.Height / 2){
                    this.speed *= 1.05;
                    ang = - (this.y - (p1.y + p1.Height / 2)) / (p1.Height / 2) * MAXang;
                }

                else if(this.x < 0){
                    this.speed = 4;
                    ang = Math.PI / 7;
                    this.x = arena.clientWidth / 2 - ball.clientWidth / 2;
                    this.y = arena.clientHeight / 2 -  ball.clientHeight / 2;
                    computerScore.textContent = score;
                    score++;
                }
                else if(this.x >= arena.clientWidth - this.r){
                    this.speed = 4;
                    ang = Math.PI - Math.PI / 7;
                    this.x = arena.clientWidth / 2 - ball.clientWidth / 2;
                    this.y = arena.clientHeight / 2 -  ball.clientHeight / 2;
                    playerScore.textContent = otherScore;
                    otherScore++;
                }

                if (score >= WINNNGSCORE || otherScore >= WINNNGSCORE) {
                    if (!gameFinished) {
                        gameFinished = true;
                        const winner = score > otherScore ? currentMatch.player1 : currentMatch.player2;
                        
                        // Store match result
                        localStorage.setItem('matchResult', JSON.stringify({
                            winner: winner,
                            score: `${score}-${otherScore}`
                        }));
                        
                        // Show return button
                        const finishButton = document.getElementById('finishGame');
                        if (finishButton) {
                            finishButton.style.display = 'flex';
                        }
                    }
                }
            }
        }

        // Initialize game objects
        const p1 = new PlayerObj();
        const p2 = new PlayerObj();
        p2.setNewKey('ArrowUp', 'ArrowDown');
        p2.setName('computer');
        p2.setNewX(arena.clientWidth - p2.Width / 2);
        p2.element.style.background = '#032a6ceb';
        const squareball = new BallObj();

        // Start game loop
        let gameFinished = false;
        function gameLoop() {
            if (!gameFinished) {
                p1.movePlayer();
                p2.movePlayer();
                squareball.moveBall(p1, p2);
                requestAnimationFrame(gameLoop);
            }
        }
        requestAnimationFrame(gameLoop);
    }

    // Only initialize if we're on the game page
    if (document.querySelector(".arena")) {
        initializeGame();
    }
})();
