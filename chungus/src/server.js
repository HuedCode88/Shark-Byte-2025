import express from "express";
import multer from "multer";
import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = 5000;

app.use(cors());

// Initialize Gemini client (demo-only)
const genAI = new GoogleGenerativeAI("AIzaSyAKWoYNApR0Dd487a-eBh6-wWmdv23Qoco");

app.post("/upload", upload.fields([
  { name: "template", maxCount: 1 },
  { name: "data", maxCount: 1 }
]), async (req, res) => {
  try {
    const templateFile = req.files?.["template"]?.[0];
    const dataFile = req.files?.["data"]?.[0];

    if (!templateFile || !dataFile) 
      return res.status(400).json({ error: "Both template and data PDFs are required" });

    const templateBase64 = fs.readFileSync(templateFile.path).toString("base64");
    const dataBase64 = fs.readFileSync(dataFile.path).toString("base64");

     const prompt = `
System Role (optional, if supported):
You are an expert proposal engineer and technical writer specializing in grant automation. Your task is to generate a complete, professional grant proposal that perfectly aligns with the given Request for Proposal (RFP) and follows the structure, tone, and formatting of the provided Proposal Template.

User Input:

You are given two documents:

RFP Document: Describes the grant opportunity, goals, eligibility, requirements, evaluation criteria, submission format, and deadlines.

Proposal Template: Provides the expected structure, sections, and formatting style for the proposal (e.g., Executive Summary, Objectives, Methodology, Budget, Team, Impact).

Your Task:

Analyze the RFP to identify and extract:

Core goals and objectives of the grant

Eligibility and compliance requirements

Evaluation criteria

Deliverables, timeline, and budget expectations

Preferred tone, language, or terminology

Use the Proposal Template as a strict structural guide.

Fill in each section with well-written, contextually relevant, and persuasive content derived from the RFP.

Maintain a professional, confident, and grant-ready tone.

Ensure factual consistency and logical alignment with the RFP requirements.

Output Format:

Return a single, well-formatted document that follows the template’s section order.

Use headings and subheadings exactly as they appear in the template. The only exception being that the final document will make no mention of being a template. Everything stated in the final document will be in an official, final capacity. 

Ensure the output is clean, submission-ready, and free of placeholders or generic filler text. Do not say the word Template. 

Also, do not introduce the document, no need for pleasantries such as "this is the completed grant proposal" or anything of the sort. 

Do not say the word template. 

Additional Goals (for automation scoring):

Maximize alignment between proposal objectives and RFP priorities.

Maintain consistent style, tense, and clarity.

Include measurable outcomes and success indicators where relevant.

Avoid redundancy and ensure flow between sections.
      `;








    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent([
      { inlineData: { mimeType: "application/pdf", data: templateBase64 } },
      { inlineData: { mimeType: "application/pdf", data: dataBase64 } },
      { text: prompt}
    ]);

    const outputText = result.response.text();

    // create a PDF from the outputText and return a download URL
    try {
      const filename = `reply-${Date.now()}-${crypto.randomUUID()}.pdf`;
      const tempDir = os.tmpdir();
      const tempPath = path.join(tempDir, filename);

      // generate PDF using pdfkit
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const stream = fs.createWriteStream(tempPath);
      doc.pipe(stream);

      // optional heading
      doc.fontSize(16).text("Generated reply", { align: "left" });
      doc.moveDown();

      // write the main text with simple wrapping
      doc.fontSize(11).text(outputText, { lineGap: 4 });

      doc.end();

      // wait for stream to finish
      await new Promise((resolve, reject) => {
        stream.on("finish", resolve);
        stream.on("error", reject);
      });

      // schedule deletion after TTL (5 minutes)
      const TTL_MS = 5 * 60 * 1000;
      setTimeout(() => {
        try { fs.unlinkSync(tempPath); } catch (e) { /* ignore */ }
      }, TTL_MS);

      const downloadUrl = `${req.protocol}://${req.get('host')}/temp/${encodeURIComponent(filename)}`;
      res.json({ output: outputText, downloadUrl });
    } catch (fileErr) {
      console.warn("Could not write PDF file, returning inline output", fileErr?.message || fileErr);
      res.json({ output: outputText });
    }
  } catch (err) {
    console.error("🔥 Backend Upload Error:", err);
    res.status(500).json({ error: "Gemini request failed" });
  }
});

// Serve temp reply files from OS temp directory. Validate filename to avoid path traversal.
app.get('/temp/:name', (req, res) => {
  const name = req.params.name;
  if (!/^[a-zA-Z0-9._\-]+$/.test(name)) return res.status(400).send('Invalid filename');
  const filepath = path.join(os.tmpdir(), name);
  if (!fs.existsSync(filepath)) return res.status(404).send('Not found');
  res.download(filepath, name, (err) => {
    if (err) {
      console.warn('Error sending temp file', err);
    } else {
      // optional: delete after successful download
      try { fs.unlinkSync(filepath); } catch (e) { /* ignore */ }
    }
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
