
import WebGLRender from "./webglrender.js";


class CanvasRender {

    _avplayer;

    _webglrender;

    constructor(avplayer) {

        this._avplayer = avplayer;
        
        let canvasElement = document.createElement("canvas");
        canvasElement.style.position = "absolute";
        canvasElement.style.top = '0px';
        canvasElement.style.left = '0px';

        canvasElement.width = avplayer._options.width;
        canvasElement.height = avplayer._options.height;

        this._videoElement = canvasElement;
        avplayer._container.appendChild(this._videoElement);

        this._webglrender = new WebGLRender(avplayer, canvasElement)

    }

    updateTexture(pixeltype, pixelbuf, width, height) {

        this._webglrender.updateTexture(pixeltype, pixelbuf, width, height);
    }

    destroy() {

        this._webglrender.destroy();
        this._avplayer._container.removeChild(this._videoElement);

    }


}


export default CanvasRender;