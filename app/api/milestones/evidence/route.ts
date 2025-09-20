import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { projectId, milestoneId, evidenceUri } = await request.json()

    await sql`
      UPDATE hitos 
      SET evidencia_uri = ${evidenceUri}, estado = 'EN_REVISION', updated_at = NOW()
      WHERE proyecto_id = ${projectId} AND nro_hito = ${milestoneId}
    `

    return NextResponse.json({ status: "evidence_submitted" })
  } catch (error) {
    console.error("Error submitting evidence:", error)
    return NextResponse.json({ error: "Failed to submit evidence" }, { status: 500 })
  }
}
