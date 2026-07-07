"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { fmt, totals } from "@/lib/pricing";
import { parseReceiptText, SAMPLE_RECEIPT } from "@/lib/suggest";

export default function ReceiptTab() {
  const { S, update, toast, partnerPing } = useApp();
  const [text, setText] = useState("");
  const [pending, setPending] = useState(null);

  const parse = () => {
    if (!text.trim()) return toast("Paste or load a receipt first");
    const rows = parseReceiptText(S, text.trim());
    setPending(rows);
    toast(`Parsed ${rows.length} lines — ${rows.filter((x) => x.matched).length} auto-matched`);
  };

  const apply = () => {
    let learned = 0, actuals = 0;
    update((s) => {
      const l = s.lists.find((x) => x.id === s.activeList) || s.lists[0];
      pending.forEach((m) => {
        if (!m.cid) return;
        const c = s.catalog.find((x) => x.id === m.cid);
        c.hist.push(m.price);
        if (c.hist.length > 8) c.hist.shift();
        learned++;
        const li = l?.items.find((x) => x.cid === m.cid && x.status !== "skipped");
        if (li) {
          li.actual = m.price * li.qty;
          li.status = "bought";
          actuals++;
        }
      });
    });
    setPending(null);
    toast(`✓ ${learned} prices learned, ${actuals} items marked bought`);
    partnerPing(`Shop done — ${fmt(totals(S).act)} spent`);
  };

  return (
    <>
      <div className="card">
        <h3>Upload your receipt</h3>
        <div className="note" style={{ margin: "0 0 10px" }}>
          In production you snap a photo and an LLM extracts the line items (milestone 3). For
          now, paste lines as <b>item&nbsp;name&nbsp;&nbsp;price</b>, or load a sample FairPrice
          receipt.
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)}
          placeholder={"JASMINE RICE 5KG  13.90\nEGGS 30S  8.80\nMEIJI FRESH MILK 2L  6.55"} />
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button className="btn sec" onClick={() => setText(SAMPLE_RECEIPT)}>
            Load sample receipt
          </button>
          <button className="btn" onClick={parse}>Parse receipt</button>
        </div>
      </div>

      {pending && (
        <div className="card">
          <h3>Confirm matches (asked once, remembered forever)</h3>
          {pending.map((m, i) => (
            <div className="match" key={i}>
              <div>
                <div>
                  {m.matched ? "✅" : "❓"} <b>{fmt(m.price)}</b>
                </div>
                <div className="raw">{m.raw}</div>
              </div>
              <select value={m.cid}
                onChange={(e) =>
                  setPending((p) =>
                    p.map((x, j) => (j === i ? { ...x, cid: +e.target.value } : x))
                  )
                }>
                <option value={0}>— new/skip —</option>
                {S.catalog.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={apply}>Apply — update prices &amp; actuals</button>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Why this matters</h3>
        <div className="note">
          Every receipt teaches the app your real prices at your usual shops. Estimates sharpen
          from “~guess” to solid predictions — last 4 weeks accuracy:{" "}
          {S.estAccuracy.join("% → ")}%.
        </div>
      </div>

      <div className="card">
        <h3>Shopping time (enhanced)</h3>
        <div className="note">
          ⏱ Last trip: 52 min at FairPrice Jurong Point.
          <br />
          12 of your staples are stable-priced — moving them to a monthly FairPrice Online order
          could save ~35 min/week.
        </div>
      </div>
    </>
  );
}
