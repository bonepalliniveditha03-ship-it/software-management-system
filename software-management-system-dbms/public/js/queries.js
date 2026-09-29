(() => {
  const { request, escapeHtml, tableMarkup, toast } = window.SMS;
  const host = document.getElementById('queries-content');

  function resultTable(rows) {
    if (!rows?.length) return '<div class="empty-state">The query returned no rows.</div>';
    const columns = Object.keys(rows[0]).map((key) => ({ key, label: key.replaceAll('_', ' '), render: (value) => value == null ? '—' : escapeHtml(value) }));
    return tableMarkup(rows, columns);
  }

  async function load() {
    host.innerHTML = '<div class="loading-card"><span class="spinner"></span>Loading query catalog…</div>';
    try {
      const queries = await request('/api/query-runner');
      host.innerHTML = queries.map((query) => `<article class="query-item" id="query-${query.number}"><div class="query-top"><div class="query-title"><span class="query-number">${query.number}</span>${escapeHtml(query.title)}</div><div class="query-tools"><button class="button button-dark button-small" data-run-query="${query.number}">▶ Run</button></div></div><pre class="query-sql">${escapeHtml(query.sql)}</pre><div class="query-output" id="query-output-${query.number}"><div class="sql-output-label">Run query to see its result.</div></div></article>`).join('');
      host.querySelectorAll('[data-run-query]').forEach((button) => button.addEventListener('click', () => run(button)));
    } catch (error) { host.innerHTML = `<div class="loading-card">${escapeHtml(error.message)}</div>`; }
  }

  async function run(button) {
    const number = Number(button.dataset.runQuery);
    const output = document.getElementById(`query-output-${number}`);
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span>Running';
    output.innerHTML = '<div class="sql-output-label">Executing predefined query…</div>';
    try {
      const result = await request(`/api/query-runner/${number}`);
      if (number === 17) {
        output.innerHTML = `<h3 class="sql-output-label">Assigned tasks</h3>${resultTable(result.tasks)}<h3 class="sql-output-label">Open bugs</h3>${resultTable(result.open_bugs)}`;
      } else output.innerHTML = resultTable(result);
      toast(`Query ${number} completed.`);
    } catch (error) {
      output.innerHTML = `<div class="sql-output-label">${escapeHtml(error.message)}</div>`;
      toast(error.message, 'error');
    } finally {
      button.disabled = false;
      button.textContent = '▶ Run';
    }
  }

  window.pageModules.queries = { load };
})();
