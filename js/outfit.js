window.CC = window.CC || {};
(function (CC) {

var $ = CC.$;
var board = null;
var pieces = [];            // current canvas: {uid,itemId,x,y,w,z,cut}
var selected = null;        // uid
var loadedId = null;        // saved outfit being edited
var ASPECT = 1.25;          // board height / width
var busy = {};              // photoId -> true while a cut-out is being made
var warnedBusy = false;

function pieceSrc(p, it) {
  if (!it || !it.photoId || !CC.photos[it.photoId]) return "";
  var ph = CC.photos[it.photoId];
  return (p.cut && ph.cutout) ? ph.cutout : ph.src;
}
function pieceInner(p, it) {
  var src = pieceSrc(p, it);
  return src ? '<img src="' + CC.esc(src) + '" alt="" draggable="false">' : '<div class="emoji-tile">' + CC.itemFallbackIcon(it) + "</div>";
}
function maxZ() { return pieces.reduce(function (m, p) { return Math.max(m, p.z); }, 0); }

/* ---------- cut-outs ---------- */
function ensureCutout(it) {
  if (!it || !it.photoId || !CC.photos[it.photoId]) return;
  var ph = CC.photos[it.photoId];
  if (ph.cutout || ph.cutoutFailed || busy[it.photoId]) return;
  busy[it.photoId] = true;
  renderBoard();
  CC.makeCutout(ph.src).then(function (res) {
    delete busy[it.photoId];
    if (res.ok) { CC.setCutout(it.photoId, res.dataUrl); }
    else {
      ph.cutoutFailed = true;
      CC.setCutout(it.photoId, null);
      if (!warnedBusy) { warnedBusy = true; CC.notify("That photo's background isn't plain enough to cut out cleanly, so the full photo is shown."); }
    }
    renderBoard();
    CC.renderSaved();
  });
}

/* ---------- board sizing ---------- */
CC.fitBoard = function () {
  var stage = document.querySelector(".board-stage");
  if (!stage || !board) return;
  var W = stage.clientWidth - 24;
  if (W <= 0) return;
  var expanded = CC.expandedPanel === "right";
  var availH = expanded ? Math.max(340, window.innerHeight - stage.getBoundingClientRect().top - 150) : 640;
  var h = Math.min(W * ASPECT, availH);
  board.style.height = Math.round(h) + "px";
  board.style.width = Math.round(h / ASPECT) + "px";
};

/* ---------- rendering ---------- */
function renderBoard() {
  if (!board) return;
  // drop pieces whose item was deleted
  pieces = pieces.filter(function (p) { return CC.findItem(p.itemId); });
  Array.prototype.forEach.call(board.querySelectorAll(".piece"), function (n) { n.remove(); });
  $("board-empty").style.display = pieces.length ? "none" : "flex";
  pieces.forEach(function (p) {
    var it = CC.findItem(p.itemId);
    var d = document.createElement("div");
    d.className = "piece" + (selected === p.uid ? " sel" : "") + (it.status === "wishlist" ? " wish" : "");
    d.dataset.uid = p.uid;
    d.style.cssText = "left:" + p.x + "%;top:" + p.y + "%;width:" + p.w + "%;z-index:" + p.z + (it.photoId && busy[it.photoId] ? ";opacity:.45" : "");
    d.innerHTML = pieceInner(p, it) + '<span class="handle" data-handle="1"></span>';
    board.appendChild(d);
  });
  renderPieceBar();
  renderStats();
}
function renderPieceBar() {
  var bar = $("piece-bar");
  var p = pieces.filter(function (x) { return x.uid === selected; })[0];
  bar.hidden = !p;
  if (!p) return;
  var it = CC.findItem(p.itemId);
  $("piece-name").textContent = it.name;
  var cb = $("piece-cut");
  var ph = it.photoId ? CC.photos[it.photoId] : null;
  cb.hidden = !ph;
  if (ph) {
    cb.textContent = ph.cutoutFailed ? "Cut-out: unavailable" : "Cut-out: " + (p.cut ? "on" : "off");
    cb.disabled = !!ph.cutoutFailed;
  }
}
function renderStats() {
  var old = $("outfit-stats"); if (old) old.remove();
  var items = pieces.map(function (p) { return CC.findItem(p.itemId); }).filter(Boolean);
  if (!items.length) return;
  var total = 0, skipped = 0;
  items.forEach(function (i) {
    if (i.price == null) return;
    var v = CC.toMain(+i.price, i.currency);
    if (v == null) skipped++; else total += v;
  });
  var withFab = items.filter(function (i) { return (i.fabric || []).length; });
  var syn = withFab.length ? Math.round(withFab.reduce(function (a, i) { return a + CC.pctByType(i, "synthetic"); }, 0) / withFab.length) : null;
  var wish = items.filter(function (i) { return i.status === "wishlist"; }).length;
  var div = document.createElement("div");
  div.className = "outfit-stats"; div.id = "outfit-stats";
  div.innerHTML = '<div class="outfit-stat-row"><span class="outfit-stat-label">Pieces in outfit</span><span class="outfit-stat-val">' + items.length + "</span></div>" +
    '<div class="outfit-stat-row"><span class="outfit-stat-label">Total outfit value</span><span class="outfit-stat-val">' + CC.moneyMain(total) + (skipped ? " *" : "") + "</span></div>" +
    (syn == null ? "" : '<div class="outfit-stat-row"><span class="outfit-stat-label">Synthetic fibres</span><span class="outfit-stat-val ' + (syn > 30 ? "warn" : "good") + '">' + syn + "%</span></div>") +
    (wish ? '<div class="outfit-stat-row"><span class="outfit-stat-label">Wishlist items trying</span><span class="outfit-stat-val" style="color:var(--slate)">' + wish + "</span></div>" : "") +
    (skipped ? '<div class="outfit-stat-label" style="margin-top:6px">* ' + skipped + " item(s) in a currency without an exchange rate aren't included.</div>" : "");
  $("outfit-stats-slot").appendChild(div);
}

/* ---------- add / interact ---------- */
CC.addToBoard = function (itemId, cx, cy) {
  var it = CC.findItem(itemId); if (!it) return;
  var w = 36;
  var x = cx == null ? 18 + Math.random() * 28 : cx - w / 2;
  var y = cy == null ? 8 + Math.random() * 30 : cy - 18;
  var p = { uid: CC.uid(), itemId: itemId, x: +Math.max(-w / 3, Math.min(100 - w * 0.66, x)).toFixed(2), y: +Math.max(0, Math.min(88, y)).toFixed(2), w: w, z: maxZ() + 1, cut: true };
  pieces.push(p);
  selected = p.uid;
  renderBoard();
  ensureCutout(it);
};
function snap(v, step) { return document.getElementById("board-snap").checked ? Math.round(v / step) * step : v; }

function initBoardInteractions() {
  var drag = null;
  board.addEventListener("pointerdown", function (e) {
    var el = e.target.closest(".piece");
    if (!el) { if (selected) { selected = null; renderBoard(); } return; }
    var p = pieces.filter(function (x) { return x.uid === el.dataset.uid; })[0]; if (!p) return;
    var r = board.getBoundingClientRect();
    p.z = maxZ() + 1;
    el.style.zIndex = p.z;
    if (selected !== p.uid) { selected = p.uid; renderBoard(); el = board.querySelector('[data-uid="' + p.uid + '"]'); }
    board.setPointerCapture(e.pointerId);
    drag = e.target.dataset.handle
      ? { mode: "resize", p: p, startW: p.w, sx: e.clientX, bw: r.width }
      : { mode: "move", p: p, ox: e.clientX / r.width * 100 - p.x, oy: e.clientY / r.height * 100 - p.y, r: r };
    e.preventDefault();
  });
  board.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var el = board.querySelector('[data-uid="' + drag.p.uid + '"]'); if (!el) return;
    if (drag.mode === "move") {
      var r = board.getBoundingClientRect();
      var x = e.clientX / r.width * 100 - drag.ox, y = e.clientY / r.height * 100 - drag.oy;
      x = snap(x, 5); y = snap(y, 4);
      drag.p.x = +Math.max(-drag.p.w * 0.6, Math.min(100 - drag.p.w * 0.4, x)).toFixed(2);
      drag.p.y = +Math.max(-5, Math.min(97, y)).toFixed(2);
      el.style.left = drag.p.x + "%"; el.style.top = drag.p.y + "%";
    } else {
      var nw = drag.startW + (e.clientX - drag.sx) / drag.bw * 100;
      drag.p.w = +Math.max(8, Math.min(100, nw)).toFixed(2);
      el.style.width = drag.p.w + "%";
    }
  });
  function end() { drag = null; }
  board.addEventListener("pointerup", end);
  board.addEventListener("pointercancel", end);

  board.addEventListener("dragover", function (e) { e.preventDefault(); });
  board.addEventListener("drop", function (e) {
    e.preventDefault();
    var id = e.dataTransfer.getData("text/plain");
    if (!id || !CC.findItem(id)) return;
    var r = board.getBoundingClientRect();
    CC.addToBoard(id, (e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100);
  });
  document.addEventListener("dragstart", function (e) {
    var el = e.target.closest && e.target.closest("[data-drag-id]");
    if (el) e.dataTransfer.setData("text/plain", el.dataset.dragId);
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Delete" || e.key === "Backspace") && selected && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
      if (document.querySelector(".modal-back.open")) return;
      pieces = pieces.filter(function (p) { return p.uid !== selected; });
      selected = null; renderBoard();
    }
  });
}

