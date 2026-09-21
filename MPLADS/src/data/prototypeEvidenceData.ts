import type { ICitizenEvidence } from "@/types";

export const PROTOTYPE_SEED_EVIDENCE: ICitizenEvidence[] = [
  {
    evidenceId: "CE-2026-001",
    projectId: "MPLAD-UP-0401-2024-001",
    projectName: "Construction of CC Road in Gram Panchayat Rampur, Lucknow",
    submittedBy: "Anonymized Citizen #104",
    citizenContact: "Protected (Consent Verified)",
    evidenceType: "Photo",
    category: "Completion Discrepancy",
    description:
      "CC Road in Gram Panchayat Rampur remains unpaved with gravel heaps blocking traffic. Work halted 3 weeks ago despite completion sign.",
    location: "Gram Panchayat Rampur, Lucknow, UP",
    evidenceDate: "2026-09-18",
    photoUrl: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop",
    privacyStatus: "Protected",
    processingStatus: "Processed",
    aiStatus: "Cross-Checked",
    aiConfidence: 88,
    verificationCategory: "CONFLICT_DETECTED",
    observationSentiment: "NEGATIVE",
    officialRecordClaim:
      "Official Record — NIDHI-RAKSHAK Database: Project status is marked as 'Completed' with 100% physical progress. Sanctioned Amount: ₹48.5L, Expenditure: ₹51.2L. Contractor: M/s Shiv Construction Co.",
    citizenObservation:
      'Citizen Evidence (Photo) at Gram Panchayat Rampur, Lucknow, UP: "CC Road in Gram Panchayat Rampur remains unpaved with gravel heaps blocking traffic. Work halted 3 weeks ago despite completion sign."',
    fieldDiscrepancy:
      "Physical Completion Discrepancy: Record status is 'Completed' (100%), but citizen evidence indicates unfinished or halted construction.",
    explanation:
      "AI cross-check identified a significant discrepancy between the recorded completion status in the NIDHI-RAKSHAK database and the ground observation submitted by the citizen. Field inspection is necessary to verify asset creation.",
    recommendedAction:
      "Initiate physical audit by District Nodal Officer and request contractor status report.",
    additionalEvidenceRequired: [
      "Geotagged high-definition photograph of site",
      "Third-party technical inspection report",
      "Contractor completion certificate copy",
    ],
  },
  {
    evidenceId: "CE-2026-002",
    projectId: "MPLAD-UP-0401-2024-002",
    projectName: "Renovation of Primary Health Centre, Mohanlalganj",
    submittedBy: "Anonymized Citizen #209",
    citizenContact: "Protected (Consent Verified)",
    evidenceType: "Physical Observation",
    category: "Quality Defect",
    description:
      "Primary Health Centre building structural work complete, but water tank motor and medical equipment remain uninstalled.",
    location: "Mohanlalganj, Lucknow, UP",
    evidenceDate: "2026-09-15",
    photoUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop",
    privacyStatus: "Protected",
    processingStatus: "Processed",
    aiStatus: "Cross-Checked",
    aiConfidence: 78,
    verificationCategory: "POTENTIAL_CONFLICT",
    observationSentiment: "MIXED",
    officialRecordClaim:
      "Official Record — NIDHI-RAKSHAK Database: Project status is marked as 'In Progress' with 73% physical progress. Sanctioned Amount: ₹85.0L, Expenditure: ₹62.5L. Contractor: M/s Arogya Builders Pvt Ltd.",
    citizenObservation:
      'Citizen Evidence (Physical Observation) at Mohanlalganj, Lucknow, UP: "Primary Health Centre building structural work complete, but water tank motor and medical equipment remain uninstalled."',
    fieldDiscrepancy:
      "Quality/Process Discrepancy: Project is recorded as 'In Progress' (73%), but citizen evidence highlights operational or quality issues.",
    explanation:
      "AI cross-check detected a potential discrepancy regarding execution quality or timeline. While structural work may be underway, reported quality or operational defects warrant administrative review.",
    recommendedAction:
      "Notify implementing agency and schedule joint site inspection with local representative.",
    additionalEvidenceRequired: [
      "Updated site photographs with timestamp",
      "Material quality test report",
    ],
  },
  {
    evidenceId: "CE-2026-003",
    projectId: "MPLAD-MP-1202-2024-001",
    projectName: "Installation of High-Mast Solar Street Lights in Shivpuri",
    submittedBy: "Anonymized Citizen #312",
    citizenContact: "Protected (Consent Verified)",
    evidenceType: "Photo",
    category: "Completion Discrepancy",
    description:
      "Solar street light poles erected along village main junction as scheduled.",
    location: "Kolaras, Shivpuri, MP",
    evidenceDate: "2026-09-10",
    photoUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop",
    privacyStatus: "Protected",
    processingStatus: "Processed",
    aiStatus: "Cross-Checked",
    aiConfidence: 92,
    verificationCategory: "CONSISTENT",
    observationSentiment: "POSITIVE",
    officialRecordClaim:
      "Official Record — NIDHI-RAKSHAK Database: Project status is marked as 'In Progress' with 45% physical progress. Sanctioned Amount: ₹32.0L.",
    citizenObservation:
      'Citizen Evidence (Photo) at Kolaras, Shivpuri, MP: "Solar street light poles erected along village main junction as scheduled."',
    fieldDiscrepancy: "None detected. Citizen observation aligns with reported project milestones.",
    explanation:
      "AI cross-check confirms that the citizen observation matches the expected milestone and progress recorded in the official project database.",
    recommendedAction: "Record evidence as verified citizen confirmation in project dossier.",
    additionalEvidenceRequired: ["Routine milestone completion update"],
  },
  {
    evidenceId: "CE-2026-004",
    projectId: "MPLAD-RJ-0805-2024-001",
    projectName: "Construction of Community Water Tank, Barmer",
    submittedBy: "Anonymized Citizen #405",
    citizenContact: "Protected (Consent Verified)",
    evidenceType: "Photo",
    category: "Other",
    description: "Distant view of construction area taken from highway.",
    location: "Barmer, Rajasthan",
    evidenceDate: "2026-09-05",
    photoUrl: "",
    privacyStatus: "Protected",
    processingStatus: "Processed",
    aiStatus: "Cross-Checked",
    aiConfidence: 42,
    verificationCategory: "INSUFFICIENT_EVIDENCE",
    observationSentiment: "INSUFFICIENT_INFORMATION",
    officialRecordClaim:
      "Official Record — NIDHI-RAKSHAK Database: Project status is marked as 'In Progress' with 30% physical progress.",
    citizenObservation:
      'Citizen Evidence (Photo) at Barmer, Rajasthan: "Distant view of construction area taken from highway."',
    fieldDiscrepancy: "Low granularity of evidence input",
    explanation:
      "The submitted citizen evidence lacks sufficient resolution or geotagged parameters to perform a definitive cross-check against official records.",
    recommendedAction: "Request higher resolution photo and geotagged timestamp from submitter.",
    additionalEvidenceRequired: ["High-resolution site photograph", "Geotagged GPS coordinates"],
  },
];
