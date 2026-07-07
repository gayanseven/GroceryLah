"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { baseState } from "./catalog";

const KEY = "grocerylah2";
const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [S, setS] = useState(null); // null until hydrated on the client
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    let s;
    try {
      s = JSON.parse(localStorage.getItem(KEY)) || baseState();
    } catch {
      s = baseState();
    }
    setS(s);
  }, []);

  /** Mutate a draft of the state; persists + re-renders. */
  const update = (fn) =>
    setS((prev) => {
      const next = structuredClone(prev);
      fn(next);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

  /** Replace the whole state (onboarding finish, demo load). */
  const replace = (next) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    setS(next);
  };

  const toast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2200);
  };

  /** Simulated partner notification (becomes a real push/WA message in production). */
  const partnerPing = (txt) => {
    const other = S?.users?.[1];
    if (!other) return;
    setTimeout(() => toast(`\u{1F4F2} WhatsApp → ${other}: "${txt}"`), 900);
  };

  return (
    <Ctx.Provider value={{ S, update, replace, toast, toastMsg, partnerPing }}>
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => useContext(Ctx);
