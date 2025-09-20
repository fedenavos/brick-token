-- Seed data for BrickForge platform
-- This script populates the database with initial test data

-- Insert emisores (issuers)
INSERT INTO emisores (id, nombre, descripcion, address) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'BrickChain Capital', 'Emisor especializado en tokenización inmobiliaria', '0xabcdef1234567890abcdef1234567890abcdef12');

-- Insert desarrolladores (developers)
INSERT INTO desarrolladores (id, nombre, descripcion, address) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Constructora Premium SA', '25 años de experiencia en desarrollos residenciales', '0xfedcba0987654321fedcba0987654321fedcba09'),
('550e8400-e29b-41d4-a716-446655440003', 'Desarrollos Urbanos SRL', 'Especialistas en torres corporativas', '0x1122334455667788112233445566778811223344');

-- Insert auditores (auditors)
INSERT INTO auditores (id, nombre, descripcion, address) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'PropTech Auditors', 'Auditores certificados en construcción y blockchain', '0x9988776655443322998877665544332299887766');

-- Insert inversores (investors)
INSERT INTO inversores (id, nombre, descripcion, address, kyc_status) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'Juan Pérez', 'Inversor individual', '0x5555666677778888555566667777888855556666', 'APROBADO');

-- Insert project descriptions
INSERT INTO proyectos_descripcion (id, descripcion, direccion, organizador, rentabilidad_esperada, renta_garantizada, plazo_renta, estado_actual_obra, media_urls) VALUES
('550e8400-e29b-41d4-a716-446655440006', 'Complejo residencial de 120 unidades en zona premium de Palermo, Buenos Aires. Proyecto sustentable con amenities de primera clase.', 'Av. Santa Fe 3500, Palermo, CABA', 'Constructora Premium SA', '12-16%', 'Sí, 12% anual mínimo', '24 meses', 'Excavación completada, iniciando fundaciones', ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400']),
('550e8400-e29b-41d4-a716-446655440007', 'Torre de oficinas AAA en Puerto Madero con certificación LEED. 25 pisos con vista al río.', 'Juana Manso 555, Puerto Madero, CABA', 'Desarrollos Urbanos SRL', '10-14%', 'No garantizada', '18 meses', 'Estructura en piso 15', ARRAY['/placeholder.svg?height=300&width=400', '/placeholder.svg?height=300&width=400']);

-- Insert projects
INSERT INTO proyectos (id, proyecto_descripcion_id, emisor_id, desarrollador_id, auditor_id, chain_id, contract_address, moneda, monto_total, monto_minimo, ticket_minimo, cantidad_etapas, renta_garantizada, plazo_renta, estado, approval_policy) VALUES
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 137, '0x1234567890123456789012345678901234567890', 'USDC', 1000000.00, 500000.00, 1000.00, 4, '12-15%', '24 meses', 'RECAUDACION', 'EMISOR+AUDITOR'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 137, '0x2345678901234567890123456789012345678901', 'USDC', 750000.00, 400000.00, 500.00, 3, '10-14%', '18 meses', 'EN_EJECUCION', 'AUDITOR_SOLO');

-- Insert milestones
INSERT INTO hitos (id, proyecto_id, nro_hito, descripcion, imagenes, evidencia_uri, fecha_limite, porcentaje_presupuesto, estado) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440008', 1, 'Excavación y fundaciones', ARRAY['/placeholder.svg?height=200&width=300'], 'ipfs://QmExampleHash1', '2024-03-15 23:59:59+00', 25.00, 'APROBADO'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440008', 2, 'Estructura hasta piso 10', ARRAY[]::TEXT[], NULL, '2024-06-15 23:59:59+00', 35.00, 'EN_REVISION'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440008', 3, 'Terminaciones y amenities', ARRAY[]::TEXT[], NULL, '2024-09-15 23:59:59+00', 25.00, 'PENDIENTE'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440008', 4, 'Entrega final y escrituración', ARRAY[]::TEXT[], NULL, '2024-12-15 23:59:59+00', 15.00, 'PENDIENTE');

-- Insert approvals
INSERT INTO aprobaciones (id, hito_id, id_auditor, id_desarrollador, id_emisor, resultado, comentario, tx_hash, fecha) VALUES
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', NULL, '550e8400-e29b-41d4-a716-446655440001', 'APROBADO', 'Excavación completada según especificaciones', '0xabcd1234567890abcd1234567890abcd12345678', '2024-03-10 14:30:00+00');

-- Insert disbursements
INSERT INTO desembolsos (id, hito_id, monto, moneda, tx_release, fecha) VALUES
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440010', 250000.00, 'USDC', '0xefgh5678901234efgh5678901234efgh56789012', '2024-03-11 10:00:00+00');

-- Insert contributions
INSERT INTO aportes (id, inversor_id, proyecto_id, monto, moneda, tx_hash, fecha, estado) VALUES
('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440008', 5000.00, 'USDC', '0x1111222233334444111122223333444411112222', '2024-02-01 12:00:00+00', 'CONFIRMADO');
