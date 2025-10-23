import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const address = params.address.toLowerCase()

    try {
      const [userRole] = await sql`
        SELECT role FROM user_roles 
        WHERE LOWER(address) = ${address}
      `

      if (userRole) {
        return NextResponse.json({ role: userRole.role })
      }
    } catch (dbError: any) {
      // If table doesn't exist, log warning and return default role
      if (dbError.message?.includes('relation "user_roles" does not exist')) {
        console.warn("[v0] user_roles table does not exist. Please run migration script 003_create_roles_table.sql")
        return NextResponse.json({ role: "user", needsMigration: true })
      }
      throw dbError
    }

    // Default to user role if not found
    return NextResponse.json({ role: "user" })
  } catch (error) {
    console.error("[v0] Error fetching user role:", error)
    return NextResponse.json({ error: "Failed to fetch user role" }, { status: 500 })
  }
}
