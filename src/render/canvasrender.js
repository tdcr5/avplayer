
import WebGLRender from "./webglrender.js";


class CanvasRender {

    _player;

    _webglrender;

    constructor(player) {

        this._player = player;
        
        let canvasElement = document.createElement("canvas");
        canvasElement.style.position = "absolute";
        canvasElement.style.top = '0px';
        canvasElement.style.left = '0px';

        canvasElement.width = player._options.width;
        canvasElement.height = player._options.height;

        this._videoElement = canvasElement;
        player._container.appendChild(this._videoElement);

        this._webglrender = new WebGLRender(player, canvasElement)

    }

    updateTexture(pixeltype, pixelbuf, width, height) {

        this._webglrender.updateTexture(pixeltype, pixelbuf, width, height);
    }


    switchRender(renderMode) {

        this._webglrender.switchRender(renderMode);

    }


    destroy() {

        this._webglrender.destroy();
        this._player._container.removeChild(this._videoElement);

        this._player._logger.info('CanvasRender', 'CanvasRender destroy');

    }


}


export default CanvasRender;