import { useState } from "react";
import { useNavigate } from "react-router";
import { isAllowedPath } from "../../../../../../Utils/data";

// Secure sign-in form shown inside the chat. The password stays in this component's state only:
// it is never added to the conversation, never saved, and never sent to the AI.
function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const result = await onSubmit(email, password);
    if (!result?.ok) {
      setError(result?.message || "Sign-in failed.");
      setPassword("");
      setBusy(false);
    }
  }

  const fieldStyle = { width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.2)" };

  return (
    <form onSubmit={handleSubmit} autoComplete="on" style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
      <input
        className="chat-input"
        style={fieldStyle}
        type="email"
        name="email"
        value={email}
        onChange={event => setEmail(event.target.value)}
        placeholder="Email"
        autoComplete="username"
        aria-label="Email"
        disabled={busy}
      />
      <input
        className="chat-input"
        style={fieldStyle}
        type="password"
        name="password"
        value={password}
        onChange={event => setPassword(event.target.value)}
        placeholder="Password"
        autoComplete="current-password"
        aria-label="Password"
        disabled={busy}
      />
      {error && <span role="alert" style={{ fontSize: "0.8rem", color: "#b3261e" }}>{error}</span>}
      <button type="submit" className="chip-btn" disabled={busy || !email.trim() || !password}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function Message({ details, onNavigate = () => {}, onUiAction = () => {}, onLogin = async () => ({ ok: false }) }) {
  const navigate = useNavigate();
  const { id, sender, text, timestamp, links, ui } = details || {};
  const isAi = sender === "ai";
  const time = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  // Only internal, allowlisted pages can ever become buttons.
  const safeLinks = isAi && Array.isArray(links) ? links.filter(link => isAllowedPath(link?.path)) : [];
  const buttons = isAi && ui?.type === "buttons" && Array.isArray(ui.buttons) ? ui.buttons : [];

  return (
    <div className={`msg-row ${isAi ? "bot" : "user"}`} key={id}>
      <div className="msg-avatar">{isAi ? "AI" : "You"}</div>
      <div className="msg-content">
        <div className="msg-bubble" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{text}</div>

        {isAi && ui?.type === "login" && <LoginForm onSubmit={(email, password) => onLogin(id, email, password)} />}

        {(buttons.length > 0 || safeLinks.length > 0) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
            {buttons.map(button => (
              <button
                type="button"
                className="chip-btn"
                key={`${button.action}-${button.label}`}
                onClick={() => onUiAction(id, button.action, button.payload)}
              >
                {button.label}
              </button>
            ))}
            {safeLinks.map(link => (
              <button
                type="button"
                className="chip-btn"
                key={link.path}
                onClick={() => { navigate(link.path); onNavigate(); }}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
        <span className="msg-time">{time}</span>
      </div>
    </div>
  );
}
