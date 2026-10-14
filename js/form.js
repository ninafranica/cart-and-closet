window.CC = window.CC || {};
(function (CC) {

var ctx = null;
var $ = CC.$;

function fill(sel, options, placeholder, value) {
  var h = "";
  if (placeholder != null) h += '<option value="">' + CC.esc(placeholder) + "</option>";
  options.forEach(function (o) {
    var v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o;
    h += '<option value="' + CC.esc(v) + '">' + CC.esc(l) + "</option>";
  });
  sel.innerHTML = h;
  sel.value = value == null ? "" : value;
  if (sel.value !== (value == null ? "" : value)) sel.value = "";
}
var CUR_OPTIONS = null;
function curOptions() {
  if (!CUR_OPTIONS) CUR_OPTIONS = CC.CURRENCIES.map(function (c) { return [c[0], CC.currencyLabel(c[0])]; });
  return CUR_OPTIONS;
}

/* ---------- sub-category & metal ---------- */
function refreshSubs(keep) {
  var cat = $("f-category").value;
  var sub = $("f-subcategory");
  if (!cat) { fill(sub, [], "Select a category first", ""); sub.disabled = true; }
  else { fill(sub, CC.CATEGORY_TREE[cat], "Select…", keep || ""); sub.disabled = false; }
  refreshMetal();
}
function refreshMetal() {
  var show = $("f-category").value === "Accessories" && $("f-subcategory").value === "Jewelry";
  $("f-metal-wrap").hidden = !show;
  if (!show) $("f-metal").value = "";
}

/* ---------- colour ---------- */
function refreshColour() {
  var isOther = $("f-colour").value === "Other";
  $("f-colour-other").hidden = !isOther;
}
function refreshHex() {
  var v = $("f-hex").value.trim();
  var ok = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);
  $("f-hex-swatch").style.background = ok ? v : "transparent";
}

/* ---------- dates ---------- */
function caption(inputId, capId, empty) {
  $(capId).textContent = $(inputId).value ? CC.fmtDateLong($(inputId).value) : (empty || "");
}

/* ---------- photo ---------- */
function renderPhoto() {
  var has = !!ctx.photoSrc;
  $("photo-drop").hidden = has;
  $("photo-editor").hidden = !has;
  if (has) {
    var img = $("photo-img");
    img.src = ctx.photoSrc;
    img.style.objectPosition = ctx.photoPos.x + "% " + ctx.photoPos.y + "%";
  }
}
function setPhotoFile(file) {
  if (!file) return;
  CC.fileToDataURL(file).then(function (src) {
    ctx.photoSrc = src; ctx.photoChanged = true; ctx.photoPos = { x: 50, y: 50 };
    renderPhoto();
  }, function () {
    CC.notify("This browser can't read that photo format (HEIC works in Safari only). Try a JPG or PNG.");
  });
}
function nudge(dir) {
  var s = 10, p = ctx.photoPos;
  if (dir === "up") p.y = Math.min(100, p.y + s);
  if (dir === "down") p.y = Math.max(0, p.y - s);
  if (dir === "left") p.x = Math.min(100, p.x + s);
  if (dir === "right") p.x = Math.max(0, p.x - s);
  if (dir === "reset") { p.x = 50; p.y = 50; }
  renderPhoto();
}
function initPan() {
  var frame = $("photo-frame"), img = $("photo-img"), drag = null;
  frame.addEventListener("pointerdown", function (e) {
    frame.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, y: e.clientY, px: ctx.photoPos.x, py: ctx.photoPos.y };
    frame.style.cursor = "grabbing";
  });
  frame.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var fw = frame.clientWidth, fh = frame.clientHeight, iw = img.naturalWidth || fw, ih = img.naturalHeight || fh;
    var sc = Math.max(fw / iw, fh / ih);
    var ox = iw * sc - fw, oy = ih * sc - fh;
    if (ox > 1) ctx.photoPos.x = Math.max(0, Math.min(100, drag.px - (e.clientX - drag.x) / ox * 100));
    if (oy > 1) ctx.photoPos.y = Math.max(0, Math.min(100, drag.py - (e.clientY - drag.y) / oy * 100));
    img.style.objectPosition = ctx.photoPos.x + "% " + ctx.photoPos.y + "%";
  });
  function end() { drag = null; frame.style.cursor = "grab"; }
  frame.addEventListener("pointerup", end);
  frame.addEventListener("pointercancel", end);
}

