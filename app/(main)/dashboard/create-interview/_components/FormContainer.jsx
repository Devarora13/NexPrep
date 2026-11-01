"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUp, Loader2, Sparkles, Brain, CheckCircle2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/app/provider";
import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";

// Updated to single form layout with VERITUS Career Profile integration
function FormContainer({ formData, updateFormData, errors = {} }) {
  const data = formData || {};
  const updateData = updateFormData || (() => {});
  const { user } = useUser();
  const [resumeName, setResumeName] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [careerProfile, setCareerProfile] = useState(null);

  useEffect(() => {
    const userEmail = user?.email;
    if (!userEmail) return;

    supabase
      .from("CareerProfiles")
      .select("target_role, job_description, resume_text, analysis")
      .eq("user_email", userEmail)
      .maybeSingle()
      .then(({ data: profile, error }) => {
        if (!error && profile) {
          setCareerProfile(profile);
          if (profile.resume_text) {
            setResumeName("Profile Resume (Linked)");
          }
        }
      });
  }, [user?.email]);

  const handleAutofillFromProfile = () => {
    if (!careerProfile) return;
    if (careerProfile.target_role) {
      updateData("jobPosition", careerProfile.target_role);
    }
    if (careerProfile.job_description) {
      updateData("jobDescription", careerProfile.job_description);
    }
    toast.success("Form pre-filled from your VERITUS Career Profile!");
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Please sign in to upload your resume.");

      const uploadData = new FormData();
      uploadData.append("resume", file);

      const response = await fetch("/api/resume-extract", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to extract resume text");
      }

      setResumeName(payload.fileName);
      toast.success("Resume parsed successfully! It will be used by your AI Interviewer.");

      // If user has no career profile yet, create a baseline profile so the interviewer uses it
      if (user?.email) {
        await supabase
          .from("CareerProfiles")
          .upsert(
            {
              user_email: user.email,
              target_role: data.jobPosition || "Software Engineer",
              job_description: data.jobDescription || "",
              resume_text: payload.resumeText,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_email" }
          );
      }
    } catch (err) {
      toast.error(err.message || "Could not read resume file.");
    } finally {
      setIsExtracting(false);
      event.target.value = "";
    }
  };

  // Helper function to display error message
  const ErrorMessage = ({ field }) => {
    if (!errors[field]) return null;
    return <p className="text-red-500 text-sm mt-1">{errors[field]}</p>;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Create Your Interview
        </h2>
        <p className="text-gray-600">
          Fill in the essential details below to generate customized interview questions
        </p>
      </div>

      {/* VERITUS Career Profile Auto-Fill Banner */}
      {careerProfile && (
        <div className="mb-6 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-600 p-2 text-white">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">VERITUS Profile Found</p>
              <h4 className="font-semibold text-gray-900">{careerProfile.target_role}</h4>
              <p className="text-xs text-gray-600">
                Readiness: {careerProfile?.analysis?.readinessScore?.overall || 0}/100
                {careerProfile?.analysis?.matchedSkills?.length ? ` · ${careerProfile.analysis.matchedSkills.length} verified skills` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutofillFromProfile}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-700 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Auto-fill from Profile
            </button>
            <Link
              href="/dashboard/career-profile"
              className="rounded-lg border border-indigo-200 px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-white transition"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      )}

      {/* Single Form with Essential Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Position */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Job Position *</h3>
          <Input
            placeholder="e.g., Frontend Developer, Data Scientist, Product Manager"
            value={data.jobPosition || ""}
            onChange={(e) => updateData("jobPosition", e.target.value)}
            className={errors.jobPosition ? "border-red-500" : ""}
          />
          <ErrorMessage field="jobPosition" />
        </div>

        {/* Real resume upload with text extraction */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Resume (Optional)</h3>
          <label className="flex h-12 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm transition-colors hover:bg-gray-50">
            <span className={resumeName ? "truncate text-gray-800 font-medium" : "text-muted-foreground"}>
              {isExtracting ? "Extracting resume text..." : resumeName || "Upload resume (PDF, DOCX, TXT) to tailor the interview"}
            </span>
            <span className="ml-4 inline-flex shrink-0 items-center gap-2 font-medium text-primary">
              {isExtracting ? (
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              ) : (
                <FileUp size={16} aria-hidden="true" />
              )}
              {resumeName ? "Change" : "Upload"}
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="sr-only"
              disabled={isExtracting}
              onChange={handleResumeUpload}
            />
          </label>
          <p className="mt-1 text-xs text-gray-500">
            {resumeName
              ? "✓ Resume loaded. Your AI Interviewer will adapt its questions to your projects and skills."
              : "Upload a PDF, DOCX, or TXT file to automatically align the interview with your background."}
          </p>
        </div>

        {/* Interview Type */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Interview Type *</h3>
          <Select
            value={data.interviewType || ""}
            onValueChange={(value) => updateData("interviewType", value)}
          >
            <SelectTrigger
              className={`w-full ${errors.interviewType ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select Interview Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Technical">Technical</SelectItem>
              <SelectItem value="Behavioral">Behavioral</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="System Design">System Design</SelectItem>
            </SelectContent>
          </Select>
          <ErrorMessage field="interviewType" />
        </div>

        {/* Experience Level */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Experience Level *</h3>
          <Select
            value={data.experienceLevel || ""}
            onValueChange={(value) => updateData("experienceLevel", value)}
          >
            <SelectTrigger
              className={`w-full ${errors.experienceLevel ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select Experience Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
              <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
              <SelectItem value="senior">Senior Level (5-8 years)</SelectItem>
              <SelectItem value="expert">Expert Level (8+ years)</SelectItem>
            </SelectContent>
          </Select>
          <ErrorMessage field="experienceLevel" />
        </div>

        {/* Interview Duration */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Interview Duration *</h3>
          <Select
            value={data.interviewDuration || ""}
            onValueChange={(value) => updateData("interviewDuration", value)}
          >
            <SelectTrigger
              className={`w-full ${errors.interviewDuration ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5 Min">5 minutes</SelectItem>
              <SelectItem value="15 Min">15 minutes</SelectItem>
              <SelectItem value="30 Min">30 minutes</SelectItem>
              <SelectItem value="45 Min">45 minutes</SelectItem>
              <SelectItem value="60 Min">1 hour</SelectItem>
            </SelectContent>
          </Select>
          <ErrorMessage field="interviewDuration" />
        </div>

        {/* Job Description */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Job Description *</h3>
          <Textarea
            placeholder="Briefly describe the role, key responsibilities, and main requirements..."
            className={`min-h-[120px] ${errors.jobDescription ? "border-red-500" : ""}`}
            value={data.jobDescription || ""}
            onChange={(e) => updateData("jobDescription", e.target.value)}
          />
          <ErrorMessage field="jobDescription" />
        </div>

        {/* Difficulty Level */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Difficulty Level *</h3>
          <div
            className={`grid grid-cols-3 gap-4 ${errors.difficultyLevel ? "border border-red-500 p-3 rounded-md" : ""}`}
          >
            {["Easy", "Medium", "Hard"].map((level) => (
              <div
                key={level}
                className={`border rounded-lg p-4 text-center cursor-pointer transition-all hover:scale-105
                  ${
                    data.difficultyLevel === level
                      ? "bg-primary/10 border-primary shadow-md"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                onClick={() => updateData("difficultyLevel", level)}
              >
                <div
                  className={`font-semibold ${data.difficultyLevel === level ? "text-primary" : "text-gray-700"}`}
                >
                  {level}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {level === "Easy" && "Basic concepts"}
                  {level === "Medium" && "Intermediate skills"}
                  {level === "Hard" && "Advanced topics"}
                </div>
              </div>
            ))}
          </div>
          <ErrorMessage field="difficultyLevel" />
        </div>
      </div>

      {/* Summary Section */}
      {(data.jobPosition || data.experienceLevel || data.interviewDuration) && (
        <div className="mt-8 pt-6 border-t border-gray-200 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Interview Preview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {data.jobPosition && (
              <div>
                <span className="font-medium text-gray-600">Position:</span>
                <p className="text-gray-800">{data.jobPosition}</p>
              </div>
            )}
            {data.interviewType && (
              <div>
                <span className="font-medium text-gray-600">Type:</span>
                <p className="text-gray-800">{data.interviewType}</p>
              </div>
            )}
            {data.experienceLevel && (
              <div>
                <span className="font-medium text-gray-600">Level:</span>
                <p className="text-gray-800">
                  {
                    {
                      entry: "Entry Level",
                      mid: "Mid Level",
                      senior: "Senior Level",
                      expert: "Expert Level",
                    }[data.experienceLevel]
                  }
                </p>
              </div>
            )}
            {data.interviewDuration && (
              <div>
                <span className="font-medium text-gray-600">Duration:</span>
                <p className="text-gray-800">{data.interviewDuration}</p>
              </div>
            )}
            {data.difficultyLevel && (
              <div>
                <span className="font-medium text-gray-600">Difficulty:</span>
                <p className="text-gray-800">{data.difficultyLevel}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion Status */}
      {data.jobPosition &&
        data.interviewType &&
        data.experienceLevel &&
        data.interviewDuration &&
        data.jobDescription &&
        data.difficultyLevel && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">
                All required fields completed! Ready to create your interview.
              </span>
            </div>
          </div>
        )}
    </div>
  );
}

export default FormContainer;