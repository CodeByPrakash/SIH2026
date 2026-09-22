"use client";

import React, { useState, useMemo } from "react";
import type { User } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IconMessageHeart,
  IconStar,
  IconStarFilled,
  IconSearch,
  IconCheck,
  IconSend,
  IconMapPin,
  IconThumbUp,
  IconThumbDown,
  IconAlertTriangle,
  IconUserCheck,
  IconShare3,
  IconFilter,
  IconBuildingCommunity,
} from "@tabler/icons-react";

interface CitizenFeedbackProps {
  user: User;
  onNavigate?: (page: string) => void;
}

interface FeedbackItem {
  id: string;
  citizenName: string;
  wardVillage: string;
  constituency: string;
  projectName: string;
  sector: string;
  rating: number;
  sentiment: "Positive" | "Suggestion" | "Concern";
  date: string;
  comment: string;
  status: "Pending" | "Reviewed" | "Action Taken";
  helpfulCount: number;
}

const SAMPLE_FEEDBACK: FeedbackItem[] = [
  {
    id: "CFB-2024-001",
    citizenName: "Virendra Singh",
    wardVillage: "Gram Panchayat Rampur, Sarojini Nagar",
    constituency: "Lucknow",
    projectName: "Construction of CC Road in Gram Panchayat Rampur, Lucknow",
    sector: "Roads & Connectivity",
    rating: 5,
    sentiment: "Positive",
    date: "2024-10-18",
    comment:
      "The newly paved CC road has made school commuting completely safe for our children during monsoon. Construction quality is very strong.",
    status: "Action Taken",
    helpfulCount: 42,
  },
  {
    id: "CFB-2024-002",
    citizenName: "Sunita Yadav",
    wardVillage: "Alambagh Ward 14",
    constituency: "Lucknow",
    projectName: "Solar High Mast Lighting at Public Crossings",
    sector: "Energy & Lighting",
    rating: 5,
    sentiment: "Positive",
    date: "2024-10-14",
    comment:
      "Crossroads are now well-lit throughout the night. It has drastically improved women safety in our neighborhood. Commendable work by Hon'ble MP.",
    status: "Reviewed",
    helpfulCount: 29,
  },
  {
    id: "CFB-2024-003",
    citizenName: "Mohd. Tariq",
    wardVillage: "Chinhat Village",
    constituency: "Lucknow",
    projectName: "Drinking Water Deep Tube Well & RO Plant",
    sector: "Drinking Water",
    rating: 4,
    sentiment: "Suggestion",
    date: "2024-10-09",
    comment:
      "Water pressure and quality are excellent. However, a shade or canopy over the waiting tap area would protect elderly residents during peak summer.",
    status: "Action Taken",
    helpfulCount: 18,
  },
  {
    id: "CFB-2024-004",
    citizenName: "Rameshwar Dayal",
    wardVillage: "Gosainganj Sector 4",
    constituency: "Lucknow",
    projectName: "Community Cultural Hall & Skill Center",
    sector: "Community Assets",
    rating: 2,
    sentiment: "Concern",
    date: "2024-10-02",
    comment:
      "Boundary wall construction halted for the past 3 weeks. Contractor machinery is lying idle. Kindly intervene with DM office for expediting work.",
    status: "Pending",
    helpfulCount: 35,
  },
  {
    id: "CFB-2024-005",
    citizenName: "Anita Saxena",
    wardVillage: "Mahanagar Extension",
    constituency: "Lucknow",
    projectName: "Primary Health Center Digital Equipment Upgrade",
    sector: "Health & Healthcare",
    rating: 5,
    sentiment: "Positive",
    date: "2024-09-28",
    comment:
      "Diagnostic report turnaround reduced from 3 days to under 2 hours. Doctors and nursing staff are using the new equipment effectively.",
    status: "Action Taken",
    helpfulCount: 51,
  },
];

