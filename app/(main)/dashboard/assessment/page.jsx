"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/services/supabaseClient";
import { challenges, aptitudeSets, lessons, findPractice } from "@/lib/practice-catalog";

const groups = [["Coding and DSA", challenges], ["Aptitude", aptitudeSets], ["Learning checks", lessons]];
const card = "rounded-xl border bg-white p-5 shadow-sm";
const button = "rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white disabled:opacity-50";

export default function AssessmentPage() {
  const [activity, setActivity] = useState(challenges[0]);
  const [answers, setAnswers] = useState([]);
  const [code, setCode] = useState(challenges[0].starter);
  const [attemptId, setAttemptId] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  function choose(next) {
    setActivity(next); setCode(next.starter || ""); setAnswers([]); setResult(null);
    setAttemptId(crypto.randomUUID()); setError("");
  }
  useEffect(() => {
    choose(findPractice(new URLSearchParams(window.location.search).get("activity")) || challenges[0]);
  }, []);
  const questions = activity.questions || (activity.check ? [activity.check] : []);
  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("Sign in to save your attempt.");
      const response = await fetch("/api/practice", { method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + data.session.access_token },
        body: JSON.stringify({ id: attemptId, activity: activity.id, submission: activity.starter ? code : answers }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setResult(payload);
    } catch (err) { setError(err.message || "Could not grade this attempt. Try again."); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-5xl space-y-5 py-6">
    <h1 className="text-3xl font-bold">Practice assessments</h1>
    <label className="block font-semibold">Choose an activity
      <select className="mt-2 block w-full rounded-lg border bg-white p-3" value={activity.id} disabled={busy}
        onChange={event => choose(findPractice(event.target.value))}>
        {groups.map(([title, items]) => <optgroup key={title} label={title}>{items.map(item =>
          <option key={item.id} value={item.id}>{item.title}</option>)}</optgroup>)}
      </select>
    </label>
    <form onSubmit={submit} className={card}>
      <h2 className="mb-3 text-xl font-bold">{activity.title}</h2>
      {activity.steps?.map(step => <p key={step} className="my-3">{step}</p>)}
      {activity.starter && <><p>{activity.prompt}</p><pre className="my-3 whitespace-pre-wrap bg-slate-100 p-3">{activity.example}</pre>
        <label className="font-semibold">JavaScript solution<textarea className="mt-2 block min-h-48 w-full rounded-lg bg-slate-950 p-4 font-mono text-white"
          value={code} onChange={e => setCode(e.target.value)} required maxLength={8000} disabled={busy || !!result} spellCheck={false}/></label></>}
      {questions.map(([question, options], i) => <fieldset key={question} disabled={busy || !!result} className="my-5">
        <legend className="font-semibold">{i + 1}. {question}</legend>
        {options.map((option,j) => <label key={option} className="mt-2 block"><input type="radio" name={"q"+i} className="mr-2" required checked={answers[i] === j}
          onChange={() => { const updated = [...answers]; updated[i] = j; setAnswers(updated); }}/> {option}</label>)}</fieldset>)}
      {error && <p role="alert" className="my-3 text-red-700">{error}</p>}
      {!result && <button className={button + " mt-4"} disabled={busy || !attemptId}>{busy ? "Grading and saving…" : "Submit for grading"}</button>}
      {result && <section aria-live="polite" className="mt-5 space-y-3 rounded-xl bg-indigo-50 p-4">
        <h3 className="text-xl font-bold">Saved score · {result.score}/100</h3>
        <p>{result.passed} of {result.total} {activity.starter ? "test cases passed" : "answers correct"}.</p>
        {result.passed < result.total && <p>Review {result.results.flatMap((ok, i) => ok ? [] : [i+1]).join(", ")} {activity.starter ? "in the test results. Check edge cases and return type." : "in the questions above."}</p>}
        <button type="button" className={button} onClick={() => choose(activity)}>Try again</button>
        <Link className="ml-4 underline" href="/dashboard">View dashboard</Link>
      </section>}
    </form>
  </main>;
}
