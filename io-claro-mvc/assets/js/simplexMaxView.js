// ============================================================
// assets/js/simplexMaxView.js
// VISTA — Genera el formulario y maneja eventos (Maximizar)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  const selectVars = document.getElementById('numVars');
  const selectRes  = document.getElementById('numRes');
  const btnResolver = document.getElementById('btnResolver');
  const btnLimpiar  = document.getElementById('btnLimpiar');

  // Renderizar al cargar y al cambiar los selects
  renderFormulario();
  selectVars.addEventListener('change', renderFormulario);
  selectRes.addEventListener('change',  renderFormulario);

  // Botón limpiar
  btnLimpiar.addEventListener('click', () => {
    document.querySelectorAll('input[type="number"]').forEach(i => i.value = '');
  });

  // Botón resolver (por ahora no hace nada)
  btnResolver.addEventListener('click', () => {
    const numVars = parseInt(selectVars.value);
    const numRes  = parseInt(selectRes.value);
    const resultado = SimplexController.resolverMax(numVars, numRes);
    // TODO: mostrar resultado cuando el modelo esté implementado
    console.log('Resultado:', resultado);
  });

  // ── Genera los inputs del formulario ──────────────────────
  function renderFormulario() {
    const numVars = parseInt(selectVars.value);
    const numRes  = parseInt(selectRes.value);
    renderObjetivo(numVars);
    renderRestricciones(numVars, numRes);
  }

  function renderObjetivo(numVars) {
    const cont = document.getElementById('funcionObjetivo');
    cont.innerHTML = '<span class="texto-op">Z =</span>';

    for (let j = 0; j < numVars; j++) {
      if (j > 0) cont.innerHTML += '<span class="texto-op">+</span>';
      cont.innerHTML += `
        <input type="number" class="form-control form-control-sm focus-max"
               id="obj_${j}" placeholder="c${j+1}" style="max-width:75px;"/>
        <span class="texto-op">x${j+1}</span>`;
    }
  }

  function renderRestricciones(numVars, numRes) {
    const cont = document.getElementById('restricciones');
    cont.innerHTML = '';

    for (let i = 0; i < numRes; i++) {
      let fila = `<div class="fila-restriccion">
        <span class="label-r">R${i+1}</span>`;

      for (let j = 0; j < numVars; j++) {
        if (j > 0) fila += '<span class="texto-op">+</span>';
        fila += `
          <input type="number" class="form-control form-control-sm focus-max"
                 id="c_${i}_${j}" placeholder="a${i+1}${j+1}" style="max-width:70px;"/>
          <span class="texto-op">x${j+1}</span>`;
      }

      fila += `
        <span class="texto-op">≤</span>
        <input type="number" class="form-control form-control-sm focus-max"
               id="rhs_${i}" placeholder="b${i+1}" style="max-width:75px;"/>
      </div>`;

      cont.innerHTML += fila;
    }
  }

});
