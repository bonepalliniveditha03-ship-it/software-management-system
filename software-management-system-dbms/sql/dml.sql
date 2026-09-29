USE software_mgmt;

INSERT INTO clients (name, email, phone) VALUES
('Northstar Health', 'contact@northstarhealth.example', '+1-415-555-0101'),
('Cedar Finance', 'hello@cedarfinance.example', '+1-212-555-0102'),
('BluePeak Logistics', 'it@bluepeaklogistics.example', '+1-312-555-0103'),
('Lumen Education', 'admin@lumenedu.example', '+1-617-555-0104'),
('Fieldstone Retail', 'digital@fieldstoneretail.example', '+1-206-555-0105'),
('Orbit Energy', 'projects@orbitenergy.example', '+1-512-555-0106');

INSERT INTO developers (name, email, designation, hire_date, salary) VALUES
('Ava Patel', 'ava.patel@example.com', 'Engineering Lead', '2021-04-12', 118000),
('Noah Kim', 'noah.kim@example.com', 'Senior Backend Engineer', '2020-09-21', 108000),
('Mia Chen', 'mia.chen@example.com', 'Frontend Engineer', '2022-02-14', 92000),
('Ethan Brooks', 'ethan.brooks@example.com', 'QA Engineer', '2021-11-08', 84000),
('Sofia Garcia', 'sofia.garcia@example.com', 'Data Engineer', '2019-06-03', 112000),
('Liam Wilson', 'liam.wilson@example.com', 'Product Designer', '2023-01-16', 79000),
('Amara Okafor', 'amara.okafor@example.com', 'DevOps Engineer', '2020-03-30', 101000),
('Leo Martin', 'leo.martin@example.com', 'Full Stack Engineer', '2022-08-22', 97000);

INSERT INTO projects (title, description, client_id, start_date, end_date, status, budget) VALUES
('CarePath Portal', 'Patient scheduling and care coordination platform.', 1, '2025-01-06', '2025-11-30', 'Active', 185000),
('CedarPay Modernization', 'Modern payment processing and account experience.', 2, '2025-02-03', '2026-03-31', 'Active', 320000),
('Routewise Control Tower', 'Shipment visibility and logistics operations dashboard.', 3, '2024-10-01', '2025-08-29', 'Completed', 210000),
('Lumen Learning Hub', 'Learning management and course delivery platform.', 4, '2025-03-10', '2026-06-30', 'Active', 165000),
('Fieldstone Commerce', 'Retail ecommerce storefront and inventory services.', 5, '2025-05-05', '2026-05-29', 'On Hold', 275000),
('Orbit Asset Monitor', 'Renewable asset monitoring and maintenance planning.', 6, '2024-11-18', '2025-12-19', 'Active', 240000),
('CarePath Mobile', 'Companion mobile experience for care teams.', 1, '2025-06-02', '2026-02-27', 'Planned', 125000),
('Cedar Insights', 'Reporting workspace for financial operations.', 2, '2024-07-01', '2025-04-30', 'Completed', 98000);

INSERT INTO project_members (project_id, dev_id, role_in_project) VALUES
(1,1,'Project Lead'),(1,2,'Backend'),(1,3,'Frontend'),(1,4,'QA'),
(2,1,'Technical Lead'),(2,2,'Payments'),(2,5,'Data'),(2,7,'Infrastructure'),
(3,2,'Backend'),(3,4,'QA'),(3,8,'Full Stack'),
(4,3,'Frontend'),(4,6,'Product Design'),(4,8,'Full Stack'),
(5,1,'Technical Lead'),(5,3,'Frontend'),(5,7,'Infrastructure'),
(6,5,'Data'),(6,7,'Infrastructure'),(6,8,'Full Stack'),
(7,3,'Frontend'),(7,4,'QA'),(8,2,'Backend'),(8,5,'Analytics');

INSERT INTO modules (project_id, name) VALUES
(1,'Appointments'),(1,'Patient Records'),(2,'Payments API'),(2,'Account Security'),
(3,'Shipment Tracking'),(3,'Operations Console'),(4,'Course Catalog'),(4,'Assessments'),
(5,'Storefront'),(5,'Inventory'),(6,'Telemetry'),(6,'Maintenance Planner'),
(7,'Care Team'),(8,'Reporting');

