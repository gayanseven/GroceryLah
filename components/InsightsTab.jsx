"use client";
import { useApp } from "@/lib/store";
import { activeList, catItem, predict, totals, fmt } from "@/lib/pricing";

const COLORS = {
  "Rice & Staples": "#1e7d4f", "Fresh Produce": "#5cb85c", "Meat & Seafood": "#c0392b",
  "Dairy & Eggs": "#e0a800", Pantry: "#8e6c3a", Household: "#2b6cb0",
  "Snacks & Drinks": "#b83280", "Off-plan": "#777",
};

export default function InsightsTab() {
  const { S } = useApp();
  const l = activeList(S);
  const t = totals(S);
  const budget = l ? l.budget : S.budget;

  const byCat = {};
  if (l) {
    l.items.forEach((li) => {
      if (li.status === "skipped") return;
      const c = catItem(S, li.cid);
      const v = li.actual != null ? li.actual : (predict(c).p || 0) * li.qty;
      byCat[c.cat] = (byCat[c.cat] || 0) + v;
    });
    l.offPlan.forEach((o) => {
      byCat["Off-plan"] = (byCat["Off-plan"] || 0) + o.amt;
    });
  }
  const maxCat = Math.max(...Object.values(byCat), 1);

  const hits = S.history.map((h) => h.spend <= h.budget);
  let streak = 0;
  for (let i = hits.length - 1; i >= 0; i--) {
    if (hits[i]) streak++;
    else break;
  }
  const maxSpend = Math.max(...S.history.map((h) => h.spend), budget) * 1.1;

  const movers = S.catalog
    .filter((c) => c.hist.length >= 2)
    .map((c) => ({ n: c.name, d: ((c.hist[c.hist.length - 1] - c.hist[0]) / c.hist[0]) * 100 }))
    .sort((a, b) => Math.abs(b.d) - Math.abs(a.d))
    .slice(0, 4);

  return (
    <>
      <div className="statgrid">
        <div className="stat"><div className="v">{fmt(t.est)}</div><div className="l">This list (est.)</div></div>
        <div className="stat"><div className="v">{Math.round((t.est / budget) * 100)}%</div><div className="l">Of ${budget} budget</div></div>
        <div className="stat"><div className="v">{streak} wk{streak === 1 ? "" : "s"} 🔥</div><div className="l">Under-budget streak</div></div>
        <div className="stat"><div className="v">{S.estAccuracy[S.estAccuracy.length - 1]}%</div><div className="l">Estimate accuracy</div></div>
      </div>

      <div className="card">
        <h3>Where the money goes</h3>
        {Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, v]) => (
          <div className="hbar" key={cat}>
            <div className="lbl">{cat.replace(" & ", "/")}</div>
            <div className="trk">
              <div className="fil"
                style={{ width: (v / maxCat) * 100 + "%", background: COLORS[cat] || "#888" }} />
            </div>
            <div className="val">{fmt(v)}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Last {S.history.length} weeks vs budget</h3>
        <div className="weeks">
          {S.history.map((h) => (
            <div className="wk" key={h.label}>
              <div className="amt">${Math.round(h.spend)}</div>
              <div className={`col ${h.spend > h.budget ? "over" : ""}`}
                style={{ height: (h.spend / maxSpend) * 100 + "%" }} />
              <div className="cap">{h.label}</div>
            </div>
          ))}
        </div>
        <div className="note">Target = ${budget}. Red bar = over budget.</div>
        <div className="streak">
          {hits.map((h, i) => (
            <div key={i} className={`dot ${h ? "hit" : "miss"}`}>{h ? "✓" : "✕"}</div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Your basket's price movers</h3>
        {movers.map((m) => (
          <div className="riser" key={m.n}>
            <span>{m.n}</span>
            <span className={m.d >= 0 ? "up" : "dn"}>
              {m.d >= 0 ? "▲" : "▼"} {Math.abs(m.d).toFixed(1)}%
            </span>
          </div>
        ))}
        <div className="note">Tracked from your own receipts — your personal inflation, not the CPI.</div>
      </div>

      <div className="card">
        <h3>Suggestions</h3>
        <div className="note">
          💡 Toilet Rolls &amp; Cooking Oil rose &gt;5% — both are on 2-for bundles this month;
          buying double saves ~$3.40.
          <br /><br />
          📦 Your stable staples could move to a monthly online order — locks time savings and price.
          <br /><br />
          📲 Weekly WhatsApp digest arrives with the Cloud API integration (milestone 3).
        </div>
      </div>
    </>
  );
}
