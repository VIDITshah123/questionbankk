-- Migration: Fix missing admin permissions
-- This migration adds missing bulk upload user and feature toggle permissions
-- and assigns them to the admin role
-- Created: 2025-07-25

-- First, make sure the feature toggles exist
INSERT OR IGNORE INTO base_base_feature_toggles (feature_name, description, is_enabled, created_at, updated_at, feature)
VALUES
  ('route_users_bulk_upload', 'Feature toggle for Bulk User Upload route', 1, datetime('now'), datetime('now'), 'user_management'),
  ('route_roles_base_feature_toggles', 'Feature toggle for Feature Toggle Management route', 1, datetime('now'), datetime('now'), 'system');

-- Add the route permissions if they don't exist
INSERT OR IGNORE INTO base_base_permissions_master (name, description, created_at, updated_at)
VALUES
  -- Bulk User Upload permissions
  ('route_users_bulk_upload_view', 'View access for Bulk User Upload', datetime('now'), datetime('now')),
  ('route_users_bulk_upload_edit', 'Edit access for Bulk User Upload', datetime('now'), datetime('now')),
  ('route_users_bulk_upload_create', 'Create access for Bulk User Upload', datetime('now'), datetime('now')),
  ('route_users_bulk_upload_delete', 'Delete access for Bulk User Upload', datetime('now'), datetime('now')),
  
  -- Feature Toggle Management permissions
  ('route_roles_base_feature_toggles_view', 'View access for Feature Toggle Management', datetime('now'), datetime('now')),
  ('route_roles_base_feature_toggles_edit', 'Edit access for Feature Toggle Management', datetime('now'), datetime('now')),
  ('route_roles_base_feature_toggles_create', 'Create access for Feature Toggle Management', datetime('now'), datetime('now')),
  ('route_roles_base_feature_toggles_delete', 'Delete access for Feature Toggle Management', datetime('now'), datetime('now'));

-- Assign these permissions to the admin role
INSERT OR IGNORE INTO base_base_role_permissions_tx (role_id, permission_id, created_at)
SELECT 
  r.role_id,
  p.permission_id,
  datetime('now')
FROM 
  base_roles_master r,
  base_base_permissions_master p
WHERE 
  (r.name = 'Admin' OR r.name = 'admin') AND
  (p.name LIKE 'route_users_bulk_upload%' OR p.name LIKE 'route_roles_base_feature_toggles%');

-- For the admin role, also ensure it has all other permissions as a safety check
INSERT OR IGNORE INTO base_base_role_permissions_tx (role_id, permission_id, created_at)
SELECT 
  r.role_id,
  p.permission_id,
  datetime('now')
FROM 
  base_roles_master r,
  base_permissions_master p
WHERE 
  (r.name = 'Admin' OR r.name = 'admin') AND
  NOT EXISTS (
    SELECT 1 FROM base_role_permissions_tx rp 
    WHERE rp.role_id = r.role_id AND rp.permission_id = p.permission_id
  );
