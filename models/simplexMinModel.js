class simplexMinModel extends simplexBaseModel {

  minimizar(objetivo, restricciones, relaciones, rhs) {
    const numVar = restricciones[0].length;
    const numRes = restricciones.length;
    const M = 1e6;

    let numHolguras = 0, numArtific = 0;
    const tipoExtra = [];
    for (let i = 0; i < numRes; i++) {
      if      (relaciones[i] === '<=') { tipoExtra.push('holgura');            numHolguras++; }
      else if (relaciones[i] === '>=') { tipoExtra.push('exceso+artificial');  numHolguras++; numArtific++; }
      else                             { tipoExtra.push('artificial');          numArtific++; }
    }

    const totalCols = numVar + numHolguras + numArtific + 1;
    const tabla = [], cb = [], base = [];
    let hCur = numVar, aCur = numVar + numHolguras;

    for (let i = 0; i < numRes; i++) {
      const fila = new Array(totalCols).fill(0);
      for (let j = 0; j < numVar; j++) fila[j] = restricciones[i][j];

      if (tipoExtra[i] === 'holgura') {
        fila[hCur] = 1;
        cb.push(0); base.push('s' + (hCur - numVar + 1)); hCur++;
      } else if (tipoExtra[i] === 'exceso+artificial') {
        fila[hCur] = -1; fila[aCur] = 1;
        cb.push(M); base.push('a' + (aCur - numVar - numHolguras + 1));
        hCur++; aCur++;
      } else {
        fila[aCur] = 1;
        cb.push(M); base.push('a' + (aCur - numVar - numHolguras + 1)); aCur++;
      }
      fila[totalCols - 1] = rhs[i];
      tabla.push(fila);
    }

    const funcionObj = new Array(totalCols).fill(0);
    for (let j = 0; j < numVar; j++) funcionObj[j] = objetivo[j];
    for (let k = numVar + numHolguras; k < numVar + numHolguras + numArtific; k++) funcionObj[k] = M;

    const encabezados = this._encabezados(numVar, numHolguras, numArtific);
    const pasos = [];
    pasos.push(this._capturarPaso(tabla, cb, base, funcionObj, encabezados, -1, -1, 0));

    let iteracion = 1;
    const MAX_ITER = 500;
    while (iteracion <= MAX_ITER) {
      const columna = this._buscarVariableEntranteMin(tabla, cb, funcionObj);
      if (columna === -1) break;
      const fila = this.escogerPivote(tabla, columna);
      if (fila === -1) return { error: 'Problema no acotado' };

      cb[fila]   = funcionObj[columna];
      base[fila] = encabezados[columna] || ('v' + columna);
      this.pivotear(tabla, fila, columna);

      pasos.push(this._capturarPaso(tabla, cb, base, funcionObj, encabezados, fila, columna, iteracion));
      iteracion++;
    }

    // Factibilidad
    for (let i = 0; i < base.length; i++) {
      if (base[i].startsWith('a') && Math.abs(tabla[i][totalCols - 1]) > 1e-6) {
        return { error: 'Problema sin solución factible' };
      }
    }

    const solucion = {};
    for (let j = 0; j < numVar; j++) solucion['x' + (j + 1)] = 0;
    for (let i = 0; i < base.length; i++) {
      if (base[i].startsWith('x')) solucion[base[i]] = Math.max(0, tabla[i][totalCols - 1]);
    }
    const zj      = this.calcularZj(tabla, cb);
    const zOptimo = zj[totalCols - 1];

    return { zOptimo, variables: solucion, pasos, encabezados };
  }

  _capturarPaso(tabla, cb, base, funcionObj, encabezados, filaPivote, colPivote, iteracion) {
    const zj    = this.calcularZj(tabla, cb);
    const cj_zj = funcionObj.map((c, i) => i < funcionObj.length - 1 ? c - zj[i] : null);
    const razones = tabla.map(fila => {
      const rhs  = fila[fila.length - 1];
      const coef = colPivote >= 0 ? fila[colPivote] : 0;
      return (coef > 0 && colPivote >= 0) ? rhs / coef : null;
    });
    return {
      iteracion, tabla: tabla.map(f => [...f]),
      cb: [...cb], base: [...base],
      zj: [...zj], cj_zj: [...cj_zj], razones: [...razones],
      filaPivote, colPivote, funcionObj: [...funcionObj], encabezados,
    };
  }

  _encabezados(numVar, numHolguras, numArtific) {
    const enc = [];
    for (let j = 0; j < numVar; j++)       enc.push('x' + (j + 1));
    for (let k = 0; k < numHolguras; k++)  enc.push('s' + (k + 1));
    for (let k = 0; k < numArtific; k++)   enc.push('a' + (k + 1));
    return enc;
  }

  _buscarVariableEntranteMin(tabla, cb, funcionObj) {
    const zj = this.calcularZj(tabla, cb);
    let minValor = -1e-9, indice = -1;
    for (let i = 0; i < funcionObj.length - 1; i++) {
      const val = funcionObj[i] - zj[i];
      if (val < minValor) { minValor = val; indice = i; }
    }
    return indice;
  }
}
