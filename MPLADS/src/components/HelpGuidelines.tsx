"use client";

import React, { useState } from "react";
import {
  IconBook,
  IconCircleCheck,
  IconCircleX,
  IconShieldCheck,
  IconHelp,
  IconDownload,
  IconSearch,
  IconChevronDown,
  IconChevronUp,
  IconArrowRight,
  IconBuildingCommunity,
  IconClock,
  IconScale,
  IconFileText,
  IconSparkles,
} from "@tabler/icons-react";

interface HelpGuidelinesProps {
  onNavigate?: (page: string) => void;
}

export default function HelpGuidelines({ onNavigate }: HelpGuidelinesProps) {
  const [activeTab, setActiveTab] = useState<"guidelines" | "works" | "charter" | "faqs">("guidelines");
  const [faqSearch, setFaqSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const permissibleWorks = [
    { title: "Drinking Water Infrastructure", desc: "Tube-wells, water purification plants, piped community supply, and water tanks in underserved areas." },
    { title: "Education & Child Development", desc: "Additional classrooms, laboratories, public libraries, smart school equipment, and drinking water facilities." },
    { title: "Public Health Infrastructure", desc: "Primary health centre infrastructure, ambulances, diagnostic equipment, and community medicine dispensing units." },
    { title: "Rural & Urban Connectivity", desc: "All-weather concrete/tar roads, footbridges, culverts, and street lighting installations." },
    { title: "Sanitation & Public Hygiene", desc: "Community public toilets, solid waste management units, drainage networks, and bio-toilets." },
    { title: "Disaster Relief & Mitigation", desc: "Cyclone shelters, flood mitigation walls, and emergency rehabilitation assets." },
  ];

  const nonPermissibleWorks = [
    { title: "Private Property / Commercial Work", desc: "Works benefiting private individuals, clubs, residential societies, or commercial enterprises." },
    { title: "Religious Places & Structures", desc: "Construction, renovation, or decoration of religious buildings or premises." },
    { title: "Office & Residential Buildings for Officers", desc: "Administrative government offices or staff quarters for central/state functionaries." },
    { title: "Movable Equipment without Fixed Asset", desc: "Personal laptops, tablets, or consumables not tied to institutional public use." },
    { title: "Works on Incomplete Previous Projects", desc: "Using new funds to service contractor debts or loans from older discontinued schemes." },
  ];

  const faqs = [
    {
      q: "What is the annual financial entitlement of each Member of Parliament under MPLADS?",
      a: "Each MP has an entitlement of ₹5 Crore per annum, released by MoSPI in two equal installments of ₹2.5 Crore directly to the Nodal District Authority upon fulfillment of utilization benchmarks.",
    },
    {
      q: "Can an MP recommend projects outside their constituency or State?",
      a: "Lok Sabha MPs can recommend works within their constituency. Nominated MPs can recommend anywhere in India. Rajya Sabha MPs can recommend works in one or more districts in the State from where they were elected.",
    },
    {
      q: "How can citizens inspect ongoing MPLADS public works in their area?",
      a: "All MPLADS works must install a citizen information board on-site with Work Order No, Sanctioned Amount, and Completion Date. Citizens can also use the NIDHI-RAKSHAK portal to view 3D digital twins and submit geo-tagged photographic evidence.",
    },
    {
      q: "What should I do if a public project appears stalled or shows poor construction quality?",
      a: "You can submit on-site photographs via the 'Submit Evidence' portal, or lodge an official grievance under 'Public Grievances'. A nodal inspection officer is required to respond within statutory timelines.",
    },
    {
      q: "What is the timeline for grievance redressal under the MPLADS Citizen Charter?",
      a: "Grievances must be acknowledged within 48 hours. District-level inquiry must complete within 7-14 working days, and resolution report uploaded with photographic proof.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 animate-slide-in">
      {/* ── Top Header ── */}
      <div className="bg-card border border-border/70 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              MPLADS Help & Guidelines
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Revised 2023 Guidelines
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Official guidelines, citizen charter rights, permissible works list, and public grievance resolution standards issued by the Ministry of Statistics & Programme Implementation (MoSPI).
          </p>
        </div>

        <a
          href="https://mplads.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors shrink-0"
        >
          <IconBook className="size-4 text-primary" /> Official MoSPI Portal
        </a>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex flex-wrap gap-2 border-b border-border/70 pb-3">
        {[
          { id: "guidelines", label: "Scheme Guidelines", icon: IconBook },
          { id: "works", label: "Permissible vs Ineligible Works", icon: IconShieldCheck },
          { id: "charter", label: "Citizen Charter & SLA", icon: IconScale },
          { id: "faqs", label: "Frequently Asked Questions", icon: IconHelp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab 1: Scheme Guidelines ── */}
      {activeTab === "guidelines" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border/70 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-semibold text-primary block uppercase tracking-wider">
                Objective
              </span>
              <h3 className="font-display text-base font-bold text-foreground mt-1">
                Durable Community Assets
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                MPLADS enables MPs to recommend developmental works of developmental nature with emphasis on the creation of durable community assets based on local needs.
              </p>
            </div>

            <div className="bg-card border border-border/70 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-semibold text-emerald-600 block uppercase tracking-wider">
                Annual Allocation
              </span>
              <h3 className="font-display text-base font-bold text-foreground mt-1">
                ₹5.00 Crore per MP
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Released directly to the Nodal District Authority in two equal tranches of ₹2.5 Crore after expenditure and Utilization Certificate (UC) verification.
              </p>
            </div>

            <div className="bg-card border border-border/70 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-semibold text-indigo-600 block uppercase tracking-wider">
                SC / ST Allocation Quota
              </span>
              <h3 className="font-display text-base font-bold text-foreground mt-1">
                15% SC & 7.5% ST Areas
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Mandatory earmarked spending of at least 15% in Scheduled Caste population areas and 7.5% in Scheduled Tribe areas annually.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border/70 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <IconFileText className="size-4 text-primary" /> Key Principles of the 2023 Guidelines
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                <strong className="text-foreground block mb-1">1. Web-based Real-time Tracking</strong>
                <span className="text-muted-foreground">
                  Entire process from MP recommendation to sanction, execution, and closure is tracked online with geo-tagged photographic evidence.
                </span>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                <strong className="text-foreground block mb-1">2. Mandatory Display Boards</strong>
                <span className="text-muted-foreground">
                  Every asset must display an indelible plaque detailing MP Name, Work Order, Cost, and Implementing Agency.
                </span>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                <strong className="text-foreground block mb-1">3. Citizen Verification Rights</strong>
                <span className="text-muted-foreground">
                  Citizens have statutory rights under RTI to inspect work quality, measurements, and upload evidence of discrepancies.
                </span>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                <strong className="text-foreground block mb-1">4. Unspent Fund Non-Lapsability</strong>
                <span className="text-muted-foreground">
                  Funds released under MPLADS are non-lapsable. Unspent balances are carried forward to the subsequent financial year.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Permissible vs Ineligible Works ── */}
      {activeTab === "works" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-emerald-500/30 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <IconCircleCheck className="size-5 shrink-0" />
              <h3 className="font-display text-base font-bold text-foreground">
                Permissible Public Works
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Works that directly create durable community assets for public utility and common access:
            </p>
            <div className="space-y-2.5">
              {permissibleWorks.map((w, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <span className="font-semibold text-xs text-emerald-700 dark:text-emerald-400 block">
                    ✓ {w.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5 block leading-relaxed">
                    {w.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-red-500/30 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-destructive">
              <IconCircleX className="size-5 shrink-0" />
              <h3 className="font-display text-base font-bold text-foreground">
                Ineligible / Prohibited Works
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Works strictly prohibited under MPLADS guidelines (cannot be sanctioned):
            </p>
            <div className="space-y-2.5">
              {nonPermissibleWorks.map((w, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                  <span className="font-semibold text-xs text-destructive block">
                    ✗ {w.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5 block leading-relaxed">
                    {w.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Citizen Charter & SLA ── */}
      {activeTab === "charter" && (
        <div className="space-y-6">
          <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <IconScale className="size-5 text-primary" /> Citizen Charter & Grievance SLA
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Under the NIDHI-RAKSHAK Citizen Charter, all citizen complaints, evidence reports, and inquiries are legally bound by fixed Service Level Agreements (SLA):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-border/60 bg-muted/30 text-center">
                <span className="size-8 rounded-full bg-blue-500/10 text-blue-600 font-bold font-mono text-sm inline-flex items-center justify-center mb-2">
                  1
                </span>
                <h4 className="text-xs font-bold text-foreground">Level 1: Nodal District</h4>
                <p className="text-[11px] text-muted-foreground mt-1">District Magistrate / Collector</p>
                <span className="mt-2 inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600">
                  7 Working Days
                </span>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-muted/30 text-center">
                <span className="size-8 rounded-full bg-amber-500/10 text-amber-600 font-bold font-mono text-sm inline-flex items-center justify-center mb-2">
                  2
                </span>
                <h4 className="text-xs font-bold text-foreground">Level 2: State Nodal</h4>
                <p className="text-[11px] text-muted-foreground mt-1">Planning Department</p>
                <span className="mt-2 inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600">
                  14 Working Days
                </span>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-muted/30 text-center">
                <span className="size-8 rounded-full bg-emerald-500/10 text-emerald-600 font-bold font-mono text-sm inline-flex items-center justify-center mb-2">
                  3
                </span>
                <h4 className="text-xs font-bold text-foreground">Level 3: MoSPI Central</h4>
                <p className="text-[11px] text-muted-foreground mt-1">Central Monitoring Cell</p>
                <span className="mt-2 inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600">
                  30 Working Days
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate?.("evidence")}
              className="flex-1 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all flex items-center justify-between text-left group"
            >
              <div>
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block">
                  Submit On-Site Photographic Evidence →
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Upload geo-tagged evidence of work quality or ground discrepancies.
                </span>
              </div>
              <IconSparkles className="size-5 text-amber-500 shrink-0 ml-2" />
            </button>

            <button
              onClick={() => onNavigate?.("grievance")}
              className="flex-1 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all flex items-center justify-between text-left group"
            >
              <div>
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block">
                  Lodge an Official Public Grievance →
                </span>
                <span className="text-[11px] text-muted-foreground">
                  File formal complaints with live tracking and resolution alerts.
                </span>
              </div>
              <IconArrowRight className="size-5 text-primary shrink-0 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* ── Tab 4: Frequently Asked Questions ── */}
      {activeTab === "faqs" && (
        <div className="space-y-4">
          <div className="relative">
            <IconSearch className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-card border border-border rounded-xl outline-none focus:border-primary text-foreground placeholder:text-muted-foreground transition-colors"
            />
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-card border border-border/70 rounded-xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isExpanded ? (
                      <IconChevronUp className="size-4 text-muted-foreground shrink-0 ml-2" />
                    ) : (
                      <IconChevronDown className="size-4 text-muted-foreground shrink-0 ml-2" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
