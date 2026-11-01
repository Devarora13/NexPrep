"use client";

import React, { useEffect, useState } from "react";
import {
  Brain,
  CheckCircle2,
  FileText,
  Loader2,
  Target,
  TrendingUp,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";

function ScoreRing({ score }) {
  return (
    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 p-2 shadow-lg">
      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white">
        <span className="text-3xl font-bold text-indigo-700">{score}</span>
        <span className="text-xs font-medium text-gray-500">out of 100</span>
      </div>
    </div>
  );
}

function AnalysisResults({ analysis, source }) {
  if (!analysis) return null;
  const score = Math.max(
    0,
    Math.min(100, Math.round(analysis?.readinessScore?.overall || 0)),
  );
  const skills = analysis.detectedSkills?.length
    ? analysis.detectedSkills
    : ["No skills detected yet"];

  return (
    <section className="mt-8 space-y-6">
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <ScoreRing score={score} />
          <div>
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Career Readiness Score
              </h2>
            </div>
            <p className="max-w-2xl text-gray-700">{analysis.profileSummary}</p>
            <p className="mt-2 text-xs text-gray-500">
              Analysis source:{" "}
              {source === "ai" ? "VERITUS AI" : "local profile analysis"}
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            ["Resume", analysis.readinessScore?.resume],
            ["Skill match", analysis.readinessScore?.skillMatch],
            ["Interview", analysis.readinessScore?.interview ?? "Pending"],
          ].map(([label, value]) => (
            <div className="rounded-xl bg-white/85 p-3" key={label}>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
              </p>
              <p className="mt-1 text-lg font-bold text-indigo-700">
                {typeof value === "number" ? `${value}/100` : value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Skills and
            strengths
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800"
              >
                {skill}
              </span>
            ))}
          </div>
          <ul className="mt-5 space-y-3 text-sm text-gray-700">
            {(analysis.strengths || []).map((item) => (
              <li className="flex gap-2" key={item}>
                <span className="text-emerald-600">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Target className="h-5 w-5 text-amber-600" /> Priority skill gaps
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {(analysis.skillGaps?.length
              ? analysis.skillGaps
              : ["No major gap identified"]
            ).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800"
              >
                {skill}
              </span>
            ))}
          </div>
          <ul className="mt-5 space-y-3 text-sm text-gray-700">
            {(analysis.priorityActions || []).map((item) => (
              <li className="flex gap-2" key={item}>
                <span className="text-amber-600">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <Brain className="h-5 w-5 text-violet-600" /> Your personalized
          roadmap
        </h3>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {(analysis.roadmap || []).map((step, index) => (
            <div
              className="rounded-xl border border-violet-100 bg-violet-50/40 p-4"
              key={`${step.title}-${index}`}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
                Step {index + 1} · {step.priority}
              </p>
              <h4 className="mt-2 font-semibold text-gray-900">{step.title}</h4>
              <p className="mt-1 text-sm text-gray-600">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CareerProfilePage() {
  const { user } = useUser();
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analysisSource, setAnalysisSource] = useState("local");
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [resumeFileName, setResumeFileName] = useState("");

  useEffect(() => {
    if (!user?.email) return;
    supabase
      .from("CareerProfiles")
      .select(
        "target_role, job_description, resume_text, analysis, analysis_source",
      )
      .eq("user_email", user.email)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) return;
        setTargetRole(data.target_role || "");
        setJobDescription(data.job_description || "");
        setResumeText(data.resume_text || "");
        setAnalysis(data.analysis || null);
        setAnalysisSource(data.analysis_source || "local");
      });
  }, [user?.email]);

  const handleResumeFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsExtracting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token)
        throw new Error("Your session has expired. Please sign in again.");
      const formData = new FormData();
      formData.append("resume", file);
      const response = await fetch("/api/resume-extract", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "Unable to read that resume.");
      setResumeText(payload.resumeText);
      setResumeFileName(payload.fileName);
      toast.success(
        "Resume text extracted. Review it, then generate your analysis.",
      );
    } catch (error) {
      toast.error(error.message || "Unable to read that resume.");
    } finally {
      setIsExtracting(false);
      event.target.value = "";
    }
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();
    if (!user?.email)
      return toast.error("Please sign in to create your career profile.");
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token)
        throw new Error("Your session has expired. Please sign in again.");
      const response = await fetch("/api/career-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resumeText, targetRole, jobDescription }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Analysis failed");
      const { error } = await supabase.from("CareerProfiles").upsert(
        {
          user_email: user.email,
          target_role: targetRole,
          job_description: jobDescription,
          resume_text: resumeText,
          analysis: payload.analysis,
          analysis_source: payload.source,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_email" },
      );
      if (error)
        throw new Error(
          `${error.message}. Run the supplied CareerProfiles migration first.`,
        );
      setAnalysis(payload.analysis);
      setAnalysisSource(payload.source);
      toast.success("Your VERITUS career profile is ready.");
    } catch (error) {
      toast.error(error.message || "Unable to analyze this profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 md:px-8">
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-900 p-7 text-white shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
          VERITUS career intelligence
        </p>
        <h1 className="mt-2 text-3xl font-bold">
          Build your career-readiness profile
        </h1>
        <p className="mt-2 max-w-2xl text-indigo-100">
          Turn your resume and target role into a readiness score, skill-gap
          analysis, and practical roadmap before your AI mock interview.
        </p>
      </div>

      <form
        onSubmit={handleAnalyze}
        className="mt-6 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-semibold text-gray-800">
            Target role
            <input
              required
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              placeholder="e.g. Frontend Developer"
              className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
          <label className="block text-sm font-semibold text-gray-800">
            Job description{" "}
            <span className="font-normal text-gray-500">(optional)</span>
            <input
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste requirements or a short role summary"
              className="mt-2 w-full rounded-lg border px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
        </div>
        <div className="mt-5 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/40 p-4">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span>
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Upload className="h-4 w-4" /> Upload resume
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                PDF, DOCX, or TXT · maximum 5 MB · text is extracted for your
                review
              </span>
            </span>
            <span className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-indigo-700 shadow-sm">
              {isExtracting ? "Extracting…" : "Choose file"}
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="sr-only"
              disabled={isExtracting}
              onChange={handleResumeFile}
            />
          </label>
          {resumeFileName && (
            <p className="mt-3 text-sm text-emerald-700">
              Extracted from: {resumeFileName}
            </p>
          )}
        </div>
        <label className="mt-5 block text-sm font-semibold text-gray-800">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Resume or professional profile
          </span>
          <textarea
            required
            minLength={80}
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
            placeholder="Upload a resume above or paste your resume text here. Include education, projects, skills, and experience for the best analysis."
            className="mt-2 min-h-64 w-full rounded-lg border px-3 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>
        <p className="mt-2 text-xs text-gray-500">
          Extracted text stays editable so you can remove personal details or
          correct formatting before analysis.
        </p>
        <button
          disabled={isLoading}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Brain className="h-5 w-5" />
          )}
          {isLoading ? "Analyzing profile…" : "Generate VERITUS analysis"}
        </button>
      </form>
      <AnalysisResults analysis={analysis} source={analysisSource} />
    </main>
  );
}
