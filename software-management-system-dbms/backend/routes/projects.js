const express = require('express');
const pool = require('../db');
const { createCrudRouter } = require('./crud');
const router = express.Router();

router.post('/:id/members', async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    const devId = Number(req.body?.dev_id);
    const role = typeof req.body?.role_in_project === 'string' ? req.body.role_in_project.trim() : '';
    if (!Number.isInteger(projectId) || projectId <= 0 || !Number.isInteger(devId) || devId <= 0 || !role) {
      return res.status(400).json({ error: 'Valid project_id, dev_id and role_in_project are required.' });
    }
    await pool.execute('INSERT INTO project_members (project_id, dev_id, role_in_project) VALUES (?, ?, ?)', [projectId, devId, role]);
    res.status(201).json({ project_id: projectId, dev_id: devId, role_in_project: role });
  } catch (error) { next(error); }
});

router.get('/:id/members', async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    if (!Number.isInteger(projectId) || projectId <= 0) return res.status(400).json({ error: 'A valid project ID is required.' });
    const [rows] = await pool.execute('SELECT d.dev_id, d.name, d.email, d.designation, pm.role_in_project FROM project_members pm JOIN developers d ON d.dev_id=pm.dev_id WHERE pm.project_id=? ORDER BY d.name', [projectId]);
    res.json(rows);
  } catch (error) { next(error); }
});

router.delete('/:id/members/:devId', async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    const devId = Number(req.params.devId);
    if (!Number.isInteger(projectId) || projectId <= 0 || !Number.isInteger(devId) || devId <= 0) return res.status(400).json({ error: 'Valid project and developer IDs are required.' });
    const [result] = await pool.execute('DELETE FROM project_members WHERE project_id=? AND dev_id=?', [projectId, devId]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Project member not found.' });
    res.status(204).end();
  } catch (error) { next(error); }
});

router.use('/', createCrudRouter('projects'));
module.exports = router;