/* ---------- fabric rows ---------- */
function fabricOptionsHTML(selected) {
  var h = '<option value="">Select…</option>';
  CC.FABRIC_GROUPS.forEach(function (g) {
    h += '<optgroup label="' + CC.esc(g.label) + '">';
    g.names.forEach(function (n) {
      h += '<option value="' + CC.esc(n) + '"' + (n === selected ? " selected" : "") + ">" + CC.esc(n) + "</option>";
    });
    h += "</optgroup>";
  });
  h += '<option value="Other"' + (selected === "Other" ? " selected" : "") + ">Other…</option>";
  return h;
}
function typeOptionsHTML(sel) {
  return '<option value="">Type…</option>' +
    ["natural", "synthetic", "semi"].map(function (t) {
      return '<option value="' + t + '"' + (sel === t ? " selected" : "") + ">" + CC.TYPE_LABEL[t] + "</option>";
    }).join("");
}
function renderFabric() {
  $("fabric-rows").innerHTML = ctx.fabric.map(function (r, i) {
    return '<div class="fab-row" data-i="' + i + '">' +
      '<select class="fab-name">' + fabricOptionsHTML(r.fiber) + "</select>" +
      '<input type="number" class="fab-pct" min="0" max="100" placeholder="%" value="' + (r.percent == null ? "" : r.percent) + '">' +
      '<select class="fab-type">' + typeOptionsHTML(r.type) + "</select>" +
      '<button type="button" class="fab-remove" title="Remove">&times;</button>' +
      (r.fiber === "Other" ? '<input type="text" class="fab-other" placeholder="Type the fabric (e.g. Bouclé)" value="' + CC.esc(r.other || "") + '">' : "") +
      "</div>";
  }).join("");
  updateFabricTotal();
}
function updateFabricTotal() {
  var total = ctx.fabric.reduce(function (a, r) { return a + (+r.percent || 0); }, 0);
  var el = $("fabric-total");
  var off = total !== 100 && ctx.fabric.length;
  el.textContent = "Total: " + total + "%" + (off ? " (should add up to 100%)" : "");
  el.className = "fabric-total" + (off ? " warn" : "");
}

