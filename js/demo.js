window.CC = window.CC || {};
(function (CC) {

function dayISO(n) { return CC.daysAgo(n).toISOString().slice(0, 10); }
function logs(n, fromDaysAgo, toDaysAgo) {
  var out = [];
  for (var i = 0; i < n; i++) {
    var day = fromDaysAgo + (toDaysAgo - fromDaysAgo) * (n === 1 ? 0 : i / (n - 1));
    var d = CC.daysAgo(Math.round(day));
    d.setHours(12, 0, 0, 0);
    out.push(d.toISOString());
  }
  return out;
}

CC.buildDemo = function () {
  var s = CC.defaultState();
  s.isDemo = true;

  function add(status, o) {
    var it = CC.blankItem(status);
    Object.keys(o).forEach(function (k) { it[k] = o[k]; });
    if (!it.originalPrice && it.price != null) { it.originalPrice = it.price; it.originalCurrency = it.currency; }
    if (!it.originalCurrency) it.originalCurrency = it.currency;
    s.items.push(it);
    return it;
  }
  function fab() {
    var rows = [];
    for (var i = 0; i < arguments.length; i += 2) {
      var lib = CC.FABRICS[arguments[i]];
      rows.push({ fiber: arguments[i], percent: arguments[i + 1], type: lib ? lib.type : "", other: "" });
    }
    return rows;
  }

  add("closet", { id: "demo-linen", name: "Linen Shirt", brand: "Everlane", category: "Tops", subcategory: "Button-down & Shirt", colour: "White", size: "M", season: ["Spring", "Summer"], fabric: fab("Linen / Flax", 100), price: 88, originalPrice: 110, source: "Purchase", secondhand: "No", dateAcquired: dayISO(400), purchaseLocation: "Everlane.com", wearLog: logs(24, 3, 300), estimatedWears: 30 });
  add("closet", { id: "demo-trousers", name: "Wide Leg Trousers", brand: "COS", category: "Bottoms", subcategory: "Pants", colour: "Beige / Tan", size: "34", season: ["All-season"], fabric: fab("Wool (conventional)", 60, "Polyester", 40), price: 135, originalPrice: 175, source: "Purchase", secondhand: "No", dateAcquired: dayISO(700), purchaseLocation: "COS", tailorDate: dayISO(690), tailorCost: 25, wearLog: logs(18, 20, 600) });
  add("closet", { id: "demo-trench", name: "Trench Coat", brand: "Sandro", category: "Outerwear", subcategory: "Trench Coat", colour: "Beige / Tan", size: "S", season: ["Fall", "Spring"], fabric: fab("Conventional Cotton", 100), price: 420, originalPrice: 595, source: "Purchase", secondhand: "Yes", dateAcquired: dayISO(1600), purchaseLocation: "The RealReal", wearLog: logs(30, 15, 1500) });
  add("closet", { id: "demo-slip", name: "Silk Slip Dress", brand: "Reformation", category: "Dresses & Jumpsuits", subcategory: "Midi Dress", colour: "Pink", size: "4", season: ["Summer"], fabric: fab("Silk", 100), price: 248, originalPrice: 248, source: "Purchase", secondhand: "No", dateAcquired: dayISO(250), purchaseLocation: "Reformation", wearLog: logs(8, 120, 240) });
  add("closet", { id: "demo-loafers", name: "Leather Loafers", brand: "Madewell", category: "Footwear", subcategory: "Loafers", colour: "Brown", size: "7.5", season: ["All-season"], fabric: fab("Leather (conventional)", 100), price: 168, originalPrice: 198, source: "Purchase", secondhand: "No", dateAcquired: dayISO(900), purchaseLocation: "Madewell", tailorDate: dayISO(300), tailorCost: 35, wearLog: logs(45, 2, 850) });
  add("closet", { id: "demo-turtleneck", name: "Cashmere Turtleneck", brand: "Quince", category: "Tops", subcategory: "Sweater & Knit", colour: "Beige / Tan", size: "S", season: ["Winter"], fabric: fab("Cashmere", 100), price: 90, originalPrice: 130, source: "Purchase", secondhand: "No", dateAcquired: dayISO(500), purchaseLocation: "Quince", wearLog: logs(22, 30, 450) });
  add("closet", { id: "demo-puffer", name: "Nylon Puffer", brand: "Uniqlo", category: "Outerwear", subcategory: "Heavy Winter Wear", colour: "Green", size: "M", season: ["Winter"], fabric: fab("Nylon / Polyamide", 100), price: 79, originalPrice: 99, source: "Purchase", secondhand: "No", dateAcquired: dayISO(1000), purchaseLocation: "Uniqlo", wearLog: logs(35, 10, 950) });
  add("closet", { id: "demo-denim", name: "Vintage Denim Jacket", brand: "Levi's", category: "Outerwear", subcategory: "Jacket", colour: "Blue", size: "M", season: ["Spring", "Fall"], fabric: fab("Denim", 100), price: 45, originalPrice: 98, source: "Purchase", secondhand: "Yes", dateAcquired: dayISO(120), purchaseLocation: "Depop", wearLog: logs(6, 5, 100) });
  add("closet", { id: "demo-sneakers", name: "White Sneakers", brand: "Veja", category: "Footwear", subcategory: "Sneakers", colour: "White", size: "9", season: ["All-season"], fabric: fab("Organic Cotton", 60, "Rubber (natural)", 40), price: 120, currency: "GBP", originalPrice: 150, originalCurrency: "GBP", source: "Purchase", secondhand: "No", dateAcquired: dayISO(300), purchaseLocation: "Veja London", wearLog: logs(40, 1, 280) });
  add("closet", { id: "demo-tote", name: "Everyday Tote", brand: "Cuyana", category: "Bags", subcategory: "Tote", colour: "Black", season: ["All-season"], fabric: fab("Leather (conventional)", 100), price: 195, originalPrice: 195, source: "Gift", secondhand: "No", dateAcquired: dayISO(1900), purchaseLocation: "Gift from family", wearLog: logs(70, 2, 1800) });
  add("closet", { id: "demo-hoops", name: "Gold Hoop Earrings", brand: "Mejuri", category: "Accessories", subcategory: "Jewelry", jewelryMetal: "Gold-Plated", colour: "Yellow", season: ["All-season"], fabric: [], price: 68, originalPrice: 68, source: "Purchase", secondhand: "No", dateAcquired: dayISO(60), purchaseLocation: "Mejuri.com", wearLog: logs(4, 3, 50) });
  add("closet", { id: "demo-skirt", name: "Black Slip Skirt", brand: "Zara", category: "Bottoms", subcategory: "Skirt", colour: "Black", size: "S", season: ["Spring", "Summer"], fabric: fab("Viscose", 100), price: 39, originalPrice: 59, source: "Purchase", secondhand: "No", dateAcquired: dayISO(40), purchaseLocation: "Zara", wearLog: logs(2, 5, 30) });
  add("closet", { id: "demo-cardigan", name: "Hand-Knit Cardigan", brand: "Hand-made", category: "Tops", subcategory: "Cardigan", colour: "Green", season: ["Fall", "Winter"], fabric: fab("Merino Wool (mulesing-free)", 100), price: 40, originalPrice: 40, source: "Hand-Made", secondhand: "No", dateAcquired: dayISO(800), purchaseLocation: "Local yarn shop", timesWornStart: 12, wearLog: logs(3, 20, 200) });
  add("closet", { id: "demo-blouse", name: "Satin Blouse", brand: "H&M", category: "Tops", subcategory: "Blouse", colour: "Purple", size: "S", season: ["Spring"], fabric: fab("Polyester", 100), price: 55, originalPrice: 55, source: "Purchase", secondhand: "No", dateAcquired: dayISO(200), purchaseLocation: "H&M", wearLog: [] });
  add("closet", { id: "demo-blazer", name: "Grey Blazer", brand: "H&M", category: "Outerwear", subcategory: "Blazer", colour: "Grey", size: "S", season: ["All-season"], fabric: fab("Polyester", 70, "Viscose", 30), price: 60, originalPrice: 80, source: "Purchase", secondhand: "No", dateAcquired: dayISO(2000), purchaseLocation: "H&M", soldDonatedDate: dayISO(90), wearLog: logs(10, 120, 1900) });

  add("wishlist", { id: "demo-w-cardigan", name: "Merino Cardigan", brand: "Aritzia", category: "Tops", subcategory: "Cardigan", colour: "Beige / Tan", size: "S", season: ["Fall", "Winter"], fabric: fab("Merino Wool (mulesing-free)", 100), price: 148, originalPrice: 148, estimatedWears: 35, purchaseLocation: "Aritzia" });
  add("wishlist", { id: "demo-w-skirt", name: "Satin Midi Skirt", brand: "& Other Stories", category: "Bottoms", subcategory: "Skirt", colour: "Yellow", size: "S", season: ["Summer"], fabric: fab("Polyester", 100), price: 89, originalPrice: 89, estimatedWears: 40, purchaseLocation: "& Other Stories" });
  add("wishlist", { id: "demo-w-sneakers", name: "White Leather Sneakers", brand: "Common Projects", category: "Footwear", subcategory: "Sneakers", colour: "White", size: "9", season: ["All-season"], fabric: fab("Leather (conventional)", 100), price: 410, originalPrice: 410, estimatedWears: 100, purchaseLocation: "Common Projects" });

  s.outfits.push({
    id: "demo-outfit-1", name: "Weekend errands", dateCreated: new Date().toISOString(),
    pieces: [
      { uid: "p1", itemId: "demo-linen", x: 28, y: 4, w: 44, z: 2, cut: true },
      { uid: "p2", itemId: "demo-trousers", x: 30, y: 34, w: 40, z: 1, cut: true },
      { uid: "p3", itemId: "demo-loafers", x: 36, y: 72, w: 28, z: 3, cut: true },
      { uid: "p4", itemId: "demo-tote", x: 4, y: 34, w: 24, z: 4, cut: true }
    ]
  });
  return s;
};

})(window.CC);
