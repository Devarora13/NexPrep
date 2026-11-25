import { createClient } from "@supabase/supabase-js";
import { findPractice } from "@/lib/practice-catalog";
import { gradePractice } from "@/lib/grade-practice";

export async function POST(request) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return Response.json({ error: "Sign in to save practice." }, { status: 401 });
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: authorization } } });
  const { data: { user } } = await db.auth.getUser(authorization.slice(7));
  if (!user?.email) return Response.json({ error: "Session expired. Sign in again." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || !findPractice(body.activity) || !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(body.id)) {
    return Response.json({ error: "Invalid practice attempt." }, { status: 400 });
  }
  let result;
  try { result = await gradePractice(body.activity, body.submission); }
  catch (error) { return Response.json({ error: error.message }, { status: 400 }); }
  const { error } = await db.from("AssessmentAttempts").insert({ id: body.id, user_email: user.email,
    assessment_type: body.activity, total_questions: result.total, score: result.score,
    answers: { submission: body.submission, result } });
  if (error?.code === "23505") {
    const { data } = await db.from("AssessmentAttempts").select("assessment_type, answers")
      .eq("user_email", user.email).eq("id", body.id).maybeSingle();
    if (data?.assessment_type === body.activity && JSON.stringify(data.answers?.submission) === JSON.stringify(body.submission))
      return Response.json(data.answers.result);
  }
  if (error) return Response.json({ error: "Could not save the attempt. Retry to save your answers." }, { status: 503 });
  return Response.json(result);
}
