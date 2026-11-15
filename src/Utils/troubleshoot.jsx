// PowerBot: troubleshooting guides, quick diagnostics and the password guard.
// Plain JavaScript, no hooks. The AI only picks WHICH problem the visitor describes; the steps below
// are fixed text written for this website, so the bot never invents a fix.
//
// Button actions understood by Assistant.jsx:
//   login_form | logout_confirm | refresh_session | reload_page | clear_chat | report_dev | dismiss

export const PROBLEMS = [
  "login_failed", "register_failed", "session_expired", "data_not_showing", "page_not_loading",
  "profile_not_saving", "study_materials_not_loading", "slow_or_network", "bot_not_working",
  "dues_or_payment", "other"
];

// ---- Password guard ---------------------------------------------------------------------
// If someone types credentials into the chat box, the message must NOT be sent to the AI or saved.
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const NOT_A_PASSWORD = new Set([
  "wrong", "not", "incorrect", "invalid", "forgotten", "lost", "too", "being", "still", "correct", "expired",
  "weak", "strong", "working", "rejected", "missing", "required", "different", "changed", "reset", "unknown",
  "the", "a", "an", "my", "it", "this", "that", "always", "never", "failing", "failed", "saying", "showing",
  "giving", "and", "but", "so", "why", "what", "how", "right", "ok", "fine"
]);

export function looksLikeCredentials(text) {
  const s = String(text ?? "");
  if (EMAIL_RE.test(s) && /\b(pass(word|code)?|pwd|pw)\b/i.test(s)) return true;
  const m = s.match(/\b(?:password|passcode|pwd|pw)\b\s*(?:\bis\b|[:=-])\s*(\S+)/i);
  if (m && !NOT_A_PASSWORD.has(m[1].toLowerCase().replace(/[^a-z]/g, ""))) return true;
  return false;
}

// ---- Diagnostics (real checks of what this page has loaded) -------------------------------
const count = value => (Array.isArray(value) ? value.length : 0);

export function runDiagnostics(data = {}, signedIn = false) {
  const online = typeof navigator === "undefined" || navigator.onLine !== false;
  const lines = [
    `Internet connection: ${online ? "online" : "offline"}`,
    `Signed in: ${signedIn ? "yes" : "no"}`,
    `Executives loaded: ${count(data.excos)}`,
    `News loaded: ${count(data.news)}`,
    `Patrons loaded: ${count(data.ptrns)}`,
    `Past presidents loaded: ${count(data.presidents)}`,
    `Alumni loaded: ${count(data.alumni)}`
  ];
  if (signedIn) {
    lines.push(`Announcements loaded: ${count(data.intNews)}`);
    lines.push(`Study materials loaded: ${count(data.studyMats)}`);
  }
  const publicEmpty = [data.excos, data.news, data.ptrns, data.presidents, data.alumni].every(list => count(list) === 0);
  return { lines, online, publicEmpty };
}

const btn = (label, action, payload) => ({ label, action, payload });
const bulletList = items => items.map(item => `- ${item}`).join("\n");

