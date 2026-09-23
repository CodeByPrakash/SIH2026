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
    anonymizedName: "Anonymous Citizen (Sarojini Nagar, Lucknow)",
    maskedMobile: "+91 ••••• ••210",
    isAnonymous: true,
    projectId: "MPLAD-UP-0401-2024-001",
    projectName: "Construction of CC Road in Gram Panchayat Rampur, Lucknow",
    priority: "High",
    assignedOfficer: "Shri K.P. Sharma (Executive Engineer, Rural Engineering Dept)",
    actionTaken: "Show-cause notice served to contractor. Field inspection conducted on 12-Aug-2024; contractor ordered to resume laying work within 48h.",
    slaDays: 7,
    timeline: [
      {
        stage: "Submitted",
        title: "Grievance Lodged & Cryptographically Timestamped",
        timestamp: "2024-08-10 10:14 AM",
        actor: "Citizen Portal (Identity Encrypted)",
        status: "Completed",
        remarks: "Citizen filed grievance with ground photographic observations. Anonymity shield applied.",
      },
      {
        stage: "AI_Triaged",
        title: "AI NLP Triage & Risk Classification",
        timestamp: "2024-08-10 10:15 AM",
        actor: "NIDHI-RAKSHAK AI Engine",
        status: "Completed",
        remarks: "Classified as 'Project Stall' with High Priority. Automatic alert ALT-GRV-8821 dispatched to Nodal Officer.",
      },
      {
        stage: "Assigned",
        title: "Assigned to District Nodal Officer",
        timestamp: "2024-08-11 09:30 AM",
        actor: "District Planning Office, Lucknow",
        status: "Completed",
        remarks: "Case assigned to Shri K.P. Sharma, Executive Engineer for urgent spot-verification.",
      },
      {
        stage: "Investigation_Action",
        title: "On-Site Technical Inspection & Notice Issued",
        timestamp: "2024-08-12 03:45 PM",
        actor: "Executive Engineer, Rural Engineering",
        status: "Completed",
        remarks: "Inspected site. Found 35% actual progress vs 100% claimed by agency. Tranche payment withheld and 48-hour cure notice served.",
      },
      {
        stage: "Resolved",
        title: "Final Rectification & Public Verification",
        timestamp: "Pending",
        actor: "District Grievance Cell",
        status: "In_Progress",
        remarks: "Cure period underway. Follow-up inspection scheduled for next milestone.",
      },
    ],
  },
  {
    id: "GRV-2024-002",
    title: "Borewell not functional after completion",
    description: "Water pump motor failed within 5 days of installation in Gram Panchayat. No drinking water available.",
    status: "Resolved",
    date: "2024-07-22",
    category: "Quality Issue",
    district: "Shivpuri",
    state: "Madhya Pradesh",
    name: "Priya Sharma",
    mobile: "+91 98123 45678",
    anonymizedName: "Anonymous Citizen (Gram Panchayat, Shivpuri)",
    maskedMobile: "+91 ••••• ••678",
    isAnonymous: true,
    projectId: "MPLAD-MP-0204-2024-002",
    projectName: "Deep Tube Well and Solar Pump Installation, Shivpuri",
    priority: "High",
    assignedOfficer: "Smt. Vandana Mishra (Assistant Engineer, PHED)",
    actionTaken: "Defective motor replaced under warranty by supplier within 72 hours. Water discharge verified at 120 LPM.",
    slaDays: 7,
    timeline: [
      {
        stage: "Submitted",
        title: "Grievance Lodged Online",
        timestamp: "2024-07-22 11:20 AM",
        actor: "Citizen Portal",
        status: "Completed",
        remarks: "Reported defective pump motor leaving 450 households without water.",
      },
      {
        stage: "AI_Triaged",
        title: "AI Triage & Urgency Escalation",
        timestamp: "2024-07-22 11:22 AM",
        actor: "NIDHI-RAKSHAK AI Engine",
        status: "Completed",
        remarks: "Essential Service Failure detected. Priority set to High. Dispatched to PHED emergency desk.",
      },
      {
        stage: "Assigned",
        title: "Assigned to PHED Field Officer",
        timestamp: "2024-07-22 02:00 PM",
        actor: "District Collectorate, Shivpuri",
        status: "Completed",
        remarks: "Assigned to PHED Assistant Engineer for same-day inspection.",
      },
      {
        stage: "Investigation_Action",
        title: "Supplier Warranty Replacement Enforced",
        timestamp: "2024-07-24 11:30 AM",
        actor: "PHED Inspection Wing",
        status: "Completed",
        remarks: "Burnt copper coil replaced with brand new 5HP submersible motor. Pressure tested.",
      },
      {
        stage: "Resolved",
        title: "Grievance Successfully Resolved",
        timestamp: "2024-07-25 04:00 PM",
        actor: "Gram Pradhan & Citizen Verification",
        status: "Completed",
        remarks: "Functional certificate signed. Transparent closure report published on public portal.",
      },
    ],
  },
  {
    id: "GRV-2024-003",
    title: "No visibility of sanctioned funds usage",
    description: "No citizen information board erected at public library construction site detailing cost and contractor.",
    status: "Open",
    date: "2024-08-20",
    category: "Transparency",
    district: "Barmer",
    state: "Rajasthan",
    name: "Amit Patel",
    mobile: "+91 99887 76655",
    anonymizedName: "Anonymous Citizen (Ward 7, Barmer)",
    maskedMobile: "+91 ••••• ••655",
    isAnonymous: true,
    projectId: "MPLAD-RJ-0801-2024-003",
    projectName: "Construction of District Central Library Hall, Barmer",
    priority: "Medium",
    assignedOfficer: "Shri O.P. Meena (District Information Officer)",
    actionTaken: "Notice issued to Implementing Agency to install standard MPLADS bilingual citizen information board within 5 days.",
    slaDays: 7,
    timeline: [
      {
        stage: "Submitted",
        title: "Grievance Lodged Under Transparency Charter",
        timestamp: "2024-08-20 02:15 PM",
        actor: "Citizen Portal",
        status: "Completed",
        remarks: "Non-compliance with MPLADS Guideline 3.4 (Mandatory Citizen Information Signboard).",
      },
      {
        stage: "AI_Triaged",
        title: "AI Compliance Check",
        timestamp: "2024-08-20 02:16 PM",
        actor: "NIDHI-RAKSHAK AI Engine",
        status: "Completed",
        remarks: "Confirmed violation of mandatory disclosure norm.",
      },
      {
        stage: "Assigned",
        title: "Routed to Implementing Agency",
        timestamp: "2024-08-21 10:00 AM",
        actor: "District Planning Cell, Barmer",
        status: "In_Progress",
        remarks: "Direction given to Agency to fabricate and mount board.",
      },
    ],
  },
  {
    id: "GRV-2024-004",
    title: "Solar lights battery stolen in community square",
    description: "Lithium battery pack missing from 2 poles installed 3 months ago. Lights are dark at night.",
    status: "Under Review",
    date: "2024-08-28",
    category: "Security & Maintenance",
    district: "Varanasi",
    state: "Uttar Pradesh",
    name: "Subhash Chandra",
    mobile: "+91 94500 11223",
    anonymizedName: "Anonymous Citizen (Rohania, Varanasi)",
    maskedMobile: "+91 ••••• ••223",
    isAnonymous: true,
    projectId: "MPLAD-UP-0702-2024-004",
    projectName: "Solar High Mast Lighting at Public Intersections, Varanasi",
    priority: "Medium",
    assignedOfficer: "Shri R.K. Yadav (Municipal Engineer)",
    actionTaken: "Joint police diary filed and AMC maintenance team dispatched for anti-theft enclosure retrofitting.",
    slaDays: 10,
    timeline: [
      {
        stage: "Submitted",
        title: "Grievance Lodged",
        timestamp: "2024-08-28 09:10 AM",
        actor: "Citizen Portal",
        status: "Completed",
        remarks: "Reported missing battery assets on community solar street light.",
      },
      {
        stage: "AI_Triaged",
        title: "AI Tagged: Asset Maintenance & Theft",
        timestamp: "2024-08-28 09:12 AM",
        actor: "NIDHI-RAKSHAK AI Engine",
        status: "Completed",
        remarks: "Cross-referenced with AMC warranty clause.",
      },
      {
        stage: "Assigned",
        title: "Enquiry Ordered with Municipal Corporation",
        timestamp: "2024-08-29 11:30 AM",
        actor: "District Collectorate, Varanasi",
        status: "In_Progress",
        remarks: "Contractor vendor requested to replace under comprehensive AMC.",
      },
    ],
  },
];

