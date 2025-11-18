// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10 }
];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let gameRunning = false;
let speed = 100;

// UI elements
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');
const gameOverElement = document.getElementById('gameOver');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Initialize
highScoreElement.textContent = highScore;

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
document.addEventListener('keydown', changeDirection);

function startGame() {
    if (!gameRunning) {
        resetGame();
        gameRunning = true;
        gameLoop = setInterval(update, speed);
        startBtn.textContent = 'Game Running...';
        startBtn.disabled = true;
    }
}

function restartGame() {
    gameOverElement.classList.remove('show');
    startGame();
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    food = generateFood();
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    speed = 100;
}

function update() {
    if (checkCollision()) {
        endGame();
        return;
    }

    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // Check if food eaten
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        food = generateFood();

        // Increase speed slightly
        if (score % 50 === 0 && speed > 50) {
            speed -= 5;
            clearInterval(gameLoop);
            gameLoop = setInterval(update, speed);
        }
    } else {
        snake.pop();
    }

    draw();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Snake head
            ctx.fillStyle = '#667eea';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#667eea';
        } else {
            // Snake body
            ctx.fillStyle = '#764ba2';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#764ba2';
        }

        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
        ctx.shadowBlur = 0;

        // Add eyes to head
        if (index === 0) {
            ctx.fillStyle = 'white';
            const eyeSize = 3;
            const eyeOffset = 5;

            if (dx === 1) { // Moving right
                ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset, segment.y * gridSize + 4, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + gridSize - eyeOffset, segment.y * gridSize + gridSize - 7, eyeSize, eyeSize);
            } else if (dx === -1) { // Moving left
                ctx.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 4, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + 2, segment.y * gridSize + gridSize - 7, eyeSize, eyeSize);
            } else if (dy === 1) { // Moving down
                ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + gridSize - eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + gridSize - 7, segment.y * gridSize + gridSize - eyeOffset, eyeSize, eyeSize);
            } else if (dy === -1) { // Moving up
                ctx.fillRect(segment.x * gridSize + 4, segment.y * gridSize + 2, eyeSize, eyeSize);
                ctx.fillRect(segment.x * gridSize + gridSize - 7, segment.y * gridSize + 2, eyeSize, eyeSize);
            }
        }
    });

    // Draw food
    ctx.fillStyle = '#ff6b6b';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
}

function changeDirection(event) {
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    if (!gameRunning) return;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

function checkCollision() {
    const head = snake[0];

    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

function generateFood() {
    let newFood;
    let foodOnSnake = true;

    while (foodOnSnake) {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        foodOnSnake = snake.some(segment =>
            segment.x === newFood.x && segment.y === newFood.y
        );
    }

    return newFood;
}

function endGame() {
    clearInterval(gameLoop);
    gameRunning = false;
    startBtn.textContent = 'Start Game';
    startBtn.disabled = false;

    // Update high score
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }

    finalScoreElement.textContent = score;
    gameOverElement.classList.add('show');
}

// Initial draw
draw();
