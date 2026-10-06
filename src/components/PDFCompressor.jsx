import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function PDFCompressor() {
  const [file, setFile] = useState(null);
  const [targetValue, setTargetValue] = useState("");
  const [targetUnit, setTargetUnit] = useState("MB");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState(null);

  const handleFile = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      alert("Please PDF file select karein.");
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setProgress("");
  };

  const getTargetBytes = () => {
    const value = Number(targetValue);

    if (!value || value <= 0) {
      return 0;
    }

    if (targetUnit === "KB") {
      return value * 1024;
    }

    if (targetUnit === "MB") {
      return value * 1024 * 1024;
    }

    return value * 1024 * 1024 * 1024;
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  /*
   * PDF page ko render karta hai.
   *
   * Important:
   * Scale high rakha gaya hai taaki text/detail
   * unnecessarily blur na ho.
   */
  const renderPage = async (page, scale) => {
    const viewport = page.getViewport({
      scale,
    });

    const canvas = document.createElement("canvas");

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    const context = canvas.getContext("2d", {
      alpha: false,
      willReadFrequently: false,
    });

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.fillStyle = "#ffffff";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    await page.render({
      canvasContext: context,
      viewport,
      intent: "print",
    }).promise;

    return {
      canvas,
      width: viewport.width,
      height: viewport.height,
    };
  };

  /*
   * New PDF create karta hai.
   *
   * Quality-first approach:
   * - high render scale
   * - high JPEG quality
   * - gradually compression
   */
  const createCompressedPDF = async (
    pages,
    scale,
    quality
  ) => {
    const newPdf = await PDFDocument.create();

    for (let i = 0; i < pages.length; i++) {
      setProgress(
        `Page ${i + 1} / ${pages.length} process ho raha hai...`
      );

      const page = pages[i];

      const originalViewport =
        page.getViewport({
          scale: 1,
        });

      const rendered = await renderPage(
        page,
        scale
      );

      /*
       * JPEG quality high rakhi gayi hai.
       */
      const imageData =
        rendered.canvas.toDataURL(
          "image/jpeg",
          quality
        );

      const jpgImage =
        await newPdf.embedJpg(
          imageData
        );

      /*
       * Original PDF ka physical page size
       * preserve karte hain.
       */
      const pageWidth =
        originalViewport.width * 0.75;

      const pageHeight =
        originalViewport.height * 0.75;

      const newPage =
        newPdf.addPage([
          pageWidth,
          pageHeight,
        ]);

      newPage.drawImage(jpgImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });

      /*
       * Browser memory release.
       */
      rendered.canvas.width = 1;
      rendered.canvas.height = 1;
    }

    const bytes = await newPdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    return new Blob([bytes], {
      type: "application/pdf",
    });
  };

  const compressPDF = async () => {
    if (!file) {
      alert("Pehle PDF select karein.");
      return;
    }

    const targetBytes =
      getTargetBytes();

    if (!targetBytes) {
      alert("Valid target size enter karein.");
      return;
    }

    if (targetBytes >= file.size) {
      alert(
        "Target size original PDF se chhota hona chahiye."
      );
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      setProgress(
        "PDF read ho rahi hai..."
      );

      const originalBytes =
        await file.arrayBuffer();

      const pdf =
        await pdfjsLib.getDocument({
          data: originalBytes,
        }).promise;

      const pages = [];

      for (
        let i = 1;
        i <= pdf.numPages;
        i++
      ) {
        pages.push(
          await pdf.getPage(i)
        );
      }

      /*
       * QUALITY FIRST
       *
       * Pehle high quality try hogi.
       * Sirf target achieve na hone par
       * gradually compression badhegi.
       */
      const attempts = [
        {
          scale: 2.0,
          quality: 0.95,
        },
        {
          scale: 1.85,
          quality: 0.93,
        },
        {
          scale: 1.70,
          quality: 0.91,
        },
        {
          scale: 1.55,
          quality: 0.89,
        },
        {
          scale: 1.40,
          quality: 0.87,
        },
        {
          scale: 1.30,
          quality: 0.84,
        },
        {
          scale: 1.20,
          quality: 0.81,
        },
        {
          scale: 1.10,
          quality: 0.78,
        },
        {
          scale: 1.00,
          quality: 0.75,
        },
        {
          scale: 0.90,
          quality: 0.70,
        },
        {
          scale: 0.80,
          quality: 0.65,
        },
        {
          scale: 0.70,
          quality: 0.60,
        },
      ];

      let bestBlob = null;
      let bestDifference =
        Infinity;

      let bestSettings = null;

      for (
        let i = 0;
        i < attempts.length;
        i++
      ) {
        const settings =
          attempts[i];

        setProgress(
          `Quality ${i + 1}/${attempts.length} try ho rahi hai...`
        );

        const blob =
          await createCompressedPDF(
            pages,
            settings.scale,
            settings.quality
          );

        const difference =
          Math.abs(
            blob.size -
              targetBytes
          );

        /*
         * Sabse close result save karo.
         */
        if (
          difference <
          bestDifference
        ) {
          bestDifference =
            difference;

          bestBlob = blob;

          bestSettings =
            settings;
        }

        /*
         * Target achieve ho gaya.
         * Isse lower quality par nahi jayenge.
         */
        if (
          blob.size <=
          targetBytes
        ) {
          break;
        }
      }

      if (!bestBlob) {
        throw new Error(
          "PDF compression failed."
        );
      }

      const url =
        URL.createObjectURL(
          bestBlob
        );

      const reduction =
        ((file.size -
          bestBlob.size) /
          file.size) *
        100;

      setResult({
        url,
        originalSize:
          file.size,
        targetSize:
          targetBytes,
        compressedSize:
          bestBlob.size,
        reduction:
          Math.max(
            0,
            reduction
          ),
        targetReached:
          bestBlob.size <=
          targetBytes,
        scale:
          bestSettings.scale,
        quality:
          bestSettings.quality,
      });

      setProgress("");
    } catch (error) {
      console.error(error);

      alert(
        "PDF compress nahi ho paayi. Bahut large PDF hone par browser memory issue ho sakta hai."
      );

      setProgress("");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!result?.url) {
      return;
    }

    const link =
      document.createElement("a");

    link.href = result.url;

    link.download =
      "compressed-pdf.pdf";

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );
  };

  const clearAll = () => {
    if (result?.url) {
      URL.revokeObjectURL(
        result.url
      );
    }

    setFile(null);
    setTargetValue("");
    setTargetUnit("MB");
    setResult(null);
    setProgress("");
  };

  return (
    <div
      style={{
        maxWidth: "950px",
        margin: "40px auto",
        padding: "30px",
        background: "#ffffff",
        borderRadius: "20px",
        border:
          "1px solid #e5e7eb",
        boxShadow:
          "0 10px 30px rgba(15,23,42,0.06)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
        }}
      >
        📄 PDF Compressor
      </h2>

      <p
        style={{
          color: "#64748b",
        }}
      >
        PDF ka size kam karein
        aur clarity ko maximum
        possible rakhein.
      </p>

      <div
        style={{
          marginTop: "25px",
          padding: "28px",
          border:
            "2px dashed #cbd5e1",
          borderRadius: "16px",
          textAlign: "center",
          background:
            "#f8fafc",
        }}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFile}
        />
      </div>

      {file && (
        <>
          <div
            style={{
              marginTop: "25px",
              padding: "18px",
              background:
                "#eff6ff",
              borderRadius:
                "12px",
            }}
          >
            <strong>
              Selected PDF
            </strong>

            <div
              style={{
                marginTop: "6px",
                color:
                  "#475569",
                wordBreak:
                  "break-word",
              }}
            >
              {file.name}
            </div>

            <div
              style={{
                marginTop: "6px",
                color:
                  "#64748b",
              }}
            >
              Original Size:{" "}
              <strong>
                {formatSize(
                  file.size
                )}
              </strong>
            </div>
          </div>

          <div
            style={{
              marginTop: "25px",
              padding: "22px",
              background:
                "#f8fafc",
              borderRadius:
                "14px",
            }}
          >
            <h3
              style={{
                marginTop: 0,
              }}
            >
              Target File Size
            </h3>

            <div
              style={{
                display: "flex",
                gap: "10px",
                maxWidth:
                  "500px",
              }}
            >
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter size"
                value={
                  targetValue
                }
                onChange={(e) =>
                  setTargetValue(
                    e.target.value
                  )
                }
                style={{
                  flex: 1,
                  padding:
                    "13px",
                  borderRadius:
                    "10px",
                  border:
                    "1px solid #cbd5e1",
                  fontSize:
                    "16px",
                }}
              />

              <select
                value={
                  targetUnit
                }
                onChange={(e) =>
                  setTargetUnit(
                    e.target.value
                  )
                }
                style={{
                  width:
                    "110px",
                  padding:
                    "13px",
                  borderRadius:
                    "10px",
                  border:
                    "1px solid #cbd5e1",
                  background:
                    "#ffffff",
                  fontSize:
                    "16px",
                }}
              >
                <option value="KB">
                  KB
                </option>

                <option value="MB">
                  MB
                </option>

                <option value="GB">
                  GB
                </option>
              </select>
            </div>

            <p
              style={{
                marginBottom: 0,
                color:
                  "#64748b",
                fontSize:
                  "13px",
              }}
            >
              Example: 500 KB,
              1 MB, 2 MB, 5 MB
            </p>
          </div>

          <div
            style={{
              marginTop: "25px",
              display: "flex",
              gap: "12px",
              flexWrap:
                "wrap",
            }}
          >
            <button
              onClick={
                compressPDF
              }
              disabled={loading}
              style={{
                padding:
                  "13px 25px",
                borderRadius:
                  "10px",
                border: "none",
                background:
                  loading
                    ? "#94a3b8"
                    : "#2563eb",
                color:
                  "#ffffff",
                fontWeight:
                  "700",
                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {loading
                ? "Compressing..."
                : "📦 Compress PDF"}
            </button>

            <button
              onClick={
                clearAll
              }
              disabled={loading}
              style={{
                padding:
                  "13px 22px",
                borderRadius:
                  "10px",
                border:
                  "1px solid #cbd5e1",
                background:
                  "#ffffff",
                color:
                  "#475569",
                fontWeight:
                  "700",
                cursor:
                  "pointer",
              }}
            >
              Clear
            </button>
          </div>

          {loading && (
            <div
              style={{
                marginTop: "25px",
                padding: "18px",
                background:
                  "#fff7ed",
                border:
                  "1px solid #fed7aa",
                borderRadius:
                  "12px",
                color:
                  "#9a3412",
                fontWeight:
                  "600",
              }}
            >
              ⏳{" "}
              {progress ||
                "Processing..."}
            </div>
          )}

          {result && (
            <div
              style={{
                marginTop: "30px",
                padding: "25px",
                background:
                  "#f0fdf4",
                border:
                  "1px solid #bbf7d0",
                borderRadius:
                  "16px",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  color:
                    result.targetReached
                      ? "#166534"
                      : "#92400e",
                }}
              >
                {result.targetReached
                  ? "✅ Target Size Achieved"
                  : "⚠️ Closest Possible Result"}
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(170px,1fr))",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    padding:
                      "15px",
                    background:
                      "#ffffff",
                    borderRadius:
                      "10px",
                  }}
                >
                  <small>
                    Original
                  </small>

                  <br />

                  <strong>
                    {formatSize(
                      result.originalSize
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    padding:
                      "15px",
                    background:
                      "#ffffff",
                    borderRadius:
                      "10px",
                  }}
                >
                  <small>
                    Target
                  </small>

                  <br />

                  <strong>
                    {formatSize(
                      result.targetSize
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    padding:
                      "15px",
                    background:
                      "#ffffff",
                    borderRadius:
                      "10px",
                  }}
                >
                  <small>
                    New Size
                  </small>

                  <br />

                  <strong>
                    {formatSize(
                      result.compressedSize
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    padding:
                      "15px",
                    background:
                      "#ffffff",
                    borderRadius:
                      "10px",
                  }}
                >
                  <small>
                    Reduced
                  </small>

                  <br />

                  <strong>
                    {result.reduction.toFixed(
                      1
                    )}
                    %
                  </strong>
                </div>
              </div>

              <button
                onClick={
                  downloadPDF
                }
                style={{
                  marginTop:
                    "20px",
                  padding:
                    "13px 25px",
                  borderRadius:
                    "10px",
                  border: "none",
                  background:
                    "#16a34a",
                  color:
                    "#ffffff",
                  fontWeight:
                    "700",
                  cursor:
                    "pointer",
                }}
              >
                ⬇️ Download
                Compressed PDF
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PDFCompressor;