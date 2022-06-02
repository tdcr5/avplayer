import BaseRender from "./baserender.js";
import {mat4,vec3}  from 'gl-matrix'

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
varying lowp vec2 vTexturePosition;
uniform sampler2D uTexture; 
void main(void) {
  gl_FragColor =  texture2D(uTexture, vTexturePosition);
}
`;

var cubeRotation = 0.0;
let angleSplitenum = 128;
let ySplitenum = 128;

class CylinderRender extends BaseRender {

    _gl = undefined;
    _width = 0;
    _height = 0;

    constructor(gl, width, height) {

        super();

        this._width = width;
        this._height = height;

        this._gl = gl;
        this._gl.pixelStorei(this._gl.UNPACK_ALIGNMENT, 1);

        if (!this._gl) {

            console.error(`can not create gl!`);
            return
        }

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
          texture: this._gl.getUniformLocation(shaderProgram, 'uTexture'),
        }
      };
    
      // Here's where we call the routine that builds all the
      // objects we'll be drawing.
      const buffers = initBuffers(this._gl);

      let texture = this._gl.createTexture();
      this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
  
      this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.NEAREST);
      this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.NEAREST);
      this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
      this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);

      this._texture = texture;

     let deltaTime = -0.02;

      setInterval(() => {

        drawScene(this._gl, programInfo, buffers, deltaTime, width, height, this._texture);
          
      }, 33);


    }


    updateTexture(rgbabuf, width, height) {

        let gl = this._gl;

        let textunit = 3;
        gl.activeTexture(gl.TEXTURE0 + textunit);
        gl.bindTexture(gl.TEXTURE_2D, this._texture);

        gl.texImage2D(gl.TEXTURE_2D,
            0,                // mip level
            gl.RGBA,          // internal format
            width,                // width
            height,                // height
            0,                // border
            gl.RGBA,          // format
            gl.UNSIGNED_BYTE, // type
            rgbabuf);

    }


    getRGBA() {

        var pixels = new Uint8Array(this._width * this._height * 4)
    
        this._gl.readPixels(0, 0, this._width, this._height, this._gl.RGBA, this._gl.UNSIGNED_BYTE, pixels)

        return pixels;

    }

}


function initBuffers(gl) {


  let positions = [];
  let texturePos = [];
  let indices = [];


   let radius = 1;
   let cylinderHeight = 2;

   let angle = 2*Math.PI/angleSplitenum;
   let startY = -cylinderHeight/2;
   let ySpliteLen = cylinderHeight/ySplitenum;

    //首位相连坐标重复的
   for(let i = 0; i < (angleSplitenum + 1); i++) {

        let x = radius*Math.cos(i*angle);

        let z = radius*Math.sin(i*angle);

        let texX = i/angleSplitenum;

        for(let j = 0; j < (ySplitenum + 1); j++) {

            positions.push(x);
            positions.push(startY+j*ySpliteLen);
            positions.push(z);

            texturePos.push(texX);
            texturePos.push(j/ySplitenum);


           // console.log(` --- position ${positions[positions.length-3]} ${positions[positions.length-2]} ${positions[positions.length-1]}`)
           // console.log(` -------- texturepos ${texturePos[texturePos.length-2]} ${texturePos[texturePos.length-1]}`)
        }
   }

   for(let i = 0; i < angleSplitenum; i++) {

        for(let j = 0; j < ySplitenum ; j++) {

            // v2 v3
            // v0 v1
            let v0 = i*(ySplitenum + 1) + j;
            let v1 = (i+1)*(ySplitenum + 1) + j;
            let v2 = v0 + 1;
            let v3 = v1 + 1;

            indices.push(v0, v1, v2, v2, v1, v3);

          //  console.log(` -------- indices ${indices[indices.length-6]} ${indices[indices.length-5]} ${indices[indices.length-4]} ${indices[indices.length-3]} ${indices[indices.length-2]} ${indices[indices.length-1]}`)

        }
    }

    console.log(` indices len ${indices.length}`)
    console.log(` positions len ${positions.length}`)
    console.log(` texturePos len ${texturePos.length}`)


//    const indices = [
//     0,  1,  2,      0,  2,  3,    // front
//     4,  5,  6,      4,  6,  7,    // back
//     8,  9,  10,     8,  10, 11,   // top
//     12, 13, 14,     12, 14, 15,   // bottom
//     16, 17, 18,     16, 18, 19,   // right
//     20, 21, 22,     20, 22, 23,   // left
//   ];



   
   const positionBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const texpositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texpositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturePos), gl.STATIC_DRAW);


  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    texposition: texpositionBuffer,
    indices: indexBuffer
  };
}


function drawScene(gl, programInfo, buffers, deltaTime, width, height, texture) {

  gl.viewport(0 , 0, width, height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Clear to black, fully opaque
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

  const fieldOfView = 66 * Math.PI / 180;   // in radians
  const aspect = width / height;
  const zNear = 0.7;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);       

//    mat4.ortho(projectionMatrix, -1, 1, -1, 1, zNear, zFar);                 

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

    
    
    mat4.lookAt(viewMatrix, vec3.fromValues(0.5, 0, 0), vec3.fromValues(-1, 0, 0), vec3.fromValues(0, 1, 0));

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

  let textunit = 2;
  gl.activeTexture(gl.TEXTURE0 + textunit);
  gl.bindTexture(gl.TEXTURE_2D, texture);

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

  gl.uniform1i(programInfo.uniformLocations.texture, textunit);

  {
    const vertexCount = 6*angleSplitenum*ySplitenum;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  // Update the rotation for the next draw

  cubeRotation += deltaTime;
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


export default  CylinderRender;