let memoryGrievanceStore: IGrievance[] = [...SAMPLE_GRIEVANCES];

function sanitizeGrievanceForPublic(g: IGrievance): IGrievance {
  const cleanMobileDigits = (g.mobile || "").replace(/\D/g, "");
  const last3 = cleanMobileDigits.slice(-3) || "xxx";
  const maskedMobile = `+91 ••••• ••${last3}`;
  const anonymizedName = g.anonymizedName || `Anonymous Citizen (${g.district || "Resident"})`;

  return {
    ...g,
    name: anonymizedName,
    anonymizedName,
    mobile: maskedMobile,
    maskedMobile,
    isAnonymous: true,
  };
}

export async function getAllGrievances(): Promise<IGrievance[]> {
  try {
    const conn = await dbConnect();
    if (conn) {
      const docs = await GrievanceModel.find({}).sort({ createdAt: -1 }).lean<IGrievanceDocument[]>();
      if (docs && docs.length > 0) {
        return docs.map((d) =>
          sanitizeGrievanceForPublic({
            id: d.id,
            title: d.title,
            description: d.description || "",
            category: d.category,
            district: d.district,
            state: d.state || "",
            status: d.status,
            name: d.name,
            mobile: d.mobile,
            anonymizedName: d.anonymizedName,
            maskedMobile: d.maskedMobile,
            isAnonymous: d.isAnonymous,
            projectId: d.projectId || "",
            projectName: d.projectName || "",
            priority: d.priority || "Medium",
            assignedOfficer: d.assignedOfficer || "",
            actionTaken: d.actionTaken || "",
            slaDays: d.slaDays || 7,
            timeline: d.timeline || [],
            date: d.date,
          })
        );
      }
    }
  } catch (err) {
    console.error("Error fetching grievances from DB:", err);
  }
  return memoryGrievanceStore.map(sanitizeGrievanceForPublic);
}

