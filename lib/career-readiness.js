const skills = {
  javascript: ["javascript", "js"], typescript: ["typescript", "ts"],
  react: ["react", "react.js", "reactjs"], "next.js": ["next.js", "nextjs"],
  "node.js": ["node.js", "nodejs"], python: ["python"], java: ["java"],
  sql: ["sql"], postgresql: ["postgresql", "postgres"], mongodb: ["mongodb"],
  supabase: ["supabase"], aws: ["aws", "amazon web services"], docker: ["docker"],
  kubernetes: ["kubernetes", "k8s"], git: ["git"], html: ["html", "html5"],
  css: ["css", "css3"], tailwind: ["tailwind", "tailwindcss"], figma: ["figma"],
  api: ["api", "apis"], rest: ["rest", "restful"], "system design": ["system design"],
  "data structures": ["data structures"], algorithms: ["algorithm", "algorithms"],
  "c++": ["c++"], "c#": ["c#"], excel: ["excel"], tableau: ["tableau"],
  pandas: ["pandas"], "power bi": ["power bi"], "machine learning": ["machine learning"],
};

const patterns = Object.entries(skills).map(([name, aliases]) => {
  const tokens = aliases.map(alias => alias.replace(/[.*+?^$\x7b\x7d()|[\]\\]/g, "\\$&"));
  return [name, new RegExp("(?:^|[^a-z0-9+#])(?:" + tokens.join("|") + ")(?=$|[^a-z0-9+#])", "i")];
});

export const scoreWeights = { resume: 20, skillMatch: 25, assessment: 20, interview: 25, learning: 10 };

export function calculateReadiness(components = {}) {
  let coverage = 0;
  let total = 0;
  const result = {};
  for (const [key, weight] of Object.entries(scoreWeights)) {
    const value = components[key];
    result[key] = Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : null;
    if (result[key] !== null) {
      coverage += weight;
      total += weight * result[key];
    }
  }
  return { ...result, overall: coverage ? Math.round(total / coverage) : null, coverage };
}

export function createFallbackAnalysis({ resumeText, targetRole, jobDescription }) {
  const lines = resumeText.split(/[\r\n]+/).map(line => line.trim()).filter(Boolean);
  const detectedSkills = patterns.filter(([, pattern]) => pattern.test(resumeText)).map(([name]) => name);
  const required = patterns.filter(([, pattern]) => pattern.test(jobDescription)).map(([name]) => name);
  const matchedSkills = required.filter(skill => detectedSkills.includes(skill));
  const skillGaps = required.filter(skill => !detectedSkills.includes(skill));
  const evidence = {};
  const skillsWithoutExamples = [];
  for (const [skill, pattern] of patterns) {
    if (!matchedSkills.includes(skill)) continue;
    const mentions = lines.filter(line => pattern.test(line));
    const example = mentions.find(line => /\b(built|maintained|used|tested|developed|implemented|wrote|designed|created|deployed|analyzed)\b/i.test(line));
    evidence[skill] = example || mentions[0];
    if (!example) skillsWithoutExamples.push(skill);
  }
  const edits = lines.flatMap(line => {
    const revised = line.replace(/\bin order to\b/gi, "to").replace(/\butilized\b/g, "used").replace(/\bUtilized\b/g, "Used");
    return line === revised ? [] : [{ original: line, revised }];
  }).slice(0, 4);
  const checks = [
    { label: "Recognizable experience or project section", passed: /\b(experience|projects?|employment|internships?)\b/i.test(resumeText) },
    { label: "Education or qualifications section", passed: /\b(education|degrees?|qualifications?|bachelor|master)\b/i.test(resumeText) },
    { label: "Named tools or skills", passed: detectedSkills.length > 0 },
    { label: "Concrete action in a project or role", passed: /\b(built|tested|developed|analyzed|designed|implemented|maintained|led|created)\b/i.test(resumeText) },
    { label: "Quantified scope or outcome", passed: /\b\d+(?:\.\d+)?\s*(?:%|users?\b|hours?\b|minutes?\b|tests?\b|projects?\b|requests?\b|records?\b|members?\b)/i.test(resumeText) },
  ];
  const resume = checks.filter(check => check.passed).length * 20;
  const skillMatch = required.length ? 100 * matchedSkills.length / required.length : null;
  const priorityActions = checks.filter(check => !check.passed).map(check => "Review your resume for this signal: " + check.label.toLowerCase() + ". Include only details you can verify.");
  if (skillGaps.length) priorityActions.unshift("Practice " + skillGaps[0] + " and add an example after you have used it.");
  return {
    profileSummary: "Resume review for " + targetRole + ". " + (required.length ? matchedSkills.length + " of " + required.length + " recognized job-description skills appear in the resume." : "Paste a job description with named skills to measure alignment."),
    detectedSkills, matchedSkills, skillGaps, evidence, checks, edits, skillsWithoutExamples,
    strengths: checks.filter(check => check.passed).map(check => check.label),
    priorityActions,
    roadmap: [
      { title: "Review resume evidence", detail: "Check the cited lines and make your own contribution clear.", priority: "High" },
      { title: skillGaps[0] ? "Practice " + skillGaps[0] : "Validate a skill", detail: "Choose a learning resource and demonstrate the skill in a small project.", priority: "High" },
      { title: "Explain a project aloud", detail: "Use the target job description in a mock interview and review the recorded feedback.", priority: "Medium" },
    ],
    readinessScore: calculateReadiness({ resume, skillMatch }),
  };
}

export function isCareerAnalysis(value) {
  const strings = list => Array.isArray(list) && list.every(item => typeof item === "string");
  return typeof value?.profileSummary === "string" && strings(value.priorityActions) &&
    Array.isArray(value.roadmap) && value.roadmap.every(step =>
      ["title", "detail", "priority"].every(key => typeof step?.[key] === "string"));
}

export function applyInterviewScore(analysis, feedback) {
  if (!analysis || feedback?.source?.startsWith("fallback_")) return analysis;
  const ratings = Object.values(feedback?.rating || {}).filter(Number.isFinite);
  const score = Number.isFinite(feedback?.overallScore) ? feedback.overallScore :
    ratings.length ? 10 * ratings.reduce((a,b) => a+b, 0) / ratings.length : null;
  if (score === null) return analysis;
  return { ...analysis, readinessScore: calculateReadiness({ ...analysis.readinessScore, interview: score }) };
}

export function applyAssessmentScore(analysis, score) {
  if (!analysis || !Number.isFinite(score)) return analysis;
  return { ...analysis, readinessScore: calculateReadiness({ ...analysis.readinessScore, assessment: score }) };
}
