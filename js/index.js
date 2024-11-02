import Grid, {GRID_SIZE} from "./Grid.js";
import Tile from "./Tile.js";

const gameBoard = document.querySelector("#game-board");
const scoreEl = document.querySelector("#score__current-score--value");
const highestScoreEl = document.querySelector("#score__highest-score--value");
const newGameEls = document.querySelectorAll("#score__new-game--wrapper > *");
const newGameModalEl = document.querySelector("#new-game__modal");
const newGameModalAcceptEl = newGameModalEl.querySelector("button.accept");
const newGameModalCancelEl = newGameModalEl.querySelector("button.cancel");
const youLoseModalEl = document.querySelector("#you-lose__modal");
const youLoseModalAcceptEl = youLoseModalEl.querySelector("button.accept");
const youLoseModalCancelEl = youLoseModalEl.querySelector("button.cancel");

let actionUndoWrapperElement = document.querySelector("#action__undo-wrapper");
let actionSwapWrapperElement = document.querySelector("#action__swap-wrapper");
let actionDeleteWrapperElement = document.querySelector("#action__delete-wrapper");
let actionUndoIconWrapperElement = actionUndoWrapperElement.querySelector(".action__help-icon-wrapper");
let actionSwapIconWrapperElement = actionSwapWrapperElement.querySelector(".action__help-icon-wrapper");
let actionDeleteIconWrapperElement = actionDeleteWrapperElement.querySelector(".action__help-icon-wrapper");

let highestScore = 0;
let currentScore = 0;
let isLose = false;

let xStart;
let yStart;
let xEnd;
let yEnd;

const grid = new Grid(gameBoard);

function initial () {
    setupHighestScore();
    loadProcess();
    setupHelps();
}


newGameEls.forEach(function (newGameEl) {
    newGameEl.onclick = async function () {
        await triggerNewGameModal();
    }
});

newGameModalAcceptEl.onclick = function () {
    newGame();
    closeNewGameModal();
};

newGameModalCancelEl.onclick = function () {
    closeNewGameModal();
};

youLoseModalAcceptEl.onclick = function () {
    newGame();
    closeYouLoseModal();
};

youLoseModalCancelEl.onclick = function () {
    closeYouLoseModal();
};

function setupHelps() {
    setupUndo();
    setupSwap();
    setupDelete();
}

function setupUndo() {
    actionUndoIconWrapperElement.onclick = function () {
        let item = localStorage.getItem("game-board");
        let scoresItem = localStorage.getItem("scores");

        let storedGameBoard = item ? JSON.parse(item) : [];
        let scores = scoresItem ? JSON.parse(scoresItem) : [];

        if (storedGameBoard.length < 2 || scores.length < 2) {
            return;
        }

        storedGameBoard.shift();
        scores.shift();

        /**
         * @type {number[]}
         */

        let prevGameBoard = storedGameBoard[0];
        let prevScore = scores[0];

        setCurrentScore(prevScore);

        loadGrid(prevGameBoard);

        localStorage.setItem("game-board", JSON.stringify(storedGameBoard));
        localStorage.setItem("scores", JSON.stringify(scores));
    }
}

/**
 *
 * @param {number[]} tiles
 */
function loadGrid(tiles) {
    grid.clearAllCells();
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        if (tiles[i] !== 0) {
            grid.cells[i].tile = new Tile(gameBoard, tiles[i]);
        }
        else {
            grid.cells[i].tile = null;
        }
    }
}

function setupSwap() {
    console.log(actionSwapIconWrapperElement);
}

function setupDelete() {
    console.log(actionDeleteIconWrapperElement);
}


/**
 *
 * @param {number} s
 */
function setCurrentScore(s) {
    currentScore = s;
    setCurrentScoreAction();
}

function setCurrentScoreAction() {
    scoreEl.innerHTML = currentScore.toString();
    if (currentScore > highestScore) {
        setHighestScore(currentScore);
    }
}

function setHighestScore(s) {
    highestScore = s;
    setHighestScoreAction();
}

function setHighestScoreAction() {
    localStorage.setItem("highest-score", currentScore.toString());
    highestScoreEl.innerHTML = currentScore.toString();
}

/**
 * Kích hoạt modal
 * @param {HTMLDivElement} element
 */
async function triggerModal(element) {
    requestAnimationFrame(function () {
        element.classList.add("show");
        requestAnimationFrame(function () {
            element.classList.add("showing");
        });
    });
}

/**
 * Đóng modal
 * @param {HTMLDivElement} element
 */
