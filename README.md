# 🛍️ Cart & Closet

A free, browser-based pre-purchase wardrobe decision tool. Before you check out, see how the item stacks up against what you already own — cost per wear, fabric sustainability, and how many new outfits it actually unlocks.

**No sign-up. No install. No internet required after load. No data ever leaves your device.**

---

## ✨ Features at a Glance

- 🖥️ **All-in-one dashboard** — Closet, Wishlist Cart and Outfit Builder side by side. Every panel has an expand icon: the other two collapse into thin strips you click to switch.
- 🧺 **Digital closet twin** — catalogue what you own (skipping socks/underwear) with 12 categories and ~100 sub-categories; filter by category, sub-category, colour and season; search by name, brand or SKU.
- 🃏 **Flip-card closet view** — expand My Closet for a birds-eye grid of cards (Small / Medium / Large). Front: the whole photo with name and brand labels. Hover (or tap) for category, sub-category, fabric, wears and cost per wear, plus a **Full info** button.
- 🛒 **Wishlist ("the cart")** — three score bars per item (sustainability, cost/wear, outfit value). Manual entry first, with a best-effort auto-fill from a product link.
- ⚖️ **Compare** — wishlist vs wishlist (unlimited items, scrolls sideways) or wishlist vs closet (pick any number of items on both sides), with a written analysis for each wishlist item.
- ✅ **Decision checklist** — tags (synthetic %, cost/wear, duplicates in sub-category and category) and a Buy / Wait / Skip choice you set yourself. The list sorts itself: undecided, Buy, Wait, Skip (A–Z within each).
- 🎨 **Outfit Builder canvas** — a gridded canvas (like the garden planner's). Drop in closet or wishlist items; plain-background photos are automatically cut out "paper doll" style. Drag, resize, and bring forward / send back. Saved outfits live in a collapsible list as true-layout thumbnails, with a running tally.
- 🧮 **Cost-per-wear calculator** — a "what if" slider playground that can also load a real item's price.
- 💱 **Any currency** — prices, original prices and tailoring costs each carry their own currency (code + symbol). Totals use a main currency and exchange rates you type yourself, so the app still works offline.
- 🌱 **Fabric sustainability scoring** — ~110 materials in a grouped dropdown (fibres, constructions, membranes, fills, vegan materials, footwear materials). Each fabric row also gets a Natural / Synthetic / Semi-synthetic tag, and "Other" lets you type anything not listed.
- 📊 **Analytics** — three sections: **Closet Composition** (category bars, colour stacked bar and heat-maps, fibre / source / new-vs-second-hand doughnuts, items added and sold/donated), **Closet Usage** (most / least worn with photos, wear frequency, owned-vs-worn, longevity, utilization rate) and **Financial Breakdown** (total spend and value, average cost per wear, usage and spend by category, monthly/annual spend, second-hand savings).
- 💾 **Auto-save + manual backup** — saved in this browser automatically (in IndexedDB, so photos don't hit the small localStorage limit); export a `.json` backup anytime.
- 📱 **Mobile-friendly** — built desktop-first, stacks into one scrolling column on phones.

---

## 🚀 Getting Started

The app opens with demo items so the dashboard isn't empty — a banner lets you **Clear demo data** when you're ready.

1. Open `index.html` in a modern browser, or visit the deployed GitHub Pages link.
2. **+ Add closet item**: add things you own. Upload a photo (drag to frame it for cards), fill in what you know. Only name and category are required.
3. **+ Add to wishlist** for something you're considering. Set a rough fabric composition to get a sustainability score.
4. Use **Compare** and **Decision list** on the Wishlist Cart panel to weigh it up.
5. Build outfits on the Outfit Builder canvas — drag from your closet list or use **Try on** on a wishlist card (on touch screens, use **Add to outfit** in an item's popup).
6. Bought it? **→ Move to closet** — then log real wears with **I wore this today**.
7. Open **Analytics** for the big picture, and **Export JSON** now and then for a portable backup.

---

## 🧠 How the numbers work

- **Cost per wear** = (purchase price + tailoring/service care) ÷ number of wears. Wishlist items (and unworn closet items) use an estimated wear count by category, which you can edit.
- **Total wears** = *Times worn* (wears before you started using the app) + dated "I wore this today" clicks. Utilization rate only counts dated logs.
- **Sustainability score** = weighted average over the fabrics that can be scored. "Other" and "Unavailable" fabrics are left out, and the score tells you what share of the garment it's based on.
- **Outfit value** counts simple top + bottom (or dress / one piece / matching set) + footwear combinations with and without the item — a rough proxy for versatility.
- **Spend** counts purchase price for owned pieces; **gifts aren't counted as spend**. **Archived** (sold/donated) pieces are hidden by default (toggle *Show archived*) and left out of value and usage stats, but still count in "Items sold / donated" and past spending.
- **Exchange rates** are typed by you (Analytics → Currency settings). Prices in a currency with no rate are left out of totals, with a note.

### Fabric sources
The scores for the original ~38 fibres come from these guides. Every material added after that is flagged as an **estimate** in its note — those scores are judgement calls informed by brand and trade sources, not independent lifecycle numbers.
- [Let's Go Green — Guide to Sustainable Fabrics](https://letsgogreen.com/sustainable-textiles/guide-to-sustainable-fabrics/)
- [GoClimate — Sustainable Textile Materials](https://www.goclimate.com/knowledge/sustainable-textile-materials)
- Additional context: [Quantis Naia fibre comparison](https://www.apparelsearch.com/manufacturer/fibers/naia/naia-fiber-comparison-quantis-2018-09-10.pdf), [Good On You — leather alternatives](https://goodonyou.eco/eco-friendly-leather-alternatives/), [Which? — PFAS in waterproofs](https://www.which.co.uk/news/article/pfaspfcs-where-to-shop-to-avoid-the-forever-chemicals-in-waterproof-clothing-a7dhg6Q0RCeO)

---

## ⚠️ Good to know

- **Cut-outs** work on photos with a plain or light background (typical shop photos). Busy backgrounds can't be cut cleanly, so the full photo is shown instead — use the *Cut-out* toggle on a selected piece.
- **HEIC** photos only load in browsers that can read them (Safari); otherwise convert to JPG/PNG.
- **Auto-fill from a link** is best-effort: most shops block browsers from reading their pages (CORS).
- Saved data lives in *this browser on this device*. Export a backup before clearing browser data or switching devices.

---

## 🧱 Tech Stack

- **Plain HTML, CSS and JavaScript** — no framework, no build step, no dependencies. Works from a double-click and deploys as-is to GitHub Pages.
- **IndexedDB** for saved data and photos; **CSS Grid** for the layout; pointer events for the outfit canvas (no `<canvas>` element needed).

```
cart-and-closet/
├── index.html          # page markup
├── css/style.css       # all styling
├── js/
│   ├── data.js         # categories, sub-categories, colours, currencies
│   ├── fabrics.js      # fabric library
│   ├── util.js         # money, dates, dialogs, safe rich text
│   ├── store.js        # IndexedDB storage, migration, import/export
│   ├── demo.js         # demo data
│   ├── scoring.js      # cost per wear, sustainability, outfit value
│   ├── photos.js       # photo resizing and background cut-out
│   ├── form.js         # add / edit item popup
│   ├── detail.js       # full-info popup
│   ├── closet.js       # closet panel + flip cards
│   ├── wishlist.js     # wishlist, compare, decision checklist
│   ├── outfit.js       # outfit builder canvas
│   ├── analytics.js    # analytics page
│   └── app.js          # start-up and wiring
├── CLAUDE.md           # the advisor persona
└── .github/workflows/deploy.yml
```

---

## 📄 License

MIT — free to use, modify, and share.
