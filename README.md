# 🛍️ Cart & Closet

A free, browser-based pre-purchase wardrobe decision tool. Before you check out, see how the item stacks up against what you already own — cost per wear, fabric sustainability, and how many new outfits it actually unlocks.

**No sign-up. No install. No internet required after load. No data ever leaves your device.**

---

## ✨ Features at a Glance

- 🧺 **Digital closet twin** — catalog what you already own (excluding basics like socks/underwear), browsable by category, color, and season
- 🛒 **Wishlist ("the cart")** — add things you're considering buying, with manual entry plus a best-effort auto-fill from a product URL
- ⚖️ **Compare** — side-by-side metrics: cost per wear, sustainability score, fabric composition, versus similar items you already own
- 👗 **Outfit unlocking** — an estimated count of new outfit combinations a candidate item would create with your current closet
- 🎨 **Drag-and-drop outfit builder** — a visual board for manually assembling and saving specific outfits from your closet + wishlist
- 💵 **Cost-per-wear tracking** — smart per-category default estimates while an item is on your wishlist; once purchased, log real wears for an actual cost-per-wear
- 🌱 **Fabric sustainability scoring** — automatic score from ~35 fibers (organic cotton, hemp, linen, wool, alpaca, cashmere, silk, polyester, nylon, TENCEL™/lyocell, recycled fibers, and more), based on real water-use, biodegradability, and microplastic data
- 💾 **Auto-save + manual backup** — your data is saved in this browser automatically; export a `.json` backup anytime to move it elsewhere or keep a copy
- 📱 **Mobile-friendly** — built desktop-first, fully usable on phone including touch-based outfit building

---

## 🚀 Getting Started

1. Open `index.html` in any modern browser (Chrome, Safari, Firefox, Edge), or visit the deployed GitHub Pages link.
2. Click **+ Add to closet** and add a handful of pieces you already own — this is what everything else gets compared against.
3. Considering a purchase? Click **+ Add to wishlist**, fill in the details (or try the auto-fill button with a product link), and estimate its fabric composition.
4. Go to the **Compare** tab, pick the wishlist item, and see it side-by-side against similar things you already own.
5. Use **Outfits** to drag items onto a board and save specific combinations you'd actually wear.
6. Decided to buy it? Click **Mark as purchased** — it moves into your closet, and you can start logging real wears for its actual cost per wear.
7. Click **Export backup** every so often to keep a portable copy of your data.

---

## 🗺️ Layout Overview

### Closet
Your digital wardrobe twin. Filter by category, color, or season. Each card shows a photo (or a category icon), cost per wear, and a sustainability badge.

### Wishlist
Items you're considering. Add manually or try the "auto-fill from URL" button — this is best-effort only: most retailer sites block browsers from reading their pages directly (a security restriction called CORS), so expect to fill most fields in by hand.

### Compare
Pick a wishlist item to see it side-by-side with up to three similar things you already own: price, cost per wear, sustainability tier, and dominant fabric — plus an estimate of how many new outfit combinations it would unlock.

### Outfits
A drag-and-drop board. Drag (or click) items from the palette onto the board, arrange them, name the combination, and save it. Saved outfits appear in a gallery below and can be reloaded for editing.

---

## 🌱 Sustainability Scoring

Every item's score is a weighted average across its fabric composition, using a built-in reference table of common fibers — built from real production data on water usage, pesticide/chemical inputs, biodegradability, and microplastic shedding. A 60% organic cotton / 40% elastane top, for example, is scored mostly on the cotton with a penalty for the synthetic stretch fiber.

Tiers: **Excellent · Good · Middling · Poor · Very Poor**

Sources referenced when building the fiber reference table:
- [Let's Go Green — Guide to Sustainable Fabrics](https://letsgogreen.com/sustainable-textiles/guide-to-sustainable-fabrics/)
- [GoClimate — Sustainable Textile Materials](https://www.goclimate.com/knowledge/sustainable-textile-materials)

## 💵 Cost-Per-Wear Logic

- **Wishlist items** get a smart default estimated wear count based on category (e.g. a top defaults to ~30 wears, a coat to ~80), which you can edit.
- **Closet items** start on that same estimate, but once you log actual wears ("I wore this today"), cost-per-wear switches to real data: price ÷ actual wears logged.

## 👗 Outfit Unlocking

A lightweight proxy for versatility, not a styling engine: it counts simple top(or dress) + bottom + shoe combinations possible with vs. without the candidate item. Useful for spotting when something barely pairs with anything you own — not a guarantee of real-world outfit quality.

---

## 💾 Save & Load

- Your closet, wishlist, and outfits **auto-save in this browser** as you go — closing the tab is safe.
- Auto-save is tied to *this browser on this device*. Click **Export backup** to download a portable `.json` copy — do this before clearing browser data, switching devices, or switching browsers, and use **Import backup** to load it back in.

---

## 🧱 Tech Stack

- **Single HTML file** — zero dependencies, no build step, no framework
- **Vanilla JavaScript** — all logic, no libraries
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
