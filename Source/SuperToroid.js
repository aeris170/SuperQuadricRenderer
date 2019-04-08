function SuperToroid(bigN, bigM, nBulge, mBulge) {
  var N = bigN;
  var M = bigM;
  var n = nBulge;
  var m = mBulge;

  var vertices = new Float32Array(3 * (N + 1) * (M + 1));
  var normals = new Float32Array(3 * (N + 1) * (M + 1));
  var textureCoords = new Float32Array(2 * (N + 1) * (M + 1));
  var longitude = new Float32Array(N + 1);
  var latitude = new Float32Array(M + 1);

  /* https://github.com/sicKitchen/SuperQuadric */
  /* https://github.com/baonguyen84/SuperQuadric-Webgl */
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= M; j++) {
      let u = (2 * Math.PI / M) * j - Math.PI;
      let v = (2 * Math.PI / N) * i - Math.PI;
      vertices[3 * (i * (M + 1) + j)] = xv(u, v);
      vertices[3 * (i * (M + 1) + j) + 1] = yv(u, v);
      vertices[3 * (i * (M + 1) + j) + 2] = zv(u, v);
      normals[3 * (i * (M + 1) + j)] = xn(u, v);
      normals[3 * (i * (M + 1) + j) + 1] = yn(u, v);
      normals[3 * (i * (M + 1) + j) + 2] = zn(u, v);
      let x1 = 0;
      let x2 = 0;
      let y1 = 0;
      let y2 = 0;
      let z1 = 0;
      let z2 = 0;
      let d = 0;
      if (i > 0) {
        x1 = vertices[3 * ((i - 1) * (M + 1) + j)];
        y1 = vertices[3 * ((i - 1) * (M + 1) + j) + 1];
        z1 = vertices[3 * ((i - 1) * (M + 1) + j) + 2];
        x2 = vertices[3 * (i * (M + 1) + j)];
        y2 = vertices[3 * (i * (M + 1) + j) + 1];
        z2 = vertices[3 * (i * (M + 1) + j) + 2];
        d = distance(x1, y1, z1, x2, y2, z2);
        latitude[j] += d;
      }
      if (j > 0) {
        x1 = vertices[3 * (i * (M + 1) + j - 1)];
        y1 = vertices[3 * (i * (M + 1) + j - 1) + 1];
        z1 = vertices[3 * (i * (M + 1) + j - 1) + 2];
        x2 = vertices[3 * (i * (M + 1) + j)];
        y2 = vertices[3 * (i * (M + 1) + j) + 1];
        z2 = vertices[3 * (i * (M + 1) + j) + 2];
        d = distance(x1, y1, z1, x2, y2, z2);
        longitude[i] += d;
      }
    }
  }
  for (let i = 0; i <= N; i++) {
    let d = 0;
    for (let j = 0; j <= M; j++) {
      if (j == 0) {
        textureCoords[2 * (i * (M + 1) + j)] = 0;
      } else {
        x1 = vertices[3 * (i * (M + 1) + j - 1)];
        y1 = vertices[3 * (i * (M + 1) + j - 1) + 1];
        z1 = vertices[3 * (i * (M + 1) + j - 1) + 2];
        x2 = vertices[3 * (i * (M + 1) + j)];
        y2 = vertices[3 * (i * (M + 1) + j) + 1];
        z2 = vertices[3 * (i * (M + 1) + j) + 2];
        d += distance(x1, y1, z1, x2, y2, z2);
        textureCoords[2 * (i * (M + 1) + j)] = d / longitude[i];
      }
    }
  }
  for (let j = 0; j < M + 1; j++) {
    let d = 0;
    for (let i = 0; i < N + 1; i++) {
      if (i == 0) {
        textureCoords[2 * (i * (M + 1) + j) + 1] = textureCoords[2 * ((M + 1) + j) + 1];
      } else if (j == M) {
        textureCoords[2 * (i * (M + 1) + j) + 1] = textureCoords[2 * (i * (M + 1)) + 1];
      } else {
        x1 = vertices[3 * ((i - 1) * (M + 1) + j)];
        y1 = vertices[3 * ((i - 1) * (M + 1) + j) + 1];
        z1 = vertices[3 * ((i - 1) * (M + 1) + j) + 2];
        x2 = vertices[3 * (i * (M + 1) + j)];
        y2 = vertices[3 * (i * (M + 1) + j) + 1];
        z2 = vertices[3 * (i * (M + 1) + j) + 2];
        d += distance(x1, y1, z1, x2, y2, z2);
        textureCoords[2 * (i * (M + 1) + j) + 1] = d / latitude[j];
      }
    }
  }
  for (let j = 0; j <= M; j++) {
    textureCoords[2 * j] = textureCoords[2 * ((M + 1) + j)];
    textureCoords[2 * (N * (M + 1) + j)] = textureCoords[2 * ((N - 1) * (M + 1) + j)];
  }

  /* TAKEN DIRECTLY FROM WOLFRAM MATH WORLD see: http://mathworld.wolfram.com/Supertoroid.html*/
  function xv(u, v) {
    return ((2.5 + Math.cos(v) * Math.pow(Math.abs(Math.cos(v)), 2.0 / m - 1)) * Math.cos(u) * Math.pow(Math.abs(Math.cos(u)), 2.0 / n - 1));
  };

  /* TAKEN DIRECTLY FROM WOLFRAM MATH WORLD see: http://mathworld.wolfram.com/Supertoroid.html*/
  function yv(u, v) {
    return ((2.5 + Math.cos(v) * Math.pow(Math.abs(Math.cos(v)), 2.0 / m - 1)) * Math.sin(u) * Math.pow(Math.abs(Math.sin(u)), 2.0 / n - 1));
  };

  /* TAKEN DIRECTLY FROM WOLFRAM MATH WORLD see: http://mathworld.wolfram.com/Supertoroid.html*/
  function zv(u, v) {
    return (Math.sin(v) * Math.pow(Math.abs(Math.sin(v)), 2.0 / m - 1));
  };

  /* TAKEN DIRECTLY FROM WOLFRAM MATH WORLD see: http://mathworld.wolfram.com/Supertoroid.html*/
  function xn(u, v) {
    return (2.5 + Math.cos(v) * Math.pow(Math.abs(Math.cos(v)), (1 - 2.0 / m))) * Math.cos(u) * Math.pow(Math.abs(Math.cos(u)), (1 - 2.0 / n));
  };

  /* TAKEN DIRECTLY FROM WOLFRAM MATH WORLD see: http://mathworld.wolfram.com/Supertoroid.html*/
  function yn(u, v) {
    return (2.5 + Math.cos(v) * Math.pow(Math.abs(Math.cos(v)), (1 - 2.0 / m))) * Math.sin(u) * Math.pow(Math.abs(Math.sin(u)), (1 - 2 / n));
  };

  /* TAKEN DIRECTLY FROM WOLFRAM MATH WORLD see: http://mathworld.wolfram.com/Supertoroid.html*/
  function zn(u, v) {
    return Math.sin(v) * Math.pow(Math.abs(Math.sin(v)), 1 - 2.0 / m);
  };

  function distance(x1, y1, z1, x2, y2, z2) {
    var xSquare = (x2 - x1) * (x2 - x1);
    var ySquare = (y2 - y1) * (y2 - y1);
    var zSquare = (z2 - z1) * (z2 - z1);
    return Math.sqrt(xSquare + ySquare + zSquare);
  };

  return [vertices, textureCoords, normals];
};