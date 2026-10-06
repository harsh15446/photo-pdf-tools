import { useState } from "react";
import { PDFDocument } from "pdf-lib";

function PhotosToPDF() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    const images = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (images.length === 0) {
      alert("Please photos select karein.");
      return;
    }

    setFiles(images);
    setPdfUrl("");
  };

  const createPDF = async () => {
    if (files.length === 0) {
      alert("Pehle photos select karein.");
      return;
    }

    setLoading(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();

        let image;

        if (file.type === "image/png") {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          image = await pdfDoc.embedJpg(arrayBuffer);
        }

        const page = pdfDoc.addPage([
          image.width,
          image.height,
        ]);

        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      setPdfUrl(url);
    } catch (error) {
      console.error(error);
      alert("PDF create nahi ho paayi.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");

    link.href = pdfUrl;
    link.download = "photos-to-pdf.pdf";

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
      <h2 style={{ marginTop: 0 }}>
        🖼️ Photos to PDF
      </h2>

      <p style={{ color: "#64748b" }}>
        Multiple photos select karke ek PDF banayein.
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
          accept="image/*"
          multiple
          onChange={handleFiles}
        />
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>
            Selected Photos: {files.length}
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill,minmax(130px,1fr))",
              gap: "15px",
            }}
          >
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                style={{
                  padding: "10px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  style={{
                    width: "100%",
                    height: "130px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />

                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "12px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {index + 1}. {file.name}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={createPDF}
            disabled={loading}
            style={{
              marginTop: "25px",
              padding: "13px 24px",
              borderRadius: "10px",
              border: "none",
              background: loading ? "#94a3b8" : "#2563eb",
              color: "#fff",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? "Creating PDF..."
              : "📄 Create PDF"}
          </button>
        </div>
      )}

      {pdfUrl && (
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
            ✅ PDF Ready
          </h3>

          <p>
            {files.length} photos successfully PDF mein
            convert ho gayi hain.
          </p>

          <button
            onClick={downloadPDF}
            style={{
              padding: "13px 24px",
              borderRadius: "10px",
              border: "none",
              background: "#16a34a",
              color: "#fff",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ⬇️ Download PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default PhotosToPDF;