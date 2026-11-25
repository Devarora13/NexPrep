import test from "node:test";
import assert from "node:assert/strict";
import { createFallbackAnalysis, applyAssessmentScore, applyInterviewScore, calculateReadiness } from "../lib/career-readiness.js";
import { gradePractice } from "../lib/grade-practice.js";
import { summarizePractice } from "../lib/preparation-progress.js";
import { generateInterviewFeedback } from "../lib/interview-feedback.js";

test("job requirements are independent of the resume and matches retain evidence", () => {
  const resumeText = "Projects\nBuilt a JavaScript API utilized by 20 users.\nEducation: Bachelor degree";
  const analysis = createFallbackAnalysis({ resumeText, targetRole:"Developer", jobDescription:"Java, APIs and Docker" });
  assert.deepEqual(analysis.matchedSkills, ["api"]);
  assert.deepEqual(analysis.skillGaps, ["java","docker"]);
  assert.equal(analysis.evidence.api,resumeText.split("\n")[1]);
  assert.equal(analysis.readinessScore.skillMatch,33);
  assert.equal(analysis.edits[0].revised,"Built a JavaScript API used by 20 users.");
  assert.equal(createFallbackAnalysis({resumeText,targetRole:"Developer", jobDescription:""}).readinessScore.skillMatch,null);
});

test("score is independent of completion order, including zero", () => {
  const profile = {readinessScore: {resume:80,skillMatch:40}};
  const feedback = {overallScore:60};
  const a = applyInterviewScore(applyAssessmentScore(profile,0),feedback);
  const b = applyAssessmentScore(applyInterviewScore(profile,feedback),0);
  assert.deepEqual(a,b);
  assert.equal(a.readinessScore.overall,46);
  assert.equal(a.readinessScore.coverage,90);
  assert.equal(calculateReadiness({}).overall,null);
  assert.equal(applyInterviewScore(profile,{source:"fallback_generation_error",overallScore:50}), profile);
});

test("placeholder and repeated practice do not inflate progress", () => {
  const output = summarizePractice([{assessment_type:"quantitative",score:0},{assessment_type:"star",score:100},{assessment_type:"star",score:100},{assessment_type:"quantitative",score:90},{assessment_type:"technical_readiness",score:100}]);
  assert.equal(output.assessment,0); assert.equal(output.learning,33);
});

test("three coding challenges grade valid solutions", async () => {
  const examples = {
    "unique-count": "function solve(values) { return new Set(values).size; }",
    balanced: "function solve(text) { const stack=[]; for (const c of text) { if ('([{'.includes(c)) stack.push(c); else if (stack.pop() !== '([{ '.charAt(')]}'.indexOf(c))) return false; } return stack.length === 0; }",
    "max-run": "function solve(values) { let last, run=0, best=0; for(const v of values) { run=v===last?run+1:1; best=Math.max(best,run); last=v; } return best; }",
  };
  for (const [id,code] of Object.entries(examples)) assert.equal((await gradePractice(id,code)).score,100,id);
});

test("syntax errors, looping solutions and wrong types fail cleanly", async () => {
  for (const code of ["function solve(){while(true){}}", "function solve(){", "function solve(){return '0'}"])
    assert.equal((await gradePractice("unique-count",code)).score,0);
});

test("aptitude sets and resource checks grade independently", async () => {
  for (const [id, answers] of Object.entries({quantitative:[2,0,3,1,1,2,0,3,1,2],logical:[3,1,2,3,1,1,2,3,1,1],star:[2],resume:[2],testing:[1]}))
    assert.equal((await gradePractice(id,answers)).score,100,id);
  await assert.rejects(gradePractice("logical",[]));
});

test("feedback retries a malformed review using the same transcript and a free fallback", async () => {
  const transcript = "Candidate: I compared the query plans before and after indexing.";
  const feedback = { overallScore: 70, rating: { technicalSkills: 7, communication: 8, problemSolving: 7, experience: 6, confidence: 7 },
    summary: "Compared two query plans.", strengths: ["Used a comparison."], weaknesses: [], areasToImprove: ["Quantify the difference."],
    recommendation: "Continue practicing", recommendationMsg: "Discuss the measured results." };
  const requests = [];
  const review = await generateInterviewFeedback(transcript, "test", async (_, options) => {
    requests.push(JSON.parse(options.body));
    const content = requests.length === 1 ? "{}" : JSON.stringify({ feedback });
    return Response.json({ choices: [{ message: { content } }] });
  });
  assert.deepEqual(review.feedback, feedback);
  assert.equal(requests.length, 2);
  assert.equal(requests[1].model, "openrouter/free");
  assert.equal(requests[0].messages.length, 1);
  assert.equal(requests[0].messages[0].role, "user");
  assert.ok(requests[0].messages[0].content.includes(transcript));
  assert.equal(requests[0].temperature, 0.7);
  assert.equal(requests[0].max_tokens, 4000);
  assert.equal(requests[0].response_format, undefined);
  assert.equal(requests[1].messages[1].content, transcript);
});

test("a labeled review produces a report when the primary returns truncated JSON", async () => {
  let calls = 0;
  const lines = ["**technicalSkills:** 8/10", "communication: 7", "problemSolving: 8", "experience: 5",
    "summary: You compared the query plans.", "areasToImprove: Give the measured latency after adding the index."];
  const { feedback } = await generateInterviewFeedback("Candidate: I compared the query plans.", "test", async () => {
    const content = ++calls === 1 ? '{"feedback":' : lines.join("\n");
    return Response.json({ choices: [{ message: { content } }] });
  });
  assert.equal(feedback.overallScore, 70);
  assert.equal(feedback.rating.technicalSkills, 8);
  assert.equal(feedback.rating.confidence, undefined);
  assert.deepEqual(feedback.areasToImprove, [lines[5].split(": ")[1]]);
});

test("an incomplete scoring response retains coaching without assigning readiness points", async () => {
  let calls = 0;
  const partial = { summary: "You described your indexing decision.", areasToImprove: "Explain the write overhead.",
    rating: { technicalSkills: "85/100", communication: 7, problemSolving: 8, experience: null } };
  const { feedback } = await generateInterviewFeedback("Candidate: I added an index.", "test", async () => {
    const content = ++calls === 1 ? JSON.stringify(partial) : "{}";
    return Response.json({ choices: [{ message: { content } }] });
  });
  assert.equal(calls, 2);
  assert.equal(feedback.source, "ai_qualitative");
  assert.equal(feedback.rating, null);
  assert.equal(feedback.overallScore, null);
  assert.equal(feedback.summary, partial.summary);
  const existing = { readinessScore: { overall: 50 } };
  assert.equal(applyInterviewScore(existing, feedback), existing);
});

test("feedback reports provider limits and avoids retrying an invalid provider key", async () => {
  for (const [status, expectedCalls, message] of [[429, 2, /rate-limiting/], [401, 1, /server API key/]]) {
    let calls = 0;
    await assert.rejects(generateInterviewFeedback("Candidate: A sample answer", "test", async () => {
      calls++;
      return Response.json({ error: { code: status } }, { status });
    }), message);
    assert.equal(calls, expectedCalls);
  }
});