function pieceAction(act) {
  var p = pieces.filter(function (x) { return x.uid === selected; })[0]; if (!p) return;
  if (act === "remove") { pieces = pieces.filter(function (x) { return x !== p; }); selected = null; }
  if (act === "cut") { p.cut = !p.cut; }
  if (act === "forward" || act === "back") {
    var sorted = pieces.slice().sort(function (a, b) { return a.z - b.z; });
    var i = sorted.indexOf(p), j = act === "forward" ? i + 1 : i - 1;
    if (sorted[j]) { var t = p.z; p.z = sorted[j].z; sorted[j].z = t; }
  }
  renderBoard();
}

/* ---------- saved outfits ---------- */
function thumbHTML(o) {
  var items = o.pieces.slice().sort(function (a, b) { return a.z - b.z; }).map(function (p) {
    var it = CC.findItem(p.itemId); if (!it) return "";
    return '<div class="piece" style="left:' + p.x + "%;top:" + p.y + "%;width:" + p.w + "%;z-index:" + p.z + '">' + pieceInner(p, it) + "</div>";
  }).join("");
  return '<div class="outfit-thumb">' + items + "</div>";
}
CC.renderSaved = function () {
  var list = CC.state.outfits;
  $("outfit-tally").textContent = list.length;
  $("strip-count-right").textContent = list.length;
  var body = $("saved-outfits");
  if (!list.length) { body.innerHTML = '<div class="saved-empty">No outfits saved yet — build one on the canvas and press Save.</div>'; return; }
  body.innerHTML = list.slice().reverse().map(function (o) {
    var n = o.pieces.filter(function (p) { return CC.findItem(p.itemId); }).length;
    return '<div class="outfit-card">' + thumbHTML(o) +
      '<div class="o-actions"><button data-load="' + o.id + '">Load</button><button class="del" data-del="' + o.id + '">Delete</button></div>' +
      '<div class="o-name" title="' + CC.esc(o.name) + '">' + CC.esc(o.name) + '</div><div class="o-meta">' + n + " piece" + (n === 1 ? "" : "s") + "</div></div>";
  }).join("");
};

