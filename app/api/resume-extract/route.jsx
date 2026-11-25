import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

async function getAuthenticatedUser(request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );
  const { data: { user } } = await supabase.auth.getUser(token);
  return user || null;
}

export async function POST(request) {
  try {
    if (!(await getAuthenticatedUser(request))) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const formData = await request.formData();
    const file = formData.get("resume");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a PDF, DOCX, or TXT resume first." }, { status: 400 });
    if (file.size === 0 || file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "Resume files must be between 1 byte and 5 MB." }, { status: 400 });

    const name = file.name.toLowerCase();
    const bytes = await file.arrayBuffer();
    let text = "";
    if (name.endsWith(".pdf")) {
      // PDF.js expects typed-array slice semantics. Node Buffer.slice returns a view.
      text = (await pdfParse(new Uint8Array(bytes))).text;
    } else if (name.endsWith(".docx")) {
      text = (await mammoth.extractRawText({ buffer: Buffer.from(bytes) })).value;
    } else if (name.endsWith(".txt")) {
      text = new TextDecoder().decode(bytes);
    } else {
      return NextResponse.json({ error: "Only PDF, DOCX, and TXT resumes are supported." }, { status: 400 });
    }

    const resumeText = text.replace(/\u0000/g, " ").replace(/\s{3,}/g, "\n\n").trim();
    if (resumeText.length < 80) return NextResponse.json({ error: "We could not extract enough text from this file. Paste the resume text instead." }, { status: 422 });
    return NextResponse.json({ resumeText: resumeText.slice(0, 30000), fileName: file.name });
  } catch {
    return NextResponse.json({ error: "We could not read this resume. Try a text-based PDF, DOCX, or TXT file." }, { status: 422 });
  }
}
