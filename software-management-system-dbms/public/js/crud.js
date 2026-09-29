(() => {
  const definitions = {
    clients: { title: 'Client', id: 'client_id', host: 'crud-clients', columns: [
      { key: 'name', label: 'Client name', type: 'text' }, { key: 'email', label: 'Email', type: 'email' }, { key: 'phone', label: 'Phone', type: 'tel' }
    ], display: ['name', 'email', 'phone'] },
    developers: { title: 'Developer', id: 'dev_id', host: 'crud-developers', columns: [
      { key: 'name', label: 'Name', type: 'text' }, { key: 'email', label: 'Email', type: 'email' }, { key: 'designation', label: 'Designation', type: 'text' }, { key: 'hire_date', label: 'Hire date', type: 'date' }, { key: 'salary', label: 'Salary', type: 'number', step: '0.01' }
    ], display: ['name', 'email', 'designation', 'hire_date', 'salary'] },
    projects: { title: 'Project', id: 'project_id', host: 'crud-projects', columns: [
      { key: 'title', label: 'Project', type: 'text' }, { key: 'client_id', label: 'Client', type: 'select', source: 'clients', optionId: 'client_id', optionLabel: 'name', displaySource: 'clients', displayId: 'client_id', displayLabel: 'name' }, { key: 'status', label: 'Status', type: 'select', options: ['Planned', 'Active', 'Completed', 'On Hold'] }, { key: 'start_date', label: 'Start date', type: 'date' }, { key: 'end_date', label: 'End date', type: 'date' }, { key: 'budget', label: 'Budget', type: 'number', step: '0.01' }, { key: 'description', label: 'Description', type: 'textarea' }
    ], display: ['title', 'client_id', 'status', 'start_date', 'end_date', 'budget'], projectActions: true },
    modules: { title: 'Module', id: 'module_id', host: 'crud-modules', columns: [
      { key: 'project_id', label: 'Project', type: 'select', source: 'projects', optionId: 'project_id', optionLabel: 'title', displaySource: 'projects', displayId: 'project_id', displayLabel: 'title' }, { key: 'name', label: 'Module name', type: 'text' }
    ], display: ['project_id', 'name'] },
    tasks: { title: 'Task', id: 'task_id', host: 'crud-tasks', columns: [
      { key: 'module_id', label: 'Module', type: 'select', source: 'modules', optionId: 'module_id', optionLabel: 'name', displaySource: 'modules', displayId: 'module_id', displayLabel: 'name' }, { key: 'title', label: 'Task', type: 'text' }, { key: 'assigned_to', label: 'Assigned developer', type: 'select', source: 'developers', optionId: 'dev_id', optionLabel: 'name', nullable: true, displaySource: 'developers', displayId: 'dev_id', displayLabel: 'name' }, { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'], badge: true }, { key: 'status', label: 'Status', type: 'select', options: ['To Do', 'In Progress', 'Done'], badge: true }, { key: 'due_date', label: 'Due date', type: 'date' }
    ], display: ['task_id', 'title', 'module_id', 'assigned_to', 'priority', 'status', 'due_date'] },
    bugs: { title: 'Bug', id: 'bug_id', host: 'crud-bugs', columns: [
      { key: 'project_id', label: 'Project', type: 'select', source: 'projects', optionId: 'project_id', optionLabel: 'title', displaySource: 'projects', displayId: 'project_id', displayLabel: 'title' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'severity', label: 'Severity', type: 'select', options: ['Minor', 'Major', 'Critical'], badge: true }, { key: 'status', label: 'Status', type: 'select', options: ['Open', 'In Progress', 'Resolved'], badge: true }, { key: 'reported_date', label: 'Reported date', type: 'date' }, { key: 'resolved_date', label: 'Resolved date', type: 'date', nullable: true }, { key: 'assigned_to', label: 'Assigned developer', type: 'select', source: 'developers', optionId: 'dev_id', optionLabel: 'name', nullable: true, displaySource: 'developers', displayId: 'dev_id', displayLabel: 'name' }
    ], display: ['bug_id', 'project_id', 'description', 'severity', 'status', 'reported_date', 'assigned_to'] },
    releases: { title: 'Release', id: 'release_id', host: 'crud-releases', columns: [
      { key: 'project_id', label: 'Project', type: 'select', source: 'projects', optionId: 'project_id', optionLabel: 'title', displaySource: 'projects', displayId: 'project_id', displayLabel: 'title' }, { key: 'version', label: 'Version', type: 'text' }, { key: 'release_date', label: 'Release date', type: 'date' }, { key: 'notes', label: 'Notes', type: 'textarea' }
    ], display: ['project_id', 'version', 'release_date', 'notes'] }
  };

  const { request, escapeHtml, toast, statusBadge, tableMarkup, formatDate } = window.SMS;
  const relations = {};
  let searchTimers = {};

  function displayValue(column, value, row) {
    if (column.badge) return statusBadge(value);
    if (column.displaySource) {
      const related = (relations[column.displaySource] || []).find((item) => String(item[column.displayId]) === String(value));
      return escapeHtml(related?.[column.displayLabel] || (value == null ? 'Unassigned' : `#${value}`));
    }
    if (column.type === 'date') return formatDate(value);
    if (column.key === 'salary' || column.key === 'budget') return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value || 0));
    if (column.key === 'description' || column.key === 'notes') return escapeHtml(String(value || '').slice(0, 82)) + (String(value || '').length > 82 ? '…' : '');
    return escapeHtml(value ?? '—');
  }

  async function loadRelations(definition) {
    const sources = [...new Set(definition.columns.map((column) => column.source || column.displaySource).filter(Boolean))];
    await Promise.all(sources.map(async (source) => {
      if (!relations[source]) relations[source] = await request(`/api/${source}`);
    }));
  }

  async function load(resource, search = '') {
    const definition = definitions[resource];
    const host = document.getElementById(definition.host);
    host.innerHTML = '<div class="loading-card"><span class="spinner"></span>Loading records…</div>';
    try {
      await loadRelations(definition);
      const rows = await request(`/api/${resource}${search ? `?q=${encodeURIComponent(search)}` : ''}`);
      const columns = definition.display.map((key) => {
        const column = definition.columns.find((item) => item.key === key) || { key, label: key };
        return { key, label: column.label || key.replaceAll('_', ' '), render: (value, row) => displayValue(column, value, row) };
      });
      host.innerHTML = `<div class="panel crud-panel"><div class="table-toolbar"><span class="record-count">${rows.length} ${rows.length === 1 ? 'record' : 'records'}</span><input class="search-field" type="search" placeholder="Search ${resource}…" value="${escapeHtml(search)}" aria-label="Search ${resource}"></div>${tableMarkup(rows, columns, { actions: (row) => `<div class="table-actions">${definition.projectActions ? `<button class="button button-light button-small" data-project-view="${row[definition.id]}">View</button>` : ''}<button class="button button-light button-small" data-edit="${row[definition.id]}">Edit</button><button class="button button-danger button-small" data-delete="${row[definition.id]}">Delete</button></div>` })}</div>`;
      host.querySelector('.search-field').addEventListener('input', (event) => {
        clearTimeout(searchTimers[resource]);
        searchTimers[resource] = setTimeout(() => load(resource, event.target.value.trim()), 220);
      });
      host.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => open(resource, Number(button.dataset.edit)).catch((error) => toast(error.message, 'error'))));
      host.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => remove(resource, Number(button.dataset.delete))));
      host.querySelectorAll('[data-project-view]').forEach((button) => button.addEventListener('click', () => {
        window.ProjectDetails?.select(Number(button.dataset.projectView));
        document.querySelector('[data-page="project-details"]').click();
      }));
    } catch (error) {
      host.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    }
  }

  async function open(resource, id = null) {
    const definition = definitions[resource];
    const dialog = document.getElementById('record-dialog');
    const form = document.getElementById('record-form');
    const fieldHost = document.getElementById('dialog-fields');
    const existing = id ? await request(`/api/${resource}/${id}`) : {};
    await loadRelations(definition);
    document.getElementById('dialog-kicker').textContent = resource.toUpperCase();
    document.getElementById('dialog-title').textContent = `${id ? 'Edit' : 'Add'} ${definition.title.toLowerCase()}`;
    fieldHost.innerHTML = definition.columns.map((column) => {
      const value = existing[column.key] ?? '';
      const required = !column.nullable;
      const full = column.type === 'textarea' ? ' full-width' : '';
      let control;
      if (column.type === 'select') {
        let options = column.options || (relations[column.source] || []).map((row) => ({ value: row[column.optionId], label: row[column.optionLabel] }));
        if (column.options) options = column.options.map((option) => ({ value: option, label: option }));
        control = `<select class="form-control" name="${column.key}" ${required ? 'required' : ''}><option value="">${column.nullable ? 'Unassigned' : 'Choose…'}</option>${options.map((option) => `<option value="${escapeHtml(option.value)}" ${String(value) === String(option.value) ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select>`;
      } else if (column.type === 'textarea') {
        control = `<textarea class="form-control" name="${column.key}" ${required ? 'required' : ''}>${escapeHtml(value)}</textarea>`;
      } else {
        control = `<input class="form-control" name="${column.key}" type="${column.type}" value="${escapeHtml(value)}" ${column.step ? `step="${column.step}"` : ''} ${column.type === 'number' ? 'min="0"' : ''} ${required ? 'required' : ''}>`;
      }
      return `<div class="form-field${full}"><label for="field-${column.key}">${escapeHtml(column.label)}</label>${control}</div>`;
    }).join('');
    fieldHost.querySelectorAll('.form-control').forEach((input) => input.id = `field-${input.name}`);
    form.onsubmit = async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = Object.fromEntries(new FormData(form).entries());
      definition.columns.forEach((column) => {
        if (column.type === 'number' && data[column.key] !== '') data[column.key] = Number(data[column.key]);
        if (column.type === 'select' && data[column.key] === '') data[column.key] = column.nullable ? null : '';
        if (column.nullable && data[column.key] === '') data[column.key] = null;
      });
      const save = document.getElementById('save-record');
      save.disabled = true;
      save.innerHTML = '<span class="spinner"></span>Saving';
      try {
        await request(`/api/${resource}${id ? `/${id}` : ''}`, { method: id ? 'PUT' : 'POST', body: JSON.stringify(data) });
        dialog.close();
        toast(`${definition.title} ${id ? 'updated' : 'added'} successfully.`);
        await load(resource, document.querySelector(`#${definition.host} .search-field`)?.value || '');
      } catch (error) { toast(error.message, 'error'); }
      finally { save.disabled = false; save.textContent = 'Save record'; }
    };
    dialog.showModal();
  }

  async function remove(resource, id) {
    const definition = definitions[resource];
    if (!window.confirm(`Delete this ${definition.title.toLowerCase()}? This action cannot be undone.`)) return;
    try {
      await request(`/api/${resource}/${id}`, { method: 'DELETE' });
      toast(`${definition.title} deleted.`);
      await load(resource);
    } catch (error) { toast(error.message, 'error'); }
  }

  window.CrudPage = { definitions, load, open };
})();
