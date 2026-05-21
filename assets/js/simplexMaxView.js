// ============================================================
// assets/js/simplexMaxView.js
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  let ultimaTablaFinal = null;
  let ultimosEncabezados = null;
  let ultimaBase = null;
  let ultimoZjCj = null;
  let ultimoB = null;
  const inputVars   = document.getElementById('numVars');
  const inputRes    = document.getElementById('numRes');
  const btnAplicar  = document.getElementById('btnAplicar');
  const btnResolver = document.getElementById('btnResolver');
  const btnLimpiar  = document.getElementById('btnLimpiar');
  const configError = document.getElementById('configError');

  // ── Inicializar formulario con valores por defecto ──────────
  renderFormulario();

  // ── Aplicar configuración ───────────────────────────────────
  btnAplicar.addEventListener('click', () => {
    if (validarConfiguracion()) {
      renderFormulario();
      revisarInputs();
    }
  });

  // Aplicar también con Enter en los inputs de config
  [inputVars, inputRes].forEach(inp => {
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') btnAplicar.click();
    });
  });

  document.addEventListener('input', e => {
    if (e.target.id !== 'numVars' && e.target.id !== 'numRes') {
      revisarInputs();
      actualizarSignos();
    }
  });

  // ── Validar configuración ───────────────────────────────────
  function validarConfiguracion() {
    const v = parseInt(inputVars.value);
    const r = parseInt(inputRes.value);
    configError.style.display = 'none';

    if (isNaN(v) || v < 2 || v > 10) {
      mostrarConfigError('Variables: ingresa un número entre 2 y 10.');
      return false;
    }
    if (isNaN(r) || r < 1 || r > 15) {
      mostrarConfigError('Restricciones: ingresa un número entre 1 y 15.');
      return false;
    }
    return true;
  }

  function mostrarConfigError(msg) {
    configError.textContent = msg;
    configError.style.display = 'inline';
  }

  // ── Revisar si todos los inputs tienen valor ────────────────
  function revisarInputs() {
    const inputs = document.querySelectorAll('#funcionObjetivo input[type="number"], #restricciones input[type="number"]');
    btnResolver.disabled = inputs.length === 0 || ![...inputs].every(i => i.value.trim() !== '');
  }

  // ── Limpiar solo campos de datos ────────────────────────────
  btnLimpiar.addEventListener('click', () => {
    document.querySelectorAll('#funcionObjetivo input[type="number"], #restricciones input[type="number"]')
      .forEach(i => i.value = '');
    btnResolver.disabled = true;
    limpiarResultado();
  });

  // ── Calcular ────────────────────────────────────────────────
  btnResolver.addEventListener('click', () => {
    const numVars = parseInt(inputVars.value);
    const numRes  = parseInt(inputRes.value);
    mostrarSpinner(true);
    limpiarResultado();

    // setTimeout para que el spinner sea visible antes del cálculo síncrono
    setTimeout(() => {
      const resultado = SimplexController.resolverMax(numVars, numRes);
      mostrarSpinner(false);
      mostrarResultado(resultado);
    }, 30);
  });

  // ── Formulario ──────────────────────────────────────────────
  function renderFormulario() {
    const numVars = parseInt(inputVars.value) || 2;
    const numRes  = parseInt(inputRes.value)  || 2;
    renderObjetivo(numVars);
    renderRestricciones(numVars, numRes);
    limpiarResultado();
  }

  function renderObjetivo(numVars) {
    const cont = document.getElementById('funcionObjetivo');
    cont.innerHTML = '<span class="texto-op fw-bold">Z =</span>';
    for (let j = 0; j < numVars; j++) {
      if (j > 0) cont.innerHTML += `<span class="texto-op signo-dinamico" id="signo_obj_${j}"></span>`;
      cont.innerHTML += `
        <input type="number" class="form-control form-control-sm focus-max"
               id="obj_${j}" placeholder="c${j+1}" style="max-width:75px;"/>
        <span class="texto-op">x<sub>${j+1}</sub></span>`;
    }
  }

  function renderRestricciones(numVars, numRes) {
    const cont = document.getElementById('restricciones');
    cont.innerHTML = '';
    for (let i = 0; i < numRes; i++) {
      let fila = `<div class="fila-restriccion"><span class="label-r">R${i+1}</span>`;
      for (let j = 0; j < numVars; j++) {
        if (j > 0) fila += `<span class="texto-op signo-dinamico" id="signo_c_${i}_${j}"></span>`;
        fila += `<input type="number" class="form-control form-control-sm focus-max"
                        id="c_${i}_${j}" placeholder="a${i+1}${j+1}" style="max-width:70px;"/>
                 <span class="texto-op">x<sub>${j+1}</sub></span>`;
      }
      fila += `<span class="texto-op">≤</span>
               <input type="number" class="form-control form-control-sm focus-max"
                      id="rhs_${i}" placeholder="b${i+1}" style="max-width:75px;"/>
               </div>`;
      cont.innerHTML += fila;
    }
  }

  // Actualiza los signos dinámicos entre términos según el valor del input siguiente
  function actualizarSignos() {
    document.querySelectorAll('.signo-dinamico').forEach(span => {
      // El input al que pertenece este signo está justo después en el DOM
      const inputId = span.id.replace('signo_', '');
      const input   = document.getElementById(inputId);
      if (!input) return;
      const val = parseFloat(input.value);
      if (input.value.trim() === '' || isNaN(val)) {
        span.textContent = '+';   // placeholder neutro cuando está vacío
      } else {
        span.textContent = val < 0 ? '−' : '+';
      }
    });
  }

  // ── Spinner ─────────────────────────────────────────────────
  function mostrarSpinner(visible) {
    const spinner = document.getElementById('spinnerBox');
    spinner.classList.toggle('visible', visible);
  }

  // ── Resultado ───────────────────────────────────────────────
  function limpiarResultado() {
    const box = document.getElementById('resultadoBox');
    box.style.cssText = 'opacity:0.4;';
    box.classList.remove('activo');
    box.innerHTML = `<h5><i class="bi bi-trophy me-2"></i>Resultado</h5>
                     <p class="mb-0 small">El resultado aparecerá aquí.</p>`;
  }

  function mostrarResultado(resultado) {
    const box = document.getElementById('resultadoBox');

    if (!resultado) { limpiarResultado(); return; }

    if (resultado.error) {
      box.style.cssText = 'opacity:1; border-color:#f87171; background:#fee2e2;';
      box.classList.remove('activo');
      box.innerHTML = `<h5><i class="bi bi-exclamation-triangle me-2"></i>Error</h5>
                       <p class="mb-0">${resultado.error}</p>`;
      return;
    }

    box.style.cssText = 'opacity:1;';
    box.classList.add('activo');

    const vars = Object.entries(resultado.variables)
      .filter(([k]) => k.startsWith('x'))
      .map(([k, v]) => `<span class="badge me-1 px-3 py-2" style="background:var(--color-primario);color:var(--color-texto);font-size:.95rem;">
                          ${k} = ${fmt(v)}</span>`)
      .join('');

    const totalIter = resultado.pasos.length - 1;
    const data = resultado;
    ultimaTablaFinal = data.tablaFinal;
    ultimosEncabezados = data.encabezados;
    ultimaBase = data.baseFinal;
    ultimoZjCj = data.zj_cjFinal;
    ultimoCb = data.cbFinal;

    box.innerHTML = `
  <h5><i class="bi bi-trophy me-2"></i>Solución Óptima</h5>

  <div class="mb-3 p-3 rounded" style="background:rgba(163,206,241,0.25); border:1px solid var(--color-primario);">
    <div class="fw-bold mb-1" style="font-size:1.3rem;">
      Z<sub>max</sub> = ${fmt(resultado.zOptimo)}
    </div>
    <div>${vars}</div>
  </div>

  <hr/>

  <h6 class="fw-bold mb-1">
    <i class="bi bi-table me-2"></i>
    Proceso iterativo — Paso a paso
  </h6>

  <p class="resumen-iter-total">
    ${totalIter} iteración${totalIter !== 1 ? 'es' : ''} hasta la solución óptima
  </p>

  ${renderPasos(resultado.pasos, resultado.encabezados)}

  <hr/>

  ${renderResumenFinal(resultado)}

  <div class="analisis-sensibilidad mt-4">

    <h5 class="fw-bold">
      <i class="bi bi-graph-up me-2"></i>
      Análisis de Sensibilidad
    </h5>

    <label class="fw-bold">Seleccione una opción:</label>

    <select id="tipoSensibilidad" class="form-select mb-3"
            onchange="mostrarOpcionesSensibilidad()">

      <option value="">Seleccione...</option>

      <option value="nobasica">
        Cambiar coeficiente Z de variable NO básica
      </option>

      <option value="basica">
        Cambiar coeficiente Z de variable básica
      </option>

      <option value="bj">
        Cambiar valor b_j de una restricción
      </option>

    </select>

    <div id="contenedorSensibilidad"></div>

  </div>
`;
  }

  // ── Tablas paso a paso ──────────────────────────────────────
  function renderPasos(pasos, encabezados) {
    return pasos.map((paso, idx) => {
      const esInicial = paso.iteracion === 0;
      const esOptimo  = idx === pasos.length - 1;

      const badgeOptimo = esOptimo
        ? `<span class="badge ms-2" style="background:var(--color-exito);color:#111;font-size:.72rem;">✓ Óptimo</span>`
        : '';
      const badgePivote = !esInicial && !esOptimo
        ? `<span class="badge ms-2" style="background:var(--color-interaccion);color:#111;font-size:.72rem;">Pivote</span>`
        : '';

      return `
        <div class="mb-4">
          <div class="iter-header">
            <span class="iter-numero">${esInicial ? '0' : paso.iteracion}</span>
            <span class="iter-titulo">${esInicial ? 'Tabla Inicial' : `Iteración ${paso.iteracion}`}</span>
            ${badgeOptimo}${badgePivote}
          </div>
          ${renderAnalisisPaso(paso, encabezados, esOptimo)}
          ${renderTablaPaso(paso, encabezados, 'max')}
        </div>`;
    }).join('');
  }

  function renderAnalisisPaso(paso, encabezados, esOptimo) {
    const { cj_zj, colPivote, filaPivote, base, razones, iteracion } = paso;

    if (iteracion === 0) {
      let maxIdx = -1, maxVal = 0;
      cj_zj.forEach((v, i) => { if (v !== null && v > maxVal) { maxVal = v; maxIdx = i; } });
      const proxEntrada = maxIdx >= 0
        ? `<strong>${encabezados[maxIdx]}</strong> (cj−Zj = ${fmt(maxVal)})`
        : 'ninguna — ya es óptima';
      return `<div class="iter-resumen-bar inicial">
        <i class="bi bi-info-circle"></i>
        <span><strong>Base inicial:</strong> ${base.join(', ')} &nbsp;·&nbsp; <strong>Variable entrante:</strong> ${proxEntrada}</span>
      </div>`;
    }

    if (esOptimo) {
      return `<div class="iter-resumen-bar optimo">
        <i class="bi bi-check-circle-fill"></i>
        <span><strong>Solución óptima.</strong> Todos los cj−Zj ≤ 0. &nbsp;·&nbsp; Base final: <strong>${base.join(', ')}</strong></span>
      </div>`;
    }

    const varEntra = colPivote >= 0 ? encabezados[colPivote] : '—';
    const varSale  = filaPivote >= 0 ? base[filaPivote] : '—';
    const razon    = filaPivote >= 0 && razones[filaPivote] !== null ? fmt(razones[filaPivote]) : '—';

    let maxIdx = -1, maxVal = 0;
    cj_zj.forEach((v, i) => { if (v !== null && v > maxVal) { maxVal = v; maxIdx = i; } });
    const proxInfo = maxIdx >= 0
      ? `&nbsp;·&nbsp; <strong>Próxima entrante:</strong> ${encabezados[maxIdx]} (${fmt(maxVal)})`
      : '';

    return `<div class="iter-resumen-bar pivote">
      <i class="bi bi-arrow-left-right"></i>
      <span><strong>Entró:</strong> ${varEntra} &nbsp;·&nbsp; <strong>Salió:</strong> ${varSale} &nbsp;·&nbsp; <strong>Razón:</strong> ${razon}${proxInfo}</span>
    </div>`;
  }

  function decimalAFraccion(numero) {

  if (Number.isInteger(numero)) {
    return numero.toString();
  }

  let negativo = numero < 0;
  numero = Math.abs(numero);

  let tolerancia = 1.0E-6;
  let h1 = 1, h2 = 0;
  let k1 = 0, k2 = 1;
  let b = numero;

  do {
    let a = Math.floor(b);

    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;

    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;

    b = 1 / (b - a);

  } while (Math.abs(numero - h1 / k1) > numero * tolerancia);

  let resultado = `${h1}/${k1}`;

  return negativo ? `-${resultado}` : resultado;
  }
  
  function renderTablaPaso(paso, encabezados, tipo) {
    const { tabla, cb, base, zj, cj_zj, razones, colPivote, filaPivote } = paso;
    const cols = encabezados.length;

    let html = `<div style="overflow-x:auto;">
    <table class="table table-sm table-bordered mb-0" style="font-size:.8rem;min-width:500px;">
      <thead>
        <tr style="background:var(--color-navbar);">
          <th class="text-center">CB</th>
          <th class="text-center">Base</th>`;

    encabezados.forEach((enc, j) => {
      const esPivotCol = j === colPivote;
      html += `<th class="text-center${esPivotCol ? ' col-pivote-bg' : ''}">${enc}</th>`;
    });
    html += `<th class="text-center">RHS</th>
             <th class="text-center col-razon">Razón</th>
             </tr></thead><tbody>`;

    tabla.forEach((fila, i) => {
      const esPivotFila = i === filaPivote;
      html += `<tr class="${esPivotFila ? 'fila-pivote-bg' : ''}">
        <td class="text-center">${fmt(cb[i])}</td>
        <td class="text-center fw-bold">${base[i]}</td>`;
      for (let j = 0; j < cols; j++) {
        const esPivot   = i === filaPivote && j === colPivote;
        const colClass  = j === colPivote ? ' col-pivote-bg' : '';
        const pivotClass = esPivot ? ' celda-pivote' : '';
        html += `<td class="text-center${colClass}${pivotClass}">${fmt(fila[j])}</td>`;
      }
      const razon = razones[i] !== null ? fmt(razones[i]) : '—';
      html += `<td class="text-center fw-bold">${fmt(fila[fila.length - 1])}</td>
               <td class="text-center col-razon">${razon}</td>
               </tr>`;
    });

    // Fila Zj
    html += `<tr class="fila-zj">
      <td colspan="2" class="fw-bold text-end">Zj</td>`;
    zj.slice(0, cols).forEach((v, j) => {
      html += `<td class="text-center${j === colPivote ? ' col-pivote-bg' : ''}">${fmt(v)}</td>`;
    });
    html += `<td class="text-center fw-bold">${fmt(zj[zj.length - 1])}</td><td></td></tr>`;

    // Fila Cj - Zj
    html += `<tr class="fila-cjzj-max">
      <td colspan="2" class="fw-bold text-end">Cj − Zj</td>`;
    cj_zj.slice(0, cols).forEach((v, j) => {
      const colClass = j === colPivote ? ' col-pivote-bg' : '';
      let valClass = '';
      if (v !== null) {
        if (v > 1e-9)  valClass = ' cjzj-positivo';
        if (v < -1e-9) valClass = ' cjzj-negativo';
      }
      html += `<td class="text-center${colClass}${valClass}">${v !== null ? fmt(v) : '—'}</td>`;
    });
    html += `<td></td><td></td></tr>`;
    html += `</tbody></table></div>`;
    return html;
  }

  // ── Resumen final ───────────────────────────────────────────
  function renderResumenFinal(resultado) {
    const { zOptimo, variables } = resultado;
    const varsOriginales = Object.entries(variables).filter(([k]) => k.startsWith('x'));

    const filas = varsOriginales.map(([k, v]) => `
      <tr>
        <td class="text-center fw-bold" style="font-size:1.05rem;">${k}</td>
        <td class="text-center" style="font-size:1.05rem;">${fmt(v)}</td>
        <td class="text-center text-muted small">
          ${Math.abs(v) <= 1e-9 ? 'No básica (valor = 0)' : 'Variable básica'}
        </td>
      </tr>`).join('');

    const activas = varsOriginales.filter(([,v]) => Math.abs(v) > 1e-9);
    const nulas   = varsOriginales.filter(([,v]) => Math.abs(v) <= 1e-9);

    return `
      <div class="card-seccion" style="border:2px solid var(--color-primario); background:rgba(163,206,241,0.12);">
        <h5 class="fw-bold mb-3" style="font-size:1rem;">
          <i class="bi bi-check-circle-fill me-2" style="color:var(--color-primario-hover);"></i>
          Solución Óptima Final
        </h5>
        <table class="table table-sm table-bordered mb-3" style="font-size:.9rem;">
          <thead style="background:var(--color-navbar);">
            <tr>
              <th class="text-center">Variable</th>
              <th class="text-center">Valor</th>
              <th class="text-center">Interpretación</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
          <tfoot>
            <tr style="background:rgba(163,206,241,0.25); border-top:2px solid var(--color-primario);">
              <td class="fw-bold text-center" style="font-size:1.1rem;">Z<sub>max</sub></td>
              <td class="fw-bold text-center" style="font-size:1.1rem;">${fmt(zOptimo)}</td>
              <td class="text-center text-muted small">Valor máximo de la función objetivo</td>
            </tr>
          </tfoot>
        </table>
        <div class="small p-2 rounded" style="background:rgba(163,206,241,0.2); border-left:3px solid var(--color-primario-hover);">
          <strong>Conclusión:</strong> La función objetivo alcanza su valor máximo de
          <strong>${fmt(zOptimo)}</strong> cuando
          ${activas.map(([k,v]) => `<strong>${k} = ${fmt(v)}</strong>`).join(' y ')}.
          ${nulas.length > 0
            ? ` Las variables ${nulas.map(([k]) => k).join(', ')} no participan en la solución óptima (valen 0).`
            : ''}
        </div>
      </div>`;
  }

  window.mostrarOpcionesSensibilidad = function() {

  const tipo = document.getElementById('tipoSensibilidad').value;
  const contenedor = document.getElementById('contenedorSensibilidad');

  contenedor.innerHTML = '';

  if (tipo === 'nobasica') {

    let html = `
      <label>Variable NO básica:</label>

      <select id="variableNoBasica" class="form-select mb-2">
    `;

    ultimosEncabezados.forEach(v => {

      if (!ultimaBase.includes(v)) {

        html += `<option value="${v}">${v}</option>`;
      }
    });

    html += `
      </select>

      <button class="btn btn-primary"
              onclick="analizarNoBasica()">

        Calcular rango

      </button>

      <div id="resultadoSensibilidad" class="mt-3"></div>
    `;

    contenedor.innerHTML = html;
  }

  else if (tipo === 'basica') {

    let html = `
      <label>Variable básica:</label>

      <select id="variableBasica" class="form-select mb-2">
    `;

    ultimaBase.forEach(v => {

      html += `<option value="${v}">${v}</option>`;
    });

    html += `
      </select>

      <button class="btn btn-primary"
              onclick="analizarBasica()">

        Calcular rango

      </button>

      <div id="resultadoSensibilidad" class="mt-3"></div>
    `;

    contenedor.innerHTML = html;
  }

  else if (tipo === 'bj') {

    let html = `
      <label>Restricción:</label>

      <select id="restriccionBJ" class="form-select mb-2">
    `;

    for (let i = 0; i < ultimaBase.length; i++) {

      html += `
        <option value="${i}">
          Restricción ${i + 1}
        </option>
      `;
    }

    html += `
      </select>

      <button class="btn btn-primary"
              onclick="analizarBJ()">

        Calcular rango

      </button>

      <div id="resultadoSensibilidad" class="mt-3"></div>
    `;

    contenedor.innerHTML = html;
  }
};


