import { neon } from "@neondatabase/serverless"

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL!)

// Database service for BrickForge platform
export class DatabaseService {
  // Projects
  async getProjects() {
    const projects = await sql`
      SELECT 
        p.id as project_id,
        pd.descripcion as name,
        pd.direccion as city,
        p.estado,
        p.monto_minimo as soft_cap,
        p.monto_total as hard_cap,
        COALESCE(SUM(a.monto), 0) as raised,
        p.ticket_minimo as min_ticket,
        pd.rentabilidad_esperada as roi_est,
        p.chain_id,
        p.contract_address,
        pd.media_urls[1] as cover_url
      FROM proyectos p
      JOIN proyectos_descripcion pd ON p.proyecto_descripcion_id = pd.id
      LEFT JOIN aportes a ON p.id = a.proyecto_id AND a.estado = 'CONFIRMADO'
      WHERE p.estado IN ('RECAUDACION', 'EN_EJECUCION')
      GROUP BY p.id, pd.descripcion, pd.direccion, p.estado, p.monto_minimo, 
               p.monto_total, p.ticket_minimo, pd.rentabilidad_esperada, 
               p.chain_id, p.contract_address, pd.media_urls[1]
      ORDER BY p.created_at DESC
    `

    return projects.map((project) => ({
      projectId: project.project_id,
      name: project.name,
      coverUrl: project.cover_url || "/placeholder.svg?height=300&width=400",
      city: project.city,
      estado: project.estado,
      softCap: project.soft_cap.toString(),
      hardCap: project.hard_cap.toString(),
      raised: project.raised.toString(),
      minTicket: project.min_ticket.toString(),
      roiEst: project.roi_est,
      chainId: project.chain_id,
      contractAddress: project.contract_address,
    }))
  }

  async getProject(projectId: string) {
    // Get main project data with related entities
    const [projectData] = await sql`
      SELECT 
        p.*,
        pd.*,
        e.nombre as emisor_nombre, e.address as emisor_address,
        d.nombre as desarrollador_nombre, d.address as desarrollador_address,
        au.nombre as auditor_nombre, au.address as auditor_address,
        COALESCE(SUM(a.monto), 0) as raised,
        COUNT(DISTINCT a.inversor_id) as investors_count
      FROM proyectos p
      JOIN proyectos_descripcion pd ON p.proyecto_descripcion_id = pd.id
      JOIN emisores e ON p.emisor_id = e.id
      JOIN desarrolladores d ON p.desarrollador_id = d.id
      JOIN auditores au ON p.auditor_id = au.id
      LEFT JOIN aportes a ON p.id = a.proyecto_id AND a.estado = 'CONFIRMADO'
      WHERE p.id = ${projectId}
      GROUP BY p.id, pd.id, e.id, d.id, au.id
    `

    if (!projectData) return null

    // Get milestones
    const hitos = await sql`
      SELECT * FROM hitos 
      WHERE proyecto_id = ${projectId}
      ORDER BY nro_hito ASC
    `

    // Get recent events (approvals and disbursements)
    const events = await sql`
      SELECT 
        'approval' as type,
        ap.fecha as date,
        ap.resultado as status,
        ap.comentario as description,
        ap.tx_hash,
        h.nro_hito as milestone_number
      FROM aprobaciones ap
      JOIN hitos h ON ap.hito_id = h.id
      WHERE h.proyecto_id = ${projectId}
      
      UNION ALL
      
      SELECT 
        'disbursement' as type,
        d.fecha as date,
        'COMPLETED' as status,
        'Desembolso de $' || d.monto || ' ' || d.moneda as description,
        d.tx_release as tx_hash,
        h.nro_hito as milestone_number
      FROM desembolsos d
      JOIN hitos h ON d.hito_id = h.id
      WHERE h.proyecto_id = ${projectId}
      
      ORDER BY date DESC
      LIMIT 10
    `

    return {
      projectId: projectData.id,
      name: projectData.descripcion,
      coverUrl: projectData.media_urls?.[0] || "/placeholder.svg?height=300&width=400",
      city: projectData.direccion,
      estado: projectData.estado,
      softCap: projectData.monto_minimo.toString(),
      hardCap: projectData.monto_total.toString(),
      raised: projectData.raised.toString(),
      minTicket: projectData.ticket_minimo.toString(),
      roiEst: projectData.rentabilidad_esperada,
      chainId: projectData.chain_id,
      contractAddress: projectData.contract_address,
      descripcion: {
        id: projectData.proyecto_descripcion_id,
        descripcion: projectData.descripcion,
        direccion: projectData.direccion,
        organizador: projectData.organizador,
        rentabilidad_esperada: projectData.rentabilidad_esperada,
        renta_garantizada: projectData.renta_garantizada,
        plazo_renta: projectData.plazo_renta,
        estado_actual_obra: projectData.estado_actual_obra,
      },
      proyecto: {
        id: projectData.id,
        proyecto_descripcion_id: projectData.proyecto_descripcion_id,
        emisor_id: projectData.emisor_id,
        desarrollador_id: projectData.desarrollador_id,
        auditor_id: projectData.auditor_id,
        chainId: projectData.chain_id,
        contractAddress: projectData.contract_address,
        moneda: projectData.moneda,
        monto_total: projectData.monto_total.toString(),
        monto_minimo: projectData.monto_minimo.toString(),
        ticket_minimo: projectData.ticket_minimo.toString(),
        cantidad_etapas: projectData.cantidad_etapas,
        estado: projectData.estado,
        approvalPolicy: projectData.approval_policy,
      },
      actores: {
        emisor: {
          id: projectData.emisor_id,
          nombre: projectData.emisor_nombre,
          address: projectData.emisor_address,
        },
        desarrollador: {
          id: projectData.desarrollador_id,
          nombre: projectData.desarrollador_nombre,
          address: projectData.desarrollador_address,
        },
        auditor: {
          id: projectData.auditor_id,
          nombre: projectData.auditor_nombre,
          address: projectData.auditor_address,
        },
      },
      investors: projectData.investors_count,
      hitos: hitos.map((hito) => ({
        id: hito.id,
        proyecto_id: hito.proyecto_id,
        nro_hito: hito.nro_hito,
        descripcion: hito.descripcion,
        imagenes: hito.imagenes || [],
        evidencia_uri: hito.evidencia_uri,
        fecha_limite: hito.fecha_limite,
        porcentaje_presupuesto: hito.porcentaje_presupuesto,
        estado: hito.estado,
      })),
      events: events.map((event) => ({
        type: event.type,
        date: event.date,
        status: event.status,
        description: event.description,
        txHash: event.tx_hash,
        milestoneNumber: event.milestone_number,
      })),
    }
  }

