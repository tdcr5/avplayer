import CanvasRender from "./render/canvasrender.js";


const DEFAULT_PLAYER_OPTIONS = {

    url:'',
    container:''

}

class AVPlayer {

    _options = undefined;

    _render = undefined;

    constructor(options) {

        this._options = Object.assign({}, DEFAULT_PLAYER_OPTIONS, options);

        this.$container = this._options.container;

        this._render = new CanvasRender(this);
    }

    updateTexture(rgbabuf, width, height) {

        this._render.updateTexture(rgbabuf, width, height);
    }


}

window.AVPlayer = AVPlayer;

export default AVPlayer;