window.CC = window.CC || {};
(function (CC) {

var $ = CC.$;

function btn(label, cls, fn) {
  var b = document.createElement("button");
  b.className = cls; b.textContent = label;
  b.addEventListener("click", fn);
  return b;
}
function row(k, v) { return v ? "<dt>" + k + "</dt><dd>" + v + "</dd>" : ""; }

CC.purchaseItem = function (id) {
  var it = CC.findItem(id); if (!it) return;
  it.status = "closet";
  it.wearLog = [];
  it.decision = "";
  if (!it.dateAcquired) it.dateAcquired = CC.todayISO();
  CC.state.compare.wishSel = CC.state.compare.wishSel.filter(function (x) { return x !== id; });
  CC.state.isDemo = false;
  CC.save(); CC.renderAll();
  CC.notify('"' + it.name + '" moved to your closet.');
};

CC.deleteItem = function (id) {
  var it = CC.findItem(id); if (!it) return;
  CC.removePhoto(it.photoId);
  CC.state.items = CC.state.items.filter(function (x) { return x.id !== id; });
  var c = CC.state.compare;
  ["wishSel", "cmpWish", "cmpCloset"].forEach(function (k) { c[k] = c[k].filter(function (x) { return x !== id; }); });
  CC.state.isDemo = false;
  CC.save(); CC.renderAll();
};

CC.openDetail = function (id) {
  var it = CC.findItem(id); if (!it) return;
  var owned = it.status === "closet";
  var archived = CC.isArchived(it);
  $("detail-title").innerHTML = CC.esc(it.name || "Untitled") + (archived ? '<span class="pill-archived">Archived</span>' : "");

  var sus = CC.computeSustainability(it.fabric);
  var fabrics = (it.fabric || []).map(function (r) {
    var t = CC.rowType(r);
    return CC.esc(CC.rowLabel(r)) + " — " + r.percent + "%" + (t ? ' <span class="sub">· ' + CC.TYPE_LABEL[t] + "</span>" : "");
  }).join("<br>");

  var colourTxt = "";
  var sw = CC.colourSwatch(it);
  if (it.colour || it.colourOther) {
    colourTxt = (sw && sw.indexOf("gradient") < 0 ? '<span class="swatch-dot" style="background:' + CC.esc(sw) + '"></span>' : "") +
      CC.esc(it.colourOther ? it.colourOther + " (" + it.colour + ")" : it.colour) + (it.hex ? ' <span class="sub">· ' + CC.esc(it.hex) + "</span>" : "");
  } else if (it.hex) {
    colourTxt = '<span class="swatch-dot" style="background:' + CC.esc(it.hex) + '"></span>' + CC.esc(it.hex);
  }
  var sub = it.subcategory ? CC.esc(it.subcategory) + (it.jewelryMetal ? " · " + CC.esc(it.jewelryMetal) : "") : "";
  var orig = it.originalPrice != null ? CC.money(it.originalPrice, it.originalCurrency, true) : "";
  var tailor = (it.tailorDate || it.tailorCost) ? [it.tailorDate ? CC.fmtDateLong(it.tailorDate) : "", it.tailorCost ? CC.money(it.tailorCost, it.tailorCurrency, true) : ""].filter(Boolean).join(" · ") : "";

  var body = '<div class="detail-photo">' + CC.fullImgHTML(it) + "</div>" +
    '<dl class="detail-grid">' +
    row("Brand", CC.esc(it.brand)) +
    row("Category", CC.esc(it.category)) +
    row("Sub-category", sub) +
    row("Colour", colourTxt) +
    row("Size", CC.esc(it.size)) +
    row("Length", CC.esc(it.length)) +
    row("Season", CC.esc((it.season || []).join(", "))) +
    row("SKU #", CC.esc(it.sku)) +
    row("Purchase price", it.price != null ? CC.money(it.price, it.currency, true) : "") +
    row("Original price", orig) +
    row("Source", CC.esc(it.source)) +
    row("Second-hand", CC.esc(it.secondhand)) +
    row("Purchase location", CC.esc(it.purchaseLocation)) +
    (owned ? row("Date acquired", it.dateAcquired ? CC.esc(CC.fmtDateLong(it.dateAcquired)) : "") : "") +
    (owned ? row("Sold / donated", it.soldDonatedDate ? CC.esc(CC.fmtDateLong(it.soldDonatedDate)) : "") : "") +
    (owned ? row("Tailoring / care", CC.esc(tailor)) : "") +
    row("Fabric", fabrics) +
    row("Sustainability", sus ? CC.esc(CC.sustainabilityText(sus)) + '<div class="sub">' + CC.esc(CC.dominantFabricNote(it.fabric)) + "</div>" : "Not enough fabric data") +
    row("Link", it.sourceUrl ? '<a href="' + CC.esc(it.sourceUrl) + '" target="_blank" rel="noopener">' + CC.esc(it.sourceUrl) + "</a>" : "") +
    row("Notes", it.notes ? '<div class="rich">' + CC.sanitizeHtml(it.notes) + "</div>" : "") +
    "</dl>";

  var cpw = CC.costPerWear(it);
  if (owned) {
    var logged = (it.wearLog || []).length, tot = CC.totalWears(it);
    body += '<div class="wear-log-box"><span class="count">' + tot + '</span>' +
      '<div class="sub" style="font-size:12px;color:var(--muted)">time' + (tot === 1 ? "" : "s") + " worn" +
      (it.timesWornStart ? " (" + it.timesWornStart + " before using the app + " + logged + " logged)" : "") +
      " · actual cost/wear: " + (cpw == null ? "—" : CC.money(cpw, it.currency)) + "</div></div>";
  } else {
    body += '<div class="wear-log-box"><div style="font-size:12.5px">Estimated at <b>' + CC.estWears(it) + " wears</b> → " +
      (cpw == null ? "—" : CC.money(cpw, it.currency)) + " per wear.</div></div>";
  }
  $("detail-body").innerHTML = body;

  var f = $("detail-footer");
  f.innerHTML = "";
  f.appendChild(btn("Delete", "btn btn-danger", function () {
    CC.confirm("Delete this item?", "This can't be undone unless you have an exported backup.", function () {
      CC.deleteItem(id); CC.closeModal("modal-detail"); CC.notify("Item deleted.");
    }, "Delete");
  }));
  f.appendChild(btn("Edit", "btn btn-ghost", function () { CC.closeModal("modal-detail"); CC.openForm(it.status, "edit", it); }));
  f.appendChild(btn("Add to outfit", "btn btn-ghost", function () { CC.addToBoard(id); CC.notify("Added to the outfit builder."); }));
  if (owned) {
    if ((it.wearLog || []).length) {
      f.appendChild(btn("Undo last wear", "btn btn-ghost", function () {
        it.wearLog.pop(); CC.save(); CC.renderAll(); CC.openDetail(id);
      }));
    }
    f.appendChild(btn("I wore this today", "btn btn-primary", function () {
      it.wearLog = it.wearLog || [];
      it.wearLog.push(new Date().toISOString());
      CC.state.isDemo = false; CC.save(); CC.renderAll(); CC.openDetail(id); CC.notify("Logged a wear.");
    }));
  } else {
    f.appendChild(btn("Mark as purchased", "btn btn-primary", function () { CC.purchaseItem(id); CC.closeModal("modal-detail"); }));
  }
  CC.openModal("modal-detail");
  $("detail-body").scrollTop = 0;
};

})(window.CC);
