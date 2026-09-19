"use client";

import { useState } from "react";

const SAMPLE_GRIEVANCES = [
  { id: "GRV-2024-001", title: "Road construction stopped mid-way, Lucknow", status: "Under Review", date: "2024-08-10", category: "Project Stall", district: "Lucknow" },
  { id: "GRV-2024-002", title: "Borewell not functional after completion", status: "Resolved", date: "2024-07-22", category: "Quality", district: "Shivpuri" },
  { id: "GRV-2024-003", title: "No visibility of sanctioned funds usage", status: "Open", date: "2024-08-20", category: "Transparency", district: "Barmer" },
];

export default function Grievance() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "", district: "", category: "", desc: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="p-6 animate-slide-in max-w-3xl mx-auto">
      <h1 className="font-display text-xl font-bold text-slate-800 mb-1">Grievance Portal</h1>
      <p className="text-slate-500 text-sm mb-6">Submit and track your grievances related to MPLADS projects</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Submit form */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-display text-sm font-semibold text-slate-700 mb-4">Submit a Grievance</h2>
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <div className="font-display text-base font-semibold text-emerald-700 mb-2">Grievance Submitted!</div>
              <div className="text-xs text-slate-500 mb-1">Reference ID: <span className="font-mono-data font-semibold">GRV-2024-{String(SAMPLE_GRIEVANCES.length + 1).padStart(3, "0")}</span></div>
              <div className="text-xs text-slate-400">You will receive SMS updates on your registered mobile number.</div>
              <button onClick={() => setSubmitted(false)} className="mt-4 text-xs text-blue-600 hover:text-blue-700 transition-colors">Submit another →</button>
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
                  <input type={f.type} placeholder={f.placeholder} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-slate-700 placeholder-slate-400 transition-colors"/>
                </div>
              ))}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-slate-600 bg-white transition-colors">
                  <option value="">Select category</option>
                  {["Project Stall", "Quality Issue", "Transparency", "Fund Misuse", "Delay", "Other"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Description</label>
                <textarea placeholder="Describe your grievance in detail…" rows={4} value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-slate-700 placeholder-slate-400 transition-colors resize-none"/>
              </div>
              <button type="submit" className="w-full py-2.5 bg-[#0F2044] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors">Submit Grievance →</button>
            </form>
          )}
        </div>

        {/* Track grievances */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-display text-sm font-semibold text-slate-700 mb-4">Track Your Grievances</h2>
          <div className="space-y-3">
            {SAMPLE_GRIEVANCES.map(g => (
              <div key={g.id} className="p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono-data text-[10px] text-slate-400">{g.id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${g.status === "Resolved" ? "bg-emerald-100 text-emerald-700" : g.status === "Under Review" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>{g.status}</span>
                </div>
                <div className="text-xs font-medium text-slate-700">{g.title}</div>
                <div className="text-[10px] text-slate-400 mt-1">{g.district} · {g.category} · {g.date}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex gap-2">
              <input placeholder="Enter Grievance ID to track" className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-slate-700 placeholder-slate-400 transition-colors"/>
              <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Track</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
