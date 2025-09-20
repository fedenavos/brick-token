import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
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

    const formattedProjects = projects.map((project) => ({
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

    return NextResponse.json(formattedProjects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}
