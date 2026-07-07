"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { DEFAULT_SHOPS, demoState } from "@/lib/catalog";

export default function Onboarding() {
  const { S, replace, toast } = useApp();
  const [step, setStep] = useState(1);
  const [household, setHousehold] = useState("");
  const [m1, setM1] = useState("");
  const [m2, setM2] = useState("");
  const [budget, setBudget] = useState(160);
  const [shops, setShops] = useState(["FairPrice", "Wet market", "Indian shop"]);
  const [custom, setCustom] = useState("");
  const [picked, setPicked] = useState(null);

  const toggleShop = (s) =>
    setShops((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const addCustomShop = () => {
    const v = custom.trim();
    if (!v) return;
    if (!shops.includes(v)) setShops([...shops, v]);
    setCustom("");
  };
  const pickedList = picked ?? S.catalog.filter((c) => c.staple).map((c) => c.id);
  const togglePick = (id) =>
    setPicked(
      pickedList.includes(id) ? pickedList.filter((x) => x !== id) : [...pickedList, id]
    );

  const next = () => {
    if (step === 1 && !m1.trim()) return toast("Enter your name");
    setStep(step + 1);
  };

  const finish = () => {
    const s = structuredClone(S);
    s.household = household.trim() || "My household";
    s.users = [m1.trim() || "Me", m2.trim() || "Partner"].filter(Boolean);
    s.user = s.users[0];
    s.budget = budget > 0 ? budget : 160;
    s.shops = shops.length ? shops : ["FairPrice"];
    const items = pickedList.map((cid) => ({
      id: s.nextId++, cid, qty: 1, status: "planned", by: s.user, actual: null, shop: null,
    }));
    const name =
      "Week of " + new Date().toLocaleDateString("en-SG", { day: "numeric", month: "short" });
    const list = { id: s.nextId++, name, budget: s.budget, items, offPlan: [] };
    s.lists.push(list);
    s.activeList = list.id;
    s.onboarded = true;
    replace(s);
    toast(`Welcome, ${s.user}! List created \u{1F389}`);
  };

  const loadDemo = () => {
    replace(demoState());
    toast("Demo household loaded");
  };

  return (
    <div className="ob">
      <div className="dots">
        {[1, 2, 3].map((i) => (
          <span key={i} className={i <= step ? "on" : ""} />
        ))}
      </div>

      {step === 1 && (
        <>
          <div className="logo">🥬</div>
          <h2>Welcome to GroceryLah</h2>
          <div className="tag">
            One shared list for the whole household.
            <br />
            Plan in 5 minutes, stick to your budget.
          </div>
          <label>Household name</label>
          <input placeholder="e.g. Tan family" value={household}
            onChange={(e) => setHousehold(e.target.value)} />
          <label>Your name</label>
          <input placeholder="e.g. Gayan" value={m1} onChange={(e) => setM1(e.target.value)} />
          <label>Partner / family member</label>
          <input placeholder="e.g. Nadee" value={m2} onChange={(e) => setM2(e.target.value)} />
          <div className="foot">
            <button className="btn" onClick={next}>Continue</button>
            <div style={{ textAlign: "center" }}>
              <button className="skip" onClick={loadDemo}>Skip — explore with demo data</button>
            </div>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="logo">💰</div>
          <h2>Budget &amp; your shops</h2>
          <div className="tag">Set a weekly target and tell us where you usually buy.</div>
          <label>Weekly grocery budget (S$)</label>
          <input type="number" inputMode="decimal" value={budget}
            onChange={(e) => setBudget(parseFloat(e.target.value) || 160)} />
          <label>Where do you shop?</label>
          <div className="pickgrid">
            {[...DEFAULT_SHOPS, ...shops.filter((s) => !DEFAULT_SHOPS.includes(s))].map((s) => (
              <button key={s} className={`chip ${shops.includes(s) ? "sel" : ""}`}
                onClick={() => toggleShop(s)}>
                {s}
              </button>
            ))}
          </div>
          <label>Add another shop</label>
          <input placeholder="e.g. Mustafa, RedMart" value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomShop()} />
          <div className="foot">
            <button className="btn" onClick={next}>Continue</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="logo">🛒</div>
          <h2>Build your first list</h2>
          <div className="tag">
            These are commonly bought items in SG households.
            <br />
            Tap to add or remove — you can always edit later.
          </div>
          <div className="pickgrid">
            {S.catalog.map((c) => (
              <button key={c.id} className={`chip ${pickedList.includes(c.id) ? "sel" : ""}`}
                onClick={() => togglePick(c.id)}>
                {c.name}
              </button>
            ))}
          </div>
          <div className="foot">
            <div className="note" style={{ textAlign: "center", marginBottom: 10 }}>
              {pickedList.length} items selected
            </div>
            <button className="btn" onClick={finish}>Create my list →</button>
          </div>
        </>
      )}
    </div>
  );
}
