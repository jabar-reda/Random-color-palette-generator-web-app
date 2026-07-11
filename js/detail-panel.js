App.detail = (() => {
  let detailHex = null;

  function hexToRGB(hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16)
    };
  }

  function rgbToHSL(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
        case g: h = ((b - r) / d + 2) * 60; break;
        case b: h = ((r - g) / d + 4) * 60; break;
      }
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function relativeLuminance(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const lin = v => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  }

  function getContrastInfo(hex) {
    const lum = relativeLuminance(hex);
    const cw = (1 + 0.05) / (lum + 0.05);
    const cb = (lum + 0.05) / 0.05;
    const best = cw >= cb ? { color: '#FFF', ratio: cw } : { color: '#000', ratio: cb };
    const level = best.ratio >= 7 ? 'AAA' : best.ratio >= 4.5 ? 'AA' : 'Fail';
    return `${best.ratio.toFixed(1)}:1 on ${best.color} (${level})`;
  }

  function showDetailPanel(hex) {
    detailHex = hex;
    App.ds.style.background = hex;
    const rgb = hexToRGB(hex);
    const oklch = hexToOklch(hex);
    const hsl = rgbToHSL(rgb.r, rgb.g, rgb.b);
    const contrast = getContrastInfo(hex);
    App.dv.innerHTML =
      `<div class="detail-row"><span class="detail-label">HEX</span><code class="detail-val">${hex}</code></div>` +
      `<div class="detail-row"><span class="detail-label">RGB</span><span class="detail-val">${rgb.r}, ${rgb.g}, ${rgb.b}</span></div>` +
      `<div class="detail-row"><span class="detail-label">HSL</span><span class="detail-val">${hsl.h}&deg; ${hsl.s}% ${hsl.l}%</span></div>` +
      `<div class="detail-row"><span class="detail-label">OKLCH</span><span class="detail-val">${oklch.l.toFixed(3)} ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)}&deg;</span></div>` +
      `<div class="detail-row"><span class="detail-label">Contrast</span><span class="detail-val">${contrast}</span></div>`;
    App.dp.classList.add('visible');
  }

  function hideDetailPanel() {
    App.dp.classList.remove('visible');
    detailHex = null;
  }

  return { showDetailPanel, hideDetailPanel, hexToRGB, rgbToHSL, getContrastInfo, relativeLuminance, get detailHex() { return detailHex; } };
})();
