

import BaseRender from "./baserender.js";
import {mat4,vec3}  from 'gl-matrix'
import { PixelType } from "../constant/index.js";


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
`;

// Fragment shader program

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
          texturePosition: this._gl.getAttribLocation(shaderProgram, 'aTexturePosition'),
        },
        uniformLocations: {
          projectionMatrix: this._gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
          modelMatrix: this._gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
          viewMatrix: this._gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
          rgbatexture: this._gl.getUniformLocation(shaderProgram, 'rgbaTexture'),
          ytexture: this._gl.getUniformLocation(shaderProgram, 'yTexture'),
          utexture: this._gl.getUniformLocation(shaderProgram, 'uTexture'),
          vtexture: this._gl.getUniformLocation(shaderProgram, 'vTexture'),
          isyuv: this._gl.getUniformLocation(shaderProgram, 'isyuv'),
        }
      };
    
      // Here's where we call the routine that builds all the
      // objects we'll be drawing.
      const buffers = initBuffers(this._gl);

      this._rgbatexture = this.createTexture();
      this._ytexture = this.createTexture();
      this._utexture = this.createTexture();
      this._vtexture = this.createTexture();

      let deltaTime = -0.03;

      setInterval(() => {

        this.drawScene(programInfo, buffers, deltaTime);
          
      }, 33);


    }


    createTexture(){

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
    
            gl.texImage2D(gl.TEXTURE_2D,
                0,                // mip level
                gl.RGBA,          // internal format
                width,                // width
                height,                // height
                0,                // border
                gl.RGBA,          // format
                gl.UNSIGNED_BYTE, // type
                pixelbuf);

        } else if (pixeltype === PixelType.YUV) {

            let y = pixelbuf.slice(0, width*height);
            let u = pixelbuf.slice(width*height, width*height*5/4);
            let v = pixelbuf.slice(width*height*5/4, width*height*3/2);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D,  this._ytexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width, height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, y);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this._utexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width/2, height/2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, u);
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, this._vtexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, width/2, height/2, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, v);

        } else {


        }

    }

    drawScene(programInfo, buffers, deltaTime) {

        let gl = this._gl;

        gl.viewport(0 , 0, this._width, this._height);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
      
        // Clear the canvas before we start drawing on it.
      
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
        // Create a perspective matrix, a special matrix that is
        // used to simulate the distortion of perspective in a camera.
        // Our field of view is 45 degrees, with a width/height
        // ratio that matches the display size of the canvas
        // and we only want to see objects between 0.1 units
        // and 100 units away from the camera.
      
        const fieldOfView = 80 * Math.PI / 180;   // in radians
        const aspect = this._width / this._height;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();
      
        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        mat4.perspective(projectionMatrix,
                         fieldOfView,
                         aspect,
                         zNear,
                         zFar);
      
      //   mat4.ortho(projectionMatrix, -1, 1, -1, 1, zNear, zFar);                 
      
        // Set the drawing position to the "identity" point, which is
        // the center of the scene.
        const modelMatrix = mat4.create();
      
        // Now move the drawing position a bit to where we want to
        // start drawing the square.
      
      //   mat4.translate(modelMatrix,     // destination matrix
      //                 modelMatrix,     // matrix to translate
      //                  [-0.0, 0.0, -6.0]);  // amount to translate
      //   mat4.rotate(modelMatrix,  // destination matrix
      //               modelMatrix,  // matrix to rotate
      //               cubeRotation,     // amount to rotate in radians
      //               [0, 0, 1]);       // axis to rotate around (Z)
        mat4.rotate(modelMatrix,  // destination matrix
                    modelMatrix,  // matrix to rotate
                    cubeRotation * .7,// amount to rotate in radians
                    [0, 1, 0]);       // axis to rotate around (X)
      
      
          const viewMatrix = mat4.create();
      
          
          mat4.lookAt(viewMatrix, vec3.fromValues(0, 2, 3), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
      
        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute
        {
          const numComponents = 3;
          const type = gl.FLOAT;
          const normalize = false;
          const stride = 0;
          const offset = 0;
          gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
          gl.vertexAttribPointer(
              programInfo.attribLocations.vertexPosition,
              numComponents,
              type,
              normalize,
              stride,
              offset);
          gl.enableVertexAttribArray(
              programInfo.attribLocations.vertexPosition);
        }
      
        // Tell WebGL how to pull out the colors from the color buffer
        // into the vertexColor attribute.
        {
          const numComponents = 2;
          const type = gl.FLOAT;
          const normalize = false;
          const stride = 0;
          const offset = 0;
          gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texposition);
          gl.vertexAttribPointer(
              programInfo.attribLocations.texturePosition,
              numComponents,
              type,
              normalize,
              stride,
              offset);
          gl.enableVertexAttribArray(
              programInfo.attribLocations.texturePosition);
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

        }
      

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
      
        // Tell WebGL to use our program when drawing
      
        gl.useProgram(programInfo.program);
      
        // Set the shader uniforms
      
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
      
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelMatrix,
            false,
            modelMatrix);
      
            gl.uniformMatrix4fv(
              programInfo.uniformLocations.viewMatrix,
              false,
              viewMatrix);
      
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
        }
      
        // Update the rotation for the next draw
      
        cubeRotation += deltaTime;
      }


    getRGBA() {

        var pixels = new Uint8Array(this._width * this._height * 4)
    
        this._gl.readPixels(0, 0, this._width, this._height, this._gl.RGBA, this._gl.UNSIGNED_BYTE, pixels)

        return pixels;

    }

}


function initBuffers(gl) {

  // Create a buffer for the cube's vertex positions.
  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.

  const positions = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    1.0, -1.0, -1.0,
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,


    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
    1.0, -1.0,  1.0,
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,


    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the colors for the faces. We'll use solid colors
  // for each face.

//   const facePos = [
//     [0.0,  0.0],  
//     [1.0,  0.0], 
//     [1.0,  1.0],    
//     [0.0,  1.0]  
//   ];

  const facePos = [
    [1.0,  0.0], 
    [0.0,  0.0],  
    [0.0,  1.0],
    [1.0,  1.0]
  ];
  

  // Convert the array of colors into a table for all the vertices.

  var texturePos = [];

  texturePos =  texturePos.concat(...facePos, ...facePos, ...facePos, ...facePos, ...facePos, ...facePos);

  const texpositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texpositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturePos), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ];

  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    texposition: texpositionBuffer,
    indices: indexBuffer
  };
}


//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export default CubeRender;