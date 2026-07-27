const App = window.App = {};

App.icons = {
  lock: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  unlock: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>',
  save: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
  load: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  share: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
  export: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
  undo: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
  redo: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>',

};

(function () {
  const $ = id => document.getElementById(id);

  App.p = $('palette');
  App.gb = $('generateBtn');
  App.ab = $('addBtn');
  App.rb = $('removeBtn');
  App.sb = $('saveBtn');
  App.lb = $('loadBtn');
  App.eb = $('exportBtn');
  App.ed = $('exportDropdown');
  App.ub = $('undoBtn');
  App.rb2 = $('redoBtn');
  App.shareBtn = $('shareBtn');
  App.hb = $('harmonyBtn');
  App.hd = $('harmonyDropdown');
  App.sd = $('savedDropdown');
  App.dp = $('detailPanel');
  App.ds = $('detailSwatch');
  App.dv = $('detailValues');
  App.dc = $('detailClose');
  App.dcb = $('detailCopyBtn');
  App.sm = $('saveModal');
  App.mni = $('modalNameInput');
  App.ms = $('modalSave');
  App.mc = $('modalCancel');
  App.cb = $('controlsBar');
  App.sl = $('siteLogo');

  App.cols = () => [...App.p.children];

  App.createColumn = function () {
    const col = document.createElement('div');
    col.className = 'color-column';
    col.dataset.locked = 'false';
    col.innerHTML = '<div class="color-info"><span class="hex-code" style="color:#fff">#000000</span><button class="lock-btn">' + App.icons.unlock + '</button></div>';
    return col;
  };

  App.escHtml = function (str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  };

  App.showToast = function (msg) {
    let toast = document.querySelector('.export-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'export-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toast._hide);
    toast._hide = setTimeout(() => toast.classList.remove('visible'), 2000);
  };

  App.copyToClipboard = function (text, msg) {
    navigator.clipboard.writeText(text).then(() => App.showToast(msg)).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      App.showToast(msg);
    });
  };

  App.downloadFile = function (content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  App.captureState = function () {
    const c = App.cols();
    return { colors: c.map(v => v.dataset.color), locked: c.map(v => v.dataset.locked === 'true') };
  };

  App.applyState = function (state) {
    const cols = state.colors;
    while (App.p.children.length < cols.length)
      App.initColumnListeners(App.p.appendChild(App.createColumn()));
    while (App.p.children.length > cols.length)
      App.p.removeChild(App.p.lastElementChild);

    App.cols().forEach((col, i) => {
      col.dataset.color = cols[i];
      col.style.setProperty('--bg', cols[i]);
      const hexEl = col.querySelector('.hex-code');
      hexEl.textContent = cols[i];
      hexEl.style.color = getTextColorForBg(cols[i]);
      const locked = state.locked && state.locked[i];
      col.dataset.locked = locked ? 'true' : 'false';
      col.classList.toggle('locked', locked);
      col.querySelector('.lock-btn').innerHTML = locked ? App.icons.lock : App.icons.unlock;
    });
    updateAmbientBackground(cols);
    updateLivePreview(cols);
  };
})();

function getTextColorForBg(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (lum > 0.5) {
    const f = 0.18;
    return '#' + [r, g, b].map(c => Math.round(c * f).toString(16).padStart(2, '0')).join('');
  } else {
    const f = 0.88;
    return '#' + [r, g, b].map(c => Math.round(c + (255 - c) * f).toString(16).padStart(2, '0')).join('');
  }
}

function updateAmbientBackground(colors) {
  const n = Math.min(colors.length, 4);
  const stops = colors.slice(0, n).map((c, i) => `${c} ${n > 1 ? i / (n - 1) * 100 : 50}%`);
  App.cb.style.setProperty('--ambient-gradient', 'linear-gradient(to right, ' + stops.join(', ') + ')');
}
