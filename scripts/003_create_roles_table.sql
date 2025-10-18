-- Create unified roles table for BrickForge platform
-- This replaces the need to check multiple actor tables for role determination

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address VARCHAR(42) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'manager', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast address lookups
CREATE INDEX idx_user_roles_address ON user_roles(address);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Add updated_at trigger
CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing roles from actor tables
-- Admins (from ADMIN_ADDRESSES env var - will be added manually)
-- Managers (emisores, desarrolladores, auditores)
INSERT INTO user_roles (address, role)
SELECT address, 'manager' FROM emisores
UNION
SELECT address, 'manager' FROM desarrolladores
UNION
SELECT address, 'manager' FROM auditores
ON CONFLICT (address) DO NOTHING;

-- Users (inversores)
INSERT INTO user_roles (address, role)
SELECT address, 'user' FROM inversores
ON CONFLICT (address) DO NOTHING;

-- Add some sample admin addresses (replace with actual admin addresses)
-- INSERT INTO user_roles (address, role) VALUES
-- ('0xYourAdminAddress1', 'admin'),
-- ('0xYourAdminAddress2', 'admin');
