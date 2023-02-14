import {ProspectingGrid} from "./ProspectingGrid.js";
import {ProspectingView} from "./ProspectingView.js";

export class ProspectingMap {
    #canvas;
    #ctx;
    #config;


    #grid;
    #view;

    #position = {
        x: 0,
        y: 0
    };
    #scale = 0.5;

    #lastMousePos;
    #lastMousedownPos;
    #isDragging = false;

    #observers = {};

    constructor(canvas, config) {
        this.#canvas = canvas;
        this.#ctx = canvas.getContext("2d");
        this.#config = config;
        this.#grid = new ProspectingGrid(this.#canvas.width, this.#canvas.height, config);
        const mapWidth = this.#canvas.width - config.border;
        const mapHeight = this.#canvas.height - config.border;
        this.#view = new ProspectingView(mapWidth, mapHeight, config);
        this.#view.subscribe("samplesFetched", this.draw.bind(this));
        this.#addEventListeners();
    }

    setPosition(x, y) {
        this.#position = {
            x: x,
            y: y
        }
    }

    getPosition() {
        return this.#position;
    }

    setScale(scale) {
        if (scale > 0 && scale < 1) {
            this.#scale = scale;
        }
    }

    getScale() {
        return this.#scale;
    }

    getLastMousePos() {
        return this.#lastMousePos;
    }

    getChunkSize() {
        return this.#config.chunkSize;
    }

    setOre(ore) {
        this.#view.setOre(ore);
        this.#notify('oreChanged');
    }

    getOre() {
        return this.#view.getOre();
    }

    draw() {
        this.#clear();
        this.#view.draw(this.#position.x, this.#position.y, this.#scale);
        this.#view.drawOnto(this.#ctx, this.#config.border, this.#config.border);
        this.#grid.draw(this.#position.x, this.#position.y, this.#scale);
        this.#grid.drawOnto(this.#ctx);
    }

    #clear() {
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    #getMousePos(e) {
        const rect = this.#canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left - this.#config.border,
            y: e.clientY - rect.top - this.#config.border
        }
    }

    #addEventListeners() {
        this.#canvas.addEventListener('mousedown', this.#handleMousedown.bind(this));
        this.#canvas.addEventListener('mouseup', this.#handleMouseup.bind(this));
        this.#canvas.addEventListener('mousemove', this.#handleMousemove.bind(this));
        this.#canvas.addEventListener('mouseout', this.#handleMouseout.bind(this));
        this.#canvas.addEventListener('wheel', this.#handleWheel.bind(this));
    }

    #handleMousedown(e) {
        this.#isDragging = true;
        this.#lastMousedownPos = this.#getMousePos(e);
    }

    #handleMouseup(e) {
        this.#isDragging = false;
        this.#notify("moved");
    }

    #handleMousemove(e) {
        const mousePos = this.#getMousePos(e);
        if (mousePos.x < 0 || mousePos.y < 0) {
            this.#isDragging = false;
            return;
        }
        this.#lastMousePos = mousePos;
        this.#notify("hover")
        if (this.#isDragging) {
            const distance = {
                x: (this.#lastMousedownPos.x - mousePos.x) / this.#scale,
                y: (this.#lastMousedownPos.y - mousePos.y) / this.#scale
            }
            this.#position.x += distance.x;
            this.#position.y += distance.y;
            this.#lastMousedownPos = mousePos;
            this.draw();
        }
    }

    #handleMouseout(e) {
        if (this.#isDragging) {
            this.#notify("moved");
        }
        this.#isDragging = false;
    }

    #handleWheel(e) {
        e.preventDefault();
        const mousePos = this.#getMousePos(e);
        if (mousePos.x > this.#config.border && mousePos.y > this.#config.border) {
            if (e.deltaY < 0 && this.#scale < 1) {
                const hoverX = this.#position.x + (mousePos.x - this.#config.border) / this.#scale;
                const hoverY = this.#position.y + (mousePos.y - this.#config.border) / this.#scale;
                this.#position = {
                    x: hoverX - (hoverX - this.#position.x) / 2,
                    y: hoverY - (hoverY - this.#position.y) / 2
                }
                this.#scale *= 2;
            } else if (e.deltaY > 0 && this.#scale > 0.25) {
                const hoverX = this.#position.x + (mousePos.x - this.#config.border) / this.#scale;
                const hoverY = this.#position.y + (mousePos.y - this.#config.border) / this.#scale;
                this.#position = {
                    x: hoverX - (hoverX - this.#position.x) * 2,
                    y: hoverY - (hoverY - this.#position.y) * 2
                }
                this.#scale /= 2;
            }
            this.#notify("moved")
            this.draw();
        }
    }

    reloadRegionAt(x, y) {
        this.#view.reloadRegionAt(x, y);
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