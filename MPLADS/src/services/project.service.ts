import { dbConnect } from "@/lib/mongodb";
import { ProjectModel, IProjectDocument } from "@/models/Project";
import { PROJECTS as MOCK_PROJECTS } from "@/data/mpladsData";
import type { Project } from "@/types";

// Multi-Tier Server In-Memory Cache Stores
let memoryProjectsStore: Project[] = [...MOCK_PROJECTS];
const idIndex = new Map<string, Project>();
const queryCache = new Map<string, { data: Project[]; expiresAt: number }>();
const CACHE_TTL_MS = 45 * 1000; // 45 seconds cache TTL

// Initialize ID index with mock data
for (const p of MOCK_PROJECTS) {
  idIndex.set(p.id, p);
}

export interface ProjectFilterOptions {
  district?: string;
  state?: string;
  constituency?: string;
  status?: string;
  riskLevel?: string;
  limit?: number;
  forceRefresh?: boolean;
}

function mapDocumentToProject(d: IProjectDocument): Project {
  return {
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
  };
}

let lastQueryFromCache = false;

export function isLastQueryFromCache(): boolean {
  return lastQueryFromCache;
}

export async function getAllProjects(filters?: ProjectFilterOptions): Promise<Project[]> {
  const force = Boolean(filters?.forceRefresh);
  const cacheKey = [
    filters?.district?.trim().toLowerCase() || "",
    filters?.state?.trim().toLowerCase() || "",
    filters?.constituency?.trim().toLowerCase() || "",
    filters?.status || "",
    filters?.riskLevel || "",
    filters?.limit || "",
  ].join("|");

  // Check In-Memory Query Cache
  if (!force && queryCache.has(cacheKey)) {
    const entry = queryCache.get(cacheKey)!;
    if (Date.now() < entry.expiresAt) {
      lastQueryFromCache = true;
      return entry.data;
    }
  }

  lastQueryFromCache = false;

  try {
    const conn = await dbConnect();
    if (conn) {
      const query: Record<string, any> = {};
      if (filters?.district) {
        query.district = { $regex: new RegExp(`^${filters.district.trim()}$`, "i") };
      }
      if (filters?.state) {
        query.state = { $regex: new RegExp(`^${filters.state.trim()}$`, "i") };
      }
      if (filters?.constituency) {
        query.constituency = { $regex: new RegExp(`^${filters.constituency.trim()}$`, "i") };
      }
      if (filters?.status) {
        query.status = filters.status;
      }
      if (filters?.riskLevel) {
        query.riskLevel = filters.riskLevel;
      }

      const limit = filters?.limit ?? (Object.keys(query).length > 0 ? 500 : 3000);
      const docs = await ProjectModel.find(query).limit(limit).lean<IProjectDocument[]>();

      if (docs && docs.length > 0) {
        const mapped = docs.map(mapDocumentToProject);

        // Store into in-memory caches
        for (const p of mapped) {
          idIndex.set(p.id, p);
        }

        // Cache the result
        queryCache.set(cacheKey, {
          data: mapped,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });

        // If this was an unconstrained query, update general memory store
        if (Object.keys(query).length === 0) {
          memoryProjectsStore = mapped;
        }

        lastQueryFromCache = false;
        return mapped;
      }
    }
  } catch (err) {
    console.error("Error fetching projects from DB:", err);
  }

  // Fallback to memory store
  let fallbackList = memoryProjectsStore;
  if (filters?.district) {
    fallbackList = fallbackList.filter(
      (p) => p.district.toLowerCase() === filters.district!.trim().toLowerCase()
    );
  }
  if (filters?.state) {
    fallbackList = fallbackList.filter(
      (p) => p.state.toLowerCase() === filters.state!.trim().toLowerCase()
    );
  }
  if (filters?.status) {
    fallbackList = fallbackList.filter((p) => p.status === filters.status);
  }
  if (filters?.riskLevel) {
    fallbackList = fallbackList.filter((p) => p.riskLevel === filters.riskLevel);
  }
  if (filters?.limit) {
    fallbackList = fallbackList.slice(0, filters.limit);
  }

  lastQueryFromCache = true;
  return fallbackList;
}

export async function getProjectById(
  id: string,
  options?: { forceRefresh?: boolean }
): Promise<Project | null> {
  if (!id) return null;

  // 1. Instant O(1) Cache Lookup
  if (!options?.forceRefresh && idIndex.has(id)) {
    return idIndex.get(id)!;
  }

  // 2. Database Lookup
  try {
    const conn = await dbConnect();
    if (conn) {
      const doc = await ProjectModel.findOne({ id }).lean<IProjectDocument>();
      if (doc) {
        const project = mapDocumentToProject(doc);
        idIndex.set(project.id, project);
        return project;
      }
    }
  } catch (err) {
    console.error("Error fetching project by id from DB:", err);
  }

  // 3. Fallback Memory Store Lookup
  const fallback = memoryProjectsStore.find((p) => p.id === id) || null;
  if (fallback) {
    idIndex.set(fallback.id, fallback);
  }
  return fallback;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  // Update memory store and ID index immediately
  const existing = idIndex.get(id) || memoryProjectsStore.find((p) => p.id === id);
  if (existing) {
    const merged = { ...existing, ...updates };
    idIndex.set(id, merged);
    memoryProjectsStore = memoryProjectsStore.map((p) => (p.id === id ? merged : p));
  }

  // Invalidate query caches on update
  queryCache.clear();

  try {
    const conn = await dbConnect();
    if (conn) {
      const updated = await ProjectModel.findOneAndUpdate(
        { id },
        { $set: updates },
        { new: true }
      ).lean<IProjectDocument>();

      if (updated) {
        const project = mapDocumentToProject(updated);
        idIndex.set(project.id, project);
        return project;
      }
    }
  } catch (err) {
    console.error("Error updating project in DB:", err);
  }

  return idIndex.get(id) || null;
}

export async function createProject(project: Project): Promise<Project> {
  memoryProjectsStore.unshift(project);
  idIndex.set(project.id, project);
  queryCache.clear();

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

export function clearProjectCache(): void {
  queryCache.clear();
  idIndex.clear();
  for (const p of MOCK_PROJECTS) {
    idIndex.set(p.id, p);
  }
}
