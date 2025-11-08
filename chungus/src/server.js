import express from "express";
import multer from "multer";
import fs from "fs";
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

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent([
      { inlineData: { mimeType: "application/pdf", data: templateBase64 } },
      { inlineData: { mimeType: "application/pdf", data: dataBase64 } },
      { text: "Mimic the style of the first PDF and summarize content from the second PDF." }
    ]);

    res.json({ output: result.response.text() });
  } catch (err) {
    console.error("🔥 Backend Upload Error:", err);
    res.status(500).json({ error: "Gemini request failed" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
