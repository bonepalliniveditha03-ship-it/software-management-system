# Software Management System

A DBMS capstone web application for managing software delivery work across clients, projects, developers, modules, tasks, bugs, and releases. The dashboard, project drill-down, operational reports, and safe predefined SQL runner use a MySQL 8 database through an Express REST API.

## Tech Stack

- Database: MySQL 8
- Backend: Node.js, Express, `mysql2/promise`, and `dotenv`
- Frontend: HTML, CSS, and vanilla JavaScript, served from `public/`
- Charts: Chart.js 4 from jsDelivr CDN

## Team Members

| Name | Roll No | GitHub Username |
|---|---|---|
| `<Team member 1>` | `<Roll number>` | `<GitHub username>` |
| `<Team member 2>` | `<Roll number>` | `<GitHub username>` |
| `<Team member 3>` | `<Roll number>` | `<GitHub username>` |

## Team Responsibilities

| Area | Responsibility |
|---|---|
| Database design | Schema, constraints, sample data, views, triggers, and stored procedures |
| Backend | REST API, input validation, reports, and query runner |
| Frontend | Dashboard, CRUD pages, project details, and report/query views |
| Testing and documentation | Setup verification, query evidence, diagrams, and final report |

Assign names to the responsibility areas before submission.

## Setup

Prerequisites: Node.js 18 or newer, npm, and MySQL 8.0.16 or newer (for enforced `CHECK` constraints). Make sure the MySQL service is running and the `mysql` command-line client is available.

Run these commands in PowerShell from the project directory. MySQL prompts for the account password when each import starts:

```powershell
Get-Content .\sql\ddl.sql | mysql -u root -p
Get-Content .\sql\dml.sql | mysql -u root -p
Copy-Item .\backend\.env.example .\backend\.env
```

Edit `backend/.env` and set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `PORT` for your local setup. Then install dependencies and start Express:

```powershell
Set-Location .\backend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000). The server can start before MySQL is reachable, but API-backed pages need a working database connection. Keep the server terminal open while using the site.

To reinitialize the sample database, rerun `sql/ddl.sql` and then `sql/dml.sql`. The DDL script drops and recreates the application tables, view, and procedure.

## Features

- Dashboard metrics, open-bug severity chart, task-status doughnut chart, and recent projects
- Searchable create/read/update/delete pages for all seven modules
- Related-record dropdowns, field validation, status badges, loading states, success/error toasts, and delete confirmation
- Project detail view with progress, team membership management, modules, tasks, bugs, and releases
- Project progress, developer workload, task, bug, and salary reports
- Seventeen numbered predefined SQL examples with result tables; arbitrary SQL is never accepted by the API
- MySQL constraints, indexes, `project_progress` view, bug-resolution and task-date triggers, and `GetDeveloperWorkload` procedure

## API Endpoints

All endpoints are under `/api`. Collection endpoints support `GET`, `POST`; item endpoints support `GET /:id`, `PUT /:id`, and `DELETE /:id`.

| Endpoint | Purpose |
|---|---|
| `/clients` | Client CRUD |
| `/developers` | Developer CRUD |
| `/projects` | Project CRUD |
| `/projects/:id/members` | List/add project members |
| `/projects/:id/members/:devId` | Remove a project member |
| `/modules` | Module CRUD |
| `/tasks` | Task CRUD |
| `/bugs` | Bug CRUD |
| `/releases` | Release CRUD |
| `/dashboard/stats` | Dashboard counts |
| `/reports/project-progress` | Project progress view |
| `/reports/developer-workload/:id` | Stored-procedure workload |
| `/reports/tasks-per-project` | Task counts by project |
| `/reports/bugs-by-severity` | Unresolved bug counts by severity |
| `/reports/developers-without-tasks` | Developers without assigned tasks |
| `/reports/above-average-salary` | Developers above average salary |
| `/query-runner` | List the fixed query catalog |
| `/query-runner/:n` | Run predefined query number `n` only |

## Database Files

- `sql/ddl.sql`: schema, constraints, indexes, view, triggers, and procedure
- `sql/dml.sql`: realistic sample data and commented mutation/transaction examples
- `sql/queries.sql`: numbered learning and reporting queries

Add the ER diagram, final report, and query screenshots to `diagrams/`, `docs/`, and `screenshots/` respectively.

## GitHub Repository

Repository link: `<Add the GitHub repository URL here>`
