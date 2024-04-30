// @ts-ignore
const { mat4 } = glMatrix;

/**
 * @param {WebGLRenderingContext} gl
 * @param {import("./main").ShaderInfo} shaderInfo
 * @param {import("./init-buffers").Buffers} buffers
 */
function drawScene(gl, shaderInfo, buffers) {
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
  setPositionAttribute(gl, buffers, shaderInfo);
  setColorAttributes(gl, buffers, shaderInfo);
  gl.useProgram(shaderInfo.shader);
  gl.uniformMatrix4fv(
    shaderInfo.uniformLocations.projection,
    false,
    projection
  );
  gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelView, false, modelView);
  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {import("./init-buffers").Buffers} buffers
 * @param {import("./main").ShaderInfo} shaderInfo
 */
function setPositionAttribute(gl, buffers, shaderInfo) {
  const numComponents = 2;
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
function setColorAttributes(gl, buffers, shaderInfo) {
  const numComponents = 4;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(
    shaderInfo.attributeLocations.color,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(shaderInfo.attributeLocations.color);
}

export { drawScene };
