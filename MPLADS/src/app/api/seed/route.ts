import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { ProjectModel } from "@/models/Project";
import { AlertModel } from "@/models/Alert";
import { GrievanceModel } from "@/models/Grievance";
import { CitizenEvidenceModel } from "@/models/CitizenEvidence";
import { PROJECTS as MOCK_PROJECTS, ALERTS as MOCK_ALERTS } from "@/data/mpladsData";
import { SAMPLE_GRIEVANCES } from "@/services/grievance.service";
import { PROTOTYPE_SEED_EVIDENCE } from "@/data/prototypeEvidenceData";

export async function POST() {
  return handleSeed();
}

export async function GET() {
  return handleSeed();
}

async function handleSeed() {
  try {
    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: "MongoDB connection is missing or failed to connect. Check MONGODB_URI." },
        { status: 500 }
      );
    }

    // Seed Projects
    let projectsCount = 0;
    for (const p of MOCK_PROJECTS) {
      await ProjectModel.updateOne({ id: p.id }, { $set: p }, { upsert: true });
      projectsCount++;
    }

    // Seed Alerts
    let alertsCount = 0;
    for (const a of MOCK_ALERTS) {
      await AlertModel.updateOne({ id: a.id }, { $set: a }, { upsert: true });
      alertsCount++;
    }

    // Seed Grievances
    let grievancesCount = 0;
    for (const g of SAMPLE_GRIEVANCES) {
      await GrievanceModel.updateOne({ id: g.id }, { $set: g }, { upsert: true });
      grievancesCount++;
    }

    // Seed Citizen Evidence
    let evidenceCount = 0;
    for (const e of PROTOTYPE_SEED_EVIDENCE) {
      await CitizenEvidenceModel.updateOne({ evidenceId: e.evidenceId }, { $set: e }, { upsert: true });
      evidenceCount++;
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      seeded: {
        projects: projectsCount,
        alerts: alertsCount,
        grievances: grievancesCount,
        citizenEvidence: evidenceCount,
      },
    });
  } catch (error) {
    console.error("Seed API error:", error);
    return NextResponse.json({ success: false, error: "Failed to seed database" }, { status: 500 });
  }
}
