"use client";
import { useApp } from "@/lib/store";
import { activeList, totals, fmt } from "@/lib/pricing";

export default function Header() {
  const { S, update, toast } = useApp();
  const l = activeList(S);
  const t = totals(S);
  const budget = l ? l.budget : S.budget;

  const editBudget = () => {
    if (!l) return;
    const v = prompt("Budget for this list (S$):", l.budget);
    const n = parseFloat(v);
    if (!isNaN(n) && n > 0) {
      update((s) => {
        const al = s.lists.find((x) => x.id === l.id);
        if (al) al.budget = n;
      });
      toast("Budget updated");
    }
  };

  return (
    <header className="app">
      <div className="top">
        <div>
          <h1>🥬 GroceryLah</h1>
          <div className="week">
            {(S.household ? S.household + " · " : "") + (l ? l.name : "no list")}
          </div>
        </div>
      </div>
      <div className="budgetbox">
        <div className="nums">
          <span>
            Est. <b>{fmt(t.est)}</b> · Actual <b>{fmt(t.act)}</b>
          </span>
          <span>
            Budget <b>${budget}</b>{" "}
            <button className="budget-edit" onClick={editBudget}>edit</button>
          </span>
        </div>
        <div className={`bar ${t.est > budget ? "over" : ""}`}>
          <div className="est" style={{ width: Math.min(100, (t.est / budget) * 100) + "%" }} />
          <div className="act" style={{ width: Math.min(100, (t.act / budget) * 100) + "%" }} />
        </div>
      </div>
    </header>
  );
}
