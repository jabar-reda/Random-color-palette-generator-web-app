let currentHarmonyMode = 'random';

function updatePalette() {
  const c = App.cols();
  const locked = c.map(v => v.dataset.locked === 'true' ? v.dataset.color : null);
  const colors = generateOklchPalette(c.length, locked, currentHarmonyMode);

  c.forEach((col, i) => {
    col.dataset.color = colors[i];
    col.style.setProperty('--bg', colors[i]);
    const hexEl = col.querySelector('.hex-code');
    hexEl.textContent = colors[i];
    hexEl.style.color = getTextColorForBg(colors[i]);
  });
  updateAmbientBackground(colors);
  App.history.pushHistory();
}

App.toggleLock = function (col) {
  const locked = col.dataset.locked === 'true';
  col.dataset.locked = locked ? 'false' : 'true';
  col.classList.toggle('locked', !locked);
  col.querySelector('.lock-btn').innerHTML = locked ? App.icons.unlock : App.icons.lock;
};

function setHarmonyMode(mode) {
  currentHarmonyMode = mode;
  App.hb.textContent = mode === 'random' ? '\uD83C\uDFA8' : '\u25C6';
  App.hb.title = 'Mode: ' + mode;
  App.hd.querySelectorAll('.harmony-item').forEach(item => {
    item.classList.toggle('active', item.dataset.mode === mode);
  });
  App.hd.classList.remove('visible');
  updatePalette();
}

function updateTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('palette-theme', theme); } catch {}
  App.tb.innerHTML = theme === 'dark' ? App.icons.theme : App.icons.moon;
  App.tb.title = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
}

function getTheme() {
  try { return localStorage.getItem('palette-theme') || 'dark'; } catch { return 'dark'; }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  updateTheme(current === 'light' ? 'dark' : 'light');
  App.cols().forEach(col => {
    col.querySelector('.hex-code').style.color = getTextColorForBg(col.dataset.color);
  });
}

App.gb.addEventListener('click', updatePalette);

App.ab.addEventListener('click', () => {
  if (App.p.children.length > 9) {
    App.showToast('Maximum 10 colors');
    return;
  }
  App.initColumnListeners(App.p.appendChild(App.createColumn()));

  const c = App.cols();
  const locked = c.map((v, i) => i < c.length - 1 ? (v.dataset.color || null) : null);
  const colors = generateOklchPalette(c.length, locked, currentHarmonyMode);
  const newCol = c[c.length - 1];
  const newColor = colors[c.length - 1];
  newCol.dataset.color = newColor;
  newCol.style.setProperty('--bg', newColor);
  newCol.querySelector('.hex-code').textContent = newColor;
  newCol.querySelector('.hex-code').style.color = getTextColorForBg(newColor);

  updateAmbientBackground(c.map(v => v.dataset.color));
  App.history.pushHistory();
});

App.rb.addEventListener('click', () => {
  if (App.p.children.length < 3) {
    App.showToast('Minimum 2 colors');
    return;
  }
  App.p.removeChild(App.p.lastElementChild);
  const colors = App.cols().map(v => v.dataset.color);
  updateAmbientBackground(colors);
  App.history.pushHistory();
});

App.sb.addEventListener('click', App.saved.showSaveModal);
App.mc.addEventListener('click', App.saved.hideSaveModal);
App.ms.addEventListener('click', App.saved.confirmSave);
App.mni.addEventListener('keydown', e => {
  if (e.key === 'Enter') App.saved.confirmSave();
  if (e.key === 'Escape') App.saved.hideSaveModal();
});
App.sm.addEventListener('click', e => { if (e.target === App.sm) App.saved.hideSaveModal(); });

App.lb.addEventListener('click', e => {
  e.stopPropagation();
  App.saved.renderSavedDropdown();
  App.sd.classList.toggle('visible');
});

document.addEventListener('click', e => {
  if (!e.target.closest('.load-wrapper')) App.sd.classList.remove('visible');
  if (!e.target.closest('.export-wrapper')) App.ed.classList.remove('visible');
  if (!e.target.closest('.harmony-wrapper')) App.hd.classList.remove('visible');
  if (!e.target.closest('.detail-panel') && !e.target.closest('.color-column')) App.detail.hideDetailPanel();
});

App.eb.addEventListener('click', e => {
  e.stopPropagation();
  App.ed.classList.toggle('visible');
});

App.ed.addEventListener('click', e => {
  const item = e.target.closest('.export-item');
  if (!item) return;
  App.export.EXPORT_FORMATS[item.dataset.format].action();
  App.ed.classList.remove('visible');
});

App.hb.addEventListener('click', e => {
  e.stopPropagation();
  App.hd.classList.toggle('visible');
});

App.hd.addEventListener('click', e => {
  const item = e.target.closest('.harmony-item');
  if (!item) return;
  setHarmonyMode(item.dataset.mode);
});

App.ub.addEventListener('click', App.history.undo);
App.rb2.addEventListener('click', App.history.redo);

App.shareBtn.addEventListener('click', App.export.sharePalette);

App.dc.addEventListener('click', App.detail.hideDetailPanel);
App.dcb.addEventListener('click', () => {
  if (App.detail.detailHex) App.copyToClipboard(App.detail.detailHex, 'Hex copied!');
});

App.tb.addEventListener('click', toggleTheme);

document.addEventListener('keydown', e => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    updatePalette();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    App.history.undo();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
    e.preventDefault();
    App.history.redo();
  }
  if (e.key === 'Escape') App.detail.hideDetailPanel();
});

App.history.updateHistoryButtons();

App.hb.textContent = '\uD83C\uDFA8';
App.hb.title = 'Mode: random';
App.hd.querySelectorAll('.harmony-item').forEach(item => {
  item.classList.toggle('active', item.dataset.mode === 'random');
});

updateTheme(getTheme());

for (let i = 5; i--;) App.initColumnListeners(App.p.appendChild(App.createColumn()));

if (!App.export.loadFromHash()) {
  updatePalette();
}
