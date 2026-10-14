window.CC = window.CC || {};
(function (CC) {

var $ = CC.$;

/* ---------- wishlist cards ---------- */
function verdictRow(label, score, color) {
  return '<div class="verdict-row"><span class="verdict-label">' + label + '</span><div class="verdict-track"><div class="verdict-fill" style="width:' + score + '%;background:' + color + '"></div></div><span class="verdict-score" style="color:' + color + '">' + score + "</span></div>";
}

CC.renderWishlist = function () {
  var q = $("wishlist-search").value.trim();
  var cat = $("wishlist-filter-category").value, sub = $("wishlist-filter-sub").value;
  var all = CC.wishlist();
  var items = all.filter(function (i) {
    if (cat && i.category !== cat) return false;
    if (!CC.matchesSub(i, sub)) return false;
    return CC.matchesSearch(i, q);
  });
  $("wish-count").textContent = all.length + " item" + (all.length !== 1 ? "s" : "") + " considering";
  $("strip-count-centre").textContent = all.length;
  var grid = $("wishlist-grid");
  if (!items.length) {
    grid.innerHTML = all.length ? '<div class="an-empty" style="grid-column:1/-1">No items match your filters.</div>' : "";
    return;
  }
  var sel = CC.state.compare.wishSel;
  grid.innerHTML = items.map(function (it) {
    var s = CC.scoreItem(it), on = sel.indexOf(it.id) > -1;
    var cpw = CC.costPerWear(it);
    return '<div class="wish-card' + (on ? " selected" : "") + '" draggable="true" data-drag-id="' + it.id + '" data-id="' + it.id + '">' +
      '<div class="wish-img">' + CC.thumbHTML(it) +
      '<div class="wish-compare-toggle" data-toggle-compare="' + it.id + '">' + (on ? "✓ compare" : "+ compare") + "</div>" +
      '<div class="wish-remove" data-remove-wish="' + it.id + '">&times;</div></div>' +
      '<div class="wish-body"><div class="wish-brand">' + CC.esc(it.brand || "") + "</div>" +
      '<div class="wish-name">' + CC.esc(it.name) + "</div>" +
      '<div class="verdict-bar">' +
      verdictRow("Sustainability", s.fabScore, s.fabScore >= 60 ? "var(--sage)" : "var(--terra)") +
      verdictRow("Cost/wear", s.cpwScore, "var(--slate)") +
      verdictRow("Outfit value", s.outfitScore, "var(--pebble)") + "</div>" +
      '<span class="overall-chip">' + s.total + "/100 overall</span>" +
      '<div class="wish-price">' + (it.price != null ? CC.money(it.price, it.currency) : "No price") + " · ~" + (cpw == null ? "—" : CC.money(cpw, it.currency)) + "/wear est.</div>" +
      '<div class="wish-actions"><button class="wish-btn" data-purchase="' + it.id + '">→ Move to closet</button>' +
      '<button class="wish-btn primary" data-try="' + it.id + '">Try on</button></div></div></div>';
  }).join("");
};

/* ---------- compare ---------- */
function best(vals, higherBetter) {
  var nums = vals.filter(function (v) { return v != null && !isNaN(v); });
  if (nums.length < 2) return [];
  var mx = Math.max.apply(null, nums), mn = Math.min.apply(null, nums);
  if (mx === mn) return vals.map(function () { return ""; });
  return vals.map(function (v) {
    if (v == null || isNaN(v)) return "";
    if (v === (higherBetter ? mx : mn)) return "best";
    if (v === (higherBetter ? mn : mx)) return "worst";
    return "";
  });
}
function topFabric(it) {
  var rows = (it.fabric || []).slice().sort(function (a, b) { return (b.percent || 0) - (a.percent || 0); });
  return rows[0] ? CC.esc(CC.rowLabel(rows[0])) + " " + rows[0].percent + "%" : "—";
}
function headCell(it, tag, cand) {
  return '<th class="' + (cand ? "cand" : "") + '"><div class="cmp-head"><div class="cmp-thumb">' + CC.fullImgHTML(it) + "</div>" +
    '<div class="cmp-name">' + CC.esc(it.name) + '</div><div class="cmp-tag">' + tag + "</div></div></th>";
}
function table(cols, rows) {
  var h = '<div class="cmp-wrap"><table class="cmp"><thead><tr><th class="metric"></th>' +
    cols.map(function (c) { return headCell(c.item, c.tag, c.cand); }).join("") + "</tr></thead><tbody>";
  rows.forEach(function (r) {
    h += '<tr><th class="metric">' + r.label + "</th>" + r.cells.map(function (c, i) {
      return '<td class="' + ((cols[i] && cols[i].cand ? "cand " : "") + (r.cls && r.cls[i] || "")) + '">' + c + "</td>";
    }).join("") + "</tr>";
  });
  return h + "</tbody></table></div>" + (cols.length > 3 ? '<div class="cmp-scroll-hint">Scroll sideways to see every column →</div>' : "");
}
function metricRows(items, wearLabel) {
  var cpwM = items.map(function (i) { return CC.costPerWearMain(i); });
  var sus = items.map(function (i) { return CC.computeSustainability(i.fabric); });
  var syn = items.map(function (i) { return (i.fabric || []).length ? CC.pctByType(i, "synthetic") : null; });
  return [
    { label: "Price", cells: items.map(function (i) { return i.price != null ? CC.money(i.price, i.currency) : "—"; }) },
    { label: "Cost per wear", cells: items.map(function (i) { var v = CC.costPerWear(i); return v == null ? "—" : CC.money(v, i.currency) + (CC.hasRealWears(i) ? "" : '<div class="cmp-tag">est.</div>'); }), cls: best(cpwM, false) },
    { label: "Sustainability", cells: sus.map(function (s) { return s ? s.tier + " (" + s.score + ")" : "—"; }), cls: best(sus.map(function (s) { return s ? s.score : null; }), true) },
    { label: "Top fabric", cells: items.map(topFabric) },
    { label: "Synthetic %", cells: syn.map(function (v) { return v == null ? "—" : v + "%"; }), cls: best(syn, false) },
    { label: "Sub-category", cells: items.map(function (i) { return CC.esc(i.subcategory || i.category || "—"); }) },
    { label: wearLabel || "Wears", cells: items.map(function (i) { return CC.hasRealWears(i) ? CC.totalWears(i) + " logged" : "~" + CC.estWears(i) + " est."; }) }
  ];
}

function multiPicker(id, label, pool, chosen) {
  var avail = pool.filter(function (i) { return chosen.indexOf(i.id) < 0; });
  var chips = chosen.map(CC.findItem).filter(Boolean).map(function (i) {
    return '<span class="chip">' + CC.esc(i.name) + '<button data-chip-remove="' + id + '" data-id="' + i.id + '" title="Remove">&times;</button></span>';
  }).join("");
  return '<div class="picker-col"><label>' + label + '</label><select id="' + id + '">' +
    '<option value="">' + (avail.length ? "Choose…" : "Nothing left to add") + "</option>" +
    avail.map(function (i) { return '<option value="' + i.id + '">' + CC.esc(i.name) + (i.brand ? " — " + CC.esc(i.brand) : "") + "</option>"; }).join("") +
    '</select><div class="chips">' + chips + "</div></div>";
}

function analysis(cand, pool, picked) {
  var lbl = CC.itemCategoryLabel(cand).toLowerCase();
  var similar = cand.subcategory && cand.subcategory !== "Other" ? CC.sameSubcategory(cand, pool) : CC.sameCategory(cand, pool);
  var cpw = CC.costPerWear(cand);
  var sus = CC.computeSustainability(cand.fabric);
  var s = CC.scoreItem(cand);
  var t = "<b>" + CC.esc(cand.name) + "</b> comes in at " + (cpw == null ? "an unknown cost" : CC.money(cpw, cand.currency)) + " per wear, assuming " + CC.estWears(cand) + " wears. ";
  t += similar.length ? "You already own " + similar.length + " similar item" + (similar.length === 1 ? "" : "s") + " in " + CC.esc(lbl) + ". " : "You don't own anything yet in " + CC.esc(lbl) + " to compare it against. ";
  if (picked.length) {
    var vals = picked.map(CC.costPerWearMain).filter(function (v) { return v != null; });
    if (vals.length) {
      var avg = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
      t += "The closet piece" + (picked.length === 1 ? "" : "s") + " you picked average" + (picked.length === 1 ? "s" : "") + " " + CC.moneyMain(avg) + " per wear. ";
    }
  }
  t += sus ? "Its fabric mix rates as <b>" + sus.tier + "</b> (" + sus.score + "/100)" + (sus.coverage < 100 ? " based on " + sus.coverage + "% of the fabric" : "") + " — " + CC.esc(CC.dominantFabricNote(cand.fabric)) + " "
           : "No scorable fabric composition was entered, so a sustainability score couldn't be calculated. ";
  t += s.unlocked > 0 ? "It would unlock roughly " + s.unlocked + " new outfit combination" + (s.unlocked === 1 ? "" : "s") + " with your current closet."
                      : "It doesn't appear to unlock any new outfit combinations based on what's in your closet.";
  return '<div class="advisor-note">' + t + "</div>";
}

CC.renderCompare = function () {
  var panel = $("compare-panel");
  if (panel.style.display === "none") return;
  var c = CC.state.compare;
  var toggle = '<div class="mode-toggle"><button data-mode="wishlist" class="' + (c.mode === "wishlist" ? "active" : "") + '">vs Wishlist</button><button data-mode="closet" class="' + (c.mode === "closet" ? "active" : "") + '">vs Closet</button></div>';
  var h;
  if (c.mode === "wishlist") {
    var items = c.wishSel.map(CC.findItem).filter(function (i) { return i && i.status === "wishlist"; });
    h = '<div class="compare-title-row"><div class="compare-title">Side-by-side comparison</div>' + toggle + "</div>";
    if (items.length < 2) {
      h += '<div class="an-empty">Tap "+ compare" on two or more wishlist cards to compare them here — there\'s no limit on how many.</div>';
    } else {
      var scores = items.map(CC.scoreItem);
      var rows = metricRows(items, "Wears");
      rows.push({ label: "Cost/wear score", cells: scores.map(function (s) { return s.cpwScore; }), cls: best(scores.map(function (s) { return s.cpwScore; }), true) });
      rows.push({ label: "Outfit value", cells: scores.map(function (s) { return s.outfitScore; }), cls: best(scores.map(function (s) { return s.outfitScore; }), true) });
      rows.push({ label: "Overall", cells: scores.map(function (s) { return s.total + "/100"; }), cls: best(scores.map(function (s) { return s.total; }), true) });
      h += table(items.map(function (i) { return { item: i, tag: "Wishlist", cand: false }; }), rows);
    }
  } else {
    var wl = c.cmpWish.map(CC.findItem).filter(function (i) { return i && i.status === "wishlist"; });
    var cl = c.cmpCloset.map(CC.findItem).filter(function (i) { return i && i.status === "closet"; });
    h = '<div class="compare-title-row"><div class="compare-title">Compare against your closet</div>' + toggle + "</div>" +
      '<div class="picker-row">' + multiPicker("cmp-add-wish", "Choose a wishlist item…", CC.wishlist(), wl.map(function (i) { return i.id; })) +
      multiPicker("cmp-add-closet", "Choose a closet item…", CC.closet(false), cl.map(function (i) { return i.id; })) + "</div>";
    if (!wl.length) {
      h += '<div class="an-empty">Pick one or more wishlist items, then (optionally) the closet pieces you want them measured against.</div>';
    } else {
      var auto = false, closetCols = cl;
      if (!closetCols.length) {
        var seen = {};
        closetCols = [];
        wl.forEach(function (w) {
          var sim = w.subcategory && w.subcategory !== "Other" ? CC.sameSubcategory(w, CC.closet(false)) : CC.sameCategory(w, CC.closet(false));
          sim.forEach(function (s) { if (!seen[s.id]) { seen[s.id] = 1; closetCols.push(s); } });
        });
        auto = true;
      }
      var cols = wl.map(function (i) { return { item: i, tag: "Wishlist", cand: true }; })
        .concat(closetCols.map(function (i) { return { item: i, tag: "In closet", cand: false }; }));
      if (auto) h += '<div class="auto-note">' + (closetCols.length ? "Showing similar pieces from your closet — pick specific ones above to choose your own." : "No similar closet pieces yet — pick some above to compare against.") + "</div>";
      h += table(cols, metricRows(cols.map(function (x) { return x.item; })));
      wl.forEach(function (w) { h += analysis(w, CC.closet(false), cl); });
    }
  }
  panel.innerHTML = h;
  var wrap = panel.querySelector(".cmp-wrap"), hint = panel.querySelector(".cmp-scroll-hint");
  if (wrap && hint && wrap.scrollWidth <= wrap.clientWidth + 1) hint.style.display = "none";
};

/* ---------- decision checklist ---------- */
var ORDER = { "": 0, buy: 1, wait: 2, skip: 3 };
CC.renderChecklist = function () {
  var panel = $("checklist-panel");
  if (panel.style.display === "none") return;
  var el = $("checklist-body");
  var items = CC.wishlist().slice().sort(function (a, b) {
    return (ORDER[a.decision || ""] - ORDER[b.decision || ""]) || (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
  });
  if (!items.length) { el.innerHTML = '<div class="an-empty">No wishlist items yet</div>'; return; }
  var pool = CC.closet(false);
  el.innerHTML = items.map(function (it) {
    var synth = Math.round(CC.pctByType(it, "synthetic"));
    var cpw = CC.costPerWear(it), cpwM = CC.costPerWearMain(it);
    var subDup = it.subcategory ? CC.sameSubcategory(it, pool).length > 0 : null;
    var catDup = it.category ? CC.sameCategory(it, pool).length > 0 : null;
    var tags = '<span class="check-tag ' + ((it.fabric || []).length ? (synth === 0 ? "good" : "warn") : "") + '">' + ((it.fabric || []).length ? (synth === 0 ? "No synthetic fibres" : synth + "% synthetic") : "No fabric data") + "</span>" +
      '<span class="check-tag ' + (cpwM != null && cpwM <= 2 ? "good" : "warn") + '">' + (cpw == null ? "—" : CC.money(cpw, it.currency)) + "/wear</span>";
    if (subDup !== null) tags += '<span class="check-tag ' + (subDup ? "" : "good") + '">' + (subDup ? "Duplicates " + CC.esc(it.subcategory) : "New sub-category") + "</span>";
    if (catDup !== null) tags += '<span class="check-tag ' + (catDup ? "" : "good") + '">' + (catDup ? "Duplicates " + CC.esc(it.category) : "New category") + "</span>";
    return '<div class="checklist-item"><div class="check-thumb">' + CC.fullImgHTML(it) + "</div>" +
      '<div style="flex:1;min-width:0"><div class="check-name">' + CC.esc(it.name) + ' <span style="font-size:11px;color:var(--muted)">· ' + (it.price != null ? CC.money(it.price, it.currency) : "no price") + "</span></div>" +
      '<div class="check-row">' + tags + "</div></div>" +
      '<div class="check-decision"><select class="mini' + (it.decision ? " decision-" + it.decision : "") + '" data-decision="' + it.id + '">' +
      ["", "buy", "wait", "skip"].map(function (v) { return '<option value="' + v + '"' + ((it.decision || "") === v ? " selected" : "") + ">" + (v ? v.charAt(0).toUpperCase() + v.slice(1) : "Decide…") + "</option>"; }).join("") +
      "</select></div></div>";
  }).join("");
};

/* ---------- wiring ---------- */
CC.initWishlist = function () {
  $("wishlist-filter-category").innerHTML = CC.optionsHTML(CC.CATEGORIES, "All categories");
  $("wishlist-filter-sub").innerHTML = CC.subOptionsHTML("");
  $("wishlist-filter-category").addEventListener("change", function () {
    $("wishlist-filter-sub").innerHTML = CC.subOptionsHTML(this.value);
    CC.renderWishlist();
  });
  $("wishlist-search").addEventListener("input", CC.renderWishlist);
  $("wishlist-filter-sub").addEventListener("change", CC.renderWishlist);

  $("wishlist-grid").addEventListener("click", function (e) {
    var t = e.target;
    if (t.dataset.toggleCompare) {
      var s = CC.state.compare.wishSel, id = t.dataset.toggleCompare, i = s.indexOf(id);
      if (i > -1) s.splice(i, 1); else s.push(id);
      CC.save(); CC.renderWishlist(); CC.renderCompare();
      return;
    }
    if (t.dataset.removeWish) {
      var rid = t.dataset.removeWish, it = CC.findItem(rid);
      CC.confirm("Remove from wishlist?", '"' + (it ? it.name : "This item") + '" will be deleted.', function () { CC.deleteItem(rid); CC.notify("Removed from wishlist."); }, "Remove");
      return;
    }
    if (t.dataset.purchase) { CC.purchaseItem(t.dataset.purchase); return; }
    if (t.dataset.try) { CC.addToBoard(t.dataset.try); CC.notify("Added to the outfit builder."); return; }
    var card = t.closest(".wish-card");
    if (card) CC.openDetail(card.dataset.id);
  });

  $("btn-compare").addEventListener("click", function () {
    var p = $("compare-panel");
    p.style.display = p.style.display === "none" ? "block" : "none";
    CC.renderCompare();
  });
  $("btn-checklist").addEventListener("click", function () {
    var p = $("checklist-panel");
    p.style.display = p.style.display === "none" ? "block" : "none";
    CC.renderChecklist();
  });
  var cp = $("compare-panel");
  cp.addEventListener("click", function (e) {
    var m = e.target.closest("[data-mode]");
    if (m) { CC.state.compare.mode = m.dataset.mode; CC.save(); CC.renderCompare(); return; }
    var r = e.target.closest("[data-chip-remove]");
    if (r) {
      var key = r.dataset.chipRemove === "cmp-add-wish" ? "cmpWish" : "cmpCloset";
      CC.state.compare[key] = CC.state.compare[key].filter(function (x) { return x !== r.dataset.id; });
      CC.save(); CC.renderCompare();
    }
  });
  cp.addEventListener("change", function (e) {
    if ((e.target.id === "cmp-add-wish" || e.target.id === "cmp-add-closet") && e.target.value) {
      var key = e.target.id === "cmp-add-wish" ? "cmpWish" : "cmpCloset";
      CC.state.compare[key].push(e.target.value);
      CC.save(); CC.renderCompare();
    }
  });
  $("checklist-panel").addEventListener("change", function (e) {
    if (e.target.dataset.decision) {
      var it = CC.findItem(e.target.dataset.decision);
      if (it) { it.decision = e.target.value; CC.state.isDemo = false; CC.save(); CC.renderChecklist(); CC.notify("Decision saved."); }
    }
  });
};

})(window.CC);
