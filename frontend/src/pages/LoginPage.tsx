import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
  );
}