  // Investment tracking
  async recordInvestment(investorAddress: string, projectId: string, amount: string, txHash: string) {
    // First, ensure investor exists
    await sql`
      INSERT INTO inversores (address, kyc_status)
      VALUES (${investorAddress}, 'PENDIENTE')
      ON CONFLICT (address) DO NOTHING
    `

    // Get investor ID
    const [investor] = await sql`
      SELECT id FROM inversores WHERE address = ${investorAddress}
    `

    // Record the investment
    const [aporte] = await sql`
      INSERT INTO aportes (inversor_id, proyecto_id, monto, tx_hash, estado)
      VALUES (${investor.id}, ${projectId}, ${amount}, ${txHash}, 'PENDIENTE')
      RETURNING id
    `

    return aporte.id
  }

  async confirmInvestment(txHash: string) {
    await sql`
      UPDATE aportes 
      SET estado = 'CONFIRMADO', updated_at = NOW()
      WHERE tx_hash = ${txHash}
    `
  }

  // Milestone management
  async submitEvidence(projectId: string, milestoneId: string, evidenceUri: string) {
    await sql`
      UPDATE hitos 
      SET evidencia_uri = ${evidenceUri}, estado = 'EN_REVISION', updated_at = NOW()
      WHERE proyecto_id = ${projectId} AND nro_hito = ${milestoneId}
    `
  }

  async approveMilestone(projectId: string, milestoneId: string, approverAddress: string, txHash: string) {
    // Get milestone ID
    const [hito] = await sql`
      SELECT id FROM hitos 
      WHERE proyecto_id = ${projectId} AND nro_hito = ${milestoneId}
    `

    // Determine approver type and ID
    const [auditor] = await sql`SELECT id FROM auditores WHERE address = ${approverAddress}`
    const [emisor] = await sql`SELECT id FROM emisores WHERE address = ${approverAddress}`
    const [desarrollador] = await sql`SELECT id FROM desarrolladores WHERE address = ${approverAddress}`

    // Record approval
    await sql`
      INSERT INTO aprobaciones (hito_id, id_auditor, id_emisor, id_desarrollador, resultado, tx_hash)
      VALUES (
        ${hito.id}, 
        ${auditor?.id || null}, 
        ${emisor?.id || null}, 
        ${desarrollador?.id || null}, 
        'APROBADO', 
        ${txHash}
      )
    `

    // Update milestone status
    await sql`
      UPDATE hitos 
      SET estado = 'APROBADO', updated_at = NOW()
      WHERE id = ${hito.id}
    `
  }

  // User role management
  async getUserRole(address: string) {
    // Check each role table
    const [auditor] = await sql`SELECT id FROM auditores WHERE address = ${address}`
    if (auditor) return "auditor"

    const [emisor] = await sql`SELECT id FROM emisores WHERE address = ${address}`
    if (emisor) return "emisor"

    const [desarrollador] = await sql`SELECT id FROM desarrolladores WHERE address = ${address}`
    if (desarrollador) return "desarrollador"

    // Check if admin (you can define admin addresses in env or separate table)
    const adminAddresses = (process.env.ADMIN_ADDRESSES || "").split(",")
    if (adminAddresses.includes(address.toLowerCase())) return "admin"

    return "investor"
  }
}

// Export singleton instance
export const db = new DatabaseService()
