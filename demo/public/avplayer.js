(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.avplayer = factory());
})(this, (function () { 'use strict';

    class BaseRender {
      constructor() {}

    }

    /**
     * Common utilities
     * @module glMatrix
     */
    // Configuration Constants
    var EPSILON = 0.000001;
    var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
    if (!Math.hypot) Math.hypot = function () {
      var y = 0,
          i = arguments.length;

      while (i--) {
        y += arguments[i] * arguments[i];
      }

      return Math.sqrt(y);
    };

    /**
     * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
     * @module mat4
     */

    /**
     * Creates a new identity mat4
     *
     * @returns {mat4} a new 4x4 matrix
     */

    function create$1() {
      var out = new ARRAY_TYPE(16);

      if (ARRAY_TYPE != Float32Array) {
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
      }

      out[0] = 1;
      out[5] = 1;
      out[10] = 1;
      out[15] = 1;
      return out;
    }
    /**
     * Set a mat4 to the identity matrix
     *
     * @param {mat4} out the receiving matrix
     * @returns {mat4} out
     */

    function identity(out) {
      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = 1;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 1;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    }
    /**
     * Rotates a mat4 by the given angle around the given axis
     *
     * @param {mat4} out the receiving matrix
     * @param {ReadonlyMat4} a the matrix to rotate
     * @param {Number} rad the angle to rotate the matrix by
     * @param {ReadonlyVec3} axis the axis to rotate around
     * @returns {mat4} out
     */

    function rotate(out, a, rad, axis) {
      var x = axis[0],
          y = axis[1],
          z = axis[2];
      var len = Math.hypot(x, y, z);
      var s, c, t;
      var a00, a01, a02, a03;
      var a10, a11, a12, a13;
      var a20, a21, a22, a23;
      var b00, b01, b02;
      var b10, b11, b12;
      var b20, b21, b22;

      if (len < EPSILON) {
        return null;
      }

      len = 1 / len;
      x *= len;
      y *= len;
      z *= len;
      s = Math.sin(rad);
      c = Math.cos(rad);
      t = 1 - c;
      a00 = a[0];
      a01 = a[1];
      a02 = a[2];
      a03 = a[3];
      a10 = a[4];
      a11 = a[5];
      a12 = a[6];
      a13 = a[7];
      a20 = a[8];
      a21 = a[9];
      a22 = a[10];
      a23 = a[11]; // Construct the elements of the rotation matrix

      b00 = x * x * t + c;
      b01 = y * x * t + z * s;
      b02 = z * x * t - y * s;
      b10 = x * y * t - z * s;
      b11 = y * y * t + c;
      b12 = z * y * t + x * s;
      b20 = x * z * t + y * s;
      b21 = y * z * t - x * s;
      b22 = z * z * t + c; // Perform rotation-specific matrix multiplication

      out[0] = a00 * b00 + a10 * b01 + a20 * b02;
      out[1] = a01 * b00 + a11 * b01 + a21 * b02;
      out[2] = a02 * b00 + a12 * b01 + a22 * b02;
      out[3] = a03 * b00 + a13 * b01 + a23 * b02;
      out[4] = a00 * b10 + a10 * b11 + a20 * b12;
      out[5] = a01 * b10 + a11 * b11 + a21 * b12;
      out[6] = a02 * b10 + a12 * b11 + a22 * b12;
      out[7] = a03 * b10 + a13 * b11 + a23 * b12;
      out[8] = a00 * b20 + a10 * b21 + a20 * b22;
      out[9] = a01 * b20 + a11 * b21 + a21 * b22;
      out[10] = a02 * b20 + a12 * b21 + a22 * b22;
      out[11] = a03 * b20 + a13 * b21 + a23 * b22;

      if (a !== out) {
        // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
      }

      return out;
    }
    /**
     * Generates a perspective projection matrix with the given bounds.
     * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
     * which matches WebGL/OpenGL's clip volume.
     * Passing null/undefined/no value for far will generate infinite projection matrix.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {number} fovy Vertical field of view in radians
     * @param {number} aspect Aspect ratio. typically viewport width/height
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum, can be null or Infinity
     * @returns {mat4} out
     */

    function perspectiveNO(out, fovy, aspect, near, far) {
      var f = 1.0 / Math.tan(fovy / 2),
          nf;
      out[0] = f / aspect;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = f;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[11] = -1;
      out[12] = 0;
      out[13] = 0;
      out[15] = 0;

      if (far != null && far !== Infinity) {
        nf = 1 / (near - far);
        out[10] = (far + near) * nf;
        out[14] = 2 * far * near * nf;
      } else {
        out[10] = -1;
        out[14] = -2 * near;
      }

      return out;
    }
    /**
     * Alias for {@link mat4.perspectiveNO}
     * @function
     */

    var perspective = perspectiveNO;
    /**
     * Generates a look-at matrix with the given eye position, focal point, and up axis.
     * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {ReadonlyVec3} eye Position of the viewer
     * @param {ReadonlyVec3} center Point the viewer is looking at
     * @param {ReadonlyVec3} up vec3 pointing up
     * @returns {mat4} out
     */

    function lookAt(out, eye, center, up) {
      var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
      var eyex = eye[0];
      var eyey = eye[1];
      var eyez = eye[2];
      var upx = up[0];
      var upy = up[1];
      var upz = up[2];
      var centerx = center[0];
      var centery = center[1];
      var centerz = center[2];

      if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
        return identity(out);
      }

      z0 = eyex - centerx;
      z1 = eyey - centery;
      z2 = eyez - centerz;
      len = 1 / Math.hypot(z0, z1, z2);
      z0 *= len;
      z1 *= len;
      z2 *= len;
      x0 = upy * z2 - upz * z1;
      x1 = upz * z0 - upx * z2;
      x2 = upx * z1 - upy * z0;
      len = Math.hypot(x0, x1, x2);

      if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
      } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
      }

      y0 = z1 * x2 - z2 * x1;
      y1 = z2 * x0 - z0 * x2;
      y2 = z0 * x1 - z1 * x0;
      len = Math.hypot(y0, y1, y2);

      if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
      } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
      }

      out[0] = x0;
      out[1] = y0;
      out[2] = z0;
      out[3] = 0;
      out[4] = x1;
      out[5] = y1;
      out[6] = z1;
      out[7] = 0;
      out[8] = x2;
      out[9] = y2;
      out[10] = z2;
      out[11] = 0;
      out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
      out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
      out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
      out[15] = 1;
      return out;
    }

    /**
     * 3 Dimensional Vector
     * @module vec3
     */

    /**
     * Creates a new, empty vec3
     *
     * @returns {vec3} a new 3D vector
     */

    function create() {
      var out = new ARRAY_TYPE(3);

      if (ARRAY_TYPE != Float32Array) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
      }

      return out;
    }
    /**
     * Creates a new vec3 initialized with the given values
     *
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} a new 3D vector
     */

    function fromValues(x, y, z) {
      var out = new ARRAY_TYPE(3);
      out[0] = x;
      out[1] = y;
      out[2] = z;
      return out;
    }
    /**
     * Perform some operation over an array of vec3s.
     *
     * @param {Array} a the array of vectors to iterate over
     * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
     * @param {Number} offset Number of elements to skip at the beginning of the array
     * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
     * @param {Function} fn Function to call for each vector in the array
     * @param {Object} [arg] additional argument to pass to fn
     * @returns {Array} a
     * @function
     */

    (function () {
      var vec = create();
      return function (a, stride, offset, count, fn, arg) {
        var i, l;

        if (!stride) {
          stride = 3;
        }

        if (!offset) {
          offset = 0;
        }

        if (count) {
          l = Math.min(count * stride + offset, a.length);
        } else {
          l = a.length;
        }

        for (i = offset; i < l; i += stride) {
          vec[0] = a[i];
          vec[1] = a[i + 1];
          vec[2] = a[i + 2];
          fn(vec, vec, arg);
          a[i] = vec[0];
          a[i + 1] = vec[1];
          a[i + 2] = vec[2];
        }

        return a;
      };
    })();

    const vsSource = `
attribute vec4 aVertexPosition;
attribute vec2 aTexturePosition;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
varying lowp vec2 vTexturePosition;
void main(void) {
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
  vTexturePosition = aTexturePosition;
}
`; // Fragment shader program

    const fsSource = `
varying lowp vec2 vTexturePosition;
uniform sampler2D uTexture; 
void main(void) {
  gl_FragColor =  texture2D(uTexture, vTexturePosition);
 //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;
    var cubeRotation = 0.0;

    class CubeRender extends BaseRender {
      _gl = undefined;
      _width = 0;
      _height = 0;

      constructor(gl, width, height) {
        super();
        this._width = width;
        this._height = height;
        this._gl = gl;

        this._gl.pixelStorei(this._gl.UNPACK_ALIGNMENT, 1);

        const shaderProgram = initShaderProgram(this._gl, vsSource, fsSource);
        const programInfo = {
          program: shaderProgram,
          attribLocations: {
            vertexPosition: this._gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            texturePosition: this._gl.getAttribLocation(shaderProgram, 'aTexturePosition')
          },
          uniformLocations: {
            projectionMatrix: this._gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelMatrix: this._gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
            viewMatrix: this._gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
            texture: this._gl.getUniformLocation(shaderProgram, 'uTexture')
          }
        }; // Here's where we call the routine that builds all the
        // objects we'll be drawing.

        const buffers = initBuffers(this._gl);

        let texture = this._gl.createTexture();

        this._gl.bindTexture(this._gl.TEXTURE_2D, texture);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.NEAREST);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.NEAREST);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);

        this._texture = texture;
        let deltaTime = -0.015;
        setInterval(() => {
          drawScene(this._gl, programInfo, buffers, deltaTime, width, height, this._texture);
        }, 33);
      }

      updateTexture(rgbabuf, width, height) {
        let gl = this._gl;
        let textunit = 3;
        gl.activeTexture(gl.TEXTURE0 + textunit);
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, // mip level
        gl.RGBA, // internal format
        width, // width
        height, // height
        0, // border
        gl.RGBA, // format
        gl.UNSIGNED_BYTE, // type
        rgbabuf);
      }

      getRGBA() {
        var pixels = new Uint8Array(this._width * this._height * 4);

        this._gl.readPixels(0, 0, this._width, this._height, this._gl.RGBA, this._gl.UNSIGNED_BYTE, pixels);

        return pixels;
      }

    }

    function initBuffers(gl) {
      // Create a buffer for the cube's vertex positions.
      const positionBuffer = gl.createBuffer(); // Select the positionBuffer as the one to apply buffer
      // operations to from here out.

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // Now create an array of positions for the cube.

      const positions = [// Front face
      -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, // Back face
      1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, // Top face
      -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, // Bottom face
      -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // Right face
      1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, // Left face
      -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0]; // Now pass the list of positions into WebGL to build the
      // shape. We do this by creating a Float32Array from the
      // JavaScript array, then use it to fill the current buffer.

      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW); // Now set up the colors for the faces. We'll use solid colors
      // for each face.
      //   const facePos = [
      //     [0.0,  0.0],  
      //     [1.0,  0.0], 
      //     [1.0,  1.0],    
      //     [0.0,  1.0]  
      //   ];

      const facePos = [[1.0, 0.0], [0.0, 0.0], [0.0, 1.0], [1.0, 1.0]]; // Convert the array of colors into a table for all the vertices.

      var texturePos = [];
      texturePos = texturePos.concat(...facePos, ...facePos, ...facePos, ...facePos, ...facePos, ...facePos);
      const texpositionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texpositionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturePos), gl.STATIC_DRAW); // Build the element array buffer; this specifies the indices
      // into the vertex arrays for each face's vertices.

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); // This array defines each face as two triangles, using the
      // indices into the vertex array to specify each triangle's
      // position.

      const indices = [0, 1, 2, 0, 2, 3, // front
      4, 5, 6, 4, 6, 7, // back
      8, 9, 10, 8, 10, 11, // top
      12, 13, 14, 12, 14, 15, // bottom
      16, 17, 18, 16, 18, 19, // right
      20, 21, 22, 20, 22, 23 // left
      ]; // Now send the element array to GL

      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
      return {
        position: positionBuffer,
        texposition: texpositionBuffer,
        indices: indexBuffer
      };
    }

    function drawScene(gl, programInfo, buffers, deltaTime, width, height, texture) {
      gl.viewport(0, 0, width, height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque

      gl.clearDepth(1.0); // Clear everything

      gl.enable(gl.DEPTH_TEST); // Enable depth testing

      gl.depthFunc(gl.LEQUAL); // Near things obscure far things
      // Clear the canvas before we start drawing on it.

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Create a perspective matrix, a special matrix that is
      // used to simulate the distortion of perspective in a camera.
      // Our field of view is 45 degrees, with a width/height
      // ratio that matches the display size of the canvas
      // and we only want to see objects between 0.1 units
      // and 100 units away from the camera.

      const fieldOfView = 80 * Math.PI / 180; // in radians

      const aspect = width / height;
      const zNear = 0.1;
      const zFar = 100.0;
      const projectionMatrix = create$1(); // note: glmatrix.js always has the first argument
      // as the destination to receive the result.

      perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar); //   mat4.ortho(projectionMatrix, -1, 1, -1, 1, zNear, zFar);                 
      // Set the drawing position to the "identity" point, which is
      // the center of the scene.

      const modelMatrix = create$1(); // Now move the drawing position a bit to where we want to
      // start drawing the square.
      //   mat4.translate(modelMatrix,     // destination matrix
      //                 modelMatrix,     // matrix to translate
      //                  [-0.0, 0.0, -6.0]);  // amount to translate
      //   mat4.rotate(modelMatrix,  // destination matrix
      //               modelMatrix,  // matrix to rotate
      //               cubeRotation,     // amount to rotate in radians
      //               [0, 0, 1]);       // axis to rotate around (Z)

      rotate(modelMatrix, // destination matrix
      modelMatrix, // matrix to rotate
      cubeRotation * .7, // amount to rotate in radians
      [0, 1, 0]); // axis to rotate around (X)

      const viewMatrix = create$1();
      lookAt(viewMatrix, fromValues(0, 2, 3), fromValues(0, 0, 0), fromValues(0, 1, 0)); // Tell WebGL how to pull out the positions from the position
      // buffer into the vertexPosition attribute

      {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
      } // Tell WebGL how to pull out the colors from the color buffer
      // into the vertexColor attribute.

      {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texposition);
        gl.vertexAttribPointer(programInfo.attribLocations.texturePosition, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.texturePosition);
      }
      let textunit = 2;
      gl.activeTexture(gl.TEXTURE0 + textunit);
      gl.bindTexture(gl.TEXTURE_2D, texture); // Tell WebGL which indices to use to index the vertices

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices); // Tell WebGL to use our program when drawing

      gl.useProgram(programInfo.program); // Set the shader uniforms

      gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
      gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, modelMatrix);
      gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix);
      gl.uniform1i(programInfo.uniformLocations.texture, textunit);
      {
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
      } // Update the rotation for the next draw

      cubeRotation += deltaTime;
    } //
    // Initialize a shader program, so WebGL knows how to draw our data
    //


    function initShaderProgram(gl, vsSource, fsSource) {
      const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
      const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource); // Create the shader program

      const shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram); // If creating the shader program failed, alert

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
      }

      return shaderProgram;
    } //
    // creates a shader of the given type, uploads the source and
    // compiles it.
    //


    function loadShader(gl, type, source) {
      const shader = gl.createShader(type); // Send the source to the shader object

      gl.shaderSource(shader, source); // Compile the shader program

      gl.compileShader(shader); // See if it compiled successfully

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }

    function createContextGL($canvas) {
      let gl = null;
      const validContextNames = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"];
      let nameIndex = 0;

      while (!gl && nameIndex < validContextNames.length) {
        const contextName = validContextNames[nameIndex];

        try {
          let contextOptions = {
            preserveDrawingBuffer: true
          };
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

      updateTexture(rgbabuf, width, height) {
        this._render.updateTexture(rgbabuf, width, height);
      }

    }

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
        this._webglrender = new WebGLRender($canvasElement, $canvasElement.width, $canvasElement.height);
      }

      updateTexture(rgbabuf, width, height) {
        this._webglrender.updateTexture(rgbabuf, width, height);
      }

    }

    const DEFAULT_PLAYER_OPTIONS = {
      url: '',
      container: ''
    };

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

    return AVPlayer;

}));
//# sourceMappingURL=avplayer.js.map
