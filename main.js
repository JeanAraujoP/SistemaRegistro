/* ═══════════════════════════════════════
   SISTEMA DE REGISTRO — main.js
   Lógica completa de la tabla editable
════════════════════════════════════════ */

const MAX_ROWS = 200;
let rows = [];
let nextId = 1;

/* ─── Inicialización ─────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  if (rows.length === 0) {
    createEmptyRow();
  }
  renderAll();
});

/* ─── Persistencia en localStorage ──────── */
function saveToStorage() {
  try {
    localStorage.setItem('registroRows', JSON.stringify(rows));
    localStorage.setItem('registroNextId', String(nextId));
  } catch (e) {}
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem('registroRows');
    const savedId = localStorage.getItem('registroNextId');
    if (saved) {
      rows = JSON.parse(saved);
      nextId = savedId ? parseInt(savedId, 10) : rows.length + 1;
    }
  } catch (e) {
    rows = [];
    nextId = 1;
  }
}

/* ─── Crear objeto de fila vacía ─────────── */
function createEmptyRow() {
  const newRow = {
    id: nextId++,
    nListado: '',
    nombreEmpresa: '',
    liderContratacion: '',
    fechaInicio: '',
    fechaCierreFin: '',
    fechaCierreMaximo: '',
    numero: '',
    correo: '',
    estado: '',
    fechaCierre: ''
  };
  rows.push(newRow);
  saveToStorage();
  return newRow;
}

/* ─── Agregar fila (llamada desde el botón) ─ */
function addRow() {
  if (rows.length > 0) {
    const lastRow = rows[rows.length - 1];
    if (!isRowComplete(lastRow)) {
      showValidationBanner();
      highlightIncompleteRow(lastRow.id);
      return;
    }
  }

  if (rows.length >= MAX_ROWS) {
    showLimitBanner();
    return;
  }

  hideValidationBanner();
  createEmptyRow();
  renderAll();

  requestAnimationFrame(() => {
    const tbody = document.getElementById('tableBody');
    const lastTr = tbody.lastElementChild;
    if (lastTr) {
      const firstInput = lastTr.querySelector('input');
      if (firstInput) firstInput.focus();
    }
  });
}

/* ─── Eliminar fila ──────────────────────── */
function deleteRow(id) {
  rows = rows.filter(r => r.id !== id);
  saveToStorage();
  hideValidationBanner();
  renderAll();
  showToast('Fila eliminada correctamente', 'success');
}

/* ─── Borrar todo ────────────────────────── */
function exportData() {
  if (rows.length === 0) {
    showToast('No hay registros para borrar', 'error');
    return;
  }

  if (!confirm('¿Estás seguro de que deseas borrar todos los registros? Esta acción no se puede deshacer.')) {
    return;
  }

  rows = [];
  nextId = 1;

  try {
    localStorage.removeItem('registroRows');
    localStorage.removeItem('registroNextId');
  } catch (e) {}

  hideValidationBanner();
  hideLimitBanner();

  const tbody = document.getElementById('tableBody');
  if (tbody) tbody.innerHTML = '';

  const countEl = document.getElementById('rowCount');
  if (countEl) countEl.textContent = '0';

  const totalEl = document.getElementById('totalRegistros');
  if (totalEl) totalEl.textContent = '0';

  const espacioEl = document.getElementById('espacioDisponible');
  if (espacioEl) espacioEl.textContent = '200';

  const addBtn = document.getElementById('addBtn');
  if (addBtn) addBtn.disabled = false;

  showToast('Todos los registros han sido eliminados', 'success');
}

/* ─── Actualizar campo de una fila ──────── */
function updateField(id, field, value) {
  const row = rows.find(r => r.id === id);
  if (!row) return;

  row[field] = value;
  saveToStorage();
  updateFooter();

  const input = document.querySelector(`[data-id="${id}"][data-field="${field}"]`);
  if (input) {
    const isEmpty = value.trim() === '';
    /* Los select muestran estado con clases igual que los inputs */
    if (!isEmpty) {
      input.classList.remove('input-error');
      input.classList.add('input-ok');
    } else {
      input.classList.remove('input-ok');
    }
  }
}

/* ─── Validación ─────────────────────────── */
function isRowComplete(row) {
  return (
    row.nListado.trim()            !== '' &&
    row.nombreEmpresa.trim()       !== '' &&
    row.liderContratacion.trim()   !== '' &&
    row.fechaInicio.trim()         !== '' &&
    row.fechaCierreFin.trim()      !== '' &&
    row.fechaCierreMaximo.trim()   !== '' &&
    row.numero.trim()              !== '' &&
    row.correo.trim()              !== '' &&
    row.estado.trim()              !== '' &&
    row.fechaCierre.trim()         !== ''
  );
}

function highlightIncompleteRow(id) {
  const tr = document.querySelector(`tr[data-row-id="${id}"]`);
  if (tr) {
    tr.scrollIntoView({ behavior: 'smooth', block: 'center' });

    /* Marcar en rojo cada campo vacío de esa fila */
    const fields = tr.querySelectorAll('[data-id]');
    fields.forEach(el => {
      const isEmpty = el.value === '' || el.value.trim() === '';
      if (isEmpty) {
        el.classList.remove('input-ok');
        el.classList.add('input-error');
      } else {
        el.classList.remove('input-error');
        el.classList.add('input-ok');
      }
    });
  }
}

