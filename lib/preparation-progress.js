import { calculateReadiness, applyInterviewScore } from "./career-readiness.js";
import { aptitudeSets, challenges, lessons } from "./practice-catalog.js";

export function summarizePractice(rows) {
  const latest = new Map();
  const finished = new Set();
  for (const row of rows) {
    if (lessons.some(item => item.id === row.assessment_type) && row.score === 100) finished.add(row.assessment_type);
    if ([...aptitudeSets, ...challenges].some(item => item.id === row.assessment_type) && !latest.has(row.assessment_type)) {
      latest.set(row.assessment_type, row.score);
    }
  }
  return {
    assessment: latest.size ? Math.round([...latest.values()].reduce((a,b) => a+b, 0) / latest.size) : null,
    learning: rows.some(row => lessons.some(item => item.id === row.assessment_type)) ? Math.round(100 * finished.size / lessons.length) : null,
    finished: [...finished],
  };
}

export async function loadProgress(db, email) {
  const [attempts, interviews] = await Promise.all([
    db.from("AssessmentAttempts").select("assessment_type,score,created_at").eq("user_email", email).order("created_at", { ascending: false }),
    db.from("InterviewDetails").select("interview_id").eq("user_email", email).in("status",["completed","expired"]).order("ended_at", { ascending: false }),
  ]);
  if (attempts.error || interviews.error) throw new Error("Could not load preparation history.");
  const practice = summarizePractice(attempts.data);
  let interview = null;
  for (let i = 0; interview === null && i < interviews.data.length; i += 50) {
    const ids = interviews.data.slice(i,i+50).map(row => row.interview_id);
    const reviews = await db.from("PostInterview").select("interview_id,interview_review").in("interview_id", ids);
    if (reviews.error) throw new Error("Could not load scored interviews.");
    for (const id of ids) {
      let review = reviews.data.find(row => row.interview_id === id)?.interview_review;
      if (typeof review === "string") { try { review = JSON.parse(review); } catch { continue; } }
      const score = applyInterviewScore({}, review?.feedback || review)?.readinessScore?.interview;
      if (Number.isFinite(score)) { interview = score; break; }
    }
  }
  return { ...practice, interview, recent: attempts.data.filter(row => row.assessment_type !== "technical_readiness").slice(0,5) };
}

export function profileScore(analysis, progress) {
  return calculateReadiness({ ...analysis?.readinessScore, ...progress });
}
