(() => {
  const { request, escapeHtml, statusBadge, tableMarkup, formatDate, toast } = window.SMS;
  let selectedId = '';

  async function load() {
    const select = document.getElementById('detail-project-select');
    const host = document.getElementById('project-detail-content');
    try {
      const [projects, developers, allModules, allTasks, allBugs, allReleases, progress] = await Promise.all([
        request('/api/projects'), request('/api/developers'), request('/api/modules'), request('/api/tasks'), request('/api/bugs'), request('/api/releases'), request('/api/reports/project-progress')
      ]);
      const current = selectedId || select.value;
      select.innerHTML = `<option value="">Choose a project</option>${projects.map((project) => `<option value="${project.project_id}">${escapeHtml(project.title)}</option>`).join('')}`;
      if (current && projects.some((project) => String(project.project_id) === String(current))) select.value = current;
      if (!select.dataset.bound) {
        select.addEventListener('change', () => { selectedId = select.value; render(); });
        select.dataset.bound = 'true';
      }
      render();

      function render() {
        const project = projects.find((item) => String(item.project_id) === String(select.value));
        if (!project) {
          host.innerHTML = '<div class="empty-state">Select a project to view its delivery details.</div>';
          return;
        }
        const projectModules = allModules.filter((module) => module.project_id === project.project_id);
        const moduleIds = new Set(projectModules.map((module) => module.module_id));
        const projectTasks = allTasks.filter((task) => moduleIds.has(task.module_id));
        const projectBugs = allBugs.filter((bug) => bug.project_id === project.project_id);
        const projectReleases = allReleases.filter((release) => release.project_id === project.project_id);
        const projectProgress = progress.find((item) => item.project_id === project.project_id) || { total_tasks: 0, done_tasks: 0, completion_percentage: 0 };
        const taskColumns = [
          { key: 'title', label: 'Task' }, { key: 'status', label: 'Status', render: (value) => statusBadge(value) },
          { key: 'priority', label: 'Priority', render: (value) => statusBadge(value) }, { key: 'due_date', label: 'Due', render: (value) => formatDate(value) }
        ];
        const moduleColumns = [{ key: 'name', label: 'Module' }];
        const bugColumns = [{ key: 'description', label: 'Bug', render: (value) => escapeHtml(String(value).slice(0, 70)) }, { key: 'severity', label: 'Severity', render: (value) => statusBadge(value) }, { key: 'status', label: 'Status', render: (value) => statusBadge(value) }];
        const releaseColumns = [{ key: 'version', label: 'Version' }, { key: 'release_date', label: 'Date', render: (value) => formatDate(value) }, { key: 'notes', label: 'Notes', render: (value) => escapeHtml(value) }];
        host.innerHTML = `<div class="project-summary">
          <div class="summary-tile"><label>Project</label><strong>${escapeHtml(project.title)}</strong><div class="progress-track"><div class="progress-fill" style="width:${Math.max(0, Math.min(100, Number(projectProgress.completion_percentage)))}%"></div></div><div class="table-subtle">${projectProgress.done_tasks} of ${projectProgress.total_tasks} tasks complete · ${Number(projectProgress.completion_percentage).toFixed(1)}%</div></div>
          <div class="summary-tile"><label>Status</label>${statusBadge(project.status)}</div>
          <div class="summary-tile"><label>Schedule</label><strong>${formatDate(project.start_date)}</strong><div class="table-subtle">Through ${formatDate(project.end_date)}</div></div>
          <div class="summary-tile"><label>Budget</label><strong>${new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(project.budget)}</strong></div>
        </div>
        <div class="detail-grid">
          <article class="panel detail-panel"><div class="panel-heading"><h3>Project members</h3></div><form id="member-form" class="table-toolbar" style="padding:10px 0;border:0"><select class="form-control" name="dev_id" required aria-label="Developer" style="max-width:190px"><option value="">Choose developer</option>${developers.map((developer) => `<option value="${developer.dev_id}">${escapeHtml(developer.name)}</option>`).join('')}</select><input class="form-control" name="role_in_project" placeholder="Role" required style="max-width:140px"><button class="button button-dark button-small" type="submit">Add member</button></form><div id="member-table" class="empty-state"><span class="spinner"></span>Loading members…</div></article>
          <article class="panel detail-panel"><div class="panel-heading"><h3>Modules</h3><span class="panel-note">${projectModules.length} total</span></div>${tableMarkup(projectModules, moduleColumns)}</article>
          <article class="panel detail-panel"><div class="panel-heading"><h3>Tasks</h3><span class="panel-note">${projectTasks.length} total</span></div>${tableMarkup(projectTasks, taskColumns)}</article>
          <article class="panel detail-panel"><div class="panel-heading"><h3>Bugs</h3><span class="panel-note">${projectBugs.length} total</span></div>${tableMarkup(projectBugs, bugColumns)}</article>
          <article class="panel detail-panel"><div class="panel-heading"><h3>Releases</h3><span class="panel-note">${projectReleases.length} total</span></div>${tableMarkup(projectReleases, releaseColumns)}</article>
        </div>`;
        loadMembers(project.project_id);
        const form = host.querySelector('#member-form');
        form.addEventListener('submit', async (event) => {
          event.preventDefault();
          if (!form.reportValidity()) return;
          const data = Object.fromEntries(new FormData(form));
          data.dev_id = Number(data.dev_id);
          try {
            await request(`/api/projects/${project.project_id}/members`, { method: 'POST', body: JSON.stringify(data) });
            toast('Project member added.');
            form.reset();
            loadMembers(project.project_id);
          } catch (error) { toast(error.message, 'error'); }
        });
      }

      async function loadMembers(projectId) {
        const memberHost = host.querySelector('#member-table');
        if (!memberHost) return;
        try {
          const members = await request(`/api/projects/${projectId}/members`);
          memberHost.innerHTML = tableMarkup(members, [
            { key: 'name', label: 'Developer' }, { key: 'designation', label: 'Title' }, { key: 'role_in_project', label: 'Role' }
          ], { actions: (member) => `<div class="table-actions"><button class="button button-danger button-small" data-remove-member="${member.dev_id}">Remove</button></div>` });
          memberHost.querySelectorAll('[data-remove-member]').forEach((button) => button.addEventListener('click', async () => {
            if (!window.confirm('Remove this member from the project?')) return;
            try {
              await request(`/api/projects/${projectId}/members/${button.dataset.removeMember}`, { method: 'DELETE' });
              toast('Project member removed.');
              loadMembers(projectId);
            } catch (error) { toast(error.message, 'error'); }
          }));
        } catch (error) { memberHost.textContent = error.message; }
      }
    } catch (error) { host.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`; }
  }

  function select(projectId) {
    selectedId = String(projectId);
    const selectElement = document.getElementById('detail-project-select');
    if (selectElement) selectElement.value = selectedId;
  }

  window.ProjectDetails = { select };
  window.pageModules['project-details'] = { load };
})();
