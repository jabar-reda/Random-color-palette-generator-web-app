# 🎨 Random Color Palette Generator

> A minimalist, perceptually-uniform color palette generator powered by the **Oklch** color space.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

the link [![link](https://redajabar-404.github.io/Random-color-palette-generator-web-app/](LINK)

---

## ✨ Features

- **Oklch-powered generation** – produces harmonious, naturally-balanced palettes with perceptual uniformity
- **Lock / unlock** – preserve colors you like while re-generating the rest
- **Save & load** – persist palettes in `localStorage` with a clean modal dialog
- **CSS export** – copy `:root { --c1: #...; ... }` variables to clipboard in one click
- **Click to copy** – tap any column to copy its hex code
- **Keyboard shortcut** – press `Spacebar` to generate a new palette
- **Responsive** – adapts gracefully to mobile screens
- **Zero dependencies** – no frameworks, no build tools, no npm

---

## 🚀 Getting Started

1. **Clone** or download the repository
2. Open **`index.html`** in any modern browser
3. Press **Generate** (or `Spacebar`) to create a palette

```bash
git clone https://github.com/YOUR_USERNAME/Random-color-palette-generator-web-app.git
cd Random-color-palette-generator-web-app
# Just open index.html
```

---

## 🧱 Project Structure

```
├── index.html          # Main HTML – minimal, clean DOM
├── style.css           # All styling – dark theme, glassmorphism, responsiveness
├── color-engine.js     # Oklch engine – conversion math + palette generation
└── script.js           # UI controller – columns, save/load, export, events
```

### Separation of concerns

| Layer | File | Responsibility |
|---|---|---|
| **Engine** | `color-engine.js` | `oklchToHex()`, `rand()`, `generateOklchPalette()` |
| **UI** | `script.js` | DOM manipulation, localStorage, clipboard, modal |
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
| 🔒 Lock a color | Click the lock icon below a column |
| 📋 Copy hex code | Click the column itself |
| 💾 Save palette | Click the floppy-disk icon → enter a name |
| 📂 Load palette | Click the folder icon → pick from the dropdown |
| 🗑️ Delete saved | Hover a saved item → click ✕ |
| 📤 Export CSS | Click the icon in the bottom-right |
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

## 📄 License

[MIT](LICENSE) — free to use, modify, and distribute.
