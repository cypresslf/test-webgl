import { drawScene } from "./draw-scene.js";
import { initBuffers } from "./init-buffers.js";

main();

function main() {
  const gl = document.querySelector("canvas")?.getContext("webgl2");
  if (!gl) {
    console.error("webgl is unsupported");
    return;
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  const vertexShader = `#version 300 es
        #pragma vscode_glsllint_stage: vert
        in vec4 position;
        in vec3 normal;
        in vec2 textureCoord;

        uniform mat4 normalMatrix;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;

        out highp vec2 vTextureCoord;
        out highp vec3 vLighting;
        
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * position;
            vTextureCoord = textureCoord;
            highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
            highp vec3 directionalLightColor = vec3(1, 1, 1);
            highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));
            highp vec4 transformedNormal = normalMatrix * vec4(normal, 1.0);
            highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
            vLighting = ambientLight + directionalLightColor * directional;
        }
    `;
  const fragmentShader = `#version 300 es
        #pragma vscode_glsllint_stage: frag

        precision mediump float;
        
        in highp vec2 vTextureCoord;
        in highp vec3 vLighting;

        uniform sampler2D sampler;
        out vec4 fragColor;

        void main(void) {
            highp vec4 texelColor = texture(sampler, vTextureCoord);
            fragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
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
      normal: gl.getAttribLocation(shader, "normal"),
      textureCoord: gl.getAttribLocation(shader, "textureCoord"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shader, "projectionMatrix"),
      normalMatrix: gl.getUniformLocation(shader, "normalMatrix"),
      modelViewMatrix: gl.getUniformLocation(shader, "modelViewMatrix"),
      sampler: gl.getUniformLocation(shader, "sampler"),
    },
  };

  const buffers = initBuffers(gl);
  const texture = loadTexture(gl, "cube-texture.png");
  // Flip image pixels into the bottom-to-top order that WebGL expects.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  if (buffers.position === null) {
    console.error("Position buffer was null");
    return;
  }
  if (texture === null) {
    console.error("Texture was null");
    return;
  }

  let then = 0;
  let deltaTime = 0;
  let cubeRotation = 0;

  /** @param {number} now */
  const render = (now) => {
    now *= 0.001; // convert to seconds
    deltaTime = now - then;
    then = now;
    drawScene(gl, shaderInfo, buffers, texture, cubeRotation);
    cubeRotation += deltaTime;
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
}

/**
 * @typedef {Object} ShaderInfo
 * @property {WebGLProgram} shader - The WebGL shader program.
 * @property {Object} attributeLocations - The attribute locations.
 * @property {number} attributeLocations.position - The position attribute location.
 * @property {number} attributeLocations.normal - The normal attribute location.
 * @property {number} attributeLocations.textureCoord - The texture attribute location.
 * @property {Object} uniformLocations - The uniform locations.
 * @property {WebGLUniformLocation | null} uniformLocations.projectionMatrix - The projection uniform location.
 * @property {WebGLUniformLocation | null} uniformLocations.normalMatrix - The normal uniform location.
 * @property {WebGLUniformLocation | null} uniformLocations.modelViewMatrix - The model view uniform location.
 * @property {WebGLUniformLocation | null} uniformLocations.sampler - The sampler uniform location.
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

/**
 * @param {WebGLRenderingContext} gl
 * @param {string} url
 */
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel
  );
  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image
    );
    // WebGL1 has different requirements for power of 2 images
    // vs. non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // No, it's not a power of 2. Turn off mips and set
      // wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;
  return texture;
}

/** @param {number} value */
function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}
