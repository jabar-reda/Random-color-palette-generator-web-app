App.export = (() => {
  const EXPORT_FORMATS = {
    css: {
      label: 'CSS Variables',
      action: () => App.copyToClipboard(`:root {\n${App.cols().map((v, i) => `  --c${i + 1}: ${v.dataset.color};`).join('\n')}\n}`, 'CSS variables copied!')
    },
    scss: {
      label: 'SCSS Variables',
      action: () => App.copyToClipboard(App.cols().map((v, i) => `$c${i + 1}: ${v.dataset.color};`).join('\n'), 'SCSS variables copied!')
    },
    json: {
      label: 'JSON',
      action: () => App.copyToClipboard(JSON.stringify({ palette: App.cols().map((v, i) => ({ id: i + 1, hex: v.dataset.color, locked: v.dataset.locked === 'true' })) }, null, 2), 'JSON copied!')
    },
    svg: {
      label: 'SVG Image',
      action: () => {
        const c = App.cols(), s = 120, w = c.length * s, h = 200;
        const rects = c.map((v, i) => {
          const x = i * s;
          return `<rect x="${x}" y="0" width="${s}" height="${h}" fill="${v.dataset.color}"/><text x="${x + s / 2}" y="${h - 18}" text-anchor="middle" fill="#fff" font-family="monospace" font-size="14">${v.dataset.color}</text>`;
        }).join('\n');
        App.downloadFile(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">\n${rects}\n</svg>`, 'palette.svg', 'image/svg+xml');
        App.showToast('SVG downloaded!');
      }
    },
    png: {
      label: 'PNG Image',
      action: () => {
        const c = App.cols(), s = 120, w = c.length * s, h = 200;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        c.forEach((v, i) => {
          ctx.fillStyle = v.dataset.color;
          ctx.fillRect(i * s, 0, s, h);
          ctx.fillStyle = '#fff';
          ctx.font = '14px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(v.dataset.color, i * s + s / 2, h - 16);
        });
        canvas.toBlob(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'palette.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          App.showToast('PNG downloaded!');
        });
      }
    }
  };

  function sharePalette() {
    const c = App.cols();
    const hash = c.map(v => v.dataset.color.replace('#', '')).join('-');
    App.copyToClipboard(location.origin + location.pathname + '#' + hash, 'Share link copied!');
  }

  function loadFromHash() {
    const hash = location.hash.slice(1);
    if (!hash) return false;
    const colors = hash.split('-').map(h => '#' + h.toUpperCase());
    if (colors.length < 2 || colors.length > 10) return false;
    if (!colors.every(c => /^#[0-9A-F]{6}$/.test(c))) return false;

    App.applyState({ colors, locked: colors.map(() => false) });
    App.history.pushHistory();
    return true;
  }

  return { sharePalette, loadFromHash, EXPORT_FORMATS };
})();
