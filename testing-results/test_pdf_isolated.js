const fs = require('fs');
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

function makeValidPdf(text) {
  const header = '%PDF-1.4\n';
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const stream = 'BT /F1 12 Tf 70 700 Td (' + text + ') Tj ET';
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n';
  const obj4 = '4 0 obj\n<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream\nendobj\n';
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';

  let off = header.length;
  const off1 = off; off += obj1.length;
  const off2 = off; off += obj2.length;
  const off3 = off; off += obj3.length;
  const off4 = off; off += obj4.length;
  const off5 = off; off += obj5.length;

  const pad = (n) => String(n).padStart(10, '0') + ' 00000 n \n';
  const xref = 'xref\n0 6\n0000000000 65535 f \n' + pad(off1) + pad(off2) + pad(off3) + pad(off4) + pad(off5);
  const trailer = 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + off + '\n%%EOF';
  return Buffer.from(header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer, 'latin1');
}

async function test() {
  const buf = makeValidPdf('Dev Arora - Full Stack Engineer specializing in React, Next.js, Node.js, TypeScript, PostgreSQL, and Git.');
  fs.writeFileSync('testing-results/test_resume.pdf', buf);
  console.log('Buffer length:', buf.length);
  const res = await pdfParse(buf);
  console.log('Result text length:', res.text.length, 'Content:', JSON.stringify(res.text.trim()));
}

test().catch(e => console.error('Caught:', e));

