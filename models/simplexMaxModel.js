class simplexMaxModel extends simplexBaseModel {

  maximizar(objetivo, restricciones, rhs) {
    const numVar = restricciones[0].length;
    let cb   = [];
    let base = [];
    for (let i = 0; i < restricciones.length; i++) {
      cb.push(0);
      base.push('s' + (i + 1));
    }
    const funcionObj = this.agregarHolguras(objetivo, restricciones);
    const encabezados = this._encabezados(funcionObj.length - 1, numVar, restricciones.length);
    let tabla = this.llenarTablaMax(restricciones, rhs);

    const pasos = [];

    // Tabla inicial (iteración 0)
    pasos.push(this._capturarPaso(tabla, cb, base, funcionObj, encabezados, -1, -1, 0));

    let iteracion = 1;
    const MAX_ITER = 500;
    while (iteracion <= MAX_ITER) {
      const columna = this.buscarVariableEntrante(tabla, cb, funcionObj);
      if (columna === -1) break;
      const fila = this.escogerPivote(tabla, columna);
      if (fila === -1) return { error: 'Problema no acotado' };

      cb   = this.cambiarBase(cb, base, columna, fila, funcionObj, numVar);
      tabla = this.pivotear(tabla, fila, columna);

      pasos.push(this._capturarPaso(tabla, cb, base, funcionObj, encabezados, fila, columna, iteracion));
      iteracion++;
    }

    // Solución final
    const solucion = {};
    for (let j = 0; j < numVar; j++) solucion['x' + (j + 1)] = 0;
    for (let i = 0; i < base.length; i++) {
      solucion[base[i]] = Math.max(0, tabla[i][tabla[0].length - 1]);
    }
    const zj      = this.calcularZj(tabla, cb);
    const zOptimo = zj[tabla[0].length - 1];

    return { zOptimo, variables: solucion, pasos, encabezados };
  }

  _capturarPaso(tabla, cb, base, funcionObj, encabezados, filaPivote, colPivote, iteracion) {
    const zj    = this.calcularZj(tabla, cb);
    const cj_zj = funcionObj.map((c, i) => (i < funcionObj.length - 1 ? c - zj[i] : null));

    // Razones mínimas para identificar variable saliente
    const razones = tabla.map((fila, i) => {
      const rhs  = fila[fila.length - 1];
      const coef = colPivote >= 0 ? fila[colPivote] : 0;
      return (coef > 0 && colPivote >= 0) ? (rhs / coef) : null;
    });

    return {
      iteracion,
      tabla:     tabla.map(f => [...f]),
      cb:        [...cb],
      base:      [...base],
      zj:        [...zj],
      cj_zj:     [...cj_zj],
      razones:   [...razones],
      filaPivote,
      colPivote,
      funcionObj: [...funcionObj],
      encabezados,
    };
  }

  _encabezados(totalSinRHS, numVar, numRes) {
    const enc = [];
    for (let j = 0; j < numVar; j++)  enc.push('x' + (j + 1));
    for (let k = 0; k < numRes; k++)  enc.push('s' + (k + 1));
    return enc; // sin RHS
  }

  buscarVariableEntrante(tabla, cb, funcionObj) {
    const zj = this.calcularZj(tabla, cb);
    let maxValor = 0, indice = -1;
    for (let i = 0; i < funcionObj.length - 1; i++) {
      const val = funcionObj[i] - zj[i];
      if (val > maxValor) { maxValor = val; indice = i; }
    }
    return indice;
  }

  llenarTablaMax(restricciones, rhs) {
    const matriz = [];
    for (let i = 0; i < restricciones.length; i++) {
      const fila = [...restricciones[i]];
      for (let k = 0; k < restricciones.length; k++) fila.push(i === k ? 1 : 0);
      fila.push(rhs[i]);
      matriz.push(fila);
    }
    return matriz;
  }

  agregarHolguras(objetivo, restricciones) {
    const f = [...objetivo];
    for (let k = 0; k < restricciones.length; k++) f.push(0);
    f.push(0);
    return f;
  }

  cambiarBase(cb, base, columna, fila, funcionObj, numVar) {
    cb[fila]   = funcionObj[columna];
    base[fila] = this.obtenerNombreVariable(columna, numVar);
    return cb;
  }

  obtenerNombreVariable(columna, numVar) {
    return columna < numVar ? 'x' + (columna + 1) : 's' + (columna - numVar + 1);
  }
}
