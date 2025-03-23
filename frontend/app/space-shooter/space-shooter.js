// Initialize the space shooter game
window.addEventListener('keydown', (e)=> {
    if (e.key == 'r' && localStorage.getItem('currentView') == 'spaceShooter')
        e.preventDefault();
})
window.SpaceShooter = {
    init: function() {
        console.log("Initializing Space Shooter game");
        
        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 800;
        canvas.height = 600;
        
        // Multiplayer mode setup
        let isMultiplayerMode = false;
        let player1Name = "Player 1";
        let player2Name = "Player 2";
        let player1, player2;
        let player1Score = 0;
        let player2Score = 0;
        let gameLoopStarted = false;
        
        // Game variables
        let player;
        let bullets = [];
        let bombs = [];
        let powerUps = [];
        let particles = [];
        let stars = [];
        let score = 0;
        let lastShotTime = 0;
        let shotDelay = 300;
        // Single keys object for all controls
        let keys = { 
            left: false, right: false, shoot: false,
            p1Left: false, p1Right: false, p1Shoot: false,
            p2Left: false, p2Right: false, p2Shoot: false
        };
        let gameActive = true;
        
        // Show game mode selection at startup
        function showGameModeSelection() {
            const gameModeSelection = document.getElementById('gameModeSelection');
            const gameCanvas = document.getElementById('gameCanvas');
            const hud = document.getElementById('hud');
            
            if (gameModeSelection) gameModeSelection.style.display = 'block';
            if (gameCanvas) gameCanvas.style.display = 'none';
            if (hud) hud.style.display = 'none';
        }
        
        // Start single player mode
        document.getElementById('singlePlayerBtn').addEventListener('click', function() {
            const gameModeSelection = document.getElementById('gameModeSelection');
            const gameCanvas = document.getElementById('gameCanvas');
            const hud = document.getElementById('hud');
            
            if (gameModeSelection) gameModeSelection.style.display = 'none';
            if (gameCanvas) gameCanvas.style.display = 'block';
            if (hud) hud.style.display = 'flex';
            
            isMultiplayerMode = false;
            startGame();
        });
        
        // Show multiplayer setup
        document.getElementById('multiplayerBtn').addEventListener('click', function() {
            document.getElementById('gameModeSelection').style.display = 'none';
            document.getElementById('multiplayerSetup').style.display = 'block';
        });
        
        // Start multiplayer game
        document.getElementById('startMultiplayerBtn').addEventListener('click', function() {
            player1Name = document.getElementById('player1NameInput').value || "Player 1";
            player2Name = document.getElementById('player2NameInput').value || "Player 2";
            
            document.getElementById('multiplayerSetup').style.display = 'none';
            document.getElementById('gameCanvas').style.display = 'block';
            document.getElementById('multiplayerHUD').style.display = 'flex';
            
            // Update player name displays
            document.getElementById('player1NameDisplay').textContent = player1Name;
            document.getElementById('player2NameDisplay').textContent = player2Name;
            
            isMultiplayerMode = true;
            startMultiplayerGame();
        });
        
        // Cancel multiplayer setup
        document.getElementById('cancelMultiplayerBtn').addEventListener('click', function() {
            document.getElementById('multiplayerSetup').style.display = 'none';
            document.getElementById('gameModeSelection').style.display = 'block';
        });
        
        // Initialize the game based on selected mode
        function startGame() {
            // Regular single player game initialization
            player = new Player();
            gameActive = true;
            score = 0;
            
            // Start game loop if it's not already running
            if (!gameLoopStarted) {
                gameLoop();
                gameLoopStarted = true;
            }
        }
        
        function startMultiplayerGame() {
            // Create two players
            player1 = new Player(1);
            player1.active = true;
            player2 = new Player(2);
            player2.active = true;
            
            // Reset scores
            player1Score = 0;
            player2Score = 0;
            
            // Update score display
            document.getElementById('player1ScoreDisplay').textContent = player1Score;
            document.getElementById('player2ScoreDisplay').textContent = player2Score;
            document.getElementById('p1hp').textContent = player1.hp;
            document.getElementById('p2hp').textContent = player2.hp;
            
            gameActive = true;
            
            // Start spawning bombs
            window.SpaceShooter.bombInterval = setInterval(() => {
                if (gameActive) bombs.push(new Bomb());
            }, 1000);
            
            // Start spawning power-ups
            window.SpaceShooter.powerUpInterval = setInterval(() => {
                if (gameActive && Math.random() < 0.3) powerUps.push(new PowerUp());
            }, 5000);
            
            // Start game loop
            if (!gameLoopStarted) {
                console.log("Starting game loop");
                gameLoop();
                gameLoopStarted = true;
            }
        }
        
        // Game objects
        class Player {
            constructor(playerNum = 1) {
                this.playerNum = playerNum;
                this.width = 50;
                this.height = 20;
                this.active = true;
                
                if (playerNum === 1) {
                    this.x = canvas.width / 3 - this.width / 2;
                    this.color = "#4a89dc"; // Blue for player 1
                } else {
                    this.x = (canvas.width / 3) * 2 - this.width / 2;
                    this.color = "#ff5555"; // Red for player 2
                }
                
                this.y = canvas.height - this.height - 30;
                this.speed = 5;
                this.hp = 3;
                this.thrusterSize = 0;
                this.thrusterDir = 1;
                this.score = 0;
            }
            
            draw() {
                // Main ship body
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + this.height);
                ctx.lineTo(this.x + this.width / 2, this.y);
                ctx.lineTo(this.x + this.width, this.y + this.height);
                ctx.closePath();
                ctx.fill();
                
                // Ship details
                ctx.fillStyle = this.playerNum === 1 ? "#2a6dd4" : "#d42a2a";
                ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 5);
                
                // Cockpit glow
                ctx.fillStyle = this.playerNum === 1 ? "#00ccff" : "#ffcc00";
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, this.y + 7, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // Thruster animation
                this.thrusterSize += 0.2 * this.thrusterDir;
                if (this.thrusterSize > 10 || this.thrusterSize < 0) this.thrusterDir *= -1;
                
                ctx.fillStyle = "#ff7700";
                ctx.beginPath();
                ctx.moveTo(this.x + 10, this.y + this.height);
                ctx.lineTo(this.x + 20, this.y + this.height + 5 + this.thrusterSize);
                ctx.lineTo(this.x + 30, this.y + this.height);
                ctx.closePath();
                ctx.fill();
            }
            
            move(left, right) {
                if (left && this.x > 0) this.x -= this.speed;
                if (right && this.x < canvas.width - this.width) this.x += this.speed;
            }
            
            shoot() {
                if (Date.now() - lastShotTime > shotDelay) {
                    const bulletColor = this.playerNum === 1 ? "#00ccff" : "#ffcc00";
                    bullets.push(new Bullet(this.x + this.width / 2 - 1.5, this.y, bulletColor, this.playerNum));
                    createExplosion(this.x + this.width / 2, this.y, bulletColor, 5);
                    soundManager.play('shoot');
                    lastShotTime = Date.now();
                    return true;
                }
                return false;
            }
        }
        
        class Bullet {
            constructor(x, y, color = "#00ccff", playerNum = 1) {
                this.x = x;
                this.y = y;
                this.width = 3;
                this.height = 15;
                this.speed = 10;
                this.color = color;
                this.glow = 10;
                this.playerNum = playerNum; // Track which player fired this bullet
            }
            
            update() {
                this.y -= this.speed;
            }
            
            draw() {
                // Bullet glow
                ctx.fillStyle = `rgba(0, 204, 255, 0.3)`;
                ctx.beginPath();
                ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.glow, 0, Math.PI * 2);
                ctx.fill();
                
                // Bullet body
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }
        
        class Bomb {
            constructor() {
                this.x = Math.random() * (canvas.width - 30);
                this.y = 0;
                this.size = 30;
                this.speed = 2 + Math.random() * 2;
                this.rotation = 0;
                this.rotationSpeed = 0.05;
            }
            
            update() {
                this.y += this.speed;
                this.rotation += this.rotationSpeed;
            }
            
            draw() {
                ctx.save();
                ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
                ctx.rotate(this.rotation);
                
                // Bomb body
                ctx.fillStyle = "#ff3333";
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Bomb details
                ctx.fillStyle = "#cc0000";
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Fuse
                ctx.strokeStyle = "#aaaaaa";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, -this.size / 2);
                ctx.lineTo(0, -this.size / 2 - 10);
                ctx.stroke();
                
                // Fuse spark
                ctx.fillStyle = "#ffff00";
                ctx.beginPath();
                ctx.arc(0, -this.size / 2 - 12, 3, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
            }
        }
        
        class PowerUp {
            constructor(type) {
                this.x = Math.random() * (canvas.width - 25);
                this.y = 0;
                this.size = 25;
                this.speed = 1.5 + Math.random();
                this.type = type;
                this.angle = 0;
                this.pulse = 0;
                this.pulseDir = 1;
            }
            
            update() {
                this.y += this.speed;
                this.angle += 0.05;
                this.pulse += 0.05 * this.pulseDir;
                if (this.pulse > 1 || this.pulse < 0) this.pulseDir *= -1;
            }
            
            draw() {
                ctx.save();
                ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
                ctx.rotate(this.angle);
                
                // Outer glow
                const glowColor = this.type === "hp" ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 255, 0.3)";
                ctx.fillStyle = glowColor;
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2 + 5 + this.pulse * 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Power-up background
                const bgColor = this.type === "hp" ? "#00aa00" : "#aa00aa";
                ctx.fillStyle = bgColor;
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Power-up icon
                ctx.fillStyle = "#ffffff";
                if (this.type === "hp") {
                    // Health icon (plus)
                    ctx.fillRect(-2, -10, 4, 20);
                    ctx.fillRect(-10, -2, 20, 4);
                } else {
                    // Speed icon (lightning bolt)
                    ctx.beginPath();
                    ctx.moveTo(-2, -10);
                    ctx.lineTo(5, -2);
                    ctx.lineTo(0, 2);
                    ctx.lineTo(2, 10);
                    ctx.lineTo(-5, 0);
                    ctx.lineTo(0, -4);
                    ctx.closePath();
                    ctx.fill();
                }
                
                ctx.restore();
            }
        }
        
        class Particle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 4 - 2;
                this.speedY = Math.random() * 4 - 2;
                this.color = color;
                this.life = 30;
                this.maxLife = 30;
            }
            
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life--;
                // Ensure size never becomes negative
                this.size = Math.max(0.1, (this.life / this.maxLife) * 3);
            }
            
            draw() {
                // Only draw if size is positive
                if (this.size > 0) {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        class Star {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speed = this.size * 0.5;
            }
            
            update() {
                this.y += this.speed;
                if (this.y > canvas.height) {
                    this.y = 0;
                    this.x = Math.random() * canvas.width;
                }
            }
            
            draw() {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }

        }
        
        // Game mechanics
        function spawnBomb() {
            if (gameActive) bombs.push(new Bomb());
        }
        setInterval(spawnBomb, 1500);
        
        function spawnPowerUp() {
            if (gameActive) powerUps.push(new PowerUp(Math.random() > 0.5 ? "hp" : "fast"));
        }
        setInterval(spawnPowerUp, 8000);
        
        function createExplosion(x, y, color, count = 20) {
            for (let i = 0; i < count; i++) {
                particles.push(new Particle(x, y, color));
            }
        }
        
        // Game history functionality
        let gameHistory = [];
        try {
            const savedHistory = localStorage.getItem('spaceShooterHistory');
            if (savedHistory) {
                gameHistory = JSON.parse(savedHistory);
                // Ensure gameHistory is an array
                if (!Array.isArray(gameHistory)) {
                    gameHistory = [];
                }
            }
        } catch (error) {
            console.error("Error loading game history:", error);
            gameHistory = [];
        }

        let bestScore = parseInt(localStorage.getItem('spaceShooterBestScore') || '0');
        let bestScoreDate = localStorage.getItem('spaceShooterBestScoreDate') || 'Never';
        
        // Update best score display
        document.getElementById('bestScore').textContent = bestScore;
        document.getElementById('bestScoreDate').textContent = bestScoreDate;
        
        // Game history button functionality
        document.getElementById('gameHistoryBtn').addEventListener('click', () => {
            // Show history panel
            document.getElementById('gameHistoryPanel').style.display = 'block';
            
            // Populate history list
            updateHistoryList();
        });
        
        // Close history panel button
        document.getElementById('closeHistoryBtn').addEventListener('click', () => {
            document.getElementById('gameHistoryPanel').style.display = 'none';
        });
        
        function updateHistoryList() {
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = '';
            
            if (!Array.isArray(gameHistory) || gameHistory.length === 0) {
                historyList.innerHTML = '<div class="no-history">No game history yet</div>';
                return;
            }
            
            // Display most recent games first (up to 10)
            gameHistory.slice(0, 10).forEach(game => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <div class="history-score">Score: ${game.score}</div>
                    <div class="history-date">${game.date}</div>
                `;
                historyList.appendChild(historyItem);
            });
        }
        
        function saveGameToHistory(finalScore) {
            // Ensure gameHistory is an array
            if (!Array.isArray(gameHistory)) {
                gameHistory = [];
            }
            
            // Create new game record
            const gameRecord = {
                score: finalScore,
                date: new Date().toLocaleString()
            };
            
            // Add to history
            gameHistory.unshift(gameRecord); // Add to beginning of array
            
            // Keep only the last 20 games
            if (gameHistory.length > 20) {
                gameHistory = gameHistory.slice(0, 20);
            }
            
            // Update best score if needed
            if (finalScore > bestScore) {
                bestScore = finalScore;
                bestScoreDate = gameRecord.date;
                localStorage.setItem('spaceShooterBestScore', bestScore);
                localStorage.setItem('spaceShooterBestScoreDate', bestScoreDate);
                
                // Update display
                document.getElementById('bestScore').textContent = bestScore;
                document.getElementById('bestScoreDate').textContent = bestScoreDate;
            }
            
            // Save to localStorage
            try {
                localStorage.setItem('spaceShooterHistory', JSON.stringify(gameHistory));
            } catch (error) {
                console.error("Error saving game history:", error);
            }
        }
        
        // Update function for multiplayer mode
        function updateMultiplayer() {
            if (!gameActive) return;
            
            // Update stars
            stars.forEach(star => star.update());
            
            // Update player 1
            if (player1 && player1.active) {
                player1.move(keys.p1Left, keys.p1Right);
                
                // Shoot bullets for player 1
                if (keys.p1Shoot) {
                    if (player1.shoot()) {
                        player1.score += 1; // Small score for shooting
                        document.getElementById('player1ScoreDisplay').textContent = player1Score + player1.score;
                    }
                }
            }
            
            // Update player 2
            if (player2 && player2.active) {
                player2.move(keys.p2Left, keys.p2Right);
                
                // Shoot bullets for player 2
                if (keys.p2Shoot) {
                    if (player2.shoot()) {
                        player2.score += 1; // Small score for shooting
                        document.getElementById('player2ScoreDisplay').textContent = player2Score + player2.score;
                    }
                }
            }
            
            // Update bullets
            for (let i = 0; i < bullets.length; i++) {
                bullets[i].update();
                if (bullets[i].y < 0) {
                    bullets.splice(i, 1);
                    i--;
                }
            }
            
            // Update bombs
            for (let i = 0; i < bombs.length; i++) {
                const bomb = bombs[i];
                bomb.update();
                
                // Collision with player 1
                if (player1 && player1.active && 
                    bomb.x + bomb.size / 2 > player1.x &&
                    bomb.x + bomb.size / 2 < player1.x + player1.width &&
                    bomb.y + bomb.size / 2 > player1.y &&
                    bomb.y + bomb.size / 2 < player1.y + player1.height
                ) {
                    player1.hp--;
                    document.getElementById("p1hp").textContent = player1.hp;
                    createExplosion(bomb.x + bomb.size / 2, bomb.y + bomb.size / 2, "#ff5555", 30);
                    soundManager.play('explosion');
                    bombs.splice(i, 1);
                    i--;
                    
                    if (player1.hp <= 0) {
                        createExplosion(player1.x + player1.width / 2, player1.y + player1.height / 2, "#4a89dc", 50);
                        soundManager.play('explosion');
                        player1.active = false;
                        
                        // Check if game is over
                        if (!player2.active) {
                            // Both players are out, determine winner
                            const winner = player1.score > player2.score ? 1 : 2;
                            showWinner(winner);
                        }
                    }
                    continue;
                }
                
                // Collision with player 2
                if (player2 && player2.active && 
                    bomb.x + bomb.size / 2 > player2.x &&
                    bomb.x + bomb.size / 2 < player2.x + player2.width &&
                    bomb.y + bomb.size / 2 > player2.y &&
                    bomb.y + bomb.size / 2 < player2.y + player2.height
                ) {
                    player2.hp--;
                    document.getElementById("p2hp").textContent = player2.hp;
                    createExplosion(bomb.x + bomb.size / 2, bomb.y + bomb.size / 2, "#ff5555", 30);
                    soundManager.play('explosion');
                    bombs.splice(i, 1);
                    i--;
                    
                    if (player2.hp <= 0) {
                        createExplosion(player2.x + player2.width / 2, player2.y + player2.height / 2, "#ff5555", 50);
                        soundManager.play('explosion');
                        player2.active = false;
                        
                        // Check if game is over
                        if (!player1.active) {
                            // Both players are out, determine winner
                            const winner = player1.score > player2.score ? 1 : 2;
                            showWinner(winner);
                        }
                    }
                    continue;
                }
                
                // Remove bombs that exit the screen
                if (bomb.y - bomb.size > canvas.height) {
                    bombs.splice(i, 1);
                    i--;
                    continue;
                }
                
                // Collision with bullets
                let hitByBullet = false;
                let bulletPlayerNum = 0;
                
                for (let j = 0; j < bullets.length; j++) {
                    if (
                        bullets[j].x < bomb.x + bomb.size &&
                        bullets[j].x + bullets[j].width > bomb.x &&
                        bullets[j].y < bomb.y + bomb.size &&
                        bullets[j].y + bullets[j].height > bomb.y
                    ) {
                        bulletPlayerNum = bullets[j].playerNum;
                        createExplosion(bomb.x + bomb.size / 2, bomb.y + bomb.size / 2, "#ffcc00", 20);
                        soundManager.play('explosion');
                        bullets.splice(j, 1);
                        hitByBullet = true;
                        break;
                    }
                }
                
                if (hitByBullet) {
                    // Award points to the player who shot the bomb
                    if (bulletPlayerNum === 1 && player1 && player1.active) {
                        player1.score += 10;
                        document.getElementById('player1ScoreDisplay').textContent = player1Score + player1.score;
                    } else if (bulletPlayerNum === 2 && player2 && player2.active) {
                        player2.score += 10;
                        document.getElementById('player2ScoreDisplay').textContent = player2Score + player2.score;
                    }
                    
                    bombs.splice(i, 1);
                    i--;
                }
            }
            
            // Update power-ups
            for (let i = 0; i < powerUps.length; i++) {
                const powerUp = powerUps[i];
                powerUp.update();
                
                // Collision with player 1
                if (player1 && player1.active && 
                    powerUp.x + powerUp.size / 2 > player1.x &&
                    powerUp.x + powerUp.size / 2 < player1.x + player1.width &&
                    powerUp.y + powerUp.size / 2 > player1.y &&
                    powerUp.y + powerUp.size / 2 < player1.y + player1.height
                ) {
                    if (powerUp.type === "health") {
                        player1.hp = Math.min(player1.hp + 1, 5);
                        document.getElementById("p1hp").textContent = player1.hp;
                    } else {
                        // Shield or other power-up
                        player1.score += 50;
                        document.getElementById('player1ScoreDisplay').textContent = player1Score + player1.score;
                    }
                    
                    createExplosion(powerUp.x + powerUp.size / 2, powerUp.y + powerUp.size / 2, powerUp.color, 15);
                    soundManager.play('powerup');
                    powerUps.splice(i, 1);
                    i--;
                    continue;
                }
                
                // Collision with player 2
                if (player2 && player2.active && 
                    powerUp.x + powerUp.size / 2 > player2.x &&
                    powerUp.x + powerUp.size / 2 < player2.x + player2.width &&
                    powerUp.y + powerUp.size / 2 > player2.y &&
                    powerUp.y + powerUp.size / 2 < player2.y + player2.height
                ) {
                    if (powerUp.type === "health") {
                        player2.hp = Math.min(player2.hp + 1, 5);
                        document.getElementById("p2hp").textContent = player2.hp;
                    } else {
                        // Shield or other power-up
                        player2.score += 50;
                        document.getElementById('player2ScoreDisplay').textContent = player2Score + player2.score;
                    }
                    
                    createExplosion(powerUp.x + powerUp.size / 2, powerUp.y + powerUp.size / 2, powerUp.color, 15);
                    soundManager.play('powerup');
                    powerUps.splice(i, 1);
                    i--;
                    continue;
                }
                
                // Remove power-ups that exit the screen
                if (powerUp.y - powerUp.size > canvas.height) {
                    powerUps.splice(i, 1);
                    i--;
                }
            }
            
            // Update particles
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                if (particles[i].life <= 0) {
                    particles.splice(i, 1);
                    i--;
                }
            }
        }
        
        // Draw function for multiplayer mode
        function drawMultiplayer() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw stars
            stars.forEach(star => star.draw());
            
            // Draw players if they're active
            if (player1 && player1.active) player1.draw();
            if (player2 && player2.active) player2.draw();
            
            // Draw game objects
            bullets.forEach(bullet => bullet.draw());
            bombs.forEach(bomb => bomb.draw());
            powerUps.forEach(powerUp => powerUp.draw());
            
            // Draw particles safely
            particles.forEach(particle => {
                if (particle.size > 0) {
                    particle.draw();
                }
            });
        }
        
        // Update the game loop to handle both modes
        function gameLoop() {
            if (isMultiplayerMode) {
                updateMultiplayer();
                drawMultiplayer();
            } else {
                update();
                draw();
            }
            requestAnimationFrame(gameLoop);
        }
        
        // Key event handlers for both single and multiplayer
        document.addEventListener("keydown", function(e) {
            // Single player controls
            if (e.key === "ArrowLeft") keys.left = true;
            if (e.key === "ArrowRight") keys.right = true;
            if (e.key === " ")
            {
                e.preventDefault();
                keys.shoot = true;
            }
            
            // Player 1 controls (A, D, W)
            if (e.key === "a" || e.key === "A") keys.p1Left = true;
            if (e.key === "d" || e.key === "D") keys.p1Right = true;
            if (e.key === "w" || e.key === "W") keys.p1Shoot = true;
            
            // Player 2 controls (Arrow keys)
            if (e.key === "ArrowLeft") keys.p2Left = true;
            if (e.key === "ArrowRight") keys.p2Right = true;
            if (e.key === "ArrowUp") keys.p2Shoot = true;
        });
        
        document.addEventListener("keyup", function(e) {
            // Single player controls
            if (e.key === "ArrowLeft") keys.left = false;
            if (e.key === "ArrowRight") keys.right = false;
            if (e.key === " ") keys.shoot = false;
            
            // Player 1 controls (A, D, W)
            if (e.key === "a" || e.key === "A") keys.p1Left = false;
            if (e.key === "d" || e.key === "D") keys.p1Right = false;
            if (e.key === "w" || e.key === "W") keys.p1Shoot = false;
            
            // Player 2 controls (Arrow keys)
            if (e.key === "ArrowLeft") keys.p2Left = false;
            if (e.key === "ArrowRight") keys.p2Right = false;
            if (e.key === "ArrowUp") keys.p2Shoot = false;
        });
        
        // Function to switch players in case one dies
        function switchPlayer() {
            // Implementation for player switching logic
        }
        
        // Function to show winner
        function showWinner(playerNum) {
            isMultiplayerMode = false;
            gameActive = false;
            
            // Show winner panel
            document.getElementById('winnerPanel').style.display = 'block';
            document.getElementById('winnerNumber').textContent = playerNum;
            document.getElementById('player1FinalScore').textContent = player1Score + player1.score;
            document.getElementById('player2FinalScore').textContent = player2Score + player2.score;
            
            // Hide multiplayer HUD
            document.getElementById('multiplayerHUD').style.display = 'none';
        }
        
        // Function to reset game
        function resetGame() {
            if (document.getElementById("gameModeSelection").style.display == 'block')
                return;
            gameActive = true;
            player.hp = 3;
            document.getElementById("hp").textContent = player.hp;
            score = 0;
            if (document.getElementById("score")) {
                document.getElementById("score").textContent = score;
            }
            
            // Clear game objects
            bullets.length = 0;
            bombs.length = 0;
            powerUps.length = 0;
            particles.length = 0;
            
            // Reset player position
            player.x = canvas.width / 2 - player.width / 2;
            player.y = canvas.height - player.height - 30;
            
            // Hide game over screen if it's visible
            document.getElementById("gameOver").style.display = "none";
            // Implementation for resetting the game
        }
        
        // Call this at the end of init to show game mode selection
        showGameModeSelection();

        // Add this before the game variables section
        class SoundManager {
            constructor() {
                this.sounds = {
                    shoot: new Audio('https://assets.mixkit.co/active_storage/sfx/1670/1670-preview.mp3'),
                    explosion: new Audio('https://assets.mixkit.co/active_storage/sfx/2771/2771-preview.mp3'),
                    powerup: new Audio('https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3')
                };
                this.muted = false;
            }

            play(soundName) {
                if (!this.muted && this.sounds[soundName]) {
                    // Clone the audio to allow multiple simultaneous plays
                    const sound = this.sounds[soundName].cloneNode();
                    sound.volume = 0.3; // Adjust volume as needed
                    sound.play();
                }
            }

            toggleMute() {
                this.muted = !this.muted;
                document.getElementById('soundIcon').style.opacity = this.muted ? '0.5' : '1';
            }
        }

        // Add this right after creating game variables
        const soundManager = new SoundManager();

        // Add sound toggle event listener after other event listeners
        document.getElementById('soundToggle').addEventListener('click', () => {
            soundManager.toggleMute();
        });

        // Modify the gameOver function to handle multiplayer mode
        function gameOver() {
            gameActive = false;
            
            if (isMultiplayerMode) {
                // In multiplayer mode, switch to the next player
                setTimeout(switchPlayer, 2000); // Give a short delay to see the game over screen
            } else {
                // In single player mode, show game over screen and save history
                document.getElementById("gameOver").style.display = "block";
                saveGameToHistory(score);
            }
        }
        
        document.getElementById("restartBtn").addEventListener("click", () => {
                // Reset game state
            if (document.getElementById("gameModeSelection").style.display == 'block')
                return;
            gameActive = true;
            player.hp = 3;
            document.getElementById("hp").textContent = player.hp;
            score = 0;
            if (document.getElementById("score")) {
                document.getElementById("score").textContent = score;
            }
            
            // Clear game objects
            bullets.length = 0;
            bombs.length = 0;
            powerUps.length = 0;
            particles.length = 0;
            
            // Reset player position
            player.x = canvas.width / 2 - player.width / 2;
            player.y = canvas.height - player.height - 30;
            
            // Hide game over screen if it's visible
            document.getElementById("gameOver").style.display = "none";
        });
        
        // Add event listener for the additional restart button in the game controls
        document.getElementById("restartGameBtn").addEventListener("click", () => {
            // Reset game state
            if (document.getElementById("gameModeSelection").style.display == 'block')
                return;
            gameActive = true;
            player.hp = 3;
            document.getElementById("hp").textContent = player.hp;
            score = 0;
            if (document.getElementById("score")) {
                document.getElementById("score").textContent = score;
            }
            
            // Clear game objects
            bullets.length = 0;
            bombs.length = 0;
            powerUps.length = 0;
            particles.length = 0;
            
            // Reset player position
            player.x = canvas.width / 2 - player.width / 2;
            player.y = canvas.height - player.height - 30;
            
            // Hide game over screen if it's visible
            document.getElementById("gameOver").style.display = "none";
        });
        
        // Return to single player mode
        document.getElementById('endMultiplayerBtn').addEventListener('click', () => {
            isMultiplayerMode = false;
            document.getElementById('multiplayerHUD').style.display = 'none';
            document.getElementById('winnerPanel').style.display = 'none';
            window.SpaceShooter.cleanup();
            // startMultiplayerGame();
            // document.getElementById("restartGameBtn").click();
            // resetGame();
        });
        
        function update() {
            if (!gameActive || !player) return;
            
            // Update stars
            stars.forEach(star => star.update());
            
            // Update player
            player.move(keys.left, keys.right);
            
            // Shoot bullets
            if (keys.shoot && Date.now() - lastShotTime > shotDelay) {
                bullets.push(new Bullet(player.x + player.width / 2 - 1.5, player.y));
                createExplosion(player.x + player.width / 2, player.y, "#00ccff", 5);
                soundManager.play('shoot');
                lastShotTime = Date.now();
            }
            
            // Update bullets
            for (let i = 0; i < bullets.length; i++) {
                bullets[i].update();
                if (bullets[i].y < 0) {
                    bullets.splice(i, 1);
                    i--;
                }
            }
            
            // Update bombs
            for (let i = 0; i < bombs.length; i++) {
                const bomb = bombs[i];
                bomb.update();
                
                // Collision with player
                if (
                    bomb.x + bomb.size / 2 > player.x &&
                    bomb.x + bomb.size / 2 < player.x + player.width &&
                    bomb.y + bomb.size / 2 > player.y &&
                    bomb.y + bomb.size / 2 < player.y + player.height
                ) {
                    player.hp--;
                    document.getElementById("hp").textContent = player.hp;
                    createExplosion(bomb.x + bomb.size / 2, bomb.y + bomb.size / 2, "#ff5555", 30);
                    soundManager.play('explosion');
                    bombs.splice(i, 1);
                    i--;
                    
                    if (player.hp <= 0) {
                        createExplosion(player.x + player.width / 2, player.y + player.height / 2, "#4a89dc", 50);
                        soundManager.play('explosion');
                        gameOver();
                    }
                    continue;
                }
                
                // Remove bombs that exit the screen
                if (bomb.y - bomb.size > canvas.height) {
                    bombs.splice(i, 1);
                    i--;
                    continue;
                }
                
                // Collision with bullets
                let hitByBullet = false;
                for (let j = 0; j < bullets.length; j++) {
                    const bullet = bullets[j];
                    if (
                        bullet.x + bullet.width / 2 > bomb.x &&
                        bullet.x + bullet.width / 2 < bomb.x + bomb.size &&
                        bullet.y + bullet.height / 2 > bomb.y &&
                        bullet.y + bullet.height / 2 < bomb.y + bomb.size
                    ) {
                        createExplosion(bomb.x + bomb.size / 2, bomb.y + bomb.size / 2, "#ff5555", 20);
                        soundManager.play('explosion');
                        hitByBullet = true;
                        bullets.splice(j, 1);
                        j--;
                        score += 10;
                        break;
                    }
                }
                
                if (hitByBullet) {
                    bombs.splice(i, 1);
                    i--;
                }
            }
            
            // Update powerups
            for (let i = 0; i < powerUps.length; i++) {
                const powerUp = powerUps[i];
                powerUp.update();
                
                if (powerUp.y > canvas.height) {
                    powerUps.splice(i, 1);
                    i--;
                    continue;
                }
                
                // Collision with player
                if (
                    powerUp.x + powerUp.size / 2 > player.x &&
                    powerUp.x + powerUp.size / 2 < player.x + player.width &&
                    powerUp.y + powerUp.size / 2 > player.y &&
                    powerUp.y + powerUp.size / 2 < player.y + player.height
                ) {
                    if (powerUp.type === "hp") {
                        player.hp++;
                        createExplosion(powerUp.x + powerUp.size / 2, powerUp.y + powerUp.size / 2, "#00ff00", 15);
                        soundManager.play('powerup');
                    }
                    if (powerUp.type === "fast") {
                        shotDelay = 100;
                        createExplosion(powerUp.x + powerUp.size / 2, powerUp.y + powerUp.size / 2, "#ff00ff", 15);
                        soundManager.play('powerup');
                        setTimeout(() => shotDelay = 300, 5000);
                    }
                    document.getElementById("hp").textContent = player.hp;
                    powerUps.splice(i, 1);
                    i--;
                }
            }
            
            // Update particles
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                if (particles[i].life <= 0) {
                    particles.splice(i, 1);
                    i--;
                }
            }
        }
        
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw stars
            stars.forEach(star => star.draw());
            
            // Draw player if game is active
            if (gameActive) player.draw();
            
            // Draw game objects
            bullets.forEach(bullet => bullet.draw());
            bombs.forEach(bomb => bomb.draw());
            powerUps.forEach(powerUp => powerUp.draw());
            
            // Draw particles safely
            particles.forEach(particle => {
                if (particle.size > 0) {
                    particle.draw();
                }
            });
        }
    },
    
    // Cleanup function to stop game and remove listeners
    cleanup: function() {
        console.log("Cleaning up Space Shooter game");
        
        // Cancel animation frame
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Clear all intervals
        if (this.bombInterval) {
            clearInterval(this.bombInterval);
            this.bombInterval = null;
        }
        
        if (this.powerUpInterval) {
            clearInterval(this.powerUpInterval);
            this.powerUpInterval = null;
        }
        
        // Remove all event listeners
        document.removeEventListener("keydown", this.keyDownHandler);
        document.removeEventListener("keyup", this.keyUpHandler);
        
        // Reset game state completely
        this.keys = { 
            left: false, right: false, shoot: false,
            p1Left: false, p1Right: false, p1Shoot: false,
            p2Left: false, p2Right: false, p2Shoot: false
        };
        
        // Clear canvas completely
        const canvas = document.getElementById("gameCanvas");
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        
        // Hide ALL game elements
        const elements = [
            "gameCanvas", "gameOver", "hud", "multiplayerHUD", 
            "winnerPanel", "gameModeSelection", "multiplayerSetup"
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (id === "gameCanvas") {
                    // For canvas, we might need to reset its properties
                    element.width = element.width; // This resets the canvas
                } else {
                    element.style.display = 'none';
                }
            }
        });
        
        // Force CSS refresh
        document.getElementById('spaceShooterStyles').media = "none";
        
        console.log("Space Shooter cleanup complete");
    }
};

// Expose functions needed by mainpage.js
window.initializeSpaceShooter = function() {
    window.SpaceShooter.init();
};

window.cleanupSpaceShooter = function() {
    window.SpaceShooter.cleanup();
}; 
