window.CC = window.CC || {};
(function (CC) {

CC.$ = function (id) { return document.getElementById(id); };
CC.uid = function () { return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9); };
CC.esc = function (s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
};

/* ---------- notifications & dialogs ---------- */
CC.notify = function (msg) {
  var n = CC.$("notif");
  n.textContent = msg;
  n.classList.add("show");
  clearTimeout(CC.notify._t);
  CC.notify._t = setTimeout(function () { n.classList.remove("show"); }, 2800);
};
CC.openModal = function (id) { CC.$(id).classList.add("open"); };
CC.closeModal = function (id) { CC.$(id).classList.remove("open"); };
CC.confirm = function (title, body, onConfirm, label) {
  CC.$("confirm-title").textContent = title;
  CC.$("confirm-body").textContent = body;
  var btn = CC.$("confirm-ok");
  var fresh = btn.cloneNode(true);
  fresh.textContent = label || "Confirm";
  btn.parentNode.replaceChild(fresh, btn);
  fresh.addEventListener("click", function () { onConfirm(); CC.closeModal("modal-confirm"); });
  CC.openModal("modal-confirm");
};

/* ---------- money ---------- */
var ZERO_DEC = { JPY: 1, KRW: 1, VND: 1, CLP: 1, ISK: 1, HUF: 1, IDR: 1, UGX: 1, PYG: 1, XAF: 1, XOF: 1, KMF: 1, GNF: 1, RWF: 1, BIF: 1, DJF: 1, VUV: 1, IQD: 1, IRR: 1, LAK: 1, LBP: 1, MGA: 1, MMK: 1, SYP: 1, YER: 1 };
CC.money = function (amount, cur, withCode) {
  if (amount == null || isNaN(amount)) return "—";
  cur = cur || CC.mainCurrency();
  var c = CC.CUR[cur];
  var sym = c ? c.symbol : cur;
  var dec = ZERO_DEC[cur] ? 0 : 2;
  var neg = amount < 0;
  var num = Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
  return (neg ? "-" : "") + sym + num + (withCode ? " " + cur : "");
};
CC.mainCurrency = function () { return (CC.state && CC.state.settings.mainCurrency) || "USD"; };
// Convert to the main currency using the user's own typed rates. Returns null if no rate exists.
CC.toMain = function (amount, cur) {
  if (amount == null || isNaN(amount)) return 0;
  cur = cur || CC.mainCurrency();
  if (cur === CC.mainCurrency()) return amount;
  var r = CC.state.settings.rates[cur];
  return r ? amount * r : null;
};
CC.moneyMain = function (amount) { return CC.money(amount, CC.mainCurrency()); };

/* ---------- dates ---------- */
CC.todayISO = function () {
  var d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};
CC.parseISO = function (s) {
  if (!s) return null;
  var p = String(s).slice(0, 10).split("-");
  if (p.length !== 3) return null;
  var d = new Date(+p[0], +p[1] - 1, +p[2]);
  return isNaN(d) ? null : d;
};
CC.fmtDateLong = function (s) {
  var d = CC.parseISO(s);
  if (!d) return "";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
};
CC.daysAgo = function (n) {
  var d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};
CC.monthsAgo = function (n) {
  var d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
};
CC.yearsBetween = function (from, to) { return (to - from) / (365.25 * 24 * 3600 * 1000); };

/* ---------- safe rich text for notes ---------- */
var ALLOWED = { B: 1, STRONG: 1, I: 1, EM: 1, U: 1, UL: 1, OL: 1, LI: 1, BR: 1, P: 1, DIV: 1 };
var DROP = { SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, NOSCRIPT: 1, TEMPLATE: 1 };
CC.sanitizeHtml = function (html) {
  if (!html) return "";
  var doc = new DOMParser().parseFromString("<body>" + html + "</body>", "text/html");
  function clean(node) {
    var out = document.createDocumentFragment();
    Array.prototype.forEach.call(node.childNodes, function (ch) {
      if (ch.nodeType === 3) { out.appendChild(document.createTextNode(ch.nodeValue)); }
      else if (ch.nodeType === 1) {
        if (DROP[ch.tagName]) { /* skip entirely */ }
        else if (ALLOWED[ch.tagName]) {
          var el = document.createElement(ch.tagName.toLowerCase());
          el.appendChild(clean(ch));
          out.appendChild(el);
        } else {
          out.appendChild(clean(ch));
        }
      }
    });
    return out;
  }
  var holder = document.createElement("div");
  holder.appendChild(clean(doc.body));
  return holder.innerHTML;
};
// Old plain-text notes become safe HTML with line breaks kept.
CC.plainToHtml = function (txt) {
  return CC.esc(txt || "").replace(/\r?\n/g, "<br>");
};

CC.debounce = function (fn, ms) {
  var t;
  return function () {
    var a = arguments, self = this;
    clearTimeout(t);
    t = setTimeout(function () { fn.apply(self, a); }, ms);
  };
};

})(window.CC);
