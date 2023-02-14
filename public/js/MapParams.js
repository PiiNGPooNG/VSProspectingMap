export class MapParams {

    #urlParams;
    #config;

    constructor(config) {
        this.#urlParams = new URLSearchParams(document.location.search);
        this.#config = config;
    }

    x() {
        let x = parseInt(this.#urlParams.get('x'));
        if (isNaN(x)) {
            x = this.#config.defaultX;
        }
        return x;
    }

    y() {
        let y = parseInt(this.#urlParams.get('y'));
        if (isNaN(y)) {
            y = this.#config.defaultY;
        }
        return y;
    }

    scale() {
        let scale = parseFloat(this.#urlParams.get('scale'));
        if (isNaN(scale)) {
            scale = this.#config.defaultScale;
        }
        return scale;
    }

    ore() {
        let ore = this.#urlParams.get('ore');
        if (ore === null) {
            ore = this.#config.defaultOre;
        }
        return ore;
    }
}