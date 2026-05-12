// ============================================================
// assets/js/simplexMinView.js
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  const selectVars  = document.getElementById('numVars');
  const selectRes   = document.getElementById('numRes');
  const btnResolver = document.getElementById('btnResolver');
  const btnLimpiar  = document.getElementById('btnLimpiar');

  renderFormulario();
  selectVars.addEventListener('change', () => { renderFormulario(); revisarInputs(); });
  selectRes.addEventListener('change',  () => { renderFormulario(); revisarInputs(); });
  document.addEventListener('input', revisarInputs);

  function revisarInputs() {
    const inputs = document.querySelectorAll('input[type="number"]');
    btnResolver.disabled = ![...inputs].every(i => i.value.trim() !== '');
  }

  btnLimpiar.addEventListener('click', () => {
    document.querySelectorAll('input[type="number"]').forEach(i => i.value = '');
    btnResolver.disabled = true;
    limpiarResultado();
  });

  btnResolver.addEventListener('click', () => {
    const numVars   = parseInt(selectVars.value);
    const numRes    = parseInt(selectRes.value);
    const resultado = SimplexController.resolverMin(numVars, numRes);
    mostrarResultado(resultado);
  });

  // ── Formulario ──────────────────────────────────────────────
  function renderFormulario() {
    const numVars = parseInt(selectVars.value);
    const numRes  = parseInt(selectRes.value);
    renderObjetivo(numVars);
    renderRestricciones(numVars, numRes);
    limpiarResultado();
  }

  function renderObjetivo(numVars) {
    const cont = document.getElementById('funcionObjetivo');
    cont.innerHTML = '<span class="texto-op fw-bold">Z =</span>';
    for (let j = 0; j < numVars; j++) {
      if (j > 0) cont.innerHTML += '<span class="texto-op">+</span>';
      cont.innerHTML += `
        <input type="number" class="form-control form-control-sm focus-min"
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
        if (j > 0) fila += '<span class="texto-op">+</span>';
        fila += `<input type="number" class="form-control form-control-sm focus-min"
                        id="c_${i}_${j}" placeholder="a${i+1}${j+1}" style="max-width:70px;"/>
                 <span class="texto-op">x<sub>${j+1}</sub></span>`;
      }
      fila += `<select class="form-select form-select-sm focus-min" id="rel_${i}" style="max-width:70px;">
                 <option value="<=">≤</option>
                 <option value=">=">≥</option>
                 <option value="=">=</option>
               </select>
               <input type="number" class="form-control form-control-sm focus-min"
                      id="rhs_${i}" placeholder="b${i+1}" style="max-width:75px;"/>
               </div>`;
      cont.innerHTML += fila;
    }
  }

  // ── Resultado ───────────────────────────────────────────────
  function limpiarResultado() {
    const box = document.getElementById('resultadoBox');
    box.style.cssText = 'opacity:0.4;';
    box.classList.remove('activo');
    box.innerHTML = `<h5><i class="bi bi-award me-2"></i>Resultado</h5>
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
      .map(([k, v]) => `<span class="badge me-1 px-3 py-2" style="background:var(--color-interaccion);color:var(--color-texto);font-size:.95rem;">
                          ${k} = ${fmt(v)}</span>`)
      .join('');

    box.innerHTML = `
      <h5><i class="bi bi-award me-2"></i>Solución Óptima</h5>
      <div class="mb-3 p-3 rounded" style="background:rgba(203,180,245,0.2); border:1px solid var(--color-interaccion);">
        <div class="fw-bold mb-1" style="font-size:1.3rem;">Z<sub>min</sub> = ${fmt(resultado.zOptimo)}</div>
        <div>${vars}</div>
      </div>
      <hr/>
      <h6 class="fw-bold mb-3"><i class="bi bi-table me-2"></i>Proceso iterativo — Paso a paso</h6>
      ${renderPasos(resultado.pasos, resultado.encabezados)}
      <hr/>
      ${renderResumenFinal(resultado)}
    `;
  }

  // ── Tablas paso a paso ──────────────────────────────────────
  function renderPasos(pasos, encabezados) {
    return pasos.map((paso, idx) => {
      const esInicial = paso.iteracion === 0;
      const esOptimo  = idx === pasos.length - 1;
      const titulo    = esInicial ? 'Tabla Inicial' : `Iteración ${paso.iteracion}`;
      const badge     = esOptimo
        ? `<span class="badge ms-2" style="background:var(--color-exito);color:#111;font-size:.75rem;">✓ Óptimo</span>`
        : (esInicial ? '' : `<span class="badge ms-2" style="background:var(--color-interaccion);color:#111;font-size:.75rem;">Pivote</span>`);

      return `
        <div class="mb-4">
          <div class="fw-bold mb-2" style="font-size:.95rem;">${titulo}${badge}</div>
          ${renderAnalisisPaso(paso, encabezados, esOptimo)}
          ${renderTablaPaso(paso, encabezados)}
        </div>`;
    }).join('');
  }

  function renderAnalisisPaso(paso, encabezados, esOptimo) {
    const { cj_zj, colPivote, filaPivote, base, razones, iteracion } = paso;

    if (iteracion === 0) {
      let minIdx = -1, minVal = 0;
      cj_zj.forEach((v, i) => { if (v !== null && v < minVal) { minVal = v; minIdx = i; } });
      const proxEntrada = minIdx >= 0
        ? `<strong>${encabezados[minIdx]}</strong> (cj−Zj = ${fmt(minVal)} — más negativo)`
        : '—';
      return `<div class="alert alert-sm mb-2 p-2" style="background:rgba(203,180,245,0.15);border:1px solid var(--color-interaccion);font-size:.83rem;">
        <strong>Base inicial:</strong> ${base.join(', ')} &nbsp;|&nbsp;
        <strong>Variable entrante:</strong> ${proxEntrada}
      </div>`;
    }

    if (esOptimo) {
      return `<div class="alert alert-sm mb-2 p-2" style="background:rgba(201,247,245,0.4);border:1px solid var(--color-exito);font-size:.83rem;">
        <strong>✓ Solución óptima alcanzada.</strong> Todos los cj−Zj ≥ 0 (ninguna variable reduce el costo).
        <br/>Base final: <strong>${base.join(', ')}</strong>
      </div>`;
    }

    const varEntra = colPivote >= 0 ? encabezados[colPivote] : '—';
    const varSale  = filaPivote >= 0 ? base[filaPivote] : '—';
    const razon    = filaPivote >= 0 && razones[filaPivote] !== null ? fmt(razones[filaPivote]) : '—';

    return `<div class="alert alert-sm mb-2 p-2" style="background:rgba(203,180,245,0.15);border:1px solid var(--color-interaccion);font-size:.83rem;">
      <strong>Entró:</strong> ${varEntra} &nbsp;|&nbsp;
      <strong>Salió:</strong> ${varSale} &nbsp;|&nbsp;
      <strong>Razón mínima:</strong> ${razon}
    </div>`;
  }

  function renderTablaPaso(paso, encabezados) {
    const { tabla, cb, base, zj, cj_zj, razones, colPivote, filaPivote } = paso;
    const cols = encabezados.length;

    let html = `<div style="overflow-x:auto;">
    <table class="table table-sm table-bordered mb-0" style="font-size:.8rem;min-width:500px;">
      <thead>
        <tr style="background:var(--color-navbar);">
          <th>CB</th><th>Base</th>`;

    encabezados.forEach((enc, j) => {
      html += `<th class="text-center" style="${j === colPivote ? 'background:rgba(203,180,245,0.35);' : ''}">${enc}</th>`;
    });
    html += `<th class="text-center">RHS</th><th class="text-center" style="background:var(--color-fondo);">Razón</th></tr>
      </thead><tbody>`;

    tabla.forEach((fila, i) => {
      const rowStyle = i === filaPivote ? 'background:rgba(203,180,245,0.18);font-weight:600;' : '';
      html += `<tr style="${rowStyle}">
        <td class="text-center">${fmt(cb[i])}</td>
        <td class="text-center fw-bold">${base[i]}</td>`;
      for (let j = 0; j < cols; j++) {
        const esPivot  = i === filaPivote && j === colPivote;
        const cellStyle = esPivot
          ? 'background:var(--color-interaccion);font-weight:900;border:2px solid #b49aed;'
          : (j === colPivote ? 'background:rgba(203,180,245,0.2);' : '');
        html += `<td class="text-center" style="${cellStyle}">${fmt(fila[j])}</td>`;
      }
      html += `<td class="text-center fw-bold">${fmt(fila[fila.length - 1])}</td>
               <td class="text-center" style="background:var(--color-fondo);color:#555;">${razones[i] !== null ? fmt(razones[i]) : '—'}</td>
               </tr>`;
    });

    html += `<tr style="background:var(--color-fondo);border-top:2px solid var(--color-borde);">
      <td colspan="2" class="fw-bold text-end">Zj</td>`;
    zj.slice(0, cols).forEach((v, j) => {
      html += `<td class="text-center" style="${j === colPivote ? 'background:rgba(203,180,245,0.2);' : ''}">${fmt(v)}</td>`;
    });
    html += `<td class="text-center fw-bold">${fmt(zj[zj.length - 1])}</td><td></td></tr>`;

    html += `<tr style="background:rgba(203,180,245,0.15);">
      <td colspan="2" class="fw-bold text-end">Cj − Zj</td>`;
    cj_zj.slice(0, cols).forEach((v, j) => {
      const highlight = j === colPivote ? 'background:rgba(203,180,245,0.3);' : '';
      const color     = v < -1e-9 ? 'color:#b91c1c;font-weight:700;' : (v > 1e-9 ? 'color:#16803d;' : '');
      html += `<td class="text-center" style="${highlight}${color}">${v !== null ? fmt(v) : '—'}</td>`;
    });
    html += `<td></td><td></td></tr></tbody></table></div>`;
    return html;
  }

  function renderResumenFinal(resultado) {
    const { zOptimo, variables } = resultado;
    const varsOriginales = Object.entries(variables).filter(([k]) => k.startsWith('x'));

    const filas = varsOriginales.map(([k, v]) => `
      <tr>
        <td class="text-center fw-bold" style="font-size:1.05rem;">${k}</td>
        <td class="text-center" style="font-size:1.05rem;">${fmt(v)}</td>
        <td class="text-center text-muted small">${Math.abs(v) <= 1e-9 ? 'No básica (no entra en la solución)' : 'Variable básica'}</td>
      </tr>`).join('');

    return `
      <div class="card-seccion" style="border:2px solid var(--color-interaccion); background:rgba(203,180,245,0.1);">
        <h5 class="fw-bold mb-3" style="font-size:1rem;">
          <i class="bi bi-check-circle-fill me-2" style="color:var(--color-interaccion-hover);"></i>
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
            <tr style="background:rgba(203,180,245,0.25); border-top:2px solid var(--color-interaccion);">
              <td class="fw-bold text-center" style="font-size:1.1rem;">Z<sub>min</sub></td>
              <td class="fw-bold text-center" style="font-size:1.1rem;">${fmt(zOptimo)}</td>
              <td class="text-center text-muted small">Valor mínimo de la función objetivo</td>
            </tr>
          </tfoot>
        </table>
        <div class="small p-2 rounded" style="background:rgba(203,180,245,0.18); border-left:3px solid var(--color-interaccion-hover);">
          <strong>Conclusión:</strong> La función objetivo alcanza su valor mínimo de
          <strong>${fmt(zOptimo)}</strong> cuando
          ${varsOriginales.filter(([,v]) => Math.abs(v) > 1e-9).map(([k,v]) => `<strong>${k} = ${fmt(v)}</strong>`).join(' y ')}.
          ${varsOriginales.filter(([,v]) => Math.abs(v) <= 1e-9).length > 0
            ? `Las variables ${varsOriginales.filter(([,v]) => Math.abs(v) <= 1e-9).map(([k]) => k).join(', ')} no participan en la solución óptima (valen 0).`
            : ''}
        </div>
      </div>`;
  }

  function fmt(n) {
    if (n === null || n === undefined) return '—';
    const r = Math.round(n * 1e6) / 1e6;
    if (Math.abs(r) > 1e5) return r.toExponential(2);
    return Number.isInteger(r) ? r.toString() : parseFloat(r.toFixed(4)).toString();
  }

});
