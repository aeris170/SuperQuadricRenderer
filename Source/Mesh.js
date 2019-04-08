class Mesh {
  constructor(vertices, texCoords, normals, indices) {
    this.vertices = vertices;
    this.texCoords = texCoords;
    this.normals = normals;
    this.indices = indices;
    this.xT = 0;
    this.yT = 0;
    this.zT = 0;
    this.xR = 0;
    this.yR = 0;
    this.zR = 0;
    this.wireMode = 0;
    this.scale = 1;
  }

  prepareModel(gl, program, viewMatrix, projectionMatrix) {

    gl.useProgram(program);

    let positionAttribLocation = gl.getAttribLocation(program, 'vPosition');
    let texCoordAttribLocation = gl.getAttribLocation(program, 'vTexCoord');
    let normalAttribLocation = gl.getAttribLocation(program, 'vNormal');
    let wireAttribLocation = gl.getAttribLocation(program, 'vWireMode');

    this.vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

    this.tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoords), gl.STATIC_DRAW);

    if (this.indices) {
      this.iBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }

    this.nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.vertexAttribPointer(
      positionAttribLocation, // Attribute location
      3, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(positionAttribLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
    gl.vertexAttribPointer(
      texCoordAttribLocation, // Attribute location
      2, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(texCoordAttribLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    gl.vertexAttribPointer(
      normalAttribLocation, // Attribute location
      3, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.TRUE, // Normalized
      3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(normalAttribLocation);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelMatrix'), gl.FALSE, flatten(this.createTranformationMatrix()));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'viewMatrix'), gl.FALSE, flatten(viewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'projectionMatrix'), gl.FALSE, flatten(projectionMatrix));

    gl.uniform1f(gl.getUniformLocation(program, 'wireMode'), this.wireMode);

    this.genTriangleStrips();
    this.wireFrame();

    this.triangleStripBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleStripBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.triangleStrip, gl.STATIC_DRAW);

    this.linebuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.linebuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.wireframe, gl.STATIC_DRAW);
  }

  createTranformationMatrix() {
    let matrix = mat4();
    matrix = mult(matrix, translate(this.xT, this.yT, this.zT));
    matrix = mult(matrix, rotate(this.xR, vec3(1, 0, 0)));
    matrix = mult(matrix, rotate(this.yR, vec3(0, 1, 0)));
    matrix = mult(matrix, rotate(this.zR, vec3(0, 0, 1)));
    matrix = mult(matrix, scale(this.scale, this.scale, this.scale));
    return matrix;
  }

  render(gl, program, viewMatrix, projectionMatrix) {
    this.prepareModel(gl, program, viewMatrix, projectionMatrix);
    if (this.wireMode == 0) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.linebuffer);
      gl.drawElements(gl.LINES, this.wireframe.length, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleStripBuffer);
      gl.drawElements(gl.TRIANGLE_STRIP, this.triangleStrip.length, gl.UNSIGNED_SHORT, 0);
    }
  }

  setTranslation(x, y, z) {
    this.xT = x;
    this.yT = y;
    this.zT = z;
  }

  setRotation(x, y, z) {
    this.xR = x;
    this.yR = y;
    this.zR = z;
  }

  setScale(s) {
    this.scale = s;
  }

  setWireMode(mode) {
    this.wireMode = mode;
  }

  /* https://github.com/sicKitchen/SuperQuadric */
  /* https://github.com/baonguyen84/SuperQuadric-Webgl */
  genTriangleStrips() {
    this.triangleStrip = null;
    var M = 60;
    var N = 60;
    var numIndices = N * (2 * (M + 1) + 2) - 2;
    this.triangleStrip = new Uint16Array(numIndices);
    var index = function (i, j) {
      return i * (M + 1) + j;
    };
    var n = 0;
    for (var i = 0; i < N; i++) {
      for (var j = 0; j <= M; j++) {
        this.triangleStrip[n++] = index(i + 1, j);
        this.triangleStrip[n++] = index(i, j);
      }
    }
  };

  /* https://github.com/sicKitchen/SuperQuadric */
  /* https://github.com/baonguyen84/SuperQuadric-Webgl */
  wireFrame() {
    var lines = [];
    lines.push(this.triangleStrip[0], this.triangleStrip[1]);
    var numStripIndices = this.triangleStrip.length;
    for (var i = 2; i < numStripIndices; i++) {
      var a = this.triangleStrip[i - 2];
      var b = this.triangleStrip[i - 1];
      var c = this.triangleStrip[i];
      if (a != b && b != c && c != a)
        lines.push(a, c, b, c);
    }
    this.wireframe = new Uint16Array(lines);
    var l = lines.length;
  };
}