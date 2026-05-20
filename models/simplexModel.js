const SimplexModel = {
  maximizar(objetivo, restricciones, rhs) {
    return new simplexMaxModel().maximizar(objetivo, restricciones, rhs);
  },
  minimizar(objetivo, restricciones, relaciones, rhs) {
    return new simplexMinModel().minimizar(objetivo, restricciones, relaciones, rhs);
  },
};
