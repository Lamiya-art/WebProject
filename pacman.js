
//images
let blueghostImage;
let orangeghostImage;
let pinkghostImage;
let redghostImage;
let pacmanupImage;
let pacmandownImage;
let pacmanleftImage;
//board
let board;
const rowCount = 21;
const columnCount = 19;
const tileSize = 32;
const boardWidth = columnCount*tileSize;
const boardHeight = rowCount*tileSize;
let context;

let blueGhostImage;
let orangeGhostImage;
let pinkGhostImage;
let redGhostImage;
let scaredGhostImage; // Added for power-up mode
let pacmanUpImage;
let pacmanDownImage;
let pacmanLeftImage;
let pacmanRightImage;
let wallImage;

//X = wall, O = skip, P = pac man, ' ' = food, '*' = power pellet
//Ghosts: b = blue, o = orange, p = pink, r = red
const tileMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "X*      X        *X",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXrXX X XXXX",
    "O       bpo       O",
    "XXXX X XXXXX X XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "X*               *X",
    "XXXXXXXXXXXXXXXXXXX" 
];

const walls = new Set();
const foods = new Set();
const powerPellets = new Set(); // Added to track power pellets
const ghosts = new Set();
let pacman;

const directions = ['U', 'D', 'L', 'R']; //up down left right
let score = 0;
let lives = 3;
let gameOver = false;

// --- POWER PELLET STATE VARIABLES ---
let powerMode = false;
let powerModeTimer = null;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    loadImages();
    loadMap();

    for (let ghost of ghosts.values()) {
        const newDirection = directions[Math.floor(Math.random()*4)];
        ghost.updateDirection(newDirection);
    }
    update();
    document.addEventListener("keyup", movePacman);
}

function loadImages() {
    wallImage = new Image();
    wallImage.src = "./wall.png";

    blueGhostImage = new Image();
    blueGhostImage.src = "./blueGhost.png";
    orangeGhostImage = new Image();
    orangeGhostImage.src = "./orangeGhost.png";
    pinkGhostImage = new Image();
    pinkGhostImage.src = "./pinkGhost.png";
    redGhostImage = new Image();
    redGhostImage.src = "./redGhost.png";
    
    // Scared ghost asset when power pellet is active
    scaredGhostImage = new Image();
    scaredGhostImage.src = "./scaredGhost.png"; 

    pacmanUpImage = new Image();
    pacmanUpImage.src = "./pacmanUp.png";
    pacmanDownImage = new Image();
    pacmanDownImage.src = "./pacmanDown.png";
    pacmanLeftImage = new Image();
    pacmanLeftImage.src = "./pacmanLeft.png";
    pacmanRightImage = new Image();
    pacmanRightImage.src = "./pacmanRight.png";
}

function loadMap() {
    walls.clear();
    foods.clear();
    ghosts.clear();
    powerPellets.clear();

    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < columnCount; c++) {
            const row = tileMap[r];
            const tileMapChar = row[c];

            const x = c*tileSize;
            const y = r*tileSize;

            if (tileMapChar == 'X') { //block wall
                const wall = new Block(wallImage, x, y, tileSize, tileSize);
                walls.add(wall);  
            }
            else if (tileMapChar == 'b') { //blue ghost
                const ghost = new Block(blueGhostImage, x, y, tileSize, tileSize);
                ghost.normalImage = blueGhostImage;
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'o') { //orange ghost
                const ghost = new Block(orangeGhostImage, x, y, tileSize, tileSize);
                ghost.normalImage = orangeGhostImage;
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'p') { //pink ghost
                const ghost = new Block(pinkGhostImage, x, y, tileSize, tileSize);
                ghost.normalImage = pinkGhostImage;
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'r') { //red ghost
                const ghost = new Block(redGhostImage, x, y, tileSize, tileSize);
                ghost.normalImage = redGhostImage;
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'P') { //pacman
                pacman = new Block(pacmanRightImage, x, y, tileSize, tileSize);
            }
            else if (tileMapChar == ' ') { //empty is food
                const food = new Block(null, x + 14, y + 14, 4, 4);
                foods.add(food);
            }
            else if (tileMapChar == '*') { // Power Pellet
                const pellet = new Block(null, x + 11, y + 11, 10, 10);
                powerPellets.add(pellet);
            }
        }
    }
}

