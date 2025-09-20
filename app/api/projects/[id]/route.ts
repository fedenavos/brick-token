import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id

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

    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

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

    const project = {
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

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}
