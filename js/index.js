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

let highestScore = 0;
let isLose = false;

const grid = new Grid(gameBoard);

setupHighestScore();
loadProcess();

newGameEls.forEach(newGameEl => {
    newGameEl.onclick = function () {
        triggerNewGameModal();
    }
});

newGameModalAcceptEl.onclick = () => {
    newGame();
    closeNewGameModal();
};

newGameModalCancelEl.onclick = () => {
    closeNewGameModal();
};

youLoseModalAcceptEl.onclick = function () {
    newGame();
    closeYouLoseModal();
};

youLoseModalCancelEl.onclick = function () {
    closeYouLoseModal();
};

function triggerModal(element) {
    element.classList.add("show");
    setTimeout(() => {
        element.classList.add("showing");
    });
}

function closeModal(element) {
    if (element.classList.contains("showing")) {
        element.classList.remove("showing");
        element.addEventListener("transitionend",() => {
            if (element.classList.contains("show")) {
                element.classList.remove("show");
            }
        }, {once: true});
    }
}

function triggerNewGameModal() {
    triggerModal(newGameModalEl);
    unsetInput();
}

function closeNewGameModal() {
    closeModal(newGameModalEl);
    setupInput();
}

function triggerYouLoseModal() {
    isLose = true;
    triggerModal(youLoseModalEl);
}

function closeYouLoseModal() {
    closeModal(youLoseModalEl);
}

function newGame() {
    isLose = false;

    grid.clearAllCells();
    grid.randomEmptyCell().tile = new Tile(gameBoard);
    grid.randomEmptyCell().tile = new Tile(gameBoard);

    setupInput();
    updateScore();
    saveProcess();
}

function unsetInput() {
    window.removeEventListener("keydown", handleInput);
}

function setupInput() {
    if (!isLose) {
        window.addEventListener("keydown", handleInput, {once: true});
    }
}

function setupHighestScore() {
    if (isNaN(parseInt(localStorage.getItem("highest-score")))) {
        localStorage.setItem("highest-score", "0");
    }

    highestScore = parseInt(localStorage.getItem("highest-score"));
    highestScoreEl.innerHTML = `${highestScore}`;
}

function updateScore() {
    let score = grid.cells.filter((cell) => {
        return cell.tile !== null && cell.tile !== undefined;
    }).map(cell => {
        return cell.tile.value;
    }).reduce((a, b) => a + b, 0);
    scoreEl.innerHTML = `${score}`;

    if (score > highestScore) {
        highestScore = score;
        localStorage.setItem("highest-score", score);
        highestScoreEl.innerHTML = `${score}`;
    }
}

function saveProcess() {
    let scoreMap = grid.cells.map(cell => cell.tile ? cell.tile.value : 0);
    let s = JSON.stringify(scoreMap);
    localStorage.setItem("game-board", s);
}

function clearProcess() {
    localStorage.removeItem("game-board");
}

function loadProcess() {
    let item = localStorage.getItem("game-board");
    if (item !== null) {
        let tiles = JSON.parse(item);
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            if (tiles[i] !== 0) {
                grid.cells[i].tile = new Tile(gameBoard, tiles[i]);
            }
        }

        setupInput();
        updateScore();
    }
    else {
        newGame();
    }
}

async function handleInput(e) {
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

    grid.cells.forEach(cell => cell.mergeTiles());

    const newTile = new Tile(gameBoard);
    grid.randomEmptyCell().tile = newTile;

    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
        updateScore();
        newTile.waitForTransition(true).then(() => {
            triggerYouLoseModal();
            clearProcess();
        });
        return;
    }

    updateScore();
    saveProcess();
    setupInput();
}

function moveUp() {
    return slideTiles(grid.cellsByColumns);
}

function moveDown() {
    return slideTiles(grid.cellsByColumns.map(column => [...column].reverse()));
}

function moveLeft() {
    return slideTiles(grid.cellsByRows);
}

function moveRight() {
    return slideTiles(grid.cellsByRows.map(row => [...row].reverse()));
}

function slideTiles(cells) {
    return Promise.all(
        cells.flatMap(group => {
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
                    }
                    else {
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
    return canMove(grid.cellsByColumns.map((column) => [...column].reverse()));
}

function canMoveLeft() {
    return canMove(grid.cellsByRows);
}

function canMoveRight() {
    return canMove(grid.cellsByRows.map(row => [...row].reverse()));
}

function canMove(cells) {
    return cells.some(group => {
        return group.some((cell, index) => {
            if (index === 0) {
                return false;
            }
            if (cell.tile == null) {
                return false;
            }
            const moveToCell = group[index - 1];
            return moveToCell.canAccept(cell.tile);
        })
    })
}