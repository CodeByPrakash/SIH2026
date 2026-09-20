import { dbConnect } from "@/lib/mongodb";
import { AlertModel, IAlertDocument } from "@/models/Alert";
import { ALERTS as MOCK_ALERTS } from "@/data/mpladsData";
import type { Alert } from "@/types";

let memoryAlertsStore: Alert[] = [...MOCK_ALERTS];

export async function getAllAlerts(): Promise<Alert[]> {
  try {
    const conn = await dbConnect();
    if (conn) {
      const docs = await AlertModel.find({}).sort({ createdAt: -1 }).lean<IAlertDocument[]>();
      if (docs && docs.length > 0) {
        return docs.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          type: d.type,
          severity: d.severity,
          projectId: d.projectId || "",
          state: d.state || "",
          district: d.district || "",
          createdAt: d.createdAt,
          daysRemaining: d.daysRemaining,
          actionRequired: d.actionRequired || "",
          status: d.status,
        }));
      }
    }
  } catch (err) {
    console.error("Error fetching alerts from DB:", err);
  }
  return memoryAlertsStore;
}

export async function createAlert(alert: Alert): Promise<Alert> {
  memoryAlertsStore.unshift(alert);
  try {
    const conn = await dbConnect();
    if (conn) {
      await AlertModel.create(alert);
    }
  } catch (err) {
    console.error("Error creating alert in DB:", err);
  }
  return alert;
}

export async function updateAlertStatus(id: string, status: "Active" | "Acknowledged" | "Resolved"): Promise<Alert | null> {
  memoryAlertsStore = memoryAlertsStore.map((a) => (a.id === id ? { ...a, status } : a));

  try {
    const conn = await dbConnect();
    if (conn) {
      const updated = await AlertModel.findOneAndUpdate({ id }, { $set: { status } }, { new: true }).lean<IAlertDocument>();
      if (updated) {
        return {
          id: updated.id,
          title: updated.title,
          description: updated.description,
          type: updated.type,
          severity: updated.severity,
          projectId: updated.projectId || "",
          state: updated.state || "",
          district: updated.district || "",
          createdAt: updated.createdAt,
          daysRemaining: updated.daysRemaining,
          actionRequired: updated.actionRequired || "",
          status: updated.status,
        };
      }
    }
  } catch (err) {
    console.error("Error updating alert status in DB:", err);
  }
  return memoryAlertsStore.find((a) => a.id === id) || null;
}
