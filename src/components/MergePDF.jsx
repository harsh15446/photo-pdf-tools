import { useState } from "react";
import { PDFDocument } from "pdf-lib";

function MergePDF() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mergedUrl, setMergedUrl] = useState("");

  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    const pdfFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf"
    );

    if (pdfFiles.length === 0) {
      alert("Please PDF files select karein.");
      return;
    }

    setFiles(pdfFiles);
    setMergedUrl("");
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      alert("Kam se kam 2 PDF files select karein.");
      return;
    }

    setLoading(true);
    setMergedUrl("");

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);

        const pages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );

        pages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      const mergedBytes = await mergedPdf.save();

      const blob = new Blob([mergedBytes], {
        type: "application/pdf",
      });

      setMergedUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error(error);
      alert("PDF merge nahi ho paayi.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!mergedUrl) return;

    const link = document.createElement("a");
    link.href = mergedUrl;
    link.download = "merged-pdf.pdf";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "30px",
        background: "#fff",
        borderRadius: "20px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>🔗 Merge PDF</h2>

      <p style={{ color: "#64748b" }}>
        Multiple PDF files ko ek single PDF mein merge karein.
      </p>

      <div
        style={{
          marginTop: "25px",
          padding: "25px",
          border: "2px dashed #cbd5e1",
          borderRadius: "16px",
          textAlign: "center",
          background: "#f8fafc",
        }}
      >
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFiles}
        />
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>Selected PDFs: {files.length}</h3>

          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              style={{
                padding: "14px",
                marginBottom: "10px",
                background: "#f8fafc",
                borderRadius: "10px",
              }}
            >
              📄 {index + 1}. {file.name}
            </div>
          ))}

          <button
            onClick={mergePDFs}
            disabled={loading}
            style={{
              marginTop: "15px",
              padding: "13px 24px",
              borderRadius: "10px",
              border: "none",
              background: loading ? "#94a3b8" : "#2563eb",
              color: "#fff",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Merging..." : "🔗 Merge PDFs"}
          </button>
        </div>
      )}

      {mergedUrl && (
        <div
          style={{
            marginTop: "30px",
            padding: "25px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "16px",
          }}
        >
          <h3 style={{ color: "#166534" }}>
            ✅ PDF Successfully Merged
          </h3>

          <button
            onClick={downloadPDF}
            style={{
              marginTop: "10px",
              padding: "13px 24px",
              borderRadius: "10px",
              border: "none",
              background: "#16a34a",
              color: "#fff",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ⬇️ Download Merged PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default MergePDF;