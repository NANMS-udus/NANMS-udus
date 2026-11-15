// Chat service: the only place the browser talks to the scholar-chat Edge Function.
// No AI key is used here; the Gemini key stays on the server. Passwords never pass through here.
import { supabase } from "./supabase";

const FUNCTION_NAME = "scholar-chat";

async function invoke(body, timeoutMs) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
  });
  try {
    const { data, error } = await Promise.race([
      supabase.functions.invoke(FUNCTION_NAME, { body }),
      timeout,
    ]);
    if (error) throw error;
    if (!data || typeof data !== "object") throw new Error("invalid_response");
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Sends one chat message and resolves with the server's JSON ({ ok, plan, answer? } or { ok:false, error, message }).
 * Throws on network failure, timeout or a malformed response (the caller falls back to basic mode).
 */
export async function askScholar({ message, history = [], context = null, signedIn = false }) {
  return invoke({ message, history, context, signedIn }, 30000);
}

/**
 * Asks the server to pass a question PowerBot could not answer to the developer.
 * The server only logs it while the developer is marked available.
 * Resolves with { ok, logged, available?, configured? }.
 */
export async function reportQuestion({ question, reason, page }) {
  return invoke({ mode: "report", question, reason, page }, 15000);
}

/** Tries to refresh the member's Supabase session token. */
export async function refreshAuthSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    return { ok: !error && Boolean(data?.session) };
  } catch {
    return { ok: false };
  }
}