/* ---------- open ---------- */
CC.openForm = function (status, mode, item) {
  var it = mode === "edit" ? JSON.parse(JSON.stringify(item)) : CC.blankItem(status);
  var photoSrc = it.photoId && CC.photos[it.photoId] ? CC.photos[it.photoId].src : null;
  ctx = {
    mode: mode, status: status, item: it,
    photoSrc: photoSrc, photoChanged: false,
    photoPos: Object.assign({ x: 50, y: 50 }, it.photoPos || {}),
    fabric: (it.fabric || []).map(function (r) { return Object.assign({ type: "", other: "" }, r); })
  };
  var owned = status === "closet";
  $("form-title").textContent = mode === "edit" ? "Edit item" : owned ? "Add to my closet" : "Add to wishlist";
  $("btn-save-item").textContent = mode === "edit" ? "Save changes" : "Add item";
  $("autofill-section").hidden = !(status === "wishlist" && mode !== "edit");
  var am = $("autofill-msg");
  am.className = "fetched-box show";
  am.textContent = "Best effort — most retailer sites block this from a browser, so have the details ready to enter by hand.";
  $("autofill-url").value = "";
  document.querySelector(".owned-only").hidden = !owned;
  $("f-wears-wrap").hidden = owned;

  fill($("f-category"), CC.CATEGORIES, "Select…", it.category);
  refreshSubs(it.subcategory);
  fill($("f-metal"), CC.JEWELRY_METALS, "Select metal…", it.jewelryMetal);
  refreshMetal();
  $("f-name").value = it.name;
  $("f-brand").value = it.brand;

  var colourOptions = CC.COLOUR_NAMES.concat(["Other"]);
  fill($("f-colour"), colourOptions, "Select…", it.colourOther ? "Other" : it.colour);
  fill($("f-colour-parent"), CC.COLOUR_NAMES, "Choose a parent colour…", it.colourOther ? it.colour : "");
  $("f-colour-text").value = it.colourOther || "";
  refreshColour();
  $("f-hex").value = it.hex || "";
  refreshHex();

  $("f-size").value = it.size; $("f-length").value = it.length;
  $("f-price").value = it.price == null ? "" : it.price;
  fill($("f-currency"), curOptions(), null, it.currency);
  $("f-oprice").value = it.originalPrice == null ? "" : it.originalPrice;
  fill($("f-ocurrency"), curOptions(), null, it.originalCurrency);
  $("f-wears").value = it.estimatedWears || (it.category ? CC.WEAR_DEFAULT[it.category] : "") || "";

  fill($("f-source"), CC.SOURCES, "Select…", it.source);
  fill($("f-secondhand"), ["Yes", "No"], "Select…", it.secondhand);
  $("f-location").value = it.purchaseLocation;
  $("f-acquired").value = it.dateAcquired; caption("f-acquired", "f-acquired-cap");
  $("f-timesworn").value = it.timesWornStart || "";
  $("f-sold").value = it.soldDonatedDate; caption("f-sold", "f-sold-cap", "Setting a date archives the item.");
  $("f-tailor-date").value = it.tailorDate; caption("f-tailor-date", "f-tailor-date-cap");
  $("f-tailor-cost").value = it.tailorCost == null ? "" : it.tailorCost;
  fill($("f-tailor-currency"), curOptions(), null, it.tailorCurrency);

  $("f-season-group").innerHTML = CC.SEASONS.map(function (s) {
    return '<div class="checkbox-chip' + (it.season.indexOf(s) > -1 ? " checked" : "") + '" data-season="' + s + '">' + s + "</div>";
  }).join("");

  $("f-url").value = it.sourceUrl; $("f-sku").value = it.sku;
  $("f-notes").innerHTML = CC.sanitizeHtml(it.notes);

  renderPhoto(); renderFabric();
  $("form-body").scrollTop = 0;
  CC.openModal("modal-form");
};

/* ---------- save ---------- */
function save() {
  var name = $("f-name").value.trim();
  if (!name) { CC.notify("Give the item a name first."); return; }
  var cat = $("f-category").value;
  if (!cat) { CC.notify("Choose a category."); return; }
  var colour = $("f-colour").value, colourOther = "";
  if (colour === "Other") {
    colourOther = $("f-colour-text").value.trim();
    colour = $("f-colour-parent").value;
    if (!colourOther) { CC.notify("Describe the colour, or pick one from the list."); return; }
    if (!colour) { CC.notify("Pick the closest parent colour."); return; }
  }
  var hex = $("f-hex").value.trim();
  if (hex && /^[0-9a-f]{6}$/i.test(hex)) hex = "#" + hex;
  if (hex && !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) { CC.notify("Hex code should look like #C8A2C8."); return; }

  var fabric = [];
  for (var i = 0; i < ctx.fabric.length; i++) {
    var r = ctx.fabric[i];
    if (!r.fiber) continue;
    if (r.fiber === "Other" && !(r.other || "").trim()) { CC.notify("Type the name of the fabric marked Other."); return; }
    if (!(+r.percent > 0)) { CC.notify("Add a % for each fabric (or remove the row)."); return; }
    fabric.push({ fiber: r.fiber, percent: +r.percent, type: r.type || "", other: r.fiber === "Other" ? r.other.trim() : "" });
  }

  var it = ctx.item;
  it.name = name; it.brand = $("f-brand").value.trim();
  it.category = cat; it.subcategory = $("f-subcategory").value;
  it.jewelryMetal = $("f-metal-wrap").hidden ? "" : $("f-metal").value;
  it.colour = colour; it.colourOther = colourOther; it.hex = hex;
  it.size = $("f-size").value.trim(); it.length = $("f-length").value.trim();
  it.price = $("f-price").value === "" ? null : parseFloat($("f-price").value);
  it.currency = $("f-currency").value;
  it.originalPrice = $("f-oprice").value === "" ? null : parseFloat($("f-oprice").value);
  it.originalCurrency = $("f-ocurrency").value;
  it.estimatedWears = ctx.status === "wishlist" ? (parseInt($("f-wears").value, 10) || null) : it.estimatedWears;
  it.source = $("f-source").value; it.secondhand = $("f-secondhand").value;
  it.purchaseLocation = $("f-location").value.trim();
  if (ctx.status === "closet") {
    it.dateAcquired = $("f-acquired").value;
    it.timesWornStart = Math.max(0, parseInt($("f-timesworn").value, 10) || 0);
    it.soldDonatedDate = $("f-sold").value;
    it.tailorDate = $("f-tailor-date").value;
    it.tailorCost = $("f-tailor-cost").value === "" ? null : parseFloat($("f-tailor-cost").value);
    it.tailorCurrency = $("f-tailor-currency").value;
  }
  it.season = Array.prototype.map.call(document.querySelectorAll("#f-season-group .checkbox-chip.checked"), function (c) { return c.dataset.season; });
  it.fabric = fabric;
  it.sourceUrl = $("f-url").value.trim(); it.sku = $("f-sku").value.trim();
  var notesHtml = CC.sanitizeHtml($("f-notes").innerHTML);
  var notesText = $("f-notes").textContent.trim();
  it.notes = notesText ? notesHtml : "";
  it.photoPos = { x: Math.round(ctx.photoPos.x), y: Math.round(ctx.photoPos.y) };

  if (ctx.photoChanged || (!ctx.photoSrc && it.photoId)) {
    if (it.photoId) CC.removePhoto(it.photoId);
    it.photoId = ctx.photoSrc ? CC.addPhoto(ctx.photoSrc) : null;
  }
  CC.state.settings.lastCurrency = it.currency;

  if (ctx.mode === "edit") {
    var idx = CC.state.items.findIndex(function (x) { return x.id === it.id; });
    if (idx > -1) CC.state.items[idx] = it;
  } else {
    CC.state.items.push(it);
  }
  CC.state.isDemo = false;
  CC.save();
  CC.renderAll();
  CC.closeModal("modal-form");
  CC.notify(ctx.mode === "edit" ? "Item updated." : "Item added.");
}

