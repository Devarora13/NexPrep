"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Brain, ClipboardCheck } from "lucide-react";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";

import { loadProgress, profileScore } from "@/lib/preparation-progress";
import { findPractice } from "@/lib/practice-catalog";

export default function CareerReadinessCard() {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);

  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!user?.email) return;
    let active = true;
    Promise.all([supabase.from("CareerProfiles").select("target_role, analysis").eq("user_email", user.email).maybeSingle(), loadProgress(supabase, user.email)])
      .then(([saved, activity]) => {
        if (saved.error) throw saved.error;
        if (active) { setProfile(saved.data); setProgress(activity); setError(""); }
      }).catch(() => { if (active) setError("Unable to load preparation history."); });
    return () => { active = false; };
  }, [user?.email]);

  const readiness = profileScore(profile?.analysis, progress);
  const score = readiness.overall;
  return (
    <section className="mb-6 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-indigo-100 p-3">
            <Brain className="h-6 w-6 text-indigo-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-indigo-700">
              VERITUS Career Intelligence
            </p>
            <h2 className="text-lg font-bold text-gray-900">
              {typeof score === "number"
                ? `${score}/100 readiness${profile?.target_role ? " for " + profile.target_role : ""}`
                : "Create your career-readiness profile"}
            </h2>
            <p className="text-sm text-gray-500">
              {typeof score === "number"
                ? `Evidence covers ${readiness.coverage}% of the weighted score.`
                : "Get your skill-gap analysis and personalized roadmap."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/assessment"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            <ClipboardCheck className="h-4 w-4" /> Assessment
          </Link>
          <Link
            href="/dashboard/career-profile"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            {typeof score === "number" ? "View roadmap" : "Build profile"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
      {progress?.recent?.length > 0 && <div className="mt-4 border-t pt-3">
        <h3 className="font-semibold">Recent practice</h3>
        {progress.recent.map((row,i) => <div key={i} className="mt-2 flex justify-between gap-2 text-sm">
          <span>{findPractice(row.assessment_type)?.title || row.assessment_type}</span>
          <span>{row.score}/100 · {new Date(row.created_at).toLocaleDateString()}</span>
        </div>)}</div>}
    </section>
  );
}
