const ROWS = 9;
const COLS = 9;
const BLANK_IMAGE = './images/blank.png';

var board = [];
const candies = [ 'Blue', 'Orange', 'Green', 'Yellow', 'Red', 'Purple' ];
var score = 0;

var sourceTile;
var targetTile;


window.onload = function() {
    startGame();
    removeGroups();
}


function startGame() {
    for (let r = 0; r < ROWS; r++) {
        let row = [];
        for (let c = 0; c < COLS; c++) {
            // <img>
            let tile = document.createElement('img');
            tile.id = r.toString() + '-' + c.toString();
            tile.src = randomCandyImage();

            tile.addEventListener('dragstart', dragStart); // Click candy to begin drag
            tile.addEventListener('dragover', dragOver);   // Starts moving the mouse while candy is selected
            tile.addEventListener('dragenter', dragEnter); // Selected candy is about to touch another candy
            tile.addEventListener('drop', dragDrop);       // Drop candy over another candy
            tile.addEventListener('dragend', dragEnd);     // After drag process is completed, swap candies

            document.getElementById('board').append(tile);
            row.push(tile)
        }
        board.push(row)
    }
}


function dragStart() {
    sourceTile = this;
}


function dragOver(e) {
    e.preventDefault()
}


function dragEnter(e) {
    e.preventDefault()
}


function dragDrop() {
    targetTile = this;
}


function dragEnd() {
    if (sourceTile.src === BLANK_IMAGE) {
        console.log('Drag error: the source candy is blank');
        return;
    }

    if (targetTile.src === BLANK_IMAGE) {
        console.log('Drag error: the target candy is blank');
        return;
    }

    // Determine if the source and target tiles are adjacent
    let sourceCoordinates = sourceTile.id.split('-');
    let sourceRow = parseInt(sourceCoordinates[0]);
    let sourceCol = parseInt(sourceCoordinates[1]);

    let targetCoordinates = targetTile.id.split('-');
    let targetRow = parseInt(targetCoordinates[0]);
    let targetCol = parseInt(targetCoordinates[1]);

    let moveLeft = targetCol == (sourceCol - 1) && targetRow === sourceRow;
    let moveRight = targetCol == (sourceCol + 1) && targetRow === sourceRow;
    let moveUp = targetRow == (sourceRow - 1) && targetCol === sourceCol;
    let moveDown = targetRow == (sourceRow + 1) && targetCol === sourceCol;
    let isAdjacent = moveLeft || moveRight || moveUp || moveDown;
    if (!isAdjacent) {
        console.log('Drag error: the two candies are not adjacent');
        return;
    }

    // Switch adjacent tiles
    let sourceImage = sourceTile.src;
    let targetImage = targetTile.src;
    sourceTile.src = targetImage;
    targetTile.src = sourceImage;

    // Now, check to see if the switch was valid, eg it must result in
    // a 3, 4, or 5 in a row candy crush.  If not, undo the switch.
    if (!doGroupsExist()) {
        console.log('Drag error: the move does not create 3 or more in a row');
        sourceTile.src = sourceImage;
        targetTile.src = targetImage;
        return;
    }

    console.log("\nSWITCH\n");
    removeGroups();
}


function removeGroups() {
    while (true) {
        if (removeGroupsOf(5)) {
            continue;
        }
        if (removeGroupsOf(4)) {
            continue;
        }
        if (removeGroupsOf(3)) {
            continue;
        }
        return;
    }
}


