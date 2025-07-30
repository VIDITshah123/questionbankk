-- Add attendance permissions
INSERT OR IGNORE INTO base_base_permissions_master (name, description, created_at, updated_at)
VALUES 
  ('attendance_view', 'View attendance records', datetime('now'), datetime('now')),
  ('attendance_manage', 'Manage attendance records', datetime('now'), datetime('now'));

-- Assign permissions to appropriate roles
-- For Teachers
INSERT OR IGNORE INTO base_base_role_permissions_tx (role_id, permission_id, created_at)
SELECT r.role_id, p.permission_id, datetime('now')
FROM base_roles_master r, base_base_permissions_master p 
WHERE r.name = 'teacher' 
AND p.name IN ('attendance_view', 'attendance_manage');

-- For Admins (who should have all permissions)
INSERT OR IGNORE INTO base_base_role_permissions_tx (role_id, permission_id, created_at)
SELECT r.role_id, p.permission_id, datetime('now')
FROM base_roles_master r, base_base_permissions_master p 
WHERE r.name = 'admin' 
AND p.name IN ('attendance_view', 'attendance_manage');

-- For Students (view only)
INSERT OR IGNORE INTO base_base_role_permissions_tx (role_id, permission_id, created_at)
SELECT r.role_id, p.permission_id, datetime('now')
FROM base_roles_master r, base_base_permissions_master p 
WHERE r.name = 'student' 
AND p.name = 'attendance_view';
