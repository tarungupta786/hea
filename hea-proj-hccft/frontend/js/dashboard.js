/**
 * dashboard.ts → compiled to dashboard.js
 * Main dashboard logic — TypeScript enhanced version
 */

const DASHBOARD_API = 'http://localhost:5000/api';
let autoRefreshTimer = null;

// ── Auth guard ──────────────────────────────────────────────────
if (!sessionStorage.getItem('hea_auth')) window.location.href = 'index.html';

// ── Main loader ─────────────────────────────────────────────────
async function loadDashboard() {
  try {
    const [dashboard, patients] = await Promise.all([
      fetch(`${DASHBOARD_API}/dashboard`).then(r => r.json()),
      fetch(`${DASHBOARD_API}/patients`).then(r => r.json()),
    ]);

    renderAlerts(dashboard.alerts || []);
    renderStats(dashboard);
    renderWardOccupancy(dashboard.bed_summary || []);
    renderResources(dashboard.resources || []);
    renderPatients(patients);

    document.getElementById('last-updated').textContent =
      'Last updated: ' + new Date().toLocaleTimeString('en-IN');
  } catch (e) {
    const errorHTML = `
      <div class="empty-data-alert" style="grid-column: 1 / -1;">
        <span>🔌</span>
        <strong>No data available</strong>
        <p style="font-size:12px;">Connect backend to view insights</p>
      </div>
    `;
    document.getElementById('alerts-container').innerHTML = `
      <div class="alert alert-critical" style="margin-bottom:24px;">
        ⚠ Cannot reach API at ${DASHBOARD_API} — Connect backend to view insights.
      </div>`;

    document.getElementById('stats-grid').innerHTML = errorHTML;
    document.getElementById('ward-occupancy').innerHTML = errorHTML;
    document.getElementById('resources-list').innerHTML = errorHTML;
    document.getElementById('patients-tbody').innerHTML =
      '<tr><td colspan="8" style="text-align:center;padding:40px;"><div class="empty-data-alert" style="border:none;background:transparent;"><span>🔌</span><strong>No data available</strong><p>Connect backend to view insights</p></div></td></tr>';
  }
}

// ── Alerts ──────────────────────────────────────────────────────
function renderAlerts(alerts) {
  const el = document.getElementById('alerts-container');
  if (!alerts.length) { el.innerHTML = ''; return; }
  el.innerHTML = alerts.map(a =>
    `<div class="alert alert-${a.level}">${a.level === 'critical' ? '🚨' : '⚠'} ${a.message}</div>`
  ).join('');
}

