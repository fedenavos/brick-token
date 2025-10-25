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
      FROM emisores
      ORDER BY nombre ASC
    `;

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("Error fetching emisores:", err);
    return NextResponse.json(
      { error: "Error fetching emisores" },
      { status: 500 }
    );
  }
}
