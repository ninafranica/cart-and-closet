# 🛍️ Cart & Closet

A free, browser-based pre-purchase wardrobe decision tool. Before you check out, see how the item stacks up against what you already own — cost per wear, fabric sustainability, and how many new outfits it actually unlocks.

**No sign-up. No install. No internet required after load. No data ever leaves your device.**

---

## ✨ Features at a Glance

- 🖥️ **All-in-one dashboard** — Closet, Wishlist, and Outfit Builder live side by side on one screen (like the reference garden-planner tool), and each panel can expand to fill the view while the other two collapse into thin strips you click to switch back
- 🧺 **Digital closet twin** — catalog what you already own (excluding basics like socks/underwear), browsable by category, color, and season
- 🛒 **Wishlist ("the cart")** — add things you're considering buying, with manual entry plus a best-effort auto-fill from a product URL
- ⚖️ **Compare** — toggle between comparing wishlist items against each other, or one wishlist item against similar things you already own
- ✅ **Decision checklist** — a running list of your wishlist items with quick tags (synthetic %, cost/wear, new-category-or-duplicate) and a manual Buy / Wait / Skip choice you set yourself
- 👗 **Outfit value scoring** — an estimated count of new outfit combinations a candidate item would create with your current closet, shown as one of three score bars on every wishlist card (alongside sustainability and cost/wear)
- 🎨 **Drag-and-drop outfit builder** — a freeform board for arranging and saving specific outfits from your closet + wishlist
- 🧮 **Cost-per-wear calculator** — a "what if" slider playground (price / wears-per-year / years owned), which can also load a real item's price to start from
- 🌱 **Fabric sustainability scoring** — automatic score from ~38 fibers (organic cotton, hemp, linen, wool, alpaca, cashmere, silk, polyester, nylon, TENCEL™/lyocell, recycled fibers, and more), based on real water-use, biodegradability, and microplastic data
- 📊 **Analytics page** — wardrobe value, average cost/wear, most-worn item, and a Natural / Semi-synthetic / Synthetic fiber breakdown with a donut chart, plus ranked cost-per-wear and wear-frequency charts
- 💾 **Auto-save + manual backup** — your data is saved in this browser automatically; export a `.json` backup anytime to move it elsewhere or keep a copy
- 📱 **Mobile-friendly** — built desktop-first as a dashboard, and stacks into a single scrolling column on phones

---

## 🚀 Getting Started

The app opens with a small set of demo items already in place so the dashboard isn't empty on first look — a banner at the top lets you **Clear demo data** whenever you're ready to start adding your own.

