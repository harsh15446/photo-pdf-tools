import { useState } from "react";
import { PDFDocument } from "pdf-lib";

function SplitPDF() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleFile = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      alert("Please PDF file select karein.");
      return;
    }

    try {
      const bytes = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);

      setFile(selectedFile);
      setPageCount(pdf.getPageCount());
      setSelectedPages([]);
      setDownloadUrl("");
    } catch (error) {
      console.error(error);
      alert("PDF open nahi ho paayi.");
    }
  };

  const togglePage = (pageNumber) => {
    setSelectedPages((current) => {
      if (current.includes(pageNumber)) {
        return current.filter((page) => page !== pageNumber);
      }

      return [...current, pageNumber].sort((a, b) => a - b);
    });

    setDownloadUrl("");
  };

  const selectAll = () => {
    const allPages = Array.from(
      { length: pageCount },
      (_, index) => index + 1
    );

    setSelectedPages(allPages);
    setDownloadUrl("");
  };

  const clearSelection = () => {
    setSelectedPages([]);
    setDownloadUrl("");
  };

  const createSplitPDF = async () => {
    if (!file) {
      alert("Pehle PDF select karein.");
      return;
    }

    if (selectedPages.length === 0) {
      alert("Kam se kam 1 page select karein.");
      return;
    }

    setLoading(true);
    setDownloadUrl("");

    try {
      const bytes = await file.arrayBuffer();

      const sourcePdf = await PDFDocument.load(bytes);
      const newPdf = await PDFDocument.create();

      const pageIndexes = selectedPages.map(
        (pageNumber) => pageNumber - 1
      );

      const copiedPages = await newPdf.copyPages(
        sourcePdf,
        pageIndexes
      );

      copiedPages.forEach((page) => {
        newPdf.addPage(page);
      });

      const pdfBytes = await newPdf.save();

      const blob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
    } catch (error) {
      console.error(error);
      alert("Split PDF create nahi ho paayi.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!downloadUrl) return;

    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = "split-pdf.pdf";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFile = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    setFile(null);
    setPageCount(0);
    setSelectedPages([]);
    setDownloadUrl("");
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
        ✂️ Split PDF
      </h2>

      <p style={{ color: "#64748b" }}>
        PDF ke selected pages ko ek nayi PDF mein nikalein.
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

      {file && (
        <div style={{ marginTop: "25px" }}>
          <div
            style={{
              padding: "18px",
              background: "#eff6ff",
              borderRadius: "12px",
              color: "#1e40af",
            }}
          >
            <strong>{file.name}</strong>
            <br />
            Total Pages: {pageCount}
          </div>

          <div
            style={{
              marginTop: "25px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={selectAll}
              style={{
                padding: "10px 16px",
                borderRadius: "9px",
                border: "none",
                background: "#2563eb",
                color: "#fff",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Select All
            </button>

            <button
              onClick={clearSelection}
              style={{
                padding: "10px 16px",
                borderRadius: "9px",
                border: "1px solid #cbd5e1",
                background: "#fff",
                color: "#475569",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Clear Selection
            </button>
          </div>

          <h3 style={{ marginTop: "28px" }}>
            Select Pages
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill,minmax(75px,1fr))",
              gap: "10px",
            }}
          >
            {Array.from(
              { length: pageCount },
              (_, index) => {
                const pageNumber = index + 1;
                const selected =
                  selectedPages.includes(pageNumber);

                return (
                  <button
                    key={pageNumber}
                    onClick={() => togglePage(pageNumber)}
                    style={{
                      padding: "15px 8px",
                      borderRadius: "10px",
                      border: selected
                        ? "2px solid #2563eb"
                        : "1px solid #cbd5e1",
                      background: selected
                        ? "#dbeafe"
                        : "#ffffff",
                      color: selected
                        ? "#1d4ed8"
                        : "#475569",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    {selected ? "✓ " : ""}
                    Page {pageNumber}
                  </button>
                );
              }
            )}
          </div>

          <div
            style={{
              marginTop: "25px",
              padding: "15px",
              background: "#f8fafc",
              borderRadius: "10px",
              color: "#475569",
            }}
          >
            Selected Pages:{" "}
            <strong>
              {selectedPages.length > 0
                ? selectedPages.join(", ")
                : "None"}
            </strong>
          </div>

          <button
            onClick={createSplitPDF}
            disabled={loading}
            style={{
              marginTop: "20px",
              padding: "13px 24px",
              borderRadius: "10px",
              border: "none",
              background: loading
                ? "#94a3b8"
                : "#16a34a",
              color: "#fff",
              fontWeight: "700",
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "Creating PDF..."
              : "✂️ Create Split PDF"}
          </button>

          {downloadUrl && (
            <div
              style={{
                marginTop: "25px",
                padding: "20px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "14px",
              }}
            >
              <h3 style={{ color: "#166534" }}>
                ✅ New PDF Ready
              </h3>

              <button
                onClick={downloadPDF}
                style={{
                  padding: "13px 22px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#16a34a",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                ⬇️ Download Split PDF
              </button>
            </div>
          )}

          <button
            onClick={clearFile}
            style={{
              marginTop: "20px",
              padding: "11px 18px",
              borderRadius: "9px",
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#475569",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Clear PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default SplitPDF;