INSERT INTO tasks (module_id, title, assigned_to, priority, status, due_date) VALUES
(1,'Design appointment search API',2,'High','Done','2025-03-14'),
(1,'Build clinician availability view',3,'Medium','In Progress','2025-04-18'),
(1,'Validate booking edge cases',4,'High','To Do','2025-05-09'),
(2,'Create patient profile schema',2,'High','Done','2025-03-28'),
(2,'Add consent history timeline',8,'Medium','In Progress','2025-06-13'),
(2,'Review records access controls',1,'High','To Do','2025-06-27'),
(3,'Implement payment authorization',2,'High','In Progress','2025-06-20'),
(3,'Add idempotency handling',8,'High','To Do','2025-07-11'),
(3,'Run processor contract tests',4,'Medium','To Do','2025-07-25'),
(4,'Add multi-factor enrollment',7,'High','Done','2025-05-30'),
(4,'Build account recovery flow',3,'Medium','In Progress','2025-07-18'),
(4,'Audit session expiration',1,'Medium','To Do','2025-08-01'),
(5,'Ingest carrier location events',5,'High','Done','2025-01-31'),
(5,'Normalize tracking statuses',2,'Medium','Done','2025-02-21'),
(6,'Add delayed shipment alerts',8,'Medium','Done','2025-04-04'),
(6,'Test console filters',4,'Low','Done','2025-05-16'),
(7,'Create course discovery page',3,'High','In Progress','2025-06-27'),
(7,'Import course metadata',5,'Medium','To Do','2025-07-18'),
(8,'Build assessment scoring rules',8,'High','In Progress','2025-08-08'),
(8,'Add instructor review queue',6,'Medium','To Do','2025-08-22'),
(9,'Implement product listing page',3,'High','To Do','2025-08-15'),
(9,'Add accessible product filters',6,'Medium','To Do','2025-08-29'),
(10,'Sync inventory snapshots',5,'High','In Progress','2025-09-12'),
(10,'Handle low-stock thresholds',2,'Medium','To Do','2025-09-26'),
(11,'Process turbine telemetry',5,'High','Done','2025-02-28'),
(11,'Add sensor health scoring',8,'Medium','In Progress','2025-05-23'),
(12,'Prioritize maintenance alerts',7,'High','To Do','2025-07-11'),
(12,'Build work order export',2,'Low','To Do','2025-08-15'),
(13,'Create care team directory',3,'Medium','To Do','2025-09-05'),
(14,'Add monthly finance summaries',5,'High','Done','2025-02-14');

INSERT INTO bugs (project_id, description, severity, status, reported_date, resolved_date, assigned_to) VALUES
(1,'Calendar displays duplicate slots after refresh.','Major','Open','2025-03-19',NULL,3),
(1,'Profile export omits preferred language.','Minor','In Progress','2025-04-02',NULL,2),
(2,'Retry can create a duplicate authorization.','Critical','Open','2025-06-11',NULL,2),
(2,'Account recovery email uses stale branding.','Minor','Resolved','2025-04-15','2025-04-18',3),
(3,'Tracking page stalls on large event histories.','Major','Resolved','2025-01-08','2025-01-12',8),
(3,'Timezone offset is missing in alert payload.','Minor','Resolved','2025-02-07','2025-02-10',2),
(4,'Assessment score rounds incorrectly at boundary.','Major','Open','2025-06-16',NULL,8),
(4,'Course thumbnail is cropped on narrow screens.','Minor','In Progress','2025-06-20',NULL,3),
(5,'Inventory count can briefly become negative.','Critical','Open','2025-08-06',NULL,5),
(5,'Filter selection resets after navigation.','Minor','Open','2025-08-09',NULL,3),
(6,'Telemetry importer rejects a valid null reading.','Major','In Progress','2025-03-10',NULL,5),
(6,'Maintenance alert links to the wrong asset.','Major','Open','2025-05-14',NULL,7),
(7,'Care team avatar falls back to broken image.','Minor','Open','2025-08-01',NULL,3),
(8,'Monthly totals exclude the final calendar day.','Critical','Resolved','2025-01-22','2025-01-27',5),
(2,'Payment receipt has inconsistent currency format.','Major','In Progress','2025-06-25',NULL,8);

INSERT INTO releases (project_id, version, release_date, notes) VALUES
(1,'1.0.0','2025-02-14','Initial appointment booking release.'),
(1,'1.1.0','2025-05-02','Patient record enhancements.'),
(2,'2.0.0','2025-04-30','New account security foundation.'),
(2,'2.1.0','2025-07-31','Payment reliability improvements.'),
(3,'1.0.0','2024-12-20','Initial shipment visibility launch.'),
(3,'1.2.0','2025-04-25','Operations alerts and filters.'),
(4,'0.9.0','2025-06-16','Early access course catalog.'),
(5,'0.8.0','2025-08-01','Private storefront preview.'),
(6,'1.0.0','2025-03-21','Asset telemetry launch.'),
(8,'1.0.0','2024-11-15','Initial finance reporting workspace.');

-- Example updates (commented so loading sample data does not alter it):
-- UPDATE projects SET status = 'Completed' WHERE project_id = 3;
-- UPDATE developers SET salary = salary * 1.05 WHERE dev_id = 2;
-- UPDATE tasks SET priority = 'High' WHERE task_id = 18;
-- UPDATE bugs SET status = 'Resolved' WHERE bug_id = 1;

-- Example deletes (commented to preserve the sample rows):
-- DELETE FROM releases WHERE release_id = 10;
-- DELETE FROM bugs WHERE bug_id = 15;
-- DELETE FROM project_members WHERE project_id = 8 AND dev_id = 5;

-- Example transaction: reassign one developer's tasks atomically (review IDs before running).
-- START TRANSACTION;
-- UPDATE tasks SET assigned_to = 8 WHERE assigned_to = 2 AND task_id IN (7, 8);
-- COMMIT;
