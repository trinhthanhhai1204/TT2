export const GRID_SIZE = 4;

export default class Grid {
    #cells;

/**
 * @param {HTMLDivElement} gridElement
 */
    constructor(gridElement) {
        this.#cells = createCellElements(gridElement).map(function (cellElement, index) {
            return new Cell(cellElement, index % GRID_SIZE, Math.floor(index / GRID_SIZE));
        });
    }

/**
 * Lấy tất cả các ô trong bảng
 * @return {Cell[]}
 */
    get cells() {
        return this.#cells;
    }

/**
 * Nhóm các ô theo hàng và trả về mảng các hàng chứa các ô
 * @return {Cell[][]}
 */
    get cellsByRows() {
        return this.#cells.reduce(function (cellGrid, cell) {
            cellGrid[cell.y] = cellGrid[cell.y] || [];
            cellGrid[cell.y][cell.x] = cell;
            return cellGrid;
        }, []);
    }

/**
 * Nhóm các ô theo cột và trả về mảng các hàng chứa các ô
 * @return {Cell[][]}
 */
    get cellsByColumns() {
        return this.#cells.reduce(function (cellGrid, cell) {
            cellGrid[cell.x] = cellGrid[cell.x] || [];
            cellGrid[cell.x][cell.y] = cell;
            return cellGrid;
        }, []);
    }

/**
 * Lấy tất cả các ô còn trống
 * @return {Cell[]}
 */
    get #emptyCell() {
        return this.#cells.filter(function (cell) {
            return cell.tile == null;
        });
    }

/**
 * Lấy ngẫu nhiên một ô còn trống
 * @return {Cell}
 */
    randomEmptyCell() {
        const randomIndex = Math.floor(Math.random() * this.#emptyCell.length);
        return this.#emptyCell[randomIndex];
    }

/**
 * Làm trống tất cả các ô trên bảng
 */
    clearAllCells() {
        this.#cells.forEach(function (cell) {
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

/**
 * @param {HTMLDivElement} cellElement
 * @param {number} x
 * @param {number} y
 */
    constructor(cellElement, x, y) {
        this.#cellElement = cellElement;
        this.#x = x;
        this.#y = y;
    }

/**
 * Lấy toạ độ ngang của ô trên bảng (từ 0 đến 3)
 * @return {number}
 */
    get x() {
        return this.#x;
    }

/**
 * Lấy toạ độ dọc của ô trên bảng (từ 0 đến 3)
 * @return {number}
 */
    get y() {
        return this.#y;
    }

/**
 * Lấy ô giá trị của ô trên bảng
 * @return {Tile}
 */
    get tile() {
        return this.#tile;
    }

/**
 * Gán ô giá trị cho ô trên bảng
 * @param {Tile} value
 */
    set tile(value) {
        this.#tile = value;
        if (value == null) {
            return;
        }
        this.#tile.x = this.#x;
        this.#tile.y = this.#y;
    }

/**
 * Lấy ô được ghép của ô trên bảng
 * @return {Tile}
 */
    get mergeTile() {
        return this.#mergeTile;
    }

/**
 * Gán ô được ghép cho ô trên bảng
 * @param {Tile} value
 */
    set mergeTile(value) {
        this.#mergeTile = value;
        if (value == null) {
            return;
        }
        this.#mergeTile.x = this.#x;
        this.#mergeTile.y = this.#y;
    }

/**
 * Kiểm tra xem ô hiện tại có thể gán ô được ghép hay không
 * @param {Tile} tile
 */
    canAccept(tile) {
        return (
            this.tile == null ||
            (this.mergeTile == null && this.tile.value === tile.value)
        );
    }

    /**
     * Ghép ô giá trị với ô được ghép, sau đó xoá phần tử ô được ghép khỏi DOM và xoá ô được ghép khỏi đối tượng
     * @return number
     */
    mergeTiles() {
        if (this.tile == null || this.mergeTile == null) {
            return 0;
        }
        this.tile.value = this.tile.value + this.mergeTile.value;
        this.mergeTile.remove();
        this.mergeTile = null;
        return this.tile.value;
    }
}

/**
 * Tạo mảng chứa các phần tử ô trên bảng
 * @return {HTMLDivElement[]}
 */
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