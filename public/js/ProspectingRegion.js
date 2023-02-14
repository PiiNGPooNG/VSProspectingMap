export class ProspectingRegion {
    #colors = [
        '#111111',
        '#e12729',
        '#f37324',
        '#f8cc1b',
        '#72b043',
        '#007f4e',
        '#59c1d4',
    ];

    #offscreenCanvas;
    #offscreenCtx;
    #config;

    #x;
    #y;
    #size;

    #forceRedraw = false;
    #renderedChunkSize;
    #renderedOre;

    #samples = [];

    #observers = {};

    constructor(x, y, config) {
        const size = config.chunkSize * config.chunksPerRegion;
        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = size;
        offscreenCanvas.height = size;
        this.#offscreenCanvas = offscreenCanvas;
        this.#offscreenCtx = offscreenCanvas.getContext("2d");
        this.#config = config;
        this.#x = x;
        this.#y = y;
        this.#size = size;
        this.fetchSamples();
    }

    getX() {
        return this.#x;
    }

    getY() {
        return this.#y;
    }

    contains(x, y) {
        const x0 = this.#x * this.#size;
        const y0 = this.#y * this.#size;
        const x1 = (this.#x + 1) * this.#size;
        const y1 = (this.#y + 1) * this.#size;
        return x >= x0 && x < x1 && y >= y0 && y < y1;
    }

    within(x, y, width, height) {
        const regionX0 = this.#x * this.#size;
        const regionY0 = this.#y * this.#size;
        const regionX1 = (this.#x + 1) * this.#size;
        const regionY1 = (this.#y + 1) * this.#size;
        return !(regionX1 < x || regionX0 > x + width || regionY1 < y || regionY0 > y + height);
    }

    #drawOffscreen(chunkSize, ore = 'alum') {
        this.#clearOffscreen();
        this.#samples.forEach((sample) => {
            const chunkX = Math.floor(sample.x / chunkSize) * chunkSize;
            const chunkY = Math.floor(sample.y / chunkSize) * chunkSize;
            this.#offscreenCtx.fillStyle = this.#colors[sample[ore] ?? 0];
            this.#offscreenCtx.fillRect(chunkX, chunkY, chunkSize, chunkSize);
        });
        this.#forceRedraw = false;
        this.#renderedChunkSize = chunkSize;
        this.#renderedOre = ore;
    }

    #clearOffscreen() {
        this.#offscreenCtx.clearRect(0, 0, this.#offscreenCanvas.width, this.#offscreenCanvas.height);
    }

    draw(chunkSize, ore) {
        if (this.#forceRedraw || this.#renderedOre !== ore || this.#renderedChunkSize !== chunkSize) {
            this.#drawOffscreen(chunkSize, ore);
        }
    }

    drawOnto(ctx, viewX, viewY, scale) {
        const dx = (this.#x * this.#size - viewX) * scale;
        const dy = (this.#y * this.#size - viewY) * scale;
        const length = this.#size * scale;
        ctx.drawImage(this.#offscreenCanvas, dx, dy, length, length);
    }

    async fetchSamples() {
        const x0 = this.#x * this.#size;
        const y0 = this.#y * this.#size;
        const x1 = (this.#x + 1) * this.#size;
        const y1 = (this.#y + 1) * this.#size;

        const formData = new FormData();
        formData.append('x0', x0);
        formData.append('y0', y0);
        formData.append('x1', x1);
        formData.append('y1', y1);
        const options = {
            method: 'POST',
            body: formData
        }
        const response = await fetch(this.#config.fetchAddress, options);
        let json =  await response.json();
        if (json.success) {
            let samples = json.samples;
            samples.forEach((sample) => {
                sample.x -= x0;
                sample.y -= y0;
            });
            this.#samples = samples;
            this.#forceRedraw = true;
            this.#notify("samplesFetched");
        }
    }

    // Observable
    subscribe(event, handler) {
        if (!this.#observers[event]) {
            this.#observers[event] = [];
        }
        this.#observers[event].push(handler);
    }

    unsubscribe(event, handler) {
        if (!this.#observers[event]) {
            return;
        }
        this.#observers[event].filter((subscribedHandler) => {
            return handler !== subscribedHandler;
        });
    }

    #notify(event) {
        if (!this.#observers[event]) {
            return;
        }
        this.#observers[event].forEach((handler) => {
            handler();
        });
    }
}