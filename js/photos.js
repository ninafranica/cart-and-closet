window.CC = window.CC || {};
(function (CC) {

var MAX_DIM = 1000;

function loadBitmap(file) {
  return new Promise(function (resolve, reject) {
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("decode")); };
    img.src = url;
  });
}

function hasTransparency(canvas) {
  var c = document.createElement("canvas");
  c.width = c.height = 48;
  var x = c.getContext("2d");
  x.drawImage(canvas, 0, 0, 48, 48);
  var d = x.getImageData(0, 0, 48, 48).data;
  for (var i = 3; i < d.length; i += 4) if (d[i] < 250) return true;
  return false;
}

// File -> resized data URL. Keeps transparency (PNG) when the upload has it.
CC.fileToDataURL = function (file) {
  return loadBitmap(file).then(function (img) {
    var scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
    var c = document.createElement("canvas");
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    var ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0, c.width, c.height);
    if (hasTransparency(c)) return c.toDataURL("image/png");
    var j = document.createElement("canvas");
    j.width = c.width; j.height = c.height;
    var jx = j.getContext("2d");
    jx.fillStyle = "#fff"; jx.fillRect(0, 0, j.width, j.height);
    jx.drawImage(c, 0, 0);
    return j.toDataURL("image/jpeg", 0.85);
  });
};

CC.imgPosStyle = function (it) {
  var p = it.photoPos || { x: 50, y: 50 };
  return "object-position:" + p.x + "% " + p.y + "%";
};
// Cropped thumbnail (honours the user's chosen framing) or the category icon.
CC.thumbHTML = function (it) {
  var src = CC.photoSrc(it);
  return src ? '<img src="' + CC.esc(src) + '" style="' + CC.imgPosStyle(it) + '" alt="">' : CC.itemFallbackIcon(it);
};
// Whole, uncropped photo.
CC.fullImgHTML = function (it) {
  var src = CC.photoSrc(it);
  return src ? '<img class="whole" src="' + CC.esc(src) + '" alt="">' : '<span class="fallback-icon">' + CC.itemFallbackIcon(it) + "</span>";
};

/* ---------- plain-background cut-out ---------- */
function dist(r, g, b, R, G, B) {
  var dr = r - R, dg = g - G, db = b - B;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}
function median(a) { a.sort(function (x, y) { return x - y; }); return a[a.length >> 1]; }

// Removes a plain/light background by flood-filling inward from the photo's edges.
// Resolves { ok:false } when the background isn't plain enough to cut cleanly.
CC.makeCutout = function (src) {
  return new Promise(function (resolve) {
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.onerror = function () { resolve({ ok: false, reason: "load" }); };
    img.onload = function () {
      try {
        var scale = Math.min(1, 700 / Math.max(img.width, img.height));
        var w = Math.max(1, Math.round(img.width * scale)), h = Math.max(1, Math.round(img.height * scale));
        var c = document.createElement("canvas");
        c.width = w; c.height = h;
        var ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        var im = ctx.getImageData(0, 0, w, h), d = im.data;

        // already transparent? nothing to do
        var transparentEdge = 0, edgeCount = 0;
        function edgeIdx(fn) {
          for (var x = 0; x < w; x++) { fn(x, 0); fn(x, h - 1); }
          for (var y = 1; y < h - 1; y++) { fn(0, y); fn(w - 1, y); }
        }
        var rs = [], gs = [], bs = [];
        edgeIdx(function (x, y) {
          var i = (y * w + x) * 4;
          edgeCount++;
          if (d[i + 3] < 40) transparentEdge++;
          else { rs.push(d[i]); gs.push(d[i + 1]); bs.push(d[i + 2]); }
        });
        if (transparentEdge / edgeCount > 0.5) { resolve({ ok: true, dataUrl: c.toDataURL("image/png"), already: true }); return; }
        if (rs.length < 10) { resolve({ ok: false, reason: "edge" }); return; }
        var R = median(rs.slice()), G = median(gs.slice()), B = median(bs.slice());

        // is the border mostly one colour?
        var close = 0;
        for (var k = 0; k < rs.length; k++) if (dist(rs[k], gs[k], bs[k], R, G, B) < 34) close++;
        if (close / rs.length < 0.85) { resolve({ ok: false, reason: "busy" }); return; }

        var orig = new Uint8ClampedArray(d);
        var minX, minY, maxX, maxY, frac = 0, done = false;
        // Strict-to-loose: light garments on light backgrounds need a tighter tolerance.
        var tries = [[40, 78], [24, 50], [14, 32]];
        for (var t = 0; t < tries.length && !done; t++) {
          var T = tries[t][0], SOFT = tries[t][1];
          d.set(orig);
          var bg = new Uint8Array(w * h);
          var stack = new Int32Array(w * h);
          var sp = 0;
          var tryPush = function (x, y) {
            var p = y * w + x;
            if (bg[p]) return;
            var i = p * 4;
            if (d[i + 3] < 40 || dist(d[i], d[i + 1], d[i + 2], R, G, B) < T) { bg[p] = 1; stack[sp++] = p; }
          };
          edgeIdx(tryPush);
          while (sp) {
            var p = stack[--sp], x = p % w, y = (p / w) | 0;
            if (x > 0) tryPush(x - 1, y);
            if (x < w - 1) tryPush(x + 1, y);
            if (y > 0) tryPush(x, y - 1);
            if (y < h - 1) tryPush(x, y + 1);
          }
          // write alpha, softening the boundary
          minX = w; minY = h; maxX = 0; maxY = 0;
          var fg = 0;
          for (var yy = 0; yy < h; yy++) {
            for (var xx = 0; xx < w; xx++) {
              var pp = yy * w + xx, ii = pp * 4;
              if (bg[pp]) { d[ii + 3] = 0; continue; }
              var nearBg = (xx > 0 && bg[pp - 1]) || (xx < w - 1 && bg[pp + 1]) || (yy > 0 && bg[pp - w]) || (yy < h - 1 && bg[pp + w]);
              if (nearBg) {
                var dd = dist(d[ii], d[ii + 1], d[ii + 2], R, G, B);
                d[ii + 3] = Math.round(255 * Math.max(0.15, Math.min(1, (dd - T) / (SOFT - T))));
              }
              fg++;
              if (xx < minX) minX = xx; if (xx > maxX) maxX = xx;
              if (yy < minY) minY = yy; if (yy > maxY) maxY = yy;
            }
          }
          frac = fg / (w * h);
          done = frac >= 0.03 && frac <= 0.93;
        }
        if (!done) { resolve({ ok: false, reason: frac < 0.03 ? "tiny" : "nothing" }); return; }

        ctx.putImageData(im, 0, 0);
        var pad = Math.round(Math.max(w, h) * 0.015);
        minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
        maxX = Math.min(w - 1, maxX + pad); maxY = Math.min(h - 1, maxY + pad);
        var cw = maxX - minX + 1, ch = maxY - minY + 1;
        var out = document.createElement("canvas");
        out.width = cw; out.height = ch;
        out.getContext("2d").drawImage(c, minX, minY, cw, ch, 0, 0, cw, ch);
        resolve({ ok: true, dataUrl: out.toDataURL("image/png") });
      } catch (e) {
        resolve({ ok: false, reason: "error" });
      }
    };
    img.src = src;
  });
};

})(window.CC);
