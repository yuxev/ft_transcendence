var container = document.querySelector(".multiplayer-container");
// Only create Game if it doesn't exist
window.GameEngine = {
        initialized: false,
        finished: false,

        // Add game variables
        gameVars: {
            numPlayer: 4,
            milliseconds: 1000,
            gameCondition: true,
            WINNING_SCORE: 5,
            aiError: 0,
            // Arenaleft: parseInt(window.getComputedStyle(arena).left),
            MAX_ANGLE: 5 * Math.PI / 12,
            // Add fixed dimensions
        },
        dimensions: {
            ARENA_WIDTH: 800,
            ARENA_HEIGHT: 500,
            PADDLE_WIDTH: 20,
            PADDLE_HEIGHT: 200,
            BALL_SIZE: 20,
            distance: 800 / 2,
        },
        
        
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
        
    init: function(options = {}) {
            console.log('Initializing game engine...');

            this.clearGameElements();

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
        // this.gameVars.score1 = 0;
        // this.gameVars.score2 = 0;
        // this.gameVars.score3 = 0;
        // this.gameVars.score4 = 0;
        this.gameVars.aiError = 0;
        this.finished = false;
        
        // Get elements
        this.getElements();
        
        // Reset display
        if (this.elements.player1Score) this.elements.player1Score.textContent = '0';
        if (this.elements.player2Score) this.elements.player2Score.textContent = '0';
        if (this.elements.player3Score) this.elements.player3Score.textContent = '0';
        if (this.elements.player4Score) this.elements.player4Score.textContent = '0';
            
            // Setup player names
            this.setupPlayerNames(options.player1, options.player2, options.player3, options.player4);

            // Add resize event listener to update dimensions when window size changes
            // window.addEventListener('resize', () => this.updateArenaDimensions());

            // Initialize game objects
            this.setupGameObjects();
            
            // Setup controls
            this.setupControls();

            // Mark as initialized
            this.initialized = true;
            
            // Start game loop
            this.startGameLoop();

            return this; // For chaining
        },

        getElements: function() {
        this.elements = {
            player: document.querySelector(".player"),
            arena: document.querySelector(".arena"),
            ball: document.querySelector(".ball"),
            player1Score: document.querySelector('#score1'),
            player2Score: document.querySelector('#score2'),
            player3Score: document.querySelector('#score3'),
            player4Score: document.querySelector('#score4'),
            player1Name: document.querySelector('#player1Name span'),
            player2Name: document.querySelector('#player2Name span'),
            player3Name: document.querySelector('#player3Name span'),
            player4Name: document.querySelector('#player4Name span'),
            finishButton: document.getElementById('finishGame')
        };
        
        // Hide finish button initially
        if (this.elements.finishButton) {
            this.elements.finishButton.style.display = 'none';
        }
        },
        
        setupPlayerNames: function(player1, player2, player3, player4) {
        console.log(`Setting up game with players: ${player1} vs ${player2} vs ${player3} vs ${player4}`);
        
        // Clear any existing content first to prevent duplication
        // for (let i = 0; ;i++) {}

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
        if (this.elements.player3Name) {
            this.elements.player3Name.innerHTML = '';
            const p3Icon = document.createElement('i');
            p3Icon.className = 'fas fa-user';
            this.elements.player3Name.appendChild(p3Icon);
            
            const p3Text = document.createElement('span');
            p3Text.textContent = player3 || 'Player 3';
            this.elements.player3Name.appendChild(p3Text);
        }
        if (this.elements.player4Name) {
            this.elements.player4Name.innerHTML = '';
            const p4Icon = document.createElement('i');
            p4Icon.className = 'fas fa-user';
            this.elements.player4Name.appendChild(p4Icon);
            
            const p4Text = document.createElement('span');
            p4Text.textContent = player4 || 'Player 4';
            this.elements.player4Name.appendChild(p4Text);
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
        
        setupGameObjects: function() {
            const self = this;

            // self.gameVars.numPlayer = 4;
            class PlayerObj {
                constructor(playerNumber, isComputer = false) {
                    this.Name = self.elements.player1Name.innerHTML;
                    this.id = playerNumber;
                    this.Move = 0;
                    this.speed = 14;
                    this.score = 0;
                    this.isComputer = isComputer;
                    this.thikingTime = Date.now();
                    this.goal = self.dimensions.ARENA_HEIGHT / 2;
                    this.errMargin = 50;

                    // Create element
                    this.element = document.createElement('div');
                    this.element.className = 'player';
                    this.element.style.width = self.dimensions.PADDLE_WIDTH + 'px';
                    this.element.style.height = self.dimensions.PADDLE_HEIGHT + 'px';

                    // Set position based on player number (1=left, 2=right, 3=top, 4=bottom)
                    // 10 == self.dimensions.PADDLE_WIDTH / 2
                    switch(playerNumber) {
                        case 1: // Left player
                            this.zone = false; // Vertical paddle
                            this.keyUP = 'w';
                            this.keyDown = 's';
                            this.x = self.dimensions.PADDLE_WIDTH / 2;
                            this.y = self.dimensions.ARENA_HEIGHT / 2 - self.dimensions.PADDLE_HEIGHT / 2;
                            this.element.style.top =`${this.y}px`;
                            this.goal = self.dimensions.ARENA_HEIGHT / 2;
                            this.element.style.background = 'rgba(199, 0, 130, 0.63)'; // Red player
                            break;
                        case 2: // Right player
                            this.zone = false; // Vertical paddle
                            this.keyUP = 'ArrowUp';
                            this.keyDown = 'ArrowDown';
                            this.x = self.dimensions.ARENA_WIDTH - self.dimensions.PADDLE_WIDTH * 3 / 2;
                            this.y = self.dimensions.ARENA_HEIGHT / 2 - self.dimensions.PADDLE_HEIGHT / 2;
                            this.goal = self.dimensions.ARENA_HEIGHT / 2;
                            this.element.style.background = 'rgba(3, 42, 108, 0.92)'; // Red player
                            this.element.style.top =`${this.y}px`;
                            break;
                        case 3: // Top player
                            this.zone = true; // Horizontal paddle
                            this.element.style.transform = `rotate(${90}deg)`;
                            this.keyUP = 't';
                            this.keyDown = 'y';
                            this.x = self.dimensions.ARENA_WIDTH / 2 - self.dimensions.PADDLE_WIDTH / 2;
                            this.y = self.dimensions.PADDLE_WIDTH;
                            this.element.style.background = 'rgba(0, 150, 0, 0.63)'; // Green player
                            this.element.style.top =`${this.y - self.dimensions.PADDLE_HEIGHT / 2}px`;
                            this.goal = self.dimensions.ARENA_WIDTH / 2;
                            break;
                            
                        case 4: // Bottom player
                            this.zone = true; // Horizontal paddle
                            this.keyUP = 'o';
                            this.keyDown = 'p';
                            this.element.style.transform = `rotate(${90}deg)`;
                            this.x = self.dimensions.ARENA_WIDTH / 2 - self.dimensions.PADDLE_WIDTH / 2;
                            this.y = self.dimensions.ARENA_HEIGHT - self.dimensions.PADDLE_WIDTH;
                            this.element.style.background = 'rgba(150, 0, 0, 0.63)'; // Green player
                            this.goal = self.dimensions.ARENA_WIDTH / 2;
                            this.element.style.top =`${this.y - self.dimensions.PADDLE_HEIGHT / 2}px`;
                            break;
                    }
                    this.element.style.left = `${this.x}px`;
                    this.setupControls();
                    self.elements.arena.appendChild(this.element);
                }

                movePlayer(){
                    if (this.Move == -1)
                        this.y = Math.max(this.y - this.speed, 0);
                    if (this.Move === 1)
                        this.y = Math.min(this.y + this.speed, self.dimensions.ARENA_HEIGHT - self.dimensions.PADDLE_HEIGHT);
                    this.element.style.top =`${this.y}px`;
                }

                movePlayerHorizontal(){
                    if (this.Move == -1)
                    this.x = Math.max(this.x - this.speed, self.dimensions.PADDLE_HEIGHT / 2 - self.dimensions.PADDLE_WIDTH / 2);
                    if (this.Move === 1)
                    this.x = Math.min(this.x + this.speed, self.dimensions.ARENA_WIDTH - self.dimensions.PADDLE_HEIGHT / 2 - self.dimensions.PADDLE_WIDTH / 2);
                    this.element.style.left =`${this.x}px`;
                }

                moveComputer(ball){
                    // line 1(axe) : (this.x,0) (this.x,self.dimensions.ARENA_HEIGHT - self.dimensions.PADDLE_HEIGHT)
                    // line 2(vector) : (ball.x,ball.y) (ball.x + this.speed * Math.cos(this.ang), ball.y - this.speed * Math.sin(this.ang))

                    const ballCenterX = ball.x + ball.r / 2;
                    const ballCenterY = ball.y + ball.r / 2;
                    // if(Math.abs (this.y - goal + self.dimensions.PADDLE_HEIGHT / 2) < 14){
                    //     level.gameCondition = 0;
                    //   }
                    // console.log('level.Width:',level.Arenaleft);
                    if(!this.zone && Math.abs (this.y + self.dimensions.PADDLE_HEIGHT / 2 - this.goal) > 14){
                        this.getInput(1 - 2 * ((this.y + self.dimensions.PADDLE_HEIGHT / 2) > this.goal));
                    }
                    else if(this.zone && Math.abs (this.x - this.goal) > 14)
                    {
                        this.getInput(1 - 2 * ((this.x) > this.goal));
                    }
                    else{
                        this.getInput(0);
                    }

                    // console.log('goal:',this.goal, this.zone, this.Name, this.thikingTime);
                    if (Date.now() - this.thikingTime > self.gameVars.milliseconds ) {
                        if (this.id === 2) {
                            self.dimensions.distance = (self.dimensions.ARENA_WIDTH - ballCenterX) / ball.vectX;
                            this.goal = ballCenterY + ball.vectY * self.dimensions.distance;
                        }
                        if (this.id === 1) {
                            self.dimensions.distance = (0 - ballCenterX) / ball.vectX;
                            this.goal = ballCenterY + ball.vectY * self.dimensions.distance;
                        } 
                        if (this.id === 3) {
                                self.dimensions.distance = (0 - ballCenterY) / ball.vectY;
                                this.goal = ballCenterX + ball.vectX * self.dimensions.distance;
                        }
                        if (this.id === 4) {
                                self.dimensions.distance = (self.dimensions.ARENA_HEIGHT - ballCenterY) / ball.vectY;
                                this.goal = ballCenterX + ball.vectX * self.dimensions.distance;
                            }
                        self.gameVars.aiError = (self.dimensions.distance / self.dimensions.ARENA_HEIGHT) * this.errMargin;
                        this.goal += Math.random() * (self.gameVars.aiError * 2) - self.gameVars.aiError;
                        this.thikingTime = Date.now();
                    }
                }

                getInput(decision){
                    this.Move = decision;
                    if(this.zone){
                        this.movePlayerHorizontal();
                    }
                    else{
                        this.movePlayer();
                    }
                }
                
                setColor(color){
                    this.element.style.backgroundColor = color;
                    this.scoreSection.style.backgroundColor = color;
                }

                setNewKey(newKeyUp, newKeyDown) {
                    this.keyUP = newKeyUp;
                    this.keyDown = newKeyDown;
                }

                setNewX(newPostionX) {
                    this.x = newPostionX;
                    this.element.style.left = `${newPostionX}px`;
                }

                setNewY(newPostionY) {
                    this.element.style.transform = `rotate(${90}deg)`;
                    this.y = newPostionY;
                    this.element.style.top = `${newPostionY}px`;
                }

                setName(newName) {
                    this.Name = newName;
                }
                
                addScore() {
                    this.score++;
                    return this.score;
                }

                setupControls() {
                    if(this.isComputer)
                    return;

                    document.addEventListener('keydown', (event) => {
                        if (event.key === this.keyUP) {
                            this.Move = -1;
                        } else if (event.key === this.keyDown) {
                            this.Move = 1;
                        }
                    });
                
                    document.addEventListener('keyup', (event) => {
                        if (event.key === this.keyUP && this.Move === -1) {
                            this.Move = 0;
                        } else if (event.key === this.keyDown && this.Move === 1) {
                            this.Move = 0;
                        }
                    });
                }
            }

        class BallObj {
            constructor() {
                // Create element
                this.element = document.createElement('div');
                this.element.className = 'ball';

                this.Name = "ball";
                this.x = self.dimensions.ARENA_WIDTH / 2 - self.dimensions.BALL_SIZE / 2;
                this.y = self.dimensions.ARENA_HEIGHT / 2 - self.dimensions.BALL_SIZE / 2;
                this.LastTouch = 0;
                this.speed = 4;
                this.vectX = this.speed * Math.cos((1 - (Math.random() > 0.5) * 2) * (1 - Math.random() * 2) * self.gameVars.MAX_ANGLE);
                this.vectY = - this.speed * Math.sin((1 - (Math.random() > 0.5) * 2) * (1 - Math.random() * 2) * self.gameVars.MAX_ANGLE);
                this.r = self.dimensions.BALL_SIZE;
                this.element.style.width = this.r;
                this.element.style.height = this.r;

                this.element.style.left = `${this.x}px`;
                this.element.style.top = `${this.y}px`;
                self.elements.arena.appendChild(this.element);
            }

            moveBall(p1, p2, p3, p4){
                // Store previous position for collision detection
                const prevX = this.x;
                const prevY = this.y;
                
                // let vectX = this.speed * Math.cos(this.angle);
                // let vectY = - this.speed * Math.sin(this.angle);

                // Update ball position
                this.x += this.vectX;
                this.y += this.vectY;
                
                // Update ball element position
                this.element.style.left = `${this.x}px`;
                this.element.style.top = `${this.y}px`;
                
                // Calculate ball center coordinates
                const ballCenterX = this.x + this.r / 2;
                const ballCenterY = this.y + this.r / 2;

                const ballLeft = this.x;
                const ballRight = this.x + this.r;
                const ballTop = this.y;
                const ballBottom = this.y + this.r;


                   // ===== PLAYER 1 (LEFT PADDLE) =====
                const p1Left = p1.x - self.dimensions.PADDLE_WIDTH;
                const p1Right = p1.x + this.r;
                const p1Top = p1.y;
                const p1Bottom = p1.y + self.dimensions.PADDLE_HEIGHT;
                const p1CenterY = p1.y + self.dimensions.PADDLE_HEIGHT / 2;

                if (ballBottom >= p1Top && prevY < p1Top &&
                    ballLeft < p1Right && ballRight > p1Left) {
                    // Reflect velocity vector across horizontal normal
                    this.vectY = -this.vectY;
                    this.vectX *= 1.05;
                    this.vectY *= 1.05;
                    this.speed *= 1.05;
                    this.y = p1Top - this.r;
                }
                // Bottom edge collision
                else if (ballTop <= p1Bottom && prevY > p1Bottom &&
                            ballLeft < p1Right && ballRight > p1Left) {
                    // Reflect velocity vector across horizontal normal
                    this.vectY = -this.vectY;
                    this.vectX *= 1.05;
                    this.vectY *= 1.05;
                    this.speed *= 1.05;
                    this.y = p1Bottom;
                }
                
                else if (prevX >= p1Right && this.x < p1Right && 
                    Math.abs(ballCenterY - p1CenterY) < self.dimensions.PADDLE_HEIGHT / 2) {
                    // Calculate normalized position on paddle (from -1 to 1)
                    const relativeIntersectY = (p1CenterY - ballCenterY) / (self.dimensions.PADDLE_HEIGHT / 2);

                    // Calculate bounce direction vector
                    // The further from center, the more extreme the angle
                    const bounceAngleScale = 1 + 0.5 * Math.abs(relativeIntersectY);
                    const normalizedY = -relativeIntersectY * bounceAngleScale;
                    
                    // Create normalized direction vector (pointing right and up/down based on hit position)
                    const directionLength = Math.sqrt(1 + normalizedY ** 2);
                    this.vectX = this.speed * 1.05 * (1 / directionLength);
                    this.vectY = this.speed * 1.05 * (normalizedY / directionLength);
                    
                    // Increase ball speed
                    this.speed *= 1.05;
                    // Set last touch
                    this.LastTouch = p1.id;
                    // Reposition ball to prevent sticking
                    this.x = p1Right;
                }
                
                // ===== PLAYER 2 (RIGHT PADDLE) =====
                const p2Left = p2.x + self.dimensions.PADDLE_WIDTH - this.r;
                const p2Right = p2.x;
                const p2Top = p2.y;
                const p2Bottom = p2.y + self.dimensions.PADDLE_HEIGHT;
                const p2CenterY = p2.y + self.dimensions.PADDLE_HEIGHT / 2;

                if (ballBottom >= p2Top && prevY < p2Top &&
                    ballLeft < p2Right && ballRight > p2Left) {
                    // Reflect velocity vector across horizontal normal
                    this.vectY = -this.vectY;
                    this.vectX *= 1.05;
                    this.vectY *= 1.05;
                    this.speed *= 1.05;
                    this.y = p2Top - this.r;
                }
                // Bottom edge collision
                else if (ballTop <= p2Bottom && prevY > p2Bottom &&
                    ballLeft < p2Right && ballRight > p2Left) {
                    // Reflect velocity vector across horizontal normal
                    this.vectY = -this.vectY;
                    this.vectX *= 1.05;
                    this.vectY *= 1.05;
                    this.speed *= 1.05;
                    this.y = p2Bottom;
                }
                
                else if (prevX <= p2Left && ballRight >= p2Left && 
                ballBottom >= p2Top && ballTop <= p2Bottom) {
                    // Calculate normalized position on paddle (from -1 to 1)
                    const relativeIntersectY = (p2CenterY - ballCenterY) / (self.dimensions.PADDLE_HEIGHT / 2);

                    // Calculate bounce direction vector
                    // The further from center, the more extreme the angle
                    const bounceAngleScale = 1 + 0.5 * Math.abs(relativeIntersectY);
                    const normalizedY = -relativeIntersectY * bounceAngleScale;
                    
                    // Create normalized direction vector (pointing right and up/down based on hit position)
                    const directionLength = Math.sqrt(1 + normalizedY ** 2);
                    this.vectX = -this.speed * 1.05 * (1 / directionLength);
                    this.vectY = this.speed * 1.05 * (normalizedY / directionLength);
                    
                    // Increase ball speed
                    this.speed *= 1.05;
                    // Set last touch
                    this.LastTouch = p2.id;
                    // Reposition ball to prevent sticking
                    this.x = p2Left - this.r;
                }
                
                // // ===== PLAYER 3 (TOP PADDLE) =====
                const p3Top = p3.y + self.dimensions.PADDLE_WIDTH / 2 - this.r;
                const p3Left = p3.x - self.dimensions.PADDLE_HEIGHT / 2 + self.dimensions.PADDLE_WIDTH / 2;
                const p3CenterX = p3.x;
                const p3Right = p3.x + self.dimensions.PADDLE_HEIGHT / 2 + self.dimensions.PADDLE_WIDTH / 2;
                const p3Bottom = p3.y - self.dimensions.PADDLE_WIDTH / 2  + this.r;

                
                // Left edge collision
                if (ballRight >= p3Left && prevX < p3Left &&
                    ballTop < p3Bottom && ballBottom > p3Top) {
                    this.vectX = -this.vectX;
                    this.vectX *= 1.05;
                    this.vectY *= 1.05;
                    this.speed *= 1.05;
                    this.x = p3Left - this.r;
                }
                // Right edge collision
                else if (ballLeft <= p3Right && prevX > p3Right &&
                    ballTop < p3Bottom && ballBottom > p3Top) {
                    this.vectX = -this.vectX;
                    this.vectX *= 1.05;
                    this.vectY *= 1.05;
                    this.speed *= 1.05;
                    this.x = p3Right;
                }
                else if (prevY >= p3Bottom && ballTop <= p3Bottom && 
                    ballRight >= p3Left && ballLeft <= p3Right) {
                    // Calculate normalized position on paddle (from -1 to 1)
                    const relativeIntersectX = (ballCenterX - p3CenterX) / (self.dimensions.PADDLE_HEIGHT / 2);
                    
                    // Calculate bounce direction vector
                    // The further from center, the more extreme the angle
                    const bounceAngleScale = 1 + 0.5 * Math.abs(relativeIntersectX);
                    const normalizedX = relativeIntersectX * bounceAngleScale * 0.5;

                    this.speed *= 1.05;
                    
                    // Create normalized direction vector (pointing up and left/right based on hit position)
                    const directionLength = Math.sqrt(1 + normalizedX ** 2);
                    this.vectX = this.speed * (normalizedX / directionLength);
                    this.vectY = this.speed * (1 / directionLength);

                    // Set last touch
                    this.LastTouch = p3.id;
                    // Reposition ball to prevent sticking
                    this.y = p3Bottom;
                }
                
                // Check collision with player 4 (bottom paddle)
                const p4Top = p4.y + self.dimensions.PADDLE_WIDTH / 2 - this.r;
                const p4Left = p4.x - self.dimensions.PADDLE_HEIGHT / 2 + self.dimensions.PADDLE_WIDTH / 2;
                const p4CenterX = p4.x;
                const p4Right = p4.x + self.dimensions.PADDLE_HEIGHT / 2 + self.dimensions.PADDLE_WIDTH / 2;
                const p4Bottom = p4.y + this.r;

                
                // Left edge collision
                if (ballRight >= p4Left && prevX < p4Left &&
                    ballTop < p4Bottom && ballBottom > p4Top) {
                    this.vectX = -this.vectX;
                    this.vectX *= 1.05;
                    this.vectY *= 1.05;
                    this.speed *= 1.05;
                    this.x = p4Left - this.r;
                }
                // Right edge collision
                else if (ballLeft <= p4Right && prevX > p4Right &&
                    ballTop < p4Bottom && ballBottom > p4Top) {
                    this.vectX = -this.vectX;
                    this.vectX *= 1.05;
                    this.vectY *= 1.05;
                    this.speed *= 1.05;
                    this.x = p4Right;
                }
                else if (prevY <= p4Top && ballBottom >= p4Top && 
                    ballRight >= p4Left && ballLeft <= p4Right) {
                    // Calculate normalized position on paddle (from -1 to 1)
                    const relativeIntersectX = (ballCenterX - p4CenterX) / (self.dimensions.PADDLE_HEIGHT / 2);
                    
                    // Calculate bounce direction vector
                    // The further from center, the more extreme the angle
                    const bounceAngleScale = 1 + 0.5 * Math.abs(relativeIntersectX);
                    const normalizedX = relativeIntersectX * bounceAngleScale * 0.5;

                    this.speed *= 1.05;
                    
                    // Create normalized direction vector (pointing up and left/right based on hit position)
                    const directionLength = Math.sqrt(1 + normalizedX ** 2);
                    this.vectX = this.speed * (normalizedX / directionLength);
                    this.vectY = -this.speed * (1 / directionLength);

                    // Set last touch
                    this.LastTouch = p4.id;
                    // Reposition ball to prevent sticking
                    this.y = p4Top - this.r ;
                }
                        // -> 190-> 209
                        // -> 251 ->219
                // Check if the baal has been scored
                if(this.x < -this.r - self.dimensions.PADDLE_WIDTH ||
                    this.x >= self.dimensions.ARENA_WIDTH + this.r ||
                    this.y >= self.dimensions.ARENA_HEIGHT + this.r ||
                    this.y < -this.r) {
                    const ang = (1 - (Math.random() > 0.5) * 2) * (1 - Math.random() * 2) * self.gameVars.MAX_ANGLE
                    switch(this.LastTouch) {
                        case 0:
                            this.countScore(p1, ang);
                            break;
                        case 1:
                            this.countScore(p1, ang);
                            break;
                        case 2:
                            this.countScore(p2, ang);
                            break;
                        case 3:
                            this.countScore(p3, ang);
                            break;
                        case 4:
                            this.countScore(p4, ang);
                            break;
                        }
                    this.ajustdiff(p1, p2, p3, p4);
                }

                if (p1.score >= self.gameVars.WINNING_SCORE || 
                    p2.score >= self.gameVars.WINNING_SCORE ||
                    p3.score >= self.gameVars.WINNING_SCORE ||
                    p4.score >= self.gameVars.WINNING_SCORE) {
                    if (!self.finished) {
                        self.finished = true;
                        const currentMatch = JSON.parse(localStorage.getItem('currentMatch'));

                        const winner = currentMatch.player1;
                        switch(self.gameVars.WINNING_SCORE) {
                            case p1.score:
                                winner = currentMatch.player1;
                                break;
                            case p2.score:
                                winner = currentMatch.player2;
                                break;
                            case p3.score:
                                winner = currentMatch.player3;
                                break;
                            case p4.score:
                                winner = currentMatch.player4;
                                break;
                            }
                            
                        localStorage.setItem('matchResult', JSON.stringify({
                            winner: winner,
                            score: `${p1.score}-${p2.score}-${p3.score}-${p4.score}`
                        }));
                            
                        const finishButton = document.getElementById('finishGame');
                        if (finishButton) {
                            finishButton.style.display = 'flex';
                        }
                    }
                }
            }

                countScore(player,ang) {
                    this.speed = 4;
                    this.vectX = this.speed * Math.cos(ang);
                    this.vectY = - this.speed * Math.sin(ang);
                    this.x = self.dimensions.ARENA_WIDTH / 2 - self.dimensions.BALL_SIZE / 2; // this.r
                    this.y = self.dimensions.ARENA_HEIGHT / 2 - self.dimensions.BALL_SIZE / 2; // this.r
                    if(!this.LastTouch)
                    return;
                    switch(player.id) {
                    case 1:
                        window.GameEngine.elements.player1Score.textContent = player.addScore();
                        break;
                    case 2:
                        window.GameEngine.elements.player2Score.textContent = player.addScore();
                        break;
                    case 3:
                        window.GameEngine.elements.player3Score.textContent = player.addScore();
                        break;
                    case 4:
                        window.GameEngine.elements.player4Score.textContent = player.addScore();
                        break;
                    }
                //   if(player.score >= self.gameVars.WINNNGSCORE)
                //     level.gameCondition = 0;
                }

                        // Create left player (player 1)

                ajustdiff(p1, p2, p3, p4){
                    if(p1.isComputer){
                    p1.errMargin = (self.gameVars.WINNING_SCORE - (p1.score - Math.max(p2.score, p3.score, p4.score))) * 50 / self.gameVars.WINNING_SCORE;
                    }
                    if(p2.isComputer){
                    p2.errMargin = (self.gameVars.WINNING_SCORE - (p2.score - Math.max(p1.score, p3.score, p4.score))) * 50 / self.gameVars.WINNING_SCORE;
                    }
                    if(p3.isComputer){
                    p3.errMargin = (self.gameVars.WINNING_SCORE - (p3.score - Math.max(p1.score, p2.score, p4.score))) * 50 / self.gameVars.WINNING_SCORE;
                    }
                    if(p4.isComputer){
                    p4.errMargin = (self.gameVars.WINNING_SCORE - (p4.score - Math.max(p1.score, p2.score, p3.score))) * 50 / self.gameVars.WINNING_SCORE;
                    }
                }

            }

            // Initialize game objects
            this.gameObjects = {
                p1: new PlayerObj(1),
                p2: new PlayerObj(2),
                p3: new PlayerObj(3),
                p4: new PlayerObj(4),
                ball: new BallObj()
            };
        
        },

        detectType: function(player){
            if(player.isComputer){
            player.moveComputer(this.gameObjects.ball);
            }
            else{
            if(player.zone) player.movePlayerHorizontal();
            else player.movePlayer();
            }
        },
        
        startGameLoop: function() {
        if (!this.initialized) return;

        // for (const player of this.gameObjects.players) {
        //     this.detectType(player);
        // }

        this.detectType(this.gameObjects.p1);
        this.detectType(this.gameObjects.p2);
        this.detectType(this.gameObjects.p3);
        this.detectType(this.gameObjects.p4);

        this.gameObjects.ball.moveBall(this.gameObjects.p1, this.gameObjects.p2,
            this.gameObjects.p3, this.gameObjects.p4);
        requestAnimationFrame(() => this.startGameLoop());
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
        console.log('Cleaning up game engine');
        
        // Clear any game elements
        this.clearGameElements();
        
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
            numPlayer: 4,
            milliseconds: 1000,
            gameCondition: true,
            WINNING_SCORE: 5,
            MAX_ANGLE: 5 * Math.PI / 12,
            aiError: 0,
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
            if (this.elements.player2Score) {
                this.elements.player2Score.textContent = '0';
            }
            if (this.elements.player1Score) {
                this.elements.player1Score.textContent = '0';
            }
            if (this.elements.player3Score) {
                this.elements.player1Score.textContent = '0';
            }
            if (this.elements.player4Score) {
                this.elements.player1Score.textContent = '0';
            }
            
            // Reset player name elements to prevent duplication
            if (this.elements.player1Name) {
                this.elements.player1Name.innerHTML = '<i class="fas fa-user"></i><span>Player 1</span>';
            }
            if (this.elements.player2Name) {
                this.elements.player2Name.innerHTML = '<i class="fas fa-user"></i><span>Player 2</span>';
            }
            if (this.elements.player3Name) {
                this.elements.player3Name.innerHTML = '<i class="fas fa-user"></i><span>Player 3</span>';
            }
            if (this.elements.player4Name) {
                this.elements.player4Name.innerHTML = '<i class="fas fa-user"></i><span>Player 4</span>';
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
            MAX_ANGLE: 5 * Math.PI / 12
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
            if (this.elements.player2Score) {
                this.elements.player2Score.textContent = '0';
            }
            if (this.elements.player1Score) {
                this.elements.player1Score.textContent = '0';
            }
            if (this.elements.player3Score) {
                this.elements.player1Score.textContent = '0';
            }
            if (this.elements.player4Score) {
                this.elements.player1Score.textContent = '0';
            }
            
            // Reset player name elements to prevent duplication
            if (this.elements.player1Name) {
                this.elements.player1Name.innerHTML = '<i class="fas fa-user"></i><span>Player 1</span>';
            }
            if (this.elements.player2Name) {
                this.elements.player2Name.innerHTML = '<i class="fas fa-user"></i><span>Player 2</span>';
            }
            if (this.elements.player3Name) {
                this.elements.player3Name.innerHTML = '<i class="fas fa-user"></i><span>Player 3</span>';
            }
            if (this.elements.player4Name) {
                this.elements.player4Name.innerHTML = '<i class="fas fa-user"></i><span>Player 4</span>';
            }
        }
    }
};

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
            player3: 'Player 3',
            player4: 'Player 4',
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

// Export game functions to window


window.initializeGame = function() {
    window.Game.init();
};

window.cleanupGame = function() {
    window.Game.cleanup();
};

window.resetGame = function() {
    window.Game.reset();
};
