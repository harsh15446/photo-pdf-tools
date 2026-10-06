import { useState } from "react";

function PhotoCompressor() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [targetKB, setTargetKB] = useState(100);
  const [compressedUrl, setCompressedUrl] = useState("");
  const [compressedSize, setCompressedSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getBytes = (dataUrl) => {
    const base64 = dataUrl.split(",")[1];
    return Math.ceil((base64.length * 3) / 4);
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = reject;

      image.src = src;
    });
  };

  const canvasToDataUrl = (canvas, quality) => {
    return canvas.toDataURL("image/jpeg", quality);
  };

  const createCompressedImage = async (image, targetBytes) => {
    let width = image.naturalWidth;
    let height = image.naturalHeight;

    // Maximum starting dimension
    const MAX_START = 3000;

    if (Math.max(width, height) > MAX_START) {
      const scale = MAX_START / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    // Try progressively smaller dimensions
    for (let dimensionTry = 0; dimensionTry < 14; dimensionTry++) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));

      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // First check whether even low quality is small enough
      let low = 0.05;
      let high = 0.95;
      let bestData = null;
      let bestSize = Infinity;

      for (let i = 0; i < 12; i++) {
        const quality = (low + high) / 2;

        const dataUrl = canvasToDataUrl(canvas, quality);
        const size = getBytes(dataUrl);

        if (size <= targetBytes) {
          bestData = dataUrl;
          bestSize = size;

          // Try higher quality
          low = quality;
        } else {
          // Need more compression
          high = quality;
        }
      }

      // If we found something within target, return it
      if (bestData && bestSize <= targetBytes) {
        return {
          dataUrl: bestData,
          size: bestSize,
          width: canvas.width,
          height: canvas.height,
        };
      }

      // Reduce dimensions and try again
      width *= 0.82;
      height *= 0.82;
    }

    // Extremely difficult target:
    // make a final very small image
    const finalCanvas = document.createElement("canvas");

    finalCanvas.width = Math.max(1, Math.round(width));
    finalCanvas.height = Math.max(1, Math.round(height));

    const finalCtx = finalCanvas.getContext("2d");

    finalCtx.drawImage(
      image,
      0,
      0,
      finalCanvas.width,
      finalCanvas.height
    );

    const finalData = finalCanvas.toDataURL("image/jpeg", 0.05);

    return {
      dataUrl: finalData,
      size: getBytes(finalData),
      width: finalCanvas.width,
      height: finalCanvas.height,
    };
  };

  const handleFile = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please ek valid image select karein.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setCompressedUrl("");
    setCompressedSize(0);
    setError("");
  };

  const compressImage = async () => {
    if (!file || !preview) {
      setError("Pehle photo select karein.");
      return;
    }

    setLoading(true);
    setError("");
    setCompressedUrl("");
    setCompressedSize(0);

    try {
      const targetBytes = targetKB * 1024;

      const image = await loadImage(preview);

      const result = await createCompressedImage(
        image,
        targetBytes
      );

      setCompressedUrl(result.dataUrl);
      setCompressedSize(result.size);

      // If target was extremely difficult
      if (result.size > targetBytes) {
        setError(
          `Target bahut low hai. Best possible size ${(
            result.size / 1024
          ).toFixed(1)} KB mila.`
        );
      }
    } catch (err) {
      console.error(err);
      setError("Photo compress nahi ho paayi.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!compressedUrl) return;

    const link = document.createElement("a");

    link.href = compressedUrl;
    link.download = `compressed-${targetKB}KB.jpg`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatKB = (bytes) => {
    if (!bytes) return "0 KB";

    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const originalKB = file
    ? (file.size / 1024).toFixed(1)
    : null;

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "30px",
        background: "#ffffff",
        borderRadius: "20px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
      }}
    >
      <div style={{ marginBottom: "25px" }}>
        <h2
          style={{
            margin: "0 0 8px",
            fontSize: "30px",
          }}
        >
          📸 Photo to KB
        </h2>

        <p
          style={{
            margin: 0,
            color: "#64748b",
          }}
        >
          Kisi bhi photo ko apne required KB size mein compress karein.
        </p>
      </div>

      <div
        style={{
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
          onChange={handleFile}
        />
      </div>

      {file && (
        <div style={{ marginTop: "30px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(200px,1fr))",
              gap: "15px",
            }}
          >
            <div
              style={{
                padding: "18px",
                background: "#f8fafc",
                borderRadius: "12px",
              }}
            >
              <small style={{ color: "#64748b" }}>
                Original Size
              </small>

              <strong
                style={{
                  display: "block",
                  marginTop: "5px",
                  fontSize: "20px",
                }}
              >
                {originalKB} KB
              </strong>
            </div>

            <div
              style={{
                padding: "18px",
                background: "#eff6ff",
                borderRadius: "12px",
              }}
            >
              <small style={{ color: "#64748b" }}>
                Target Size
              </small>

              <strong
                style={{
                  display: "block",
                  marginTop: "5px",
                  fontSize: "20px",
                  color: "#2563eb",
                }}
              >
                {targetKB} KB
              </strong>
            </div>
          </div>

          {preview && (
            <div style={{ marginTop: "25px", textAlign: "center" }}>
              <img
                src={preview}
                alt="Original preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "350px",
                  borderRadius: "14px",
                  objectFit: "contain",
                }}
              />
            </div>
          )}

          <div
            style={{
              marginTop: "25px",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <label>
              <strong>Target KB:</strong>
            </label>

            <select
              value={targetKB}
              onChange={(e) =>
                setTargetKB(Number(e.target.value))
              }
              style={{
                padding: "11px 14px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                background: "white",
                fontSize: "15px",
              }}
            >
              <option value={10}>10 KB</option>
              <option value={20}>20 KB</option>
              <option value={30}>30 KB</option>
              <option value={50}>50 KB</option>
              <option value={75}>75 KB</option>
              <option value={100}>100 KB</option>
              <option value={150}>150 KB</option>
              <option value={200}>200 KB</option>
              <option value={300}>300 KB</option>
              <option value={500}>500 KB</option>
            </select>

            <button
              onClick={compressImage}
              disabled={loading}
              style={{
                padding: "12px 22px",
                borderRadius: "10px",
                border: "none",
                background: loading
                  ? "#94a3b8"
                  : "#2563eb",
                color: "white",
                fontWeight: "700",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {loading
                ? "Compressing..."
                : "Compress Photo"}
            </button>
          </div>

          {error && (
            <p
              style={{
                marginTop: "18px",
                padding: "12px",
                borderRadius: "10px",
                background: "#fff7ed",
                color: "#c2410c",
              }}
            >
              ⚠️ {error}
            </p>
          )}
        </div>
      )}

      {compressedUrl && (
        <div
          style={{
            marginTop: "35px",
            padding: "25px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "16px",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              color: "#166534",
            }}
          >
            ✅ Compressed Photo Ready
          </h3>

          <p>
            Final Size:{" "}
            <strong>{formatKB(compressedSize)}</strong>
          </p>

          <img
            src={compressedUrl}
            alt="Compressed preview"
            style={{
              maxWidth: "100%",
              maxHeight: "350px",
              borderRadius: "12px",
              objectFit: "contain",
            }}
          />

          <br />

          <button
            onClick={downloadImage}
            style={{
              marginTop: "20px",
              padding: "13px 22px",
              borderRadius: "10px",
              border: "none",
              background: "#16a34a",
              color: "white",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ⬇️ Download Photo
          </button>
        </div>
      )}
    </div>
  );
}

export default PhotoCompressor;