/* ---------- sustainability sidebar & cost-per-wear calculator ---------- */
CC.renderSustainability = function () {
  var items = CC.closet(false);
  var ring = $("sust-ring");
  if (!items.length) {
    $("sust-score").textContent = "—"; ring.style.borderColor = "var(--sage)";
    $("sust-label").textContent = "Add closet items to see your fabric breakdown";
    $("sust-bars").innerHTML = ""; return;
  }
  var map = {}, scored = [];
  items.forEach(function (it) {
    (it.fabric || []).forEach(function (r) {
      var k = CC.rowLabel(r);
      if (!map[k]) map[k] = { total: 0, type: CC.rowType(r) };
      map[k].total += +r.percent || 0;
    });
    var s = CC.computeSustainability(it.fabric); if (s) scored.push(s.score);
  });
  var avg = scored.length ? Math.round(scored.reduce(function (a, b) { return a + b; }, 0) / scored.length) : null;
  ring.style.borderColor = avg == null ? "var(--pebble)" : avg >= 70 ? "var(--sage)" : avg >= 45 ? "var(--slate)" : "var(--terra)";
  $("sust-score").textContent = avg == null ? "—" : avg;
  $("sust-label").textContent = avg == null ? "Add fabric details to see a score" : avg >= 70 ? "Great fabric choices" : avg >= 45 ? "Room to improve" : "Consider more natural or semi-synthetic fibers";
  var rows = Object.keys(map).map(function (k) { return { n: k, avg: Math.round(map[k].total / items.length), t: map[k].type }; }).sort(function (a, b) { return b.avg - a.avg; });
  $("sust-bars").innerHTML = rows.slice(0, 6).map(function (f) {
    var c = f.t === "synthetic" ? "var(--terra)" : f.t === "semi" ? "var(--slate)" : f.t === "natural" ? "var(--sage)" : "var(--pebble)";
    return '<div class="sust-bar-row"><span class="sust-name" title="' + CC.esc(f.n) + '">' + CC.esc(f.n) + '</span><div class="sust-track"><div class="sust-fill" style="width:' + Math.min(100, f.avg) + "%;background:" + c + '"></div></div><span class="sust-pct" style="color:' + c + '">' + f.avg + "%</span></div>";
  }).join("");
};
function updateCalc() {
  var price = +$("cpw-price").value, wears = +$("cpw-wears").value, years = +$("cpw-years").value;
  $("cpw-price-val").textContent = CC.money(price, CC.mainCurrency());
  $("cpw-wears-val").textContent = wears + "×";
  $("cpw-years-val").textContent = years + " yr";
  $("cpw-result").textContent = CC.money(price / (wears * years), CC.mainCurrency());
}
CC.populateCalcLoad = function () {
  var sel = $("cpw-item-load"), cur = sel.value;
  var all = CC.closet(false).concat(CC.wishlist());
  sel.innerHTML = '<option value="">Load an item…</option>' + all.map(function (i) {
    return '<option value="' + i.id + '">' + CC.esc(i.name) + " (" + (i.status === "closet" ? "closet" : "wishlist") + ")</option>";
  }).join("");
  if (cur && CC.findItem(cur)) sel.value = cur;
  updateCalc();
};

