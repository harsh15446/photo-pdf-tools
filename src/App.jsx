import { useState } from "react";
import "./App.css";

import PhotoCompressor from "./components/PhotoCompressor";
import PhotoResizer from "./components/PhotoResizer";
import PhotosOnOnePage from "./components/PhotosOnOnePage";
import MergePDF from "./components/MergePDF";
import PDFToJPG from "./components/PDFToJPG";
import SplitPDF from "./components/SplitPDF";
import PDFCompressor from "./components/PDFCompressor";

const tools = [
  ["📸", "Photo to KB", "Photo ka size MB se KB mein kam karein"],
  ["📐", "Photo Resize", "Photo ki width aur height change karein"],
  ["🖼️", "Photos on One Page", "Multiple photos ko ek page par laayein"],
  ["🖼️", "Photos to PDF", "Multiple photos ko ek PDF mein banayein"],
  ["📄", "PDF Compressor", "PDF ko apne target size ke aas-paas compress karein"],
  ["🔗", "Merge PDF", "Multiple PDF files ko ek PDF mein jodein"],
  ["✂️", "Split PDF", "PDF ke pages alag karein"],
  ["🖼️", "PDF to JPG", "PDF pages ko images mein convert karein"],
];

function App() {
  const [activeTool, setActiveTool] = useState(null);

  const goBack = () => {
    setActiveTool(null);
  };

  if (activeTool) {
    return (
      <div className="app">
        <header className="navbar">
          <div className="logo">
            <div className="logo-icon">P</div>

            <div>
              <div className="logo-name">Photo & PDF</div>
              <div className="logo-subtitle">TOOLS</div>
            </div>
          </div>

          <button
            onClick={goBack}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              background: "#eff6ff",
              color: "#2563eb",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
        </header>

        {activeTool === "Photo to KB" && <PhotoCompressor />}

        {activeTool === "Photo Resize" && <PhotoResizer />}

        {activeTool === "Photos on One Page" && <PhotosOnOnePage />}

        {activeTool === "Photos to PDF" && (
          <div
            style={{
              maxWidth: "900px",
              margin: "60px auto",
              padding: "40px",
              textAlign: "center",
              background: "#fff",
              borderRadius: "20px",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2>🖼️ Photos to PDF</h2>
            <p style={{ color: "#64748b" }}>
              Photos to PDF tool already available hai.
            </p>
          </div>
        )}

        {activeTool === "PDF Compressor" && <PDFCompressor />}

        {activeTool === "Merge PDF" && <MergePDF />}

        {activeTool === "Split PDF" && <SplitPDF />}

        {activeTool === "PDF to JPG" && <PDFToJPG />}
      </div>
    );
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          <div className="logo-icon">P</div>

          <div>
            <div className="logo-name">Photo & PDF</div>
            <div className="logo-subtitle">TOOLS</div>
          </div>
        </div>

        <nav>
          <a href="#tools">Tools</a>
          <a href="#privacy">Privacy</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-badge">
            ⚡ Fast • Free • Private
          </div>

          <h1>
            Simple tools for your
            <br />
            <span>Photos & PDFs</span>
          </h1>

          <p>
            Compress, resize, convert and manage your files easily.
            <br />
            Everything works directly in your browser.
          </p>

          <a className="hero-button" href="#tools">
            Explore Tools →
          </a>
        </section>

        <section className="tools-section" id="tools">
          <div className="section-heading">
            <div>
              <p className="section-label">OUR TOOLS</p>
              <h2>Everything you need</h2>
            </div>

            <p className="section-description">
              Simple tools, no complicated software.
            </p>
          </div>

          <div className="tools-grid">
            {tools.map(([icon, title, description]) => (
              <button
                className="tool-card"
                key={title}
                onClick={() => {
                  if (
                    title === "Photo to KB" ||
                    title === "Photo Resize" ||
                    title === "Photos on One Page" ||
                    title === "Photos to PDF" ||
                    title === "PDF Compressor" ||
                    title === "Merge PDF" ||
                    title === "Split PDF" ||
                    title === "PDF to JPG"
                  ) {
                    setActiveTool(title);
                  } else {
                    alert(`${title} — Coming Soon`);
                  }
                }}
              >
                <div className="tool-icon">{icon}</div>

                <div className="tool-content">
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>

                <div className="tool-arrow">→</div>
              </button>
            ))}
          </div>
        </section>

        <section className="privacy-section" id="privacy">
          <div className="privacy-icon">🔒</div>

          <div>
            <h2>Your files stay private</h2>

            <p>
              Photos and PDFs are processed directly in your browser.
              Your files are not uploaded to our server.
            </p>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-logo">
          PHOTO & PDF TOOLS
        </div>

        <p>
          Simple, fast and privacy-friendly file tools.
        </p>

        <div className="footer-bottom">
          <span>© 2026 Photo & PDF Tools</span>
          <span>Made for everyone ❤️</span>
        </div>

        <div className="developer-credit">
          © 2026 • Developed by Harsh Thakur
        </div>
      </footer>
    </div>
  );
}

export default App;