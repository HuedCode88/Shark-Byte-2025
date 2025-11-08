import { useState } from "react";

export default function PdfUploader() {
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpload = async () => {
    if (!templateFile || !dataFile) return alert("Both PDFs are required! 🕶️");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("template", templateFile);
      formData.append("data", dataFile);

      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) setOutput(data.output);
      else throw new Error(data.error || "Unknown server error");
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Upload failed, check console!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Dual PDF → Gemini Demo ⚡</h1>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setTemplateFile(e.target.files?.[0] ?? null)}
        className="mb-2"
      />
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setDataFile(e.target.files?.[0] ?? null)}
        className="mb-3"
      />
      <button
        onClick={handleUpload}
        disabled={!templateFile || !dataFile || loading}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? "Processing... 🌀" : "Send to Gemini 🚀"}
      </button>

      <div className="mt-6 w-full max-w-2xl bg-gray-100 p-4 rounded-lg shadow">
        <h2 className="font-semibold mb-2">Output 💬</h2>
        <pre className="whitespace-pre-wrap">{output}</pre>
      </div>
    </div>
  );
}