/* ─── Renderizado completo ───────────────── */
function renderAll() {
  renderTable();
  updateHeader();
  updateFooter();
  updateLimitBanner();
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  rows.forEach((row, index) => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-row-id', row.id);

    /* Opciones del select de Estado */
    const estadoOptions = ['', 'Activo', 'En Proceso', 'Cerrado', 'Cancelado']
      .map(opt => {
        const selected = row.estado === opt ? 'selected' : '';
        const label    = opt === '' ? 'Seleccionar...' : opt;
        return `<option value="${opt}" ${selected}>${label}</option>`;
      })
      .join('');

    tr.innerHTML = `
      <td>${index + 1}</td>

      <!-- N° Listado -->
      <td>
        <input class="cell-input" type="text" placeholder="Ej: 001"
          value="${escapeHtml(row.nListado)}"
          data-id="${row.id}" data-field="nListado" maxlength="20"
          oninput="updateField(${row.id}, 'nListado', this.value)" />
      </td>

      <!-- Nombre Empresa -->
      <td>
        <input class="cell-input" type="text" placeholder="Nombre de la empresa"
          value="${escapeHtml(row.nombreEmpresa)}"
          data-id="${row.id}" data-field="nombreEmpresa" maxlength="80"
          oninput="updateField(${row.id}, 'nombreEmpresa', this.value)" />
      </td>

      <!-- Líder de Contratación -->
      <td>
        <input class="cell-input" type="text" placeholder="Nombre del líder"
          value="${escapeHtml(row.liderContratacion)}"
          data-id="${row.id}" data-field="liderContratacion" maxlength="60"
          oninput="updateField(${row.id}, 'liderContratacion', this.value)" />
      </td>

      <!-- Fecha Inicio -->
      <td>
        <input class="cell-input" type="date"
          value="${escapeHtml(row.fechaInicio)}"
          data-id="${row.id}" data-field="fechaInicio"
          onchange="updateField(${row.id}, 'fechaInicio', this.value)" />
      </td>

      <!-- Fecha Cierre Fin (NUEVA) -->
      <td>
        <input class="cell-input" type="date"
          value="${escapeHtml(row.fechaCierreFin)}"
          data-id="${row.id}" data-field="fechaCierreFin"
          onchange="updateField(${row.id}, 'fechaCierreFin', this.value)" />
      </td>

      <!-- Fecha Cierre Máximo (NUEVA) -->
      <td>
        <input class="cell-input" type="date"
          value="${escapeHtml(row.fechaCierreMaximo)}"
          data-id="${row.id}" data-field="fechaCierreMaximo"
          onchange="updateField(${row.id}, 'fechaCierreMaximo', this.value)" />
      </td>

      <!-- Número -->
      <td>
        <input class="cell-input" type="tel" placeholder="Teléfono"
          value="${escapeHtml(row.numero)}"
          data-id="${row.id}" data-field="numero" maxlength="20"
          oninput="updateField(${row.id}, 'numero', this.value)" />
      </td>

      <!-- Correo -->
      <td>
        <input class="cell-input" type="email" placeholder="correo@ejemplo"
          value="${escapeHtml(row.correo)}"
          data-id="${row.id}" data-field="correo" maxlength="100"
          oninput="updateField(${row.id}, 'correo', this.value)" />
      </td>

      <!-- Estado (NUEVA) -->
      <td>
        <select class="cell-input cell-select"
          data-id="${row.id}" data-field="estado"
          onchange="updateField(${row.id}, 'estado', this.value)">
          ${estadoOptions}
        </select>
      </td>

      <!-- Fecha Cierre -->
      <td>
        <input class="cell-input" type="date"
          value="${escapeHtml(row.fechaCierre)}"
          data-id="${row.id}" data-field="fechaCierre"
          onchange="updateField(${row.id}, 'fechaCierre', this.value)" />
      </td>

      <!-- Acción: eliminar -->
      <td>
        <button class="btn-delete" onclick="deleteRow(${row.id})" title="Eliminar fila">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

/* ─── Actualizar encabezado ──────────────── */
function updateHeader() {
  const countEl = document.getElementById('rowCount');
  if (countEl) countEl.textContent = rows.length;

  const addBtn = document.getElementById('addBtn');
  if (addBtn) addBtn.disabled = rows.length >= MAX_ROWS;
}

/* ─── Actualizar pie de tabla ────────────── */
function updateFooter() {
  const totalEl   = document.getElementById('totalRegistros');
  const espacioEl = document.getElementById('espacioDisponible');
  if (totalEl)   totalEl.textContent   = rows.length;
  if (espacioEl) espacioEl.textContent = MAX_ROWS - rows.length;
}

/* ─── Banners ────────────────────────────── */
function showLimitBanner() {
  const banner = document.getElementById('limitBanner');
  if (banner) banner.style.display = 'block';
}

function hideLimitBanner() {
  const banner = document.getElementById('limitBanner');
  if (banner) banner.style.display = 'none';
}

function updateLimitBanner() {
  if (rows.length >= MAX_ROWS) showLimitBanner();
  else hideLimitBanner();
}

function showValidationBanner() {
  const banner = document.getElementById('validationBanner');
  if (banner) banner.classList.add('visible');
}

function hideValidationBanner() {
  const banner = document.getElementById('validationBanner');
  if (banner) banner.classList.remove('visible');
}

/* ─── Toast ──────────────────────────────── */
let toastTimeout = null;

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const msg   = document.getElementById('toastMsg');
  if (!toast || !msg) return;

  toast.classList.remove('show', 'success', 'error');
  msg.textContent = message;
  toast.classList.add(type);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
  });

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ─── Utilidades ─────────────────────────── */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
