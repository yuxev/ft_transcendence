let player = document.querySelector(".player");
let arena = document.querySelector(".arena");
let ball = document.querySelector(".ball");
let playerScore = document.querySelector('.Score player');
let computerScore = document.querySelector('.Score computer');
// let score = document.getElementsByClassName("score");
let arenaPosition = arena.getBoundingClientRect();
console.log(arenaPosition);
console.log(arena.clientHeight);

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
  }

  moveBall(p1, p2){
    this.x = this.x + this.speed * Math.cos(ang) ;
    this.y = this.y - this.speed * Math.sin(ang) ;

    if (this.y > arena.clientHeight - 15|| this.y <= 0)
    {
      console.log(this.y);
      ang = (ang * -1) % (Math.PI * 2);
    }

    else if(this.x > arena.clientWidth - p2.Width / 2 - 1 - this.r && Math.abs(this.y - (p2.y + p2.Height / 2)) <=  p2.Height / 2)
    {
        this.speed *= 1.05;
        ang =  (this.y - (p2.y + p2.Height / 2)) / (p2.Height / 2) * MAXang - Math.PI;
        // ang = (Math.PI - ang) % (Math.PI * 2);
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

    // console.log("ball X:", this.x, "- Y:" , this.y);
    ball.style.top =`${this.y}px`;
    ball.style.left =`${this.x}px`;
  }
}

const p1 = new PlayerObj();
const p2 = new PlayerObj();
p2.setNewKey('ArrowUp', 'ArrowDown');
p2.setName('computer');
p2.setNewX(arena.clientWidth - p2.Width / 2);
p2.element.style.backgroundColor = 'red';
const squareball = new BallObj();
function gameLoop()
{
  p1.movePlayer();
  p2.movePlayer();
  squareball.moveBall(p1, p2);
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
