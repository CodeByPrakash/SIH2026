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
  page?: number;
  search?: string;
  forceRefresh?: boolean;
  lightweight?: boolean;
  userRole?: string;
  userDistrict?: string;
  userState?: string;
  userConstituency?: string;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedProjectsResult {
  projects: Project[];
  pagination: PaginationMetadata;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    createdAt: (d as any).createdAt,
    updatedAt: (d as any).updatedAt,
  };
}

let lastQueryFromCache = false;

export function isLastQueryFromCache(): boolean {
  return lastQueryFromCache;
}

export async function getPaginatedProjects(
  filters?: ProjectFilterOptions
): Promise<PaginatedProjectsResult> {
  const page = Math.max(1, filters?.page || 1);
  const limit = Math.max(1, Math.min(filters?.limit && filters.limit > 100 ? 1000 : 100, filters?.limit || 10));
  const skip = (page - 1) * limit;

  // Strict Role-Based Area Enforcement
  const isDistrictRole = filters?.userRole === "District";
  const isStateRole = filters?.userRole === "State";
  const isMPRole = filters?.userRole === "MP";

  const effectiveDistrict = isDistrictRole && filters?.userDistrict
    ? filters.userDistrict.trim()
    : filters?.district?.trim();

  const effectiveState = isStateRole && filters?.userState
    ? filters.userState.trim()
    : (isDistrictRole && filters?.userState ? filters.userState.trim() : filters?.state?.trim());

  const effectiveConstituency = isMPRole && filters?.userConstituency
    ? filters.userConstituency.trim()
    : filters?.constituency?.trim();

  try {
    const conn = await dbConnect();
    if (conn) {
      const query: Record<string, any> = {};
      if (effectiveDistrict) {
        query.district = { $regex: new RegExp(`^${escapeRegex(effectiveDistrict)}$`, "i") };
      }
      if (effectiveState) {
        query.state = { $regex: new RegExp(`^${escapeRegex(effectiveState)}$`, "i") };
      }
      if (effectiveConstituency) {
        query.constituency = { $regex: new RegExp(`^${escapeRegex(effectiveConstituency)}$`, "i") };
      }
      if (filters?.status) {
        query.status = filters.status;
      }
      if (filters?.riskLevel) {
        query.riskLevel = filters.riskLevel;
      }
      if (filters?.search && filters.search.trim()) {
        const s = escapeRegex(filters.search.trim());
        const searchRegex = new RegExp(s, "i");
        query.$or = [
          { id: searchRegex },
          { name: searchRegex },
          { district: searchRegex },
          { state: searchRegex },
          { constituency: searchRegex },
          { category: searchRegex },
        ];
      }

      const total = await ProjectModel.countDocuments(query);
      const totalPages = Math.max(1, Math.ceil(total / limit));

      let queryBuilder = ProjectModel.find(query)
        .sort({ updatedAt: -1, createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit);

      if (filters?.lightweight) {
        queryBuilder = queryBuilder.select(
          "id name category subCategory state district constituency status progress riskLevel riskScore updatedAt createdAt"
        );
      }

      const docs = await queryBuilder.lean<IProjectDocument[]>();

      if (docs) {
        const mapped = docs.map(mapDocumentToProject);
        for (const p of mapped) {
          if (!idIndex.has(p.id)) {
            idIndex.set(p.id, p);
          }
        }
        return {
          projects: mapped,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      }
    }
  } catch (err) {
    console.error("Error fetching paginated projects from DB:", err);
  }

  // Fallback to memory store
  let fallbackList = [...memoryProjectsStore];
  if (effectiveDistrict) {
    fallbackList = fallbackList.filter(
      (p) => p.district.toLowerCase() === effectiveDistrict.toLowerCase()
    );
  }
  if (effectiveState) {
    fallbackList = fallbackList.filter(
      (p) => p.state.toLowerCase() === effectiveState.toLowerCase()
    );
  }
  if (effectiveConstituency) {
    fallbackList = fallbackList.filter(
      (p) =>
        (p.constituency && p.constituency.toLowerCase() === effectiveConstituency.toLowerCase()) ||
        p.district.toLowerCase() === effectiveConstituency.toLowerCase()
    );
  }
  if (filters?.status) {
    fallbackList = fallbackList.filter((p) => p.status === filters.status);
  }
  if (filters?.riskLevel) {
    fallbackList = fallbackList.filter((p) => p.riskLevel === filters.riskLevel);
  }
  if (filters?.search && filters.search.trim()) {
    const term = filters.search.trim().toLowerCase();
    fallbackList = fallbackList.filter(
      (p) =>
        p.id.toLowerCase().includes(term) ||
        p.name.toLowerCase().includes(term) ||
        p.district.toLowerCase().includes(term) ||
        p.state.toLowerCase().includes(term) ||
        p.constituency.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    );
  }

  const total = fallbackList.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pagedList = fallbackList.slice(skip, skip + limit);

  return {
    projects: pagedList,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getAllProjects(filters?: ProjectFilterOptions): Promise<Project[]> {
  const force = Boolean(filters?.forceRefresh);
  const isDistrictRole = filters?.userRole === "District";
  const isStateRole = filters?.userRole === "State";
  const isMPRole = filters?.userRole === "MP";

  const effectiveDistrict = isDistrictRole && filters?.userDistrict
    ? filters.userDistrict.trim()
    : filters?.district?.trim();

  const effectiveState = isStateRole && filters?.userState
    ? filters.userState.trim()
    : (isDistrictRole && filters?.userState ? filters.userState.trim() : filters?.state?.trim());

  const effectiveConstituency = isMPRole && filters?.userConstituency
    ? filters.userConstituency.trim()
    : filters?.constituency?.trim();

  const cacheKey = [
    effectiveDistrict?.toLowerCase() || "",
    effectiveState?.toLowerCase() || "",
    effectiveConstituency?.toLowerCase() || "",
    filters?.status || "",
    filters?.riskLevel || "",
    filters?.limit || "",
    filters?.page || "",
    filters?.search || "",
    filters?.userRole || "",
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

  if (filters?.page !== undefined || filters?.search !== undefined) {
    const paginated = await getPaginatedProjects(filters);
    return paginated.projects;
  }

  try {
    const conn = await dbConnect();
    if (conn) {
      const query: Record<string, any> = {};
      if (effectiveDistrict) {
        query.district = { $regex: new RegExp(`^${escapeRegex(effectiveDistrict)}$`, "i") };
      }
      if (effectiveState) {
        query.state = { $regex: new RegExp(`^${escapeRegex(effectiveState)}$`, "i") };
      }
      if (effectiveConstituency) {
        query.constituency = { $regex: new RegExp(`^${escapeRegex(effectiveConstituency)}$`, "i") };
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
  if (effectiveDistrict) {
    fallbackList = fallbackList.filter(
      (p) => p.district.toLowerCase() === effectiveDistrict.toLowerCase()
    );
  }
  if (effectiveState) {
    fallbackList = fallbackList.filter(
      (p) => p.state.toLowerCase() === effectiveState.toLowerCase()
    );
  }
  if (effectiveConstituency) {
    fallbackList = fallbackList.filter(
      (p) =>
        (p.constituency && p.constituency.toLowerCase() === effectiveConstituency.toLowerCase()) ||
        p.district.toLowerCase() === effectiveConstituency.toLowerCase()
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
