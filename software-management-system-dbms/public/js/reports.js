(() => {
  const { request, escapeHtml, tableMarkup, statusBadge, formatDate } = window.SMS;
  const host = document.getElementById('reports-content');
  const dateColumn = (key, label) => ({ key, label, render: (value) => formatDate(value) });
  const columnsFor = (rows) => (rows[0] ? Object.keys(rows[0]).map((key) => ({ key, label: key.replaceAll('_', ' '), render: (value) => key === 'status' || key === 'severity' ? statusBadge(value) : value == null ? '—' : escapeHtml(value) })) : []);

  async function load() {
    host.innerHTML = '<div class="loading-card"><span class="spinner"></span>Loading reports…</div>';
    try {
      const [progress, tasksPerProject, bugs, noTasks, salaries, developers] = await Promise.all([
        request('/api/reports/project-progress'), request('/api/reports/tasks-per-project'), request('/api/reports/bugs-by-severity'), request('/api/reports/developers-without-tasks'), request('/api/reports/above-average-salary'), request('/api/developers')
      ]);
      host.innerHTML = `
        <article class="panel report-panel wide"><h2>Project progress</h2>${tableMarkup(progress, [
          { key: 'title', label: 'Project' }, { key: 'total_tasks', label: 'Total tasks' }, { key: 'done_tasks', label: 'Done' }, { key: 'completion_percentage', label: 'Completion', render: (value) => `${Number(value).toFixed(1)}%` }
        ])}</article>
        <article class="panel report-panel"><h2>Tasks per project</h2>${tableMarkup(tasksPerProject, [
          { key: 'title', label: 'Project' }, { key: 'task_count', label: 'Tasks' }, { key: 'done_count', label: 'Done' }
        ])}</article>
        <article class="panel report-panel"><h2>Unresolved bugs by severity</h2>${tableMarkup(bugs, [
          { key: 'severity', label: 'Severity', render: (value) => statusBadge(value) }, { key: 'bug_count', label: 'Open bugs' }
        ])}</article>
        <article class="panel report-panel"><h2>Developers without tasks</h2>${tableMarkup(noTasks, [
          { key: 'name', label: 'Developer' }, { key: 'designation', label: 'Designation' }
        ])}</article>
        <article class="panel report-panel"><h2>Above-average salary</h2>${tableMarkup(salaries, [
          { key: 'name', label: 'Developer' }, { key: 'designation', label: 'Designation' }, { key: 'salary', label: 'Salary', render: (value) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value) }
        ])}</article>
        <article class="panel report-panel wide"><div class="panel-heading"><h2>Developer workload</h2><label class="select-inline"><span>Developer</span><select id="workload-developer"><option value="">Choose developer</option>${developers.map((developer) => `<option value="${developer.dev_id}">${escapeHtml(developer.name)}</option>`).join('')}</select></label></div><div id="workload-content" class="empty-state">Choose a developer to load assigned tasks and open bugs.</div></article>`;
      const select = document.getElementById('workload-developer');
      select.addEventListener('change', () => loadWorkload(select.value));
      document.getElementById('refresh-reports').onclick = load;
      if (developers.length) {
        select.value = developers[0].dev_id;
        loadWorkload(select.value);
      }
    } catch (error) { host.innerHTML = `<div class="loading-card">${escapeHtml(error.message)}</div>`; }
  }

  async function loadWorkload(id) {
    const target = document.getElementById('workload-content');
    if (!id || !target) return;
    target.innerHTML = '<div class="sql-output-label"><span class="spinner"></span>Loading workload…</div>';
    try {
      const result = await request(`/api/reports/developer-workload/${id}`);
      target.innerHTML = `<h3 class="sql-output-label">Assigned tasks</h3>${tableMarkup(result.tasks, [
        { key: 'title', label: 'Task' }, { key: 'project_title', label: 'Project' }, { key: 'priority', label: 'Priority', render: (value) => statusBadge(value) }, { key: 'status', label: 'Status', render: (value) => statusBadge(value) }, { key: 'due_date', label: 'Due', render: (value) => formatDate(value) }
      ])}<h3 class="sql-output-label">Open bugs</h3>${tableMarkup(result.open_bugs, [
        { key: 'description', label: 'Bug' }, { key: 'project_title', label: 'Project' }, { key: 'severity', label: 'Severity', render: (value) => statusBadge(value) }, { key: 'status', label: 'Status', render: (value) => statusBadge(value) }
      ])}`;
    } catch (error) { target.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`; }
  }

  window.pageModules.reports = { load };
})();
