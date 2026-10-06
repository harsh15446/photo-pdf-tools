import { useState } from "react";
import { PDFDocument } from "pdf-lib";

function PhotosOnOnePage() {
  const [files, setFiles] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [layout, setLayout] = useState(4);
  const [orientation, setOrientation] = useState("portrait");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) return;

    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      alert("Please image files select karein.");
      return;
    }

    const limitedFiles = imageFiles.slice(0, 8);

    setFiles(limitedFiles);
    setPreviewUrl("");

    const imagePromises = limitedFiles.map((file) => {
      return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
          resolve({
            file,
            url,
            width: image.naturalWidth,
            height: image.naturalHeight,
          });
        };

        image.src = url;
      });
    });

    Promise.all(imagePromises).then((results) => {
      setPhotos(results);
    });
  };

  const getLayout = () => {
    if (layout === 2) {
      return {
        rows: 2,
        cols: 1,
      };
    }

    if (layout === 3) {
      return {
        rows: 3,
        cols: 1,
      };
    }

    if (layout === 4) {
      return {
        rows: 2,
        cols: 2,
      };
    }

    if (layout === 6) {
      return {
        rows: 3,
        cols: 2,
      };
    }

    return {
      rows: 4,
      cols: 2,
    };
  };

  const createCanvas = async () => {
    if (photos.length === 0) {
      alert("Pehle photos select karein.");
      return null;
    }

    const pageWidth =
      orientation === "portrait" ? 2480 : 3508;

    const pageHeight =
      orientation === "portrait" ? 3508 : 2480;

    const canvas = document.createElement("canvas");

    canvas.width = pageWidth;
    canvas.height = pageHeight;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageWidth, pageHeight);

    const { rows, cols } = getLayout();

    const margin = 80;
    const gap = 35;

    const usableWidth =
      pageWidth - margin * 2;

    const usableHeight =
      pageHeight - margin * 2;

    const cellWidth =
      (usableWidth - gap * (cols - 1)) / cols;

    const cellHeight =
      (usableHeight - gap * (rows - 1)) / rows;

    for (let i = 0; i < Math.min(photos.length, rows * cols); i++) {
      const photo = photos[i];

      const image = new Image();

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = photo.url;
      });

      const scale = Math.min(
        cellWidth / image.naturalWidth,
        cellHeight / image.naturalHeight
      );

      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;

      const row = Math.floor(i / cols);
      const col = i % cols;

      const x =
        margin +
        col * (cellWidth + gap) +
        (cellWidth - drawWidth) / 2;

      const y =
        margin +
        row * (cellHeight + gap) +
        (cellHeight - drawHeight) / 2;

      ctx.drawImage(
        image,
        x,
        y,
        drawWidth,
        drawHeight
      );
    }

    return canvas;
  };

  const generatePreview = async () => {
    setLoading(true);

    try {
      const canvas = await createCanvas();

      if (!canvas) return;

      const url = canvas.toDataURL(
        "image/jpeg",
        0.92
      );

      setPreviewUrl(url);
    } catch (error) {
      console.error(error);
      alert("Page create nahi ho paaya.");
    } finally {
      setLoading(false);
    }
  };

  const downloadJPG = async () => {
    const canvas = await createCanvas();

    if (!canvas) return;

    const url = canvas.toDataURL(
      "image/jpeg",
      0.92
    );

    const link = document.createElement("a");

    link.href = url;
    link.download = "photos-one-page.jpg";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = async () => {
    setLoading(true);

    try {
      const canvas = await createCanvas();

      if (!canvas) return;

      const jpgDataUrl = canvas.toDataURL(
        "image/jpeg",
        0.92
      );

      const pdfDoc = await PDFDocument.create();

      const pageWidth =
        orientation === "portrait"
          ? 595.28
          : 841.89;

      const pageHeight =
        orientation === "portrait"
          ? 841.89
          : 595.28;

      const page = pdfDoc.addPage([
        pageWidth,
        pageHeight,
      ]);

      const jpgImage =
        await pdfDoc.embedJpg(jpgDataUrl);

      page.drawImage(jpgImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "photos-one-page.pdf";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("PDF create nahi ho paayi.");
    } finally {
      setLoading(false);
    }
  };

  const clearPhotos = () => {
    photos.forEach((photo) => {
      URL.revokeObjectURL(photo.url);
    });

    setFiles([]);
    setPhotos([]);
    setPreviewUrl("");
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
        boxShadow:
          "0 10px 30px rgba(15,23,42,0.06)",
      }}
    >
      <div>
        <h2
          style={{
            margin: "0 0 8px",
            fontSize: "30px",
          }}
        >
          🖼️ Photos on One Page
        </h2>

        <p
          style={{
            margin: 0,
            color: "#64748b",
          }}
        >
          Multiple photos ko ek A4 page par arrange karein.
        </p>
      </div>

      {/* FILE SELECT */}

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
          accept="image/*"
          multiple
          onChange={handleFiles}
        />

        <p
          style={{
            margin: "12px 0 0",
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          Maximum 8 photos select karein.
        </p>
      </div>

      {files.length > 0 && (
        <>
          {/* SELECTED PHOTOS */}

          <div
            style={{
              marginTop: "25px",
              padding: "20px",
              background: "#f8fafc",
              borderRadius: "14px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              Selected Photos: {files.length}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(130px,1fr))",
                gap: "12px",
              }}
            >
              {photos.map((photo, index) => (
                <div
                  key={`${photo.file.name}-${index}`}
                  style={{
                    background: "#ffffff",
                    borderRadius: "10px",
                    padding: "8px",
                    border:
                      "1px solid #e5e7eb",
                  }}
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100px",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                  />

                  <div
                    style={{
                      marginTop: "5px",
                      fontSize: "12px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {index + 1}. {photo.file.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OPTIONS */}

          <div
            style={{
              marginTop: "25px",
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(200px,1fr))",
              gap: "18px",
            }}
          >
            <div>
              <label>
                <strong>Photos Per Page</strong>
              </label>

              <select
                value={layout}
                onChange={(e) =>
                  setLayout(Number(e.target.value))
                }
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "12px",
                  borderRadius: "10px",
                  border:
                    "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "15px",
                }}
              >
                <option value={2}>
                  2 Photos
                </option>

                <option value={3}>
                  3 Photos
                </option>

                <option value={4}>
                  4 Photos
                </option>

                <option value={6}>
                  6 Photos
                </option>

                <option value={8}>
                  8 Photos
                </option>
              </select>
            </div>

            <div>
              <label>
                <strong>Page Orientation</strong>
              </label>

              <select
                value={orientation}
                onChange={(e) =>
                  setOrientation(e.target.value)
                }
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "12px",
                  borderRadius: "10px",
                  border:
                    "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "15px",
                }}
              >
                <option value="portrait">
                  A4 Portrait
                </option>

                <option value="landscape">
                  A4 Landscape
                </option>
              </select>
            </div>
          </div>

          {/* BUTTONS */}

          <div
            style={{
              marginTop: "25px",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={generatePreview}
              disabled={loading}
              style={{
                padding: "13px 22px",
                borderRadius: "10px",
                border: "none",
                background: "#2563eb",
                color: "#ffffff",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              {loading
                ? "Creating..."
                : "👁️ Preview Page"}
            </button>

            <button
              onClick={downloadJPG}
              disabled={loading}
              style={{
                padding: "13px 22px",
                borderRadius: "10px",
                border: "none",
                background: "#0f766e",
                color: "#ffffff",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              🖼️ Download JPG
            </button>

            <button
              onClick={downloadPDF}
              disabled={loading}
              style={{
                padding: "13px 22px",
                borderRadius: "10px",
                border: "none",
                background: "#16a34a",
                color: "#ffffff",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              📄 Download PDF
            </button>

            <button
              onClick={clearPhotos}
              style={{
                padding: "13px 22px",
                borderRadius: "10px",
                border:
                  "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#475569",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>

          {/* PREVIEW */}

          {previewUrl && (
            <div
              style={{
                marginTop: "30px",
                padding: "20px",
                background: "#f8fafc",
                borderRadius: "16px",
                textAlign: "center",
              }}
            >
              <h3>
                ✅ One Page Preview
              </h3>

              <img
                src={previewUrl}
                alt="One page preview"
                style={{
                  width: "100%",
                  maxWidth: "700px",
                  borderRadius: "10px",
                  border:
                    "1px solid #dbe2ea",
                  boxShadow:
                    "0 10px 30px rgba(15,23,42,0.12)",
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PhotosOnOnePage;