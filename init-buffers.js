/**
 * @typedef {Object} Buffers
 * @property {WebGLBuffer | null} position
 * @property {WebGLBuffer | null} color
 */

/**
 * @param {WebGLRenderingContext} gl
 * @returns {Buffers}
 */
function initBuffers(gl) {
  return {
    position: initPositionBuffer(gl),
    color: initColorBuffer(gl),
  };
}

/**
 * @param {WebGLRenderingContext} gl
 */
function initPositionBuffer(gl) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([1, 1, -1, 1, 1, -1, -1, -1]),
    gl.STATIC_DRAW
  );
  return positionBuffer;
}

/**
 * @param {WebGLRenderingContext} gl
 */
function initColorBuffer(gl) {
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      1,
      1,
      1,
      1, // white
      1,
      0,
      0,
      1, // red
      0,
      1,
      0,
      1, // green
      0,
      0,
      1,
      1, // blue
    ]),
    gl.STATIC_DRAW
  );
  return colorBuffer;
}

export { initBuffers };
