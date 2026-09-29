(() => {
  const { request, escapeHtml, statusBadge, tableMarkup, formatDate } = window.SMS;
  let bugsChart;
  let tasksChart;

  async function load() {
    const statsHost = document.getElementById('dashboard-stats');
    statsHost.innerHTML = '<div class="stat-card loading-card">Loading project metrics…</div>';
    try {
      const [stats, severities, tasks, projects, clients] = await Promise.all([
        request('/api/dashboard/stats'), request('/api/reports/bugs-by-severity'), request('/api/tasks'), request('/api/projects'), request('/api/clients')
      ]);
      const cards = [
        { label: 'Projects', value: stats.projects, foot: 'Across the portfolio', icon: '▧', color: '#32715b', soft: '#e4f1e8' },
        { label: 'Developers', value: stats.developers, foot: 'In the team directory', icon: '♙', color: '#567d9a', soft: '#e8f0f5' },
        { label: 'Open bugs', value: stats.open_bugs, foot: 'Unresolved quality issues', icon: '⌁', color: '#bd654b', soft: '#faece5' },
        { label: 'Pending tasks', value: stats.pending_tasks, foot: 'Work not yet completed', icon: '☑', color: '#a77b2d', soft: '#f8f1df' }
      ];
      statsHost.innerHTML = cards.map((card, index) => `<article class="stat-card" style="--stat-color:${card.color};--stat-soft:${card.soft};animation-delay:${index * 55}ms"><div class="stat-top"><span class="stat-label">${card.label}</span><span class="stat-icon">${card.icon}</span></div><div class="stat-value">${Number(card.value).toLocaleString()}</div><div class="stat-foot">${card.foot}</div></article>`).join('');
      const severityLabels = ['Critical', 'Major', 'Minor'];
      const severityCounts = severityLabels.map((label) => Number(severities.find((row) => row.severity === label)?.bug_count || 0));
      const taskLabels = ['To Do', 'In Progress', 'Done'];
      const taskCounts = taskLabels.map((label) => tasks.filter((task) => task.status === label).length);
      if (window.Chart) {
        bugsChart?.destroy();
        tasksChart?.destroy();
        bugsChart = new Chart(document.getElementById('bugs-chart'), {
          type: 'bar', data: { labels: severityLabels, datasets: [{ data: severityCounts, backgroundColor: ['#c96152', '#e4a35b', '#77a884'], borderRadius: 4, maxBarThickness: 42 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#78867e', font: { family: 'DM Sans', size: 10 } }, border: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0, color: '#98a49d', font: { size: 9 } }, grid: { color: '#edf1ed' }, border: { display: false } } } }
        });
        tasksChart = new Chart(document.getElementById('tasks-chart'), {
          type: 'doughnut', data: { labels: taskLabels, datasets: [{ data: taskCounts, backgroundColor: ['#d9dfd9', '#6194a8', '#63a27b'], borderWidth: 3, borderColor: '#fff', hoverOffset: 5 }] },
          options: { responsive: true, maintainAspectRatio: false, cutout: '69%', plugins: { legend: { position: 'right', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 7, padding: 16, color: '#65736b', font: { family: 'DM Sans', size: 10 } } } } }
        });
      }
      const clientById = new Map(clients.map((client) => [client.client_id, client.name]));
      const recent = projects.slice(0, 5);
      document.getElementById('recent-projects').innerHTML = `<thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Timeline</th><th></th></tr></thead><tbody>${recent.map((project) => `<tr><td class="table-primary">${escapeHtml(project.title)}</td><td>${escapeHtml(clientById.get(project.client_id) || '—')}</td><td>${statusBadge(project.status)}</td><td>${formatDate(project.start_date)} – ${formatDate(project.end_date)}</td><td><button class="button button-light button-small" data-open-project="${project.project_id}">Details</button></td></tr>`).join('')}</tbody>`;
      document.querySelectorAll('[data-open-project]').forEach((button) => button.addEventListener('click', () => {
        window.ProjectDetails?.select(Number(button.dataset.openProject));
        document.querySelector('[data-page="project-details"]').click();
      }));
    } catch (error) {
      statsHost.innerHTML = `<div class="loading-card">${escapeHtml(error.message)} Check the API and MySQL connection.</div>`;
    }
  }

  window.pageModules.dashboard = { load };
})();