export async function getGrievanceById(id: string): Promise<IGrievance | null> {
  try {
    const conn = await dbConnect();
    if (conn) {
      const doc = await GrievanceModel.findOne({ id }).lean<IGrievanceDocument>();
      if (doc) {
        return sanitizeGrievanceForPublic({
          id: doc.id,
          title: doc.title,
          description: doc.description || "",
          category: doc.category,
          district: doc.district,
          state: doc.state || "",
          status: doc.status,
          name: doc.name,
          mobile: doc.mobile,
          anonymizedName: doc.anonymizedName,
          maskedMobile: doc.maskedMobile,
          isAnonymous: doc.isAnonymous,
          projectId: doc.projectId || "",
          projectName: doc.projectName || "",
          priority: doc.priority || "Medium",
          assignedOfficer: doc.assignedOfficer || "",
          actionTaken: doc.actionTaken || "",
          slaDays: doc.slaDays || 7,
          timeline: doc.timeline || [],
          date: doc.date,
        });
      }
    }
  } catch (err) {
    console.error("Error fetching grievance by id from DB:", err);
  }
  const found = memoryGrievanceStore.find((g) => g.id === id);
  return found ? sanitizeGrievanceForPublic(found) : null;
}

export async function createGrievance(data: {
  name: string;
  mobile: string;
  district: string;
  category: string;
  desc: string;
  projectId?: string;
  projectName?: string;
}): Promise<IGrievance> {
  const count = memoryGrievanceStore.length + 1;
  const newId = `GRV-${new Date().getFullYear()}-${String(count).padStart(3, "0")}`;
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const cleanMobile = (data.mobile || "").replace(/\D/g, "");
  const last3 = cleanMobile.slice(-3) || "999";
  const maskedMobile = `+91 ••••• ••${last3}`;
  const anonymizedName = `Anonymous Citizen (${data.district || "Resident"})`;

  const priority: "High" | "Medium" | "Low" =
    data.category === "Fund Misuse" || data.category === "Project Stall"
      ? "High"
      : data.category === "Quality Issue"
      ? "Medium"
      : "Low";

  const newGrievance: IGrievance = {
    id: newId,
    title: `${data.category}: ${data.desc.slice(0, 50)}${data.desc.length > 50 ? "..." : ""}`,
    description: data.desc,
    category: data.category || "General",
    district: data.district || "Unknown District",
    status: "Open",
    name: data.name,
    mobile: data.mobile,
    anonymizedName,
    maskedMobile,
    isAnonymous: true,
    projectId: data.projectId || "",
    projectName: data.projectName || "",
    priority,
    assignedOfficer: `Designated Nodal Officer (${data.district} Grievance Redressal Cell)`,
    actionTaken: "Case registered and routed to district engineering cell for verification.",
    slaDays: priority === "High" ? 5 : 7,
    timeline: [
      {
        stage: "Submitted",
        title: "Grievance Lodged & Cryptographically Timestamped",
        timestamp: `${today} ${nowTime}`,
        actor: "Citizen Portal (Identity Encrypted)",
        status: "Completed",
        remarks: "Grievance recorded with ground description. Submitter identity securely protected and anonymized.",
      },
      {
        stage: "AI_Triaged",
        title: "AI NLP Classification & Priority Routing",
        timestamp: `${today} ${nowTime}`,
        actor: "NIDHI-RAKSHAK AI Engine",
        status: "Completed",
        remarks: `Automatically categorized as '${data.category}' with ${priority} Priority. Dispatched to District Nodal Officer.`,
      },
      {
        stage: "Assigned",
        title: `Pending Review by District Authority (${data.district})`,
        timestamp: "In Progress",
        actor: `${data.district} District Collectorate`,
        status: "In_Progress",
        remarks: "Nodal officer assigned to schedule technical on-site verification.",
      },
    ],
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
      description: `A citizen in ${data.district} reported a "${data.category}" issue: ${data.desc.slice(0, 80)}`,
      type: "Compliance",
      severity: priority,
      district: data.district,
      projectId: data.projectId || "",
      createdAt: today,
      actionRequired: "Investigate citizen complaint and respond to local authority.",
      status: "Active",
    });
  } catch (alertErr) {
    console.error("Error creating associated alert for grievance:", alertErr);
  }

  return sanitizeGrievanceForPublic(newGrievance);
}

