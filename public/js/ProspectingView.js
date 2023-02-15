import {ProspectingRegion} from "./ProspectingRegion.js";

export class ProspectingView {
    #offscreenCanvas;
    #offscreenCtx;
    #config;
    #width;
    #height;
    #regionSize;

    #ore;

    #regions = [];

    #observers = {};

    constructor(width, height, config) {
        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        this.#offscreenCanvas = offscreenCanvas;
        this.#offscreenCtx = offscreenCanvas.getContext("2d");
        this.#config = config;
        this.#width = width;
        this.#height = height;
        this.#regionSize = config.chunkSize * config.chunksPerRegion;
        this.#ore = config.defaultOre;
    }

    set ore(ore) {
        this.#ore = ore;
    }

    get ore() {
        return this.#ore;
    }

    draw(viewX, viewY, scale) {
        const regionOffsetX = Math.floor(viewX / this.#regionSize);
        const regionAmountX = Math.floor((viewX + this.#width / scale) / this.#regionSize) - regionOffsetX + 1;
        const regionOffsetY = Math.floor(viewY / this.#regionSize);
        const regionAmountY = Math.floor((viewY + this.#height / scale) / this.#regionSize) - regionOffsetY + 1;

        let regionsToDraw = [];
        for (let i = 0; i < regionAmountX; i++) {
            regionsToDraw[i] = Array.from({length:regionAmountY});
        }

        this.#regions.forEach((region) => {
            if (region.within(viewX, viewY, this.#width / scale, this.#height / scale)) {
                regionsToDraw[region.x - regionOffsetX][region.y - regionOffsetY] = region;
            }
        });

        this.#clearOffscreen();
        regionsToDraw.forEach((regionsToDrawRow, regionToDrawX) => {
            regionsToDrawRow.forEach((region, regionToDrawY) => {
                if (region === undefined) {
                    const regionX = regionToDrawX + regionOffsetX;
                    const regionY = regionToDrawY + regionOffsetY;
                    region = new ProspectingRegion(regionX, regionY, this.#config);
                    region.subscribe("samplesFetched", () => { this.#notify("samplesFetched") });
                    this.#regions.push(region);
                }
                region.draw(this.#config.chunkSize, this.#ore);
                region.drawOnto(this.#offscreenCtx, viewX, viewY, scale);
            });
        });
    }

    drawOnto(ctx, dx, dy) {
        ctx.drawImage(this.#offscreenCanvas, dx, dy);
    }

    #clearOffscreen() {
        this.#offscreenCtx.clearRect(0, 0, this.#offscreenCanvas.width, this.#offscreenCanvas.height);
    }

    reloadRegionAt(x, y) {
        this.#regions.forEach((region) => {
            if (region.contains(x, y)) {
                region.fetchSamples();
            }
        });
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