/* ---------- auto-fill (best effort) ---------- */
function autofill() {
  var url = $("autofill-url").value.trim(), msg = $("autofill-msg");
  if (!url) { msg.className = "fetched-box show error"; msg.textContent = "Paste a product URL first."; return; }
  msg.className = "fetched-box show"; msg.textContent = "Trying to fetch product details…";
  $("f-url").value = url;
  fetch(url, { mode: "cors" }).then(function (r) { return r.text(); }).then(function (html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    function meta(n) { var el = doc.querySelector('meta[property="' + n + '"], meta[name="' + n + '"]'); return el ? el.getAttribute("content") : null; }
    var title = meta("og:title") || (doc.querySelector("title") ? doc.querySelector("title").textContent : null);
    var price = meta("product:price:amount") || meta("og:price:amount");
    var cur = meta("product:price:currency") || meta("og:price:currency");
    var image = meta("og:image");
    var found = false;
    if (title) { $("f-name").value = title.trim(); found = true; }
    if (price) { $("f-price").value = parseFloat(price) || ""; found = true; }
    if (cur && CC.CUR[cur.toUpperCase()]) { $("f-currency").value = cur.toUpperCase(); }
    if (image) { ctx.photoSrc = image; ctx.photoChanged = true; renderPhoto(); found = true; }
    if (found) { msg.className = "fetched-box show"; msg.textContent = "Pulled what we could — please double-check every field, then fill in the rest by hand."; }
    else { msg.className = "fetched-box show error"; msg.textContent = "That page loaded but didn't expose usable product data. Please fill in the details manually."; }
  }).catch(function () {
    msg.className = "fetched-box show error";
    msg.textContent = "Auto-fill isn't available for this site — most retailers block this kind of request from a browser. Please fill in the details below.";
  });
}

