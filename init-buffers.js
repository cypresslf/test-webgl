/**
 * @typedef {Object} Buffers
 * @property {WebGLBuffer | null} position
 * @property {WebGLBuffer | null} textureCoord
 * @property {WebGLBuffer | null} indices
 */

/**
 * @param {WebGLRenderingContext} gl
 * @returns {Buffers}
 */
function initBuffers(gl) {
  return {
    position: initPositionBuffer(gl),
    textureCoord: initTextureBuffer(gl),
    indices: initIndexBuffer(gl),
  };
}

/** @param {WebGLRenderingContext} gl */
function initPositionBuffer(gl) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // Front face
      -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
      // Back face
      -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1,
      // Top face
      -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,
      // Bottom face
      -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1,
      // Right face
      1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1,
      // Left face
      -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1,
    ]),
    gl.STATIC_DRAW
  );
  return positionBuffer;
}

/** @param {WebGLRenderingContext} gl */
function initTextureBuffer(gl) {
  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // Front
      0, 0, 1, 0, 1, 1, 0, 1,
      // Back
      0, 0, 1, 0, 1, 1, 0, 1,
      // Top
      0, 0, 1, 0, 1, 1, 0, 1,
      // Bottom
      0, 0, 1, 0, 1, 1, 0, 1,
      // Right
      0, 0, 1, 0, 1, 1, 0, 1,
      // Left
      0, 0, 1, 0, 1, 1, 0, 1,
    ]),
    gl.STATIC_DRAW
  );
  return textureCoordBuffer;
}

/** @param {WebGLRenderingContext} gl */
function initIndexBuffer(gl) {
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's position
    new Uint16Array([
      // front
      0, 1, 2, 0, 2, 3,
      // back
      4, 5, 6, 4, 6, 7,
      // top
      8, 9, 10, 8, 10, 11,
      // bottom
      12, 13, 14, 12, 14, 15,
      // right
      16, 17, 18, 16, 18, 19,
      // left
      20, 21, 22, 20, 22, 23,
    ]),
    gl.STATIC_DRAW
  );
  return indexBuffer;
}

export { initBuffers };
