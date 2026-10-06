import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function PDFToJPG() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFile = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      alert("Please PDF file select karein.");
      return;
    }

    setFile(selectedFile);
    setPages([]);
    setLoading(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;

      const renderedPages = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);

        const viewport = page.getViewport({
          scale: 1.5,
        });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        renderedPages.push({
          pageNumber,
          url: canvas.toDataURL("image/jpeg", 0.92),
        });
      }

      setPages(renderedPages);
    } catch (error) {
      console.error(error);
      alert("PDF convert nahi ho paayi.");
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadJPG = (url, pageNumber) => {
    const link = document.createElement("a");

    link.href = url;
    link.download = `page-${pageNumber}.jpg`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFile = () => {
    setFile(null);
    setPages([]);
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "40px auto",
        padding: "30px",
        background: "#ffffff",
        borderRadius: "20px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>
        🖼️ PDF to JPG
      </h2>

      <p style={{ color: "#64748b" }}>
        PDF ke pages ko high-quality JPG images mein convert karein.
      </p>

      <div
        style={{
          marginTop: "25px",
          padding: "28px",
          border: "2px dashed #cbd5e1",
          borderRadius: "16px",
          textAlign: "center",
          background: "#f8fafc",
        }}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFile}
        />
      </div>

      {loading && (
        <div
          style={{
            marginTop: "25px",
            padding: "18px",
            background: "#eff6ff",
            borderRadius: "12px",
            color: "#2563eb",
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          ⏳ PDF pages convert ho rahe hain...
        </div>
      )}

      {file && !loading && pages.length > 0 && (
        <>
          <div
            style={{
              marginTop: "25px",
              padding: "18px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "12px",
              color: "#166534",
              fontWeight: "700",
            }}
          >
            ✅ {file.name} — {pages.length} page
            {pages.length > 1 ? "s" : ""} converted
          </div>

          <div
            style={{
              marginTop: "25px",
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(250px,1fr))",
              gap: "20px",
            }}
          >
            {pages.map((page) => (
              <div
                key={page.pageNumber}
                style={{
                  padding: "15px",
                  background: "#f8fafc",
                  borderRadius: "15px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <h3 style={{ marginTop: 0 }}>
                  Page {page.pageNumber}
                </h3>

                <img
                  src={page.url}
                  alt={`Page ${page.pageNumber}`}
                  style={{
                    width: "100%",
                    display: "block",
                    borderRadius: "8px",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                  }}
                />

                <button
                  onClick={() =>
                    downloadJPG(
                      page.url,
                      page.pageNumber
                    )
                  }
                  style={{
                    width: "100%",
                    marginTop: "12px",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  ⬇️ Download JPG
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={clearFile}
            style={{
              marginTop: "25px",
              padding: "12px 20px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#475569",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Clear PDF
          </button>
        </>
      )}
    </div>
  );
}

export default PDFToJPG;