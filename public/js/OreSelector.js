export class OreSelector {
    #map;
    #select;
    constructor(map, select) {
        this.#map = map;
        this.#select = select;
        this.#select.addEventListener('change', this.#handleChange.bind(this));
    }

    set ore(ore) {
        this.#select.value = ore;
    }
    
    #handleChange(e) {
        this.#map.ore = this.#select.value;
        this.#map.draw();
    }
}