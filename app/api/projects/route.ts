import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// POST /api/projects
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1) Insertamos la descripción del proyecto
    const [descRow] = await sql<{
      id: string;
    }>`
      INSERT INTO proyectos_descripcion (
        descripcion,
        direccion,
        organizador,
        rentabilidad_esperada,
        renta_garantizada,
        plazo_renta,
        estado_actual_obra,
        media_urls
      )
      VALUES (
        ${body.descripcion},
        ${body.direccion},
        ${body.organizador},
        ${body.rentabilidad_esperada},
        ${body.renta_garantizada},
        ${body.plazo_renta},
        ${body.estado_actual_obra},
        ${body.media_urls ?? []}
      )
      RETURNING id
    `;

    const proyectoDescripcionId = descRow.id;

    // 2) Insertamos el proyecto principal
    const [projectRow] = await sql<{
      id: string;
    }>`
      INSERT INTO proyectos (
        proyecto_descripcion_id,
        emisor_id,
        desarrollador_id,
        auditor_id,
        chain_id,
        contract_address,
        moneda,
        monto_total,
        monto_minimo,
        ticket_minimo,
        renta_garantizada,
        plazo_renta,
        approval_policy,
        name,
        raised
      )
      VALUES (
        ${proyectoDescripcionId},
        ${body.emisor_id},
        ${body.desarrollador_id},
        ${body.auditor_id},
        ${body.chain_id},
        ${body.contract_address},
        ${body.moneda},
        ${body.monto_total},
        ${body.monto_minimo},
        ${body.ticket_minimo},
        ${body.renta_garantizada},
        ${body.plazo_renta},
        ${body.approval_policy},
        ${body.name},
        ${body.raised ?? 0}
      )
      RETURNING id
    `;

    return NextResponse.json(
      {
        proyecto_id: projectRow.id,
        proyecto_descripcion_id: proyectoDescripcionId,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error creando proyecto:", err);
    return NextResponse.json(
      { error: "Error creando proyecto", details: err.message },
      { status: 500 }
    );
  }
}

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
    `;

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
    }));

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
