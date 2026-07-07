"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { buildWAMessage, encodeShareData, waRichHtml } from "@/lib/share";

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

export function WhatsAppSheet({ onClose }) {
  const { S } = useApp();
  const [copied, setCopied] = useState(false);
  const msg = useMemo(() => buildWAMessage(S), [S]);
  const other = S.users[1] || "Family";
  const now = new Date().toLocaleTimeString("en-SG", { hour: "numeric", minute: "2-digit" });

  return (
    <div className="wa-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="wa-sheet">
        <div className="wa-head">
          <div className="avatar">{other[0]}</div>
          <div className="who"><b>{other}</b><span>online</span></div>
          <button className="x" onClick={onClose}>✕</button>
        </div>
        <div className="wa-chat">
          <div className="wa-bubble">
            <span dangerouslySetInnerHTML={{ __html: waRichHtml(msg) }} />
            <div className="meta">{now} <span className="ticks">✓✓</span></div>
          </div>
        </div>
        <div className="wa-actions">
          <button className="wa-copy"
            onClick={() => copy(msg, () => { setCopied(true); setTimeout(() => setCopied(false), 1600); })}>
            {copied ? "Copied ✓" : "Copy text"}
          </button>
          <a className="wa-open" target="_blank" rel="noopener noreferrer"
            href={`https://wa.me/?text=${encodeURIComponent(msg)}`}>
            Open WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export function WebLinkSheet({ onClose }) {
  const { S } = useApp();
  const [copied, setCopied] = useState(false);
  const url = useMemo(
    () => `${window.location.origin}/s#${encodeShareData(S)}`,
    [S]
  );

  return (
    <div className="wa-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="wa-sheet">
        <div className="wa-head link">
          <div className="avatar" style={{ background: "#fff", color: "var(--accent)" }}>🔗</div>
          <div className="who">
            <b>Shareable web view</b>
            <span>anyone with the link can tick items off</span>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: 16, background: "#f0f2f5" }}>
          <div className="linkbox">{url}</div>
          <div className="note">
            Send this to your helper or spouse — it opens a simple checklist, no app or login
            needed. Ticks are saved on their device; live two-way sync arrives with accounts in
            milestone 2.
          </div>
        </div>
        <div className="wa-actions">
          <button className="wa-copy"
            onClick={() => copy(url, () => { setCopied(true); setTimeout(() => setCopied(false), 1600); })}>
            {copied ? "Copied ✓" : "Copy link"}
          </button>
          <button className="wa-open dark" onClick={() => window.open(url, "_blank")}>
            Preview it
          </button>
          <a className="wa-open" style={{ flex: 0.7 }} target="_blank" rel="noopener noreferrer"
            href={`https://wa.me/?text=${encodeURIComponent("\u{1F6D2} Grocery list: " + url)}`}>
            Send 🟢
          </a>
        </div>
      </div>
    </div>
  );
}
