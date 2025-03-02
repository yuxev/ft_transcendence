// Only create Game if it doesn't exist
if (!window.Game) {
    window.Game = {
        initialized: false,
        finished: false,
        gameObjects: null,
        
        // Add game variables
        gameVars: {
            score: 1,
            otherScore: 1,
            WINNING_SCORE: 5,
            MAX_ANGLE: 5 * Math.PI / 12,
            angle: -Math.PI / 7
        },
        
        init: function() {
            if (this.initialized) return;
            
            // Wait for DOM elements to be available
            if (!document.querySelector(".arena")) {
                setTimeout(() => this.init(), 100);
                return;
            }

            this.initialized = true;
            
            // Initialize game elements
            this.elements = {
                player: document.querySelector(".player"),
                arena: document.querySelector(".arena"),
                ball: document.querySelector(".ball"),
                playerScore: document.querySelector('#score1'),
                computerScore: document.querySelector('#score2'),
                player1Name: document.querySelector('#player1Name span'),
                player2Name: document.querySelector('#player2Name span')
            };
            
            // Setup player names
            this.setupPlayerNames();
            
            // Initialize game objects
            this.setupGameObjects();
            
            // Setup controls
            this.setupControls();
            
            // Start game loop
            this.startGameLoop();
        },
        
        setupPlayerNames: function() {
            const currentMatch = JSON.parse(localStorage.getItem('currentMatch'));
            if (currentMatch) {
                this.elements.player1Name.textContent = currentMatch.player1;
                this.elements.player2Name.textContent = currentMatch.player2;
            }
        },
        
        setupGameObjects: function() {
            const self = this;
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
                        this.element = self.elements.player.cloneNode(true);
                        self.elements.arena.appendChild(this.element);
                        FistPlayer = 1;
                    }
                    else{
                        this.element = self.elements.player;
                    }
                    this.Height = this.element.clientHeight;
                    this.Width = this.element.clientWidth;
                    this.x = - this.element.clientWidth / 2;
                    this.y = self.elements.arena.clientHeight / 2 - this.element.clientHeight / 2;
                    this.element.style.left = `${this.x}px`;
                    this.setupControls();
                }

                movePlayer(){
                    if (this.MoveUp)
                        this.y = Math.max(this.y - this.speed, 0);
                    if (this.MoveDown)
                        this.y = Math.min(this.y + this.speed, self.elements.arena.clientHeight - this.Height);
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
                    this.x = self.elements.arena.clientWidth / 2 - self.elements.ball.clientHeight / 2;
                    this.y = self.elements.arena.clientHeight / 2 - self.elements.ball.clientWidth / 2;
                    this.speed = 4;
                    this.r = self.elements.ball.clientWidth;
                    
                    self.elements.ball.style.left = `${this.x}px`;
                    self.elements.ball.style.top = `${this.y}px`;
                }

                moveBall(p1, p2){
                    this.x = this.x + this.speed * Math.cos(self.gameVars.angle);
                    this.y = this.y - this.speed * Math.sin(self.gameVars.angle);

                    self.elements.ball.style.left = `${this.x}px`;
                    self.elements.ball.style.top = `${this.y}px`;

                    if (this.y > self.elements.arena.clientHeight - 15 || this.y <= 0) {
                        self.gameVars.angle = (self.gameVars.angle * -1) % (Math.PI * 2);
                    }
                    else if(this.x > self.elements.arena.clientWidth - p2.Width / 2 - 1 - this.r && 
                            Math.abs(this.y - (p2.y + p2.Height / 2)) <= p2.Height / 2) {
                        this.speed *= 1.05;
                        self.gameVars.angle = (this.y - (p2.y + p2.Height / 2)) / (p2.Height / 2) * self.gameVars.MAX_ANGLE - Math.PI;
                    }
                    else if(this.x < p1.Width / 2 + 1 && Math.abs(this.y - (p1.y + p1.Height / 2)) <= p1.Height / 2) {
                        this.speed *= 1.05;
                        self.gameVars.angle = -(this.y - (p1.y + p1.Height / 2)) / (p1.Height / 2) * self.gameVars.MAX_ANGLE;
                    }
                    else if(this.x < 0) {
                        this.speed = 4;
                        self.gameVars.angle = Math.PI / 7;
                        this.x = self.elements.arena.clientWidth / 2 - self.elements.ball.clientWidth / 2;
                        this.y = self.elements.arena.clientHeight / 2 - self.elements.ball.clientHeight / 2;
                        self.elements.computerScore.textContent = self.gameVars.score;
                        self.gameVars.score++;
                    }
                    else if(this.x >= self.elements.arena.clientWidth - this.r) {
                        this.speed = 4;
                        self.gameVars.angle = Math.PI - Math.PI / 7;
                        this.x = self.elements.arena.clientWidth / 2 - self.elements.ball.clientWidth / 2;
                        this.y = self.elements.arena.clientHeight / 2 - self.elements.ball.clientHeight / 2;
                        self.elements.playerScore.textContent = self.gameVars.otherScore;
                        self.gameVars.otherScore++;
                    }

                    if (self.gameVars.score >= self.gameVars.WINNING_SCORE || 
                        self.gameVars.otherScore >= self.gameVars.WINNING_SCORE) {
                        if (!self.finished) {
                            self.finished = true;
                            const currentMatch = JSON.parse(localStorage.getItem('currentMatch'));
                            const winner = self.gameVars.score > self.gameVars.otherScore ? 
                                currentMatch.player1 : currentMatch.player2;
                            
                            localStorage.setItem('matchResult', JSON.stringify({
                                winner: winner,
                                score: `${self.gameVars.score}-${self.gameVars.otherScore}`
                            }));
                            
                            const finishButton = document.getElementById('finishGame');
                            if (finishButton) {
                                finishButton.style.display = 'flex';
                            }
                        }
                    }
                }
            }

            // Initialize game objects
            this.gameObjects = {
                p1: new PlayerObj(),
                p2: new PlayerObj(),
                ball: new BallObj()
            };

            // Setup player 2
            this.gameObjects.p2.setNewKey('ArrowUp', 'ArrowDown');
            this.gameObjects.p2.setName('computer');
            this.gameObjects.p2.setNewX(this.elements.arena.clientWidth - this.gameObjects.p2.Width / 2);
            this.gameObjects.p2.element.style.background = '#032a6ceb';
        },
        
        startGameLoop: function() {
            if (!this.finished) {
                this.gameObjects.p1.movePlayer();
                this.gameObjects.p2.movePlayer();
                this.gameObjects.ball.moveBall(this.gameObjects.p1, this.gameObjects.p2);
                requestAnimationFrame(() => this.startGameLoop());
            }
        },
        
        setupControls: function() {
            const finishButton = document.getElementById('finishGame');
            if (finishButton) {
                finishButton.addEventListener('click', () => {
                    if (this.finished) {
                        this.cleanup();
                        window.router.navigate('/tournament');
                    }
                });
            }
        },
        
        cleanup: function() {
            this.initialized = false;
            this.finished = false;
            this.gameObjects = null;
            // Cancel any ongoing animations or intervals here
        }
    };

    // Export game functions to window
    window.initializeGame = () => window.Game.init();
    window.cleanupGame = () => window.Game.cleanup();
}