function update() {
    if (gameOver) {
        return;
    }
    move();
    draw();
    setTimeout(update, 50); //1000/50 = 20 FPS
}

function draw() {
    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);
    
    for (let ghost of ghosts.values()) {
        context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
    }
    
    for (let wall of walls.values()) {
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
    }

    // Draw regular food
    context.fillStyle = "white";
    for (let food of foods.values()) {
        context.fillRect(food.x, food.y, food.width, food.height);
    }

    // Draw power pellets (flashing or static yellow/orange)
    context.fillStyle = "#ffb8ae";
    for (let pellet of powerPellets.values()) {
        context.beginPath();
        context.arc(pellet.x + 5, pellet.y + 5, 5, 0, 2 * Math.PI);
        context.fill();
    }

    //score
    context.fillStyle = "white";
    context.font="14px sans-serif";
    if (gameOver) {
        context.fillText("Game Over: " + String(score), tileSize/2, tileSize/2);
    }
    else {
        context.fillText("x" + String(lives) + " " + String(score) + (powerMode ? " 🔥 POWER!" : ""), tileSize/2, tileSize/2);
    }
}

function move() {
    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;

    // --- FEATURE 1: PACMAN SCREEN WRAP-AROUND ---
    if (pacman.x + pacman.width < 0) {
        pacman.x = boardWidth;
    } 
    else if (pacman.x > boardWidth) {
        pacman.x = -pacman.width;
    }

    //check wall collisions
    for (let wall of walls.values()) {
        if (collision(pacman, wall)) {
            pacman.x -= pacman.velocityX;
            pacman.y -= pacman.velocityY;
            break;
        }
    }

    //check ghosts collision
    for (let ghost of ghosts.values()) {
        if (collision(ghost, pacman)) {
            if (powerMode) {
                // Pacman eats ghost
                score += 200;
                ghost.reset();
                ghost.image = ghost.normalImage;
                const newDirection = directions[Math.floor(Math.random()*4)];
                ghost.updateDirection(newDirection);
            } else {
                // Ghost eats Pacman
                lives -= 1;
                if (lives == 0) {
                    gameOver = true;
                    return;
                }
                resetPositions();
            }
        }

        if (ghost.y == tileSize*9 && ghost.direction != 'U' && ghost.direction != 'D') {
            ghost.updateDirection('U');
        }

        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;

        // --- FEATURE 3: SMARTER GHOST INTERSECTION MOVEMENT ---
        // Only change paths precisely when aligned to the grid tile
        if (ghost.x % tileSize === 0 && ghost.y % tileSize === 0) {
            let availableDirections = [];
            
            // Check all 4 openings surrounding the ghost's tile position
            for (let d of directions) {
                // Reverse directions generally shouldn't be immediately chosen to prevent jitter
                if ((d === 'U' && ghost.direction === 'D') || 
                    (d === 'D' && ghost.direction === 'U') || 
                    (d === 'L' && ghost.direction === 'R') || 
                    (d === 'R' && ghost.direction === 'L')) {
                    continue; 
                }

                let nextX = ghost.x;
                let nextY = ghost.y;

                if (d === 'U') nextY -= tileSize;
                if (d === 'D') nextY += tileSize;
                if (d === 'L') nextX -= tileSize;
                if (d === 'R') nextX += tileSize;

                // Create a temporary block mock to test a boundary map collision
                let tempBlock = { x: nextX, y: nextY, width: ghost.width, height: ghost.height };
                let hitWall = false;

                for (let wall of walls.values()) {
                    if (collision(tempBlock, wall)) {
                        hitWall = true;
                        break;
                    }
                }

                if (!hitWall) {
                    availableDirections.push(d);
                }
            }

            // If there's an actual choice or lane change opportunity available
            if (availableDirections.length > 0) {
                // Arcade Pac-Man ghosts like following paths, but occasionally vary decisions
                if (Math.random() < 0.25 || !availableDirections.includes(ghost.direction)) {
                    const chosenDirection = availableDirections[Math.floor(Math.random() * availableDirections.length)];
                    ghost.updateDirection(chosenDirection);
                }
            }
        }

        // Wall safety block: handled if something pushes them off track or into a blind alley
        for (let wall of walls.values()) {
            if (collision(ghost, wall) || ghost.x <= 0 || ghost.x + ghost.width >= boardWidth) {
                ghost.x -= ghost.velocityX;
                ghost.y -= ghost.velocityY;
                const newDirection = directions[Math.floor(Math.random()*4)];
                ghost.updateDirection(newDirection);
            }
        }
    }

    //check food collision
    let foodEaten = null;
    for (let food of foods.values()) {
        if (collision(pacman, food)) {
            foodEaten = food;
            score += 10;
            break;
        }
    }
    if (foodEaten) foods.delete(foodEaten);

    // --- FEATURE 2: POWER PELLET COLLISION ENGINE ---
    let pelletEaten = null;
    for (let pellet of powerPellets.values()) {
        if (collision(pacman, pellet)) {
            pelletEaten = pellet;
            score += 50;
            activatePowerMode();
            break;
        }
    }
    if (pelletEaten) powerPellets.delete(pelletEaten);

    //next level
    if (foods.size == 0 && powerPellets.size == 0) {
        loadMap();
        resetPositions();
    }
}

