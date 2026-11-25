"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser } from "@/app/provider";
import { supabase } from "@/services/supabaseClient";

const events = [
  ["quantitative","Quantitative reasoning","Earn one credit for a perfect score on the ten-question set."],
  ["logical","Logical reasoning","Earn one credit for a perfect score on the ten-question set."],
  ["learning","Learning checks","Earn one credit for passing all three resource checks."],
  ["advanced-case","Advanced interview case","Spend one credit to unlock a system-design rehearsal with a self-review rubric."],
];
export default function Credits() {
  const { user, setUser } = useUser();
  const [claimed, setClaimed] = useState([]);
  const [caseText, setCaseText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function refresh() {
    const [ledger, profile, advanced] = await Promise.all([
      supabase.from("PracticeCredits").select("event,amount,created_at").eq("user_email",user.email).order("created_at",{ascending:false}),
      supabase.from("Users").select("credits").eq("email",user.email).single(),
      supabase.rpc("advanced_practice_case")]);
    if (ledger.error || advanced.error || profile.error) throw new Error("Could not load credits. Check the connection and the practice credits migration.");
    setClaimed(ledger.data); setCaseText(advanced.data || "");
    setUser(current => current && current.email === user.email ? {...current, credits:profile.data.credits} : current);
  }
  useEffect(() => { if (user?.email) refresh().catch(err => setError(err.message)); }, [user?.email]);
  async function redeem(event) {
    setBusy(true); setError("");
    try {
      const { error } = await supabase.rpc("practice_credit",{p_event:event});
      if (error) throw error;
      await refresh();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-4xl space-y-5 py-6">
    <h1 className="text-3xl font-bold">Practice credits</h1>
    <p className="rounded-xl bg-indigo-50 p-5 text-xl font-semibold">{user?.credits ?? "…"} credits available</p>
    <p>Each practice milestone can be claimed once. Use credits to start a voice interview or unlock the advanced case.</p>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {events.map(([id,title,detail]) => {
      const done = claimed.some(row => row.event === id);
      return <section key={id} className="rounded-xl border bg-white p-4">
        <h2 className="font-bold">{title}</h2><p className="my-2 text-sm">{detail}</p>
        <button disabled={done || busy || !user} onClick={() => redeem(id)} className="rounded-lg bg-indigo-700 px-3 py-2 text-white disabled:opacity-50">
          {done ? (id === "advanced-case" ? "Unlocked" : "Claimed") : id === "advanced-case" ? "Unlock for 1 credit" : "Claim credit"}</button>
        {id !== "advanced-case" && <Link className="ml-3 underline" href={"/dashboard/assessment?activity="+(id === "learning" ? "star" : id)}>Open practice</Link>}
      </section>;
    })}
    {caseText && <section className="rounded-lg bg-indigo-50 p-5"><h2 className="font-bold">Advanced case</h2><p>{caseText}</p></section>}
    <Link className="inline-block underline" href="/dashboard/create-interview">Create a voice interview</Link>
  </main>;
}
