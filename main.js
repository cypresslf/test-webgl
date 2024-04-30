import { drawScene } from "./draw-scene.js";
import { initBuffers } from "./init-buffers.js";

main();

function main() {
  const gl = document.querySelector("canvas")?.getContext("webgl");
  if (!gl) {
    console.error("webgl is unsupported");
    return;
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  const vertexShader = `
        attribute vec4 position;
        attribute vec4 color;

        uniform mat4 modelView;
        uniform mat4 projection;

        varying lowp vec4 vColor;
        
        void main() {
            gl_Position = projection * modelView * position;
            vColor = color;
        }
    `;
  const fragmentShader = `
        varying lowp vec4 vColor;

        void main() {
            gl_FragColor = vColor;
        }
    `;
  const shader = initShader(gl, vertexShader, fragmentShader);
  if (shader === null) {
    console.error("Shader was null");
    return;
  }

  /** @type {ShaderInfo} */
  const shaderInfo = {
    shader,
    attributeLocations: {
      position: gl.getAttribLocation(shader, "position"),
      color: gl.getAttribLocation(shader, "color"),
    },
    uniformLocations: {
      projection: gl.getUniformLocation(shader, "projection"),
      modelView: gl.getUniformLocation(shader, "modelView"),
    },
  };
  if (
    shaderInfo.attributeLocations.position === -1 ||
    shaderInfo.attributeLocations.color === -1
  ) {
    console.error(
      `One or more attribute locations are invalid.\nposition: ${shaderInfo.attributeLocations.position}\ncolor: ${shaderInfo.attributeLocations.color}`
    );
    return;
  }
  const buffers = initBuffers(gl);
  if (buffers.position === null) {
    console.error("Position buffer was null");
    return;
  }
  drawScene(gl, shaderInfo, buffers);
}

/**
 * @typedef {Object} ShaderInfo
 * @property {WebGLProgram} shader - The WebGL shader program.
 * @property {Object} attributeLocations - The attribute locations.
 * @property {number} attributeLocations.position - The position attribute location.
 * @property {number} attributeLocations.color - The color attribute location.
 * @property {Object} uniformLocations - The uniform locations.
 * @property {WebGLUniformLocation | null} uniformLocations.projection - The projection uniform location.
 * @property {WebGLUniformLocation | null} uniformLocations.modelView - The model view uniform location.
 */

/**
 * @param {WebGLRenderingContext} gl
 * @param {string} vertexShaderSource
 * @param {string} fragmentShaderSource
 */
function initShader(gl, vertexShaderSource, fragmentShaderSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = loadShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  const shaderProgram = gl.createProgram();
  if (
    shaderProgram === null ||
    vertexShader === null ||
    fragmentShader === null
  ) {
    console.error("Unable to create the shader program");
    return null;
  }
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error(
      `unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram
      )}`
    );
    return null;
  }
  return shaderProgram;
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {number} type
 * @param {string} source
 */
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (shader === null) {
    console.error("Unable to create shader");
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
    );
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
