(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.avplayer = factory());
})(this, (function () { 'use strict';

    class BaseRender {
      constructor() {}

      destroy() {}

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
     * Generates a orthogonal projection matrix with the given bounds.
     * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
     * which matches WebGL/OpenGL's clip volume.
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {number} left Left bound of the frustum
     * @param {number} right Right bound of the frustum
     * @param {number} bottom Bottom bound of the frustum
     * @param {number} top Top bound of the frustum
     * @param {number} near Near bound of the frustum
     * @param {number} far Far bound of the frustum
     * @returns {mat4} out
     */

    function orthoNO(out, left, right, bottom, top, near, far) {
      var lr = 1 / (left - right);
      var bt = 1 / (bottom - top);
      var nf = 1 / (near - far);
      out[0] = -2 * lr;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = -2 * bt;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 2 * nf;
      out[11] = 0;
      out[12] = (left + right) * lr;
      out[13] = (top + bottom) * bt;
      out[14] = (far + near) * nf;
      out[15] = 1;
      return out;
    }
    /**
     * Alias for {@link mat4.orthoNO}
     * @function
     */

    var ortho = orthoNO;
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

    const PixelType = {
      YUV: 0x1,
      RGBA: 0x2
    };
    const WORKER_SEND_TYPE = {
      init: 'init',
      setVideoCodec: 'setVideoCodec',
      decodeVideo: 'decodeVideo',
      setAudioCodec: 'setAudioCodec',
      decodeAudio: 'decodeAudio',
      reset: 'reset',
      destroy: 'destroy'
    };
    const WORKER_EVENT_TYPE = {
      created: 'created',
      inited: 'inited',
      reseted: 'reseted',
      destroyed: 'destroyed',
      videoInfo: 'videoInfo',
      yuvData: 'yuvData',
      audioInfo: 'audioInfo',
      pcmData: 'pcmData'
    };

    const vsSource$3 = `
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

    const fsSource$3 = `
precision highp float;
varying highp vec2 vTexturePosition;
uniform int isyuv;
uniform sampler2D rgbaTexture; 
uniform sampler2D yTexture; 
uniform sampler2D uTexture; 
uniform sampler2D vTexture; 

const mat4 YUV2RGB = mat4( 1.1643828125, 0, 1.59602734375, -.87078515625,
                           1.1643828125, -.39176171875, -.81296875, .52959375,
                           1.1643828125, 2.017234375, 0, -1.081390625,
                           0, 0, 0, 1);


void main(void) {

    if (isyuv>0) {

        highp float y = texture2D(yTexture,  vTexturePosition).r;
        highp float u = texture2D(uTexture,  vTexturePosition).r;
        highp float v = texture2D(vTexture,  vTexturePosition).r;
        gl_FragColor = vec4(y, u, v, 1) * YUV2RGB;

    } else {
        gl_FragColor =  texture2D(rgbaTexture, vTexturePosition);
    }
}
`;
    var cubeRotation = 0.0;

    class CubeRender extends BaseRender {
      _gl = undefined;
      _width = 0;
      _height = 0;
      _pixeltype = PixelType.YUV;
      _timer = undefined;

      constructor(gl, width, height) {
        super();
        this._width = width;
        this._height = height;
        this._gl = gl;

        this._gl.pixelStorei(this._gl.UNPACK_ALIGNMENT, 1);

        const shaderProgram = initShaderProgram$3(this._gl, vsSource$3, fsSource$3);
        this._programInfo = {
          program: shaderProgram,
          attribLocations: {
            vertexPosition: this._gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            texturePosition: this._gl.getAttribLocation(shaderProgram, 'aTexturePosition')
          },
          uniformLocations: {
            projectionMatrix: this._gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelMatrix: this._gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
            viewMatrix: this._gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
            rgbatexture: this._gl.getUniformLocation(shaderProgram, 'rgbaTexture'),
            ytexture: this._gl.getUniformLocation(shaderProgram, 'yTexture'),
            utexture: this._gl.getUniformLocation(shaderProgram, 'uTexture'),
            vtexture: this._gl.getUniformLocation(shaderProgram, 'vTexture'),
            isyuv: this._gl.getUniformLocation(shaderProgram, 'isyuv')
          }
        }; // Here's where we call the routine that builds all the
        // objects we'll be drawing.

        this._buffers = initBuffers$3(this._gl);
        this._rgbatexture = this.createTexture();
        this._ytexture = this.createTexture();
        this._utexture = this.createTexture();
        this._vtexture = this.createTexture();
        let deltaTime = -0.03;
        this._timer = setInterval(() => {
          this.drawScene(this._programInfo, this._buffers, deltaTime);
        }, 33);
      }

      destroy() {
        if (this._timer) {
          clearInterval(this._timer);
          this._timer = undefined;
        }

        this._gl.deleteProgram(this._programInfo.program);

        this._gl.deleteBuffer(this._buffers.position);

        this._gl.deleteBuffer(this._buffers.texposition);

        this._gl.deleteBuffer(this._buffers.indices);

        this._gl.deleteTexture(this._rgbatexture);

        this._gl.deleteTexture(this._ytexture);

        this._gl.deleteTexture(this._utexture);

        this._gl.deleteTexture(this._vtexture);

        super.destroy();
      }

      createTexture() {
        let texture = this._gl.createTexture();

        this._gl.bindTexture(this._gl.TEXTURE_2D, texture);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);

        return texture;
      }

      updateTexture(pixeltype, pixelbuf, width, height) {
        let gl = this._gl;
        this._pixeltype = pixeltype;

        if (pixeltype === PixelType.RGBA) {
          let textunit = 3;
          gl.activeTexture(gl.TEXTURE0 + textunit);
          gl.bindTexture(gl.TEXTURE_2D, this._rgbatexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, // mip level
          gl.RGBA, // internal format
          width, // width
          height, // height
          0, // border
          gl.RGBA, // format
          gl.UNSIGNED_BYTE, // type
          pixelbuf);
        } else if (pixeltype === PixelType.YUV) {
          let y = pixelbuf.slice(0, width * height);
          let u = pixelbuf.slice(width * height, width * height * 5 / 4);
          let v = pixelbuf.slice(width * height * 5 / 4, width * height * 3 / 2);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, this._ytexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, y);
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, this._utexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width / 2, height / 2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, u);
          gl.activeTexture(gl.TEXTURE2);
          gl.bindTexture(gl.TEXTURE_2D, this._vtexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width / 2, height / 2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, v);
        } else ;
      }

      drawScene(programInfo, buffers, deltaTime) {
        let gl = this._gl;
        gl.viewport(0, 0, this._width, this._height);
        gl.clearColor(0.0, 0.0, 0.0, 0.0); // Clear to black, fully opaque

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

        const aspect = this._width / this._height;
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
        let rgbatextunit = 2;
        let ytextunit = rgbatextunit + 1;
        let utextunit = rgbatextunit + 2;
        let vtextunit = rgbatextunit + 3;

        if (this._pixeltype === PixelType.YUV) {
          gl.activeTexture(gl.TEXTURE0 + ytextunit);
          gl.bindTexture(gl.TEXTURE_2D, this._ytexture);
          gl.activeTexture(gl.TEXTURE0 + utextunit);
          gl.bindTexture(gl.TEXTURE_2D, this._utexture);
          gl.activeTexture(gl.TEXTURE0 + vtextunit);
          gl.bindTexture(gl.TEXTURE_2D, this._vtexture);
        } else {
          gl.activeTexture(gl.TEXTURE0 + rgbatextunit);
          gl.bindTexture(gl.TEXTURE_2D, this._rgbatexture);
        } // Tell WebGL which indices to use to index the vertices


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices); // Tell WebGL to use our program when drawing

        gl.useProgram(programInfo.program); // Set the shader uniforms

        gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, modelMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix);
        gl.uniform1i(programInfo.uniformLocations.rgbatexture, rgbatextunit);
        gl.uniform1i(programInfo.uniformLocations.ytexture, ytextunit);
        gl.uniform1i(programInfo.uniformLocations.utexture, utextunit);
        gl.uniform1i(programInfo.uniformLocations.vtexture, vtextunit);
        gl.uniform1i(programInfo.uniformLocations.isyuv, this._pixeltype === PixelType.YUV ? 1 : 0);
        {
          const vertexCount = 36;
          const type = gl.UNSIGNED_SHORT;
          const offset = 0;
          gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        } // Update the rotation for the next draw

        cubeRotation += deltaTime;
      }

      getRGBA() {
        var pixels = new Uint8Array(this._width * this._height * 4);

        this._gl.readPixels(0, 0, this._width, this._height, this._gl.RGBA, this._gl.UNSIGNED_BYTE, pixels);

        return pixels;
      }

    }

    function initBuffers$3(gl) {
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
    } //
    // Initialize a shader program, so WebGL knows how to draw our data
    //


    function initShaderProgram$3(gl, vsSource, fsSource) {
      const vertexShader = loadShader$3(gl, gl.VERTEX_SHADER, vsSource);
      const fragmentShader = loadShader$3(gl, gl.FRAGMENT_SHADER, fsSource); // Create the shader program

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


    function loadShader$3(gl, type, source) {
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

    const vsSource$2 = `
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

    const fsSource$2 = `
precision highp float;
varying highp vec2 vTexturePosition;
uniform int isyuv;
uniform sampler2D rgbaTexture; 
uniform sampler2D yTexture; 
uniform sampler2D uTexture; 
uniform sampler2D vTexture; 

const mat4 YUV2RGB = mat4( 1.1643828125, 0, 1.59602734375, -.87078515625,
                           1.1643828125, -.39176171875, -.81296875, .52959375,
                           1.1643828125, 2.017234375, 0, -1.081390625,
                           0, 0, 0, 1);


void main(void) {

    if (isyuv>0) {

        highp float y = texture2D(yTexture,  vTexturePosition).r;
        highp float u = texture2D(uTexture,  vTexturePosition).r;
        highp float v = texture2D(vTexture,  vTexturePosition).r;
        gl_FragColor = vec4(y, u, v, 1) * YUV2RGB;

    } else {
        gl_FragColor =  texture2D(rgbaTexture, vTexturePosition);
    }
}
`;

    class RectRender extends BaseRender {
      _gl = undefined;
      _width = 0;
      _height = 0;
      _pixeltype = PixelType.YUV;
      _textureWidth = 0;
      _textureHeight = 0;
      _programInfo = undefined;
      _buffers = undefined;

      constructor(gl, width, height) {
        super();
        this._width = width;
        this._height = height;
        this._gl = gl;

        this._gl.pixelStorei(this._gl.UNPACK_ALIGNMENT, 1);

        const shaderProgram = initShaderProgram$2(this._gl, vsSource$2, fsSource$2);
        this._programInfo = {
          program: shaderProgram,
          attribLocations: {
            vertexPosition: this._gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            texturePosition: this._gl.getAttribLocation(shaderProgram, 'aTexturePosition')
          },
          uniformLocations: {
            projectionMatrix: this._gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelMatrix: this._gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
            viewMatrix: this._gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
            rgbatexture: this._gl.getUniformLocation(shaderProgram, 'rgbaTexture'),
            ytexture: this._gl.getUniformLocation(shaderProgram, 'yTexture'),
            utexture: this._gl.getUniformLocation(shaderProgram, 'uTexture'),
            vtexture: this._gl.getUniformLocation(shaderProgram, 'vTexture'),
            isyuv: this._gl.getUniformLocation(shaderProgram, 'isyuv')
          }
        }; // Here's where we call the routine that builds all the
        // objects we'll be drawing.

        this._buffers = initBuffers$2(this._gl);
        this._rgbatexture = this.createTexture();
        this._ytexture = this.createTexture();
        this._utexture = this.createTexture();
        this._vtexture = this.createTexture();
      }

      destroy() {
        this._gl.deleteProgram(this._programInfo.program);

        this._gl.deleteBuffer(this._buffers.position);

        this._gl.deleteBuffer(this._buffers.texposition);

        this._gl.deleteBuffer(this._buffers.indices);

        this._gl.deleteTexture(this._rgbatexture);

        this._gl.deleteTexture(this._ytexture);

        this._gl.deleteTexture(this._utexture);

        this._gl.deleteTexture(this._vtexture);

        super.destroy();
      }

      createTexture() {
        let texture = this._gl.createTexture();

        this._gl.bindTexture(this._gl.TEXTURE_2D, texture);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);

        return texture;
      }

      updateTexture(pixeltype, pixelbuf, width, height) {
        let gl = this._gl;
        this._pixeltype = pixeltype;
        this._textureWidth = width;
        this._textureHeight = height;

        if (pixeltype === PixelType.RGBA) {
          let textunit = 3;
          gl.activeTexture(gl.TEXTURE0 + textunit);
          gl.bindTexture(gl.TEXTURE_2D, this._rgbatexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, // mip level
          gl.RGBA, // internal format
          width, // width
          height, // height
          0, // border
          gl.RGBA, // format
          gl.UNSIGNED_BYTE, // type
          pixelbuf);
        } else if (pixeltype === PixelType.YUV) {
          let y = pixelbuf.slice(0, width * height);
          let u = pixelbuf.slice(width * height, width * height * 5 / 4);
          let v = pixelbuf.slice(width * height * 5 / 4, width * height * 3 / 2);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, this._ytexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, y);
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, this._utexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width / 2, height / 2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, u);
          gl.activeTexture(gl.TEXTURE2);
          gl.bindTexture(gl.TEXTURE_2D, this._vtexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width / 2, height / 2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, v);
        } else {
          return;
        }

        this.drawScene();
      }

      drawScene() {
        let gl = this._gl;

        if (this._textureWidth === 0 || this._textureHeight === 0) {
          gl.viewport(0, 0, this._width, this._height);
        } else {
          if (this._textureWidth / this._textureHeight > this._width / this._height) {
            let adjustHeight = this._textureHeight * this._width / this._textureWidth;
            gl.viewport(0, (this._height - adjustHeight) / 2, this._width, adjustHeight);
          } else {
            let adjustWidth = this._textureWidth * this._height / this._textureHeight;
            gl.viewport((this._width - adjustWidth) / 2, 0, adjustWidth, this._height);
          }
        }

        gl.clearColor(0.0, 0.0, 0.0, 0.0); // Clear to black, fully opaque

        gl.clearDepth(1.0); // Clear everything

        gl.enable(gl.DEPTH_TEST); // Enable depth testing

        gl.depthFunc(gl.LEQUAL); // Near things obscure far things
        // Clear the canvas before we start drawing on it.

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = create$1();
        ortho(projectionMatrix, -1, 1, -1, 1, zNear, zFar); // Set the drawing position to the "identity" point, which is
        // the center of the scene.

        const modelMatrix = create$1();
        identity(modelMatrix);
        const viewMatrix = create$1();
        lookAt(viewMatrix, fromValues(0, 0, 0), fromValues(0, 0, -1), fromValues(0, 1, 0)); // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute

        {
          const numComponents = 3;
          const type = gl.FLOAT;
          const normalize = false;
          const stride = 0;
          const offset = 0;
          gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.position);
          gl.vertexAttribPointer(this._programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
          gl.enableVertexAttribArray(this._programInfo.attribLocations.vertexPosition);
        } // Tell WebGL how to pull out the colors from the color buffer
        // into the vertexColor attribute.

        {
          const numComponents = 2;
          const type = gl.FLOAT;
          const normalize = false;
          const stride = 0;
          const offset = 0;
          gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.texposition);
          gl.vertexAttribPointer(this._programInfo.attribLocations.texturePosition, numComponents, type, normalize, stride, offset);
          gl.enableVertexAttribArray(this._programInfo.attribLocations.texturePosition);
        }
        let rgbatextunit = 2;
        let ytextunit = rgbatextunit + 1;
        let utextunit = rgbatextunit + 2;
        let vtextunit = rgbatextunit + 3;

        if (this._pixeltype === PixelType.YUV) {
          gl.activeTexture(gl.TEXTURE0 + ytextunit);
          gl.bindTexture(gl.TEXTURE_2D, this._ytexture);
          gl.activeTexture(gl.TEXTURE0 + utextunit);
          gl.bindTexture(gl.TEXTURE_2D, this._utexture);
          gl.activeTexture(gl.TEXTURE0 + vtextunit);
          gl.bindTexture(gl.TEXTURE_2D, this._vtexture);
        } else {
          gl.activeTexture(gl.TEXTURE0 + rgbatextunit);
          gl.bindTexture(gl.TEXTURE_2D, this._rgbatexture);
        } // Tell WebGL which indices to use to index the vertices


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffers.indices); // Tell WebGL to use our program when drawing

        gl.useProgram(this._programInfo.program); // Set the shader uniforms

        gl.uniformMatrix4fv(this._programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(this._programInfo.uniformLocations.modelMatrix, false, modelMatrix);
        gl.uniformMatrix4fv(this._programInfo.uniformLocations.viewMatrix, false, viewMatrix);
        gl.uniform1i(this._programInfo.uniformLocations.rgbatexture, rgbatextunit);
        gl.uniform1i(this._programInfo.uniformLocations.ytexture, ytextunit);
        gl.uniform1i(this._programInfo.uniformLocations.utexture, utextunit);
        gl.uniform1i(this._programInfo.uniformLocations.vtexture, vtextunit);
        gl.uniform1i(this._programInfo.uniformLocations.isyuv, this._pixeltype === PixelType.YUV ? 1 : 0);
        {
          const vertexCount = 6;
          const type = gl.UNSIGNED_SHORT;
          const offset = 0;
          gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        } // Update the rotation for the next draw
      }

      getRGBA() {
        var pixels = new Uint8Array(this._width * this._height * 4);

        this._gl.readPixels(0, 0, this._width, this._height, this._gl.RGBA, this._gl.UNSIGNED_BYTE, pixels);

        return pixels;
      }

    }

    function initBuffers$2(gl) {
      // Create a buffer for the cube's vertex positions.
      const positionBuffer = gl.createBuffer(); // Select the positionBuffer as the one to apply buffer
      // operations to from here out.

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // Now create an array of positions for the cube.

      const positions = [// Front face
      -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0]; // Now pass the list of positions into WebGL to build the
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

      const facePos = [[0.0, 1.0], [1.0, 1.0], [1.0, 0.0], [0.0, 0.0]]; // Convert the array of colors into a table for all the vertices.

      var texturePos = [];
      texturePos = texturePos.concat(...facePos);
      const texpositionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texpositionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturePos), gl.STATIC_DRAW); // Build the element array buffer; this specifies the indices
      // into the vertex arrays for each face's vertices.

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); // This array defines each face as two triangles, using the
      // indices into the vertex array to specify each triangle's
      // position.

      const indices = [0, 1, 2, 0, 2, 3]; // Now send the element array to GL

      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
      return {
        position: positionBuffer,
        texposition: texpositionBuffer,
        indices: indexBuffer
      };
    } //
    // Initialize a shader program, so WebGL knows how to draw our data
    //


    function initShaderProgram$2(gl, vsSource, fsSource) {
      const vertexShader = loadShader$2(gl, gl.VERTEX_SHADER, vsSource);
      const fragmentShader = loadShader$2(gl, gl.FRAGMENT_SHADER, fsSource); // Create the shader program

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


    function loadShader$2(gl, type, source) {
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

    const vsSource$1 = `
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

    const fsSource$1 = `
precision highp float;
varying highp vec2 vTexturePosition;
uniform int isyuv;
uniform sampler2D rgbaTexture; 
uniform sampler2D yTexture; 
uniform sampler2D uTexture; 
uniform sampler2D vTexture; 

const mat4 YUV2RGB = mat4( 1.1643828125, 0, 1.59602734375, -.87078515625,
                           1.1643828125, -.39176171875, -.81296875, .52959375,
                           1.1643828125, 2.017234375, 0, -1.081390625,
                           0, 0, 0, 1);


void main(void) {

    vec4 color;
    vec4 alphacolor;

    if (isyuv>0) {

        highp float y = texture2D(yTexture,  vTexturePosition).r;
        highp float u = texture2D(uTexture,  vTexturePosition).r;
        highp float v = texture2D(vTexture,  vTexturePosition).r;
        color = vec4(y, u, v, 1) * YUV2RGB;

        highp float y1 = texture2D(yTexture,  vTexturePosition + vec2(0.5, 0)).r;
        highp float u1 = texture2D(uTexture,  vTexturePosition + vec2(0.5, 0)).r;
        highp float v1 = texture2D(vTexture,  vTexturePosition + vec2(0.5, 0)).r;
        alphacolor = vec4(y1, u1, v1, 1) * YUV2RGB;

    } else {
      
        color =   texture2D(uTexture, vTexturePosition);
        alphacolor =   texture2D(uTexture, vTexturePosition + vec2(0.5, 0));

    }

    color.a = alphacolor.r;
    gl_FragColor = color;
}
`;

    class RectMaskRender extends BaseRender {
      _gl = undefined;
      _width = 0;
      _height = 0;
      _pixeltype = PixelType.YUV;
      _textureWidth = 0;
      _textureHeight = 0;
      _programInfo = undefined;
      _buffers = undefined;

      constructor(gl, width, height) {
        super();
        this._width = width;
        this._height = height;
        this._gl = gl;

        this._gl.pixelStorei(this._gl.UNPACK_ALIGNMENT, 1);

        const shaderProgram = initShaderProgram$1(this._gl, vsSource$1, fsSource$1);
        this._programInfo = {
          program: shaderProgram,
          attribLocations: {
            vertexPosition: this._gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            texturePosition: this._gl.getAttribLocation(shaderProgram, 'aTexturePosition')
          },
          uniformLocations: {
            projectionMatrix: this._gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelMatrix: this._gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
            viewMatrix: this._gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
            rgbatexture: this._gl.getUniformLocation(shaderProgram, 'rgbaTexture'),
            ytexture: this._gl.getUniformLocation(shaderProgram, 'yTexture'),
            utexture: this._gl.getUniformLocation(shaderProgram, 'uTexture'),
            vtexture: this._gl.getUniformLocation(shaderProgram, 'vTexture'),
            isyuv: this._gl.getUniformLocation(shaderProgram, 'isyuv')
          }
        }; // Here's where we call the routine that builds all the
        // objects we'll be drawing.

        this._buffers = initBuffers$1(this._gl);
        this._rgbatexture = this.createTexture();
        this._ytexture = this.createTexture();
        this._utexture = this.createTexture();
        this._vtexture = this.createTexture();
      }

      destroy() {
        this._gl.deleteProgram(this._programInfo.program);

        this._gl.deleteBuffer(this._buffers.position);

        this._gl.deleteBuffer(this._buffers.texposition);

        this._gl.deleteBuffer(this._buffers.indices);

        this._gl.deleteTexture(this._rgbatexture);

        this._gl.deleteTexture(this._ytexture);

        this._gl.deleteTexture(this._utexture);

        this._gl.deleteTexture(this._vtexture);

        super.destroy();
      }

      createTexture() {
        let texture = this._gl.createTexture();

        this._gl.bindTexture(this._gl.TEXTURE_2D, texture);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);

        return texture;
      }

      updateTexture(pixeltype, pixelbuf, width, height) {
        let gl = this._gl;
        this._pixeltype = pixeltype;
        this._textureWidth = width / 2;
        this._textureHeight = height;

        if (pixeltype === PixelType.RGBA) {
          let textunit = 3;
          gl.activeTexture(gl.TEXTURE0 + textunit);
          gl.bindTexture(gl.TEXTURE_2D, this._rgbatexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, // mip level
          gl.RGBA, // internal format
          width, // width
          height, // height
          0, // border
          gl.RGBA, // format
          gl.UNSIGNED_BYTE, // type
          pixelbuf);
        } else if (pixeltype === PixelType.YUV) {
          let y = pixelbuf.slice(0, width * height);
          let u = pixelbuf.slice(width * height, width * height * 5 / 4);
          let v = pixelbuf.slice(width * height * 5 / 4, width * height * 3 / 2);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, this._ytexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, y);
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, this._utexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width / 2, height / 2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, u);
          gl.activeTexture(gl.TEXTURE2);
          gl.bindTexture(gl.TEXTURE_2D, this._vtexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width / 2, height / 2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, v);
        } else {
          return;
        }

        this.drawScene();
      }

      drawScene() {
        let gl = this._gl;
        gl.viewport(0, 0, this._width, this._height);
        gl.clearColor(0.0, 0.0, 0.0, 0.0); // Clear to black, fully opaque

        gl.clearDepth(1.0); // Clear everything

        gl.enable(gl.DEPTH_TEST); // Enable depth testing

        gl.depthFunc(gl.LEQUAL); // Near things obscure far things
        // Clear the canvas before we start drawing on it.

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (this._textureWidth === 0 || this._textureHeight === 0) {
          gl.viewport(0, 0, this._width, this._height);
        } else {
          if (this._textureWidth / this._textureHeight > this._width / this._height) {
            let adjustHeight = this._textureHeight * this._width / this._textureWidth;
            gl.viewport(0, (this._height - adjustHeight) / 2, this._width, adjustHeight);
          } else {
            let adjustWidth = this._textureWidth * this._height / this._textureHeight;
            gl.viewport((this._width - adjustWidth) / 2, 0, adjustWidth, this._height);
          }
        }

        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = create$1();
        ortho(projectionMatrix, -1, 1, -1, 1, zNear, zFar); // Set the drawing position to the "identity" point, which is
        // the center of the scene.

        const modelMatrix = create$1();
        identity(modelMatrix);
        const viewMatrix = create$1();
        lookAt(viewMatrix, fromValues(0, 0, 0), fromValues(0, 0, -1), fromValues(0, 1, 0)); // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute

        {
          const numComponents = 3;
          const type = gl.FLOAT;
          const normalize = false;
          const stride = 0;
          const offset = 0;
          gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.position);
          gl.vertexAttribPointer(this._programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
          gl.enableVertexAttribArray(this._programInfo.attribLocations.vertexPosition);
        } // Tell WebGL how to pull out the colors from the color buffer
        // into the vertexColor attribute.

        {
          const numComponents = 2;
          const type = gl.FLOAT;
          const normalize = false;
          const stride = 0;
          const offset = 0;
          gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.texposition);
          gl.vertexAttribPointer(this._programInfo.attribLocations.texturePosition, numComponents, type, normalize, stride, offset);
          gl.enableVertexAttribArray(this._programInfo.attribLocations.texturePosition);
        }
        let rgbatextunit = 2;
        let ytextunit = rgbatextunit + 1;
        let utextunit = rgbatextunit + 2;
        let vtextunit = rgbatextunit + 3;

        if (this._pixeltype === PixelType.YUV) {
          gl.activeTexture(gl.TEXTURE0 + ytextunit);
          gl.bindTexture(gl.TEXTURE_2D, this._ytexture);
          gl.activeTexture(gl.TEXTURE0 + utextunit);
          gl.bindTexture(gl.TEXTURE_2D, this._utexture);
          gl.activeTexture(gl.TEXTURE0 + vtextunit);
          gl.bindTexture(gl.TEXTURE_2D, this._vtexture);
        } else {
          gl.activeTexture(gl.TEXTURE0 + rgbatextunit);
          gl.bindTexture(gl.TEXTURE_2D, this._rgbatexture);
        } // Tell WebGL which indices to use to index the vertices


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffers.indices); // Tell WebGL to use our program when drawing

        gl.useProgram(this._programInfo.program); // Set the shader uniforms

        gl.uniformMatrix4fv(this._programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(this._programInfo.uniformLocations.modelMatrix, false, modelMatrix);
        gl.uniformMatrix4fv(this._programInfo.uniformLocations.viewMatrix, false, viewMatrix);
        gl.uniform1i(this._programInfo.uniformLocations.rgbatexture, rgbatextunit);
        gl.uniform1i(this._programInfo.uniformLocations.ytexture, ytextunit);
        gl.uniform1i(this._programInfo.uniformLocations.utexture, utextunit);
        gl.uniform1i(this._programInfo.uniformLocations.vtexture, vtextunit);
        gl.uniform1i(this._programInfo.uniformLocations.isyuv, this._pixeltype === PixelType.YUV ? 1 : 0);
        {
          const vertexCount = 6;
          const type = gl.UNSIGNED_SHORT;
          const offset = 0;
          gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        } // Update the rotation for the next draw
      }

      getRGBA() {
        var pixels = new Uint8Array(this._width * this._height * 4);

        this._gl.readPixels(0, 0, this._width, this._height, this._gl.RGBA, this._gl.UNSIGNED_BYTE, pixels);

        return pixels;
      }

    }

    function initBuffers$1(gl) {
      // Create a buffer for the cube's vertex positions.
      const positionBuffer = gl.createBuffer(); // Select the positionBuffer as the one to apply buffer
      // operations to from here out.

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); // Now create an array of positions for the cube.

      const positions = [// Front face
      -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0]; // Now pass the list of positions into WebGL to build the
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

      const facePos = [[0.0, 1.0], [0.5, 1.0], [0.5, 0.0], [0.0, 0.0]]; // Convert the array of colors into a table for all the vertices.

      var texturePos = [];
      texturePos = texturePos.concat(...facePos);
      const texpositionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texpositionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturePos), gl.STATIC_DRAW); // Build the element array buffer; this specifies the indices
      // into the vertex arrays for each face's vertices.

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); // This array defines each face as two triangles, using the
      // indices into the vertex array to specify each triangle's
      // position.

      const indices = [0, 1, 2, 0, 2, 3]; // Now send the element array to GL

      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
      return {
        position: positionBuffer,
        texposition: texpositionBuffer,
        indices: indexBuffer
      };
    } //
    // Initialize a shader program, so WebGL knows how to draw our data
    //


    function initShaderProgram$1(gl, vsSource, fsSource) {
      const vertexShader = loadShader$1(gl, gl.VERTEX_SHADER, vsSource);
      const fragmentShader = loadShader$1(gl, gl.FRAGMENT_SHADER, fsSource); // Create the shader program

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


    function loadShader$1(gl, type, source) {
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
precision highp float;
varying highp vec2 vTexturePosition;
uniform int isyuv;
uniform sampler2D rgbaTexture; 
uniform sampler2D yTexture; 
uniform sampler2D uTexture; 
uniform sampler2D vTexture; 

const mat4 YUV2RGB = mat4( 1.1643828125, 0, 1.59602734375, -.87078515625,
                           1.1643828125, -.39176171875, -.81296875, .52959375,
                           1.1643828125, 2.017234375, 0, -1.081390625,
                           0, 0, 0, 1);


void main(void) {

    vec4 color;

    if (isyuv>0) {

        highp float y = texture2D(yTexture,  vTexturePosition).r;
        highp float u = texture2D(uTexture,  vTexturePosition).r;
        highp float v = texture2D(vTexture,  vTexturePosition).r;
        color = vec4(y, u, v, 1) * YUV2RGB;
    } else {
        color =  texture2D(rgbaTexture, vTexturePosition);
    }

    if (color.g - color.r >= 0.15 && color.g - color.b >= 0.15) {
        gl_FragColor = vec4(color.r, (color.r + color.b) / 2.0, color.b, 1.0 - color.g);
    } else {
        gl_FragColor = vec4(color.r, color.g, color.b, color.a);
    }
}
`;

    class RectGreenRender extends BaseRender {
      _gl = undefined;
      _width = 0;
      _height = 0;
      _pixeltype = PixelType.YUV;
      _textureWidth = 0;
      _textureHeight = 0;
      _programInfo = undefined;
      _buffers = undefined;

      constructor(gl, width, height) {
        super();
        this._width = width;
        this._height = height;
        this._gl = gl;

        this._gl.pixelStorei(this._gl.UNPACK_ALIGNMENT, 1);

        const shaderProgram = initShaderProgram(this._gl, vsSource, fsSource);
        this._programInfo = {
          program: shaderProgram,
          attribLocations: {
            vertexPosition: this._gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            texturePosition: this._gl.getAttribLocation(shaderProgram, 'aTexturePosition')
          },
          uniformLocations: {
            projectionMatrix: this._gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelMatrix: this._gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
            viewMatrix: this._gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
            rgbatexture: this._gl.getUniformLocation(shaderProgram, 'rgbaTexture'),
            ytexture: this._gl.getUniformLocation(shaderProgram, 'yTexture'),
            utexture: this._gl.getUniformLocation(shaderProgram, 'uTexture'),
            vtexture: this._gl.getUniformLocation(shaderProgram, 'vTexture'),
            isyuv: this._gl.getUniformLocation(shaderProgram, 'isyuv')
          }
        }; // Here's where we call the routine that builds all the
        // objects we'll be drawing.

        this._buffers = initBuffers(this._gl);
        this._rgbatexture = this.createTexture();
        this._ytexture = this.createTexture();
        this._utexture = this.createTexture();
        this._vtexture = this.createTexture();
      }

      destroy() {
        this._gl.deleteProgram(this._programInfo.program);

        this._gl.deleteBuffer(this._buffers.position);

        this._gl.deleteBuffer(this._buffers.texposition);

        this._gl.deleteBuffer(this._buffers.indices);

        this._gl.deleteTexture(this._rgbatexture);

        this._gl.deleteTexture(this._ytexture);

        this._gl.deleteTexture(this._utexture);

        this._gl.deleteTexture(this._vtexture);

        super.destroy();
      }

      createTexture() {
        let texture = this._gl.createTexture();

        this._gl.bindTexture(this._gl.TEXTURE_2D, texture);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);

        return texture;
      }

      updateTexture(pixeltype, pixelbuf, width, height) {
        let gl = this._gl;
        this._pixeltype = pixeltype;
        this._textureWidth = width;
        this._textureHeight = height;

        if (pixeltype === PixelType.RGBA) {
          let textunit = 3;
          gl.activeTexture(gl.TEXTURE0 + textunit);
          gl.bindTexture(gl.TEXTURE_2D, this._rgbatexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, // mip level
          gl.RGBA, // internal format
          width, // width
          height, // height
          0, // border
          gl.RGBA, // format
          gl.UNSIGNED_BYTE, // type
          pixelbuf);
        } else if (pixeltype === PixelType.YUV) {
          let y = pixelbuf.slice(0, width * height);
          let u = pixelbuf.slice(width * height, width * height * 5 / 4);
          let v = pixelbuf.slice(width * height * 5 / 4, width * height * 3 / 2);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, this._ytexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, y);
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, this._utexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width / 2, height / 2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, u);
          gl.activeTexture(gl.TEXTURE2);
          gl.bindTexture(gl.TEXTURE_2D, this._vtexture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width / 2, height / 2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, v);
        } else {
          return;
        }

        this.drawScene();
      }

      drawScene() {
        let gl = this._gl;

        if (this._textureWidth === 0 || this._textureHeight === 0) {
          gl.viewport(0, 0, this._width, this._height);
        } else {
          if (this._textureWidth / this._textureHeight > this._width / this._height) {
            let adjustHeight = this._textureHeight * this._width / this._textureWidth;
            gl.viewport(0, (this._height - adjustHeight) / 2, this._width, adjustHeight);
          } else {
            let adjustWidth = this._textureWidth * this._height / this._textureHeight;
            gl.viewport((this._width - adjustWidth) / 2, 0, adjustWidth, this._height);
          }
        }

        gl.clearColor(0.0, 0.0, 0.0, 0.0); // Clear to black, fully opaque

        gl.clearDepth(1.0); // Clear everything

        gl.enable(gl.DEPTH_TEST); // Enable depth testing

        gl.depthFunc(gl.LEQUAL); // Near things obscure far things
        // Clear the canvas before we start drawing on it.

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = create$1();
        ortho(projectionMatrix, -1, 1, -1, 1, zNear, zFar); // Set the drawing position to the "identity" point, which is
        // the center of the scene.

        const modelMatrix = create$1();
        identity(modelMatrix);
        const viewMatrix = create$1();
        lookAt(viewMatrix, fromValues(0, 0, 0), fromValues(0, 0, -1), fromValues(0, 1, 0)); // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute

        {
          const numComponents = 3;
          const type = gl.FLOAT;
          const normalize = false;
          const stride = 0;
          const offset = 0;
          gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.position);
          gl.vertexAttribPointer(this._programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
          gl.enableVertexAttribArray(this._programInfo.attribLocations.vertexPosition);
        } // Tell WebGL how to pull out the colors from the color buffer
        // into the vertexColor attribute.

        {
          const numComponents = 2;
          const type = gl.FLOAT;
          const normalize = false;
          const stride = 0;
          const offset = 0;
          gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.texposition);
          gl.vertexAttribPointer(this._programInfo.attribLocations.texturePosition, numComponents, type, normalize, stride, offset);
          gl.enableVertexAttribArray(this._programInfo.attribLocations.texturePosition);
        }
        let rgbatextunit = 2;
        let ytextunit = rgbatextunit + 1;
        let utextunit = rgbatextunit + 2;
        let vtextunit = rgbatextunit + 3;

        if (this._pixeltype === PixelType.YUV) {
          gl.activeTexture(gl.TEXTURE0 + ytextunit);
          gl.bindTexture(gl.TEXTURE_2D, this._ytexture);
          gl.activeTexture(gl.TEXTURE0 + utextunit);
          gl.bindTexture(gl.TEXTURE_2D, this._utexture);
          gl.activeTexture(gl.TEXTURE0 + vtextunit);
          gl.bindTexture(gl.TEXTURE_2D, this._vtexture);
        } else {
          gl.activeTexture(gl.TEXTURE0 + rgbatextunit);
          gl.bindTexture(gl.TEXTURE_2D, this._rgbatexture);
        } // Tell WebGL which indices to use to index the vertices


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffers.indices); // Tell WebGL to use our program when drawing

        gl.useProgram(this._programInfo.program); // Set the shader uniforms

        gl.uniformMatrix4fv(this._programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(this._programInfo.uniformLocations.modelMatrix, false, modelMatrix);
        gl.uniformMatrix4fv(this._programInfo.uniformLocations.viewMatrix, false, viewMatrix);
        gl.uniform1i(this._programInfo.uniformLocations.rgbatexture, rgbatextunit);
        gl.uniform1i(this._programInfo.uniformLocations.ytexture, ytextunit);
        gl.uniform1i(this._programInfo.uniformLocations.utexture, utextunit);
        gl.uniform1i(this._programInfo.uniformLocations.vtexture, vtextunit);
        gl.uniform1i(this._programInfo.uniformLocations.isyuv, this._pixeltype === PixelType.YUV ? 1 : 0);
        {
          const vertexCount = 6;
          const type = gl.UNSIGNED_SHORT;
          const offset = 0;
          gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        } // Update the rotation for the next draw
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
      -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0]; // Now pass the list of positions into WebGL to build the
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

      const facePos = [[0.0, 1.0], [1.0, 1.0], [1.0, 0.0], [0.0, 0.0]]; // Convert the array of colors into a table for all the vertices.

      var texturePos = [];
      texturePos = texturePos.concat(...facePos);
      const texpositionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texpositionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturePos), gl.STATIC_DRAW); // Build the element array buffer; this specifies the indices
      // into the vertex arrays for each face's vertices.

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); // This array defines each face as two triangles, using the
      // indices into the vertex array to specify each triangle's
      // position.

      const indices = [0, 1, 2, 0, 2, 3]; // Now send the element array to GL

      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
      return {
        position: positionBuffer,
        texposition: texpositionBuffer,
        indices: indexBuffer
      };
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
      _player;
      _renderMode;
      _width;
      _height;

      constructor(player, canvas) {
        this._player = player;
        this._gl = createContextGL(canvas);
        this._width = canvas.width;
        this._height = canvas.height;
        this._renderMode = player._options.renderMode;
        this.createRender();
      }

      createRender() {
        if (this._render) {
          this._render.destroy();

          this._render = null;
        }

        switch (this._renderMode) {
          case "normal":
            {
              this._render = new RectRender(this._gl, this._width, this._height);
              break;
            }

          case "green":
            {
              this._render = new RectGreenRender(this._gl, this._width, this._height);
              break;
            }

          case "mask":
            {
              this._render = new RectMaskRender(this._gl, this._width, this._height);
              break;
            }

          case "cube":
            {
              this._render = new CubeRender(this._gl, this._width, this._height);
              break;
            }

          default:
            {
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

          this._render = null;
        }

        this._player._logger.info('WebGLRender', 'WebGLRender destroy');
      }

    }

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

        this._webglrender = new WebGLRender(player, canvasElement);
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

    class Logger {
      _logEnable = false;

      constructor() {}

      setLogEnable(logEnable) {
        this._logEnable = logEnable;
      }

      info(module) {
        if (this._logEnable) {
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          console.log(`AVPlayer: [${module}]`, ...args);
        }
      }

      warn(module) {
        if (this._logEnable) {
          for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
          }

          console.warn(`AVPlayer: [${module}]`, ...args);
        }
      }

      error(module) {
        if (this._logEnable) {
          for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
            args[_key3 - 1] = arguments[_key3];
          }

          console.error(`AVPlayer: [${module}]`, ...args);
        }
      }

    }

    class EventEmitter {
      on(name, fn, ctx) {
        const e = this.e || (this.e = {});
        (e[name] || (e[name] = [])).push({
          fn,
          ctx
        });
        return this;
      }

      once(name, fn, ctx) {
        const self = this;

        function listener() {
          self.off(name, listener);

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          fn.apply(ctx, args);
        }

        listener._ = fn;
        return this.on(name, listener, ctx);
      }

      emit(name) {
        const evtArr = ((this.e || (this.e = {}))[name] || []).slice();

        for (var _len2 = arguments.length, data = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          data[_key2 - 1] = arguments[_key2];
        }

        for (let i = 0; i < evtArr.length; i += 1) {
          evtArr[i].fn.apply(evtArr[i].ctx, data);
        }

        return this;
      }

      off(name, callback) {
        const e = this.e || (this.e = {});

        if (!name) {
          Object.keys(e).forEach(key => {
            delete e[key];
          });
          delete this.e;
          return;
        }

        const evts = e[name];
        const liveEvents = [];

        if (evts && callback) {
          for (let i = 0, len = evts.length; i < len; i += 1) {
            if (evts[i].fn !== callback && evts[i].fn._ !== callback) liveEvents.push(evts[i]);
          }
        }

        if (liveEvents.length) {
          e[name] = liveEvents;
        } else {
          delete e[name];
        }

        return this;
      }

    }

    const JitterBufferStatus = {
      notstart: 'notstart',
      //未开始
      bufferring: 'bufferring',
      //开始，等待缓冲满
      bufferReady: 'bufferReady' //buffer准备好了，可以播放了

    };
    const DispatchStrategy = {
      outAudioDriven: 'outAudioDriven',
      // 外部音频播放模块驱动，音画对齐效果最好
      outTimerDriven: 'outTimerDriven',
      // 外部定时器驱动，内部需要建立时钟对齐音画
      playVideoOnlyDriven: 'playVideoOnlyDriven' // 内部定时器驱动，该模式不播放声音，声音数据直接丢弃，内部需要建立时钟

    };
    const delayScale = 3.0;

    class JitterBuffer extends EventEmitter {
      _vgop = [];
      _agop = [];
      _status = JitterBufferStatus.notstart;
      _strategy = DispatchStrategy.outAudioDriven;
      _firstpacketts = undefined; //如果 _strategy是playVideoOnlyDriven，为video gop 的首帧ts，否则为 audio gop的首帧ts

      _firstts = undefined;
      _player = undefined;
      _playTimer = undefined;
      _statisticTimer = undefined;

      constructor(player) {
        super();
        this._player = player;
        this._statisticTimer = setInterval(() => {
          this._player._logger.info('jitterbuffer', `strategy ${this._strategy} video ${this._vgop.length} audio ${this._agop.length}`);
        }, 2000);
      }

      reset() {
        this._agop = [];
        this._vgop = [];

        if (this._playTimer) {
          clearInterval(this._playTimer);
          this._playTimer = undefined;
        }

        this._status = JitterBufferStatus.notstart;
        this._strategy = DispatchStrategy.outAudioDriven;
        this._firstpacketts = undefined;
        this._firstts = undefined;
      }

      destroy() {
        this.reset();

        if (this._statisticTimer) {
          clearInterval(this._statisticTimer);
        }

        this.off();

        this._player._logger.info('JitterBuffer', 'JitterBuffer destroy');
      }

      playVideoOnly() {
        this.changeStrategy(DispatchStrategy.playVideoOnlyDriven);
      }

      playVideoTicket() {
        if (this._strategy !== DispatchStrategy.playVideoOnlyDriven) {
          this._player._logger.error('jitterbuffer', `strategy [${this._strategy}] playVideoTicket not allowed, some error happen, please check logic`);

          return;
        }

        if (this._vgop.length < 1) {
          return;
        }

        let now = new Date().getTime();

        if (now - this._firstts < this._vgop[0].timestamp - this._firstpacketts) {
          return;
        }

        let yuvpacket = this._vgop.shift();

        this.emit('yuvdata', yuvpacket);
        this.updateJitterBufferState();
      }

      changeStrategy(strategy) {
        if (this._strategy === strategy) {
          return;
        }

        if (this._strategy === DispatchStrategy.playVideoOnlyDriven) {
          this._player._logger.warn('jitterbuffer', `changeStrategy ${strategy} not allowed, because cur strategy is play Video only`);

          return;
        }

        this._strategy = strategy;

        this._player._logger.info('jitterbuffer', `changeStrategy ${strategy} success`); //策略变化，jitterbuffer状态机从头开始跑一遍


        this._status = JitterBufferStatus.notstart;
        this.updateJitterBufferState();

        if (this._strategy === DispatchStrategy.playVideoOnlyDriven) {
          if (this._playTimer) {
            clearInterval(this._playTimer);
          }

          let sec = 40;
          this._playTimer = setInterval(() => {
            this.playVideoTicket();
          }, sec);

          this._player._logger.info('jitterbuffer', `strategy [${this._strategy}]  start play video timer ${1000 / sec} frames per second`);
        }
      }

      pushPCMData(datas, timestamp) {
        if (this._strategy === DispatchStrategy.playVideoOnlyDriven) {
          //声音直接丢弃
          return;
        }

        let pcmpacket = {
          datas,
          timestamp
        };

        this._agop.push(pcmpacket);

        this.updateJitterBufferState();
      }

      pushYUVData(data, timestamp, width, height) {
        let yuvpacket = {
          width,
          height,
          data,
          timestamp
        };

        this._vgop.push(yuvpacket);

        if (this._strategy === DispatchStrategy.playVideoOnlyDriven) {
          this.updateJitterBufferState();
        }
      }

      getPCMData(trust) {
        this.changeStrategy(trust ? DispatchStrategy.outAudioDriven : DispatchStrategy.outTimerDriven);

        if (this._strategy === DispatchStrategy.playVideoOnlyDriven) {
          this._player._logger.error('jitterbuffer', `strategy [${this._strategy}] getPCMData not allowed, some error happen, check the logic`);

          return;
        }

        if (this._status !== JitterBufferStatus.bufferReady || this._agop.length < 1) {
          return;
        }

        let now = new Date().getTime();

        if (this._strategy === DispatchStrategy.outTimerDriven && now - this._firstts < this._agop[0].timestamp - this._firstpacketts) {
          return;
        }

        let pcmpacket = this._agop.shift();

        this.syncVideo(pcmpacket.timestamp);
        this.updateJitterBufferState();
        return pcmpacket;
      }

      syncVideo(timestamp, drop) {
        let yuvpacket = undefined;
        let count = 0;

        while (1) {
          if (this._vgop.length < 1) {
            break;
          }

          if (this._vgop[0].timestamp > timestamp) {
            break;
          }

          yuvpacket = this._vgop.shift();
          count++;

          if (!drop) {
            this.emit('yuvdata', yuvpacket);
          }
        }

        return count;
      }

      updateJitterBufferState() {
        let ret = true;

        while (ret) {
          ret = this.tryUpdateJitterBufferState();
        }
      }

      tryUpdateJitterBufferState() {
        let gop = this._strategy === DispatchStrategy.playVideoOnlyDriven ? this._vgop : this._agop;

        if (this._status === JitterBufferStatus.notstart) {
          if (gop.length < 1) {
            return false;
          }

          this._status = JitterBufferStatus.bufferring;
          return true;
        } else if (this._status === JitterBufferStatus.bufferring) {
          if (gop.length < 2) {
            this._player._logger.warn('jitterbuffer', `strategy [${this._strategy}] now buffering, but gop len [${gop.length}] less than 2,`);

            return false;
          }

          if (gop[gop.length - 1].timestamp - gop[0].timestamp > this._player._options.delay) {
            this._firstpacketts = gop[0].timestamp;
            this._firstts = new Date().getTime();
            this._status = JitterBufferStatus.bufferReady;

            this._player._logger.info('jitterbuffer', `strategy [${this._strategy}] gop buffer ok, delay ${this._player._options.delay}, last[${gop[gop.length - 1].timestamp}] first[${gop[0].timestamp}] `);

            return true;
          }

          return false;
        } else if (this._status === JitterBufferStatus.bufferReady) {
          if (gop.length < 1) {
            this._player._logger.warn('jitterbuffer', `strategy [${this._strategy}] gop buffer is empty, restart buffering`);

            this._status = JitterBufferStatus.bufferring;
            return false;
          }

          this.tryDropFrames();
          return false;
        } else {
          this._player._logger.error('jitterbuffer', `strategy [${this._strategy}] jittbuffer status [${this._status}]  error !!!`);
        }

        return false;
      }

      tryDropFrames() {
        if (this._player._options.playMode !== 'live') {
          //  this._player._logger.error('jitterbuffer',`not drop frame!!!`);
          return;
        } //  this._player._logger.error('jitterbuffer',`drop frame [${this._player._options.playMode}] !!!`);


        let dropDelay = this._player._options.delay * delayScale;

        if (this._strategy === DispatchStrategy.playVideoOnlyDriven) {
          if (this._vgop.length < 2) {
            return;
          }

          if (this._agop.length > 0) {
            this._player._logger.warn('jitterbuffer', `strategy [${this._strategy}] drop frames find audio ${this._agop.length}`);

            this._agop = [];
          }

          if (this._vgop[this._vgop.length - 1].timestamp - this._vgop[0].timestamp > dropDelay) {
            //丢弃一半
            let vdropcnt = Math.floor(this._vgop.length / 2);
            this._vgop = this._vgop.slice(vdropcnt);
            this._firstpacketts = this._vgop[0].timestamp;
            this._firstts = new Date().getTime();

            this._player._logger.info('jitterbuffer', `strategy [${this._strategy}] drop video frame ${vdropcnt}, now exist ${this._vgop.length}, delay ${this._player._options.delay}, last[${this._vgop[this._vgop.length - 1].timestamp}] first[${this._vgop[0].timestamp}] `);

            return;
          }
        } else {
          if (this._agop.length < 2) {
            return;
          }

          if (this._agop[this._agop.length - 1].timestamp - this._agop[0].timestamp > dropDelay) {
            //丢弃一半
            let adropcnt = Math.floor(this._agop.length / 2);
            this._agop = this._agop.slice(adropcnt);
            this._firstpacketts = this._agop[0].timestamp;
            this._firstts = new Date().getTime();
            let vdropcnt = this.syncVideo(this._firstpacketts, true);

            this._player._logger.info('jitterbuffer', `strategy [${this._strategy}] drop audio frame ${adropcnt} vedio frams ${vdropcnt}, now exist audio ${this._agop.length} video ${this._vgop.length}, delay ${this._player._options.delay}, last[${this._agop[this._agop.length - 1].timestamp}] first[${this._agop[0].timestamp}] `);

            return;
          }
        }
      }

    }

    class MediaCenter extends EventEmitter {
      _mediacenterWorker = undefined;
      _player;
      _jitterBuffer = undefined;

      constructor(player) {
        super();
        this._player = player;

        this._player._logger.info('mediacenter', `start worker thread ${player._options.decoder}`);

        this._mediacenterWorker = new Worker(player._options.decoder, {
          name: player._options.decoderMode
        });

        this._mediacenterWorker.onmessageerror = event => {
          this._player._logger.info('mediacenter', `start worker thread err ${event}`);
        };

        this._mediacenterWorker.onmessage = event => {
          const msg = event.data;

          switch (msg.cmd) {
            case WORKER_EVENT_TYPE.created:
              {
                this._mediacenterWorker.postMessage({
                  cmd: WORKER_SEND_TYPE.init,
                  options: JSON.stringify(this._player._options)
                });

                break;
              }

            case WORKER_EVENT_TYPE.inited:
              {
                this.emit('inited');
                break;
              }

            case WORKER_EVENT_TYPE.reseted:
              {
                this._jitterBuffer.reset();

                break;
              }

            case WORKER_EVENT_TYPE.destroyed:
              {
                this._mediacenterWorker.terminate();

                this._jitterBuffer.destroy();

                break;
              }

            case WORKER_EVENT_TYPE.videoInfo:
              {
                this.emit('videoinfo', msg.vtype, msg.width, msg.height); //    this._jitterBuffer.playVideoOnly();

                break;
              }

            case WORKER_EVENT_TYPE.yuvData:
              {
                this._jitterBuffer.pushYUVData(msg.data, msg.timestamp, msg.width, msg.height);

                break;
              }

            case WORKER_EVENT_TYPE.audioInfo:
              {
                this.emit('audioinfo', msg.atype, msg.sampleRate, msg.channels, msg.samplesPerPacket);
                break;
              }

            case WORKER_EVENT_TYPE.pcmData:
              {
                this._jitterBuffer.pushPCMData(msg.datas, msg.timestamp);

                break;
              }
          }
        };

        this._jitterBuffer = new JitterBuffer(player);

        this._jitterBuffer.on('yuvdata', yuvpacket => {
          this.emit('yuvdata', yuvpacket);
        });
      }

      destroy() {
        this.off();

        this._mediacenterWorker.postMessage({
          cmd: WORKER_SEND_TYPE.destroy
        });

        this._player._logger.info('MediaCenter', 'MediaCenter destroy');
      }

      getPCMData(trust) {
        return this._jitterBuffer.getPCMData(trust);
      }

    }

    function clamp(num, a, b) {
      return Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
    } //浏览器播放声音时，传递的切片里采样个数要求是2的倍数，根据采样率选择一个合适的采样切片数

    class AudioPlayer extends EventEmitter {
      _player = undefined;
      _audioContext = undefined;
      _gainNode = undefined;
      _scriptNode = undefined;
      _playing = false;
      _atype = 0;
      _samplerate = 0;
      _channels = 0;
      _samplesPerPacket = 0;
      _ticket = undefined;
      _init = false;

      constructor(player) {
        super();
        this._player = player;
        this._playing = false;
        this._init = false;

        this._player._logger.info('AudioPlayer', 'created');
      }

      setAudioInfo(atype, samplerate, channels, samplesPerPacket) {
        this.clear();
        this._atype = atype;
        this._samplerate = samplerate;
        this._channels = channels;
        this._samplesPerPacket = samplesPerPacket;
        this._audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: samplerate
        });
        this._gainNode = this._audioContext.createGain();
        this.audioEnabled(true); // default setting 0

        this._gainNode.gain.value = 0;

        let scriptNode = this._audioContext.createScriptProcessor(samplesPerPacket, 0, channels);

        this._ticket = setInterval(() => {
          if (this.isStateRunning()) {
            return;
          }

          this._player.getPCMData(false);
        }, Math.floor(samplesPerPacket * 1000 / samplerate));

        scriptNode.onaudioprocess = audioProcessingEvent => {
          let outputBuffer = audioProcessingEvent.outputBuffer; //  this._player._logger.info('AudioPlayer', `onaudioprocess callback ${outputBuffer.sampleRate}`);

          let pcmpacket = this._player.getPCMData(true);

          if (!pcmpacket) {
            this._player._logger.warn('AudioPlayer', `audio buffer is empty`);

            for (let i = 0; i < this._channels; i++) {
              let nowBuffering = outputBuffer.getChannelData(i);

              for (let i = 0; i < this._samplesPerPacket; i++) {
                nowBuffering[i] = 0;
              }
            }

            return;
          }

          for (let i = 0; i < this._channels; i++) {
            let b = pcmpacket.datas[i];
            let nowBuffering = outputBuffer.getChannelData(i); //  this._player._logger.info('AudioPlayer', `onaudioprocess callback outputBuffer[${i}] length ${nowBuffering.length}`);

            for (let i = 0; i < this._samplesPerPacket; i++) {
              nowBuffering[i] = b[i] || 0;
            }
          }
        };

        scriptNode.connect(this._gainNode);
        this._scriptNode = scriptNode;

        this._gainNode.connect(this._audioContext.destination);

        this._init = true;
      } //


      isPlaying() {
        return this._playing;
      }

      isMute() {
        return this._gainNode.gain.value === 0 || this.isStateSuspended();
      }

      volume() {
        return this._gainNode.gain.value;
      }

      mute() {
        if (!this._init) {
          return;
        }

        this.setVolume(0);
        this.audioEnabled(false);
      }

      unMute() {
        if (!this._init) {
          return;
        }

        this.setVolume(1);
        this.audioEnabled(true);
      }

      setVolume(volume) {
        volume = parseFloat(volume).toFixed(2);

        if (isNaN(volume)) {
          return;
        }

        this.audioEnabled(true);
        volume = clamp(volume, 0, 1);
        this._gainNode.gain.value = volume;

        this._gainNode.gain.setValueAtTime(volume, this._audioContext.currentTime);
      } // 是否播放。。。


      audioEnabled(flag) {
        this._player._logger.info('audioplayer', `audioEnabled flag ${flag} state ${this._audioContext.state}`);

        if (flag) {
          if (this._audioContext.state === 'suspended') {
            // resume
            this._audioContext.resume();
          }
        } else {
          if (this._audioContext.state === 'running') {
            // suspend
            this._audioContext.suspend();
          }
        }
      }

      isStateRunning() {
        return this._audioContext.state === 'running';
      }

      isStateSuspended() {
        return this._audioContext.state === 'suspended';
      }

      pause() {
        this._playing = false;
      }

      resume() {
        this._playing = true;
      }

      clear() {
        if (this._ticket) {
          clearInterval(this._ticket);
          this._ticket = this.undefined;
        }

        if (this._scriptNode) {
          this._scriptNode.disconnect(this._gainNode);

          this._scriptNode.onaudioprocess = undefined;
          this._scriptNode = undefined;
        }

        if (this._gainNode) {
          this._gainNode.disconnect(this._audioContext.destination);

          this._gainNode = undefined;
        }

        if (this._audioContext) {
          this._audioContext.close();

          this._audioContext = null;
        }

        this._playing = false;
        this._init = false;

        this._player._logger.info('AudioPlayer', 'AudioPlayer clear resouce');
      }

      destroy() {
        this.clear();
        this.off();

        this._player._logger.info('AudioPlayer', 'AudioPlayer destroy');
      }

    }

    const DEFAULT_PLAYER_OPTIONS = {
      url: '',
      //播放地址
      container: '',
      //外部容器，用于放置渲染画面
      playMode: 'live',
      //live 或者 playback
      renderMode: 'normal',
      // normal:正常, green:绿幕, mask:掩码, cube:方块
      width: 480,
      height: 480,
      delay: 500,
      //缓冲时长
      retryCnt: -1,
      //拉流失败重试次数
      retryDelay: 5,
      //重试时延 5000
      decoder: 'worker.js',
      //work线程的js文件
      decoderMode: "normal"
    };

    class AVPlayer {
      _options = undefined;
      _render = undefined;
      _logger = undefined;
      _mediacenter = undefined;
      _audioplayer = undefined; //统计

      _yuvframerate = 0;
      _yuvbitrate = 0;
      _pcmframerate = 0;
      _pcmbitrate = 0;
      _statsec = 2;
      _stattimer = undefined;

      constructor(options) {
        this._logger = new Logger();

        this._logger.setLogEnable(true);

        this._options = Object.assign({}, DEFAULT_PLAYER_OPTIONS, options);
        this._container = options.container;

        this._logger.info('player', `now play ${this._options.url}`);

        this._mediacenter = new MediaCenter(this); //jitterbuffer & decoder h264/h265 -> yuv aac/pcmu/pcma -> fltp

        this._render = new CanvasRender(this); // render yuv

        this._audioplayer = new AudioPlayer(this); // play fltp

        this.registerEvents();
        this.startStatisc();
      }

      startStatisc() {
        this._stattimer = setInterval(() => {
          this._logger.info('STAT', `------ STAT ---------
            yuv cosume framerate:${this._yuvframerate / this._statsec} bitrate:${this._yuvbitrate * 8 / this._statsec}
            pcm cosume framerate:${this._pcmframerate / this._statsec} bitrate:${this._pcmbitrate * 8 / this._statsec}
            `);

          this._yuvframerate = 0;
          this._yuvbitrate = 0;
          this._pcmframerate = 0;
          this._pcmbitrate = 0;
        }, this._statsec * 1000);
      }

      stopStatic() {
        if (this._stattimer) {
          clearInterval(this._stattimer);
          this._stattimer = undefined;
        }
      }

      registerEvents() {
        this._mediacenter.on('inited', () => {
          this._logger.info('player', `mediacenter init success`);
        });

        this._mediacenter.on('videoinfo', (vtype, width, height) => {
          this._logger.info('player', `mediacenter video info vtype ${vtype} width ${width} height ${height}`);
        });

        this._mediacenter.on('yuvdata', yuvpacket => {
          this._yuvframerate++;
          this._yuvbitrate += yuvpacket.data.length; //     this._logger.info('player', `decoder yuvdata ${yuvpacket.data.length} ts ${yuvpacket.timestamp} width:${yuvpacket.width} height:${yuvpacket.height}`);

          this._render.updateTexture(PixelType.YUV, yuvpacket.data, yuvpacket.width, yuvpacket.height);
        });

        this._mediacenter.on('audioinfo', (atype, sampleRate, channels, samplesPerPacket) => {
          this._logger.info('player', `mediacenter audio info atype ${atype} sampleRate ${sampleRate} channels ${channels}  samplesPerPacket ${samplesPerPacket}`);

          this._audioplayer.setAudioInfo(atype, sampleRate, channels, samplesPerPacket);
        });
      }

      getPCMData(trust) {
        let pcmpacket = this._mediacenter.getPCMData(trust);

        if (pcmpacket) {
          this._pcmframerate++;

          for (let data of pcmpacket.datas) {
            this._pcmbitrate += data.length;
          }
        }

        return pcmpacket;
      }

      destroy() {
        this.stopStatic();

        this._mediacenter.destroy();

        this._audioplayer.destroy();

        this._render.destroy();

        this._logger.info('player', `avplayer destroy`);
      } //public interface


      unMute() {
        this._audioplayer.unMute();
      }

      mute() {
        this._audioplayer.mute();
      }

      switchRender(renderMode) {
        this._render.switchRender(renderMode);
      }

    }

    window.AVPlayer = AVPlayer;

    return AVPlayer;

}));
//# sourceMappingURL=avplayer.js.map
