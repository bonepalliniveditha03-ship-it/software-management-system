const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/stats', async (_req, res, next) => {
  try {
    const [[projects]] = await pool.query('SELECT COUNT(*) AS count FROM projects');
    const [[developers]] = await pool.query('SELECT COUNT(*) AS count FROM developers');
    const [[bugs]] = await pool.query("SELECT COUNT(*) AS count FROM bugs WHERE status <> 'Resolved'");
    const [[tasks]] = await pool.query("SELECT COUNT(*) AS count FROM tasks WHERE status <> 'Done'");
    res.json({ projects: projects.count, developers: developers.count, open_bugs: bugs.count, pending_tasks: tasks.count });
  } catch (error) { next(error); }
});

module.exports = router;
