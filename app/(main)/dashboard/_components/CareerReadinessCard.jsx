"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Brain, ClipboardCheck } from "lucide-react";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";

export default function CareerReadinessCard() {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    supabase
      .from("CareerProfiles")
      .select("target_role, analysis")
      .eq("user_email", user.email)
      .maybeSingle()
      .then(({ data }) => setProfile(data || null));
  }, [user?.email]);

  const score = profile?.analysis?.readinessScore?.overall;
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
                ? `${score}/100 readiness for ${profile.target_role}`
                : "Create your career-readiness profile"}
            </h2>
            <p className="text-sm text-gray-500">
              {typeof score === "number"
                ? "Review your gaps and continue with a tailored interview."
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
    </section>
  );
}
