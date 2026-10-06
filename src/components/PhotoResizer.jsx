import { useState } from "react";

function PhotoResizer() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [keepRatio, setKeepRatio] = useState(true);
  const [resizedUrl, setResizedUrl] = useState("");
  const [resizedSize, setResizedSize] = useState(0);

  const handleFile = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      alert("Please ek valid image select karein.");
      return;
    }

    const imageUrl = URL.createObjectURL(selectedFile);
    const image = new Image();

    image.onload = () => {
      setFile(selectedFile);
      setPreview(imageUrl);

      setOriginalWidth(image.naturalWidth);
      setOriginalHeight(image.naturalHeight);

      setWidth(image.naturalWidth);
      setHeight(image.naturalHeight);

      setResizedUrl("");
      setResizedSize(0);
    };

    image.src = imageUrl;
  };

  const handleWidthChange = (value) => {
    const newWidth = Number(value);

    setWidth(newWidth);

    if (keepRatio && originalWidth && originalHeight) {
      const newHeight = Math.round(
        (newWidth * originalHeight) / originalWidth
      );

      setHeight(newHeight);
    }
  };

  const handleHeightChange = (value) => {
    const newHeight = Number(value);

    setHeight(newHeight);

    if (keepRatio && originalWidth && originalHeight) {
      const newWidth = Math.round(
        (newHeight * originalWidth) / originalHeight
      );

      setWidth(newWidth);
    }
  };

  const resizePhoto = () => {
    if (!file || !preview) {
      alert("Pehle photo select karein.");
      return;
    }

    if (!width || !height || width <= 0 || height <= 0) {
      alert("Width aur Height sahi enter karein.");
      return;
    }

    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = Number(width);
      canvas.height = Number(height);

      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        image,
        0,
        0,
        Number(width),
        Number(height)
      );

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

      const base64 = dataUrl.split(",")[1];
      const bytes = Math.ceil((base64.length * 3) / 4);

      setResizedUrl(dataUrl);
      setResizedSize(bytes);
    };

    image.src = preview;
  };

  const downloadPhoto = () => {
    if (!resizedUrl) return;

    const link = document.createElement("a");

    link.href = resizedUrl;
    link.download = `resized-${width}x${height}.jpg`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatKB = (bytes) => {
    if (!bytes) return "0 KB";

    return `${(bytes / 1024).toFixed(1)} KB`;
  };

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
      <h2
        style={{
          margin: "0 0 8px",
          fontSize: "30px",
        }}
      >
        🖼️ Photo Resize
      </h2>

      <p style={{ color: "#64748b" }}>
        Photo ki width aur height apne hisaab se change karein.
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
          onChange={handleFile}
        />
      </div>

      {file && (
        <div style={{ marginTop: "30px" }}>
          <div
            style={{
              padding: "18px",
              background: "#f8fafc",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            <strong>Original Dimensions</strong>

            <div
              style={{
                marginTop: "5px",
                fontSize: "20px",
                color: "#2563eb",
              }}
            >
              {originalWidth} × {originalHeight} px
            </div>
          </div>

          {preview && (
            <div
              style={{
                textAlign: "center",
                marginBottom: "25px",
              }}
            >
              <img
                src={preview}
                alt="Original"
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
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(180px,1fr))",
              gap: "15px",
            }}
          >
            <div>
              <label>
                <strong>Width (px)</strong>
              </label>

              <input
                type="number"
                min="1"
                value={width}
                onChange={(e) =>
                  handleWidthChange(e.target.value)
                }
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "16px",
                }}
              />
            </div>

            <div>
              <label>
                <strong>Height (px)</strong>
              </label>

              <input
                type="number"
                min="1"
                value={height}
                onChange={(e) =>
                  handleHeightChange(e.target.value)
                }
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "16px",
                }}
              />
            </div>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "18px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={keepRatio}
              onChange={(e) => {
                const checked = e.target.checked;

                setKeepRatio(checked);

                if (
                  checked &&
                  originalWidth &&
                  originalHeight
                ) {
                  const newHeight = Math.round(
                    (Number(width) * originalHeight) /
                      originalWidth
                  );

                  setHeight(newHeight);
                }
              }}
            />

            Maintain aspect ratio
          </label>

          <button
            onClick={resizePhoto}
            style={{
              marginTop: "25px",
              padding: "13px 22px",
              borderRadius: "10px",
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Resize Photo
          </button>
        </div>
      )}

      {resizedUrl && (
        <div
          style={{
            marginTop: "35px",
            padding: "25px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "16px",
          }}
        >
          <h3 style={{ color: "#166534" }}>
            ✅ Resized Photo Ready
          </h3>

          <p>
            New Dimensions:{" "}
            <strong>
              {width} × {height} px
            </strong>
          </p>

          <p>
            New Size:{" "}
            <strong>{formatKB(resizedSize)}</strong>
          </p>

          <img
            src={resizedUrl}
            alt="Resized"
            style={{
              maxWidth: "100%",
              maxHeight: "350px",
              borderRadius: "12px",
            }}
          />

          <br />

          <button
            onClick={downloadPhoto}
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

export default PhotoResizer;