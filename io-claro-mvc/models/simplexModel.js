// ============================================================
// models/simplexModel.js
// MODELO — Aquí va la lógica matemática del Simplex
// Este archivo lo completa el equipo de backend
// ============================================================

const SimplexModel = {

  /**
   * Resuelve un problema de maximización
   * @param {number[]}   objetivo     Coeficientes de Z  [c1, c2, ...]
   * @param {number[][]} restricciones  Coeficientes de cada restricción
   * @param {number[]}   rhs          Lado derecho de cada restricción
   * @returns {object}  { zOptimo, variables }S
   */
  maximizar(objetivo, restricciones, rhs) {
    const simplex=new simplexMaxModel();
    return simplex.maximizar(objetivo,restricciones,rhs);
  },

  /**
   * Resuelve un problema de minimización
   * @param {number[]}   objetivo     Coeficientes de Z  [c1, c2, ...]
   * @param {number[][]} restricciones  Coeficientes de cada restricción
   * @param {string[]}   relaciones   Tipo de cada restricción: '<=', '>=' o '='
   * @param {number[]}   rhs          Lado derecho de cada restricción
   * @returns {object}  { zOptimo, variables }
   */
  minimizar(objetivo, restricciones, relaciones, rhs) {
    // TODO: implementar algoritmo Simplex minimización
    return null;
  },

  
};
