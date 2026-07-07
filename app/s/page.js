"use client";
import { useEffect, useState } from "react";
import { decodeShareData } from "@/lib/share";

/** Shopper web view: /s#<encoded list> — no login, tap to tick. */
export default function ShopperPage() {
  const [data, setData] = useState(null);
  const [done, setDone] = useState([]);
  const [key, setKey] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return setError(true);
    try {
      const d = decodeShareData(hash);
      const k = "gl_shop_" + (d.n || "list").replace(/\W/g, "") + "_" + d.items.length;
      setData(d);
      setKey(k);
      let saved;
      try { saved = JSON.parse(localStorage.getItem(k)); } catch {}
      setDone(saved || d.items.map((i) => i.d));
    } catch {
      setError(true);
    }
  }, []);

  const toggle = (idx) => {
    setDone((prev) => {
      const next = [...prev];
      next[idx] = next[idx] ? 0 : 1;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  if (error)
    return (
      <div className="phone">
        <div className="empty" style={{ marginTop: 80 }}>
          This link doesn't contain a list. Ask for a fresh share link!
        </div>
      </div>
    );
  if (!data) return <div className="phone"><div className="splash">🛒</div></div>;

  const n = done.filter(Boolean).length;
  const groups = [...new Set(data.items.map((i) => i.s || "Anywhere"))];

  return (
    <div className="phone">
      <header className="app">
        <div className="top">
          <div>
            <h1>🛒 {data.n}</h1>
            <div className="week">{data.h ? data.h + " · " : ""}shopping view</div>
          </div>
        </div>
        <div className="budgetbox">
          <div className="nums">
            <span><b>{n} / {data.items.length}</b> in the trolley</span>
            <span>{n === data.items.length ? "All done! 🎉" : ""}</span>
          </div>
          <div className="bar">
            <div className="act"
              style={{ width: (data.items.length ? (n / data.items.length) * 100 : 0) + "%" }} />
          </div>
        </div>
      </header>
      <main className="app">
        {groups.map((g) => (
          <div key={g}>
            <div className="cat-label">{g}</div>
            {data.items.map((it, idx) =>
              (it.s || "Anywhere") !== g ? null : (
                <div key={idx} className={`item ${done[idx] ? "bought" : ""}`}
                  style={{ cursor: "pointer" }} onClick={() => toggle(idx)}>
                  <div className="chk">{done[idx] ? "✓" : ""}</div>
                  <div className="iinfo">
                    <div className="nm">{it.t} {it.f ? <span className="pill new">New</span> : null}</div>
                  </div>
                  {it.q > 1 && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
                      x{it.q}
                    </span>
                  )}
                </div>
              )
            )}
          </div>
        ))}
        <div className="note" style={{ textAlign: "center", margin: "16px 0 22px" }}>
          Tap an item when it's in the trolley.
          <br />
          Ticks are saved on this device — live household sync arrives in milestone 2.
        </div>
      </main>
    </div>
  );
}
