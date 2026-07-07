export const CATS = [
  "Rice & Staples", "Fresh Produce", "Meat & Seafood",
  "Dairy & Eggs", "Pantry", "Household", "Snacks & Drinks",
];

export const DEFAULT_SHOPS = [
  "FairPrice", "Giant", "Sheng Siong", "Cold Storage", "Wet market", "Indian shop",
];

// name, category, unit, price history (most recent last), staple, default shop
const seedCatalog = [
  ["Jasmine Rice 5kg", "Rice & Staples", "bag", [13.5, 13.9, 13.9], true, null],
  ["Eggs 30pk", "Dairy & Eggs", "tray", [8.2, 8.5, 8.65], true, null],
  ["Meiji Milk 2L", "Dairy & Eggs", "btl", [6.1, 6.4, 6.4], true, null],
  ["Kang Kong", "Fresh Produce", "pkt", [1.2, 1.35, 1.4], true, "Wet market"],
  ["Xiao Bai Cai", "Fresh Produce", "pkt", [1.3, 1.3, 1.45], true, "Wet market"],
  ["Tomatoes 500g", "Fresh Produce", "pkt", [2.2, 2.35], false, "Wet market"],
  ["Bananas (Del Monte)", "Fresh Produce", "bunch", [2.8, 2.95, 3.1], true, null],
  ["Chicken Thigh 500g", "Meat & Seafood", "pkt", [5.5, 5.8, 5.95], true, null],
  ["Batang Fish Steak", "Meat & Seafood", "pkt", [9.8, 10.2], false, "Wet market"],
  ["Prawns 300g", "Meat & Seafood", "pkt", [8.9], false, "Wet market"],
  ["Minced Pork 300g", "Meat & Seafood", "pkt", [4.6, 4.75], false, null],
  ["Gardenia Bread", "Rice & Staples", "loaf", [2.75, 2.75, 2.9], true, null],
  ["Bee Hoon 400g", "Rice & Staples", "pkt", [1.85], false, null],
  ["Milo 900g Refill", "Snacks & Drinks", "pkt", [12.9, 13.5], false, null],
  ["Kopi-O Powder", "Snacks & Drinks", "pkt", [4.9], false, null],
  ["Yakult 5pk", "Dairy & Eggs", "pkt", [3.1, 3.25], false, null],
  ["Soy Sauce (Tai Hua)", "Pantry", "btl", [2.6], false, null],
  ["Cooking Oil 2L", "Pantry", "btl", [7.8, 8.1], true, null],
  ["Ikan Bilis 200g", "Pantry", "pkt", [5.4], false, "Indian shop"],
  ["Dhal 500g", "Pantry", "pkt", [2.8], false, "Indian shop"],
  ["Curry Powder 250g", "Pantry", "pkt", [3.6], false, "Indian shop"],
  ["Dish Soap (Mama Lemon)", "Household", "btl", [2.3, 2.3], false, null],
  ["Toilet Rolls 10pk", "Household", "pkt", [6.5, 6.9], true, null],
  ["Laundry Detergent 3kg", "Household", "pkt", [11.9], false, null],
  ["Tofu (Silken) 2pk", "Fresh Produce", "pkt", [1.6, 1.6], true, null],
  ["Apples Fuji 6pk", "Fresh Produce", "pkt", [4.2, 4.5], false, null],
  ["Cheese Slices 12s", "Dairy & Eggs", "pkt", [4.05], false, null],
];

export function makeCatalog() {
  return seedCatalog.map((s, i) => ({
    id: i + 1, name: s[0], cat: s[1], unit: s[2],
    hist: [...s[3]], staple: s[4], shop: s[5],
  }));
}

export const baseState = () => ({
  onboarded: false,
  household: "", budget: 160, showPrices: false, groupBy: "cat",
  user: "", users: [],
  shops: ["FairPrice", "Wet market", "Indian shop"],
  catalog: makeCatalog(),
  lists: [], activeList: null,
  history: [
    { label: "7 Jun", spend: 171.4, budget: 160 },
    { label: "14 Jun", spend: 158.2, budget: 160 },
    { label: "21 Jun", spend: 149.8, budget: 160 },
    { label: "28 Jun", spend: 155.6, budget: 160 },
  ],
  estAccuracy: [88, 91, 94, 96],
  nextId: 100,
});

export function demoState() {
  const s = baseState();
  s.onboarded = true;
  s.household = "Gunarathne family";
  s.user = "Gayan";
  s.users = ["Gayan", "Nadee"];
  const picks = [[1,1],[2,1],[3,2],[4,2],[7,1],[8,2],[12,1],[18,1],[23,1],[25,1],[5,1],[9,1],[10,1],[11,1],[14,1],[16,1],[24,1],[26,1]];
  const items = picks.map(([cid, qty], i) => ({
    id: i + 1, cid, qty, status: "planned", by: i % 2 ? "Nadee" : "Gayan", actual: null, shop: null, addedAfterFinalize: false,
  }));
  s.lists = [{
    id: 1, name: "Week of 7 Jul", budget: 160, finalized: false, finalizedAt: null, items,
    offPlan: [{ desc: "7-Eleven ice cream", amt: 3.5, by: "Gayan" }],
  }];
  s.activeList = 1;
  return s;
}
