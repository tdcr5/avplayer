
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

        canvasElement.width = 1080;
        canvasElement.height = 960;

        this._videoElement = canvasElement;
        avplayer._container.appendChild(this._videoElement);

        this._webglrender = new WebGLRender(canvasElement, canvasElement.width, canvasElement.height)

    }

    updateTexture(pixeltype, pixelbuf, width, height) {

        this._webglrender.updateTexture(pixeltype, pixelbuf, width, height);
    }


}


export default CanvasRender;