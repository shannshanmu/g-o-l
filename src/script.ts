
const canvas = document.querySelector<HTMLCanvasElement>("#game")
const ctx = canvas.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
const width = ctx.canvas.width;
const height = ctx.canvas.height;

const TILE_SIZE = 15;
const TILES_X = width / TILE_SIZE;
const TILES_Y = height / TILE_SIZE;

ctx.fillStyle = "rgb(100, 240, 150)";
ctx.strokeStyle = "rgb(90, 90, 90)";
ctx.lineWidth = 0.5; // retina
// https://stackoverflow.com/questions/7530593/html5-canvas-and-line-width/7531540#7531540

let isGamePaused = false;
let devModeDiscovered = false;
let gameSpeed = 1000;
let tempOrigin = [0,0];
let tempTupleArray = [];

// structures that have keybindings
let gliderFound = false; // g OR // 0
let blinkerFound = false; // b
let beaconFound = false; // e
let toadFound = false; // t
let pulsarFound = false; // a
let lightWeightSpaceshipFound = false; // 1
let middleWeightSpaceshipFound = false; // 2
let heavyWeightSpaceshipFound = false; // 3
let gosperGunFound = false; // 4
let pentaDecathlonFound = false; // 5

const drawBorders = () => {
    for(let i=0; i<TILES_X; i++) {
        ctx.beginPath();
        ctx.moveTo(i * TILE_SIZE - 0.5, 0);
        ctx.lineTo(i * TILE_SIZE - 0.5, height);
        ctx.stroke();
    }
    
    for(let i=0; i<TILES_Y; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * TILE_SIZE - 0.5);
        ctx.lineTo(width, i * TILE_SIZE - 0.5);
        ctx.stroke();
    }
}

const prepareBoard = () => {
    const board = [];
    for(let i=0; i<TILES_X; i++) {
        const row = [];
        for(let j=0; j<TILES_Y; j++) {
            row.push(false);
        }
        board.push(row);
    }
    return board;
}

let BOARD = prepareBoard();

const isAlive = (x: number, y: number): number => {
    if (x < 0 || x >= TILES_X || y < 0 || y >= TILES_Y) {
        return 0;
    }
    return BOARD[x][y] ? 1 : 0;
}

const neighboursCount = (x: number, y: number): number => {
    let count = 0;
    for (let i of [-1, 0, 1]) {
        for (let j of [-1, 0, 1]) {
            if (! (i === 0 && j === 0)) {
            count += isAlive(x + i, y + j)
            }
        }
    }
    return count;
}

