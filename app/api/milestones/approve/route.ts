import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { projectId, milestoneId, approverAddress, txHash } = await request.json()

    // Get milestone ID
    const [hito] = await sql`
      SELECT id FROM hitos 
      WHERE proyecto_id = ${projectId} AND nro_hito = ${milestoneId}
    `

    if (!hito) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 })
    }

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

    return NextResponse.json({ status: "milestone_approved" })
  } catch (error) {
    console.error("Error approving milestone:", error)
    return NextResponse.json({ error: "Failed to approve milestone" }, { status: 500 })
  }
}
