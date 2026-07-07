/** Fuzzy type-ahead over the household catalog. */
export function suggestions(S, q) {
  q = q.toLowerCase().trim();
  if (!q) return [];
  const qTok = q.split(/\s+/);
  return S.catalog
    .map((c) => {
      const name = c.name.toLowerCase();
      let score = 0;
      qTok.forEach((t) => {
        if (name.includes(t)) score += t.length >= 3 ? 3 : 1;
        else if (name.split(/[\s()]+/).some((w) => w.startsWith(t))) score += 1;
      });
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.c.hist.length - a.c.hist.length)
    .slice(0, 5)
    .map((x) => x.c);
}

/** Parse "ITEM NAME  12.34" receipt lines and fuzzy-match against the catalog. */
export function parseReceiptText(S, txt) {
  return txt
    .split("\n")
    .map((line) => {
      const m = line.trim().match(/^(.*?)[\s]+(\d+\.\d{2})$/);
      if (!m) return null;
      const raw = m[1].trim();
      const price = parseFloat(m[2]);
      let best = null, bestScore = 0;
      const rTok = raw.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/);
      S.catalog.forEach((c) => {
        const cTok = c.name.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/);
        let score = 0;
        rTok.forEach((t) =>
          cTok.forEach((ct) => {
            if (ct.startsWith(t.slice(0, 4)) && t.length > 2) score++;
          })
        );
        if (score > bestScore) { bestScore = score; best = c; }
      });
      return { raw, price, cid: bestScore > 0 ? best.id : 0, matched: bestScore > 0 };
    })
    .filter(Boolean);
}

export const SAMPLE_RECEIPT = `JASMINE RICE 5KG  14.20
EGGS FRESH 30S  8.80
MEIJI FRESH MILK 2L  6.55
KANG KONG PKT  1.45
CHKN THIGH FILLET 500G  6.10
GARDENIA WHT 400G  2.90
TOILET ROLL 3PLY 10S  6.90
COOKING OIL SUNFLR 2L  8.30
TOFU SILKEN TWIN  1.60
DEL MONTE BANANA  3.20`;
