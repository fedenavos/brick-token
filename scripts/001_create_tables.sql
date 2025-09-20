-- Create database schema for BrickForge tokenization platform
-- This script creates all necessary tables for projects, actors, milestones, and transactions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Actors tables
CREATE TABLE emisores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    address VARCHAR(42) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE desarrolladores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    address VARCHAR(42) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE auditores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    address VARCHAR(42) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE inversores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255),
    descripcion TEXT,
    address VARCHAR(42) NOT NULL UNIQUE,
    kyc_status VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (kyc_status IN ('PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project description table
CREATE TABLE proyectos_descripcion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    descripcion TEXT NOT NULL,
    direccion VARCHAR(500),
    organizador VARCHAR(255),
    rentabilidad_esperada VARCHAR(50),
    renta_garantizada VARCHAR(100),
    plazo_renta VARCHAR(50),
    estado_actual_obra TEXT,
    media_urls TEXT[], -- Array of image/media URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Main projects table
CREATE TABLE proyectos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto_descripcion_id UUID NOT NULL REFERENCES proyectos_descripcion(id),
    emisor_id UUID NOT NULL REFERENCES emisores(id),
    desarrollador_id UUID NOT NULL REFERENCES desarrolladores(id),
    auditor_id UUID NOT NULL REFERENCES auditores(id),
    chain_id INTEGER NOT NULL DEFAULT 137,
    contract_address VARCHAR(42),
    moneda VARCHAR(10) DEFAULT 'USDC',
    monto_total DECIMAL(18,2) NOT NULL,
    monto_minimo DECIMAL(18,2) NOT NULL,
    ticket_minimo DECIMAL(18,2) NOT NULL,
    cantidad_etapas INTEGER NOT NULL DEFAULT 1,
    renta_garantizada VARCHAR(50),
    plazo_renta VARCHAR(50),
    estado VARCHAR(20) DEFAULT 'BORRADOR' CHECK (estado IN ('BORRADOR', 'RECAUDACION', 'EN_EJECUCION', 'FINALIZADO', 'CANCELADO')),
    approval_policy VARCHAR(20) DEFAULT 'EMISOR+AUDITOR' CHECK (approval_policy IN ('EMISOR_SOLO', 'AUDITOR_SOLO', 'EMISOR+AUDITOR', 'DESARROLLADOR+AUDITOR')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project milestones
CREATE TABLE hitos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
    nro_hito INTEGER NOT NULL,
    descripcion TEXT NOT NULL,
    imagenes TEXT[], -- Array of image URLs
    evidencia_uri VARCHAR(500), -- IPFS or storage URI
    fecha_limite TIMESTAMP WITH TIME ZONE,
    porcentaje_presupuesto DECIMAL(5,2) NOT NULL CHECK (porcentaje_presupuesto >= 0 AND porcentaje_presupuesto <= 100),
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proyecto_id, nro_hito)
);

-- Milestone approvals
CREATE TABLE aprobaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hito_id UUID NOT NULL REFERENCES hitos(id) ON DELETE CASCADE,
    id_auditor UUID REFERENCES auditores(id),
    id_desarrollador UUID REFERENCES desarrolladores(id),
    id_emisor UUID REFERENCES emisores(id),
    resultado VARCHAR(20) NOT NULL CHECK (resultado IN ('APROBADO', 'RECHAZADO')),
    comentario TEXT,
    tx_hash VARCHAR(66), -- Ethereum transaction hash
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fund disbursements
CREATE TABLE desembolsos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hito_id UUID NOT NULL REFERENCES hitos(id) ON DELETE CASCADE,
    monto DECIMAL(18,2) NOT NULL,
    moneda VARCHAR(10) DEFAULT 'USDC',
    tx_release VARCHAR(66), -- Transaction hash for fund release
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investor contributions
CREATE TABLE aportes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inversor_id UUID NOT NULL REFERENCES inversores(id),
    proyecto_id UUID NOT NULL REFERENCES proyectos(id),
    monto DECIMAL(18,2) NOT NULL,
    moneda VARCHAR(10) DEFAULT 'USDC',
    tx_hash VARCHAR(66) NOT NULL, -- Transaction hash
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'CONFIRMADO', 'FALLIDO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_proyectos_estado ON proyectos(estado);
CREATE INDEX idx_proyectos_emisor ON proyectos(emisor_id);
CREATE INDEX idx_hitos_proyecto ON hitos(proyecto_id);
CREATE INDEX idx_hitos_estado ON hitos(estado);
CREATE INDEX idx_aportes_proyecto ON aportes(proyecto_id);
CREATE INDEX idx_aportes_inversor ON aportes(inversor_id);
CREATE INDEX idx_inversores_address ON inversores(address);
CREATE INDEX idx_emisores_address ON emisores(address);
CREATE INDEX idx_desarrolladores_address ON desarrolladores(address);
CREATE INDEX idx_auditores_address ON auditores(address);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_emisores_updated_at BEFORE UPDATE ON emisores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_desarrolladores_updated_at BEFORE UPDATE ON desarrolladores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_auditores_updated_at BEFORE UPDATE ON auditores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inversores_updated_at BEFORE UPDATE ON inversores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proyectos_descripcion_updated_at BEFORE UPDATE ON proyectos_descripcion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proyectos_updated_at BEFORE UPDATE ON proyectos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hitos_updated_at BEFORE UPDATE ON hitos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
