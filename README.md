# 🎨 Chroma — Color Palette Generator

> A minimalist, perceptually uniform color palette generator powered by the **Oklch** color space.

> **⚠️ Beta branch** — experimental redesign with card layout, live preview, and refined UI.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📑 Table of Contents

- [✨ Features](#features)
- [🚀 Getting Started](#getting-started)
- [🧱 Project Structure](#project-structure)
- [🧠 Why Oklch?](#why-oklch)
- [🕹️ Usage](#usage)
- [🛠️ Browser Support](#browser-support)
- [🤝 Contributing](#contributing)
- [📄 License](#license)
- [🙏 Acknowledgments](#acknowledgments)

---

## ✨ Features

- **Oklch-powered generation** – produces harmonious, naturally balanced palettes with perceptual uniformity
- **9 harmony modes** – Random, Analogous, Monochromatic, Neutral+Accent, Warm, Cool, Pastel, Dual, Super
- **Lock / unlock** – preserve colors you like while re-generating the rest
- **Undo / Redo** – 50-state history (Ctrl+Z / Ctrl+Shift+Z)
- **Drag & drop** – reorder columns by dragging
- **Detail panel** – view HEX, RGB, HSL, OKLCH, and WCAG contrast ratio
- **Save & load** – persist palettes in `localStorage`
- **Export** – CSS, SCSS, JSON, SVG, PNG
- **Share via URL** – palette encoded in hash
- **Dark / Light theme** – adapts to system preference automatically
- **Click to copy** – tap any column to copy its hex code
- **Keyboard shortcut** – press `Spacebar` to generate a new palette
- **Responsive** – adapts gracefully to mobile screens
- **Zero dependencies** – no frameworks, no build tools, no npm

---

## 🚀 Getting Started

### Prerequisites

- A modern browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone** the repository and checkout the `beta` branch
2. Open **`index.html`** in any modern browser

```bash
git clone https://github.com/YOUR_USERNAME/Random-color-palette-generator-web-app.git
cd Random-color-palette-generator-web-app
git checkout beta
# Just open index.html
```

### Using a local server (recommended for full features)

Some features (clipboard API) work best when served over HTTP. Start a local server with:

```bash
# Python 3
python -m http.server 8000
```

Then open **http://localhost:8000** in your browser.

---

## 🧱 Project Structure

```
├── index.html              # Main HTML – clean DOM
├── style.css               # All styling – CSS variables, dark/light, glassmorphism
├── color-engine.js         # Oklch engine – conversion math + 9 harmony modes
├── js/
│   ├── ui.js               # App namespace, DOM refs, utilities
│   ├── app.js              # Event wiring, updatePalette, keyboard shortcuts
│   ├── history.js          # Undo/redo (50 states)
│   ├── detail-panel.js     # Color detail panel (HEX/RGB/HSL/OKLCH/contrast)
│   ├── saved-palettes.js   # localStorage persistence
│   ├── export.js           # CSS/SCSS/JSON/SVG/PNG export + URL sharing
│   └── drag-drop.js        # HTML5 Drag & Drop column reordering
├── assets/
│   └── screenshot.png      # App preview image (this README)
└── README.md               # This file
```

### Separation of concerns

| Layer | File | Responsibility |
|---|---|---|
| **Engine** | `color-engine.js` | `oklchToHex()`, `generateOklchPalette(count, locked, mode)` |
| **UI** | `js/*.js` | DOM manipulation, localStorage, clipboard, modal, drag-drop, detail panel |
| **Style** | `style.css` | Layout, themes, animations, responsive breakpoints |

---

## 🧠 Why Oklch?

Most palette generators use **HSL** (Hue / Saturation / Lightness), but HSL is **not perceptually uniform** – the same saturation value looks different across hues.

**Oklch**, designed by [Björn Ottosson](https://bottosson.github.io/posts/oklab/), is a color space that matches human perception. A change in lightness or chroma looks the same regardless of hue, giving you **more natural, cohesive palettes**.

---

## 🕹️ Usage

| Action | How |
|---|---|
| 🎲 Generate palette | Click **Generate** or press `Spacebar` |
| 🎨 Harmony mode | Click the palette icon → pick a mode |
| 🔒 Lock a color | Click the lock icon below a column |
| 📋 Copy hex code | Click the column itself |
| 🖼️ Detail panel | Click a column to see HEX/RGB/HSL/OKLCH/contrast |
| ↩️ Undo / Redo | Ctrl+Z / Ctrl+Shift+Z or buttons |
| 🔀 Reorder columns | Drag a column left or right |
| 💾 Save palette | Click the save icon → enter a name |
| 📂 Load palette | Click the folder icon → pick from the dropdown |
| 🗑️ Delete saved | Hover a saved item → click ✕ |
| 📤 Export | Click the grid icon → pick CSS/SCSS/JSON/SVG/PNG |
| 🔗 Share | Click the share icon → URL copied |
| 🌗 Theme | Follows system (OS) dark/light preference |
| ➕ Add column | Click **+** (max 10) |
| ➖ Remove column | Click **–** (min 2) |

---

## 🛠️ Browser Support

Chrome • Firefox • Safari • Edge — any modern browser with:

- `localStorage`
- `navigator.clipboard` (with `execCommand` fallback)
- `backdrop-filter`
- CSS Custom Properties

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve this project:

1. **Fork** the repository
2. Create a **feature branch** (`git checkout -b feature/amazing-idea`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-idea`)
5. Open a **Pull Request**

Please make sure your code follows the existing style and structure. No build tools or package managers are used — just vanilla HTML, CSS, and JavaScript.

---

## 📄 License

[MIT](LICENSE) — free to use, modify, and distribute.

---

## 🙏 Acknowledgments

- [Björn Ottosson](https://bottosson.github.io/posts/oklab/) for creating the Oklch color space that powers this generator
- Inspired by [Coolors](https://coolors.co/) palette generation concept
- Built with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies
