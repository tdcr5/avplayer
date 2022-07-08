import CubeRender from "./cuberender.js";
import RectRender from "./rectrender.js";
import BaseRender from "./baserender.js";
import CylinderRender from "./cylinderrender.js";
import HemisphereRender from "./hemisphererender.js"
import RectMaskRender from "./rectmaskrender.js";
import RectGreenRender from "./rectgreenrender.js";

function createContextGL($canvas) {
    let gl = null;

    const validContextNames = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"];
    let nameIndex = 0;

    while (!gl && nameIndex < validContextNames.length) {
        const contextName = validContextNames[nameIndex];

        try {
            let contextOptions = {preserveDrawingBuffer: true};
            gl = $canvas.getContext(contextName, contextOptions);
        } catch (e) {
            gl = null;
        }

        if (!gl || typeof gl.getParameter !== "function") {
            gl = null;
        }

        ++nameIndex;
    }


    return gl;
}

class WebGLRender {

    _gl;

    _render;
    _avplayer;

    _renderMode;
    _width;
    _height;

    constructor(avplayer, canvas) {

        this._avplayer = avplayer;
        this._gl = createContextGL(canvas);
        this._width = canvas.width;
        this._height = canvas.height;

        this._renderMode = avplayer._options.renderMode;

        this.createRender();

    }

    createRender() {

        if (this._render) {

            this._render.destroy();
            this._render = null
        }

        switch(this._renderMode) {

            case "normal": {

                this._render = new RectRender(this._gl, this._width, this._height);
                break;
            }

            case "green": {

                this._render = new RectGreenRender(this._gl, this._width, this._height);
                break;
            }

            case "mask": {

                this._render = new RectMaskRender(this._gl, this._width, this._height);
                break;
            }

            case "cube": {

                this._render = new CubeRender(this._gl, this._width, this._height);
                break;
            }

            default: {
                this._render = new RectRender(this._gl, this._width, this._height);
                break;
            }

        } 

    }

    switchRender(renderMode) {

        if (this._renderMode === renderMode) {

            return;
        }

        this._renderMode = renderMode;

        this.createRender();

    }


    updateTexture(pixeltype, pixelbuf, width, height) {

        this._render.updateTexture(pixeltype, pixelbuf, width, height);
    }

    destroy() {

        if (this._render) {

            this._render.destroy();
            this._render = null
        }

    }



}


export default WebGLRender;