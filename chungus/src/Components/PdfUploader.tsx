import { useState } from "react";

export default function PdfUploader() {
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!templateFile || !dataFile) return alert("Both PDFs are required! 🕶️");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("template", templateFile);
      formData.append("data", dataFile);

      // Send PDF to your backend server
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setOutput(data.output);
        setDownloadUrl(data.downloadUrl ?? null);
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
    <div className="uploader">
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setTemplateFile(e.target.files?.[0] ?? null)}
        className="file-input"
      />
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setDataFile(e.target.files?.[0] ?? null)}
        className="file-input"
      />

      <button
        onClick={handleUpload}
        disabled={!templateFile || !dataFile || loading}
        className="primary-btn"
      >
        {loading ? "Processing... 🌀" : "Generate Proposal🚀"}
      </button>

      <div className="output-box">
        <h2 className="output-title">Output 💬</h2>
        <pre className="output-content">{output}</pre>
        {downloadUrl ? (
          <div style={{ marginTop: 12 }}>
            <a
              className="primary-btn"
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download PDF
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
