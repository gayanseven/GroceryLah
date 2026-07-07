export const fmt = (n) => "$" + n.toFixed(2);

export const catItem = (S, cid) => S.catalog.find((c) => c.id === cid);

export const itemShop = (S, li) => li.shop || catItem(S, li.cid).shop || null;

export const activeList = (S) =>
  S.lists.find((l) => l.id === S.activeList) || S.lists[0] || null;

/** Recency-weighted average of observed prices. */
export function predict(item) {
  const h = item.hist;
  if (!h || !h.length) return { p: null, conf: 0 };
  let w = 0, sum = 0;
  h.forEach((p, i) => {
    const wt = Math.pow(1.6, i);
    w += wt;
    sum += p * wt;
  });
  return { p: sum / w, conf: Math.min(h.length, 3) };
}

export function lineEstimate(S, li) {
  if (li.actual != null) return li.actual;
  return (predict(catItem(S, li.cid)).p || 0) * li.qty;
}

export function totals(S) {
  const l = activeList(S);
  let est = 0, act = 0;
  if (!l) return { est, act };
  l.items.forEach((li) => {
    if (li.status === "skipped") return;
    est += lineEstimate(S, li);
    if (li.actual != null) act += li.actual;
  });
  l.offPlan.forEach((o) => { act += o.amt; est += o.amt; });
  return { est, act };
}

export function listEstimate(S, l) {
  return l.items
    .filter((li) => li.status !== "skipped")
    .reduce((s, li) => s + lineEstimate(S, li), 0);
}