window.analizarNoBasica = function() {

  const variable =
    document.getElementById('variableNoBasica').value;

  document.getElementById('resultadoSensibilidad').innerHTML = `

    <div class="alert alert-info">

      El coeficiente de Z de
      <strong>${variable}</strong>

      puede variar mientras:

      <strong>Cj - Zj ≤ 0</strong>

    </div>
  `;
};


window.analizarBasica = function() {

  const variable =
    document.getElementById('variableBasica').value;

  document.getElementById('resultadoSensibilidad').innerHTML = `

    <div class="alert alert-warning">

      La variable básica
      <strong>${variable}</strong>

      puede cambiar mientras la base siga siendo factible.

    </div>
  `;
};


window.analizarBJ = function() {

  const indice =
    parseInt(document.getElementById('restriccionBJ').value);

  const valorActual = ultimoB[indice];

  document.getElementById('resultadoSensibilidad').innerHTML = `

    <div class="alert alert-success">

      Restricción seleccionada:
      <strong>${indice + 1}</strong>

      <br><br>

      Valor actual:
      <strong>${fmt(valorActual)}</strong>

      <br><br>

      El rango permitido mantiene la factibilidad.

    </div>
  `;
};
  
  function fmt(valor) {

  if (valor === null || valor === undefined || isNaN(valor)) {
    return '—';
  }

  if (Math.abs(valor - Math.round(valor)) < 1e-9) {
    return Math.round(valor).toString();
  }

  return decimalAFraccion(valor);
  }

});
