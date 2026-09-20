import { dbConnect } from "@/lib/mongodb";
import { ProjectModel, IProjectDocument } from "@/models/Project";
import { PROJECTS as MOCK_PROJECTS } from "@/data/mpladsData";
import type { Project } from "@/types";

// In-memory fallback cache if DB is offline but items are updated in session
let memoryProjectsStore: Project[] = [...MOCK_PROJECTS];

export async function getAllProjects(): Promise<Project[]> {
  try {
    const conn = await dbConnect();
    if (conn) {
      const docs = await ProjectModel.find({}).lean<IProjectDocument[]>();
      if (docs && docs.length > 0) {
        return docs.map((d) => ({
          id: d.id,
          name: d.name,
          category: d.category,
          subCategory: d.subCategory || "",
          state: d.state,
          district: d.district,
          constituency: d.constituency || "",
          mpName: d.mpName || "",
          mpId: d.mpId || "",
          sanctionedAmount: d.sanctionedAmount || 0,
          releasedAmount: d.releasedAmount || 0,
          expenditure: d.expenditure || 0,
          status: d.status,
          sanctionDate: d.sanctionDate || "",
          completionDate: d.completionDate,
          expectedCompletion: d.expectedCompletion || "",
          progress: d.progress || 0,
          riskScore: d.riskScore || 0,
          riskLevel: d.riskLevel || "Low",
          riskFlags: d.riskFlags || [],
          contractor: d.contractor || "",
          geoLat: d.geoLat || 0,
          geoLng: d.geoLng || 0,
          photos: d.photos || 0,
          inspections: d.inspections || 0,
          ucSubmitted: Boolean(d.ucSubmitted),
          assetCreated: Boolean(d.assetCreated),
          workOrderNo: d.workOrderNo || "",
          agreementDate: d.agreementDate,
          payments: d.payments || [],
        }));
      }
    }
  } catch (err) {
    console.error("Error fetching projects from DB:", err);
  }
  return memoryProjectsStore;
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const conn = await dbConnect();
    if (conn) {
      const doc = await ProjectModel.findOne({ id }).lean<IProjectDocument>();
      if (doc) {
        return {
          id: doc.id,
          name: doc.name,
          category: doc.category,
          subCategory: doc.subCategory || "",
          state: doc.state,
          district: doc.district,
          constituency: doc.constituency || "",
          mpName: doc.mpName || "",
          mpId: doc.mpId || "",
          sanctionedAmount: doc.sanctionedAmount || 0,
          releasedAmount: doc.releasedAmount || 0,
          expenditure: doc.expenditure || 0,
          status: doc.status,
          sanctionDate: doc.sanctionDate || "",
          completionDate: doc.completionDate,
          expectedCompletion: doc.expectedCompletion || "",
          progress: doc.progress || 0,
          riskScore: doc.riskScore || 0,
          riskLevel: doc.riskLevel || "Low",
          riskFlags: doc.riskFlags || [],
          contractor: doc.contractor || "",
          geoLat: doc.geoLat || 0,
          geoLng: doc.geoLng || 0,
          photos: doc.photos || 0,
          inspections: doc.inspections || 0,
          ucSubmitted: Boolean(doc.ucSubmitted),
          assetCreated: Boolean(doc.assetCreated),
          workOrderNo: doc.workOrderNo || "",
          agreementDate: doc.agreementDate,
          payments: doc.payments || [],
        };
      }
    }
  } catch (err) {
    console.error("Error fetching project by id from DB:", err);
  }
  return memoryProjectsStore.find((p) => p.id === id) || null;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  // Update memory store as fallback
  memoryProjectsStore = memoryProjectsStore.map((p) => (p.id === id ? { ...p, ...updates } : p));

  try {
    const conn = await dbConnect();
    if (conn) {
      const updated = await ProjectModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean<IProjectDocument>();
      if (updated) {
        return {
          id: updated.id,
          name: updated.name,
          category: updated.category,
          subCategory: updated.subCategory || "",
          state: updated.state,
          district: updated.district,
          constituency: updated.constituency || "",
          mpName: updated.mpName || "",
          mpId: updated.mpId || "",
          sanctionedAmount: updated.sanctionedAmount || 0,
          releasedAmount: updated.releasedAmount || 0,
          expenditure: updated.expenditure || 0,
          status: updated.status,
          sanctionDate: updated.sanctionDate || "",
          completionDate: updated.completionDate,
          expectedCompletion: updated.expectedCompletion || "",
          progress: updated.progress || 0,
          riskScore: updated.riskScore || 0,
          riskLevel: updated.riskLevel || "Low",
          riskFlags: updated.riskFlags || [],
          contractor: updated.contractor || "",
          geoLat: updated.geoLat || 0,
          geoLng: updated.geoLng || 0,
          photos: updated.photos || 0,
          inspections: updated.inspections || 0,
          ucSubmitted: Boolean(updated.ucSubmitted),
          assetCreated: Boolean(updated.assetCreated),
          workOrderNo: updated.workOrderNo || "",
          agreementDate: updated.agreementDate,
          payments: updated.payments || [],
        };
      }
    }
  } catch (err) {
    console.error("Error updating project in DB:", err);
  }
  return memoryProjectsStore.find((p) => p.id === id) || null;
}

export async function createProject(project: Project): Promise<Project> {
  memoryProjectsStore.unshift(project);
  try {
    const conn = await dbConnect();
    if (conn) {
      await ProjectModel.create(project);
    }
  } catch (err) {
    console.error("Error creating project in DB:", err);
  }
  return project;
}
