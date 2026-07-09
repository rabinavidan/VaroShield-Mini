import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { setAuth } from "../auth";
import { BusinessLogicFlow, TestAutomationFlow } from "../components/SystemMapDiagrams";

const SLIDES = ["Business logic", "Test automation"];

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [revealedSlides, setRevealedSlides] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealedSlides((prev) => new Set(prev).add(activeSlide));
    }, 80);
    return () => clearTimeout(timer);
  }, [activeSlide]);

  function goToSlide(index: number) {
    setActiveSlide((index + SLIDES.length) % SLIDES.length);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const result = await api.login(email, password);
      setAuth(result.token, result.role);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="login-hero">
      <div className="login-top">
        <div className="login-hero-head">
          <p className="login-eyebrow">DSPM Sentinel Mini</p>
          <h1 className="login-headline">Data security posture, live.</h1>
          <p className="login-subcopy">
            A small DSPM simulation: sensitive-data discovery, permission exposure, async
            scanning, and risk alerting — with the automation to prove it works.
          </p>
          <div className="login-stats">
            <div>
              <strong>21</strong>
              <span>Automated tests</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>Pass rate</span>
            </div>
            <div>
              <strong>2</strong>
              <span>Risk severities detected</span>
            </div>
          </div>
        </div>

        <div className="login-box">
          <h2>Sign in</h2>
          <form onSubmit={handleSubmit} style={{ flexDirection: "column", alignItems: "stretch" }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              data-testid="login-email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              data-testid="login-password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" data-testid="login-submit">
              Login
            </button>
            {error && <p className="error">{error}</p>}
          </form>
          <p className="login-hint">
            admin@example.com / admin123 — seeded on backend startup
          </p>
        </div>
      </div>

      <div className="login-page">
        <div className="carousel">
          <div className="carousel-viewport">
            <div className="carousel-track" style={{ transform: `translateX(-${activeSlide * 50}%)` }}>
              <section className="flow-panel carousel-slide">
                <span className="corner-bracket corner-bracket--tl" />
                <span className="corner-bracket corner-bracket--tr" />
                <span className="corner-bracket corner-bracket--bl" />
                <span className="corner-bracket corner-bracket--br" />
                <div className="flow-panel-body">
                  <p className="flow-eyebrow">Business logic</p>
                  <h2>How a file becomes a risk alert</h2>
                  <p className="flow-desc">
                    Every alert on the dashboard traces back to this path: a file is created,
                    possibly exposed, scanned asynchronously, and judged against the risk rules.
                  </p>
                  <BusinessLogicFlow revealed={revealedSlides.has(0)} />
                  <div className="flow-legend">
                    <span><span className="flow-dot flow-dot--high" />HIGH — sensitive + exposed</span>
                    <span><span className="flow-dot flow-dot--low" />LOW — non-sensitive + public</span>
                    <span><span className="flow-dot flow-dot--safe" />SAFE — sensitive + private, no alert</span>
                  </div>
                </div>
              </section>

              <section className="flow-panel carousel-slide">
                <span className="corner-bracket corner-bracket--tl" />
                <span className="corner-bracket corner-bracket--tr" />
                <span className="corner-bracket corner-bracket--bl" />
                <span className="corner-bracket corner-bracket--br" />
                <div className="flow-panel-body">
                  <p className="flow-eyebrow">Test automation</p>
                  <h2>Two lanes, one stack, one report</h2>
                  <p className="flow-desc">
                    API tests own the business-logic coverage; UI tests cover critical
                    journeys only. Both lanes exercise the same running stack and produce
                    one Allure report, published from CI.
                  </p>
                  <TestAutomationFlow revealed={revealedSlides.has(1)} />
                </div>
              </section>
            </div>
          </div>

          <div className="carousel-controls">
            <button
              type="button"
              className="carousel-arrow"
              aria-label="Previous"
              onClick={() => goToSlide(activeSlide - 1)}
            >
              ‹
            </button>
            <div className="carousel-dots">
              {SLIDES.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  className={index === activeSlide ? "carousel-dot carousel-dot--active" : "carousel-dot"}
                  aria-label={label}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
            <button
              type="button"
              className="carousel-arrow"
              aria-label="Next"
              onClick={() => goToSlide(activeSlide + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
