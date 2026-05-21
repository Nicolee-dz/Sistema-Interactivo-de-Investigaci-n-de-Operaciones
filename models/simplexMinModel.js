class simplexMinModel extends simplexBaseModel {

  minimizar(objetivo, restricciones, relaciones, rhs) {
    const numVar  = restricciones[0].length;
    const numRes  = restricciones.length;
    const M       = 1e7;   // Big-M

    // ── 1. Clasificar restricciones y contar variables extra ──
    let numHolguras = 0, numArtific = 0;
    const tipoExtra = [];
    for (let i = 0; i < numRes; i++) {
      if      (relaciones[i] === '<=') { tipoExtra.push('holgura');           numHolguras++; }
      else if (relaciones[i] === '>=') { tipoExtra.push('exceso+artificial'); numHolguras++; numArtific++; }
      else                             { tipoExtra.push('artificial');         numArtific++; }
    }

    const totalCols = numVar + numHolguras + numArtific + 1; // +1 = RHS
    const tabla = [], cb = [], base = [];
    let hCur = numVar;
    let aCur = numVar + numHolguras;

    // ── 2. Construir tabla inicial ────────────────────────────
    for (let i = 0; i < numRes; i++) {
      const fila = new Array(totalCols).fill(0);
      for (let j = 0; j < numVar; j++) fila[j] = restricciones[i][j];

      if (tipoExtra[i] === 'holgura') {
        fila[hCur] = 1;
        cb.push(0);
        base.push('s' + (hCur - numVar + 1));
        hCur++;
      } else if (tipoExtra[i] === 'exceso+artificial') {
        fila[hCur] = -1;   // variable de exceso
        fila[aCur] = 1;    // variable artificial
        cb.push(M);
        base.push('a' + (aCur - numVar - numHolguras + 1));
        hCur++;
        aCur++;
      } else { // '='
        fila[aCur] = 1;
        cb.push(M);
        base.push('a' + (aCur - numVar - numHolguras + 1));
        aCur++;
      }

      // Garantizar RHS ≥ 0: si b < 0, multiplicar fila por -1
      if (rhs[i] < 0) {
        for (let j = 0; j < totalCols - 1; j++) fila[j] *= -1;
        fila[totalCols - 1] = -rhs[i];
      } else {
        fila[totalCols - 1] = rhs[i];
      }

      tabla.push(fila);
    }

    // ── 3. Vector de costos (función objetivo extendida) ──────
    const funcionObj = new Array(totalCols).fill(0);
    for (let j = 0; j < numVar; j++) funcionObj[j] = objetivo[j];
    // Costos artificiales = M
    for (let k = numVar + numHolguras; k < numVar + numHolguras + numArtific; k++) {
      funcionObj[k] = M;
    }

    const encabezados = this._encabezados(numVar, numHolguras, numArtific);
    const pasos = [];
    pasos.push(this._capturarPaso(tabla, cb, base, funcionObj, encabezados, -1, -1, 0));

    // ── 4. Iteraciones simplex ────────────────────────────────
    let iteracion = 1;
    const MAX_ITER = 500;
    while (iteracion <= MAX_ITER) {
      const columna = this._buscarVariableEntranteMin(tabla, cb, funcionObj);
      if (columna === -1) break;

      const fila = this.escogerPivote(tabla, columna);
      if (fila === -1) return { error: 'Problema no acotado' };

      cb[fila]   = funcionObj[columna];
      base[fila] = encabezados[columna];
      this.pivotear(tabla, fila, columna);

      pasos.push(this._capturarPaso(tabla, cb, base, funcionObj, encabezados, fila, columna, iteracion));
      iteracion++;
    }

    // ── 5. Verificar factibilidad (artificiales fuera de base) ─
    for (let i = 0; i < base.length; i++) {
      if (base[i].startsWith('a') && Math.abs(tabla[i][totalCols - 1]) > 1e-6) {
        return { error: 'El problema no tiene solución factible (variable artificial en la base).' };
      }
    }

    // ── 6. Extraer solución ───────────────────────────────────
    const solucion = {};
    for (let j = 0; j < numVar; j++) solucion['x' + (j + 1)] = 0;
    for (let i = 0; i < base.length; i++) {
      if (base[i].startsWith('x')) {
        const val = tabla[i][totalCols - 1];
        solucion[base[i]] = Math.max(0, Math.round(val * 1e9) / 1e9);
      }
    }

    // zOptimo = Zj del RHS (última columna), ignorando contribución de artificiales
    const zjFinal = this._calcularZjReal(tabla, cb, numVar, numHolguras, numArtific);
    const zOptimo = zjFinal;

    const zjFinal = this.calcularZj(tabla, cb);

    const zj_cjFinal =
      funcionObj.map((c, j) => zjFinal[j] - c);

    const B =
      this.construirMatrizBase(
        tabla,
        base,
        encabezados
      );

const B_INV =
  this.invertirMatriz(B);

    return {
      zOptimo: zjFinal[tabla[0].length - 1],
      variables: solucion,
      pasos,
      encabezados,

      // Información para sensibilidad
      tablaFinal: tabla,
      cbFinal: cb,
      baseFinal: base,
      zjFinal: zjFinal,
      cjFinal: funcionObj,
      zj_cjFinal: zj_cjFinal,
      B: B,
      B_INV: B_INV
      
    };
  }

  // Calcula el Z real ignorando el Big-M de las artificiales
  _calcularZjReal(tabla, cb, numVar, numHolguras, numArtific) {
    const totalCols = tabla[0].length;
    let z = 0;
    for (let i = 0; i < cb.length; i++) {
      // Si la variable base es artificial, su costo real es 0 (está en base con valor ~0)
      const cbReal = cb[i] >= 1e6 ? 0 : cb[i];
      z += cbReal * tabla[i][totalCols - 1];
    }
    return Math.round(z * 1e9) / 1e9;
  }

  _capturarPaso(tabla, cb, base, funcionObj, encabezados, filaPivote, colPivote, iteracion) {
    const totalCols = tabla[0].length;
    const zj    = this.calcularZj(tabla, cb);
    const cj_zj = funcionObj.map((c, i) => i < totalCols - 1 ? c - zj[i] : null);

    const razones = tabla.map(fila => {
      const rhs  = fila[totalCols - 1];
      const coef = colPivote >= 0 ? fila[colPivote] : 0;
      return (coef > 1e-10 && colPivote >= 0) ? rhs / coef : null;
    });

    return {
      iteracion,
      tabla:      tabla.map(f => [...f]),
      cb:         [...cb],
      base:       [...base],
      zj:         [...zj],
      cj_zj:      [...cj_zj],
      razones:    [...razones],
      filaPivote,
      colPivote,
      funcionObj: [...funcionObj],
      encabezados,
    };
  }

  _encabezados(numVar, numHolguras, numArtific) {
    const enc = [];
    for (let j = 0; j < numVar; j++)      enc.push('x' + (j + 1));
    for (let k = 0; k < numHolguras; k++) enc.push('s' + (k + 1));
    for (let k = 0; k < numArtific; k++)  enc.push('a' + (k + 1));
    return enc;
  }

  // Busca la columna con cj−Zj más negativo (criterio de entrada para minimización)
  _buscarVariableEntranteMin(tabla, cb, funcionObj) {
    const zj = this.calcularZj(tabla, cb);
    let minValor = -1e-9;
    let indice   = -1;

    for (let i = 0; i < funcionObj.length - 1; i++) {
      const cjzj = funcionObj[i] - zj[i];
      if (cjzj < minValor) {
        minValor = cjzj;
        indice   = i;
      }
    }
    return indice;
  }
}
