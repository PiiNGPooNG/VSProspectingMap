export class UrlUpdater {
    #map;

    constructor(map) {
        this.#map = map;
        map.subscribe("moved", this.#moveUpdate.bind(this));
        map.subscribe("oreChanged", this.#oreChangeUpdate.bind(this));
    }

    #moveUpdate() {
        let url = new URL(window.location.href);
        const position = this.#map.position;
        url.searchParams.set('x', position.x);
        url.searchParams.set('y', position.y);
        url.searchParams.set('scale', this.#map.scale);
        window.history.replaceState(null, null, url);
    }

    #oreChangeUpdate() {
        let url = new URL(window.location.href);
        const ore = this.#map.ore;
        url.searchParams.set('ore', ore);
        window.history.replaceState(null, null, url);
    }
}