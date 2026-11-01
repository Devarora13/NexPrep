"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, ClipboardCheck, Loader2, RotateCcw, Target } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { TECHNICAL_READINESS_QUESTIONS } from "@/lib/assessment";
import { applyAssessmentScore } from "@/lib/career-readiness";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";

export default function AssessmentPage() {
  const { user } = useUser();
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    supabase.from("CareerProfiles").select("analysis").eq("user_email", user.email).maybeSingle().then(({ data }) => setProfile(data || null));
  }, [user?.email]);

  const submit = async (event) => {
    event.preventDefault();
    if (Object.keys(answers).length !== TECHNICAL_READINESS_QUESTIONS.length) return toast.error("Answer every question before submitting.");
    const correct = TECHNICAL_READINESS_QUESTIONS.filter((question) => answers[question.id] === question.answer).length;
    const score = Math.round((correct / TECHNICAL_READINESS_QUESTIONS.length) * 100);
    setResult({ correct, score });
    if (!user?.email) return;
    setIsSaving(true);
    try {
      const { error: attemptError } = await supabase.from("AssessmentAttempts").insert({
        user_email: user.email,
        assessment_type: "technical_readiness",
        score,
        total_questions: TECHNICAL_READINESS_QUESTIONS.length,
        answers,
      });
      if (attemptError) throw attemptError;
      if (profile?.analysis) {
        const analysis = applyAssessmentScore(profile.analysis, score);
        const { error: profileError } = await supabase.from("CareerProfiles").update({ analysis, updated_at: new Date().toISOString() }).eq("user_email", user.email);
        if (profileError) throw profileError;
        setProfile({ analysis });
      }
      toast.success("Assessment saved and readiness score updated.");
    } catch (error) {
      toast.error(`${error.message}. Run the AssessmentAttempts migration if this is your first attempt.`);
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => { setAnswers({}); setResult(null); };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-5 md:px-8">
      <div className="rounded-2xl bg-gradient-to-r from-cyan-700 to-indigo-800 p-7 text-white shadow-lg"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">VERITUS Practice</p><h1 className="mt-2 text-3xl font-bold">Technical Readiness Assessment</h1><p className="mt-2 text-cyan-50">Five core questions across frontend, APIs, databases, data structures, and developer workflow.</p></div>
      {result ? (
        <section className="mt-6 rounded-2xl border bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"><CheckCircle2 className="h-9 w-9 text-emerald-600" /></div><p className="mt-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Assessment complete</p><h2 className="mt-1 text-4xl font-bold text-indigo-700">{result.score}/100</h2><p className="mt-2 text-gray-600">You answered {result.correct} of {TECHNICAL_READINESS_QUESTIONS.length} questions correctly.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={reset} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"><RotateCcw className="h-4 w-4" /> Try again</button><Link href="/dashboard/career-profile" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700"><Target className="h-4 w-4" /> View readiness profile</Link></div></section>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">{TECHNICAL_READINESS_QUESTIONS.map((question, index) => <fieldset key={question.id} className="rounded-2xl border bg-white p-6 shadow-sm"><legend className="sr-only">Question {index + 1}</legend><p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{question.category}</p><h2 className="mt-2 font-semibold text-gray-900">{index + 1}. {question.question}</h2><div className="mt-4 grid gap-2">{question.options.map((option) => <label key={option} className={`cursor-pointer rounded-lg border p-3 text-sm transition ${answers[question.id] === option ? "border-indigo-500 bg-indigo-50 text-indigo-900" : "hover:border-indigo-200 hover:bg-gray-50"}`}><input className="mr-3 accent-indigo-600" type="radio" name={question.id} value={option} checked={answers[question.id] === option} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option }))} />{option}</label>)}</div></fieldset>)}<button disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <ClipboardCheck className="h-5 w-5" />}{isSaving ? "Saving…" : "Submit assessment"}</button></form>)}
    </main>
  );
}
