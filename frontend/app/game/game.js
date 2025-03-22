// PONG Game Core Engine
window.GameEngine = {
    initialized: false,
    finished: false,
    
    // Game state variables
    gameVars: {
        score1: 0,
        score2: 0,
        WINNING_SCORE: 5,
        MAX_ANGLE: 5 * Math.PI / 12,
        angle: -Math.PI / 7,
        gameStarted: false,
        countdownActive: false,
    },
    
    // Game dimensions
    dimensions: {
        arenaWidth: 800,
        arenaHeight: 500,
        paddleWidth: 20,
        paddleHeight: 200,
        ballSize: 20
    },
    
    // Elements, objects and animation refs
    elements: null,
    gameObjects: null,
    animationId: null,
    handlers: {},
    
    // Add this new helper function to clean up old players
    clearGameElements: function() {
        console.log('Clearing all game elements');
        
        // Remove all players
        const playerElements = document.querySelectorAll('.arena .player');
        playerElements.forEach(element => {
            element.remove();
        });
        
        // Remove all balls
        const ballElements = document.querySelectorAll('.arena .ball');
        ballElements.forEach(element => {
            element.remove();
        });
    },
    
    // Initialize core game engine
    init: function(options = {}) {
        console.log('Initializing game engine...');
        
        // Clear old game elements before creating new ones
        this.clearGameElements();
        
        // If already initialized, clean up first
        if (this.initialized) {
            this.cleanup();
        }
        
        // Apply custom options
        if (options.winningScore) this.gameVars.WINNING_SCORE = options.winningScore;
        if (options.onGameOver) this.onGameOver = options.onGameOver;
        
        // Make sure required elements exist
        if (!document.querySelector('.arena')) {
            console.log('Game elements not ready, waiting...');
            setTimeout(() => this.init(options), 100);
            return;
        }
        
        // Reset scores
        this.gameVars.score1 = 0;
        this.gameVars.score2 = 0;
        this.gameVars.angle = -Math.PI / 7;
        this.finished = false;
        
        // Get elements
        this.getElements();
        
        // Reset display
        if (this.elements.playerScore) this.elements.playerScore.textContent = '0';
        if (this.elements.computerScore) this.elements.computerScore.textContent = '0';
        
        // Setup player names
        this.setupPlayerNames(options.player1, options.player2);
        
        // Initialize game objects
        this.setupGameObjects();
        
        // Setup controls
        this.setupControls();
        
        // Setup start screen
        this.setupStartScreen();
        // Mark as initialized
        this.initialized = true;
        
        // Start game loop
        this.startGameLoop();
        
        return this; // For chaining
    },
    
    // Get all necessary DOM elements
    getElements: function() {
        this.elements = {
            player: document.querySelector(".player"),
            arena: document.querySelector(".arena"),
            ball: document.querySelector(".ball"),
            playerScore: document.querySelector('#score1'),
            computerScore: document.querySelector('#score2'),
            player1Name: document.querySelector('#player1Name span'),
            player2Name: document.querySelector('#player2Name span'),
            finishButton: document.getElementById('finishGame'),
            startScreen: null,
            countdown: null
        };
        
        // Hide finish button initially
        if (this.elements.finishButton) {
            this.elements.finishButton.style.display = 'none';
        }
    },
    
    setupStartScreen: function() {
        // Create start screen overlay
        this.elements.startScreen = document.createElement('div');
        this.elements.startScreen.className = 'start-screen';
        this.elements.startScreen.innerHTML = `
            <div class="start-message">
                <h2>Ready to Play?</h2>
                <p>Press <span class="key-highlight">SPACE</span> to start</p>
            </div>
        `;
        
        // Create countdown element (initially hidden)
        this.elements.countdown = document.createElement('div');
        this.elements.countdown.className = 'countdown';
        this.elements.countdown.style.display = 'none';
        
        // Add to arena
        if (this.elements.arena) {
            this.elements.arena.appendChild(this.elements.startScreen);
            this.elements.arena.appendChild(this.elements.countdown);
        }
        
        // Add space key listener
        this.handlers.startGame = (e) => {
            if (e.code === 'Space' && !this.gameVars.gameStarted && !this.gameVars.countdownActive) {
                e.preventDefault(); // Prevent page scrolling
                this.startCountdown();
            }
        };
        
        document.addEventListener('keydown', this.handlers.startGame);
    },

    startCountdown: function() {
        console.log("Starting countdown!"); // Add debug log
        this.gameVars.countdownActive = true;
        
        // Hide start screen
        if (this.elements.startScreen) {
            this.elements.startScreen.style.display = 'none';
        }
        
        // Show countdown
        if (this.elements.countdown) {
            this.elements.countdown.style.display = 'flex';
            this.elements.countdown.textContent = "3"; // Set initial text
        }
        
        let count = 3;
        
        // Start countdown interval
        const countdownInterval = setInterval(() => {
            count--;
            console.log("Countdown:", count); // Add debug log
            
            if (count >= 0) {
                // Update countdown display
                if (this.elements.countdown) {
                    this.elements.countdown.textContent = count.toString();
                }
            } else {
                // Countdown complete
                clearInterval(countdownInterval);
                
                // Hide countdown
                if (this.elements.countdown) {
                    this.elements.countdown.style.display = 'none';
                }
                
                // Start the game
                this.gameVars.gameStarted = true;
                this.gameVars.countdownActive = false;
                
                console.log("Game started!");
            }
        }, 1000);
    },
    

    // Set player names
    setupPlayerNames: function(player1, player2) {
        console.log(`Setting up game with players: ${player1} vs ${player2}`);
        
        // Clear any existing content first to prevent duplication
        if (this.elements.player1Name) {
            this.elements.player1Name.innerHTML = '';
            const p1Icon = document.createElement('i');
            p1Icon.className = 'fas fa-user';
            this.elements.player1Name.appendChild(p1Icon);
            
            const p1Text = document.createElement('span');
            p1Text.textContent = player1 || 'Player 1';
            this.elements.player1Name.appendChild(p1Text);
        }
        
        if (this.elements.player2Name) {
            this.elements.player2Name.innerHTML = '';
            const p2Icon = document.createElement('i');
            p2Icon.className = 'fas fa-user';
            this.elements.player2Name.appendChild(p2Icon);
            
            const p2Text = document.createElement('span');
            p2Text.textContent = player2 || 'Player 2';
            this.elements.player2Name.appendChild(p2Text);
        }
    },
    
    // Game over handler - can be overridden
    onGameOver: function(winner, score1, score2) {
        console.log(`Game over. Winner: ${winner}, Score: ${score1}-${score2}`);
        
        // Show finish button
        if (this.elements.finishButton) {
            this.elements.finishButton.style.display = 'flex';
        }
    },
    
    // Other methods (setupGameObjects, startGameLoop, etc.) remain similar...
    setupGameObjects: function() {
        // Get arena dimensions
        const arenaWidth = this.dimensions.arenaWidth;
        const arenaHeight = this.dimensions.arenaHeight;
        const paddleWidth = this.dimensions.paddleWidth;
        const paddleHeight = this.dimensions.paddleHeight;
        const ballSize = this.dimensions.ballSize;
        
        // Initialize game objects object
        this.gameObjects = {};
        
        // Create left player (player 1)
        const leftPlayer = document.createElement('div');
        leftPlayer.className = 'player';
        leftPlayer.style.width = paddleWidth + 'px';
        leftPlayer.style.height = paddleHeight + 'px';
        leftPlayer.style.left = '10px';
        leftPlayer.style.top = (arenaHeight / 2 - paddleHeight / 2) + 'px';
        leftPlayer.style.background = 'rgba(199, 0, 130, 0.63)'; // Red player
        this.elements.arena.appendChild(leftPlayer);
        
        this.gameObjects.p1 = {
            element: leftPlayer,
            x: 10,
            y: arenaHeight / 2 - paddleHeight / 2,
            width: paddleWidth,
            height: paddleHeight,
            score: 0,
            MoveUp: false,
            MoveDown: false,
            movePlayer: function() {
                // Move player based on controls
                if (this.MoveUp && this.y > 0) {
                    this.y -= 7;
                }
                if (this.MoveDown && this.y < (arenaHeight - paddleHeight)) {
                    this.y += 7;
                }
                
                // Update DOM element position
                this.element.style.top = this.y + 'px';
            }
        };
        
        // Create right player (player 2)
        const rightPlayer = document.createElement('div');
        rightPlayer.className = 'player';
        rightPlayer.style.width = paddleWidth + 'px';
        rightPlayer.style.height = paddleHeight + 'px';
        rightPlayer.style.left = (arenaWidth - paddleWidth - 10) + 'px';
        rightPlayer.style.top = (arenaHeight / 2 - paddleHeight / 2) + 'px';
        rightPlayer.style.background = 'rgba(3, 42, 108, 0.92)'; // Blue player
        this.elements.arena.appendChild(rightPlayer);
        
        this.gameObjects.p2 = {
            element: rightPlayer,
            x: arenaWidth - paddleWidth - 10,
            y: arenaHeight / 2 - paddleHeight / 2,
            width: paddleWidth,
            height: paddleHeight,
            score: 0,
            MoveUp: false,
            MoveDown: false,
            movePlayer: function() {
                // Move player based on controls
                if (this.MoveUp && this.y > 0) {
                    this.y -= 7;
                }
                if (this.MoveDown && this.y < (arenaHeight - paddleHeight)) {
                    this.y += 7;
                }
                
                // Update DOM element position
                this.element.style.top = this.y + 'px';
            }
        };
        
        

        // Create the ball
        const ball = document.createElement('div');
        ball.className = 'ball';
        ball.style.width = ballSize + 'px';
        ball.style.height = ballSize + 'px';
        ball.style.left = (arenaWidth / 2 - ballSize / 2) + 'px';
        ball.style.top = (arenaHeight / 2 - ballSize / 2) + 'px';
        this.elements.arena.appendChild(ball);
        
        // Define ball object with movement methods
        this.gameObjects.ball = {
            element: ball,
            x: arenaWidth / 2 - ballSize / 2,
            y: arenaHeight / 2 - ballSize / 2,
            width: ballSize,
            height: ballSize,
            dx: 5,
            dy: 5 * Math.sin(this.gameVars.angle),
            
            // ... Add the rest of the ball movement logic here
            moveBall: function(p1, p2) {
                // Update position
                this.x += this.dx;
                this.y += this.dy;
                
                // Check for collisions
                this.checkCollisions(p1, p2);
                
                // Update DOM element position
                this.element.style.left = this.x + 'px';
                this.element.style.top = this.y + 'px';
            },
            
            checkCollisions: function(p1, p2) {
                const arenaWidth = window.GameEngine.dimensions.arenaWidth;
                const arenaHeight = window.GameEngine.dimensions.arenaHeight;
                
                // Wall collision (top and bottom)
                if (this.y <= 0 || this.y + this.height >= arenaHeight) {
                    this.dy = -this.dy; // Reverse vertical direction
                }
                
                // Check collision with player 1 (left paddle)
                if (this.x <= p1.x + p1.width && 
                    this.x + this.width >= p1.x && 
                    this.y + this.height >= p1.y && 
                    this.y <= p1.y + p1.height) {
                    
                    // Calculate ball position relative to paddle center (for angle)
                    const paddleCenter = p1.y + p1.height/2;
                    const ballCenter = this.y + this.height/2;
                    const relativeIntersectY = ballCenter - paddleCenter;
                    
                    // Normalize to get value between -1 and 1
                    const normalizedRelativeIntersectionY = relativeIntersectY / (p1.height/2);
                    
                    // Calculate bounce angle (max 75 degrees)
                    const bounceAngle = normalizedRelativeIntersectionY * window.GameEngine.gameVars.MAX_ANGLE;
                    
                    // Set new velocity with angle
                    const ballSpeed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
                    this.dx = Math.abs(ballSpeed * Math.cos(bounceAngle)); // Always move right after hitting left paddle
                    this.dy = ballSpeed * Math.sin(bounceAngle);
                    
                    // Move ball outside paddle to prevent getting stuck
                    this.x = p1.x + p1.width;
                    
                    // Increase speed slightly
                    this.dx *= 1.05;
                    if (Math.abs(this.dy) > 0) this.dy *= 1.05;
                }
                
                // Check collision with player 2 (right paddle)
                if (this.x + this.width >= p2.x && 
                    this.x <= p2.x + p2.width && 
                    this.y + this.height >= p2.y && 
                    this.y <= p2.y + p2.height) {
                    
                    // Calculate ball position relative to paddle center (for angle)
                    const paddleCenter = p2.y + p2.height/2;
                    const ballCenter = this.y + this.height/2;
                    const relativeIntersectY = ballCenter - paddleCenter;
                    
                    // Normalize to get value between -1 and 1
                    const normalizedRelativeIntersectionY = relativeIntersectY / (p2.height/2);
                    
                    // Calculate bounce angle (max 75 degrees)
                    const bounceAngle = normalizedRelativeIntersectionY * window.GameEngine.gameVars.MAX_ANGLE;
                    
                    // Set new velocity with angle
                    const ballSpeed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
                    this.dx = -Math.abs(ballSpeed * Math.cos(bounceAngle)); // Always move left after hitting right paddle
                    this.dy = ballSpeed * Math.sin(bounceAngle);
                    
                    // Move ball outside paddle to prevent getting stuck
                    this.x = p2.x - this.width;
                    
                    // Increase speed slightly
                    this.dx *= 1.05;
                    if (Math.abs(this.dy) > 0) this.dy *= 1.05;
                }
                
                // Check if ball goes out of bounds (scoring)
                if (this.x + this.width < 0) {
                    // Player 2 scores
                    p2.score++;
                    if (window.GameEngine.elements.computerScore) {
                        window.GameEngine.elements.computerScore.textContent = p2.score;
                    }
                    this.resetBall('p2');
                    
                    // Check win condition
                    if (p2.score >= window.GameEngine.gameVars.WINNING_SCORE) {
                        window.GameEngine.finished = true;
                        window.GameEngine.onGameOver('Player 2', p1.score, p2.score);
                    }
                }
                
                if (this.x > arenaWidth) {
                    // Player 1 scores
                    p1.score++;
                    if (window.GameEngine.elements.playerScore) {
                        window.GameEngine.elements.playerScore.textContent = p1.score;
                    }
                    this.resetBall('p1');
                    
                    // Check win condition
                    if (p1.score >= window.GameEngine.gameVars.WINNING_SCORE) {
                        window.GameEngine.finished = true;
                        window.GameEngine.onGameOver('Player 1', p1.score, p2.score);
                    }
                }
            },
            
            resetBall: function(scorer) {
                const arenaWidth = window.GameEngine.dimensions.arenaWidth;
                const arenaHeight = window.GameEngine.dimensions.arenaHeight;
                
                // Reset ball to center
                this.x = arenaWidth / 2 - this.width / 2;
                this.y = arenaHeight / 2 - this.height / 2;
                
                // Reset angle based on who scored
                window.GameEngine.gameVars.angle = (Math.random() * Math.PI / 4) - Math.PI / 8;
                
                // Set initial velocity
                const initialSpeed = 5;
                
                // Direction depends on who scored
                if (scorer === 'p1') {
                    this.dx = -initialSpeed * Math.cos(window.GameEngine.gameVars.angle);
                } else {
                    this.dx = initialSpeed * Math.cos(window.GameEngine.gameVars.angle);
                }
                
                this.dy = initialSpeed * Math.sin(window.GameEngine.gameVars.angle);
                
                // Update the ball position right away to prevent immediate scoring
                this.element.style.left = this.x + 'px';
                this.element.style.top = this.y + 'px';
            }
        };
    },
    
    // Start game loop
    startGameLoop: function() {
        // Check if game is still initialized (not cleaned up)
        if (!this.initialized) return;
        if (this.gameVars.gameStarted) 
        {
            // Move players
            if (this.gameObjects && this.gameObjects.p1)
                this.gameObjects.p1.movePlayer();
            if (this.gameObjects && this.gameObjects.p2) 
                this.gameObjects.p2.movePlayer();
            
            // Move ball
            if (this.gameObjects && this.gameObjects.ball)
                this.gameObjects.ball.moveBall(this.gameObjects.p1, this.gameObjects.p2);
            
        }
        // Continue animation loop if not finished
        if (!this.finished)
            this.animationId = requestAnimationFrame(() => this.startGameLoop());
    },
    
    // Setup control buttons
    setupControls: function() {
        // Player movement handlers
        this.handlers.keydown = (event) => {
            if (event.key === 'w') {
                if (this.gameObjects && this.gameObjects.p1) {
                    this.gameObjects.p1.MoveUp = true;
                }
            } else if (event.key === 's') {
                if (this.gameObjects && this.gameObjects.p1) {
                    this.gameObjects.p1.MoveDown = true;
                }
            } else if (event.key === 'ArrowUp') {
                if (this.gameObjects && this.gameObjects.p2) {
                    this.gameObjects.p2.MoveUp = true;
                }
            } else if (event.key === 'ArrowDown') {
                if (this.gameObjects && this.gameObjects.p2) {
                    this.gameObjects.p2.MoveDown = true;
                }
            }
        };

        this.handlers.keyup = (event) => {
            if (event.key === 'w') {
                if (this.gameObjects && this.gameObjects.p1) {
                    this.gameObjects.p1.MoveUp = false;
                }
            } else if (event.key === 's') {
                if (this.gameObjects && this.gameObjects.p1) {
                    this.gameObjects.p1.MoveDown = false;
                }
            } else if (event.key === 'ArrowUp') {
                if (this.gameObjects && this.gameObjects.p2) {
                    this.gameObjects.p2.MoveUp = false;
                }
            } else if (event.key === 'ArrowDown') {
                if (this.gameObjects && this.gameObjects.p2) {
                    this.gameObjects.p2.MoveDown = false;
                }
            }
        };

        // Attach event listeners
        document.addEventListener('keydown', this.handlers.keydown);
        document.addEventListener('keyup', this.handlers.keyup);
        
        // Finish button
        if (this.elements.finishButton) {
            this.handlers.finish = () => {
                this.cleanup();
                window.showView && window.showView('home');
            };
            
            this.elements.finishButton.addEventListener('click', this.handlers.finish);
        }
        
        // Escape key to exit
        this.handlers.keydownEscape = (event) => {
            if (event.key === 'Escape') {
                this.cleanup();
                window.showView && window.showView('home');
            }
        };
        
        document.addEventListener('keydown', this.handlers.keydownEscape);
    },
    
    // Clean up all resources
    cleanup: function() {
        console.log('Cleaning up game engine');
        
        // Clear any game elements
        this.clearGameElements();
        

        if (this.elements) {
            if (this.elements.startScreen)
                this.elements.startScreen.remove();
            if (this.elements.countdown) 
                this.elements.countdown.remove();
        }
        // Cancel animation frame
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Remove all event listeners
        if (this.handlers.keydown) {
            document.removeEventListener('keydown', this.handlers.keydown);
        }
        if (this.handlers.keyup) {
            document.removeEventListener('keyup', this.handlers.keyup);
        }
        if (this.handlers.keydownEscape) {
            document.removeEventListener('keydown', this.handlers.keydownEscape);
        }
        if (this.handlers.finish && this.elements && this.elements.finishButton) {
            this.elements.finishButton.removeEventListener('click', this.handlers.finish);
        }
        
        // Reset game state
        this.gameVars = {
            score1: 0,
            score2: 0,
            WINNING_SCORE: 5,
            MAX_ANGLE: 5 * Math.PI / 12,
            angle: -Math.PI / 7
        };
        
        // Reset flags and references
        this.initialized = false;
        this.finished = false;
        this.gameObjects = null;
        this.handlers = {};
        
        // Reset UI elements if they exist
        if (this.elements) {
            if (this.elements.finishButton) {
                this.elements.finishButton.style.display = 'none';
            }
            if (this.elements.playerScore) {
                this.elements.playerScore.textContent = '0';
            }
            if (this.elements.computerScore) {
                this.elements.computerScore.textContent = '0';
            }
            
            // Reset player name elements to prevent duplication
            if (this.elements.player1Name) {
                this.elements.player1Name.innerHTML = '<i class="fas fa-user"></i><span>Player 1</span>';
            }
            if (this.elements.player2Name) {
                this.elements.player2Name.innerHTML = '<i class="fas fa-user"></i><span>Player 2</span>';
            }
        }
    },
    
    reset: function() {
        console.log('Resetting game...');
        
        // Clear old elements when resetting too
        this.clearGameElements();
        
        // Reset game state
        this.finished = false;
        
        // Reset game state
        this.gameVars = {
            score1: 0,
            score2: 0,
            WINNING_SCORE: 5,
            MAX_ANGLE: 5 * Math.PI / 12,
            angle: -Math.PI / 7
        };
        
        // Reset flags and references
        this.initialized = false;
        this.gameObjects = null;
        this.handlers = {};
        
        // Reset UI elements if they exist
        if (this.elements) {
            if (this.elements.finishButton) {
                this.elements.finishButton.style.display = 'none';
            }
            if (this.elements.playerScore) {
                this.elements.playerScore.textContent = '0';
            }
            if (this.elements.computerScore) {
                this.elements.computerScore.textContent = '0';
            }
            
            // Reset player name elements to prevent duplication
            if (this.elements.player1Name) {
                this.elements.player1Name.innerHTML = '<i class="fas fa-user"></i><span>Player 1</span>';
            }
            if (this.elements.player2Name) {
                this.elements.player2Name.innerHTML = '<i class="fas fa-user"></i><span>Player 2</span>';
            }
        }
    }
};

// Standard Game Interface (for direct game view)
window.Game = {
    // Initialize the regular game
    init: function() {
        // Clear any tournament data to ensure we're running a regular game
        localStorage.removeItem('currentMatch');
        
        // Get player names
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const player1 = userData.name || document.getElementById('userName')?.textContent || 'Player 1';
        
        // Initialize the game engine with standard settings
        window.GameEngine.init({
            player1: player1,
            player2: 'Player 2',
            winningScore: 5,
            onGameOver: function(winner, score1, score2) {
                console.log(`Regular game over: ${winner} wins ${score1}-${score2}`);
                
                if (this.elements.finishButton) {
                    this.elements.finishButton.textContent = 'Return to Home';
                    this.elements.finishButton.style.display = 'flex';
                }
            }
        });
    },
    
    // Cleanup function
    cleanup: function() {
        if (window.GameEngine) {
            window.GameEngine.cleanup();
        }
    },
    
    // Reset function
    reset: function() {
        this.cleanup();
    }
};

// Export functions for external use
window.initializeGame = function() {
    window.Game.init();
};

window.cleanupGame = function() {
    window.Game.cleanup();
};

window.resetGame = function() {
    window.Game.reset();
}; 