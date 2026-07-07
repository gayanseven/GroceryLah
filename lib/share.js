import { CATS } from "./catalog";
import { activeList, catItem, itemShop, totals, fmt } from "./pricing";

export function buildWAMessage(S) {
  const l = activeList(S);
  const t = totals(S);
  let msg = `\u{1F6D2} *${l.name} — ${S.household}*\n`;
  const live = l.items.filter((li) => li.status !== "skipped");
  const line = (li) =>
    `${li.status === "bought" ? "✅" : "◻️"} ${catItem(S, li.cid).name}${li.qty > 1 ? ` x${li.qty}` : ""}`;
  if (S.groupBy === "shop") {
    const groups = [...S.shops, null];
    const other = live.filter((li) => {
      const s = itemShop(S, li);
      return s && !S.shops.includes(s);
    });
    groups.forEach((g) => {
      let items = live.filter((li) => itemShop(S, li) === g);
      if (g === null) items = items.concat(other);
      if (!items.length) return;
      msg += `\n*${g || "Anywhere"}*\n` + items.map(line).join("\n") + "\n";
    });
  } else {
    CATS.forEach((cat) => {
      const items = live.filter((li) => catItem(S, li.cid).cat === cat);
      if (!items.length) return;
      msg += `\n*${cat}*\n` + items.map(line).join("\n") + "\n";
    });
  }
  const open = live.filter((li) => li.status !== "bought").length;
  msg += `\n\u{1F4CB} ${open} to buy`;
  if (S.showPrices) msg += ` · \u{1F4B0} Est. ${fmt(t.est)} / Budget $${l.budget}`;
  return msg;
}

export function encodeShareData(S) {
  const l = activeList(S);
  const data = {
    n: l.name,
    h: S.household,
    items: l.items
      .filter((li) => li.status !== "skipped")
      .map((li) => ({
        t: catItem(S, li.cid).name,
        q: li.qty,
        s: itemShop(S, li) || "",
        d: li.status === "bought" ? 1 : 0,
      })),
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

export function decodeShareData(hash) {
  return JSON.parse(decodeURIComponent(escape(atob(hash))));
}

/** Render WhatsApp *bold* / _italic_ markers as HTML (input is escaped first). */
export function waRichHtml(msg) {
  const esc = msg.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return esc
    .replace(/\*([^*\n]+)\*/g, "<b>$1</b>")
    .replace(/_([^_\n]+)_/g, "<i>$1</i>");
}
