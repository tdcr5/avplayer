
import WebGLRender from "./webglrender.js";


class CanvasRender {

    _avplayer;

    _webglrender;

    constructor(avplayer) {

        this._avplayer = avplayer;
        
        const $canvasElement = document.createElement("canvas");
        $canvasElement.style.position = "absolute";
        $canvasElement.style.top = 0;
        $canvasElement.style.left = 0;

        $canvasElement.width = 500;
        $canvasElement.height = 500;

        this.$videoElement = $canvasElement;
        avplayer.$container.appendChild(this.$videoElement);

        this._webglrender = new WebGLRender($canvasElement, $canvasElement.width, $canvasElement.height)

    }


}


export default CanvasRender;