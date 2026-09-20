import { dbConnect } from "@/lib/mongodb";
import { GrievanceModel, IGrievanceDocument, IGrievance } from "@/models/Grievance";
import { createAlert } from "./alert.service";

export const SAMPLE_GRIEVANCES: IGrievance[] = [
  {
    id: "GRV-2024-001",
    title: "Road construction stopped mid-way, Lucknow",
    description: "Work halted for 3 weeks without notice. Material lying on road blocking traffic.",
    status: "Under Review",
    date: "2024-08-10",
    category: "Project Stall",
    district: "Lucknow",
    state: "Uttar Pradesh",
    name: "Ramesh Kumar",
    mobile: "+91 98765 43210",
    projectId: "MPLAD-UP-0401-2024-001",
  },
  {
    id: "GRV-2024-002",
    title: "Borewell not functional after completion",
    description: "Water pump motor failed within 5 days of installation in Gram Panchayat.",
    status: "Resolved",
    date: "2024-07-22",
    category: "Quality Issue",
    district: "Shivpuri",
    state: "Madhya Pradesh",
    name: "Priya Sharma",
    mobile: "+91 98123 45678",
  },
  {
    id: "GRV-2024-003",
    title: "No visibility of sanctioned funds usage",
    description: "No signboard erected at public library construction site.",
    status: "Open",
    date: "2024-08-20",
    category: "Transparency",
    district: "Barmer",
    state: "Rajasthan",
    name: "Amit Patel",
    mobile: "+91 99887 76655",
  },
];

let memoryGrievanceStore: IGrievance[] = [...SAMPLE_GRIEVANCES];

export async function getAllGrievances(): Promise<IGrievance[]> {
  try {
    const conn = await dbConnect();
    if (conn) {
      const docs = await GrievanceModel.find({}).sort({ createdAt: -1 }).lean<IGrievanceDocument[]>();
      if (docs && docs.length > 0) {
        return docs.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description || "",
          category: d.category,
          district: d.district,
          state: d.state || "",
          status: d.status,
          name: d.name,
          mobile: d.mobile,
          projectId: d.projectId || "",
          date: d.date,
        }));
      }
    }
  } catch (err) {
    console.error("Error fetching grievances from DB:", err);
  }
  return memoryGrievanceStore;
}

export async function getGrievanceById(id: string): Promise<IGrievance | null> {
  try {
    const conn = await dbConnect();
    if (conn) {
      const doc = await GrievanceModel.findOne({ id }).lean<IGrievanceDocument>();
      if (doc) {
        return {
          id: doc.id,
          title: doc.title,
          description: doc.description || "",
          category: doc.category,
          district: doc.district,
          state: doc.state || "",
          status: doc.status,
          name: doc.name,
          mobile: doc.mobile,
          projectId: doc.projectId || "",
          date: doc.date,
        };
      }
    }
  } catch (err) {
    console.error("Error fetching grievance by id from DB:", err);
  }
  return memoryGrievanceStore.find((g) => g.id === id) || null;
}

export async function createGrievance(data: {
  name: string;
  mobile: string;
  district: string;
  category: string;
  desc: string;
  projectId?: string;
}): Promise<IGrievance> {
  const count = memoryGrievanceStore.length + 1;
  const newId = `GRV-${new Date().getFullYear()}-${String(count).padStart(3, "0")}`;
  const today = new Date().toISOString().split("T")[0];

  const newGrievance: IGrievance = {
    id: newId,
    title: `${data.category}: ${data.desc.slice(0, 50)}${data.desc.length > 50 ? "..." : ""}`,
    description: data.desc,
    category: data.category || "General",
    district: data.district || "Unknown District",
    status: "Open",
    name: data.name,
    mobile: data.mobile,
    projectId: data.projectId || "",
    date: today,
  };

  memoryGrievanceStore.unshift(newGrievance);

  try {
    const conn = await dbConnect();
    if (conn) {
      await GrievanceModel.create(newGrievance);
    }
  } catch (err) {
    console.error("Error saving grievance to DB:", err);
  }

  // Automatically trigger an Alert for the new citizen grievance
  try {
    await createAlert({
      id: `ALT-GRV-${Date.now().toString().slice(-6)}`,
      title: `New Citizen Grievance Filed: ${newGrievance.id}`,
      description: `${data.name} reported a "${data.category}" issue in ${data.district}: ${data.desc.slice(0, 80)}`,
      type: "Compliance",
      severity: data.category === "Fund Misuse" || data.category === "Project Stall" ? "High" : "Medium",
      district: data.district,
      projectId: data.projectId || "",
      createdAt: today,
      actionRequired: "Investigate citizen complaint and respond to local authority.",
      status: "Active",
    });
  } catch (alertErr) {
    console.error("Error creating associated alert for grievance:", alertErr);
  }

  return newGrievance;
}

export async function updateGrievanceStatus(id: string, status: "Open" | "Under Review" | "Resolved"): Promise<IGrievance | null> {
  memoryGrievanceStore = memoryGrievanceStore.map((g) => (g.id === id ? { ...g, status } : g));

  try {
    const conn = await dbConnect();
    if (conn) {
      const updated = await GrievanceModel.findOneAndUpdate({ id }, { $set: { status } }, { new: true }).lean<IGrievanceDocument>();
      if (updated) {
        return {
          id: updated.id,
          title: updated.title,
          description: updated.description || "",
          category: updated.category,
          district: updated.district,
          state: updated.state || "",
          status: updated.status,
          name: updated.name,
          mobile: updated.mobile,
          projectId: updated.projectId || "",
          date: updated.date,
        };
      }
    }
  } catch (err) {
    console.error("Error updating grievance in DB:", err);
  }
  return memoryGrievanceStore.find((g) => g.id === id) || null;
}
