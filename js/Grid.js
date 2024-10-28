export const GRID_SIZE = 4;

export default class Grid {
    #cells;

    constructor(gridElement) {
        this.#cells = createCellElements(gridElement).map((cellElement, index) => {
            return new Cell(cellElement, index % GRID_SIZE, Math.floor(index / GRID_SIZE));
        });
    }

    get cells() {
        return this.#cells;
    }

    get cellsByRows() {
        return this.#cells.reduce((cellGrid, cell) => {
            cellGrid[cell.y] = cellGrid[cell.y] || [];
            cellGrid[cell.y][cell.x] = cell;
            return cellGrid;
        }, []);
    }

    get cellsByColumns() {
        return this.#cells.reduce((cellGrid, cell) => {
            cellGrid[cell.x] = cellGrid[cell.x] || [];
            cellGrid[cell.x][cell.y] = cell;
            return cellGrid;
        }, []);
    }

    get #emptyCell() {
        return this.#cells.filter((cell) => cell.tile == null);
    }

    randomEmptyCell() {
        const randomIndex = Math.floor(Math.random() * this.#emptyCell.length);
        return this.#emptyCell[randomIndex];
    }

    clearAllCells() {
        this.#cells.forEach(cell => {
            if (cell.tile) {
                cell.tile.remove();
                cell.tile = null;
            }
            if (cell.mergeTile) {
                cell.mergeTile.remove();
                cell.mergeTile = null;
            }
        });
    }
}

class Cell {
    #cellElement;
    #x;
    #y;
    #tile;
    #mergeTile;

    constructor(cellElement, x, y) {
        this.#cellElement = cellElement;
        this.#x = x;
        this.#y = y;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get tile() {
        return this.#tile;
    }

    set tile(value) {
        this.#tile = value;
        if (value == null) {
            return;
        }
        this.#tile.x = this.#x;
        this.#tile.y = this.#y;
    }

    get mergeTile() {
        return this.#mergeTile;
    }

    set mergeTile(value) {
        this.#mergeTile = value;
        if (value == null) {
            return;
        }
        this.#mergeTile.x = this.#x;
        this.#mergeTile.y = this.#y;
    }

    canAccept(tile) {
        return (
            this.tile == null ||
            (this.mergeTile == null && this.tile.value === tile.value)
        );
    }

    mergeTiles() {
        if (this.tile == null || this.mergeTile == null) {
            return;
        }
        this.tile.value = this.tile.value + this.mergeTile.value;
        this.mergeTile.remove();
        this.mergeTile = null;
    }
}

function createCellElements(gridElement) {
    const cells = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cells.push(cell);
        gridElement.appendChild(cell);
    }
    return cells;
}