1. Open `index.html` in any modern browser (Chrome, Safari, Firefox, Edge), or visit the deployed GitHub Pages link.
2. Click **+ Add closet item** and add a handful of pieces you already own — this is what everything else gets compared against.
3. Considering a purchase? Click **+ Add to wishlist**, fill in the details (or try the auto-fill button with a product link), and estimate its fabric composition.
4. Click **Compare** on the Wishlist Cart panel — toggle "vs Wishlist" to stack a few prospective items against each other, or "vs Closet" to check one against similar things you already own.
5. Click **Decision list** to log a Buy / Wait / Skip call on each wishlist item, with quick tags to back it up.
6. Drag items onto the **Outfit Builder** board (from either the Closet panel or a wishlist card's "Try on" button) to test combinations, then name and save one.
7. Decided to buy something? Click **→ Move to closet** — it moves in, and you can start logging real wears ("I wore this today") for its actual cost per wear.
8. Click the **Analytics** tab for a wardrobe-wide view: value, cost per wear, and your natural/semi-synthetic/synthetic fiber split.
9. Click **Export JSON** every so often to keep a portable backup of your data.

---

## 🗺️ Layout Overview

The Planner page is a three-panel dashboard:

### My Closet (left)
Your digital wardrobe twin. Search and filter by category, color, or season. Each row shows a photo (or a category icon) and cost per wear once you've logged wears.

### Wishlist Cart (center)
Items you're considering, shown as cards with three score bars — Sustainability, Cost/wear, Outfit value — and an overall score chip (numbers only, no "buy this" verdict). Add manually or try the "auto-fill from URL" button — this is best-effort only: most retailer sites block browsers from reading their pages directly (a security restriction called CORS), so expect to fill most fields in by hand. **Compare** and **Decision list** toggle two panels beneath the cards.

### Outfit Builder (right)
A cost-per-wear slider calculator, a freeform drag-and-drop board for building outfits, your saved outfits, and a sustainability sidebar summarizing your closet's fabric mix with a score ring and per-fiber bars.

Click the ⤢ icon in any panel's header to expand it full-width — the other two collapse into thin labeled strips along the edge; click a strip to jump to that panel instead.

### Analytics (second top-level page)
Wardrobe value, average cost per wear, your most-worn item, and a Natural / Semi-synthetic / Synthetic fiber breakdown with a donut chart, plus ranked charts for cost-per-wear and wear frequency across your closet.

---

## 🌱 Sustainability Scoring

Every item's score is a weighted average across its fabric composition, using a built-in reference table of ~38 fibers — built from real production data on water usage, pesticide/chemical inputs, biodegradability, and microplastic shedding. A 60% organic cotton / 40% elastane top, for example, is scored mostly on the cotton with a penalty for the synthetic stretch fiber.

Tiers: **Excellent · Good · Middling · Poor · Very Poor**

Each fiber is also tagged as **Natural**, **Semi-synthetic**, or **Synthetic** — this coarser split feeds the Analytics pie chart and the sustainability sidebar's color-coding (sage = natural, slate = semi-synthetic, terracotta = synthetic).

Sources referenced when building the fiber reference table:
- [Let's Go Green — Guide to Sustainable Fabrics](https://letsgogreen.com/sustainable-textiles/guide-to-sustainable-fabrics/)
- [GoClimate — Sustainable Textile Materials](https://www.goclimate.com/knowledge/sustainable-textile-materials)

## 💵 Cost-Per-Wear Logic

- **Wishlist items** get a smart default estimated wear count based on category (e.g. a top defaults to ~30 wears, a coat to ~80), which you can edit.
- **Closet items** start on that same estimate, but once you log actual wears ("I wore this today"), cost-per-wear switches to real data: price ÷ actual wears logged.
- The standalone **cost-per-wear calculator** in the Outfit Builder panel is a separate "what if" tool — three sliders (price, wears/year, years owned) you can play with freely, or seed from a real item's price via the "Load an item…" dropdown.

## 👗 Outfit Value

A lightweight proxy for versatility, not a styling engine: it counts simple top(or dress) + bottom + shoe combinations possible with vs. without the candidate item, scaled to a 0–100 bar on each wishlist card. Useful for spotting when something barely pairs with anything you own — not a guarantee of real-world outfit quality.

---

## 💾 Save & Load

- Your closet, wishlist, outfits, and decisions **auto-save in this browser** as you go — closing the tab is safe.
- Auto-save is tied to *this browser on this device*. Click **Export JSON** to download a portable backup — do this before clearing browser data, switching devices, or switching browsers, and use **Import JSON** to load it back in.

---

## 🧱 Tech Stack

- **Single HTML file** — zero dependencies, no build step, no framework
- **Vanilla JavaScript** — all logic, no libraries
- **CSS Grid** — for the dashboard layout and card grids (no `<canvas>` — outfit building uses plain draggable elements, which is simpler and more accessible for this than pixel-based canvas rendering)
- **LocalStorage** — for auto-save between visits
- Works entirely offline once loaded

## 📁 Project Structure

```
cart-and-closet/
├── index.html      # The entire app — HTML, CSS, and JS in one file
├── CLAUDE.md        # The advisor persona this tool is built around
└── README.md
```

---

## 📄 License

MIT — free to use, modify, and share.
