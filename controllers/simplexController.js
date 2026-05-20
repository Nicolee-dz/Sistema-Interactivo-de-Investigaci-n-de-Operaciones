const SimplexController = {
  resolverMax(numVars, numRes) {
    const objetivo = this._leerObjetivo(numVars);
    const restricciones = this._leerCoeficientes(numVars, numRes);
    const rhs = this._leerRHS(numRes);
    if (!objetivo || !restricciones || !rhs) return null;
    return SimplexModel.maximizar(objetivo, restricciones, rhs);
  },
  resolverMin(numVars, numRes) {
    const objetivo = this._leerObjetivo(numVars);
    const restricciones = this._leerCoeficientes(numVars, numRes);
    const relaciones = this._leerRelaciones(numRes);
    const rhs = this._leerRHS(numRes);
    if (!objetivo || !restricciones || !rhs) return null;
    return SimplexModel.minimizar(objetivo, restricciones, relaciones, rhs);
  },
  _leerObjetivo(numVars) {
    const vals = [];
    for (let j = 0; j < numVars; j++) { const v = parseFloat(document.getElementById(`obj_${j}`)?.value); if (isNaN(v)) return null; vals.push(v); }
    return vals;
  },
  _leerCoeficientes(numVars, numRes) {
    const m = [];
    for (let i = 0; i < numRes; i++) { const fila = []; for (let j = 0; j < numVars; j++) { const v = parseFloat(document.getElementById(`c_${i}_${j}`)?.value); if (isNaN(v)) return null; fila.push(v); } m.push(fila); }
    return m;
  },
  _leerRelaciones(numRes) {
    const r = [];
    for (let i = 0; i < numRes; i++) r.push(document.getElementById(`rel_${i}`)?.value ?? '<=');
    return r;
  },
  _leerRHS(numRes) {
    const vals = [];
    for (let i = 0; i < numRes; i++) { const v = parseFloat(document.getElementById(`rhs_${i}`)?.value); if (isNaN(v)) return null; vals.push(v); }
    return vals;
  }
};
