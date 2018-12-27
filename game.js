let canvas;
let canvasContext;

let ballSize = 25;
let ballX = 0;
let speedX = 11;
let ballY = 250;
let START_SPEED_Y = 4
let speedY = START_SPEED_Y;

let MARGIN = 10;
let PADDLE_HEIGHT = 100;
let PADDLE_WIDTH = 110;
let playerY = 250;
let enemyY = 250;
let enemySpeed = 8;

let playerScore = 0;
let enemyScore = 0;
let playerLabel;
let enemyLabel;
const WINNING_SCORE = 11;
let gameID;
let restarting = false;
let fireShot = false;
let startButton;

let spaceImg;
let playerImg;
let enemyImg;
let ballImg;
let fireballImg;
let authorLink;


window.onload = () => {
    canvas = document.getElementById('gameCanvas');
    main = document.getElementById('main');
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    canvasContext = canvas.getContext('2d');
    playerLabel = document.getElementById('playerScore');
    enemyLabel = document.getElementById('enemyScore');
    authorLink = document.getElementById('af_link');

    // ball init position
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;

    // create images
    spaceImg = new Image();
    spaceImg.src = 'images/space_background.png';
    ballImg = new Image();
    ballImg.src = 'images/moon.png';
    fireballImg = new Image();
    fireballImg.src = 'images/fire_moon.png';
    playerImg = new Image();
    playerImg.src = 'images/player.png';
    enemyImg = new Image();
    enemyImg.src = 'images/enemy.png'

    // listerner mouse movement
    canvas.addEventListener('mousemove', evt => {
        let position = mousePosition(evt);
        playerY = position.y;
    });

    // media query (mobile)
    const mq = window.matchMedia( "(min-width: 460px)" );
    if(! mq.matches){ 
        // swipe event listener
        canvas.addEventListener('touchmove', evt => {
            evt.preventDefault();
            let position = evt.touches[0].pageY;
            playerY = position;
        });

        //resize
        PADDLE_HEIGHT /= 2.5;
        PADDLE_WIDTH /= 2.5;
        ballSize /= 2.5;
        speedX /= 3.5;
        START_SPEED_Y /= 3.5;
        MARGIN /= 2.5;
        enemySpeed /= 1.5;
    }

    // start game
    startButton = document.getElementById('startButton');
    startButton.onclick = () => {
        start();
    }
};

function start(){
    let fps = 60;
    startButton.style.visibility = 'hidden';
    authorLink.style.visibility = 'hidden';
    gameID = setInterval( () => {
        draw();
        move();
    }, 1000/fps);
}

function mousePosition(evt){
    let rect = canvas.getBoundingClientRect();
    let root = document.documentElement;
    let x = evt.clientX - rect.left - root.scrollLeft;
    let y = evt.clientY - rect.top - root.scrollTop;

    return {x, y}
}

function move(){
    moveEnemy();

    // move ball
    ballX += speedX;
    ballY += speedY;

    if(restarting){
        if(ballX <= 0 || ballX >= canvas.width){
            restarting = false;
            ballReset();
        }
        return;
    }

    let edge = 0.4 * PADDLE_HEIGHT;

    // ball vertical bounce 
    if(ballY >= canvas.height - MARGIN*2 || ballY <= MARGIN) speedY = -speedY;
    
    // player attack
    if(ballX + ballSize >= canvas.width - PADDLE_WIDTH + MARGIN){
        if( ballY + ballSize > enemyY && ballY < ballSize + enemyY + PADDLE_HEIGHT){
            speedX = -speedX
            // fire shot
            let deltaY = ballY - (enemyY + PADDLE_HEIGHT/2);

            if(Math.abs(deltaY) > edge) fireShot = true;
            else fireShot = false;

            speedY = deltaY * 0.35;
        }else{
            playerScore++; // player scored 
            playerLabel.innerHTML = playerScore;
            restarting = true;
        }
    } 

    // enemy attack
    if(ballX < PADDLE_WIDTH - MARGIN){
        if( ballY + ballSize > playerY && ballY < ballSize + playerY + PADDLE_HEIGHT){
            speedX = -speedX
            // fire shot
            let deltaY = ballY - (playerY + PADDLE_HEIGHT/2);

            if(Math.abs(deltaY) > edge) fireShot = true;
            else fireShot = false;

            speedY = deltaY * 0.35;
        }else{
            enemyScore++; // enemy scored
            enemyLabel.innerHTML = enemyScore;
            restarting = true;
        }
    }

}

function moveEnemy(){
    let center = enemyY + (PADDLE_HEIGHT/2);
    let edge = 0.35 * PADDLE_HEIGHT;
    if(center < ballY -  edge)
        enemyY += enemySpeed
    else if(center > ballY + edge)
        enemyY -= enemySpeed
}

function draw(){
    // draw background    
    canvasContext.drawImage(spaceImg, 0, 0, canvas.width, canvas.height);

    // draw net
    drawNet();

    // draw player
    canvasContext.drawImage(playerImg, 0, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    // draw enemy
    canvasContext.drawImage(enemyImg, canvas.width-PADDLE_WIDTH, enemyY, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    // draw ball
    if(fireShot){
        canvasContext.drawImage(fireballImg, ballX, ballY, ballSize + MARGIN*2, ballSize + MARGIN*2);
    }else {
        canvasContext.drawImage(ballImg, ballX, ballY, ballSize, ballSize);
    }
}


function drawRect(x, y, width, height, color){
    canvasContext.fillStyle = color;
    canvasContext.fillRect(x, y, width, height);
}

function drawNet(){
    for(let i=10; i < canvas.height; i+=40){
        drawRect((canvas.width/2)-1, i, 2, 20, 'white')
    }
}

function ballReset(){
    // reset
    speedX = -speedX;
    speedY = -START_SPEED_Y + Math.floor(Math.random() * MARGIN);
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    fireShot = false;
    // stop game
    clearInterval(gameID);

    if(playerScore == WINNING_SCORE || enemyScore == WINNING_SCORE){
        
        // show win screen
        let src = 'images/lost_screen.png';
        if(playerScore == WINNING_SCORE) src = 'images/win_screen.png';
        startButton.src = src;
        startButton.onload = () => {
            startButton.style.visibility = 'visible';
            authorLink.style.visibility = 'visible';
        }

        // reset scores
        playerScore = 0;
        enemyScore = 0;
        enemyLabel.innerHTML = enemyScore;
        playerLabel.innerHTML = playerScore;
    } else {
        setTimeout(start, 500);    
    }

}