"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { buildWAMessage, encodeShareData } from "@/lib/share";

function copy(text, onDone, onFail) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(onDone).catch(() => fallback());
  } else fallback();
  function fallback() {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); onDone(); } catch { onFail?.(); }
    ta.remove();
  }
}

export function ShareSheet({ onClose }) {
  const { S } = useApp();
  const [copied, setCopied] = useState(false);
  const msg = useMemo(() => buildWAMessage(S), [S]);
  const url = useMemo(() => `${window.location.origin}/s#${encodeShareData(S)}`, [S]);

  return (
    <div className="wa-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="wa-sheet">
        <div className="wa-head" style={{ background: "var(--accent)" }}>
          <div className="avatar" style={{ background: "rgba(255,255,255,.15)", color: "#fff", fontSize: 18 }}>🔗</div>
          <div className="who"><b>Share list</b></div>
          <button className="x" onClick={onClose}>✕</button>
        </div>
        <div className="share-opts">
          <a className="share-opt"
            href={`https://wa.me/?text=${encodeURIComponent(msg)}`}
            target="_blank" rel="noopener noreferrer">
            <span className="share-opt-ic">🟢</span>
            <div className="share-opt-txt">
              <b>Text list</b>
              <span>Formatted grocery list in WhatsApp</span>
            </div>
            <span className="share-opt-arr">›</span>
          </a>
          <div className="share-divider" />
          <a className="share-opt"
            href={`https://wa.me/?text=${encodeURIComponent("🛒 Here's our shopping list: " + url)}`}
            target="_blank" rel="noopener noreferrer">
            <span className="share-opt-ic">🔗</span>
            <div className="share-opt-txt">
              <b>Web link</b>
              <span>Anyone can open &amp; tick off, no login</span>
            </div>
            <span className="share-opt-arr">›</span>
          </a>
          <div className="share-copy-row">
            <button className="share-copy-btn"
              onClick={() => copy(url, () => { setCopied(true); setTimeout(() => setCopied(false), 1600); })}>
              {copied ? "Copied ✓" : "Copy link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
