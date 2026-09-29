USE software_mgmt;

-- 1. INNER JOIN: projects and their clients.
SELECT p.project_id, p.title, c.name AS client, p.status FROM projects p INNER JOIN clients c ON c.client_id = p.client_id;

-- 2. Four-table JOIN: tasks, modules, projects and developers.
SELECT t.task_id, t.title AS task, m.name AS module, p.title AS project, d.name AS developer FROM tasks t JOIN modules m ON m.module_id=t.module_id JOIN projects p ON p.project_id=m.project_id LEFT JOIN developers d ON d.dev_id=t.assigned_to;

-- 3. LEFT JOIN: include projects with no bugs.
SELECT p.title, b.bug_id, b.severity, b.status FROM projects p LEFT JOIN bugs b ON b.project_id=p.project_id ORDER BY p.project_id;

-- 4. RIGHT JOIN: include every client, including those without projects.
SELECT c.name AS client, p.title AS project FROM projects p RIGHT JOIN clients c ON c.client_id=p.client_id ORDER BY c.name;

-- 5. GROUP BY aggregates: COUNT, SUM, AVG, MAX and MIN salaries by designation.
SELECT designation, COUNT(*) AS developer_count, SUM(salary) AS salary_sum, AVG(salary) AS average_salary, MAX(salary) AS highest_salary, MIN(salary) AS lowest_salary FROM developers GROUP BY designation;

-- 6. HAVING: project teams with at least two members.
SELECT p.title, COUNT(pm.dev_id) AS team_size FROM projects p JOIN project_members pm ON pm.project_id=p.project_id GROUP BY p.project_id, p.title HAVING COUNT(pm.dev_id) >= 2;

-- 7. Subquery in WHERE: projects with budgets above the average.
SELECT title, budget FROM projects WHERE budget > (SELECT AVG(budget) FROM projects) ORDER BY budget DESC;

-- 8. Correlated subquery: earliest due task(s) in each project.
SELECT t.task_id, t.title, t.due_date FROM tasks t JOIN modules m ON m.module_id=t.module_id WHERE t.due_date = (SELECT MIN(t2.due_date) FROM tasks t2 JOIN modules m2 ON m2.module_id=t2.module_id WHERE m2.project_id=m.project_id);

-- 9. IN: bugs assigned to developers on active projects.
SELECT bug_id, description, status FROM bugs WHERE assigned_to IN (SELECT pm.dev_id FROM project_members pm JOIN projects p ON p.project_id=pm.project_id WHERE p.status='Active');

-- 10. EXISTS: clients with at least one active project.
SELECT c.client_id, c.name FROM clients c WHERE EXISTS (SELECT 1 FROM projects p WHERE p.client_id=c.client_id AND p.status='Active');

-- 11. ORDER BY with LIMIT: top five project budgets.
SELECT title, budget FROM projects ORDER BY budget DESC LIMIT 5;

-- 12. LIKE search: find projects containing 'care'.
SELECT project_id, title FROM projects WHERE title LIKE '%care%';

-- 13. BETWEEN: tasks due during the second half of 2025.
SELECT task_id, title, due_date FROM tasks WHERE due_date BETWEEN '2025-07-01' AND '2025-12-31' ORDER BY due_date;

-- 14. UNION: unified project and release activity labels.
SELECT title AS activity, 'Project' AS activity_type FROM projects UNION SELECT CONCAT(p.title, ' v', r.version), 'Release' FROM releases r JOIN projects p ON p.project_id=r.project_id;

-- 15. CASE expression: task urgency label based on status and priority.
SELECT task_id, title, CASE WHEN status='Done' THEN 'Complete' WHEN priority='High' THEN 'Urgent' ELSE 'Standard' END AS work_label FROM tasks;

-- 16. Use the project_progress view.
SELECT project_id, title, total_tasks, done_tasks, completion_percentage FROM project_progress ORDER BY completion_percentage DESC, title;

-- 17. Stored procedure: returns task rows and open bug rows for developer 2.
CALL GetDeveloperWorkload(2);