/* ---------- wiring (once) ---------- */
CC.initForm = function () {
  $("f-category").addEventListener("change", function () {
    refreshSubs("");
    if (ctx.status === "wishlist") $("f-wears").value = CC.WEAR_DEFAULT[this.value] || "";
  });
  $("f-subcategory").addEventListener("change", refreshMetal);
  $("f-colour").addEventListener("change", refreshColour);
  $("f-hex").addEventListener("input", refreshHex);
  $("f-hex").addEventListener("blur", function () {
    var v = this.value.trim();
    if (/^[0-9a-f]{6}$/i.test(v) || /^[0-9a-f]{3}$/i.test(v)) { this.value = "#" + v; refreshHex(); }
  });
  $("f-currency").addEventListener("change", function () {
    var prev = ctx.item.currency;
    if ($("f-ocurrency").value === prev) $("f-ocurrency").value = this.value;
    if ($("f-tailor-currency").value === prev) $("f-tailor-currency").value = this.value;
    ctx.item.currency = this.value;
  });
  $("f-acquired").addEventListener("change", function () { caption("f-acquired", "f-acquired-cap"); });
  $("f-sold").addEventListener("change", function () { caption("f-sold", "f-sold-cap", "Setting a date archives the item."); });
  $("f-tailor-date").addEventListener("change", function () { caption("f-tailor-date", "f-tailor-date-cap"); });
  $("f-season-group").addEventListener("click", function (e) {
    var c = e.target.closest(".checkbox-chip"); if (c) c.classList.toggle("checked");
  });

  // photo
  $("photo-input").addEventListener("change", function (e) { setPhotoFile(e.target.files[0]); e.target.value = ""; });
  $("photo-replace").addEventListener("change", function (e) { setPhotoFile(e.target.files[0]); e.target.value = ""; });
  var zone = $("photo-drop");
  ["dragenter", "dragover"].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add("dragover"); }); });
  ["dragleave", "drop"].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove("dragover"); }); });
  zone.addEventListener("drop", function (e) { setPhotoFile(e.dataTransfer.files && e.dataTransfer.files[0]); });
  $("btn-remove-photo").addEventListener("click", function () { ctx.photoSrc = null; ctx.photoChanged = true; renderPhoto(); });
  document.querySelectorAll("[data-nudge]").forEach(function (b) { b.addEventListener("click", function () { nudge(b.dataset.nudge); }); });
  initPan();

  // fabric
  $("btn-add-fabric-row").addEventListener("click", function () {
    ctx.fabric.push({ fiber: "", percent: null, type: "", other: "" });
    renderFabric();
  });
  var fr = $("fabric-rows");
  fr.addEventListener("change", function (e) {
    var row = e.target.closest(".fab-row"); if (!row) return;
    var r = ctx.fabric[+row.dataset.i];
    if (e.target.classList.contains("fab-name")) {
      r.fiber = e.target.value;
      var lib = CC.FABRICS[r.fiber];
      r.type = lib ? lib.type : "";
      if (r.fiber !== "Other") r.other = "";
      renderFabric();
    } else if (e.target.classList.contains("fab-type")) {
      r.type = e.target.value;
    }
  });
  fr.addEventListener("input", function (e) {
    var row = e.target.closest(".fab-row"); if (!row) return;
    var r = ctx.fabric[+row.dataset.i];
    if (e.target.classList.contains("fab-pct")) { r.percent = e.target.value === "" ? null : +e.target.value; updateFabricTotal(); }
    if (e.target.classList.contains("fab-other")) r.other = e.target.value;
  });
  fr.addEventListener("click", function (e) {
    if (e.target.classList.contains("fab-remove")) {
      ctx.fabric.splice(+e.target.closest(".fab-row").dataset.i, 1);
      renderFabric();
    }
  });

  // notes toolbar (keeps selection by not stealing focus)
  var tb = $("rte-toolbar");
  tb.addEventListener("mousedown", function (e) { if (e.target.closest("button")) e.preventDefault(); });
  tb.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-cmd]"); if (!b) return;
    $("f-notes").focus();
    document.execCommand(b.dataset.cmd, false, null);
  });
  $("f-notes").addEventListener("paste", function (e) {
    e.preventDefault();
    var t = (e.clipboardData || window.clipboardData).getData("text/plain");
    document.execCommand("insertText", false, t);
  });

  $("btn-try-autofill").addEventListener("click", autofill);
  $("btn-save-item").addEventListener("click", save);
};

})(window.CC);
