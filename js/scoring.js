window.CC = window.CC || {};
(function (CC) {

/* ---------- wears & cost per wear ---------- */
CC.estWears = function (it) { return it.estimatedWears || CC.WEAR_DEFAULT[it.category] || 30; };
CC.totalWears = function (it) { return (it.timesWornStart || 0) + (it.wearLog || []).length; };

// Convert between currencies through the main currency, using the user's own rates.
CC.convert = function (amount, from, to) {
  if (amount == null || isNaN(amount)) return 0;
  from = from || CC.mainCurrency(); to = to || CC.mainCurrency();
  if (from === to) return amount;
  var m = CC.toMain(amount, from);
  if (m == null) return null;
  if (to === CC.mainCurrency()) return m;
  var r = CC.state.settings.rates[to];
  return r ? m / r : null;
};

// Everything paid for the item, in the item's own currency (purchase price + tailoring/service care).
CC.totalCost = function (it) {
  var base = it.price == null ? null : +it.price;
  if (base == null || isNaN(base)) return null;
  var extra = 0;
  if (it.tailorCost) {
    var c = CC.convert(+it.tailorCost, it.tailorCurrency || it.currency, it.currency);
    extra = c == null ? 0 : c;
  }
  return base + extra;
};
CC.hasRealWears = function (it) { return it.status === "closet" && CC.totalWears(it) > 0; };
// (Purchase price + tailoring/care) ÷ number of wears; wishlist items (and unworn ones) use the estimate.
CC.costPerWear = function (it) {
  var total = CC.totalCost(it);
  if (total == null) return null;
  var wears = CC.hasRealWears(it) ? CC.totalWears(it) : CC.estWears(it);
  return total / Math.max(1, wears);
};
CC.costPerWearMain = function (it) {
  var v = CC.costPerWear(it);
  return v == null ? null : CC.convert(v, it.currency, CC.mainCurrency());
};
CC.moneyItem = function (it, amount) { return CC.money(amount, it.currency); };

/* ---------- fabric ---------- */
CC.rowType = function (row) {
  if (row.type) return row.type;
  var lib = CC.FABRICS[row.fiber];
  return lib ? lib.type : "";
};
CC.rowLabel = function (row) {
  if (row.fiber === "Other") return row.other || "Other";
  return row.fiber;
};
CC.pctByType = function (it, type) {
  return (it.fabric || []).reduce(function (a, r) { return a + (CC.rowType(r) === type ? (+r.percent || 0) : 0); }, 0);
};
CC.fabricTotalPct = function (it) {
  return (it.fabric || []).reduce(function (a, r) { return a + (+r.percent || 0); }, 0);
};
// Score only the fabrics we can score; report how much of the garment that covers.
CC.computeSustainability = function (fabric) {
  if (!fabric || !fabric.length) return null;
  var total = 0, scoredPct = 0, weighted = 0;
  fabric.forEach(function (r) {
    var p = +r.percent || 0;
    total += p;
    var lib = CC.FABRICS[r.fiber];
    if (lib && lib.score != null) { weighted += lib.score * p; scoredPct += p; }
  });
  if (!scoredPct) return null;
  var score = Math.round(weighted / scoredPct);
  return { score: score, tier: CC.tierFromScore(score), coverage: total ? Math.round(scoredPct / total * 100) : 100 };
};
CC.dominantFabric = function (fabric) {
  var rows = (fabric || []).filter(function (r) { var l = CC.FABRICS[r.fiber]; return l && l.score != null; });
  rows.sort(function (a, b) { return (b.percent || 0) - (a.percent || 0); });
  return rows[0] ? { row: rows[0], lib: CC.FABRICS[rows[0].fiber] } : null;
};
CC.dominantFabricNote = function (fabric) {
  var d = CC.dominantFabric(fabric);
  return d ? d.lib.note + (d.lib.est ? " (Estimated score.)" : "") : "";
};
CC.sustainabilityText = function (s) {
  if (!s) return "Not enough fabric data";
  return s.tier + " (" + s.score + "/100)" + (s.coverage < 100 ? " · based on " + s.coverage + "% of the fabric" : "");
};

/* ---------- outfit value ---------- */
CC.outfitCount = function (items) {
  function n(f) { return items.filter(f).length; }
  var tops = n(function (i) { return i.category === "Tops"; });
  var bottoms = n(function (i) { return i.category === "Bottoms"; });
  var wholes = n(function (i) { return i.category === "Dresses & Jumpsuits" || i.category === "One pieces" || i.category === "Matching Sets"; });
  var shoes = n(function (i) { return i.category === "Footwear"; });
  return (tops * bottoms + wholes) * Math.max(shoes, 1);
};
CC.scoreItem = function (item) {
  var sus = CC.computeSustainability(item.fabric);
  var fabScore = sus ? sus.score : 50;
  var cpw = CC.costPerWearMain(item);
  var cpwScore = cpw == null ? 50 : Math.round(Math.max(0, Math.min(100, 100 - (cpw - 1) * 8)));
  var pool = CC.closet();
  var unlocked = Math.max(CC.outfitCount(pool.concat([item])) - CC.outfitCount(pool), 0);
  var outfitScore = Math.round(Math.min(100, unlocked * 25));
  var total = Math.round(fabScore * 0.4 + cpwScore * 0.35 + outfitScore * 0.25);
  return { fabScore: fabScore, cpwScore: cpwScore, outfitScore: outfitScore, total: total, unlocked: unlocked };
};

/* ---------- misc ---------- */
CC.itemCategoryLabel = function (it) { return (it.subcategory && it.subcategory !== "Other") ? it.subcategory : (it.category || "uncategorised"); };
CC.itemFallbackIcon = function (it) { return CC.CATEGORY_ICON[it.category] || "👚"; };
CC.sameSubcategory = function (it, pool) {
  return pool.filter(function (o) { return o.id !== it.id && it.category && o.category === it.category && it.subcategory && o.subcategory === it.subcategory; });
};
CC.sameCategory = function (it, pool) {
  return pool.filter(function (o) { return o.id !== it.id && it.category && o.category === it.category; });
};
CC.colourSwatch = function (it) {
  if (it.hex && /^#[0-9a-f]{3,8}$/i.test(it.hex)) return it.hex;
  return CC.COLOUR_HEX[it.colour] || "";
};

})(window.CC);
