window.onload = function () {
  var canvas = document.getElementById('render-surface');
  var gl = canvas.getContext('webgl');
  if (!gl) {
    console.log('Using experimental-webgl');
    gl = canvas.getContext('experimental-webgl');
  }
  if (!gl) {
    alert('Your browser doesn\'t support WEBGL');
  }

  gl.bindTexture(gl.TEXTURE_2D, texture(gl, 'crate'));
  gl.activeTexture(gl.TEXTURE0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1.0);

  var radius = 160;
  var xRot = 110;
  var yRot = 180;
  var zRot = 0;
  document.onkeydown = function (event) {
    let camSpd = document.getElementById('camspd').value / 1;
    console.log(camSpd);
    switch (event.keyCode) {
    case 87:
      xRot += camSpd;
      //console.log('W');
      break;
    case 65:
      zRot += camSpd;
      //console.log('A');
      break;
    case 83:
      xRot -= camSpd;
      //console.log('S');
      break;
    case 68:
      zRot -= camSpd;
      //console.log('D');
      break;
    case 37:
      yRot -= camSpd;
      //console.log('LEFT');
      break;
    case 38:
      event.preventDefault();
      radius -= camSpd;
      //console.log('UP');
      break;
    case 39:
      yRot += camSpd;
      //console.log('RIGHT');
      break;
    case 40:
      event.preventDefault();
      radius += camSpd;
      //console.log('DOWN');
      break;
    }
  };

  var rotationMode = 1;
  document.getElementById('toggleRotation').onclick = function () {
    rotationMode = (rotationMode + 1) % 2;
  };

  document.getElementById('defcam').onclick = function () {
    radius = 160;
    xRot = 110;
    yRot = 180;
    zRot = 0;
  };

  var mbulge = 5;
  document.getElementById('mbulge').oninput = function () {
    mbulge = document.getElementById('mbulge').value;
  };

  var nbulge = 5;
  document.getElementById('nbulge').oninput = function () {
    nbulge = document.getElementById('nbulge').value;
  };

  var program = initShaders(gl, 'vertexShader', 'fragmentShader');
  gl.useProgram(program);

  var viewMatrix;
  var projectionMatrix = perspective(radians(110), canvas.width / canvas.height, 0.1, 1000000.0);
  var e, t, elips, toroid;
  var i = 0;
  var render = function () {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    viewMatrix = createViewMatrix(radius, xRot, yRot, zRot);
    e = SuperEllipsoid(60, 60, mbulge, nbulge);
    t = SuperToroid(61, 61, mbulge, nbulge);
    elips = new Mesh(e[0], e[1], e[2]);
    torus = new Mesh(t[0], t[1], t[2]);
    torus.setScale(0.3);
    elips.setRotation(0, 180, i);
    torus.setRotation(0, 180, i);
    elips.setTranslation(-2, -3, 0);
    torus.setTranslation(-2, 3, 0);
    elips.setWireMode(1);
    torus.setWireMode(1);
    elips.render(gl, program, viewMatrix, projectionMatrix);
    torus.render(gl, program, viewMatrix, projectionMatrix);
    elips.setTranslation(2, -3, 0);
    torus.setTranslation(2, 3, 0);
    elips.setWireMode(0);
    torus.setWireMode(0);
    elips.render(gl, program, viewMatrix, projectionMatrix);
    torus.render(gl, program, viewMatrix, projectionMatrix);
    if (rotationMode === 1) {
      i += 0.4;
    }
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
};

function createViewMatrix(radius, xRot, yRot, zRot) {
  var viewMatrix = mat4();
  viewMatrix = lookAt(vec3(0, 0, radius), vec3(0, 0, 0), vec3(0, 1, 0));
  viewMatrix = mult(viewMatrix, rotate(xRot, vec3(1, 0, 0)));
  viewMatrix = mult(viewMatrix, rotate(yRot, vec3(0, 1, 0)));
  viewMatrix = mult(viewMatrix, rotate(zRot, vec3(0, 0, 1)));
  return viewMatrix;
}

function texture(gl, name) {
  var ext = gl.getExtension('MOZ_EXT_texture_filter_anisotropic');
  if (!ext) {
    ext = gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
  }

  if (!ext) {
    alert('Anisopropic filtering not supported by your browser! Consider switching to Chrome, rendering qualite may be affected');
  }

  var image = document.getElementById(name);
  var t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  if (ext) {
    gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 8);
  }
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    image
  );
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
  gl.bindTexture(gl.TEXTURE_2D, null);

  return t;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}