import Grid from "./Grid.js";
import Tile from "./Tile.js";

const gameBoard = document.querySelector("#game-board");
const scoreEl = document.querySelector("#score__current-score--value");
const highestScoreEl = document.querySelector("#score__highest-score--value");
const newGameEls = document.querySelectorAll("#score__new-game--wrapper > *");
const newGameModalEl = document.querySelector("#new-game__modal");
const newGameModalAcceptEl = newGameModalEl.querySelector("button.accept");
const newGameModalCancelEl = newGameModalEl.querySelector("button.cancel");

let highestScore = 0;
let isLose = false;

const grid = new Grid(gameBoard);

setupHighestScore();
newGame();

newGameEls.forEach(newGameEl => {
    newGameEl.onclick = function () {
        triggerModal();
    }
});

newGameModalAcceptEl.onclick = () => {
    newGame();
    closeModal();
};

newGameModalCancelEl.onclick = () => {
    closeModal();
};

function triggerModal() {
    newGameModalEl.classList.add("show");
    setTimeout(() => {
        newGameModalEl.classList.add("showing");
        unsetInput();
    });
}

function closeModal() {
    if (newGameModalEl.classList.contains("showing")) {
        newGameModalEl.classList.remove("showing");
        newGameModalEl.addEventListener("transitionend",() => {
            if (newGameModalEl.classList.contains("show")) {
                newGameModalEl.classList.remove("show");
            }
        }, {once: true});
    }
    setupInput();
}

function newGame() {
    isLose = false;

    grid.clearAllCells();
    grid.randomEmptyCell().tile = new Tile(gameBoard);
    grid.randomEmptyCell().tile = new Tile(gameBoard);

    setupInput();
    updateScore();
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
            alert("You lose");
            isLose = true;
        });
        return;
    }

    updateScore();
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