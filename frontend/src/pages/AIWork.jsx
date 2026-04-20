import { useEffect } from "react";
import FadeIn from "../components/FadeIn";

export default function AIWork() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-wrapper">
      <section>
        <FadeIn>
          <h2>AI Work</h2>
          <div className="about-content">
            <p>
              This website was built with help from an AI coding assistant, Codex.
              I used it as a partner while building features, fixing issues, and
              improving the overall project structure.
            </p>
          </div>
        </FadeIn>
      </section>

      <section>
        <FadeIn>
          <h2>Overview</h2>
          <div className="card">
            <p>
              This website was developed with the assistance of Codex. Codex
              helped with backend routes, frontend pages, and deployment-related
              tasks.
            </p>
          </div>
        </FadeIn>
      </section>

      <section>
        <FadeIn>
          <h2>Development Process</h2>
          <div className="card">
            <ul style={{ paddingLeft: "1.2rem", color: "var(--muted)" }}>
              <li>Designed website structure and features based on assignment requirements</li>
              <li>Implemented backend APIs (authentication, message board, file upload)</li>
              <li>Built frontend pages using React and integrated with backend APIs</li>
              <li>Assisted with debugging deployment issues on Render</li>
              <li>Suggested improvements for code structure and security</li>
            </ul>
          </div>
        </FadeIn>
      </section>

      <section>
        <FadeIn>
          <h2>What Codex Helped With</h2>
          <div className="cards">
            <div className="card">
              <h3>Backend</h3>
              <ul style={{ paddingLeft: "1.2rem", color: "var(--muted)" }}>
                <li>API route structure</li>
                <li>Input validation</li>
                <li>Authentication handling</li>
              </ul>
            </div>
            <div className="card">
              <h3>Frontend</h3>
              <ul style={{ paddingLeft: "1.2rem", color: "var(--muted)" }}>
                <li>Page components</li>
                <li>Routing setup</li>
                <li>UI structure</li>
              </ul>
            </div>
            <div className="card">
              <h3>Deployment</h3>
              <ul style={{ paddingLeft: "1.2rem", color: "var(--muted)" }}>
                <li>Render setup</li>
                <li>Environment variables</li>
                <li>Debugging errors</li>
              </ul>
            </div>
          </div>
        </FadeIn>
      </section>

      <section>
        <FadeIn>
          <h2>Reflection</h2>
          <div className="card">
            <p>
              Using AI during development made it much faster to move from ideas
              to working code. It also helped me learn new patterns and solve
              problems more confidently along the way.
            </p>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