export default function CitizenFeedback({ user }: CitizenFeedbackProps) {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(SAMPLE_FEEDBACK);
  const [search, setSearch] = useState("");
  const [selectedSentiment, setSelectedSentiment] = useState<"ALL" | "Positive" | "Suggestion" | "Concern">("ALL");
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");
  const [respondedIds, setRespondedIds] = useState<Set<string>>(new Set());

  const currentConstituency = user.constituency || "Lucknow";

  const handleMarkAction = (id: string) => {
    setFeedbackList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Action Taken" } : item))
    );
  };

  const handleSendResponse = (id: string) => {
    setRespondedIds((prev) => new Set(prev).add(id));
  };

  const filteredItems = useMemo(() => {
    return feedbackList.filter((item) => {
      const matchesSearch =
        item.citizenName.toLowerCase().includes(search.toLowerCase()) ||
        item.wardVillage.toLowerCase().includes(search.toLowerCase()) ||
        item.projectName.toLowerCase().includes(search.toLowerCase()) ||
        item.comment.toLowerCase().includes(search.toLowerCase());
      const matchesSentiment = selectedSentiment === "ALL" || item.sentiment === selectedSentiment;
      const matchesRating = ratingFilter === "ALL" || item.rating === ratingFilter;
      return matchesSearch && matchesSentiment && matchesRating;
    });
  }, [feedbackList, search, selectedSentiment, ratingFilter]);

  const avgRating = 4.7;
  const positiveRate = 88;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      {/* ── Top Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconMessageHeart className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                Citizen Feedback & Public Sentiment
              </h1>
              <p className="text-xs text-muted-foreground md:text-sm">
                Direct community reviews & satisfaction tracking · {currentConstituency} Parliamentary Constituency
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 font-mono text-xs font-semibold gap-1 text-primary border-primary/30 bg-primary/5">
            <IconMapPin className="size-3.5 text-primary" />
            {currentConstituency} Constituency
          </Badge>
          <Badge className="bg-emerald-600 text-white text-xs gap-1">
            <IconStarFilled className="size-3" />
            {avgRating} / 5.0 Rating
          </Badge>
        </div>
      </div>

      {/* ── Top 4 KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs hover:border-primary/40 transition-all">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Community Satisfaction</span>
              <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <IconStarFilled className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{avgRating}</span>
              <span className="text-xs text-muted-foreground font-medium">/ 5.0 Scale</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <IconThumbUp className="size-3" />
              {positiveRate}% Positive Community Sentiment
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs hover:border-primary/40 transition-all">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Feedback Submissions</span>
              <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <IconUserCheck className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">348</span>
              <span className="text-xs text-muted-foreground font-medium">Verified Citizens</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              +28 Submissions in past 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs hover:border-primary/40 transition-all">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Action Taken Rate</span>
              <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <IconCheck className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">92.4%</span>
              <span className="text-xs text-emerald-600 font-medium">Resolution Rate</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">
              318 Issues Addressed by MP Office
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs hover:border-primary/40 transition-all">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Escalations to District DM</span>
              <div className="size-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                <IconAlertTriangle className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">12</span>
              <span className="text-xs text-muted-foreground font-medium">Pending with DM</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Quality & Delay Inquiries Initiated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-card border rounded-xl p-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search citizen, village, project, or review..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-background"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sentiment Filter */}
          <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/30 text-xs">
            {(["ALL", "Positive", "Suggestion", "Concern"] as const).map((sent) => (
              <button
                key={sent}
                type="button"
                onClick={() => setSelectedSentiment(sent)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedSentiment === sent
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {sent === "ALL" ? "All Sentiment" : sent}
              </button>
            ))}
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground border rounded-lg px-2 h-8">
            <span>Stars:</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
              className="bg-transparent border-none text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Feedback Stream ── */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-xs text-muted-foreground">No feedback matches your selected filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => {
            const hasResponded = respondedIds.has(item.id);
            return (
              <Card key={item.id} className="shadow-xs hover:border-primary/30 transition-all">
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{item.citizenName}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5">
                          Verified Voter
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${
                            item.sentiment === "Positive"
                              ? "border-emerald-500/40 text-emerald-600 bg-emerald-500/10"
                              : item.sentiment === "Suggestion"
                              ? "border-blue-500/40 text-blue-600 bg-blue-500/10"
                              : "border-red-500/40 text-red-600 bg-red-500/10"
                          }`}
                        >
                          {item.sentiment}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <IconMapPin className="size-3 text-muted-foreground" />
                        {item.wardVillage} · {item.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <IconStarFilled
                          key={i}
                          className={`size-3.5 ${
                            i < item.rating ? "text-amber-400" : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Project Linked */}
                  <div className="bg-muted/40 rounded-lg p-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <IconBuildingCommunity className="size-4 text-primary shrink-0" />
                      <span className="font-medium text-foreground truncate">{item.projectName}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {item.sector}
                    </Badge>
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-foreground/90 leading-relaxed">&ldquo;{item.comment}&rdquo;</p>

                  {/* Footer & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>Status:</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          item.status === "Action Taken"
                            ? "border-emerald-500 text-emerald-600 bg-emerald-500/10"
                            : item.status === "Reviewed"
                            ? "border-blue-500 text-blue-600 bg-blue-500/10"
                            : "border-amber-500 text-amber-600 bg-amber-500/10"
                        }`}
                      >
                        {item.status}
                      </Badge>
                      <span>· {item.helpfulCount} citizens found this helpful</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendResponse(item.id)}
                        disabled={hasResponded}
                        className="h-7 text-xs gap-1"
                      >
                        <IconSend className="size-3" />
                        {hasResponded ? "MP Note Sent" : "Send MP Acknowledgement"}
                      </Button>
                      {item.status !== "Action Taken" && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAction(item.id)}
                          className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <IconCheck className="size-3" />
                          Mark Action Taken
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
