require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const api = express.Router();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

api.use('/clients', require('./routes/clients'));
api.use('/developers', require('./routes/developers'));
api.use('/projects', require('./routes/projects'));
api.use('/modules', require('./routes/modules'));
api.use('/tasks', require('./routes/tasks'));
api.use('/bugs', require('./routes/bugs'));
api.use('/releases', require('./routes/releases'));
api.use('/dashboard', require('./routes/dashboard'));
api.use('/reports', require('./routes/reports'));
api.use('/query-runner', require('./routes/queries'));
app.use('/api', api);

app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found.' }));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A record with a unique value already exists.' });
  if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || error.sqlState === '45000') return res.status(400).json({ error: error.sqlMessage || 'The requested change violates a database constraint.' });
  res.status(500).json({ error: 'The server could not complete the request.' });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Software Management System running at http://localhost:${port}`));