CC.renderOutfits = function () {
  renderBoard();
  CC.renderSaved();
  CC.renderSustainability();
  CC.populateCalcLoad();
};

/* ---------- wiring ---------- */
CC.initOutfit = function () {
  board = $("outfit-board");
  initBoardInteractions();
  if (window.ResizeObserver) new ResizeObserver(function () { CC.fitBoard(); }).observe(document.querySelector(".board-stage"));
  window.addEventListener("resize", CC.fitBoard);

  document.querySelector("#piece-bar").addEventListener("click", function (e) {
    var b = e.target.closest("[data-piece]"); if (b) pieceAction(b.dataset.piece);
  });
  $("btn-clear-board").addEventListener("click", function () {
    pieces = []; selected = null; loadedId = null; $("outfit-name").value = ""; renderBoard();
  });
  $("btn-save-outfit").addEventListener("click", function () {
    if (!pieces.length) { CC.notify("Add a few pieces to the canvas first."); return; }
    var name = $("outfit-name").value.trim() || "Untitled outfit";
    var copy = pieces.map(function (p) { return { uid: CC.uid(), itemId: p.itemId, x: p.x, y: p.y, w: p.w, z: p.z, cut: p.cut }; });
    var existing = loadedId && CC.state.outfits.filter(function (o) { return o.id === loadedId; })[0];
    if (existing && existing.name === name) { existing.pieces = copy; CC.notify("Outfit updated."); }
    else { CC.state.outfits.push({ id: CC.uid(), name: name, pieces: copy, dateCreated: new Date().toISOString() }); CC.notify("Outfit saved."); }
    CC.state.isDemo = false; CC.save();
    pieces = []; selected = null; loadedId = null; $("outfit-name").value = "";
    renderBoard(); CC.renderSaved();
  });

  var tgl = $("saved-toggle");
  tgl.addEventListener("click", function () {
    var open = tgl.getAttribute("aria-expanded") !== "true";
    tgl.setAttribute("aria-expanded", open ? "true" : "false");
    $("saved-outfits").hidden = !open;
  });
  $("saved-outfits").addEventListener("click", function (e) {
    var l = e.target.closest("[data-load]"), d = e.target.closest("[data-del]");
    if (l) {
      var o = CC.state.outfits.filter(function (x) { return x.id === l.dataset.load; })[0]; if (!o) return;
      pieces = o.pieces.filter(function (p) { return CC.findItem(p.itemId); }).map(function (p) { return { uid: CC.uid(), itemId: p.itemId, x: p.x, y: p.y, w: p.w, z: p.z, cut: p.cut }; });
      selected = null; loadedId = o.id; $("outfit-name").value = o.name;
      renderBoard();
      CC.notify("Loaded onto the canvas — Save with the same name to update it.");
    }
    if (d) {
      var oid = d.dataset.del;
      CC.confirm("Delete this outfit?", "This can't be undone.", function () {
        CC.state.outfits = CC.state.outfits.filter(function (x) { return x.id !== oid; });
        CC.state.isDemo = false; CC.save(); CC.renderSaved();
      }, "Delete");
    }
  });

  ["cpw-price", "cpw-wears", "cpw-years"].forEach(function (id) { $(id).addEventListener("input", updateCalc); });
  $("cpw-item-load").addEventListener("change", function () {
    var it = CC.findItem(this.value); if (!it || it.price == null) return;
    var v = CC.toMain(+it.price, it.currency); if (v == null) v = +it.price;
    var pr = $("cpw-price");
    pr.max = Math.max(800, Math.ceil(v / 100) * 100);
    pr.value = Math.max(10, Math.round(v));
    updateCalc();
  });
};

})(window.CC);
