window.CC = window.CC || {};
(function (CC) {

var $ = CC.$;
var LAV = ["#E6DEF2", "#C3B3DB", "#9A86BB", "#6F5A91", "#4B3B6B"];
var GREY = "#D9D5CC";
var an = { cat: "", stackBy: "items", famSel: "", ovw: "colour", leastCat: "", util: "3m", usage: "wears", period: "monthly" };
var missing = {};

/* ---------- small helpers ---------- */
function conv(amount, cur) {
  if (amount == null || isNaN(amount)) return 0;
  var v = CC.toMain(+amount, cur);
  if (v == null) { missing[cur] = (missing[cur] || 0) + 1; return 0; }
  return v;
}
function pct(n, t) { return t ? Math.round(n / t * 100) : 0; }
function acqDate(it) { return CC.parseISO(it.dateAcquired) || (it.dateAdded ? new Date(it.dateAdded) : null); }
function lum(hex) {
  var m = /^#?([0-9a-f]{6})$/i.exec(hex || ""); if (!m) return 0.7;
  var n = parseInt(m[1], 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
function help(t) { return '<span class="help" title="' + CC.esc(t) + '">?</span>'; }
function card(title, tip, tools, body, cls) {
  return '<div class="an-card ' + (cls || "") + '"><div class="an-card-title"><span class="tt">' + title + (tip ? help(tip) : "") + "</span>" + (tools || "") + "</div>" + body + "</div>";
}
function seg(key, opts) {
  return '<div class="seg">' + opts.map(function (o) {
    return '<button data-set="' + key + ":" + o[0] + '" class="' + (an[key] === o[0] ? "active" : "") + '">' + o[1] + "</button>";
  }).join("") + "</div>";
}
function catSelect(key, items) {
  var cats = CC.CATEGORIES.filter(function (c) { return items.some(function (i) { return i.category === c; }); });
  return '<select data-sel="' + key + '"><option value="">All categories</option>' + cats.map(function (c) {
    return '<option value="' + CC.esc(c) + '"' + (an[key] === c ? " selected" : "") + ">" + CC.esc(c) + "</option>";
  }).join("") + "</select>";
}
function tile(label, value, sub, tip) {
  return '<div class="an-card"><div class="an-card-title"><span class="tt">' + label + (tip ? help(tip) : "") + '</span></div><div class="tile-v">' + value + '</div><div class="tile-s">' + (sub || "") + "</div></div>";
}
function thumb(it, cls) { return '<div class="' + cls + '">' + CC.fullImgHTML(it) + "</div>"; }
function hbars(rows, opts) {
  opts = opts || {};
  var max = Math.max.apply(null, rows.map(function (r) { return r.value; }).concat([0.0001]));
  return rows.map(function (r) {
    return '<div class="hbar-row"><span class="lbl" title="' + CC.esc(r.label) + '">' + CC.esc(r.label) + '</span><div class="hbar-track"><div class="hbar-fill ' + (r.cls || opts.cls || "") + '" style="width:' + (r.value / max * 100) + '%"></div></div><span class="hbar-val">' + r.text + (r.sub ? "<small>" + r.sub + "</small>" : "") + "</span></div>";
  }).join("");
}
function donut(slices, center, centerSub) {
  var total = slices.reduce(function (a, s) { return a + s.value; }, 0);
  var R = 50, C = 2 * Math.PI * R, off = 0;
  var arcs = total ? slices.filter(function (s) { return s.value > 0; }).map(function (s) {
    var d = s.value / total * C;
    var a = '<circle cx="70" cy="70" r="' + R + '" fill="none" stroke="' + s.color + '" stroke-width="22" stroke-dasharray="' + d + " " + (C - d) + '" stroke-dashoffset="' + (-off) + '" transform="rotate(-90 70 70)"><title>' + CC.esc(s.label) + ": " + Math.round(s.value / total * 100) + '%</title></circle>';
    off += d; return a;
  }).join("") : '<circle cx="70" cy="70" r="' + R + '" fill="none" stroke="' + GREY + '" stroke-width="22"/>';
  var svg = '<svg width="150" height="150" viewBox="0 0 140 140" role="img">' + arcs +
    (center != null ? '<text x="70" y="' + (centerSub ? 70 : 76) + '" text-anchor="middle" class="donut-center" font-size="24" fill="#1C1B18">' + center + "</text>" : "") +
    (centerSub ? '<text x="70" y="88" text-anchor="middle" font-size="9.5" fill="#8A8780">' + centerSub + "</text>" : "") + "</svg>";
  var legend = '<div class="pie-legend">' + slices.map(function (s) {
    return '<div class="pie-legend-row"><span class="pie-swatch" style="background:' + s.color + '"></span><span class="name">' + CC.esc(s.label) +
      (s.sub ? '<div class="pie-caption" style="margin:0">' + s.sub + "</div>" : "") + '</span><span class="pct">' + (s.text != null ? s.text : pct(s.value, total) + "%") + "</span></div>";
  }).join("") + "</div>";
  return '<div class="donut-wrap">' + svg + legend + "</div>";
}
function vbars(cols, cls) {
  var max = Math.max.apply(null, cols.map(function (c) { return c.value; }).concat([1]));
  return '<div class="vbars ' + (cls || "") + '">' + cols.map(function (c) {
    var h = c.value / max * 100;
    var bar = c.stack
      ? '<div class="bar" style="height:' + h + '%"><div class="seg-used" style="height:' + (c.value ? c.stack[1] / c.value * 100 : 0) + '%" title="Second-hand ' + CC.esc(CC.moneyMain(c.stack[1])) + '"></div><div class="seg-new" style="height:' + (c.value ? c.stack[0] / c.value * 100 : 0) + '%" title="New ' + CC.esc(CC.moneyMain(c.stack[0])) + '"></div></div>'
      : '<div class="bar" style="height:' + h + '%"></div>';
    return '<div class="vbar-col' + (c.stack ? " stacked" : "") + '"><div class="top">' + c.top + '</div><div class="area">' + bar + '</div><div class="bottom">' + c.bottom + "</div></div>";
  }).join("") + "</div>";
}
function miniCards(list, statFn) {
  if (!list.length) return '<div class="an-empty">Nothing to show yet.</div>';
  return '<div class="hscroll">' + list.map(function (it, i) {
    return '<div class="mini-card" data-open="' + it.id + '"><div class="mc-img">' + CC.fullImgHTML(it) + '</div><div class="mc-name" title="' + CC.esc(it.name) + '">' + (i + 1) + ". " + CC.esc(it.name) + '</div><div class="mc-stat">' + statFn(it) + "</div></div>";
  }).join("") + "</div>";
}

/* ---------- data ---------- */
function families() {
  var out = CC.COLOURS.map(function (c) { return { name: c.name, hex: c.hex }; });
  out.push({ name: "Unspecified", hex: GREY });
  return out;
}
function famOf(it) { return it.colour && CC.COLOUR_HEX[it.colour] ? it.colour : "Unspecified"; }

/* ============ CLOSET COMPOSITION ============ */
function composition(active, all) {
  var h = '<div class="an-section" id="sec-composition"><div class="an-section-h">Closet Composition</div>';

  // headline tiles
  var archived = all.length - active.length;
  var wl = CC.wishlist().length;
  h += '<div class="an-grid cols-4">' +
    tile("Pieces in closet", active.length, archived ? archived + " archived (sold / donated)" : "nothing archived", "Items you currently own — sold or donated pieces are archived and not counted.") +
    tile("Outfits saved", CC.state.outfits.length, "built in the Outfit Builder") +
    tile("Wishlist items", wl, "still being considered") +
    tile("Largest category", largest(active), "of your closet", "Your biggest category — a quick way to spot duplicates.") + "</div>";

  // category bars
  var counts = {};
  active.forEach(function (i) { var c = i.category || "Uncategorised"; counts[c] = (counts[c] || 0) + 1; });
  var rows = Object.keys(counts).map(function (c) { return { label: c, value: counts[c], text: counts[c] + " piece" + (counts[c] === 1 ? "" : "s"), sub: "(" + pct(counts[c], active.length) + "%)" }; })
    .sort(function (a, b) { return b.value - a.value; });
  var catCard = card("Closet by category", "How your closet is divided — spot structural gaps or unnecessary duplicates before you shop.", "", rows.length ? hbars(rows) : '<div class="an-empty">No items yet.</div>');

  // colour composition
  var pool = an.cat ? active.filter(function (i) { return i.category === an.cat; }) : active;
  var fam = families();
  var byCount = {}, byWear = {};
  fam.forEach(function (f) { byCount[f.name] = 0; byWear[f.name] = 0; });
  pool.forEach(function (i) { var f = famOf(i); byCount[f] += 1; byWear[f] += CC.totalWears(i); });
  var totalC = pool.length, totalW = Object.keys(byWear).reduce(function (a, k) { return a + byWear[k]; }, 0);
  var useW = an.stackBy === "wears";
  var src = useW ? byWear : byCount, srcTotal = useW ? totalW : totalC;
  var present = fam.filter(function (f) { return src[f.name] > 0; }).sort(function (a, b) { return src[b.name] - src[a.name]; });
  var stackBar = srcTotal ? '<div class="stack">' + present.map(function (f) {
    var p = pct(src[f.name], srcTotal);
    var dark = lum(/^#/.test(f.hex) ? f.hex : "#999") < 0.55;
    return '<div style="flex:' + src[f.name] + ' 1 0;background:' + f.hex + ";color:" + (dark ? "#fff" : "#1C1B18") + '" title="' + f.name + ": " + src[f.name] + (useW ? " wears" : " items") + " (" + p + '%)">' + (p >= 7 ? p + "%" : "") + "</div>";
  }).join("") + '</div><div class="stack-legend">' + present.map(function (f) {
    return '<span><i class="dot" style="background:' + f.hex + '"></i>' + f.name + " " + pct(src[f.name], srcTotal) + "%</span>";
  }).join("") + "</div>" : '<div class="an-empty">No ' + (useW ? "wears logged" : "items") + " to show for this selection.</div>";
  var colourCard = card("Colour composition", "The exact share of your wardrobe in each colour family. Switch between pieces owned and times worn.",
    catSelect("cat", active) + seg("stackBy", [["items", "By items owned"], ["wears", "By wears"]]), stackBar, "span-2");

  h += '<div class="an-grid cols-3">' + catCard + colourCard.replace('class="an-card span-2"', 'class="an-card span-2"') + "</div>";

  // heat maps
  function heat(map, total, unit) {
    var f = fam.filter(function (x) { return map[x.name] > 0; }).sort(function (a, b) { return map[b.name] - map[a.name]; });
    if (!f.length) return '<div class="an-empty">Nothing to show yet.</div>';
    var mx = map[f[0].name];
    return '<div class="heat">' + f.map(function (x) {
      var dark = lum(/^#/.test(x.hex) ? x.hex : "#999") < 0.55;
      var share = map[x.name] / mx;
      return '<div class="heat-block' + (an.famSel === x.name ? " sel" : "") + '" data-fam="' + x.name + '" style="flex:0 0 ' + Math.round(78 + share * 120) + "px;min-height:" + Math.round(70 + share * 50) + "px;background:" + x.hex + ";color:" + (dark ? "#fff" : "#1C1B18") + '" title="' + x.name + ": " + map[x.name] + " " + unit + '">' +
        '<span class="hn">' + x.name + '</span><span class="hv">' + map[x.name] + "</span></div>";
    }).join("") + "</div>";
  }
  var famItems = "";
  if (an.famSel) {
    var li = pool.filter(function (i) { return famOf(i) === an.famSel; });
    famItems = '<div class="heat-items">' + (li.length ? li.map(function (i) { return '<div class="mini-thumb" data-open="' + i.id + '" title="' + CC.esc(i.name) + '" style="cursor:pointer">' + CC.fullImgHTML(i) + "</div>"; }).join("") : "") + "</div>" +
      '<div class="an-note">' + li.length + " " + an.famSel.toLowerCase() + " piece" + (li.length === 1 ? "" : "s") + " — tap one to open it.</div>";
  }
  var shades = pool.filter(function (i) { return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(i.hex || ""); });
  var shadeRow = shades.length ? '<div class="an-note">Actual garment shades you\'ve entered:</div><div class="heat-items">' + shades.map(function (i) {
    return '<span class="swatch-dot" style="width:22px;height:22px;background:' + i.hex + '" title="' + CC.esc(i.name + " " + i.hex) + '"></span>';
  }).join("") + "</div>" : "";
  h += '<div class="an-grid cols-2">' +
    card("Colour heatmap · by items owned", "Block size is scaled by how many pieces you own in each colour family. Tap a block to see the pieces.", "", heat(byCount, totalC, "items")) +
    card("Colour heatmap · by wear frequency", "Block size is scaled by how often you actually wear each colour family.", "", heat(byWear, totalW, "wears")) + "</div>";
  if (famItems || shadeRow) h += '<div class="an-card" style="margin-bottom:16px">' + (famItems || "") + shadeRow + "</div>";

  // doughnuts
  var withFab = active.filter(function (i) { return (i.fabric || []).length; });
  var nat = 0, semi = 0, syn = 0, unk = 0;
  withFab.forEach(function (i) {
    var tot = CC.fabricTotalPct(i) || 100;
    var n = CC.pctByType(i, "natural"), s = CC.pctByType(i, "semi"), y = CC.pctByType(i, "synthetic");
    nat += n / tot; semi += s / tot; syn += y / tot; unk += Math.max(0, tot - n - s - y) / tot;
  });
  var fn = withFab.length || 1;
  var natP = Math.round(nat / fn * 100), semiP = Math.round(semi / fn * 100), synP = Math.round(syn / fn * 100);
  var fiberSlices = [
    { label: "Natural", value: nat, color: LAV[0], sub: "plant &amp; animal fibers", text: natP + "%" },
    { label: "Semi-synthetic", value: semi, color: LAV[2], sub: "regenerated cellulose", text: semiP + "%" },
    { label: "Synthetic", value: syn, color: LAV[3], sub: synP > 30 ? "consider natural swaps" : "good balance", text: synP + "%" }
  ];
  if (unk / fn > 0.005) fiberSlices.push({ label: "Not specified", value: unk, color: GREY, sub: "type not set", text: Math.round(unk / fn * 100) + "%" });
  var fiberCard = card("Fiber composition", "The average fabric makeup across the items in your closet that have fabric details.", "", withFab.length ? donut(fiberSlices) +
    '<div class="an-note">Based on ' + withFab.length + " of " + active.length + " pieces with fabric details.</div>" : '<div class="an-empty">Add fabric details to your items to see this.</div>');

  var src2 = { Purchase: 0, Gift: 0, "Hand-Made": 0 }, noSrc = 0;
  active.forEach(function (i) { if (src2[i.source] != null) src2[i.source]++; else noSrc++; });
  var srcCard = card("Source", "How your pieces came to you.", "", donut([
    { label: "Purchase", value: src2.Purchase, color: LAV[0], text: src2.Purchase + "" },
    { label: "Gift", value: src2.Gift, color: LAV[2], text: src2.Gift + "" },
    { label: "Hand-Made", value: src2["Hand-Made"], color: LAV[3], text: src2["Hand-Made"] + "" }
  ]) + (noSrc ? '<div class="an-note">' + noSrc + " piece(s) have no source set.</div>" : ""));

  var nv = 0, sh = 0, noSh = 0;
  active.forEach(function (i) { if (i.secondhand === "Yes") sh++; else if (i.secondhand === "No") nv++; else noSh++; });
  var shCard = card("New vs second-hand", "How much of your closet was bought new versus pre-owned.", "", donut([
    { label: "New", value: nv, color: LAV[1], text: nv + "" },
    { label: "Second-hand", value: sh, color: LAV[3], text: sh + "" }
  ]) + (noSh ? '<div class="an-note">' + noSh + " piece(s) not marked new or second-hand.</div>" : ""));
  h += '<div class="an-grid cols-3">' + fiberCard + srcCard + shCard + "</div>";

  // items added / sold
  var wins = [["1M", 1], ["3M", 3], ["6M", 6], ["1Y", 12]];
  var addedCols = wins.map(function (w) {
    var from = CC.monthsAgo(w[1]);
    var n = all.filter(function (i) { var d = acqDate(i); return d && d >= from; }).length;
    return { value: n, top: "+" + n, bottom: w[0] };
  });
  var soldCols = wins.map(function (w) {
    var from = CC.monthsAgo(w[1]);
    var n = all.filter(function (i) { var d = CC.parseISO(i.soldDonatedDate); return d && d >= from; }).length;
    return { value: n, top: w[0], bottom: "-" + n };
  });
  h += '<div class="an-grid cols-2">' +
    card("Items added", "Pieces added to your closet in the last month, 3 months, 6 months and year (by date acquired).", "", vbars(addedCols)) +
    card("Items sold / donated", "Pieces you've sold or donated in the same time windows.", "", vbars(soldCols, "down")) + "</div>";
  return h + "</div>";
}
function largest(active) {
  if (!active.length) return "—";
  var c = {}; active.forEach(function (i) { var k = i.category || "Uncategorised"; c[k] = (c[k] || 0) + 1; });
  var top = Object.keys(c).sort(function (a, b) { return c[b] - c[a]; })[0];
  return CC.esc(top) + ' <span style="font-size:15px;color:var(--muted)">' + pct(c[top], active.length) + "%</span>";
}

/* ============ CLOSET USAGE ============ */
function usage(active) {
  var h = '<div class="an-section" id="sec-usage"><div class="an-section-h">Closet Usage</div>';
  var byW = active.slice().sort(function (a, b) { return CC.totalWears(b) - CC.totalWears(a); });
  var most = byW.filter(function (i) { return CC.totalWears(i) > 0; });
  h += '<div class="an-grid cols-1">' + card("Most worn", "Your most-worn pieces, from most to least — scroll sideways.", "", miniCards(most, function (i) { return CC.totalWears(i) + " wears"; })) + "</div>";

  var leastPool = an.leastCat ? active.filter(function (i) { return i.category === an.leastCat; }) : active;
  var least = leastPool.slice().sort(function (a, b) {
    var d = CC.totalWears(a) - CC.totalWears(b);
    if (d) return d;
    var ad = acqDate(a), bd = acqDate(b);
    return (ad ? +ad : 0) - (bd ? +bd : 0);
  });
  h += '<div class="an-grid cols-1" style="margin-top:16px">' + card("Least worn", "Your lowest-rotation pieces — choose to style them, or to purge or resell them. Filter by category.", catSelect("leastCat", active),
    miniCards(least, function (i) { var w = CC.totalWears(i); return w ? w + " wear" + (w === 1 ? "" : "s") : "never worn"; })) + "</div>";

  // wear frequency list
  var max = Math.max.apply(null, byW.map(CC.totalWears).concat([1]));
  var freq = byW.map(function (i) {
    var w = CC.totalWears(i);
    return '<div class="rank-row" data-open="' + i.id + '" style="cursor:pointer">' + thumb(i, "rt") + '<span class="rname" title="' + CC.esc(i.name) + '">' + CC.esc(i.name) + '</span><div class="rtrack"><div class="rfill" style="width:' + (w / max * 100) + '%;background:var(--slate)"></div></div><span class="rval" style="color:var(--slate)">' + w + "×</span></div>";
  }).join("");

  // owned vs worn
  var keyFn = an.ovw === "category" ? function (i) { return i.category || "Uncategorised"; } : famOf;
  var o = {}, w = {};
  active.forEach(function (i) { var k = keyFn(i); o[k] = (o[k] || 0) + 1; w[k] = (w[k] || 0) + CC.totalWears(i); });
  var totO = active.length, totW = Object.keys(w).reduce(function (a, k) { return a + w[k]; }, 0);
  var keys = Object.keys(o).sort(function (a, b) { return o[b] - o[a]; });
  var ovwRows = keys.map(function (k) {
    var po = pct(o[k], totO), pw = pct(w[k], totW);
    var note = totW && pw < po * 0.6 ? '<span style="color:var(--terra)">under-worn</span>' : totW && pw > po * 1.4 ? '<span style="color:var(--sage-dark)">favourite</span>' : "";
    var hex = an.ovw === "colour" ? (CC.COLOUR_HEX[k] || GREY) : "";
    return '<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:4px"><span>' + (hex ? '<i class="dot" style="background:' + hex + ';margin-right:6px"></i>' : "") + CC.esc(k) + "</span><span>" + note + "</span></div>" +
      '<div class="rank-row compact" style="margin-bottom:3px"><span class="rname">Owned</span><div class="rtrack"><div class="rfill" style="width:' + po + '%;background:var(--ink)"></div></div><span class="rval">' + po + "%</span></div>" +
      '<div class="rank-row compact" style="margin-bottom:0"><span class="rname">Worn</span><div class="rtrack"><div class="rfill" style="width:' + pw + '%;background:' + LAV[2] + '"></div></div><span class="rval">' + pw + "%</span></div></div>";
  }).join("");

  // longevity
  var now = new Date(), buckets = [0, 0, 0, 0], undated = 0;
  active.forEach(function (i) {
    var d = CC.parseISO(i.dateAcquired);
    if (!d) { undated++; return; }
    var y = CC.yearsBetween(d, now);
    buckets[y < 1 ? 0 : y < 3 ? 1 : y < 5 ? 2 : 3]++;
  });
  var longevity = card("Wardrobe longevity", "How long you've owned your pieces, by date acquired.", "", donut([
    { label: "< 1 year", value: buckets[0], color: LAV[0], text: buckets[0] + " (" + pct(buckets[0], active.length - undated) + "%)" },
    { label: "1–3 years", value: buckets[1], color: LAV[1], text: buckets[1] + " (" + pct(buckets[1], active.length - undated) + "%)" },
    { label: "3–5 years", value: buckets[2], color: LAV[2], text: buckets[2] + " (" + pct(buckets[2], active.length - undated) + "%)" },
    { label: "> 5 years", value: buckets[3], color: LAV[3], text: buckets[3] + " (" + pct(buckets[3], active.length - undated) + "%)" }
  ]) + (undated ? '<div class="an-note">' + undated + " piece(s) have no date acquired and aren't included.</div>" : ""));

  // utilization
  var from = an.util === "12m" ? CC.monthsAgo(12) : CC.monthsAgo(3);
  var worn = active.filter(function (i) { return (i.wearLog || []).some(function (d) { return new Date(d) >= from; }); });
  var idle = active.filter(function (i) { return worn.indexOf(i) < 0; });
  var rate = pct(worn.length, active.length);
  var utilCard = card("Utilization rate", "The share of your closet that was actually worn in the period, versus pieces that went completely untouched. Uses dated 'I wore this today' logs.",
    seg("util", [["3m", "Last 3 months"], ["12m", "Last 12 months"]]),
    '<div class="util-big">' + rate + '%</div><div class="tile-s">' + worn.length + " of " + active.length + " pieces worn</div>" +
    '<div class="util-bar"><div style="width:' + rate + '%;background:var(--ink)"></div><div style="width:' + (100 - rate) + '%;background:' + LAV[0] + '"></div></div>' +
    '<div class="tile-s">' + idle.length + " piece" + (idle.length === 1 ? "" : "s") + " (" + (100 - rate) + "%) untouched</div>" +
    (idle.length ? '<div class="heat-items">' + idle.slice(0, 12).map(function (i) { return '<div class="mini-thumb" data-open="' + i.id + '" title="' + CC.esc(i.name) + '" style="cursor:pointer">' + CC.fullImgHTML(i) + "</div>"; }).join("") + "</div>" : ""));

  h += '<div class="an-grid cols-3" style="margin-top:16px">' +
    card("Wear frequency", "Every piece, ordered by how often it's been worn.", "", '<div class="scroll-y">' + (freq || '<div class="an-empty">No items yet.</div>') + "</div>") +
    card("Owned vs worn", "Compare each group's share of your closet with its share of your wears — to spot items that sit neglected.", seg("ovw", [["colour", "Colour"], ["category", "Category"]]),
      '<div class="scroll-y">' + ovwRows + "</div>") +
    '<div>' + utilCard + '<div style="height:16px"></div>' + longevity + "</div></div>";
  return h + "</div>";
}

/* ============ FINANCIAL BREAKDOWN ============ */
function financial(active, all) {
  var h = '<div class="an-section" id="sec-financial"><div class="an-section-h">Financial Breakdown<div class="tools"><span class="tile-s" style="margin:0">Totals in ' + CC.CUR[CC.mainCurrency()].symbol + " " + CC.mainCurrency() + '</span><button class="btn btn-ghost btn-xs" data-open-settings="1">Currency settings</button></div></div>';

  var spendItems = active.filter(function (i) { return i.source !== "Gift"; });
  var totalSpend = spendItems.reduce(function (a, i) { return a + conv(i.price, i.currency); }, 0);
  var totalValue = active.reduce(function (a, i) {
    return a + (i.originalPrice != null ? conv(i.originalPrice, i.originalCurrency) : conv(i.price, i.currency));
  }, 0);
  var wornItems = active.filter(function (i) { return CC.hasRealWears(i); });
  var avgCpw = wornItems.length ? wornItems.reduce(function (a, i) { var v = CC.costPerWearMain(i); return a + (v == null ? 0 : v); }, 0) / wornItems.length : 0;
  var savings = 0, savN = 0;
  active.concat(all.filter(function (i) { return CC.isArchived(i); })).forEach(function (i) {
    if (i.secondhand === "Yes" && i.originalPrice != null && i.price != null) {
      var d = conv(i.originalPrice, i.originalCurrency) - conv(i.price, i.currency);
      if (d > 0) { savings += d; savN++; }
    }
  });

  h += '<div class="an-grid cols-4">' +
    tile("Total spend", CC.moneyMain(totalSpend), "what you paid · gifts not counted", "Based on PURCHASE PRICE for items in your closet. Gifts aren't counted as spend.") +
    tile("Total value", CC.moneyMain(totalValue), "at original / retail price", "Based on ORIGINAL PRICE (falls back to purchase price when no original price is entered).") +
    tile("Avg cost per wear", CC.moneyMain(avgCpw), "across " + wornItems.length + " worn item" + (wornItems.length === 1 ? "" : "s"), "(Purchase price + tailoring/care) ÷ number of wears, averaged over items you've worn.") +
    tile("Second-hand savings", CC.moneyMain(savings), savN ? "across " + savN + " pre-owned piece" + (savN === 1 ? "" : "s") : "none recorded yet", "Original price minus what you paid, for items marked second-hand.") + "</div>";

  // cost per wear ranking
  var ranked = wornItems.map(function (i) { return { it: i, v: CC.costPerWearMain(i) || 0 }; }).sort(function (a, b) { return a.v - b.v; });
  var maxV = Math.max.apply(null, ranked.map(function (r) { return r.v; }).concat([0.0001]));
  var cpwRows = ranked.map(function (r) {
    var good = r.v <= avgCpw;
    return '<div class="rank-row" data-open="' + r.it.id + '" style="cursor:pointer">' + thumb(r.it, "rt") + '<span class="rname" title="' + CC.esc(r.it.name) + '">' + CC.esc(r.it.name) + '</span><div class="rtrack"><div class="rfill" style="width:' + (r.v / maxV * 100) + "%;background:" + (good ? "var(--sage)" : "var(--terra)") + '"></div></div><span class="rval" style="color:' + (good ? "var(--sage-dark)" : "var(--terra)") + '">' + CC.moneyMain(r.v) + "</span></div>";
  }).join("");
  var unworn = active.length - wornItems.length;
  var cpwCard = card("Cost per wear", "(Purchase price + tailoring/care) ÷ number of wears, for every item you've worn. Green = at or below your average; orange = costing a premium per wear.", "",
    '<div class="scroll-y">' + (cpwRows || '<div class="an-empty">Log a wear on a closet item to see this.</div>') + "</div>" +
    (unworn ? '<div class="an-note">' + unworn + " piece" + (unworn === 1 ? "" : "s") + " not worn yet.</div>" : ""));

  // usage per category
  var cat = {};
  wornItems.forEach(function (i) {
    var k = i.category || "Uncategorised";
    var c = cat[k] || (cat[k] = { wears: 0, cost: 0 });
    c.wears += CC.totalWears(i);
    var tc = CC.totalCost(i); c.cost += tc == null ? 0 : (CC.convert(tc, i.currency, CC.mainCurrency()) || 0);
  });
  var allW = 0, allC = 0; Object.keys(cat).forEach(function (k) { allW += cat[k].wears; allC += cat[k].cost; });
  var byWears = an.usage === "wears";
  var rowsU = Object.keys(cat).map(function (k) {
    var v = byWears ? cat[k].wears : (cat[k].wears ? cat[k].cost / cat[k].wears : 0);
    return { label: k, value: v, text: byWears ? v + "" : CC.moneyMain(v) };
  }).sort(function (a, b) { return b.value - a.value; });
  var totalV = byWears ? allW : (allW ? allC / allW : 0);
  rowsU.unshift({ label: "Total Wardrobe", value: totalV, text: byWears ? totalV + "" : CC.moneyMain(totalV), cls: "total" });
  var usageCard = card("Usage per category", "Switch between how many times each category was worn and what each wear cost.", seg("usage", [["wears", "# of wears"], ["cpw", "Cost per wear"]]),
    wornItems.length ? hbars(rowsU) : '<div class="an-empty">Log some wears to see this.</div>');

  // spend by category
  var spendCat = {};
  spendItems.forEach(function (i) { var k = i.category || "Uncategorised"; spendCat[k] = (spendCat[k] || 0) + conv(i.price, i.currency); });
  var rowsS = Object.keys(spendCat).map(function (k) { return { label: k, value: spendCat[k], text: CC.moneyMain(spendCat[k]), sub: "(" + pct(spendCat[k], totalSpend) + "%)" }; }).sort(function (a, b) { return b.value - a.value; });
  var spendCard = card("Spend by category", "Where your money has gone, by category (gifts excluded).", "", rowsS.length ? hbars(rowsS) : '<div class="an-empty">No prices entered yet.</div>');

  h += '<div class="an-grid cols-3">' + cpwCard + usageCard + spendCard + "</div>";

  // monthly / annual spend
  var spendAll = all.filter(function (i) { return i.source !== "Gift" && i.price != null; });
  var cols = [];
  function add(bucketKey, item) {
    var c = cols.filter(function (x) { return x.key === bucketKey; })[0]; if (!c) return;
    var v = conv(item.price, item.currency);
    if (item.secondhand === "Yes") c.used += v; else c.fresh += v;
  }
  if (an.period === "monthly") {
    for (var m = 11; m >= 0; m--) {
      var d = CC.monthsAgo(m);
      cols.push({ key: d.getFullYear() + "-" + (d.getMonth() + 1), label: d.toLocaleDateString("en-US", { month: "short" }) + (d.getMonth() === 0 || m === 11 ? " ’" + String(d.getFullYear()).slice(2) : ""), fresh: 0, used: 0 });
    }
    spendAll.forEach(function (i) { var d = acqDate(i); if (d) add(d.getFullYear() + "-" + (d.getMonth() + 1), i); });
  } else {
    var years = {};
    spendAll.forEach(function (i) { var d = acqDate(i); if (d) years[d.getFullYear()] = 1; });
    Object.keys(years).sort().forEach(function (y) { cols.push({ key: y, label: y, fresh: 0, used: 0 }); });
    spendAll.forEach(function (i) { var d = acqDate(i); if (d) add(String(d.getFullYear()), i); });
  }
  var spendTot = cols.reduce(function (a, c) { return a + c.fresh + c.used; }, 0);
  var vcols = cols.map(function (c) { var t = c.fresh + c.used; return { value: t, stack: [c.fresh, c.used], top: t ? CC.moneyMain(Math.round(t)).replace(/\.00$/, "") : "", bottom: c.label }; });
  var periodCard = card("Monthly / annual spend", "Capital you've put into your wardrobe over time, split between new and second-hand purchases (by date acquired; gifts excluded).",
    seg("period", [["monthly", "Monthly"], ["annual", "Annual"]]),
    (spendTot ? vbars(vcols, "scroll") : '<div class="an-empty">Add purchase prices and dates acquired to see this.</div>') +
    '<div class="stack-legend"><span><i class="dot" style="background:var(--ink)"></i>New</span><span><i class="dot" style="background:var(--lav-mid)"></i>Second-hand</span></div>', "span-2");

  var topSav = active.concat(all.filter(function (i) { return CC.isArchived(i); })).filter(function (i) { return i.secondhand === "Yes" && i.originalPrice != null && i.price != null; })
    .map(function (i) { return { it: i, d: conv(i.originalPrice, i.originalCurrency) - conv(i.price, i.currency) }; })
    .filter(function (x) { return x.d > 0; }).sort(function (a, b) { return b.d - a.d; }).slice(0, 5);
  var savCard = card("Second-hand savings", "How much you saved by buying pre-owned instead of at original/retail price.", "",
    '<div class="tile-v">' + CC.moneyMain(savings) + '</div><div class="tile-s">saved across ' + savN + " pre-owned piece" + (savN === 1 ? "" : "s") + "</div>" +
    (topSav.length ? '<div style="margin-top:14px">' + topSav.map(function (x) {
      return '<div class="rank-row" data-open="' + x.it.id + '" style="cursor:pointer;grid-template-columns:38px minmax(0,1fr) auto">' + thumb(x.it, "rt") + '<span class="rname">' + CC.esc(x.it.name) + '</span><span class="rval" style="color:var(--sage-dark)">' + CC.moneyMain(x.d) + "</span></div>";
    }).join("") + "</div>" : '<div class="an-note">Mark items as second-hand and add an original price to track savings.</div>'));
  h += '<div class="an-grid cols-3">' + periodCard + savCard + "</div>";

  var miss = Object.keys(missing);
  if (miss.length) {
    h += '<div class="an-note">' + miss.map(function (c) { return missing[c] + " price(s) in " + c; }).join(", ") +
      " couldn't be converted because there's no exchange rate set — they're left out of the totals above. <a href=\"#\" data-open-settings=\"1\">Set rates</a>.</div>";
  }
  return h + "</div>";
}

/* ---------- render ---------- */
CC.renderAnalytics = function () {
  var el = $("analytics-body");
  var page = $("page-analytics");
  if (!page.classList.contains("active")) return;
  var top = page.scrollTop;
  var all = CC.closet(true), active = CC.closet(false);
  if (!all.length) { el.innerHTML = '<div class="an-empty">Add items to your closet to see analytics.</div>'; return; }
  missing = {};
  el.innerHTML = composition(active, all) + usage(active) + financial(active, all);
  page.scrollTop = top;
};

CC.initAnalytics = function () {
  var body = $("analytics-body");
  body.addEventListener("click", function (e) {
    var set = e.target.closest("[data-set]");
    if (set) { var p = set.dataset.set.split(":"); an[p[0]] = p[1]; CC.renderAnalytics(); return; }
    var fam = e.target.closest("[data-fam]");
    if (fam) { an.famSel = an.famSel === fam.dataset.fam ? "" : fam.dataset.fam; CC.renderAnalytics(); return; }
    var op = e.target.closest("[data-open]");
    if (op) { CC.openDetail(op.dataset.open); return; }
    if (e.target.closest("[data-open-settings]")) { e.preventDefault(); CC.openSettings(); }
  });
  body.addEventListener("change", function (e) {
    if (e.target.dataset.sel) { an[e.target.dataset.sel] = e.target.value; CC.renderAnalytics(); }
  });
  $("analytics-jump").addEventListener("click", function (e) {
    var b = e.target.closest("[data-jump]"); if (!b) return;
    var t = $(b.dataset.jump); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
  });
};

})(window.CC);
