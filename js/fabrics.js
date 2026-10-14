window.CC = window.CC || {};
(function (CC) {

CC.tierFromScore = function (s) {
  return s >= 80 ? "Excellent" : s >= 60 ? "Good" : s >= 45 ? "Middling" : s >= 25 ? "Poor" : "Very Poor";
};

CC.FABRICS = {};
CC.FABRIC_GROUPS = [];

function group(label, rows) {
  var names = [];
  rows.forEach(function (r) {
    // r = [name, score, type, note, estimated?]
    CC.FABRICS[r[0]] = {
      score: r[1],
      tier: r[1] == null ? "Unscored" : CC.tierFromScore(r[1]),
      type: r[2],
      note: r[3],
      est: !!r[4],
      group: label
    };
    names.push(r[0]);
  });
  CC.FABRIC_GROUPS.push({ label: label, names: names.sort() });
}

// "est" (5th value) = true means the score is an estimate beyond the two source guides.

group("Natural fibre – plant", [
  ["Hemp",95,"natural","Needs no pesticides or extra irrigation; carbon-negative to grow."],
  ["Organic Hemp",96,"natural","Same low-input crop as hemp, grown without any synthetic inputs."],
  ["Linen / Flax",93,"natural","Grows on rainfall alone; the whole plant is used, with almost no waste."],
  ["Organic Cotton",78,"natural","~60% less energy and ~45% less CO2 than conventional cotton, per GOTS/BCI data."],
  ["Conventional Cotton",45,"natural","Biodegradable, but can take over 2,700 liters of water per t-shirt and heavy pesticide use."],
  ["Recycled Cotton",70,"natural","Lower water and land footprint than virgin cotton, though fibers are shorter and often blended."],
  ["Jute",80,"natural","Typically grown without pesticides or fertilizer; very durable."],
  ["Coir (coconut fiber)",68,"natural","Byproduct of coconut processing; biological retting, low chemical input."],
  ["Ramie",72,"natural","Linen-like bast fibre that needs little water or pesticide, but chemical degumming is a drawback.",true],
  ["Sisal",75,"natural","Hardy low-input plant fibre, strong and biodegradable; coarse, so mostly used in accessories.",true],
  ["Kapok",80,"natural","Seed-pod fibre harvested from wild or low-input trees; biodegradable, mainly used as fill.",true],
  ["Abacá (Manila hemp)",80,"natural","Banana-family plant giving an extremely strong, biodegradable fibre (used in Bananatex).",true],
  ["Banana Fiber",80,"natural","Often made from a farm byproduct, so little extra land, water or pesticide is needed.",true],
  ["Nettle Fiber",82,"natural","Grows with few inputs and no pesticide need; similar feel to linen.",true],
  ["Straw",78,"natural","Renewable plant material, biodegradable; mostly used for hats and bags.",true]
]);

group("Natural fibre – animal", [
  ["Wool (conventional)",62,"natural","Biodegradable and durable, but shearing and land-use practices vary widely by farm."],
  ["Virgin Wool",62,"natural","New (never recycled) wool; same trade-offs as conventional wool.",true],
  ["Lambswool",60,"natural","Soft first-shearing wool; same farm-practice caveats as other wool.",true],
  ["Merino Wool (mulesing-free)",74,"natural","Fine, soft wool; biodegradable, with humane shearing practices when certified."],
  ["Responsible Wool (RWS)",75,"natural","Certified for animal welfare and land management standards."],
  ["Alpaca Wool",88,"natural","Soft-footed grazers that don't degrade land; far higher fiber yield per animal than cashmere goats."],
  ["Llama Wool",82,"natural","Low-impact camelid fibre similar to alpaca; hardy animals that graze lightly.",true],
  ["Yak Wool",86,"natural","Grazes at high altitude on leaves only, gentler on land than cashmere goats."],
  ["Camel Hair",85,"natural","Collected from natural shedding, not shearing; usually left undyed."],
  ["Qiviut",70,"natural","Rare musk-ox undercoat collected from natural shedding; tiny volumes, so traceability is key.",true],
  ["Cashmere",35,"natural","Very low yield per animal; overgrazing has driven land degradation in key sourcing regions."],
  ["Mohair",40,"natural","Durable natural fiber; animal welfare practices vary significantly by farm."],
  ["Angora",20,"natural","Widely documented welfare concerns in mass rabbit-fur production."],
  ["Silk",38,"natural","Biodegradable and strong, but conventional production boils live silkworm pupae and is chemically finished."]
]);

group("Regenerated fibre (semi-synthetic)", [
  ["TENCEL™ / Lyocell (branded)",92,"semi","Closed-loop process recovers ~99% of solvents; FSC-certified wood source."],
  ["Lyocell (generic)",85,"semi","Similar process to TENCEL but without the certified sourcing guarantee."],
  ["Modal",60,"semi","Beech-pulp fiber, less chemically intensive than viscose but still solvent-dependent."],
  ["Bamboo (mechanical / lyocell process)",78,"semi","Fast-growing, low-input crop — but only when processed mechanically or as lyocell, not standard bamboo rayon."],
  ["Bamboo Rayon (unspecified process)",38,"semi","Most \"bamboo\" fabric is actually rayon made with harsh chemicals despite the eco-sounding name."],
  ["Viscose / Rayon (conventional)",32,"semi","Heavy use of carbon disulfide and sulfuric acid; a notable source of ocean microfiber pollution."],
  ["Rayon (generic)",34,"semi","Umbrella label for regenerated cellulose; usually made like conventional viscose unless stated.",true],
  ["Viscose",32,"semi","Chemical-intensive wood-pulp process and sourcing from at-risk forests are the main concerns.",true],
  ["High Wet Modulus (HWM) Rayon",48,"semi","Stronger viscose variant, a step up from standard viscose but still a solvent-based process.",true],
  ["ECOVERO™ Viscose",62,"semi","Lenzing's lower-impact viscose from certified wood; the brand claims about half the water and emissions of standard viscose.",true],
  ["Naia™ Cellulosic Acetate",55,"semi","Wood-pulp acetate from certified plantations with recycled solvents; the maker says it avoids viscose's chemistry.",true],
  ["Cupro",40,"semi","Silky feel from cotton linter waste, but processed with hazardous solvents."],
  ["Acetate",35,"semi","Smooth, silk-like synthetic-cellulose blend; processed with acetic acid and acetone."],
  ["Triacetate",33,"semi","Close relative of acetate with a similar solvent-based process and limited recyclability.",true]
]);

group("Synthetic fibre", [
  ["Polyester",18,"synthetic","~80% of all synthetic fiber produced; roughly double the energy and triple the CO2 of cotton to make."],
  ["Recycled Polyester (rPET)",45,"synthetic","Diverts plastic bottles from landfill, but still sheds microplastics like virgin polyester."],
  ["Nylon / Polyamide",20,"synthetic","Produces nitrous oxide during manufacture; very difficult to recycle."],
  ["Recycled Nylon",42,"synthetic","Lower footprint than virgin nylon, but end-of-life recyclability is still limited."],
  ["Elastane / Spandex / Lycra",15,"synthetic","Petroleum-based stretch fiber, rarely used alone, that degrades quickly and isn't recyclable."],
  ["Acrylic",12,"synthetic","Made from a probable-carcinogen precursor chemical; sheds the most microplastic fiber of any common fabric."],
  ["Acrylic Blend Fibers",14,"synthetic","Blends carry acrylic's microfibre shedding and are hard to recycle.",true],
  ["Olefin / Polypropylene",22,"synthetic","Light, fast-drying and a single polymer (recyclable in theory), but fossil-based and sheds microplastics.",true],
  ["Polyurethane (PU)",14,"synthetic","Fossil-based plastic coating or foam; not recyclable into new garments.",true],
  ["Neoprene",10,"synthetic","Synthetic rubber (chloroprene) with an energy- and chemical-intensive process; practically unrecyclable.",true],
  ["Polyethylene (incl. UHMWPE)",20,"synthetic","Fossil-based but extremely durable; recyclability depends on the product.",true],
  ["Aramid (Kevlar®, Nomex®)",16,"synthetic","Very durable technical fibre but energy-intensive and not practically recyclable.",true],
  ["Microfiber",14,"synthetic","Ultra-fine polyester or nylon filaments that shed especially high amounts of microplastic in the wash.",true],
  ["PVC / Vinyl",6,"synthetic","Contains plasticisers and releases dioxins when burned; generally the worst-rated plastic coating.",true]
]);

group("Fabric construction", [
  ["Denim",42,"natural","Cotton twill; the dyeing and finishing steps are very water- and chemical-intensive unless certified.",true],
  ["Corduroy",45,"natural","Ridged cotton pile fabric; scored like conventional cotton unless the label says organic.",true],
  ["Canvas",45,"natural","Heavy plain-weave fabric, usually cotton; scored like conventional cotton.",true],
  ["Woven Cotton",45,"natural","Generic woven cotton; scored like conventional cotton unless the label says organic.",true],
  ["Fleece",18,"synthetic","Usually polyester; a major source of microfibre shedding in the wash.",true],
  ["Sequin",8,"synthetic","Tiny plastic discs (PET or PVC) that are essentially impossible to recycle.",true]
]);

group("Membrane / performance technology", [
  ["Gore-Tex® membrane",22,"synthetic","Classic ePTFE membrane is a PFAS fluoropolymer; Gore now offers a PFAS-free ePE version.",true],
  ["eVent® membrane",24,"synthetic","Waterproof-breathable ePTFE membrane with the same PFAS concerns as other fluoropolymers.",true],
  ["Cordura® Nylon",20,"synthetic","Tough branded nylon; carries nylon's footprint, but durability can extend product life.",true],
  ["Coolmax®",17,"synthetic","Moisture-wicking polyester; scores like polyester.",true],
  ["Thermolite®",17,"synthetic","Insulating hollow-core polyester; scores like polyester.",true],
  ["Dyneema®",20,"synthetic","Ultra-strong polyethylene fibre; the maker reports a low footprint for its performance, though this is self-reported.",true],
  ["Kevlar®",16,"synthetic","Aramid fibre; very durable but energy-intensive and not practically recyclable.",true]
]);

group("Leather, hides & fur", [
  ["Leather (conventional)",30,"natural","Chrome tanning uses carcinogenic chemicals and the hide is non-biodegradable; tied to cattle-driven deforestation."],
  ["Genuine Leather",30,"natural","Animal hide, usually chrome-tanned; scored like conventional leather unless the tanning is stated.",true],
  ["Leather (vegetable-tanned)",55,"semi","Biodegradable tanning method, but a much slower, pricier process — rare in mainstream retail."],
  ["Suede",32,"natural","Napped leather finish; carries the same tanning and cattle footprint as other leather.",true],
  ["Nubuck",32,"natural","Sanded top-grain leather finish; carries the same tanning and cattle footprint as other leather.",true],
  ["Shearling",40,"natural","Tanned sheepskin with the wool left on; a meat-industry byproduct with a chemical tanning step.",true],
  ["Sheepskin",38,"natural","Tanned sheep hide; a byproduct of meat but tanning is chemical-intensive.",true],
  ["Fur",10,"natural","The vast majority comes from animals factory-farmed solely for pelts."]
]);

group("Fill material", [
  ["Down (RDS certified)",55,"natural","Certified to exclude live-plucking, but still an animal byproduct."],
  ["Down (conventional)",35,"natural","Live-plucking is documented and legal in some of the largest supplier countries."],
  ["Recycled Down",58,"natural","Reclaimed from used products, avoiding new animal sourcing; quality depends on cleaning.",true],
  ["Feather (non-down fill)",45,"natural","Poultry byproduct with the same welfare questions as down, but lower loft.",true],
  ["Recycled Feather",55,"natural","Reclaimed feather fill that avoids new animal sourcing.",true],
  ["Polyester Fill",18,"synthetic","Synthetic insulation (often recycled PET); sheds microplastics and is hard to recycle again.",true]
]);

group("Alternative / vegan materials", [
  ["Piñatex (pineapple leaf)",82,"natural","Made from a farm byproduct; needs no extra land, water or pesticides."],
  ["Mycelium Leather",85,"natural","Grown from mushroom roots — animal-free and plastic-free."],
  ["Mushroom Leather",78,"semi","Mushroom-root leather; some brands add a plastic binder or backing, so check the label.",true],
  ["Mirum®",78,"natural","Plant-based leather alternative without a PU or PVC backing; the footprint claims come from brands.",true],
  ["Cork Leather",72,"natural","Bark harvested without felling the tree; thin cork fabric is often bonded to a backing.",true],
  ["Cactus Leather (Desserto®)",55,"semi","Plant-based but typically bound with PU; evidence on footprint is still thin.",true],
  ["Apple Leather",55,"semi","Apple-waste filler bound in a polyurethane coating, so only partly bio-based.",true],
  ["Vegea® (grape leather)",58,"semi","Winemaking waste combined with a PU binder, so only partly bio-based.",true],
  ["Faux Leather",12,"synthetic","Usually a PU or PVC coating on a fabric backing; fossil-based and not biodegradable.",true],
  ["Faux Fur",15,"synthetic","Acrylic or polyester pile; sheds microplastics and doesn't biodegrade.",true],
  ["Recycled Faux Fur",28,"synthetic","Recycled-plastic pile, a small step up from virgin but still plastic.",true]
]);

group("Footwear materials", [
  ["EVA (Ethylene Vinyl Acetate)",22,"synthetic","Lightweight foam sole material; fossil-based and rarely recycled.",true],
  ["TPU (Thermoplastic Polyurethane)",24,"synthetic","Durable plastic used in soles and coatings; can be recycled in dedicated streams.",true],
  ["Rubber (natural)",55,"natural","Tapped from rubber trees and biodegradable, but plantation expansion can drive deforestation.",true],
  ["Rubber (synthetic)",14,"synthetic","Petroleum-based rubber; durable but not biodegradable.",true],
  ["Recycled Rubber",45,"synthetic","Reclaimed (often tyre) rubber that avoids new production.",true],
  ["Cork",78,"natural","Renewable bark harvested without felling trees; biodegradable.",true]
]);

group("Not specified", [
  ["Unavailable",null,"","Label doesn't say — left out of the sustainability score."]
]);

CC.FABRIC_NAMES = Object.keys(CC.FABRICS);
CC.TYPE_LABEL = { natural: "Natural", synthetic: "Synthetic", semi: "Semi-synthetic" };

})(window.CC);
