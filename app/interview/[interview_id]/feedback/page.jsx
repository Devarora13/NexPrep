"use client";
import { supabase } from "@/services/supabaseClient";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Star, CheckCircle, XCircle, ArrowLeft, Download } from "lucide-react";

function Feedback() {
  const { interview_id } = useParams();
  const router = useRouter();
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const saveReview = useCallback(async (review) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("PostInterview").update({ interview_review: review })
        .eq("interview_id", interview_id).select("interview_id").single();
      if (error) throw error;
      setSaveError("");
    } catch {
      setSaveError("Your report is ready. Saving to interview history failed. Keep this page open and retry saving.");
    } finally {
      setSaving(false);
    }
  }, [interview_id]);
  const autoStarted = useRef(null);
  const retryReview = useCallback(async () => {
    setRetrying(true); setRetryError("");
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("Sign in again to retry.");
      const conversation = feedbackData.interview_review.transcript;
      const response = await fetch("/api/ai-feedback", { method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + data.session.access_token },
        body: JSON.stringify({ conversation, interviewId: interview_id }) });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.feedback) {
        throw new Error(payload?.error || `Feedback request failed (HTTP ${response.status}).`);
      }
      const review = { ...payload, transcript: conversation };
      setFeedbackData({ ...feedbackData, interview_review: review });
      await saveReview(review);
    } catch (err) { setRetryError(err.message); }
    finally { setRetrying(false); }
  }, [feedbackData, interview_id, saveReview]);

  useEffect(() => {
    const review = feedbackData?.interview_review;
    if (feedbackData?.interview_id !== interview_id || review?.feedback?.source !== "fallback_generation_error" ||
        !review.transcript?.length || autoStarted.current === interview_id) return;
    autoStarted.current = interview_id;
    void retryReview();
  }, [feedbackData, interview_id, retryReview]);

  const getFeedback = async () => {
    try {
      setLoading(true);
      setError(null);

      let { data, error } = await supabase
        .from("PostInterview")
        .select("interview_id, interview_review")
        .eq("interview_id", interview_id)
        .maybeSingle();

      if (error) {
        // Supabase error occurred
        if (error.code === "PGRST116") {
          setError("Multiple feedback entries found. Please contact support.");
        } else {
          setError(`Database error: ${error.message || "Unknown error"}`);
        }
        return;
      }

      // Handle the array response from limit(1)
      const feedbackEntry = data; // maybeSingle returns single object, not array

      if (feedbackEntry && feedbackEntry.interview_review) {
        // Parse the interview_review JSON if it's a string
        const reviewData =
          typeof feedbackEntry.interview_review === "string"
            ? JSON.parse(feedbackEntry.interview_review)
            : feedbackEntry.interview_review;

        setFeedbackData({
          ...feedbackEntry,
          interview_review: reviewData,
        });
      } else {
        setError("No feedback data found");
      }
    } catch (err) {
      // Error fetching feedback
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (interview_id) {
      getFeedback();
    }
  }, [interview_id]);

  const renderStars = (rating) => {
    return Array.from({ length: 10 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const getRecommendationColor = (recommendation) => {
    return recommendation?.toLowerCase() === "hire"
      ? "text-green-500"
      : "text-red-500";
  };

  const getRecommendationIcon = (recommendation) => {
    return recommendation?.toLowerCase() === "hire" ? (
      <CheckCircle className="w-6 h-6 text-green-500" />
    ) : (
      <XCircle className="w-6 h-6 text-red-500" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-white">Loading your feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md text-center">
          <div className="text-red-500 mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-red-500/20">
            <XCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">
            Feedback Not Available
          </h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null);
                getFeedback();
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const feedback =
    feedbackData?.interview_review?.feedback || feedbackData?.interview_review;

  if (feedback?.source?.startsWith("fallback_")) {
    const canRetry = feedback.source === "fallback_generation_error" && feedbackData.interview_review.transcript?.length > 0;
    return <main className="mx-auto max-w-xl space-y-4 p-8">
      <h1 className="text-2xl font-bold">{canRetry ? "Interview recap" : "No candidate response to score"}</h1>
      <p role="status">{canRetry ? (retrying ? "Generating your AI feedback from these saved answers…" : "Your answers are saved. AI ratings are currently unavailable.") : "No performance rating is available. Check microphone access before the next interview."}</p>
      {canRetry && !retrying && !retryError && feedbackData.interview_review.error && <p className="text-sm text-slate-600">{feedbackData.interview_review.error}</p>}
      {canRetry && Array.isArray(feedbackData.interview_review.transcript) && <details open>
        <summary className="cursor-pointer underline">Read saved transcript</summary>
        {feedbackData.interview_review.transcript.map((turn, i) => <p className="mt-2" key={i}>
          <strong>{["user", "candidate"].includes(turn?.role) ? "Candidate" : "Interviewer"}</strong> · {turn?.content || turn?.text || turn?.transcript}
        </p>)}
      </details>}
      {canRetry && <button disabled={retrying} onClick={retryReview} className="rounded-lg bg-indigo-700 px-4 py-2 text-white">{retrying ? "Generating…" : "Generate feedback again"}</button>}
      {retryError && <p role="alert">{retryError}</p>}
      <button onClick={() => router.push("/dashboard")} className="block underline">Return to dashboard</button>
    </main>;
  }
  if (!feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md text-center">
          <p className="text-gray-300">No feedback data available</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold">Interview Feedback</h1>
          <button onClick={() => window.print()} className="flex items-center text-gray-300 hover:text-white transition-colors">
            <Download className="w-5 h-5 mr-2" />
            Download Report
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {saveError && <div role="alert" className="mb-4 rounded-lg bg-amber-100 p-4 text-amber-950">
          <p>{saveError}</p>
          <button disabled={saving} onClick={() => saveReview(feedbackData.interview_review)} className="mt-2 underline">
            {saving ? "Saving…" : "Retry saving report"}
          </button>
        </div>}
        {/* Overall Result */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/feedback.jpg"
                alt="Feedback"
                width={80}
                height={80}
                className="rounded-full mr-4"
              />
              <div>
                <h2 className="text-2xl font-bold mb-2">Interview Complete!</h2>
                <p className="text-gray-300">
                  Here's your detailed performance feedback
                </p>
              </div>
            </div>
            {feedback.recommendation && <div className="text-center">
              {getRecommendationIcon(feedback.recommendation)}
              <p
                className={`text-xl font-bold mt-2 ${getRecommendationColor(feedback.recommendation)}`}
              >
                {feedback.recommendation || "N/A"}
              </p>
            </div>}
          </div>
        </div>

        {/* Ratings Section */}
        {feedback.rating ? <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Performance Ratings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedback.rating &&
              Object.entries(feedback.rating).map(([skill, rating]) => (
                <div key={skill} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium capitalize">
                      {skill.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {rating}/10
                    </span>
                  </div>
                  <div className="flex space-x-1">{renderStars(rating)}</div>
                </div>
              ))}
          </div>
        </div> : <p className="mb-6">The AI provided written coaching. Numeric ratings are unavailable for this review.</p>}

        {/* Summary Section */}
        {/* Overall Score */}
        {Number.isFinite(feedback.overallScore) && <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Overall Score</h3>

          <div className="text-5xl font-bold text-primary">
            {feedback.overallScore ?? "N/A"} / 100
          </div>
        </div>}

        {/* Strengths */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Strengths</h3>

          {feedback.strengths?.length ? (
            <ul className="list-disc ml-5 space-y-2 text-gray-200">
              {feedback.strengths.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No strengths available.</p>
          )}
        </div>

        {/* Areas to Improve */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Areas to Improve</h3>

          {feedback.areasToImprove?.length ? (
            <ul className="list-disc ml-5 space-y-2 text-gray-200">
              {feedback.areasToImprove.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">
              No improvement suggestions available.
            </p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Weaknesses</h3>

          {feedback.weaknesses?.length ? (
            <ul className="list-disc ml-5 space-y-2 text-gray-200">
              {feedback.weaknesses.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No weaknesses listed in this review.</p>
          )}
        </div>

        {/* Performance Summary */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Performance Summary</h3>

          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-200 leading-relaxed">
              {feedback.summary || "No summary available"}
            </p>
          </div>
        </div>

        {/* Recommendation Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Final Recommendation</h3>
          <div className="bg-gray-700 p-4 rounded-lg">
            {feedback.recommendation && <div className="flex items-center mb-3">
              {getRecommendationIcon(feedback.recommendation)}
              <span
                className={`ml-3 text-lg font-bold ${getRecommendationColor(feedback.recommendation)}`}
              >
                {feedback.recommendation || "N/A"}
              </span>
            </div>}
            <p className="text-gray-200">
              {feedback.recommendationMsg ||
                "No recommendation message available"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Print Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

export default Feedback;
