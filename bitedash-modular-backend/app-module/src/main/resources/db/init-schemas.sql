-- =====================================================
-- BiteDash Schema Initialization
-- Compatible with Railway PostgreSQL
-- =====================================================

CREATE SCHEMA IF NOT EXISTS identity_schema;
CREATE SCHEMA IF NOT EXISTS organisation_schema;
CREATE SCHEMA IF NOT EXISTS order_schema;
CREATE SCHEMA IF NOT EXISTS menu_schema;
CREATE SCHEMA IF NOT EXISTS wallet_schema;
CREATE SCHEMA IF NOT EXISTS payment_schema;
CREATE SCHEMA IF NOT EXISTS inventory_schema;

-- Grant privileges to current user (Railway user)
-- Note: Railway automatically grants necessary privileges to the database owner
-- These grants are optional but included for compatibility
GRANT ALL PRIVILEGES ON SCHEMA identity_schema TO CURRENT_USER;
GRANT ALL PRIVILEGES ON SCHEMA organisation_schema TO CURRENT_USER;
GRANT ALL PRIVILEGES ON SCHEMA order_schema TO CURRENT_USER;
GRANT ALL PRIVILEGES ON SCHEMA menu_schema TO CURRENT_USER;
GRANT ALL PRIVILEGES ON SCHEMA wallet_schema TO CURRENT_USER;
GRANT ALL PRIVILEGES ON SCHEMA payment_schema TO CURRENT_USER;
GRANT ALL PRIVILEGES ON SCHEMA inventory_schema TO CURRENT_USER;