function removeGroupsOf(n) {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - (n - 1); c++) {
            let group = true;
            for (let i = 0; i < (n - 1); i++) {
                // console.log(r, c, ' check ', r, c + i, 'and', r, c + (i + 1));
                if ((board[r][c + i].src != board[r][c + (i + 1)].src) || isBlankImage(r, c + i)) {
                    group = false;
                    break;
                }
            }
            if (group) {
                console.log('Removing horizontal group of: ', n);
                for (let i = 0; i < n; i++) {
                    console.log('  [' + r + '][' + (c + i).toString() + ']: ' + board[r][c + i].src);
                    board[r][c + i].src = BLANK_IMAGE;
                }
                crush();
                updateScore(n);
                return true;
            }
        }
    }

    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - (n - 1); r++) {
            let group = true;
            for (let i = 0; i < (n - 1); i++) {
                // console.log('here', r + i, c, 'and', r + (i + 1), c);
                if ((board[r + i][c].src !== board[r + (i + 1)][c].src) || isBlankImage(r + i, c)) {
                    group = false;
                    break;
                }
            }
            if (group) {
                console.log('Removing vertical group of: ', n);
                for (let i = 0; i < n; i++) {
                    console.log('  [' + (r + i).toString() + '][' + c + ']: ' + board[r + i][c].src);
                    board[r + i][c].src = BLANK_IMAGE;
                }
                crush();
                updateScore(n);
                return true;
            }
        }
    }
}


function doGroupsExist() {
    if (doGroupsExistOf(5)) {
        return true;
    }
    if (doGroupsExistOf(4)) {
        return true;
    }
    if (doGroupsExistOf(3)) {
        return true;
    }
    return false;
}


function doGroupsExistOf(n) {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - (n - 1); c++) {
            let group = true;
            for (let i = 0; i < (n - 1); i++) {
                if ((board[r][c + i].src != board[r][c + (i + 1)].src) || isBlankImage(r, c + i)) {
                    group = false;
                    break;
                }
            }
            if (group) {
                return true;
            }
        }
    }

    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - (n - 1); r++) {
            let group = true;
            for (let i = 0; i < (n - 1); i++) {
                if ((board[r + i][c].src !== board[r + (i + 1)][c].src) || isBlankImage(r + i, c)) {
                    group = false;
                    break;
                }
            }
            if (group) {
                return true;
            }
        }
    }
}


// Here is how this algorithm works:
// 1. We go column by column, and for each column we start at the
//    last row of the column, and go up the column (row--)
// 2. If the current tile has a candy image, we go on up to the
//    next tile, continuing our search for a blank tile
// 3. If the current tile is blank, we search for the first
//    non-blank tile above the current tile
// 4. If we find a non-blank tile, we move its image to the current
//    tile, set it to blank, and up the column to the next tile
// 5. If we do NOT find a non-blank tile, the current tile is set to
//    a random candy, and then remainingTilesAreAllBlank is set to
//    true and the result is each of the remaining tiles in the
//    column that are higher up get random candy images
function crush() {

    // 1. column x column, starting at the last row, going up
    for (let c = 0; c < COLS; c++) {
        let remainingTilesAreAllBlank = false;
        for (let r = ROWS - 1; r >= 0; r--) {

            // 5. set remaining tiles to random candy
            if (remainingTilesAreAllBlank) {
                board[r][c].src = randomCandyImage();
                console.log('Random(1):  [' + r + '][' + c + ']: ' + board[r][c].src)
                continue;
            }

            // 2. skip the image if it has a candy
            if (isCandyImage(r, c)) {
                continue;
            }

            // 3. current tile is blank, now search for
            // first non-blank tile
            remainingTilesAreAllBlank = true;
            for (let r2 = r - 1; r2 >= 0; r2--) {
                if (isBlankImage(r2, c)) {
                    continue;
                }

                // 4. first non-blank tile found,
                // steal its candy
                board[r][c].src = board[r2][c].src;
                board[r2][c].src = BLANK_IMAGE;
                remainingTilesAreAllBlank = false;
                break;
            }

            // 5. set remaining tiles to random candy
            if (remainingTilesAreAllBlank) {
                board[r][c].src = randomCandyImage();
                console.log('Random(2):  [' + r + '][' + c + ']: ' + board[r][c].src)
            }
        }
    }
}


function isCandyImage(r, c) {
    let tile = board[r][c];
    if (tile.src.includes('blank')) {
        return false;
    }
    return true;
}


function isBlankImage(r, c) {
    return !isCandyImage(r, c);
}


function randomCandyImage() {
    return './images/' + candies[Math.floor(Math.random() * candies.length)] + '.png';
}


function updateScore(n) {
    console.log(n);
    score = score + (10 * n);
    console.log('Score: ' + score);
    document.getElementById('score').innerText = score;
}
