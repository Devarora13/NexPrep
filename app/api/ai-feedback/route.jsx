
import { NextResponse } from "next/server";
import { API_CONFIG, ERROR_MESSAGES } from '@/lib/constants';

function constructInterviewPrompt() {
    return `
You are a Senior Technical Interviewer.

You are reviewing a completed interview transcript.

Evaluate the candidate honestly and realistically.

Do not inflate scores.

Base every judgment only on what was actually said.

Return ONLY valid JSON.

{
  "feedback": {
    "overallScore": 0,

    "rating": {
      "technicalSkills": 0,
      "communication": 0,
      "problemSolving": 0,
      "experience": 0,
      "confidence": 0
    },

    "strengths": [
      "",
      "",
      ""
    ],

    "weaknesses": [
      "",
      "",
      ""
    ],

    "areasToImprove": [
      "",
      "",
      ""
    ],

    "summary": "",

    "recommendation": "",

    "recommendationMsg": ""
  }
}

Rules:

overallScore should be out of 100.

Each rating should be out of 10.

Only recommend "Hire" if the candidate genuinely performed well.

Be critical but constructive.

Never praise weak answers.

Mention specific examples from the interview whenever possible.

Do not return markdown.

Return JSON only.
`;
}
export async function POST(req) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const body = await req.json(); // Parse the request body
    if (!body?.conversation) {
      return NextResponse.json({ error: "Conversation data is required" }, { status: 400 });
    }

    const prompt = constructInterviewPrompt();
    
    const conversationString = typeof body.conversation === 'object' 
      ? JSON.stringify(body.conversation) 
      : body.conversation;  
    const finalprompt = prompt.replace("{{conversation}}", conversationString);
    // Final Prompt prepared
    
    // Call OpenRouter REST API
    const response = await fetch(`${API_CONFIG.OPENROUTER.BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: API_CONFIG.OPENROUTER.DEFAULT_MODEL,
        messages: [
          {
            role: "user",
            content: finalprompt
          }
        ],
        temperature: API_CONFIG.OPENROUTER.TEMPERATURE,
        max_tokens: API_CONFIG.GEMINI.MAX_TOKENS
      })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    let cleanedContent = data.choices[0].message.content;
    
    // Clean the response content
    cleanedContent = cleanedContent
      .replace(/```json\s*/g, "")
      .replace(/```\s*$/g, "")
      .replace(/```/g, "");
    
    try {
      const parsedJson = JSON.parse(cleanedContent);
      return NextResponse.json(parsedJson);
    } catch (e) {
      // Failed to parse JSON response
      return NextResponse.json({ error: "Invalid AI response format", cleanedContent }, { status: 500 });
    }

  } catch (error) {
    // Error during AI feedback generation
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  
}
