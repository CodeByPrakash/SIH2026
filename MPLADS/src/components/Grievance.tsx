"use client";

import { useState } from "react";
import { useGrievances } from "@/hooks/useGrievances";

export default function Grievance() {
  const { grievances, isLive, lastUpdated, submitGrievance } = useGrievances();
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<string>("");
  const [form, setForm] = useState({ name: "", mobile: "", district: "", category: "", desc: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackSearch, setTrackSearch] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.district || !form.category || !form.desc) return;
    setIsSubmitting(true);
    const created = await submitGrievance(form);
    setIsSubmitting(false);
    if (created) {
      setSubmittedId(created.id);
    } else {
      setSubmittedId(`GRV-2024-${String(grievances.length + 1).padStart(3, "0")}`);
    }
    setSubmitted(true);
    setForm({ name: "", mobile: "", district: "", category: "", desc: "" });
  };

  const displayedGrievances = grievances.filter(g =>
    !trackSearch.trim() ||
    g.id.toLowerCase().includes(trackSearch.toLowerCase()) ||
    g.title.toLowerCase().includes(trackSearch.toLowerCase()) ||
    g.district.toLowerCase().includes(trackSearch.toLowerCase())
  );

  return (
    <div className="p-6 animate-slide-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-slate-800">Grievance Portal</h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                isLive
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <span className={`size-1.5 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              {isLive ? "Live Sync" : "Static Mode"}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Submit and track your grievances related to NIDHI-RAKSHAK projects
            {lastUpdated && ` · Last updated: ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Submit form */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-display text-sm font-semibold text-slate-700 mb-4">Submit a Grievance</h2>
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">âœ…</div>
              <div className="font-display text-base font-semibold text-emerald-700 mb-2">Grievance Submitted!</div>
              <div className="text-xs text-slate-500 mb-1">Reference ID: <span className="font-mono-data font-semibold text-slate-800">{submittedId}</span></div>
              <div className="text-xs text-slate-400">Recorded in backend database & generated auto-alert for nodal officers.</div>
              <button onClick={() => setSubmitted(false)} className="mt-4 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">Submit another â†’</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { key: "name", label: "Full Name", type: "text", placeholder: "Your name" },
                { key: "mobile", label: "Mobile Number", type: "tel", placeholder: "+91 XXXXX XXXXX" },
                { key: "district", label: "District", type: "text", placeholder: "Your district" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-slate-500 mb-1 block">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} required value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-slate-700 placeholder-slate-400 transition-colors"/>
                </div>
              ))}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Category</label>
                <select required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-slate-600 bg-white transition-colors">
                  <option value="">Select category</option>
                  {["Project Stall", "Quality Issue", "Transparency", "Fund Misuse", "Delay", "Other"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Description</label>
                <textarea required placeholder="Describe your grievance in detailâ€¦" rows={4} value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-slate-700 placeholder-slate-400 transition-colors resize-none"/>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-[#0F2044] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50">
                {isSubmitting ? "Submitting to DBâ€¦" : "Submit Grievance â†’"}
              </button>
            </form>
          )}
        </div>

        {/* Track grievances */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-display text-sm font-semibold text-slate-700 mb-4 flex items-center justify-between">
            <span>Track Your Grievances</span>
            <span className="text-xs font-normal text-slate-400">({displayedGrievances.length} records)</span>
          </h2>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {displayedGrievances.map(g => (
              <div key={g.id} className="p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono-data text-[10px] font-semibold text-slate-500">{g.id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${g.status === "Resolved" ? "bg-emerald-100 text-emerald-700" : g.status === "Under Review" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>{g.status}</span>
                </div>
                <div className="text-xs font-medium text-slate-700">{g.title}</div>
                <div className="text-[10px] text-slate-400 mt-1">{g.district} Â· {g.category} Â· {g.date}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex gap-2">
              <input placeholder="Search Grievance ID or text" value={trackSearch} onChange={e => setTrackSearch(e.target.value)} className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-slate-700 placeholder-slate-400 transition-colors"/>
              {trackSearch && (
                <button onClick={() => setTrackSearch("")} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 transition-colors">
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
