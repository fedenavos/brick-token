import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    const normalizedAddress = address.toLowerCase()

    try {
      const [existingUser] = await sql`
        SELECT role FROM user_roles 
        WHERE LOWER(address) = ${normalizedAddress}
      `

      if (existingUser) {
        return NextResponse.json({
          role: existingUser.role,
          isNewUser: false,
        })
      }
    } catch (dbError: any) {
      if (dbError.message?.includes('relation "user_roles" does not exist')) {
        console.warn("[v0] user_roles table does not exist. Please run migration script 003_create_roles_table.sql")
        return NextResponse.json({
          role: "user",
          isNewUser: false,
          needsMigration: true,
          warning: "Role system not fully initialized. Please run database migrations.",
        })
      }
      throw dbError
    }

    // First, create investor record with RECHAZADO KYC status
    await sql`
      INSERT INTO inversores (address, nombre, descripcion, kyc_status)
      VALUES (${address}, '', '', 'RECHAZADO')
      ON CONFLICT (address) DO NOTHING
    `

    // Then, create user role record with 'user' role
    await sql`
      INSERT INTO user_roles (address, role)
      VALUES (${address}, 'user')
      ON CONFLICT (address) DO NOTHING
    `

    return NextResponse.json({
      role: "user",
      isNewUser: true,
      message: "User registered successfully",
    })
  } catch (error) {
    console.error("[v0] Error registering user:", error)
    return NextResponse.json(
      {
        error: "Failed to register user",
      },
      { status: 500 },
    )
  }
}
