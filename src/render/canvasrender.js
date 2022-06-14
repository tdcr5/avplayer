
import WebGLRender from "./webglrender.js";


class CanvasRender {

    _avplayer;

    _webglrender;

    constructor(avplayer) {

        this._avplayer = avplayer;
        
        let canvasElement = document.createElement("canvas");
        canvasElement.style.position = "relative";
        canvasElement.style.top = '50px';
        canvasElement.style.left = '50px';

        canvasElement.width = 640;
        canvasElement.height = 640;

        this._videoElement = canvasElement;
        avplayer._container.appendChild(this._videoElement);

        this._webglrender = new WebGLRender(canvasElement, canvasElement.width, canvasElement.height)

    }

    updateTexture(rgbabuf, width, height) {

        this._webglrender.updateTexture(rgbabuf, width, height);
    }


}


export default CanvasRender;