import express from "express";
import multer from "multer";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = 5000;

// Allow frontend requests
app.use(cors());

const genAI = new GoogleGenerativeAI("AIzaSyAKWoYNApR0Dd487a-eBh6-wWmdv23Qoco");

app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

    const pdfData = fs.readFileSync(req.file.path);
    const base64Data = pdfData.toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent([
      { inlineData: { mimeType: "application/pdf", data: base64Data } },
      { text: "Summarize this PDF like a boss 😎" },
    ]);

    res.json({ output: result.response.text() });
  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: "Gemini request failed" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