const drawBoard = () => {
    for(let i=0; i<TILES_X; i++) {
        for(let j=0; j<TILES_X; j++) {
            if (!isAlive(i, j)) {
                continue;
            }
            ctx.fillRect(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

const computeNextGeneration = (): boolean[][] => {
    const board = prepareBoard();
    for(let i=0; i<TILES_X; i++) {
        for(let j=0; j<TILES_X; j++) {
            if (isAlive(i, j)) {
                const count = neighboursCount(i, j);
                if (count === 2 || count === 3) {
                    board[i][j] = true;
                }
            } else {
                if (neighboursCount(i, j) === 3) {
                    board[i][j] = true;
                }
            }
        }
    }
    return board;
}

const clear = () => {
    ctx.clearRect(0, 0, width, height);
}

const drawAll = () => {
    clear();
    drawBoard();
    drawBorders();
}

const nextGen = () => {
    if (isGamePaused) {
        return;
    }
    BOARD = computeNextGeneration();
    drawAll();
}

const nextGenLoop = () => {
    nextGen();
    setTimeout(nextGenLoop, gameSpeed)
}

// creates glider at top left corner 
// (all coords start from bottom right quadrant but no negatives)
/* 
BOARD[1][0] = true;
BOARD[2][1] = true;
BOARD[0][2] = true;
BOARD[1][2] = true;
BOARD[2][2] = true; 
*/

const genRandom = (min: number, max: number) => {
    return Math.ceil((Math.random()*10000 + min) % max);
}

const renderPoints = (points: number[][], ranX: number, ranY: number) => {
    for (let point of points) {
        BOARD[ranX+point[0]][ranY+point[1]] = true;
    }
}

// spawn functions

const glider = () => {
    let points = [[0,0],[1,1],[1,2],[2,0],[2,1]];
    renderPoints(points, genRandom(3,TILES_X-3), genRandom(3,TILES_Y-3))
}

const blinker = () => {
    let points = [[0,0],[1,0],[2,0]];
    renderPoints(points, genRandom(3,TILES_X-3), genRandom(3,TILES_Y-3))
}

const beacon = () => {
    let points = [[0,0],[1,0],[0,1],[1,1],[2,-2],[3,-2],[2,-1],[3,-1]];
    renderPoints(points, genRandom(5,TILES_X-5), genRandom(5,TILES_Y-5))
}

const toad = () => {
    let points = [[0,0],[0,1],[1,2],[2,-1],[3,0],[3,1]];
    renderPoints(points, genRandom(4,TILES_X-4), genRandom(3,TILES_Y-3))
}

const pulsar = () => {
    let points = [[0,0],[0,1],[0,2],[2,3],[3,3],[4,3],[5,2],[5,1],[5,0],[4,-2],[3,-2],[2,-2],[7,0],[7,1],[7,2],[8,3],[9,3],[10,3],[12,2],[12,1],[12,0],[10,-2],[9,-2],[8,-2],[0,6],[0,7],[0,8],[2,10],[3,10],[4,10],[5,8],[5,7],[5,6],[4,5],[3,5],[2,5],[7,6],[7,7],[7,8],[8,10],[9,10],[10,10],[12,8],[12,7],[12,6],[10,5],[9,5],[8,5]];
    renderPoints(points, genRandom(15,TILES_X-15), genRandom(15,TILES_Y-15))
}

const lightWeightSpaceship = () => {
    let points = [[0,0],[3,0],[4,1],[4,2],[4,3],[3,3],[2,3],[1,3],[0,2]];
    renderPoints(points, genRandom(5,TILES_X-5), genRandom(5,TILES_Y-5))
}

const middleWeightSpaceship = () => {
    let points = [[0,0],[0,2],[1,3],[2,3],[3,3],[4,3],[5,3],[5,2],[5,1],[4,0],[2,-1]];
    renderPoints(points, genRandom(6,TILES_X-6), genRandom(4,TILES_Y-4))
}

const heavyWeightSpaceship = () => {
    let points = [[0,0],[0,2],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[6,2],[6,1],[5,0],[3,-1],[2,-1]];
    renderPoints(points, genRandom(7,TILES_X-7), genRandom(5,TILES_Y-5))
}

const gosperGun = () => {
    let points = [[0,0],[0,1],[1,0],[1,1],[13,-2],[12,-2],[11,-1],[10,0],[10,1],[10,2],[11,3],[12,4],[13,4],[14,1],[15,-1],[16,0],[16,1],[17,1],[16,2],[15,3],[20,0],[20,-1],[20,-2],[21,-2],[21,-1],[21,0],[22,1],[22,-3],[24,-3],[24,-4],[24,1],[24,2],[34,-1],[34,-2],[35,-2],[35,-1]]
    renderPoints(points, genRandom(35,TILES_X-35), genRandom(7,TILES_Y-7))
}

const pentaDecathlon = () => {
    let points = [[0,0],[1,0],[2,0],[3,1],[4,2],[5,4],[5,5],[4,7],[3,8],[2,9],[1,9],[0,9],[-1,8],[-2,7],[-3,5],[-3,4],[-2,2],[-1,1]];
    renderPoints(points, genRandom(8,TILES_X-8), genRandom(10,TILES_Y-10))
}

// spawn functions ended, onto event listeners and main keypress listener for spawning

const reset = () => {
    if (!(tempOrigin[0] === 0 && tempOrigin[1] === 0)) {
        tempOrigin = [0,0];
        console.log("tempOrigin: [0,0]")
    }
    tempTupleArray = []
}

canvas.addEventListener("click", e => {
    if (e.button === 0) {
        const x = Math.floor((e.clientX - canvas.offsetLeft) / TILE_SIZE);
        const y = Math.floor((e.clientY - canvas.offsetTop) / TILE_SIZE);
        BOARD[x][y] = !BOARD[x][y];
        reset();
        drawAll();
    }
});

canvas.addEventListener("auxclick", e => {
    //console.log(e.button)
    if (e.button === 1) {
        if (!(devModeDiscovered)) {
            console.log("congrats you unlocked dev mode!!1!")
            devModeDiscovered = true;
        }
        let x = Math.floor((e.clientX - canvas.offsetLeft) / TILE_SIZE)
        let y = Math.floor((e.clientY - canvas.offsetTop) / TILE_SIZE)
        //console.log("works")
        if (tempOrigin[0] === 0 && tempOrigin[1] === 0) {
            tempOrigin = [x,y];
            console.log("tempOrigin: " + tempOrigin)
        } else {
            let relativeX = x - tempOrigin[0]
            let relativeY = y - tempOrigin[1]
            let relativeCoords = [relativeX, relativeY]
            tempTupleArray.push("[" + relativeX + "," + relativeY + "]")
            console.log("relative coords: " + relativeCoords)
            console.log("full tuple array: " + tempTupleArray)
        }
    }
});

const prepareRandom = (): boolean[][] => {
    const board = prepareBoard();
    for (let i=0; i<TILES_X; i++) {
        for (let j=0; j<TILES_X; j++) {
            board[i][j] = Math.random() < 0.3; // 30% chance for true
        }
    }
    return board;
}

// pauses game of life to let user click
document.addEventListener("keydown", e => {
    // console.log(e.key)

    if (e.key === "p") {
        // pause
        isGamePaused = !isGamePaused;
    } else if (e.key === "r") {
        // random set of tiles generated
        BOARD = prepareRandom();
    } else if (e.key == "ArrowUp") {
        // increase speed
        gameSpeed = Math.max(50, gameSpeed - 50);
        // console.log("game speed changed", gameSpeed);
    } else if (e.key == "ArrowDown") {
        // decrease speed
        gameSpeed = Math.max(gameSpeed, gameSpeed + 50);
        // console.log("game speed changed", gameSpeed);
        if (gameSpeed > 2000) {
            gameSpeed = 2000
            // console.log("game speed force changed big funny")
        }
    } else if (e.key === "c") {
        // clears board
        BOARD = prepareBoard();
    } 
    
    else if (e.key === "g") {
        glider();
        if (gliderFound == false) {
            console.log("well done! you found the glider spawn key! (g)")
            gliderFound = true;
        }
    } else if (e.key === "b") {
        blinker();
        if (blinkerFound == false) {
            console.log("well done! you found the blinker spawn key! (b)")
            blinkerFound = true;
        }
    } else if (e.key === "e") {
        beacon();
        if (beaconFound == false) {
            console.log("well done! you found the beacon spawn key! (e)")
        }
    } else if (e.key === "t") {
        toad();
        if (toadFound == false) {
            console.log("well done! you found the toad spawn key! (t)")
        }
    } else if (e.key === "a") {
        pulsar();
        if (pulsarFound == false) {
            console.log("well done! you found the pulsar spawn key! (a)")
            pulsarFound = true;
        }
    } else if (e.key === "1") {
        lightWeightSpaceship();
        if (lightWeightSpaceshipFound == false) {
            console.log("well done! you found the lightweight spaceship spawn key! (1)")
            lightWeightSpaceshipFound = true;
        }
    } else if (e.key === "2") {
        middleWeightSpaceship();
        if (middleWeightSpaceshipFound == false) {
            console.log("well done! you found the middleweight spaceship spawn key! (2)")
            middleWeightSpaceshipFound = true;
        }
    } else if (e.key === "3") {
        heavyWeightSpaceship();
        if (heavyWeightSpaceshipFound == false) {
            console.log("well done! you found the heavyweight spaceship spawn key! (3)")
            heavyWeightSpaceshipFound = true;
        }
    } else if (e.key === "4") {
        gosperGun();
        if (gosperGunFound == false) {
            console.log("well done! you found the spaceship spawn key! (4)")
            gosperGunFound = true;
        }
    } else if (e.key === "5") {
        pentaDecathlon();
        if (pentaDecathlonFound == false) {
            console.log("well done! you found the penta-decathlon spawn key! (5)")
            pentaDecathlonFound = true;
        }
    } 
    
    /*
    else if (e.key === "9") {
        // spawn random static block for testing purposes
        block();
    }
    */
});

nextGenLoop();
