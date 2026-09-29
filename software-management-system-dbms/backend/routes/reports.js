const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/project-progress', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT project_id, title, total_tasks, done_tasks, completion_percentage FROM project_progress ORDER BY title');
    res.json(rows);
  } catch (error) { next(error); }
});

router.get('/developer-workload/:id', async (req, res, next) => {
  try {
    const devId = Number(req.params.id);
    if (!Number.isInteger(devId) || devId <= 0) return res.status(400).json({ error: 'A valid developer ID is required.' });
    const [sets] = await pool.execute('CALL GetDeveloperWorkload(?)', [devId]);
    res.json({ tasks: sets[0] || [], open_bugs: sets[1] || [] });
  } catch (error) { next(error); }
});

router.get('/tasks-per-project', async (_req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT p.project_id, p.title, COUNT(t.task_id) AS task_count, SUM(CASE WHEN t.status='Done' THEN 1 ELSE 0 END) AS done_count FROM projects p LEFT JOIN modules m ON m.project_id=p.project_id LEFT JOIN tasks t ON t.module_id=m.module_id GROUP BY p.project_id, p.title ORDER BY task_count DESC, p.title");
    res.json(rows);
  } catch (error) { next(error); }
});

router.get('/bugs-by-severity', async (_req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT severity, COUNT(*) AS bug_count FROM bugs WHERE status <> 'Resolved' GROUP BY severity ORDER BY FIELD(severity, 'Critical', 'Major', 'Minor')");
    res.json(rows);
  } catch (error) { next(error); }
});

router.get('/developers-without-tasks', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT d.dev_id, d.name, d.designation FROM developers d LEFT JOIN tasks t ON t.assigned_to=d.dev_id WHERE t.task_id IS NULL ORDER BY d.name');
    res.json(rows);
  } catch (error) { next(error); }
});

router.get('/above-average-salary', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT dev_id, name, designation, salary FROM developers WHERE salary > (SELECT AVG(salary) FROM developers) ORDER BY salary DESC');
    res.json(rows);
  } catch (error) { next(error); }
});

module.exports = router;
