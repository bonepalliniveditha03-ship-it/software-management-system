(() => {
  const labels = {
    dashboard: 'Overview', clients: 'Clients', developers: 'Developers', projects: 'Projects', modules: 'Modules',
    tasks: 'Tasks', bugs: 'Bugs', releases: 'Releases', 'project-details': 'Project details', reports: 'Reports', queries: 'SQL queries'
  };

  function showPage(page) {
    const target = document.getElementById(`page-${page}`);
    if (!target) return;
    document.querySelectorAll('.page-view').forEach((view) => view.classList.toggle('active', view === target));
    document.querySelectorAll('.nav-link').forEach((link) => link.classList.toggle('active', link.dataset.page === page));
    document.getElementById('current-page-label').textContent = labels[page] || page;
    document.getElementById('sidebar').classList.remove('open');
    history.replaceState(null, '', `#${page}`);
    window.pageModules[page]?.load?.();
  }

  document.addEventListener('click', (event) => {
    const pageLink = event.target.closest('[data-page], [data-go]');
    if (pageLink) {
      event.preventDefault();
      showPage(pageLink.dataset.page || pageLink.dataset.go);
      return;
    }
    const addButton = event.target.closest('[data-add]');
    if (addButton) window.CrudPage?.open(addButton.dataset.add).catch((error) => window.SMS.toast(error.message, 'error'));
  });

  document.querySelectorAll('.close-dialog').forEach((button) => button.addEventListener('click', () => document.getElementById('record-dialog').close()));
  document.getElementById('mobile-menu').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
  document.getElementById('today-label').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());

  const initialPage = location.hash.slice(1);
  showPage(labels[initialPage] ? initialPage : 'dashboard');
})();
