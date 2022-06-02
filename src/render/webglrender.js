import CubeRender from "./cuberender.js";
import RectRender from "./rectrender.js";
import BaseRender from "./baserender.js";

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

    constructor(canvas) {

        this._gl = createContextGL(canvas);

        this._render = new CubeRender(this._gl, canvas.width, canvas.height);

    }


}


export default WebGLRender;