const express = require('express');
const pool = require('../db');

const resources = {
  clients: { table: 'clients', id: 'client_id', columns: ['name', 'email', 'phone'], required: ['name', 'email', 'phone'], search: ['name', 'email', 'phone'] },
  developers: { table: 'developers', id: 'dev_id', columns: ['name', 'email', 'designation', 'hire_date', 'salary'], required: ['name', 'email', 'designation', 'hire_date', 'salary'], search: ['name', 'email', 'designation'] },
  projects: { table: 'projects', id: 'project_id', columns: ['title', 'description', 'client_id', 'start_date', 'end_date', 'status', 'budget'], required: ['title', 'description', 'client_id', 'start_date', 'end_date', 'status', 'budget'], search: ['title', 'description', 'status'] },
  modules: { table: 'modules', id: 'module_id', columns: ['project_id', 'name'], required: ['project_id', 'name'], search: ['name'] },
  tasks: { table: 'tasks', id: 'task_id', columns: ['module_id', 'title', 'assigned_to', 'priority', 'status', 'due_date'], required: ['module_id', 'title', 'priority', 'status', 'due_date'], nullable: ['assigned_to'], search: ['title', 'priority', 'status'] },
  bugs: { table: 'bugs', id: 'bug_id', columns: ['project_id', 'description', 'severity', 'status', 'reported_date', 'resolved_date', 'assigned_to'], required: ['project_id', 'description', 'severity', 'status', 'reported_date'], nullable: ['resolved_date', 'assigned_to'], search: ['description', 'severity', 'status'] },
  releases: { table: 'releases', id: 'release_id', columns: ['project_id', 'version', 'release_date', 'notes'], required: ['project_id', 'version', 'release_date', 'notes'], search: ['version', 'notes'] }
};

const enumValues = {
  projects: { status: ['Planned', 'Active', 'Completed', 'On Hold'] },
  tasks: { priority: ['Low', 'Medium', 'High'], status: ['To Do', 'In Progress', 'Done'] },
  bugs: { severity: ['Minor', 'Major', 'Critical'], status: ['Open', 'In Progress', 'Resolved'] }
};

function validate(body, config, isUpdate = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'A JSON object is required.';
  const allowed = new Set(config.columns);
  const unexpected = Object.keys(body).filter((key) => !allowed.has(key));
  if (unexpected.length) return `Unexpected field: ${unexpected[0]}`;
  for (const key of config.required) {
    if (!(key in body) || body[key] === '' || body[key] === null || body[key] === undefined || (typeof body[key] === 'string' && !body[key].trim())) return `${key} is required.`;
  }
  for (const key of config.columns) {
    const value = body[key];
    if (value === undefined || value === null || value === '') {
      if (config.required.includes(key)) return `${key} is required.`;
      if (!config.nullable?.includes(key)) return `${key} cannot be empty.`;
      continue;
    }
    if (['client_id', 'project_id', 'module_id', 'assigned_to'].includes(key) && ((typeof value !== 'number' && typeof value !== 'string') || !Number.isInteger(Number(value)) || Number(value) <= 0)) return `${key} must be a positive integer.`;
    if (['salary', 'budget'].includes(key) && ((typeof value !== 'number' && typeof value !== 'string') || !Number.isFinite(Number(value)) || Number(value) < 0 || (key === 'salary' && Number(value) === 0))) return `${key} must be ${key === 'salary' ? 'greater than zero' : 'non-negative'}.`;
    if (['hire_date', 'start_date', 'end_date', 'due_date', 'reported_date', 'resolved_date', 'release_date'].includes(key)) {
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${key} must use YYYY-MM-DD format.`;
      const [year, month, day] = value.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return `${key} is not a valid calendar date.`;
    } else if (!['client_id', 'project_id', 'module_id', 'assigned_to', 'salary', 'budget'].includes(key) && typeof value !== 'string') {
      return `${key} must be text.`;
    }
    if (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email must be a valid email address.';
    if (enumValues[config.table]?.[key] && !enumValues[config.table][key].includes(value)) return `${key} has an invalid value.`;
  }
  if (body.start_date && body.end_date && body.end_date < body.start_date) return 'end_date cannot be earlier than start_date.';
  return null;
}

function createCrudRouter(resourceName) {
  const config = resources[resourceName];
  const router = express.Router();
  const selectColumns = [config.id, ...config.columns].join(', ');

  router.get('/', async (req, res, next) => {
    try {
      const search = typeof req.query.q === 'string' ? req.query.q.trim() : '';
      let sql = `SELECT ${selectColumns} FROM ${config.table}`;
      let params = [];
      if (search) {
        sql += ` WHERE ${config.search.map((column) => `${column} LIKE ?`).join(' OR ')}`;
        params = config.search.map(() => `%${search}%`);
      }
      sql += ` ORDER BY ${config.id} DESC`;
      const [rows] = await pool.execute(sql, params);
      res.json(rows);
    } catch (error) { next(error); }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'A valid numeric ID is required.' });
      const [rows] = await pool.execute(`SELECT ${selectColumns} FROM ${config.table} WHERE ${config.id} = ?`, [id]);
      if (!rows.length) return res.status(404).json({ error: `${resourceName} record not found.` });
      res.json(rows[0]);
    } catch (error) { next(error); }
  });

  router.post('/', async (req, res, next) => {
    try {
      const message = validate(req.body, config);
      if (message) return res.status(400).json({ error: message });
      const values = config.columns.map((column) => req.body[column] ?? null);
      const placeholders = config.columns.map(() => '?').join(', ');
      const [result] = await pool.execute(`INSERT INTO ${config.table} (${config.columns.join(', ')}) VALUES (${placeholders})`, values);
      const [rows] = await pool.execute(`SELECT ${selectColumns} FROM ${config.table} WHERE ${config.id} = ?`, [result.insertId]);
      res.status(201).json(rows[0]);
    } catch (error) { next(error); }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'A valid numeric ID is required.' });
      const message = validate(req.body, config, true);
      if (message) return res.status(400).json({ error: message });
      const assignments = config.columns.map((column) => `${column} = ?`).join(', ');
      const values = config.columns.map((column) => req.body[column] ?? null);
      const [result] = await pool.execute(`UPDATE ${config.table} SET ${assignments} WHERE ${config.id} = ?`, [...values, id]);
      if (!result.affectedRows) {
        const [existing] = await pool.execute(`SELECT ${config.id} FROM ${config.table} WHERE ${config.id} = ?`, [id]);
        if (!existing.length) return res.status(404).json({ error: `${resourceName} record not found.` });
      }
      const [rows] = await pool.execute(`SELECT ${selectColumns} FROM ${config.table} WHERE ${config.id} = ?`, [id]);
      res.json(rows[0]);
    } catch (error) { next(error); }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'A valid numeric ID is required.' });
      const [result] = await pool.execute(`DELETE FROM ${config.table} WHERE ${config.id} = ?`, [id]);
      if (!result.affectedRows) return res.status(404).json({ error: `${resourceName} record not found.` });
      res.status(204).end();
    } catch (error) { next(error); }
  });

  return router;
}

module.exports = { createCrudRouter, resources };