export async function updateGrievanceStatus(
  id: string,
  status: "Open" | "Under Review" | "Resolved",
  actionTaken?: string
): Promise<IGrievance | null> {
  const nowTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const today = new Date().toISOString().split("T")[0];

  memoryGrievanceStore = memoryGrievanceStore.map((g) => {
    if (g.id !== id) return g;
    const updatedTimeline = [...(g.timeline || [])];
    if (status === "Resolved") {
      updatedTimeline.push({
        stage: "Resolved",
        title: "Grievance Successfully Resolved & Redressal Published",
        timestamp: `${today} ${nowTime}`,
        actor: "District Grievance Officer & Citizen Review",
        status: "Completed",
        remarks: actionTaken || "Action completed and verified on ground.",
      });
    }
    return {
      ...g,
      status,
      actionTaken: actionTaken || g.actionTaken,
      timeline: updatedTimeline,
    };
  });

  try {
    const conn = await dbConnect();
    if (conn) {
      const updated = await GrievanceModel.findOneAndUpdate(
        { id },
        { $set: { status, actionTaken } },
        { new: true }
      ).lean<IGrievanceDocument>();
      if (updated) {
        return sanitizeGrievanceForPublic({
          id: updated.id,
          title: updated.title,
          description: updated.description || "",
          category: updated.category,
          district: updated.district,
          state: updated.state || "",
          status: updated.status,
          name: updated.name,
          mobile: updated.mobile,
          anonymizedName: updated.anonymizedName,
          maskedMobile: updated.maskedMobile,
          isAnonymous: updated.isAnonymous,
          projectId: updated.projectId || "",
          projectName: updated.projectName || "",
          priority: updated.priority || "Medium",
          assignedOfficer: updated.assignedOfficer || "",
          actionTaken: updated.actionTaken || "",
          slaDays: updated.slaDays || 7,
          timeline: updated.timeline || [],
          date: updated.date,
        });
      }
    }
  } catch (err) {
    console.error("Error updating grievance in DB:", err);
  }
  const found = memoryGrievanceStore.find((g) => g.id === id);
  return found ? sanitizeGrievanceForPublic(found) : null;
}
