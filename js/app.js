window.CC = window.CC || {};
(function (CC) {

var $ = CC.$;
CC.expandedPanel = null;

CC.renderAll = function () {
  CC.renderCloset();
  CC.renderWishlist();
  CC.renderCompare();
  CC.renderChecklist();
  CC.renderOutfits();
  CC.renderAnalytics();
  $("demo-banner").style.display = CC.state.isDemo ? "flex" : "none";
};

/* ---------- panel expand / collapse ---------- */
function applyExpand() {
  var ws = $("workspace"), key = CC.expandedPanel;
  ws.classList.remove("exp-closet", "exp-centre", "exp-right");
  ["panel-closet", "panel-centre", "panel-right"].forEach(function (id) { $(id).classList.remove("is-expanded"); });
  if (key) { ws.classList.add("exp-" + key); $("panel-" + key).classList.add("is-expanded"); }
  document.querySelectorAll("[data-expand]").forEach(function (b) {
    var on = b.dataset.expand === key;
    b.textContent = on ? "⤡" : "⤢";
    b.title = on ? "Back to dashboard" : "Expand";
  });
  CC.renderCloset();
  setTimeout(CC.fitBoard, 280);
  CC.fitBoard();
}

/* ---------- currency settings ---------- */
var APPROX_USD = { USD: 1, EUR: 1.08, GBP: 1.27, CAD: 0.73, AUD: 0.65, JPY: 0.0067 };
function usedCurrencies() {
  var s = {};
  CC.state.items.forEach(function (i) {
    [i.currency, i.originalCurrency, i.tailorCurrency].forEach(function (c) { if (c) s[c] = 1; });
  });
  Object.keys(CC.state.settings.rates).forEach(function (c) { s[c] = 1; });
  return Object.keys(s);
}
function settingsBody(main, rates) {
  var opts = CC.CURRENCIES.map(function (c) { return '<option value="' + c[0] + '"' + (c[0] === main ? " selected" : "") + ">" + CC.esc(CC.currencyLabel(c[0]) + " — " + c[1]) + "</option>"; }).join("");
  var rows = usedCurrencies().filter(function (c) { return c !== main; }).sort().map(function (c) {
    return '<tr><td>1 ' + c + ' =</td><td><input type="number" step="any" min="0" data-rate="' + c + '" value="' + (rates[c] != null ? rates[c] : "") + '" placeholder="rate"></td><td>' + main + "</td></tr>";
  }).join("");
  return '<label class="form-label first">Main currency (used for all totals)</label><select id="set-main">' + opts + "</select>" +
    '<label class="form-label">Exchange rates</label><table class="rate-table"><tbody>' + (rows || '<tr><td class="settings-note">You only use your main currency — nothing to set.</td></tr>') + "</tbody></table>" +
    '<div class="settings-note">Rates are typed by you and only used to add up spending in analytics, so the app keeps working offline. They\'re approximate starting values — adjust them whenever you like.</div>';
}
function paintSettings(main, rates) {
  $("settings-body").innerHTML = settingsBody(main, rates);
  $("set-main").addEventListener("change", function () {
    var m = this.value, r = {};
    usedCurrencies().forEach(function (c) {
      if (c !== m && APPROX_USD[c] && APPROX_USD[m]) r[c] = +(APPROX_USD[c] / APPROX_USD[m]).toPrecision(4);
    });
    paintSettings(m, r);
  });
}
CC.openSettings = function () {
  var st = CC.state.settings;
  paintSettings(st.mainCurrency, st.rates);
  CC.openModal("modal-settings");
};

/* ---------- boot ---------- */
function showPage(p) {
  $("page-planner").classList.toggle("active", p === "planner");
  $("page-analytics").classList.toggle("active", p === "analytics");
  document.querySelectorAll(".nav-tab").forEach(function (b) { b.classList.toggle("active", b.dataset.page === p); });
  if (p === "analytics") CC.renderAnalytics(); else CC.fitBoard();
}

function wire() {
  CC.initForm(); CC.initCloset(); CC.initWishlist(); CC.initOutfit(); CC.initAnalytics();

  document.querySelectorAll(".nav-tab").forEach(function (b) { b.addEventListener("click", function () { showPage(b.dataset.page); }); });
  document.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", function () { CC.closeModal(b.dataset.close); }); });
  document.querySelectorAll(".modal-back").forEach(function (m) {
    m.addEventListener("mousedown", function (e) { m._down = e.target === m; });
    m.addEventListener("click", function (e) {
      // the long form never closes by accident
      if (e.target === m && m._down && m.id !== "modal-form") m.classList.remove("open");
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") document.querySelectorAll(".modal-back.open").forEach(function (m) { if (m.id !== "modal-form") m.classList.remove("open"); });
  });

  document.querySelectorAll("[data-expand]").forEach(function (b) {
    b.addEventListener("click", function () {
      CC.expandedPanel = CC.expandedPanel === b.dataset.expand ? null : b.dataset.expand;
      applyExpand();
    });
  });
  document.querySelectorAll("[data-strip]").forEach(function (s) {
    s.addEventListener("click", function () { CC.expandedPanel = s.dataset.strip; applyExpand(); });
  });

  $("btn-open-closet").addEventListener("click", function () { CC.openForm("closet", "add"); });
  $("btn-open-wishlist").addEventListener("click", function () { CC.openForm("wishlist", "add"); });
  $("btn-open-wishlist-2").addEventListener("click", function () { CC.openForm("wishlist", "add"); });

  $("btn-clear-demo").addEventListener("click", function () {
    CC.confirm("Clear demo data?", "This removes all demo closet, wishlist and outfit items so you can start fresh with your own.", function () {
      CC.resetAll().then(function () { CC.renderAll(); CC.notify("Demo data cleared."); });
    }, "Confirm");
  });

  $("btn-export").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify(CC.exportData())], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "cart-and-closet-backup-" + CC.todayISO() + ".json";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    CC.notify("Backup downloaded — keep it somewhere safe.");
  });
  $("import-input").addEventListener("change", function (e) {
    var f = e.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function (ev) {
      var obj;
      try { obj = JSON.parse(ev.target.result); } catch (err) { CC.notify("That file doesn't look like a valid backup."); return; }
      CC.confirm("Replace current data?", "Importing this backup will replace everything currently in your closet, wishlist and outfits.", function () {
        try {
          CC.importData(obj).then(function () { CC.renderAll(); CC.notify("Backup imported."); });
        } catch (err) { CC.notify("That file doesn't look like a valid backup."); }
      });
    };
    r.readAsText(f); e.target.value = "";
  });

  $("btn-save-settings").addEventListener("click", function () {
    var st = CC.state.settings;
    var main = $("set-main").value, rates = {};
    document.querySelectorAll("[data-rate]").forEach(function (i) {
      var v = parseFloat(i.value); if (v > 0) rates[i.dataset.rate] = v;
    });
    st.mainCurrency = main; st.rates = rates;
    CC.save(); CC.closeModal("modal-settings"); CC.renderAll(); CC.notify("Currency settings saved.");
  });
}

document.addEventListener("DOMContentLoaded", function () {
  CC.init().then(function () {
    wire();
    CC.renderAll();
    CC.fitBoard();
  }, function (err) { console.error(err); CC.notify("Something went wrong starting the app."); });
});

})(window.CC);
