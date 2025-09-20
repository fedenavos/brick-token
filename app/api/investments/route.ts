import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { investorAddress, projectId, amount, txHash } = await request.json()

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

    return NextResponse.json({ id: aporte.id, status: "recorded" })
  } catch (error) {
    console.error("Error recording investment:", error)
    return NextResponse.json({ error: "Failed to record investment" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { txHash, status } = await request.json()

    await sql`
      UPDATE aportes 
      SET estado = ${status}, updated_at = NOW()
      WHERE tx_hash = ${txHash}
    `

    return NextResponse.json({ status: "updated" })
  } catch (error) {
    console.error("Error updating investment:", error)
    return NextResponse.json({ error: "Failed to update investment" }, { status: 500 })
  }
}
