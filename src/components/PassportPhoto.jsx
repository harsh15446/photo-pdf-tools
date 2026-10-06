import { useState } from "react";

function PassportPhoto() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");

  const handleFile = (e) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      alert("Please valid photo select karein.");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult("");
  };

  const createPassportPhoto = () => {
    if (!file || !preview) {
      alert("Pehle photo select karein.");
      return;
    }

    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");

      // 35 × 45 mm passport photo
      // 300 DPI equivalent
      canvas.width = 413;
      canvas.height = 531;

      const ctx = canvas.getContext("2d");

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const imageRatio = image.width / image.height;
      const targetRatio = canvas.width / canvas.height;

      let drawWidth;
      let drawHeight;
      let x;
      let y;

      if (imageRatio > targetRatio) {
        drawHeight = canvas.height;
        drawWidth = drawHeight * imageRatio;
        x = (canvas.width - drawWidth) / 2;
        y = 0;
      } else {
        drawWidth = canvas.width;
        drawHeight = drawWidth / imageRatio;
        x = 0;
        y = (canvas.height - drawHeight) / 2;
      }

      ctx.drawImage(
        image,
        x,
        y,
        drawWidth,
        drawHeight
      );

      const dataUrl = canvas.toDataURL(
        "image/jpeg",
        0.92
      );

      setResult(dataUrl);
    };

    image.src = preview;
  };

  const downloadPhoto = () => {
    if (!result) return;

    const link = document.createElement("a");

    link.href = result;
    link.download = "passport-size-photo.jpg";

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
        🪪 Passport Size Photo
      </h2>

      <p style={{ color: "#64748b" }}>
        Apni photo upload karke passport-size photo banayein.
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

      {preview && (
        <div
          style={{
            marginTop: "30px",
            textAlign: "center",
          }}
        >
          <h3>Original Photo</h3>

          <img
            src={preview}
            alt="Original"
            style={{
              maxWidth: "100%",
              maxHeight: "350px",
              borderRadius: "12px",
              objectFit: "contain",
            }}
          />

          <br />

          <button
            onClick={createPassportPhoto}
            style={{
              marginTop: "20px",
              padding: "13px 24px",
              borderRadius: "10px",
              border: "none",
              background: "#2563eb",
              color: "#fff",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            🪪 Create Passport Photo
          </button>
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: "35px",
            padding: "25px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <h3 style={{ color: "#166534" }}>
            ✅ Passport Photo Ready
          </h3>

          <p style={{ color: "#64748b" }}>
            Size: 35 × 45 mm
          </p>

          <img
            src={result}
            alt="Passport"
            style={{
              width: "207px",
              height: "266px",
              objectFit: "cover",
              border: "1px solid #ddd",
              background: "#fff",
            }}
          />

          <br />

          <button
            onClick={downloadPhoto}
            style={{
              marginTop: "20px",
              padding: "13px 24px",
              borderRadius: "10px",
              border: "none",
              background: "#16a34a",
              color: "#fff",
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

export default PassportPhoto;