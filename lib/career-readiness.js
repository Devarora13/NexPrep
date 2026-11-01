const SKILL_LIBRARY = [
  "javascript",
  "typescript",
  "react",
  "next.js",
  "node.js",
  "python",
  "java",
  "sql",
  "postgresql",
  "mongodb",
  "supabase",
  "aws",
  "docker",
  "kubernetes",
  "git",
  "html",
  "css",
  "tailwind",
  "figma",
  "api",
  "rest",
  "system design",
  "data structures",
  "algorithms",
];

const normalize = (value = "") => value.toLowerCase().replace(/[^a-z0-9+#. ]/g, " ");

export function createFallbackAnalysis({ resumeText, targetRole, jobDescription }) {
  const source = normalize(`${resumeText} ${jobDescription}`);
  const resumeSource = normalize(resumeText);
  const roleWords = normalize(targetRole)
    .split(" ")
    .filter((word) => word.length > 3);
  const detectedSkills = SKILL_LIBRARY.filter((skill) => resumeSource.includes(skill));
  const roleSkills = SKILL_LIBRARY.filter(
    (skill) => source.includes(skill) || roleWords.some((word) => skill.includes(word)),
  );
  const matchedSkills = detectedSkills.filter((skill) => roleSkills.includes(skill));
  const skillGaps = roleSkills.filter((skill) => !detectedSkills.includes(skill)).slice(0, 6);
  const resumeScore = Math.min(100, 35 + Math.min(45, Math.floor(resumeText.trim().length / 35)));
  const matchScore = roleSkills.length
    ? Math.round((matchedSkills.length / roleSkills.length) * 100)
    : Math.min(75, 40 + detectedSkills.length * 5);
  const overall = Math.round(resumeScore * 0.45 + matchScore * 0.55);

  return {
    profileSummary: `Profile prepared for ${targetRole || "your target role"}. This initial analysis was generated locally; run AI analysis when an OpenRouter key is configured for deeper recommendations.`,
    detectedSkills,
    matchedSkills,
    skillGaps,
    strengths: detectedSkills.length
      ? [`Demonstrates experience with ${detectedSkills.slice(0, 3).join(", ")}.`, "Has a resume profile ready for targeted interview practice."]
      : ["Career profile has been created.", "A target role is defined for focused preparation."],
    priorityActions: [
      skillGaps[0]
        ? `Build or revise one project that demonstrates ${skillGaps[0]}.`
        : "Add quantified outcomes to your strongest project.",
      "Practice a role-specific AI mock interview and review the feedback.",
      "Update the resume with measurable impact, technologies, and ownership.",
    ],
    roadmap: [
      { title: "Strengthen your evidence", detail: "Improve your resume bullets with outcomes and concrete project decisions.", priority: "High" },
      { title: "Close the top skill gap", detail: skillGaps[0] ? `Practice ${skillGaps[0]} through a focused mini-project or assessment.` : "Practice the core skills listed in the target job description.", priority: "High" },
      { title: "Validate with an interview", detail: "Take a tailored mock interview and use the feedback to update this profile.", priority: "Medium" },
    ],
    readinessScore: { overall, resume: resumeScore, skillMatch: matchScore, interview: null },
  };
}

export function isCareerAnalysis(value) {
  return Boolean(
    value &&
      typeof value.profileSummary === "string" &&
      Array.isArray(value.detectedSkills) &&
      Array.isArray(value.matchedSkills) &&
      Array.isArray(value.skillGaps) &&
      Array.isArray(value.strengths) &&
      Array.isArray(value.priorityActions) &&
      Array.isArray(value.roadmap) &&
      Number.isFinite(value?.readinessScore?.overall),
  );
}

export function applyInterviewScore(analysis, feedback) {
  if (!analysis || typeof analysis !== "object") return analysis;
  const interviewScore = Number(feedback?.overallScore) || Math.round(
    Object.values(feedback?.rating || {}).filter(Number.isFinite).reduce((total, score, _, values) => total + score / values.length, 0) * 10,
  );
  if (!Number.isFinite(interviewScore) || interviewScore <= 0) return analysis;
  const readiness = analysis.readinessScore || {};
  const resume = Number(readiness.resume) || 0;
  const skillMatch = Number(readiness.skillMatch) || 0;
  const assessment = Number(readiness.assessment);
  const hasAssessment = Number.isFinite(assessment) && assessment > 0;
  const interview = Math.max(0, Math.min(100, Math.round(interviewScore)));
  const overall = hasAssessment
    ? Math.round(resume * 0.2 + skillMatch * 0.25 + interview * 0.3 + assessment * 0.25)
    : Math.round(resume * 0.25 + skillMatch * 0.35 + interview * 0.4);

  return {
    ...analysis,
    readinessScore: {
      ...readiness,
      interview,
      overall,
    },
  };
}

export function applyAssessmentScore(analysis, score) {
  if (!analysis || !Number.isFinite(score)) return analysis;
  const assessment = Math.max(0, Math.min(100, Math.round(score)));
  const readiness = analysis.readinessScore || {};
  const resume = Number(readiness.resume) || 0;
  const skillMatch = Number(readiness.skillMatch) || 0;
  const interview = Number(readiness.interview);
  const hasInterview = Number.isFinite(interview) && interview > 0;
  const overall = hasInterview
    ? Math.round(resume * 0.2 + skillMatch * 0.25 + interview * 0.3 + assessment * 0.25)
    : Math.round(resume * 0.3 + skillMatch * 0.4 + assessment * 0.3);
  return { ...analysis, readinessScore: { ...readiness, assessment, overall } };
}
