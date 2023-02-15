export class CoordinateUpdater {
    #map;
    #elements;

    constructor(map, el) {
        this.#map = map;
        this.#setElements(el);
        map.subscribe("hover", this.#updateCoordinates.bind(this));
    }

    #setElements(el) {
        this.#elements = {
            precise: {
                x: el.querySelector('.precise>.x'),
                y: el.querySelector('.precise>.y')
            },
            chunk: {
                x: el.querySelector('.chunk>.x'),
                y: el.querySelector('.chunk>.y')
            }
        }
    }

    #updateCoordinates() {
        const coordinates = this.#getHoveredCoordinates();
        this.#updatePreciseCoordinates(coordinates);
        this.#updateChunkCoordinates(coordinates);
    }

    #getHoveredCoordinates() {
        const mousePos = this.#map.lastMousePos;
        const viewPos = this.#map.position;
        const scale = this.#map.scale;
        const x = viewPos.x + mousePos.x / scale;
        const y = viewPos.y + mousePos.y / scale;
        return {x: x, y: y};
    }

    #updatePreciseCoordinates(coordinates) {
        this.#elements.precise.x.innerText = coordinates.x;
        this.#elements.precise.y.innerText = coordinates.y;
    }

    #updateChunkCoordinates(coordinates) {
        const chunkSize = this.#map.chunkSize;
        this.#elements.chunk.x.innerText = Math.floor(coordinates.x / chunkSize) * chunkSize;
        this.#elements.chunk.y.innerText = Math.floor(coordinates.y / chunkSize) * chunkSize;
    }
}