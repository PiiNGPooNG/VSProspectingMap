export class ProspectingGrid {
    #offscreenCanvas;
    #offscreenCtx;
    #config;
    #x0;
    #y0;
    #x1;
    #y1;

    constructor(width, height, config) {
        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        this.#offscreenCanvas = offscreenCanvas;
        this.#offscreenCtx = offscreenCanvas.getContext("2d");
        this.#config = config;
        this.#x0 = config.border;
        this.#y0 = config.border;
        this.#x1 = width;
        this.#y1 = height;
    }

    draw(viewX, viewY, scale) {
        this.#clearOffscreen();
        this.#drawVerticalLines(viewX, scale);
        this.#drawHorizontalLines(viewY, scale);
        this.#drawVerticalMarkers(viewX, scale);
        this.#drawHorizontalMarkers(viewY, scale);
    }

    drawOnto(ctx) {
        ctx.drawImage(this.#offscreenCanvas, 0, 0);
    }

    #clearOffscreen() {
        this.#offscreenCtx.clearRect(0, 0, this.#offscreenCanvas.width, this.#offscreenCanvas.height);
    }

    #drawVerticalLines(viewX, scale) {
        this.#offscreenCtx.strokeStyle = 'grey';

        const limit = viewX + (this.#x1 - this.#x0) / scale;
        const firstLine = Math.ceil(viewX / this.#config.chunkSize) * this.#config.chunkSize;

        this.#offscreenCtx.beginPath();
        for (let i = firstLine; i < limit; i += this.#config.chunkSize) {
            const x = Math.floor(this.#x0 + (i - viewX) * scale) + 0.5;
            this.#offscreenCtx.moveTo(x, this.#y0);
            this.#offscreenCtx.lineTo(x, this.#y1);
        }
        this.#offscreenCtx.stroke();
    }

    #drawVerticalMarkers(viewX, scale) {
        this.#offscreenCtx.strokeStyle = '#cccccc';
        this.#offscreenCtx.fillStyle = 'white';
        this.#offscreenCtx.textAlign = 'center';

        const interval = this.#config.chunkSize * this.#config.chunksPerMarker;
        const limit = viewX + (this.#x1 - this.#x0) / scale;
        const firstLine = Math.ceil(viewX / interval) * interval;

        this.#offscreenCtx.beginPath();
        for (let i = firstLine; i < limit; i += interval) {
            const x = Math.floor(this.#x0 + (i - viewX) * scale) + 0.5;
            this.#offscreenCtx.moveTo(x, this.#y0);
            this.#offscreenCtx.lineTo(x, this.#y1);
            this.#offscreenCtx.fillText(i.toString(), x, this.#y0 - 4);
        }
        this.#offscreenCtx.stroke();
    }

    #drawHorizontalLines(viewY, scale) {
        this.#offscreenCtx.strokeStyle = 'grey';

        const limit = viewY + (this.#y1 - this.#y0) / scale;
        const firstLine = Math.ceil(viewY / this.#config.chunkSize) * this.#config.chunkSize;

        this.#offscreenCtx.beginPath();
        for (let i = firstLine; i < limit; i += this.#config.chunkSize) {
            const y = Math.floor(this.#y0 + (i - viewY) * scale) + 0.5;
            this.#offscreenCtx.moveTo(this.#x0, y);
            this.#offscreenCtx.lineTo(this.#x1, y);
        }
        this.#offscreenCtx.stroke();
    }

    #drawHorizontalMarkers(viewY, scale) {
        this.#offscreenCtx.strokeStyle = '#cccccc';
        this.#offscreenCtx.fillStyle = 'white';
        this.#offscreenCtx.textAlign = 'right';

        const interval = this.#config.chunkSize * this.#config.chunksPerMarker;
        const limit = viewY + (this.#y1 - this.#y0) / scale;
        const firstLine = Math.ceil(viewY / interval) * interval;

        this.#offscreenCtx.beginPath();
        for (let i = firstLine; i < limit; i += interval) {
            const y = Math.floor(this.#y0 + (i - viewY) * scale) + 0.5;
            this.#offscreenCtx.moveTo(this.#x0, y);
            this.#offscreenCtx.lineTo(this.#x1, y);
            this.#offscreenCtx.fillText(i.toString(), this.#x0 - 4, y + 4);
        }
        this.#offscreenCtx.stroke();
    }
}