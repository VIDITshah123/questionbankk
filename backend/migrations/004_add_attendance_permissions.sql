-- Add attendance permissions
INSERT INTO permissions (name, description, created_at, updated_at)
VALUES 
  ('attendance_view', 'View attendance records', datetime('now'), datetime('now')),
  ('attendance_manage', 'Manage attendance records', datetime('now'), datetime('now'));

-- Assign permissions to appropriate roles
-- For Teachers
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, datetime('now'), datetime('now')
FROM roles r, permissions p 
WHERE r.name = 'teacher' 
AND p.name IN ('attendance_view', 'attendance_manage');

-- For Admins (who should have all permissions)
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, datetime('now'), datetime('now')
FROM roles r, permissions p 
WHERE r.name = 'admin' 
AND p.name IN ('attendance_view', 'attendance_manage');

-- For Students (view only)
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT r.id, p.id, datetime('now'), datetime('now')
FROM roles r, permissions p 
WHERE r.name = 'student' 
AND p.name = 'attendance_view';
