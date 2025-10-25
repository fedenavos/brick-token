import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const rows = await sql<{
      id: string;
      nombre: string;
    }>`
      SELECT id, nombre
      FROM desarrolladores
      ORDER BY nombre ASC
    `;

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("Error fetching desarrolladores:", err);
    return NextResponse.json(
      { error: "Error fetching desarrolladores" },
      { status: 500 }
    );
  }
}
