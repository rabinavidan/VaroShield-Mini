import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { BusinessLogicFlow, TestAutomationFlow } from "../components/SystemMapDiagrams";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(timer);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const result = await api.login(email, password);
      localStorage.setItem("token", result.token);
      localStorage.setItem("role", result.role);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>VaroShield Mini</h1>
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
      </div>

      <div className="login-map">
        <section className="flow-panel">
          <p className="flow-eyebrow">Business logic</p>
          <h2>How a file becomes a risk alert</h2>
          <p className="flow-desc">
            Every alert on the dashboard traces back to this path: a file is created,
            possibly exposed, scanned asynchronously, and judged against the risk rules.
          </p>
          <BusinessLogicFlow revealed={revealed} />
          <div className="flow-legend">
            <span><span className="flow-dot flow-dot--high" />HIGH — sensitive + exposed</span>
            <span><span className="flow-dot flow-dot--low" />LOW — non-sensitive + public</span>
            <span><span className="flow-dot flow-dot--safe" />SAFE — sensitive + private, no alert</span>
          </div>
        </section>

        <section className="flow-panel">
          <p className="flow-eyebrow">Test automation</p>
          <h2>Two lanes, one stack, one report</h2>
          <p className="flow-desc">
            API tests own the business-logic coverage; UI tests cover critical
            journeys only. Both lanes exercise the same running stack and produce
            one Allure report, published from CI.
          </p>
          <TestAutomationFlow revealed={revealed} />
        </section>
      </div>
    </div>
  );
}
