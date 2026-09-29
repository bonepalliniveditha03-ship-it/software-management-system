CREATE DATABASE IF NOT EXISTS software_mgmt CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE software_mgmt;

SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW IF EXISTS project_progress;
DROP PROCEDURE IF EXISTS GetDeveloperWorkload;
DROP TABLE IF EXISTS releases;
DROP TABLE IF EXISTS bugs;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS modules;
DROP TABLE IF EXISTS project_members;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS developers;
DROP TABLE IF EXISTS clients;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE clients (
  client_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE developers (
  dev_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  designation VARCHAR(100) NOT NULL,
  hire_date DATE NOT NULL,
  salary DECIMAL(12,2) NOT NULL,
  CONSTRAINT chk_developers_salary CHECK (salary > 0)
) ENGINE=InnoDB;

CREATE TABLE projects (
  project_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  client_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('Planned','Active','Completed','On Hold') NOT NULL DEFAULT 'Planned',
  budget DECIMAL(14,2) NOT NULL DEFAULT 0,
  CONSTRAINT chk_projects_dates CHECK (end_date >= start_date),
  CONSTRAINT chk_projects_budget CHECK (budget >= 0),
  CONSTRAINT fk_projects_client FOREIGN KEY (client_id) REFERENCES clients(client_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX idx_projects_client (client_id)
) ENGINE=InnoDB;

CREATE TABLE project_members (
  project_id INT NOT NULL,
  dev_id INT NOT NULL,
  role_in_project VARCHAR(100) NOT NULL,
  PRIMARY KEY (project_id, dev_id),
  CONSTRAINT fk_members_project FOREIGN KEY (project_id) REFERENCES projects(project_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_members_developer FOREIGN KEY (dev_id) REFERENCES developers(dev_id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE modules (
  module_id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  name VARCHAR(140) NOT NULL,
  CONSTRAINT uq_module_project_name UNIQUE (project_id, name),
  CONSTRAINT fk_modules_project FOREIGN KEY (project_id) REFERENCES projects(project_id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE tasks (
  task_id INT AUTO_INCREMENT PRIMARY KEY,
  module_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  assigned_to INT NULL,
  priority ENUM('Low','Medium','High') NOT NULL DEFAULT 'Medium',
  status ENUM('To Do','In Progress','Done') NOT NULL DEFAULT 'To Do',
  due_date DATE NOT NULL,
  CONSTRAINT fk_tasks_module FOREIGN KEY (module_id) REFERENCES modules(module_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_tasks_assignee FOREIGN KEY (assigned_to) REFERENCES developers(dev_id) ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_tasks_assigned_to (assigned_to)
) ENGINE=InnoDB;

CREATE TABLE bugs (
  bug_id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  description TEXT NOT NULL,
  severity ENUM('Minor','Major','Critical') NOT NULL DEFAULT 'Minor',
  status ENUM('Open','In Progress','Resolved') NOT NULL DEFAULT 'Open',
  reported_date DATE NOT NULL,
  resolved_date DATE NULL,
  assigned_to INT NULL,
  CONSTRAINT fk_bugs_project FOREIGN KEY (project_id) REFERENCES projects(project_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_bugs_assignee FOREIGN KEY (assigned_to) REFERENCES developers(dev_id) ON UPDATE CASCADE ON DELETE SET NULL,
  INDEX idx_bugs_project (project_id)
) ENGINE=InnoDB;

CREATE TABLE releases (
  release_id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  version VARCHAR(40) NOT NULL,
  release_date DATE NOT NULL,
  notes TEXT NOT NULL,
  CONSTRAINT uq_release_project_version UNIQUE (project_id, version),
  CONSTRAINT fk_releases_project FOREIGN KEY (project_id) REFERENCES projects(project_id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

DELIMITER $$
CREATE TRIGGER trg_bugs_set_resolved_date
BEFORE UPDATE ON bugs
FOR EACH ROW
BEGIN
  IF NEW.status = 'Resolved' AND OLD.status <> 'Resolved' THEN
    SET NEW.resolved_date = CURDATE();
  ELSEIF NEW.status <> 'Resolved' THEN
    SET NEW.resolved_date = NULL;
  END IF;
END$$

CREATE TRIGGER trg_tasks_validate_due_date
BEFORE INSERT ON tasks
FOR EACH ROW
BEGIN
  DECLARE project_start DATE;
  SELECT p.start_date INTO project_start
  FROM modules m JOIN projects p ON p.project_id = m.project_id
  WHERE m.module_id = NEW.module_id;
  IF project_start IS NOT NULL AND NEW.due_date < project_start THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Task due_date cannot be earlier than the project start_date';
  END IF;
END$$

CREATE PROCEDURE GetDeveloperWorkload(IN requested_dev_id INT)
BEGIN
  SELECT t.task_id, t.title, t.priority, t.status, t.due_date, m.name AS module_name, p.project_id, p.title AS project_title
  FROM tasks t
  JOIN modules m ON m.module_id = t.module_id
  JOIN projects p ON p.project_id = m.project_id
  WHERE t.assigned_to = requested_dev_id
  ORDER BY t.due_date, t.task_id;

  SELECT b.bug_id, b.description, b.severity, b.status, b.reported_date, b.project_id, p.title AS project_title
  FROM bugs b
  JOIN projects p ON p.project_id = b.project_id
  WHERE b.assigned_to = requested_dev_id AND b.status <> 'Resolved'
  ORDER BY b.reported_date DESC, b.bug_id;
END$$
DELIMITER ;

CREATE VIEW project_progress AS
SELECT p.project_id, p.title,
       COUNT(t.task_id) AS total_tasks,
       COALESCE(SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END), 0) AS done_tasks,
       CASE WHEN COUNT(t.task_id) = 0 THEN 0
            ELSE ROUND(100.0 * SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) / COUNT(t.task_id), 2)
       END AS completion_percentage
FROM projects p
LEFT JOIN modules m ON m.project_id = p.project_id
LEFT JOIN tasks t ON t.module_id = m.module_id
GROUP BY p.project_id, p.title;
