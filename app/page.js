"use client";
import { useState } from "react";
import { AppProvider, useApp } from "@/lib/store";
import Onboarding from "@/components/Onboarding";
import Header from "@/components/Header";
import ListTab from "@/components/ListTab";
import ListsTab from "@/components/ListsTab";
import ReceiptTab from "@/components/ReceiptTab";
import InsightsTab from "@/components/InsightsTab";

const TABS = [
  { id: "list", icon: "🛒", label: "List" },
  { id: "lists", icon: "🗂️", label: "My Lists" },
  { id: "receipt", icon: "🧾", label: "Receipt" },
  { id: "insights", icon: "📊", label: "Insights" },
];

function Shell() {
  const { S, toastMsg } = useApp();
  const [tab, setTab] = useState("list");

  if (!S) return <div className="splash">🥬</div>;
  if (!S.onboarded) return <Onboarding />;

  return (
    <>
      <Header />
      <main className="app">
        {tab === "list" && <ListTab />}
        {tab === "lists" && <ListsTab goToList={() => setTab("list")} />}
        {tab === "receipt" && <ReceiptTab />}
        {tab === "insights" && <InsightsTab />}
      </main>
      <nav className="app">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)}>
            <span className="ic">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
      <div className={`toast ${toastMsg ? "show" : ""}`}>{toastMsg}</div>
    </>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <div className="phone">
        <Shell />
      </div>
    </AppProvider>
  );
}
