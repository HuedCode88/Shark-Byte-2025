import { useState } from "react";

export default function PdfUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpload = async () => {
    if (!file) return alert("Pick a PDF first! 🕶️");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);

      // Send PDF to your backend server
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setOutput(data.output);
      } else {
        throw new Error(data.error || "Unknown server error");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Upload failed, check console!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">PDF → Gemini Demo ⚡</h1>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="mb-3"
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
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