function closeModal(element) {
    if (element.classList.contains("showing")) {
        element.classList.remove("showing");
        element.addEventListener("transitionend", function () {
            if (element.classList.contains("show")) {
                element.classList.remove("show");
            }
        }, {once: true});
    }
}

async function triggerNewGameModal() {
    await triggerModal(newGameModalEl);
    unsetInput();
}

function closeNewGameModal() {
    closeModal(newGameModalEl);
    setupInput();
}

async function triggerYouLoseModal() {
    isLose = true;
    unsetInput();
    await triggerModal(youLoseModalEl);
}

function closeYouLoseModal() {
    closeModal(youLoseModalEl);
}

/**
 * Khởi tạo game mới
 */
function newGame() {
    isLose = false;
    setCurrentScore(0);

    clearProcess();

    grid.clearAllCells();
    grid.randomEmptyCell().tile = new Tile(gameBoard);
    grid.randomEmptyCell().tile = new Tile(gameBoard);

    setupInput();
    saveProcess();
}

/**
 * Xoá các sự kiện chờ nhập - vuốt
 */
function unsetInput() {
    window.removeEventListener("keydown", handleInput);
    gameBoard.removeEventListener("touchstart", touchStart);
    gameBoard.removeEventListener("touchmove", touchMove);
    gameBoard.removeEventListener("touchend", touchEnd);
}

/**
 * Tạo các sự kiện chờ nhập - vuốt
 */
function setupInput() {
    if (!isLose) {
        window.addEventListener("keydown", handleInput, {once: true});
        gameBoard.addEventListener("touchstart", touchStart, {once: true});
        gameBoard.addEventListener("touchmove", touchMove, {once: true});
        gameBoard.addEventListener("touchend", touchEnd, {once: true});
    }
}


/**
 * Lưu quá trình chơi sau mỗi nước đi vào localStorage
 */
function saveProcess() {
    let item = localStorage.getItem("game-board");
    let scoresItem = localStorage.getItem("scores");

    let moves = item ? JSON.parse(item) : [];
    let scores = scoresItem ? JSON.parse(scoresItem) : [];

    let scoreMap = grid.cells.map(cell => {
        return cell.tile ? cell.tile.value : 0;
    });

    moves.unshift(scoreMap);
    scores.unshift(currentScore);

    while (moves.length > 3) {
        moves.pop();
    }

    while (scores.length > 3) {
        scores.pop();
    }

    localStorage.setItem("game-board", JSON.stringify(moves));
    localStorage.setItem("scores", JSON.stringify(scores));
}

/**
 * Xoá quá trình chơi khỏi localStorage
 */
function clearProcess() {
    localStorage.removeItem("game-board");
    localStorage.removeItem("scores");
}

/**
 * Tải quá trình chơi từ localStorage, hoặc bắt đầu game mới nếu như không tìm thấy quá trình chơi
 */
function loadProcess() {
    let item = localStorage.getItem("game-board");
    if (item !== null) {
        let scoreItem = localStorage.getItem("scores");
        let scores = scoreItem ? JSON.parse(scoreItem) : [0];
        setCurrentScore(scores[0]);

        let moves = JSON.parse(item);
        let tiles = moves[0];

        loadGrid(tiles);

        setupInput();
    }
    else {
        newGame();
    }
}

/**
 * Lấy điểm cao nhất từ localStorage và hiển thị điểm cao nhất lên giao diện
 */
function setupHighestScore() {
    if (isNaN(parseInt(localStorage.getItem("highest-score")))) {
        localStorage.setItem("highest-score", "0");
    }

    highestScore = parseInt(localStorage.getItem("highest-score"));
    highestScoreEl.innerHTML = highestScore.toString();
}


/**
 * Tạo sự kiện nhập từ bàn phím
 * @param {KeyboardEvent} e
 */
async function handleInput(e) {
    if (!isLose) {
        switch (e.key) {
            case "ArrowUp":
                e.preventDefault();
                if (!canMoveUp()) {
                    setupInput();
                    return;
                }
                await moveUp();
                break;
            case "ArrowDown":
                e.preventDefault();
                if (!canMoveDown()) {
                    setupInput();
                    return;
                }
                await moveDown();
                break;
            case "ArrowLeft":
                e.preventDefault();
                if (!canMoveLeft()) {
                    setupInput();
                    return;
                }
                await moveLeft();
                break;
            case "ArrowRight":
                e.preventDefault();
                if (!canMoveRight()) {
                    setupInput();
                    return;
                }
                await moveRight();
                break;
            default:
                setupInput();
                return;
        }

        performMove();
    }
    else {
        console.log(e.key);
    }
}

/**
 * Tạo sự kiện vuốt
 * @param {String} direction
 */
