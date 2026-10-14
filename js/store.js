window.CC = window.CC || {};
(function (CC) {

var DB_NAME = "cartAndCloset", LEGACY_KEY = "cartAndClosetState_v2";

CC.photos = {};          // id -> { src, cutout }
CC.persistent = false;
var db = null, dirtyPhotos = {}, deletedPhotos = {};

CC.defaultSettings = function () {
  return {
    mainCurrency: "USD",
    // How many main-currency units equal 1 unit of the other currency. Approximate and editable.
    rates: { EUR: 1.08, GBP: 1.27, CAD: 0.73, AUD: 0.65, JPY: 0.0067 },
    lastCurrency: "USD",
    cardSize: "M",
    showArchived: false
  };
};
CC.defaultState = function () {
  return {
    v: 3, items: [], outfits: [], isDemo: false,
    settings: CC.defaultSettings(),
    compare: { mode: "wishlist", wishSel: [], cmpWish: [], cmpCloset: [] }
  };
};

CC.blankItem = function (status) {
  var cur = (CC.state && CC.state.settings.lastCurrency) || "USD";
  return {
    id: CC.uid(), status: status || "closet",
    name: "", brand: "",
    category: "", subcategory: "", jewelryMetal: "",
    colour: "", colourOther: "", hex: "",
    size: "", length: "", sku: "", season: [],
    fabric: [],
    photoId: null, photoPos: { x: 50, y: 50 },
    price: null, currency: cur, originalPrice: null, originalCurrency: cur,
    estimatedWears: null, timesWornStart: 0, wearLog: [],
    source: "", secondhand: "", dateAcquired: "", purchaseLocation: "", soldDonatedDate: "",
    tailorDate: "", tailorCost: null, tailorCurrency: cur,
    sourceUrl: "", notes: "", decision: "",
    dateAdded: new Date().toISOString()
  };
};

/* ---------- accessors ---------- */
CC.isArchived = function (it) { return it.status === "closet" && !!it.soldDonatedDate; };
CC.closet = function (includeArchived) {
  return CC.state.items.filter(function (i) { return i.status === "closet" && (includeArchived || !CC.isArchived(i)); });
};
CC.wishlist = function () { return CC.state.items.filter(function (i) { return i.status === "wishlist"; }); };
CC.findItem = function (id) { return CC.state.items.filter(function (i) { return i.id === id; })[0]; };

/* ---------- photos ---------- */
CC.photoSrc = function (it, useCutout) {
  if (!it || !it.photoId) return "";
  var p = CC.photos[it.photoId];
  if (!p) return "";
  return (useCutout && p.cutout) ? p.cutout : p.src;
};
CC.addPhoto = function (src) {
  var id = CC.uid();
  CC.photos[id] = { src: src, cutout: null };
  dirtyPhotos[id] = true;
  return id;
};
CC.setCutout = function (id, dataUrl) {
  if (CC.photos[id]) { CC.photos[id].cutout = dataUrl; dirtyPhotos[id] = true; CC.save(); }
};
CC.removePhoto = function (id) {
  if (!id || !CC.photos[id]) return;
  delete CC.photos[id];
  delete dirtyPhotos[id];
  deletedPhotos[id] = true;
};

/* ---------- IndexedDB plumbing ---------- */
function openDB() {
  return new Promise(function (resolve, reject) {
    if (!window.indexedDB) { reject(new Error("no indexedDB")); return; }
    var r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = function () {
      var d = r.result;
      if (!d.objectStoreNames.contains("kv")) d.createObjectStore("kv");
      if (!d.objectStoreNames.contains("photos")) d.createObjectStore("photos");
    };
    r.onsuccess = function () { resolve(r.result); };
    r.onerror = function () { reject(r.error); };
  });
}
function req(store, mode, fn) {
  return new Promise(function (resolve, reject) {
    var tx = db.transaction(store, mode);
    var out = fn(tx.objectStore(store));
    tx.oncomplete = function () { resolve(out && out.result !== undefined ? out.result : undefined); };
    tx.onerror = function () { reject(tx.error); };
    tx.onabort = function () { reject(tx.error); };
  });
}
function idbGet(store, key) { return req(store, "readonly", function (s) { return s.get(key); }); }
function idbPut(store, key, val) { return req(store, "readwrite", function (s) { return s.put(val, key); }); }
function idbDel(store, key) { return req(store, "readwrite", function (s) { return s.delete(key); }); }
function idbAllPhotos() {
  return new Promise(function (resolve, reject) {
    var out = {};
    var tx = db.transaction("photos", "readonly");
    var c = tx.objectStore("photos").openCursor();
    c.onsuccess = function () {
      var cur = c.result;
      if (cur) { out[cur.key] = cur.value; cur.continue(); }
    };
    tx.oncomplete = function () { resolve(out); };
    tx.onerror = function () { reject(tx.error); };
  });
}

CC.flush = function () {
  if (!db) return Promise.resolve();
  var jobs = [idbPut("kv", "state", JSON.parse(JSON.stringify(CC.state)))];
  Object.keys(dirtyPhotos).forEach(function (id) {
    if (CC.photos[id]) jobs.push(idbPut("photos", id, CC.photos[id]));
  });
  dirtyPhotos = {};
  Object.keys(deletedPhotos).forEach(function (id) { jobs.push(idbDel("photos", id)); });
  deletedPhotos = {};
  return Promise.all(jobs).catch(function () {
    CC.notify("Couldn't save — your browser storage may be full. Export a backup.");
  });
};
CC.save = CC.debounce(function () { CC.flush(); }, 150);
window.addEventListener("pagehide", function () { CC.flush(); });
document.addEventListener("visibilitychange", function () { if (document.hidden) CC.flush(); });

/* ---------- migration from the earlier (v2) save format ---------- */
function migrateItemV2(o, status) {
  var it = CC.blankItem(status);
  var cat = o.category || "", sub = o.subcategory || "";
  if (cat === "Shoes") { cat = "Footwear"; sub = sub || "Shoes"; }
  if (cat === "Sweaters & Knits") { cat = "Tops"; sub = sub || "Sweater & Knit"; }
  it.id = o.id || it.id;
  it.name = o.name || ""; it.brand = o.brand || "";
  it.category = cat; it.subcategory = sub;
  it.colour = o.color || o.colour || "";
  it.size = o.size || ""; it.season = o.season || [];
  it.fabric = (o.fabric || []).map(function (f) {
    var lib = CC.FABRICS[f.fiber];
    return { fiber: f.fiber, percent: f.percent, type: lib ? lib.type : "", other: "" };
  });
  it.price = o.price != null ? o.price : null;
  it.estimatedWears = o.estimatedWears || null;
  it.wearLog = o.wearLog || [];
  it.sourceUrl = o.sourceUrl || "";
  it.notes = CC.plainToHtml(o.notes || "");
  it.decision = o.decision || "";
  it.dateAdded = o.dateAdded || it.dateAdded;
  if (status === "closet" && o.dateAdded) it.dateAcquired = String(o.dateAdded).slice(0, 10);
  if (o.photo) it.photoId = CC.addPhoto(o.photo);
  return it;
}
CC.migrateLegacy = function (old) {
  var s = CC.defaultState();
  (old.closet || []).forEach(function (o) { s.items.push(migrateItemV2(o, "closet")); });
  (old.wishlist || []).forEach(function (o) { s.items.push(migrateItemV2(o, "wishlist")); });
  s.outfits = [];
  (old.outfits || []).forEach(function (o, n) {
    var pieces = (o.itemIds || []).map(function (id, i) {
      return { uid: CC.uid(), itemId: id, x: 8 + (i % 3) * 30, y: 6 + Math.floor(i / 3) * 34, w: 28, z: i + 1, cut: true };
    });
    s.outfits.push({ id: o.id || CC.uid(), name: o.name || "Outfit " + (n + 1), pieces: pieces, dateCreated: o.dateCreated || new Date().toISOString() });
  });
  s.isDemo = false;
  return s;
};

function normalizeState(s) {
  var d = CC.defaultState();
  s = s || {};
  s.v = 3;
  s.items = s.items || [];
  s.outfits = s.outfits || [];
  s.settings = Object.assign(d.settings, s.settings || {});
  s.settings.rates = Object.assign({}, d.settings.rates, (s.settings && s.settings.rates) || {});
  s.compare = Object.assign(d.compare, s.compare || {});
  s.isDemo = !!s.isDemo;
  return s;
}

/* ---------- start-up ---------- */
CC.init = function () {
  return openDB().then(function (d) { db = d; CC.persistent = true; }, function () { db = null; })
    .then(function () { return db ? idbGet("kv", "state") : null; })
    .then(function (saved) {
      if (saved) {
        CC.state = normalizeState(saved);
        return idbAllPhotos().then(function (p) { CC.photos = p; });
      }
      var legacy = null;
      try { legacy = localStorage.getItem(LEGACY_KEY); } catch (e) {}
      if (legacy) {
        try { CC.state = normalizeState(CC.migrateLegacy(JSON.parse(legacy))); }
        catch (e) { CC.state = CC.buildDemo(); }
      } else {
        CC.state = CC.buildDemo();
      }
      Object.keys(CC.photos).forEach(function (id) { dirtyPhotos[id] = true; });
      return CC.flush();
    })
    .then(function () {
      if (!db) CC.notify("This browser can't save between visits — use Export JSON to keep your work.");
    });
};

/* ---------- export / import ---------- */
CC.exportData = function () {
  return {
    app: "cart-and-closet", version: 3, exportedAt: new Date().toISOString(),
    state: CC.state, photos: CC.photos
  };
};
CC.importData = function (obj) {
  var next, photos = {}, oldIds = Object.keys(CC.photos);
  if (obj && obj.app === "cart-and-closet" && obj.state) {
    next = normalizeState(obj.state);
    photos = obj.photos || {};
  } else if (obj && (obj.closet || obj.wishlist)) {
    CC.photos = {};
    next = normalizeState(CC.migrateLegacy(obj));
    photos = CC.photos;
  } else {
    throw new Error("unrecognized");
  }
  // wipe stored photos, then replace
  oldIds.forEach(function (id) { deletedPhotos[id] = true; });
  CC.photos = photos;
  Object.keys(photos).forEach(function (id) { dirtyPhotos[id] = true; delete deletedPhotos[id]; });
  CC.state = next;
  return CC.flush();
};
CC.resetAll = function () {
  Object.keys(CC.photos).forEach(function (id) { deletedPhotos[id] = true; });
  CC.photos = {};
  CC.state = CC.defaultState();
  return CC.flush();
};

})(window.CC);
