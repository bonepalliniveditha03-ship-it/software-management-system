const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('../db');
const router = express.Router();

const queryDefinitions = [
  { title: 'Projects and clients', sql: 'SELECT p.project_id, p.title, c.name AS client, p.status FROM projects p INNER JOIN clients c ON c.client_id = p.client_id' },
  { title: 'Tasks across four tables', sql: 'SELECT t.task_id, t.title AS task, m.name AS module, p.title AS project, d.name AS developer FROM tasks t JOIN modules m ON m.module_id=t.module_id JOIN projects p ON p.project_id=m.project_id LEFT JOIN developers d ON d.dev_id=t.assigned_to' },
  { title: 'Projects including projects without bugs', sql: 'SELECT p.title, b.bug_id, b.severity, b.status FROM projects p LEFT JOIN bugs b ON b.project_id=p.project_id ORDER BY p.project_id' },
  { title: 'All clients and their projects', sql: 'SELECT c.name AS client, p.title AS project FROM projects p RIGHT JOIN clients c ON c.client_id=p.client_id ORDER BY c.name' },
  { title: 'Salary aggregates by designation', sql: 'SELECT designation, COUNT(*) AS developer_count, SUM(salary) AS salary_sum, AVG(salary) AS average_salary, MAX(salary) AS highest_salary, MIN(salary) AS lowest_salary FROM developers GROUP BY designation' },
  { title: 'Project teams with at least two members', sql: 'SELECT p.title, COUNT(pm.dev_id) AS team_size FROM projects p JOIN project_members pm ON pm.project_id=p.project_id GROUP BY p.project_id, p.title HAVING COUNT(pm.dev_id) >= 2' },
  { title: 'Projects above average budget', sql: 'SELECT title, budget FROM projects WHERE budget > (SELECT AVG(budget) FROM projects) ORDER BY budget DESC' },
  { title: 'Earliest-due tasks per project (correlated subquery)', sql: 'SELECT t.task_id, t.title, t.due_date FROM tasks t JOIN modules m ON m.module_id=t.module_id WHERE t.due_date = (SELECT MIN(t2.due_date) FROM tasks t2 JOIN modules m2 ON m2.module_id=t2.module_id WHERE m2.project_id=m.project_id)' },
  { title: 'Bugs assigned to developers on active projects', sql: "SELECT bug_id, description, status FROM bugs WHERE assigned_to IN (SELECT pm.dev_id FROM project_members pm JOIN projects p ON p.project_id=pm.project_id WHERE p.status='Active')" },
  { title: 'Clients with active projects', sql: "SELECT c.client_id, c.name FROM clients c WHERE EXISTS (SELECT 1 FROM projects p WHERE p.client_id=c.client_id AND p.status='Active')" },
  { title: 'Top five project budgets', sql: 'SELECT title, budget FROM projects ORDER BY budget DESC LIMIT 5' },
  { title: 'Search projects containing care', sql: "SELECT project_id, title FROM projects WHERE title LIKE '%care%'" },
  { title: 'Tasks due in the second half of 2025', sql: "SELECT task_id, title, due_date FROM tasks WHERE due_date BETWEEN '2025-07-01' AND '2025-12-31' ORDER BY due_date" },
  { title: 'Project and release activity (UNION)', sql: "SELECT title AS activity, 'Project' AS activity_type FROM projects UNION SELECT CONCAT(p.title, ' v', r.version), 'Release' FROM releases r JOIN projects p ON p.project_id=r.project_id" },
  { title: 'Task work labels (CASE)', sql: "SELECT task_id, title, CASE WHEN status='Done' THEN 'Complete' WHEN priority='High' THEN 'Urgent' ELSE 'Standard' END AS work_label FROM tasks" },
  { title: 'Project completion from the view', sql: 'SELECT project_id, title, total_tasks, done_tasks, completion_percentage FROM project_progress ORDER BY completion_percentage DESC, title' },
  { title: 'Developer workload procedure (developer 2)', sql: 'CALL GetDeveloperWorkload(2)' }
];

const sqlSource = fs.readFileSync(path.join(__dirname, '../../sql/queries.sql'), 'utf8');
const queries = Array.from(sqlSource.matchAll(/^[ \t]*--[ \t]*(\d+)\.[ \t]*(.+)\r?\n([\s\S]*?);/gm), (match) => ({
  number: Number(match[1]),
  title: match[2].trim(),
  sql: match[3].trim()
}));

router.get('/', (_req, res) => res.json(queries.map(({ title, sql }, index) => ({ number: index + 1, title, sql }))));
router.get('/:number', async (req, res, next) => {
  try {
    const number = Number(req.params.number);
    if (!Number.isInteger(number) || number < 1 || number > queries.length) return res.status(404).json({ error: `Query number must be between 1 and ${queries.length}.` });
    const [result] = await pool.query(queries[number - 1].sql);
    if (number === 17) return res.json({ tasks: result[0] || [], open_bugs: result[1] || [] });
    res.json(Array.isArray(result) ? result : []);
  } catch (error) { next(error); }
});

module.exports = router;
