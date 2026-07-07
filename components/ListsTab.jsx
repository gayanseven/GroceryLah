"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { predict, catItem, listEstimate, fmt } from "@/lib/pricing";

export default function ListsTab({ goToList }) {
  const { S, update, toast } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState(S.budget);
  const [picked, setPicked] = useState([]);

  const common = [...S.catalog]
    .sort((a, b) => b.staple - a.staple || b.hist.length - a.hist.length)
    .slice(0, 24);

  const openNew = () => {
    setName("Week of " + new Date().toLocaleDateString("en-SG", { day: "numeric", month: "short" }));
    setBudget(S.budget);
    setPicked(S.catalog.filter((c) => c.staple).map((c) => c.id));
    setOpen(true);
  };

  const togglePick = (id) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const create = () => {
    let created = "";
    update((s) => {
      const items = picked.map((cid) => ({
        id: s.nextId++, cid, qty: 1, status: "planned", by: s.user, actual: null, shop: null,
      }));
      const list = {
        id: s.nextId++,
        name: name.trim() || "Untitled list",
        budget: budget > 0 ? budget : s.budget,
        items, offPlan: [],
      };
      s.lists.push(list);
      s.activeList = list.id;
      created = list.name;
    });
    setOpen(false);
    toast(`"${created}" created ✓`);
    goToList();
  };

  const duplicate = (id) => {
    let copyName = "";
    update((s) => {
      const src = s.lists.find((l) => l.id === id);
      if (!src) return;
      const copy = {
        id: s.nextId++,
        name: src.name + " (copy)",
        budget: src.budget,
        items: src.items
          .filter((li) => li.status !== "skipped")
          .map((li) => ({
            id: s.nextId++, cid: li.cid, qty: li.qty,
            status: "planned", by: s.user, actual: null, shop: li.shop,
          })),
        offPlan: [],
      };
      s.lists.push(copy);
      s.activeList = copy.id;
      copyName = copy.name;
    });
    toast(`Duplicated → "${copyName}"`);
  };

  const remove = (id) => {
    if (!confirm("Delete this list?")) return;
    update((s) => {
      s.lists = s.lists.filter((l) => l.id !== id);
      if (s.activeList === id)
        s.activeList = s.lists.length ? s.lists[s.lists.length - 1].id : null;
    });
  };

  const estOf = (picks) =>
    picks.reduce((sum, cid) => sum + (predict(catItem(S, cid)).p || 0), 0);

  return (
    <>
      <div className="mode-row">
        <span className="cnt">
          {S.lists.length} saved list{S.lists.length === 1 ? "" : "s"}
        </span>
        <button className="mode-btn on" onClick={openNew}>＋ New list</button>
      </div>

      {open && (
        <div className="card">
          <h3>New list</h3>
          <label className="form-label">Name</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="form-label">Budget (S$)</label>
          <input className="form-input" type="number" inputMode="decimal" value={budget}
            onChange={(e) => setBudget(parseFloat(e.target.value) || S.budget)} />
          <label className="form-label">Commonly used items — tap to include</label>
          <div className="pickgrid">
            {common.map((c) => (
              <button key={c.id} className={`chip ${picked.includes(c.id) ? "sel" : ""}`}
                onClick={() => togglePick(c.id)}>
                {c.name}
              </button>
            ))}
          </div>
          <div className="note" style={{ margin: "10px 0" }}>
            {picked.length} items · est. {fmt(estOf(picked))}
          </div>
          <div className="btn-row">
            <button className="btn sec" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn" onClick={create}>Create list</button>
          </div>
        </div>
      )}

      {!S.lists.length && !open && (
        <div className="empty">No lists yet. Create your first one!</div>
      )}

      {[...S.lists].reverse().map((l) => {
        const n = l.items.filter((li) => li.status !== "skipped").length;
        const b = l.items.filter((li) => li.status === "bought").length;
        return (
          <div key={l.id} className={`lists-card ${l.id === S.activeList ? "active" : ""}`}
            onClick={() => {
              update((s) => (s.activeList = l.id));
              goToList();
            }}>
            <div className="linfo">
              <div className="lname">{l.name}</div>
              <div className="lsub">
                {n} items · {b} bought · est. {fmt(listEstimate(S, l))} / ${l.budget}
              </div>
            </div>
            {l.id === S.activeList && <span className="lbadge">ACTIVE</span>}
            <button className="del" title="Duplicate" style={{ fontSize: 14 }}
              onClick={(e) => { e.stopPropagation(); duplicate(l.id); }}>
              ⧉
            </button>
            <button className="del" onClick={(e) => { e.stopPropagation(); remove(l.id); }}>
              ✕
            </button>
          </div>
        );
      })}

      <div className="note" style={{ marginTop: 14 }}>
        💡 Tip: keep a rolling “Week of…” list plus special ones — “CNY reunion dinner”,
        “Deepavali”, “Baby supplies”.
      </div>
    </>
  );
}
