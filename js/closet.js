window.CC = window.CC || {};
(function (CC) {

var $ = CC.$;

/* ---------- shared filter helpers (also used by the wishlist) ---------- */
CC.optionsHTML = function (list, placeholder) {
  return '<option value="">' + CC.esc(placeholder) + "</option>" + list.map(function (v) {
    return '<option value="' + CC.esc(v) + '">' + CC.esc(v) + "</option>";
  }).join("");
};
// Sub-category dropdown: all sub-categories grouped by category, or just the chosen category's.
CC.subOptionsHTML = function (cat) {
  var h = '<option value="">All sub-categories</option>';
  var cats = cat ? [cat] : CC.CATEGORIES;
  cats.forEach(function (c) {
    h += '<optgroup label="' + CC.esc(c) + '">' + CC.CATEGORY_TREE[c].map(function (s) {
      return '<option value="' + CC.esc(c + "::" + s) + '">' + CC.esc(s) + "</option>";
    }).join("") + "</optgroup>";
  });
  return h;
};
CC.matchesSearch = function (it, q) {
  if (!q) return true;
  q = q.toLowerCase();
  return [it.name, it.brand, it.sku, it.subcategory, it.category, it.colour, it.colourOther].some(function (v) {
    return v && String(v).toLowerCase().indexOf(q) > -1;
  });
};
CC.matchesSub = function (it, subVal) {
  if (!subVal) return true;
  var p = subVal.split("::");
  return it.category === p[0] && it.subcategory === p[1];
};

/* ---------- closet panel ---------- */
var SIZES = { S: 150, M: 210, L: 285 };

function filtered() {
  var s = CC.state.settings;
  var q = $("closet-search").value.trim();
  var cat = $("closet-filter-category").value, sub = $("closet-filter-sub").value;
  var colour = $("closet-filter-colour").value, season = $("closet-filter-season").value;
  return CC.closet(s.showArchived).filter(function (i) {
    if (cat && i.category !== cat) return false;
    if (!CC.matchesSub(i, sub)) return false;
    if (colour && i.colour !== colour) return false;
    if (season && (i.season || []).indexOf(season) === -1) return false;
    return CC.matchesSearch(i, q);
  });
}

function listHTML(items) {
  var cats = CC.CATEGORIES.filter(function (c) { return items.some(function (i) { return i.category === c; }); });
  var other = items.filter(function (i) { return !i.category || CC.CATEGORIES.indexOf(i.category) < 0; });
  if (other.length) cats.push("");
  return cats.map(function (c) {
    var rows = items.filter(function (i) { return c ? i.category === c : (!i.category || CC.CATEGORIES.indexOf(i.category) < 0); });
    rows.sort(function (a, b) { return (a.name || "").localeCompare(b.name || ""); });
    return '<div class="cat-label">' + CC.esc(c || "Uncategorised") + "</div>" + rows.map(function (it) {
      var arch = CC.isArchived(it);
      var cpw = CC.hasRealWears(it) ? CC.costPerWear(it) : null;
      return '<div class="closet-item' + (arch ? " archived" : "") + '" draggable="true" data-drag-id="' + it.id + '" data-id="' + it.id + '">' +
        '<div class="item-emoji">' + CC.thumbHTML(it) + "</div>" +
        '<div class="item-info"><div class="item-name">' + CC.esc(it.name) + (arch ? '<span class="pill-archived">Archived</span>' : "") + "</div>" +
        '<div class="item-brand">' + CC.esc(it.brand || "") + "</div>" +
        (cpw != null ? '<div class="item-cpw">' + CC.money(cpw, it.currency) + "/wear</div>" : "") +
        '</div><div class="drag-hint">⋮⋮</div></div>';
    }).join("");
  }).join("");
}

function flipHTML(items) {
  items = items.slice().sort(function (a, b) {
    var ai = CC.CATEGORIES.indexOf(a.category), bi = CC.CATEGORIES.indexOf(b.category);
    return (ai - bi) || (a.name || "").localeCompare(b.name || "");
  });
  var px = SIZES[CC.state.settings.cardSize] || SIZES.M;
  return '<div class="flip-grid" style="--card-w:' + px + 'px">' + items.map(function (it) {
    var fab = (it.fabric || []).map(function (r) { return CC.esc(CC.rowLabel(r)) + " — " + r.percent + "%"; }).join("<br>") || "Not entered";
    var cpw = CC.costPerWear(it), tot = CC.totalWears(it);
    var real = CC.hasRealWears(it);
    var wears = tot + " time" + (tot === 1 ? "" : "s") + " logged worn · " + (real ? "actual" : "est.") + " cost/wear: " + (cpw == null ? "—" : CC.money(cpw, it.currency));
    return '<div class="flip-card' + (CC.isArchived(it) ? " archived" : "") + '" data-id="' + it.id + '"><div class="flip-inner">' +
      '<div class="flip-face flip-front"><div class="flip-photo">' + CC.fullImgHTML(it) + "</div>" +
      '<div class="flip-labels"><span class="bevel name" title="' + CC.esc(it.name) + '">' + CC.esc(it.name) + "</span>" +
      (it.brand ? '<span class="bevel brand" title="' + CC.esc(it.brand) + '">' + CC.esc(it.brand) + "</span>" : "") + "</div></div>" +
      '<div class="flip-face flip-back">' +
      '<div><div class="k">Category</div><div class="v">' + CC.esc(it.category || "—") + "</div></div>" +
      '<div><div class="k">Sub-category</div><div class="v">' + CC.esc(it.subcategory || "—") + "</div></div>" +
      '<div><div class="k">Fabric</div><div class="v fab-lines">' + fab + "</div></div>" +
      '<div class="wears">' + wears + "</div>" +
      '<button class="full-btn" data-full="' + it.id + '">Full info</button>' +
      "</div></div></div>";
  }).join("") + "</div>";
}

CC.renderCloset = function () {
  var s = CC.state.settings;
  var items = filtered();
  var body = $("closet-list");
  var all = CC.closet(false);
  var expanded = CC.expandedPanel === "closet";
  if (!CC.state.items.some(function (i) { return i.status === "closet"; })) {
    body.innerHTML = '<div class="an-empty" style="text-align:center;padding:30px 10px"><div style="font-size:24px;margin-bottom:8px">🧺</div><div style="font-style:italic">Your closet is empty</div><div style="font-size:11px;margin-top:4px">Add items with the button below</div></div>';
  } else if (!items.length) {
    body.innerHTML = '<div class="an-empty" style="text-align:center;padding:30px 10px">No items match your filters.</div>';
  } else {
    body.innerHTML = expanded ? flipHTML(items) : listHTML(items);
  }
  $("closet-count").textContent = all.length + " item" + (all.length === 1 ? "" : "s") + (expanded ? "" : " · drag to outfit builder");
  $("strip-count-closet").textContent = all.length;
  $("closet-show-archived").checked = !!s.showArchived;
  document.querySelectorAll("#size-ctl button").forEach(function (b) { b.classList.toggle("active", b.dataset.size === (s.cardSize || "M")); });
};

CC.initCloset = function () {
  $("closet-filter-category").innerHTML = CC.optionsHTML(CC.CATEGORIES, "All categories");
  $("closet-filter-sub").innerHTML = CC.subOptionsHTML("");
  $("closet-filter-colour").innerHTML = CC.optionsHTML(CC.COLOUR_NAMES, "All colours");
  $("closet-filter-season").innerHTML = CC.optionsHTML(CC.SEASONS, "All seasons");

  $("closet-filter-category").addEventListener("change", function () {
    $("closet-filter-sub").innerHTML = CC.subOptionsHTML(this.value);
    CC.renderCloset();
  });
  $("closet-search").addEventListener("input", CC.renderCloset);
  ["closet-filter-sub", "closet-filter-colour", "closet-filter-season"].forEach(function (id) {
    $(id).addEventListener("change", CC.renderCloset);
  });
  $("closet-show-archived").addEventListener("change", function () {
    CC.state.settings.showArchived = this.checked; CC.save(); CC.renderCloset();
  });
  document.querySelectorAll("#size-ctl button").forEach(function (b) {
    b.addEventListener("click", function () { CC.state.settings.cardSize = b.dataset.size; CC.save(); CC.renderCloset(); });
  });

  var body = $("closet-list");
  body.addEventListener("click", function (e) {
    var full = e.target.closest("[data-full]");
    if (full) { CC.openDetail(full.dataset.full); return; }
    var row = e.target.closest(".closet-item");
    if (row) { CC.openDetail(row.dataset.id); return; }
    // touch screens have no hover, so tapping a card flips it
    var card = e.target.closest(".flip-card");
    if (card && window.matchMedia("(hover: none)").matches) card.classList.toggle("flipped");
  });
};

})(window.CC);
