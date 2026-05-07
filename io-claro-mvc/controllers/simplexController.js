// ============================================================
// controllers/simplexController.js
// CONTROLADOR — Lee los datos del formulario y llama al modelo
// ============================================================

const SimplexController = {

  /**
   * Lee los inputs de la vista y llama a SimplexModel.maximizar()
   * @param {number} numVars  Número de variables
   * @param {number} numRes   Número de restricciones
   * @returns {object|null}   Resultado del modelo, o null si hay error
   */
  resolverMax(numVars, numRes) {
    const objetivo      = this._leerObjetivo(numVars);
    const restricciones = this._leerCoeficientes(numVars, numRes);
    const rhs           = this._leerRHS(numRes);

    if (!objetivo || !restricciones || !rhs) return null;

    return SimplexModel.maximizar(objetivo, restricciones, rhs);
  },

  /**
   * Lee los inputs de la vista y llama a SimplexModel.minimizar()
   * @param {number} numVars  Número de variables
   * @param {number} numRes   Número de restricciones
   * @returns {object|null}   Resultado del modelo, o null si hay error
   */
  resolverMin(numVars, numRes) {
    const objetivo      = this._leerObjetivo(numVars);
    const restricciones = this._leerCoeficientes(numVars, numRes);
    const relaciones    = this._leerRelaciones(numRes);
    const rhs           = this._leerRHS(numRes);

    if (!objetivo || !restricciones || !rhs) return null;

    return SimplexModel.minimizar(objetivo, restricciones, relaciones, rhs);
  },

  // ── Métodos privados de lectura ──────────────────────────

  _leerObjetivo(numVars) {
    const valores = [];
    for (let j = 0; j < numVars; j++) {
      const input = document.getElementById(`obj_${j}`);
      const val   = parseFloat(input?.value);
      if (isNaN(val)) return null;
      valores.push(val);
    }
    return valores;
  },

  _leerCoeficientes(numVars, numRes) {
    const matriz = [];
    for (let i = 0; i < numRes; i++) {
      const fila = [];
      for (let j = 0; j < numVars; j++) {
        const input = document.getElementById(`c_${i}_${j}`);
        const val   = parseFloat(input?.value);
        if (isNaN(val)) return null;
        fila.push(val);
      }
      matriz.push(fila);
    }
    return matriz;
  },

  _leerRelaciones(numRes) {
    const relaciones = [];
    for (let i = 0; i < numRes; i++) {
      const select = document.getElementById(`rel_${i}`);
      relaciones.push(select?.value ?? '<=');
    }
    return relaciones;
  },

  _leerRHS(numRes) {
    const valores = [];
    for (let i = 0; i < numRes; i++) {
      const input = document.getElementById(`rhs_${i}`);
      const val   = parseFloat(input?.value);
      if (isNaN(val)) return null;
      valores.push(val);
    }
    return valores;
  }

};
