(() => {
  const pageModules = {};
  window.pageModules = pageModules;

  async function request(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
    });
    if (response.status === 204) return null;
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Request failed (${response.status}).`);
    return body;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }

  function toast(message, kind = 'success') {
    const region = document.getElementById('toast-region');
    const item = document.createElement('div');
    item.className = `toast ${kind}`;
    item.textContent = message;
    region.append(item);
    window.setTimeout(() => item.remove(), 3500);
  }

  function statusBadge(value) {
    const slug = String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `<span class="status-badge status-${escapeHtml(slug)}">${escapeHtml(value || 'Not set')}</span>`;
  }

  function tableMarkup(rows, columns, options = {}) {
    if (!rows?.length) return `<div class="empty-state">${escapeHtml(options.empty || 'No records found.')}</div>`;
    const headings = columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('');
    const body = rows.map((row, index) => `<tr>${columns.map((column) => {
      const value = column.render ? column.render(row[column.key], row) : escapeHtml(row[column.key] ?? '—');
      return `<td>${value}</td>`;
    }).join('')}${options.actions ? `<td>${options.actions(row, index)}</td>` : ''}</tr>`).join('');
    return `<div class="table-scroll"><table><thead><tr>${headings}${options.actions ? '<th></th>' : ''}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.valueOf()) ? escapeHtml(value) : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  }

  window.SMS = { request, escapeHtml, toast, statusBadge, tableMarkup, formatDate };
})();
