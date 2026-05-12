// ============================================================
// models/simplexModel.js
// ============================================================
const SimplexModel = {

  maximizar(objetivo, restricciones, rhs) {
    const simplex = new simplexMaxModel();
    return simplex.maximizar(objetivo, restricciones, rhs);
  },

  minimizar(objetivo, restricciones, relaciones, rhs) {
    const simplex = new simplexMinModel();
    return simplex.minimizar(objetivo, restricciones, relaciones, rhs);
  },
};
