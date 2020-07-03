class BarcodeScanner extends HTMLElement {
    connectedCallback() {
        fetch(import.meta.url.replace(".js", ".html")).then(result => result.text()).then(html => {
            this.innerHTML = html;
            requestAnimationFrame(this._initialize.bind(this));
        });
    }

    disconnectedCallback() {
        this._btnStart.removeEventListener("click", this._startHandler);
        this._startHandler = null;
        this._btnStart = null;
        this._worker.onmessage = null;
        this._worker.terminate();
        this._worker = null;
        this._onMessageHandler = null;
    }

    _initialize() {
        this._btnStart = this.querySelector("#btnStart");
        this._startHandler = this._start.bind(this);
        this._btnStart.addEventListener("click", this._startHandler);

        this._onMessageHandler = this._onMessage.bind(this);

        const path = import.meta.url.split("/");
        path.splice(path.length-1, 1);
        path.push("zxing/zxing_worker.js");
        const url = path.join("/");
        this._worker = new Worker(url);
        this._worker.onmessage = this._onMessageHandler;
    }

    _start() {
        const img = document.querySelector("img");
        const data = this._getImageData(img);

        this._worker.postMessage(data);
    }

    _getImageData(img) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0 );
        return context.getImageData(0, 0, img.width, img.height);
    }

    _onMessage(message) {
        if (typeof message.data == "object") {
            document.querySelector("#result").textContent = message.data.payload_string;
        }
    }
}

customElements.define("crs-barcode-scanner", BarcodeScanner);