"use client";

import { useState, useEffect, useCallback } from "react";

import type { IGrievanceTimelineEvent } from "@/models/Grievance";

export interface GrievanceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  district: string;
  state?: string;
  status: "Open" | "Under Review" | "Resolved";
  name: string;
  mobile: string;
  anonymizedName?: string;
  maskedMobile?: string;
  isAnonymous?: boolean;
  projectId?: string;
  projectName?: string;
  priority?: "High" | "Medium" | "Low";
  assignedOfficer?: string;
  actionTaken?: string;
  slaDays?: number;
  timeline?: IGrievanceTimelineEvent[];
  date: string;
}

const FALLBACK_GRIEVANCES: GrievanceItem[] = [
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

export function useGrievances() {
  const [grievances, setGrievances] = useState<GrievanceItem[]>(FALLBACK_GRIEVANCES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchGrievances = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch("/api/grievances");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setGrievances(json.data);
          setIsLive(true);
          setLastUpdated(new Date());
        }
      }
    } catch (err) {
      console.warn("useGrievances polling failed, keeping current data:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrievances();
    const interval = setInterval(() => {
      fetchGrievances(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchGrievances]);

  const submitGrievance = async (form: {
    name: string;
    mobile: string;
    district: string;
    category: string;
    desc: string;
    projectId?: string;
  }) => {
    try {
      const res = await fetch("/api/grievances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setGrievances((prev) => [json.data, ...prev]);
          setLastUpdated(new Date());
          return json.data as GrievanceItem;
        }
      }
    } catch (err) {
      console.error("Failed to submit grievance:", err);
    }
    return null;
  };

  return {
    grievances,
    isLoading,
    isLive,
    lastUpdated,
    refresh: () => fetchGrievances(false),
    submitGrievance,
  };
}
