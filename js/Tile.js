const tileColor = [
    {
        value: 2,
        color: '#EEE4DA'
    },
    {
        value: 4,
        color: '#EDE0C8'
    },
    {
        value: 8,
        color: '#F2B179'
    },
    {
        value: 16,
        color: '#F59563'
    },
    {
        value: 32,
        color: '#F67C5F'
    },
    {
        value: 64,
        color: '#F65E3B'
    },
    {
        value: 128,
        color: '#EDCF72'
    },
    {
        value: 256,
        color: '#EDCC61'
    },
    {
        value: 512,
        color: '#EDC850'
    },
    {
        value: 1024,
        color: '#EDC53F'
    },
    {
        value: 2048,
        color: '#EDC22E'
    }
];

export default class Tile {
    /**
     * @return {HTMLDivElement}
     */
    #tileElement;
    #x;
    #y;
    #value;

    /**
     *
     * @param {HTMLDivElement} tileContainer
     * @param {number} value
     */
    constructor(tileContainer, value = Math.random() > 0.5 ? 2 : 4) {
        this.#tileElement = document.createElement("div");
        this.#tileElement.classList.add("tile");
        tileContainer.appendChild(this.#tileElement);
        this.value = value;
    }

/**
 * Lấy giá trị của ô giá trị
 * @return {number}
 */
    get value() {
        return this.#value;
    }

/**
 * Gán giá trị cho ô giá trị
 * @param {number} v
 */
    set value(v) {
        this.#value = v;
        this.#tileElement.textContent = v;

        let bgColor = this.#color(v);
        let numberColor = v <= 4 ? "var(--hb-tile-number-color-dark)": "var(--hb-tile-number-color-light)";

        this.#tileElement.style.setProperty("--hb-tile-bg-color", bgColor);
        this.#tileElement.style.setProperty("--hb-tile-number-color", numberColor);
    }

/**
 * Gán toạ độ ngang cho ô giá trị
 * @param {number} value
 */
    set x(value) {
        this.#x = value;
        this.#tileElement.style.setProperty("--x", `${value}`);
    }

/**
 * Gán toạ độ dọc cho ô giá trị
 * @param {number} value
 */
    set y(value) {
        this.#y = value;
        this.#tileElement.style.setProperty("--y", `${value}`);
    }

/**
 * Lấy màu sắc của ô dựa trên giá trị của ô
 * @param {number} value
 */
    #color(value) {
        let tileObj = tileColor.find(function (tile) {
            return tile.value === value;
        });
        return tileObj ? tileObj.color : '#EDC22E';
    }

/**
 * Xoá phần tử ô giá trị khỏi DOM
 */
    remove() {
        this.#tileElement.remove();
    }

    waitForTransition(animation = false) {
        return new Promise(resolve => {
            this.#tileElement.addEventListener(animation ? "animationend" : "transitionend", resolve, {once: true});
        });
    }
}