// ── Stats grid ──────────────────────────────────────────────────
function renderStats(data) {
  const bs = data.bed_summary || [];
  const ps = data.patient_stats || {};
  const totalBeds = bs.reduce((a, w) => a + w.total, 0);
  const occupied  = bs.reduce((a, w) => a + w.occupied, 0);
  const available = bs.reduce((a, w) => a + w.available, 0);
  const occ = data.occupancy_rate || 0;

  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card fade-in stagger-1">
      <div class="stat-label">Total Beds</div>
      <div class="stat-value">${totalBeds}</div>
      <div class="stat-sub">${available} available</div>
    </div>
    <div class="stat-card green fade-in stagger-2">
      <div class="stat-label">Occupancy Rate</div>
      <div class="stat-value ${occ >= 90 ? 'danger' : occ >= 75 ? 'warn' : ''}">${occ}%</div>
      <div class="stat-sub">${occupied} beds occupied</div>
    </div>
    <div class="stat-card fade-in stagger-3">
      <div class="stat-label">Active Patients</div>
      <div class="stat-value">${ps.total_active || 0}</div>
      <div class="stat-sub">${ps.urgent || 0} urgent / critical</div>
    </div>
    <div class="stat-card amber fade-in stagger-3">
      <div class="stat-label">Admitted Today</div>
      <div class="stat-value">${ps.admitted_today || 0}</div>
      <div class="stat-sub">new patients</div>
    </div>
  `;
}

// ── Ward occupancy bars ──────────────────────────────────────────
function renderWardOccupancy(wardData) {
  renderOccupancyChart('ward-occupancy', wardData);
}

// ── Resources list ───────────────────────────────────────────────
function renderResources(resources) {
  const el = document.getElementById('resources-list');
  if (!resources.length) {
    el.innerHTML = `
      <div class="empty-data-alert">
        <span>📊</span>
        <strong>No data available</strong>
        <p style="font-size:12px;">Connect backend to view insights</p>
      </div>`;
    return;
  }

  el.innerHTML = resources.map(r => {
    const pct = r.total > 0 ? Math.round((r.available / r.total) * 100) : 0;
    const color = pct <= 20 ? '#dc2626' : pct <= 40 ? '#d97706' : '#059669';
    return `
      <div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;">
          <span style="font-size:13px;font-weight:600;">${r.name}</span>
          <span style="font-size:12px;color:${color};font-weight:600;">${r.available}/${r.total}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%;background:${color};"></div>
        </div>
        <div class="progress-label">
          <span style="color:${color};">${r.available} available</span>
          <span style="color:#6b7280;font-size:11px;">${r.category}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ── Patients table ───────────────────────────────────────────────
function renderPatients(patients) {
  const tbody = document.getElementById('patients-tbody');
  if (!patients.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;padding:40px;">
          <div class="empty-data-alert" style="border:none;background:transparent;margin:0;">
            <span>📋</span>
            <strong>No data available</strong>
            <p style="font-size:12px;">Connect backend to view insights</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = patients.map(p => {
    const priColor = p.priority === 'critical' ? '#dc2626' : p.priority === 'urgent' ? '#d97706' : '#059669';
    const admitted = new Date(p.admitted_at).toLocaleDateString('en-IN', {day:'2-digit',month:'short'});
    const wardBed  = p.bed_number ? `${p.ward} / ${p.bed_number}` : p.ward || '—';
    return `
      <tr>
        <td style="font-size:11px;color:#6b7280;">#${p.id}</td>
        <td style="font-weight:600;">${p.name}</td>
        <td>${p.age}</td>
        <td>${p.condition}</td>
        <td><span style="font-size:11px;font-weight:600;color:${priColor};">${p.priority}</span></td>
        <td style="font-size:12px;">${wardBed}</td>
        <td style="font-size:11px;color:#6b7280;">${admitted}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="dischargePatient(${p.id}, '${p.name}')">Discharge</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Admit modal ──────────────────────────────────────────────────
function openAdmitModal()  { document.getElementById('admit-modal').classList.add('open'); }
function closeAdmitModal() { document.getElementById('admit-modal').classList.remove('open'); }

async function admitPatient() {
  const name      = document.getElementById('p-name').value.trim();
  const age       = document.getElementById('p-age').value.trim();
  const gender    = document.getElementById('p-gender').value;
  const priority  = document.getElementById('p-priority').value;
  const condition = document.getElementById('p-condition').value.trim();
  const ward      = document.getElementById('p-ward').value;

  if (!name || !age || !condition) { showToast('Please fill in all required fields.', 'error'); return; }

  try {
    const res = await fetch(`${DASHBOARD_API}/patients/admit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age: parseInt(age), gender, condition, priority, ward: ward || undefined })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'Error admitting patient', 'error'); return; }

    showToast(data.message + (data.bed ? ` — Bed: ${data.bed.bed_number}` : ''), 'success');
    closeAdmitModal();
    ['p-name','p-age','p-condition'].forEach(id => document.getElementById(id).value = '');
    loadDashboard();
  } catch (e) {
    showToast('API not reachable', 'error');
  }
}

async function dischargePatient(id, name) {
  if (!confirm(`Discharge ${name}?`)) return;
  try {
    const res  = await fetch(`${DASHBOARD_API}/patients/${id}/discharge`, { method: 'POST' });
    const data = await res.json();
    showToast(data.message || data.error, res.ok ? 'success' : 'error');
    if (res.ok) loadDashboard();
  } catch (e) {
    showToast('API not reachable', 'error');
  }
}

// ── Toast helper ─────────────────────────────────────────────────
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => { t.className = 'toast'; }, 3500);
}

// ── Init + auto-refresh every 30 s ───────────────────────────────
loadDashboard();
autoRefreshTimer = setInterval(loadDashboard, 30000);
