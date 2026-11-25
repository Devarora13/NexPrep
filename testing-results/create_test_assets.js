const fs = require('fs');
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

// 1. Create a valid TXT resume
const txtContent = `Dev Arora
Software Engineer & Full Stack Developer
Email: dev.test@example.com | Location: New Delhi, India

Summary:
Passionate Software Engineer with hands-on experience in building modern web applications, scalable APIs, and applied AI systems. Proficient in React, Next.js, TypeScript, Node.js, and PostgreSQL.

Core Skills:
- Programming: JavaScript, TypeScript, Python, SQL, HTML, CSS
- Frameworks & Libraries: React, Next.js, Tailwind CSS, Express
- Databases & Cloud: PostgreSQL, Supabase, MongoDB, Git, Docker, REST APIs
- Software Engineering: Data Structures, Algorithms, System Design

Education:
B.Tech in Computer Science and Technology (2023 - 2027)
Maharaja Agrasen Institute of Technology (MAIT), CGPA: 8.8

Projects:
1. VERITUS - Career Intelligence & Mock Interview Platform (Next.js, Supabase, Vapi AI)
   - Built an end-to-end placement readiness system with resume parsing and real-time voice interviews.
   - Designed AI feedback pipeline achieving structured performance metrics.
2. Cloud Task Manager (React, Node.js, PostgreSQL)
   - Developed real-time collaborative task board with JWT auth and REST endpoints.
`;

fs.writeFileSync('testing-results/test_resume.txt', txtContent, 'utf8');
console.log('Created test_resume.txt');

// 2. Create a valid PDF resume
const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 170 >>
stream
BT
/F1 12 Tf
70 700 Td
(Dev Arora - Full Stack Engineer specializing in React, Next.js, Node.js, TypeScript, PostgreSQL, and Git.) Tj
0 -20 Td
(Experience with building REST APIs, Supabase databases, and algorithmic problem solving.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000464 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
535
%%EOF`;

const pdfBuf = Buffer.from(pdfContent, 'utf-8');
fs.writeFileSync('testing-results/test_resume.pdf', pdfBuf);
console.log('Created test_resume.pdf');

// 3. Create an invalid file (e.g. fake image file with .png extension)
fs.writeFileSync('testing-results/invalid_file.png', Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
console.log('Created invalid_file.png');

// 4. Create an oversized TXT file (> 5 MB)
const largeChunk = 'A'.repeat(1024 * 1024); // 1 MB
const oversizedBuf = Buffer.concat([
  Buffer.from(largeChunk),
  Buffer.from(largeChunk),
  Buffer.from(largeChunk),
  Buffer.from(largeChunk),
  Buffer.from(largeChunk),
  Buffer.from(largeChunk), // 6 MB total
]);
fs.writeFileSync('testing-results/oversized_resume.txt', oversizedBuf);
console.log('Created oversized_resume.txt (size: ' + oversizedBuf.length + ' bytes)');

// 5. Create a valid DOCX resume
const JSZip = require('jszip');
const mammoth = require('mammoth');

const zip = new JSZip();
zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
zip.file('word/document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Dev Arora - Full Stack Engineer. Skills include React, Node.js, Next.js, TypeScript, SQL, Docker, Supabase, Git, System Design, REST APIs.</w:t></w:r></w:p></w:body></w:document>');

zip.generateAsync({ type: 'nodebuffer' }).then(buf => {
  fs.writeFileSync('testing-results/test_resume.docx', buf);
  mammoth.extractRawText({ buffer: buf }).then(res => {
    console.log('Created test_resume.docx and verified extraction:', JSON.stringify(res.value.trim()));
  });
});