async function handleSwipe(direction) {
    if (!isLose) {
        switch (direction) {
            case "UP":
                if (!canMoveUp()) {
                    setupInput();
                    return;
                }
                await moveUp();
                break;
            case "DOWN":
                if (!canMoveDown()) {
                    setupInput();
                    return;
                }
                await moveDown();
                break;
            case "LEFT":
                if (!canMoveLeft()) {
                    setupInput();
                    return;
                }
                await moveLeft();
                break;
            case "RIGHT":
                if (!canMoveRight()) {
                    setupInput();
                    return;
                }
                await moveRight();
                break;
            default:
                setupInput();
                return;
        }

        performMove();
    }
    else {
        console.log(direction);
    }
}

function touchStart(e) {
    xStart = e.touches[0].clientX;
    yStart = e.touches[0].clientY;
}

/**
 * Huỷ bỏ thao tác di chuyển màn hình khi di chuyển bảng trò chơi
 * @param {Event} e
 */
function touchMove(e) {
    e.preventDefault();
}

async function touchEnd(e) {
    xEnd = e.changedTouches[0].clientX;
    yEnd = e.changedTouches[0].clientY;

    let xDiff = xEnd - xStart;
    let yDiff = yEnd - yStart;

    let direction;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            direction = "RIGHT";
        } else {
            direction = "LEFT";
        }
    } else {
        if (yDiff > 0) {
            direction = "DOWN";
        } else {
            direction = "UP";
        }
    }

    xStart = null;
    yStart = null;

    await handleSwipe(direction);
}

function moveUp() {
    return slideTiles(grid.cellsByColumns);
}

function moveDown() {
    return slideTiles(grid.cellsByColumns.map(function (column) {
        return [...column].reverse();
    }));
}

function moveLeft() {
    return slideTiles(grid.cellsByRows);
}

function moveRight() {
    return slideTiles(grid.cellsByRows.map(function (row) {
        return [...row].reverse();
    }));
}

/**
 * Thực hiện ghép các ô, tạo ô mới, kiểm tra xem người chơi còn có thể chơi tiếp không, cập nhật điểm và lưu quá trình
 */
function performMove() {
    let scores = grid.cells.map(function (cell) {
        return cell.mergeTiles();
    }).filter(function (score) {
        return score !== 0;
    });

    let newScore = scores.reduce(function (previousValue, currentValue) {
        return previousValue + currentValue;
    }, currentScore);

    setCurrentScore(newScore);

    const newTile = new Tile(gameBoard);
    grid.randomEmptyCell().tile = newTile;

    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
        newTile.waitForTransition(true).then(async function () {
            await triggerYouLoseModal();
            clearProcess();
        });
        return;
    }

    saveProcess();
    setupInput();
}


/**
 * Di chuyển các hàng/cột
 * @param {Cell[][]} cells
 */
function slideTiles(cells) {
    return Promise.all(
        cells.flatMap(function (group) {
            const promises = [];
            for (let i = 1; i < group.length; i++) {
                const cell = group[i];
                if (cell.tile == null) {
                    continue;
                }
                let lastValidCell = null;
                for (let j = i - 1; j >= 0; j--) {
                    const moveToCell = group[j];
                    if (!moveToCell.canAccept(cell.tile)) {
                        break;
                    }
                    lastValidCell = moveToCell;
                }
                if (lastValidCell != null) {
                    promises.push(cell.tile.waitForTransition());
                    if (lastValidCell.tile != null) {
                        lastValidCell.mergeTile = cell.tile;
                    } else {
                        lastValidCell.tile = cell.tile;
                    }
                    cell.tile = null;
                }
            }
            return promises;
        })
    );
}

function canMoveUp() {
    return canMove(grid.cellsByColumns);
}

function canMoveDown() {
    return canMove(grid.cellsByColumns.map(function (column) {
        return [...column].reverse();
    }));
}

function canMoveLeft() {
    return canMove(grid.cellsByRows);
}

function canMoveRight() {
    return canMove(grid.cellsByRows.map(function (row) {
        return [...row].reverse();
    }));
}

/**
 * Kiểm tra xem người chơi có thể di chuyển bảng theo hướng nhất định hay không, bằng cách kiểm tra khả năng di chuyển các ô của mảng 2 chiều được truyền vào
 * @param {Cell[][]} cells
 * @return boolean
 */
function canMove(cells) {
    return cells.some(function (group) {
        return group.some(function (cell, index) {
            if (index === 0) {
                return false;
            }
            if (cell.tile == null) {
                return false;
            }
            const moveToCell = group[index - 1];
            return moveToCell.canAccept(cell.tile);
        });
    });
}

initial();