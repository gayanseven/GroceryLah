"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { CATS } from "@/lib/catalog";
import { activeList, catItem, itemShop, predict, lineEstimate, totals, fmt } from "@/lib/pricing";
import { suggestions } from "@/lib/suggest";
import { ShareSheet } from "./ShareSheets";

function ItemRow({ li }) {
  const { S, update } = useApp();
  const c = catItem(S, li.cid);
  const pr = predict(c);
  const est = lineEstimate(S, li);
  const confMark = pr.conf >= 3 ? "" : "~";
  const shop = itemShop(S, li);
  const shopOpts = [...new Set([...S.shops, shop].filter(Boolean))];

  const mutate = (fn) =>
    update((s) => {
      const l = s.lists.find((x) => x.id === s.activeList) || s.lists[0];
      const item = l?.items.find((x) => x.id === li.id);
      if (item) fn(item, l);
    });

  return (
    <div className={`item ${li.status === "bought" ? "bought" : ""}`}>
      <div className="chk"
        onClick={() => mutate((it) => (it.status = it.status === "bought" ? "planned" : "bought"))}>
        {li.status === "bought" ? "✓" : ""}
      </div>
      <div className="iinfo">
        <div className="nm">{c.name}</div>
        <div className="sub">
          {S.showPrices &&
            (li.actual != null ? (
              <span>paid {fmt(li.actual)}</span>
            ) : (
              <span className={pr.conf < 3 ? "conf" : ""}>
                {confMark}{pr.p ? fmt(pr.p) : "?"} /{c.unit}
              </span>
            ))}
          <select className="shopsel" value={shop || ""}
            onChange={(e) => mutate((it) => (it.shop = e.target.value || null))}>
            <option value="">Any shop</option>
            {shopOpts.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <select className="qsel" value={li.qty}
        onChange={(e) => mutate((it) => (it.qty = +e.target.value))}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      {S.showPrices && <div className="prc">{fmt(est)}</div>}
      <button className="del"
        onClick={() => update((s) => {
          const l = s.lists.find((x) => x.id === s.activeList) || s.lists[0];
          if (l) l.items = l.items.filter((x) => x.id !== li.id);
        })}>
        ✕
      </button>
    </div>
  );
}

export default function ListTab() {
  const { S, update, toast, partnerPing } = useApp();
  const [q, setQ] = useState("");
  const [sheet, setSheet] = useState(null); // 'share' | null
  const l = activeList(S);

  if (!l) return <div className="empty">No list yet — create one in My Lists.</div>;

  const t = totals(S);
  const over = t.est > l.budget;
  const live = l.items.filter((li) => li.status !== "skipped");
  const nBought = l.items.filter((li) => li.status === "bought").length;
  const sugs = suggestions(S, q);
  const onListIds = new Set(live.map((li) => li.cid));

  const addByCid = (cid) => {
    const c = catItem(S, cid);
    let bumped = null;
    update((s) => {
      const al = s.lists.find((x) => x.id === s.activeList) || s.lists[0];
      const existing = al.items.find((li) => li.cid === cid && li.status !== "skipped");
      if (existing) {
        existing.qty = Math.min(8, existing.qty + 1);
        bumped = existing.qty;
      } else {
        al.items.push({ id: s.nextId++, cid, qty: 1, status: "planned", by: s.user, actual: null, shop: null });
      }
    });
    setQ("");
    toast(bumped ? `${c.name} → x${bumped}` : `Added ${c.name}`);
    partnerPing(`${S.user} added ${c.name}`);
  };

  const addNew = () => {
    const name = q.trim();
    if (!name) return;
    const pretty = name[0].toUpperCase() + name.slice(1);
    update((s) => {
      const c = { id: s.nextId++, name: pretty, cat: "Pantry", unit: "pc", hist: [], staple: false, shop: null };
      s.catalog.push(c);
      const al = s.lists.find((x) => x.id === s.activeList) || s.lists[0];
      al.items.push({ id: s.nextId++, cid: c.id, qty: 1, status: "planned", by: s.user, actual: null, shop: null });
    });
    setQ("");
    toast(`Added ${pretty} — price learns from your first receipt`);
    partnerPing(`${S.user} added ${pretty}`);
  };

  const pickFirst = () => {
    if (!q.trim()) return;
    const exact = sugs.find((c) => c.name.toLowerCase() === q.trim().toLowerCase());
    if (exact) addByCid(exact.id);
    else if (sugs.length === 1) addByCid(sugs[0].id);
    else addNew();
  };

  const groups =
    S.groupBy === "shop"
      ? [...S.shops.map((s) => ({ key: s, label: s })), { key: null, label: "Anywhere" }]
      : CATS.map((c) => ({ key: c, label: c }));

  const groupItems = (g) => {
    if (S.groupBy === "shop") {
      let items = live.filter((li) => itemShop(S, li) === g.key);
      if (g.key === null) {
        const other = live.filter((li) => {
          const s = itemShop(S, li);
          return s && !S.shops.includes(s);
        });
        items = items.concat(other);
      }
      return items;
    }
    return live.filter((li) => catItem(S, li.cid).cat === g.key);
  };

  return (
    <>
      <div className="addwrap">
        <div className="addrow">
          <input placeholder="Add item… just type 'milk' or 'fish'" autoComplete="off"
            value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && pickFirst()} />
        </div>
        {q.trim() && (
          <div className="suggest">
            {sugs.map((c) => (
              <div key={c.id} className="sug" onClick={() => addByCid(c.id)}>
                <span>{c.name}</span>
                {onListIds.has(c.id) && <span className="onlist">on list · +1</span>}
                <span className="scat">{c.cat.split(" ")[0]}</span>
              </div>
            ))}
            {!sugs.some((c) => c.name.toLowerCase() === q.trim().toLowerCase()) && (
              <div className="sug new" onClick={addNew}>＋ Add “{q.trim()}”</div>
            )}
            {sugs.length > 1 && (
              <div className="sug-hint">
                Several variants — pick one, or just add the plain word. Your receipt will teach
                the exact brand &amp; size.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mode-row">
        <span className="cnt">{live.length} items · {nBought} bought</span>
        <button className={`mode-btn ${S.groupBy === "shop" ? "on" : ""}`}
          onClick={() => update((s) => (s.groupBy = s.groupBy === "shop" ? "cat" : "shop"))}>
          {S.groupBy === "shop" ? "🏬 By shop" : "🗂 By category"}
        </button>
        <button className={`mode-btn ${S.showPrices ? "" : "on"}`}
          onClick={() => update((s) => (s.showPrices = !s.showPrices))}>
          {S.showPrices ? "🙈 Hide prices" : "✨ Simple mode"}
        </button>
      </div>

      {over && S.showPrices && (
        <div className="card" style={{ background: "var(--amber-soft)" }}>
          <span className="pill warn">⚠ Est. {fmt(t.est - l.budget)} over budget</span>
          <div className="note">
            Your priciest items are in Meat &amp; Seafood — skip one, or check this week's 2-for offers.
          </div>
        </div>
      )}

      {groups.map((g) => {
        const items = groupItems(g);
        if (!items.length) return null;
        const sorted = [...items].sort(
          (a, b) => (a.status === "bought") - (b.status === "bought")
        );
        return (
          <div key={g.label}>
            <div className="cat-label">{g.label}</div>
            {sorted.map((li) => (
              <ItemRow key={li.id} li={li} />
            ))}
          </div>
        );
      })}

      {l.offPlan.length > 0 && (
        <>
          <div className="cat-label">Bought outside plan</div>
          {l.offPlan.map((o, i) => (
            <div className="item" key={i}>
              <div className="iinfo">
                <div className="nm">{o.desc}</div>
                <div className="sub">off-plan</div>
              </div>
              <div className="prc">{fmt(o.amt)}</div>
              <button className="del"
                onClick={() => update((s) => {
                  const al = s.lists.find((x) => x.id === s.activeList) || s.lists[0];
                  al.offPlan.splice(i, 1);
                })}>
                ✕
              </button>
            </div>
          ))}
        </>
      )}

      <div className="share-row">
        <button className="wa-btn" onClick={() => setSheet("share")}>🔗 Share</button>
      </div>

      {sheet === "share" && <ShareSheet onClose={() => setSheet(null)} />}
    </>
  );
}