function activatePowerMode() {
    powerMode = true;
    
    // Convert ghost graphics to display running mode behavior
    for (let ghost of ghosts.values()) {
        ghost.image = scaredGhostImage;
    }

    // Reset current active timer intervals if stacking power ups
    if (powerModeTimer) clearTimeout(powerModeTimer);

    // Set Frightened state timer duration limit to 7 seconds
    powerModeTimer = setTimeout(() => {
        powerMode = false;
        for (let ghost of ghosts.values()) {
            ghost.image = ghost.normalImage;
        }
    }, 7000);
}

function movePacman(e) {
    if (gameOver) {
        loadMap();
        resetPositions();
        lives = 3;
        score = 0;
        gameOver = false;
        powerMode = false;
        if (powerModeTimer) clearTimeout(powerModeTimer);
        update(); //restart game loop
        return;
    }

    if (e.code == "ArrowUp" || e.code == "KeyW") {
        pacman.updateDirection('U');
    }
    else if (e.code == "ArrowDown" || e.code == "KeyS") {
        pacman.updateDirection('D');
    }
    else if (e.code == "ArrowLeft" || e.code == "KeyA") {
        pacman.updateDirection('L');
    }
    else if (e.code == "ArrowRight" || e.code == "KeyD") {
        pacman.updateDirection('R');
    }

    //update pacman images
    if (pacman.direction == 'U') {
        pacman.image = pacmanUpImage;
    }
    else if (pacman.direction == 'D') {
        pacman.image = pacmanDownImage;
    }
    else if (pacman.direction == 'L') {
        pacman.image = pacmanLeftImage;
    }
    else if (pacman.direction == 'R') {
        pacman.image = pacmanRightImage;
    }
}

function collision(a, b) {
    return a.x < b.x + b.width &&   
           a.x + a.width > b.x &&   
           a.y < b.y + b.height &&  
           a.y + a.height > b.y;    
}

function resetPositions() {
    pacman.reset();
    pacman.velocityX = 0;
    pacman.velocityY = 0;
    for (let ghost of ghosts.values()) {
        ghost.reset();
        ghost.image = powerMode ? scaredGhostImage : ghost.normalImage;
        const newDirection = directions[Math.floor(Math.random()*4)];
        ghost.updateDirection(newDirection);
    }
}

class Block {
    constructor(image, x, y, width, height) {
        this.image = image;
        this.normalImage = image; // Cache normal identity
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.startX = x;
        this.startY = y;

        this.direction = 'R';
        this.velocityX = 0;
        this.velocityY = 0;
    }

    updateDirection(direction) {
        const prevDirection = this.direction;
        this.direction = direction;
        this.updateVelocity();
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        for (let wall of walls.values()) {
            if (collision(this, wall)) {
                this.x -= this.velocityX;
                this.y -= this.velocityY;
                this.direction = prevDirection;
                this.updateVelocity();
                return;
            }
        }
    }

    updateVelocity() {
        if (this.direction == 'U') {
            this.velocityX = 0;
            this.velocityY = -tileSize/4;
        }
        else if (this.direction == 'D') {
            this.velocityX = 0;
            this.velocityY = tileSize/4;
        }
        else if (this.direction == 'L') {
            this.velocityX = -tileSize/4;
            this.velocityY = 0;
        }
        else if (this.direction == 'R') {
            this.velocityX = tileSize/4;
            this.velocityY = 0;
        }
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
    }
};