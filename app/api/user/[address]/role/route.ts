import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const address = params.address

    // Check each role table
    const [auditor] = await sql`SELECT id FROM auditores WHERE address = ${address}`
    if (auditor) {
      return NextResponse.json({ role: "auditor" })
    }

    const [emisor] = await sql`SELECT id FROM emisores WHERE address = ${address}`
    if (emisor) {
      return NextResponse.json({ role: "emisor" })
    }

    const [desarrollador] = await sql`SELECT id FROM desarrolladores WHERE address = ${address}`
    if (desarrollador) {
      return NextResponse.json({ role: "desarrollador" })
    }

    // Check if admin (you can define admin addresses in env or separate table)
    const adminAddresses = (process.env.ADMIN_ADDRESSES || "").split(",")
    if (adminAddresses.includes(address.toLowerCase())) {
      return NextResponse.json({ role: "admin" })
    }

    return NextResponse.json({ role: "investor" })
  } catch (error) {
    console.error("Error fetching user role:", error)
    return NextResponse.json({ error: "Failed to fetch user role" }, { status: 500 })
  }
}
