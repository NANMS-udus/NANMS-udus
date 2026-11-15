import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import "./Assistant.css";
import Bubble from "./Bubble";
import Input from "./Input";
import QuickChips from "./QuickChips";
import Tooltip from "./Tooltip";
import { UiContext } from "../../../../../../MyContexts/UiContext";
import { AuthContext } from "../../../../../../MyContexts/AuthContext";
import { GenContext } from "../../../../../../MyContexts/GenContexts";
import { PortalContext } from "../../../../../../MyContexts/PortalContext";
import Messages from "./Messages";
import { assistant } from "../../../../../../Utils/data";
import refresh from "../../../../../../assets/icons/reload.svg";
import down from "../../../../../../assets/icons/chevron-down.svg";

const MAX_LEN = 500;
const HISTORY_TURNS = 6;
const CONTACT_LINK = { label: "Open Contact page", path: "/contact" };

let idCounter = 0;
const newId = suffix => `${Date.now()}-${++idCounter}-${suffix}`;

const isMobile = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;

export default function Assistant() {
  // Every context is optional so the chatbot never crashes if a provider is missing.
  const ui = useContext(UiContext) ?? {};
  const auth = useContext(AuthContext) ?? {};
  const gen = useContext(GenContext) ?? {};
  const portal = useContext(PortalContext) ?? {};
  const navigate = useNavigate();

  // Fall back to local state if UiContext does not provide showBot / setShowbot.
  const [localShow, setLocalShow] = useState(false);
  const showBot = ui.showBot ?? localShow;
  const setShowbot = ui.setShowbot ?? setLocalShow;

  const session = auth.session ?? null;

  const [msgs, setMsgs] = useState([]);
  const [pending, setPending] = useState(false);
  const messagesElem = useRef(null);
  const msgsRef = useRef([]);
  const pendingRef = useRef(false);
  const contextRef = useRef(null); // last results shown, for follow-ups ("their page", "the second one")
  const wasSignedIn = useRef(false);
  const justLoggedOut = useRef(false);
  const reportedRef = useRef(new Set());
  const authRef = useRef(auth);
  authRef.current = auth;

  // Always read the freshest website data without re-creating callbacks.
  const liveRef = useRef({});
  liveRef.current = {
    session,
    data: {
      excos: gen.excos,
      presidents: gen.presidents,
      ptrns: gen.ptrns,
      alumni: gen.alumni,
      news: gen.news,
      members: gen.members?.all,
      intNews: portal.intNews,
      studyMats: portal.studyMats,
      myDetails: auth.myDetails
    }
  };
  msgsRef.current = msgs;

  useEffect(() => {
    assistant.getMsgs(setMsgs);
  }, []);

  useEffect(() => {
    assistant.saveMsgs(msgs);
    if (messagesElem.current) {
      messagesElem.current.scrollTop = messagesElem.current.scrollHeight;
    }
  }, [msgs]);

  // On sign-out, wipe the stored conversation so the next person on this device starts clean.
  useEffect(() => {
    if (session) {
      wasSignedIn.current = true;
    } else if (wasSignedIn.current) {
      wasSignedIn.current = false;
      assistant.clearMsgs();
      contextRef.current = null;
      const fresh = [assistant.welcomeMessage()];
      if (justLoggedOut.current) {
        justLoggedOut.current = false;
        fresh.push({ id: newId("a"), sender: "ai", text: "You've been logged out. See you soon!", timestamp: new Date().toISOString() });
      }
      setMsgs(fresh);
    }
  }, [session]);

  const addBot = useCallback((text, extra = {}) => {
    setMsgs(prev => [...prev, { id: newId("a"), sender: "ai", text, timestamp: new Date().toISOString(), ...extra }]);
  }, []);

  // Removes the buttons/form from a message once they have been used.
  const clearUi = useCallback(messageId => {
    setMsgs(prev => prev.map(m => (m.id === messageId ? { ...m, ui: null } : m)));
  }, []);

  function clearChat() {
    assistant.clearMsgs();
    contextRef.current = null;
    reportedRef.current = new Set();
    setMsgs([{ id: `welcome-${Date.now()}`, sender: "ai", text: "Chat cleared. Welcome back! How can I help with the NANMS website?", timestamp: new Date().toISOString() }]);
  }

  // Passes an unanswered question to the developer. The server only logs it while the developer is available.
  const reportUnanswered = useCallback(async (question, reason, manual = false) => {
    const key = String(question).trim().toLowerCase();
    if (!manual) {
      if (reportedRef.current.has(key)) return; // don't report the same question twice
      reportedRef.current.add(key);
    }
    const { status } = await assistant.reportToDeveloper({ question, reason, page: window.location.pathname });
    if (status === "sent") {
      addBot("I couldn't answer that, so I've sent your question to the developer to look into.");
    } else if (status === "unavailable") {
      addBot("The developer isn't available right now, so I haven't passed this on. You can also reach the team through the Contact page.", { links: [CONTACT_LINK] });
    } else if (status === "rate_limited") {
      addBot("I've sent a few questions to the developer just now. Please try again in a minute.");
    } else {
      addBot("I couldn't send your question to the developer right now. You can try the Contact page instead.", { links: [CONTACT_LINK] });
    }
  }, [addBot]);

  // ---- sign in / sign out
  async function handleLogin(messageId, email, password) {
    const signIn = authRef.current.signIn;
    if (!signIn) return { ok: false, message: "Sign-in isn't available right now." };
    const cleanEmail = String(email || "").trim();
    if (!cleanEmail || !password) return { ok: false, message: "Please enter both your email and password." };
    try {
      // AuthContext.signIn reads its input with Object.fromEntries, so a Map works like a form.
      const result = await signIn(null, new Map([["email", cleanEmail], ["password", password]]));
      if (result && result.success === false) {
        return { ok: false, message: result.message || "Sign-in failed. Please check your details." };
      }
      clearUi(messageId);
      addBot("You're signed in. Welcome back!", { links: [{ label: "Open my dashboard", path: "/members/dashboard" }] });
      return { ok: true };
    } catch (error) {
      console.warn("PowerBot sign-in failed:", error);
      return { ok: false, message: "Sign-in failed. Please try again." };
    }
  }

  async function doLogout() {
    const signOut = authRef.current.signOut;
    if (!signOut) {
      addBot("I can't log you out from here. Please use the logout button on the website.", { isError: true });
      return;
    }
    justLoggedOut.current = true;
    try {
      await signOut();
    } catch (error) {
      console.warn("PowerBot sign-out failed:", error);
    }
    // If the session is still there a moment later, the logout did not work.
    await new Promise(resolve => setTimeout(resolve, 400));
    if (liveRef.current.session) {
      justLoggedOut.current = false;
      addBot("I couldn't log you out. Please try again, or use the logout button on the website.", { isError: true });
    }
  }

  // Buttons inside messages (confirmations and troubleshooting fixes).
  const handleUiAction = useCallback(async (messageId, action, payload) => {
    clearUi(messageId);
    switch (action) {
      case "login_form":
        if (liveRef.current.session) addBot("You're already signed in.");
        else addBot("Please enter your email and password below.", { ui: { type: "login" } });
        return;
      case "logout_confirm":
        await doLogout();
        return;
      case "refresh_session": {
        const result = await assistant.refreshSession();
        if (result.ok) addBot("Your session has been refreshed. Please try what you were doing again.");
        else addBot("I couldn't refresh your session, so please sign in again.", { ui: { type: "login" } });
        return;
      }
      case "reload_page":
        window.location.reload();
        return;
      case "clear_chat":
        clearChat();
        return;
      case "report_dev":
        await reportUnanswered(payload?.question || "(no question text)", "user_request", true);
        return;
      default:
        return; // "dismiss" and anything unknown
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addBot, clearUi, reportUnanswered]);

  const sendPrompt = useCallback(async raw => {
    const prompt = String(raw || "").replace(/\s+/g, " ").trim().slice(0, MAX_LEN);
    if (!prompt || pendingRef.current) return; // ignore empty and repeated submissions

    // Never send or store a password typed into the chat.
    if (assistant.looksLikeCredentials(prompt)) {
      if (liveRef.current.session) {
        addBot("You're already signed in, and I never need your password. Please don't share it in chat.");
      } else {
        addBot("For your safety, please don't type your password in the chat. Use the secure sign-in form below instead.", { ui: { type: "login" } });
      }
      return;
    }

    pendingRef.current = true;
    setPending(true);

    const history = msgsRef.current
      .filter(m => !String(m.id).startsWith("welcome") && !m.isError)
      .slice(-HISTORY_TURNS)
      .map(m => ({ role: m.sender === "ai" ? "assistant" : "user", text: String(m.text || "").slice(0, 400) }));

    setMsgs(prev => [...prev, { id: newId("u"), sender: "user", text: prompt, timestamp: new Date().toISOString() }]);

    let unanswered = null;
    try {
      const { session: currentSession, data } = liveRef.current;
      const result = await assistant.respond(prompt, {
        history,
        context: contextRef.current,
        session: currentSession,
        data
      });
      if (result.context) contextRef.current = result.context;
      unanswered = result.unanswered || null;

      setMsgs(prev => [...prev, {
        id: newId("a"),
        sender: "ai",
        text: result.text,
        timestamp: new Date().toISOString(),
        links: result.links,
        ui: result.ui || null,
        isError: Boolean(result.isError),
        isPrivate: Boolean(result.isPrivate)
      }]);

      if (result.navigateTo) {
        navigate(result.navigateTo);
        if (isMobile()) setShowbot(false); // don't leave the chat covering the page the user asked for
      }
    } catch (error) {
      console.error("PowerBot error:", error);
      setMsgs(prev => [...prev, {
        id: newId("e"), sender: "ai", isError: true,
        text: "Sorry, something went wrong while processing that. Please try again.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      pendingRef.current = false;
      setPending(false);
    }

    // After the answer is shown: pass questions I couldn't answer to the developer (when available).
    if (unanswered) reportUnanswered(prompt, unanswered.reason);
  }, [addBot, navigate, reportUnanswered, setShowbot]);

  return (
    <div className={`chatbot-widget-container ${showBot ? "is-open" : ""}`} id="chatbotWidget">
      {!showBot && <Tooltip onClick={() => setShowbot(true)} />}
      {showBot && (
        <section className="chat-window" id="chatWindow" aria-label="PowerBot Chat">
          <header className="chat-header">
            <div className="header-info-wrap">
              <div className="bot-avatar">🩺<span className="online-indicator" title="Ready" /></div>
              <div className="bot-text">
                <h3>PowerBot</h3>
                <p>● Online · Medical Student Desk</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" onClick={clearChat} className="header-ctrl-btn" title="Clear chat" aria-label="Clear chat"><img src={refresh} alt="" /></button>
              <button type="button" onClick={() => setShowbot(false)} className="header-ctrl-btn" title="Close chat" aria-label="Close chat"><img src={down} alt="" /></button>
            </div>
          </header>
          <div className="chat-sub-bar">
            <span>NANMS Website Assistant</span>
            <span className="sub-badge">PowerBot</span>
          </div>
          <Messages
            messagesElem={messagesElem}
            messages={msgs}
            pending={pending}
            onNavigate={() => { if (isMobile()) setShowbot(false); }}
            onUiAction={handleUiAction}
            onLogin={handleLogin}
          />
          {msgs.length <= 2 && <QuickChips onSelect={sendPrompt} disabled={pending} />}
          <div className="chat-footer">
            <Input onSend={sendPrompt} pending={pending} maxLength={MAX_LEN} />
            <div className="input-disclaimer">For official and current directives, confirm information through NANMS channels.</div>
          </div>
        </section>
      )}
      <Bubble showBot={showBot} setShowbot={setShowbot} />
    </div>
  );
}
