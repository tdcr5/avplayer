
import WebGLRender from "./webglrender.js";


class CanvasRender {

    _avplayer;

    _webglrender;

    constructor(avplayer) {

        this._avplayer = avplayer;
        
        const $canvasElement = document.createElement("canvas");
        $canvasElement.style.position = "relative";
        $canvasElement.style.top = '50px';
        $canvasElement.style.left = '50px';

        $canvasElement.width = 640;
        $canvasElement.height = 640;

        this.$videoElement = $canvasElement;
        avplayer.$container.appendChild(this.$videoElement);

        this._webglrender = new WebGLRender($canvasElement, $canvasElement.width, $canvasElement.height)

    }

    updateTexture(rgbabuf, width, height) {

        this._webglrender.updateTexture(rgbabuf, width, height);
    }


}


export default CanvasRender;