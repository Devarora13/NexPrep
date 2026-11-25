
import { NextResponse } from "next/server";
import { generateInterviewFeedback, FeedbackServiceError } from "@/lib/interview-feedback";
import { createClient } from "@supabase/supabase-js";

function formatConversation(conversation) {
  if (typeof conversation === "string") {
    return conversation.trim();
  }

  if (!Array.isArray(conversation)) {
    return "";
  }

  return conversation
    .map((message) => {
      if (!message || typeof message !== "object") return "";

      const content = String(
        message.content ?? message.text ?? message.transcript ?? "",
      ).trim();
      if (!content) return "";

      const role = String(message.role ?? message.speaker ?? "unknown");
      return `${role}: ${content}`;
    })
    .filter(Boolean)
    .join("\n");
}

export async function POST(req) {
  try {
    const authorization = req.headers.get("authorization");
    const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      },
    );
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user?.email) {
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 });
    }

    const body = await req.json();
    const interviewId = body?.interviewId;
    if (!interviewId) {
      return NextResponse.json({ error: "Interview ID is required" }, { status: 400 });
    }

    const { data: interview, error: interviewError } = await supabase
      .from("InterviewDetails")
      .select("user_email")
      .eq("interview_id", interviewId)
      .maybeSingle();

    if (interviewError) {
      throw interviewError;
    }
    if (!interview || interview.user_email !== user.email) {
      return NextResponse.json({ error: "Interview access denied" }, { status: 403 });
    }

    const transcript = formatConversation(body?.conversation);
    if (!transcript) {
      return NextResponse.json(
        { error: "A non-empty interview transcript is required" },
        { status: 400 },
      );
    }

    const review = await generateInterviewFeedback(transcript, process.env.OPENROUTER_API_KEY);
    return NextResponse.json(review);
  } catch (error) {
    if (error instanceof FeedbackServiceError) {
      console.warn("Interview feedback unavailable", { status: error.status, reason: error.message });
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not verify the interview or process the review. Try again." }, { status: 500 });
  }
}
