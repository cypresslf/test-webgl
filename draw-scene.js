// @ts-ignore
const { mat4 } = glMatrix;

/**
 * @param {WebGLRenderingContext} gl
 * @param {import("./main").ShaderInfo} shaderInfo
 * @param {import("./init-buffers").Buffers} buffers
 * @param {WebGLTexture} texture
 * @param {number} cubeRotation
 */
function drawScene(gl, shaderInfo, buffers, texture, cubeRotation) {
  if (gl.canvas instanceof OffscreenCanvas) {
    console.error("canvas is offscreen. cannot draw scene");
    return;
  }

  gl.clearColor(0, 0, 0, 1);
  gl.clearDepth(1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // A special matrix used to simulate the distortion of
  // perspective in a camera.
  const fieldOfView = (45 * Math.PI) / 180;
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100;
  const projection = mat4.create();
  mat4.perspective(projection, fieldOfView, aspect, zNear, zFar);

  const modelView = mat4.create();
  mat4.translate(modelView, modelView, [-0, 0, -6]);
  mat4.rotate(
    modelView, // destination matrix
    modelView, // matrix to rotate
    cubeRotation, // amount to rotate in radians
    [0, 0, 1]
  ); // axis to rotate around (Z)
  mat4.rotate(
    modelView, // destination matrix
    modelView, // matrix to rotate
    cubeRotation * 0.7, // amount to rotate in radians
    [0, 1, 0]
  ); // axis to rotate around (Y)
  mat4.rotate(
    modelView, // destination matrix
    modelView, // matrix to rotate
    cubeRotation * 0.3, // amount to rotate in radians
    [1, 0, 0]
  ); // axis to rotate around (X)
  setPositionAttribute(gl, buffers, shaderInfo);
  setTextureAttribute(gl, buffers, shaderInfo);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  gl.useProgram(shaderInfo.shader);
  gl.uniformMatrix4fv(
    shaderInfo.uniformLocations.projection,
    false,
    projection
  );
  gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelView, false, modelView);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(shaderInfo.uniformLocations.sampler, 0);
  {
    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {import("./init-buffers").Buffers} buffers
 * @param {import("./main").ShaderInfo} shaderInfo
 */
function setPositionAttribute(gl, buffers, shaderInfo) {
  const numComponents = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(
    shaderInfo.attributeLocations.position,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(shaderInfo.attributeLocations.position);
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {import("./init-buffers").Buffers} buffers
 * @param {import("./main").ShaderInfo} shaderInfo
 */
function setTextureAttribute(gl, buffers, shaderInfo) {
  const num = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
  gl.vertexAttribPointer(
    shaderInfo.attributeLocations.textureCoord,
    num,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(shaderInfo.attributeLocations.textureCoord);
}

export { drawScene };
