import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const address = params.address.toLowerCase()

    const [userRole] = await sql`
      SELECT role FROM user_roles 
      WHERE LOWER(address) = ${address}
    `

    if (userRole) {
      return NextResponse.json({ role: userRole.role })
    }

    return NextResponse.json({ role: "user" })
  } catch (error) {
    console.error("Error fetching user role:", error)
    return NextResponse.json({ error: "Failed to fetch user role" }, { status: 500 })
  }
}