// Returns { text, buttons, links } for one problem type.
export function troubleshoot(problem, { data = {}, signedIn = false, question = "" } = {}) {
  const tellDeveloper = btn("Tell the developer", "report_dev", { question });
  const diag = runDiagnostics(data, signedIn);

  switch (problem) {
    case "login_failed":
      if (signedIn) {
        return {
          text: "You appear to be signed in already. If a page still sends you back to the login page, your session may have gone stale. I can refresh it for you.",
          buttons: [btn("Refresh my session", "refresh_session"), tellDeveloper],
          links: []
        };
      }
      return {
        text: "Let's get you signed in. Common causes:\n" + bulletList([
          "A typo in the email or password (check Caps Lock and extra spaces).",
          "Sign-in has to work for both the member portal and the study directory, so if either one fails, the login is cancelled and an error appears.",
          "If you just registered, open the confirmation link in your email first, if the site asked you to confirm.",
          "Forgotten password? Look for a reset option on the Login page. If there isn't one, tell the developer."
        ]) + "\n\nI can sign you in securely right here.",
        buttons: [btn("Sign in here", "login_form"), tellDeveloper],
        links: []
      };

    case "register_failed":
      return {
        text: "If registration fails, check these:\n" + bulletList([
          "Both password fields must match exactly.",
          "The email may already be registered. Try signing in instead.",
          "Fill in every required field, and check your internet connection.",
          "Registration also creates your study directory account, so an error from that step can stop sign-up. Note the exact message shown and tell the developer."
        ]),
        buttons: [tellDeveloper],
        links: [{ label: "Open Registration", path: "/members/registration" }]
      };

    case "session_expired":
      return {
        text: signedIn
          ? "Your sign-in may have gone stale. I can try to refresh it. If that doesn't work, you can sign in again."
          : "You are not signed in right now, which is why member pages send you to the login page. You can sign in here.",
        buttons: signedIn
          ? [btn("Refresh my session", "refresh_session"), btn("Log me out and sign in again", "logout_confirm")]
          : [btn("Sign in here", "login_form")],
        links: []
      };

    case "data_not_showing":
      return {
        text: `I checked what this page has loaded:\n${bulletList(diag.lines)}\n\n` + (
          !diag.online
            ? "Your device looks offline. Reconnect to the internet and reload the page."
            : diag.publicEmpty
              ? "Nothing has loaded. That usually means a connection problem, or the page was opened before the data arrived. Reloading the page normally fixes it."
              : "The page data did load. If one specific page looks empty, that content may not have been published yet. Reloading can also help."
        ),
        buttons: [btn("Reload the page", "reload_page"), tellDeveloper],
        links: []
      };

    case "page_not_loading":
      return {
        text: "If a page is blank or won't load, try these in order:\n" + bulletList([
          "Check your internet connection.",
          "Reload the page, or do a hard refresh with Ctrl + Shift + R.",
          "Try another browser or a private window.",
          "If it keeps happening, tell the developer which page it was."
        ]),
        buttons: [btn("Reload the page", "reload_page"), tellDeveloper],
        links: []
      };

    case "profile_not_saving":
      return {
        text: "If your profile won't save:\n" + bulletList([
          "You must be signed in. If your sign-in is stale, refresh your session first.",
          "Fill in the required fields, and use a normal image file for your profile picture.",
          "Note the exact error message shown, because it tells the developer what failed."
        ]),
        buttons: [btn("Refresh my session", "refresh_session"), tellDeveloper],
        links: [{ label: "Open Edit Profile", path: "/members/dashboard/edit-profile" }]
      };

    case "study_materials_not_loading":
      return {
        text: `The Study Directory uses a second sign-in (your study directory account), which is created when you log in. I checked: ${signedIn ? `${count(data.studyMats)} study materials loaded.` : "you are not signed in."}\n\n` + (
          signedIn
            ? "If that number is 0, log out and sign in again so both sign-ins are set up fresh, and check your internet connection."
            : "Sign in first, then open the Study Directory."
        ),
        buttons: signedIn ? [btn("Log me out and sign in again", "logout_confirm"), tellDeveloper] : [btn("Sign in here", "login_form")],
        links: signedIn ? [{ label: "Open Study Directory", path: "/members/dashboard/study-directory" }] : []
      };

    case "slow_or_network":
      return {
        text: `Quick check:\n${bulletList(diag.lines.slice(0, 2))}\n\n` + (
          diag.online
            ? "Your device is online, so the slowness may be on the server side or your connection quality. Wait a moment and try again, or reload the page."
            : "Your device looks offline. Reconnect and try again."
        ),
        buttons: [btn("Reload the page", "reload_page")],
        links: []
      };

    case "bot_not_working":
      return {
        text: "Sorry about that. If I say I'm in \"basic mode\", my AI service can't be reached right now. Opening pages still works. Try again in a minute, or clear this chat to start fresh. If it keeps happening, tell the developer.",
        buttons: [btn("Clear the chat", "clear_chat"), tellDeveloper],
        links: []
      };

    case "dues_or_payment":
      return {
        text: "I can't see or change payment records. For dues problems, please contact the executives through the Contact page. If it looks like a website bug, you can tell the developer.",
        buttons: [tellDeveloper],
        links: [{ label: "Open Contact page", path: "/contact" }]
      };

    default:
      return {
        text: "I'm not sure what's wrong yet. Tell me what you were trying to do and what message you saw, and I'll try to help. You can also pass it to the developer.",
        buttons: [tellDeveloper],
        links: []
      };
  }
}
