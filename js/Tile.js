const tileColor = [
    {
        value: 2,
        color: '#EEE4DA',
    },
    {
        value: 4,
        color: '#EDE0C8',
    },
    {
        value: 8,
        color: '#F2B179',
    },
    {
        value: 16,
        color: '#F59563',
    },
    {
        value: 32,
        color: '#F67C5F',
    },
    {
        value: 64,
        color: '#F65E3B',
    },
    {
        value: 128,
        color: '#EDCF72',
    },
    {
        value: 256,
        color: '#EDCC61',
    },
    {
        value: 512,
        color: '#EDC850',
    },
    {
        value: 1024,
        color: '#EDC53F',
    },
    {
        value: 2048,
        color: '#EDC22E',
    },
    {
        value: 4096,
        color: '#3E3933',
    }
];

export default class Tile {
    #tileElement;
    #x;
    #y;
    #value;

    constructor(tileContainer, value = Math.random() > 0.5 ? 2 : 4) {
        this.#tileElement = document.createElement("div");
        this.#tileElement.classList.add("tile");
        tileContainer.appendChild(this.#tileElement);
        this.value = value;
    }

    get value() {
        return this.#value;
    }

    set value(v) {
        this.#value = v;
        this.#tileElement.textContent = v;
        this.#tileElement.style.setProperty("--hb-tile-bg-color", `${this.#color(v)}`);
        this.#tileElement.style.setProperty("--hb-tile-number-color", v <= 4 ? "var(--hb-tile-number-color-dark)": "var(--hb-tile-number-color-light)");
    }

    set x(value) {
        this.#x = value;
        this.#tileElement.style.setProperty("--x", value);
    }

    set y(value) {
        this.#y = value;
        this.#tileElement.style.setProperty("--y", value);
    }

    #color(value) {
        let tileObj = tileColor.find(tile => tile.value === value);
        return tileObj.color;
    }

    remove() {
        this.#tileElement.remove();
    }

    waitForTransition(animation = false) {
        return new Promise(resolve => {
            this.#tileElement.addEventListener(animation ? "animationend" : "transitionend", resolve, {once: true});
        });
    }
}