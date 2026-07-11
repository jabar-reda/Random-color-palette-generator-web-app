App.saved = (() => {
  const SK = 'palette-saves';

  function getSavedPalettes() {
    try { return JSON.parse(localStorage.getItem(SK)) || []; }
    catch { return []; }
  }

  function savePalettes(palettes) {
    try { localStorage.setItem(SK, JSON.stringify(palettes)); return true; }
    catch (e) { console.warn('Save failed:', e); return false; }
  }

  function showSaveModal() {
    App.mni.value = '';
    App.sm.classList.add('visible');
    setTimeout(() => App.mni.focus(), 100);
  }

  function hideSaveModal() { App.sm.classList.remove('visible'); }

  function confirmSave() {
    const name = App.mni.value.trim();
    if (!name) {
      App.mni.focus();
      App.mni.style.borderColor = '#662222';
      setTimeout(() => App.mni.style.borderColor = '', 600);
      return;
    }
    const c = App.cols();
    const all = getSavedPalettes();
    all.push({ name, colors: c.map(v => v.dataset.color), locked: c.map(v => v.dataset.locked === 'true') });
    (savePalettes(all) ? (renderSavedDropdown(), App.showToast('Palette saved!')) : App.showToast('Save failed'));
    hideSaveModal();
  }

  function loadPalette(data) {
    App.applyState({ colors: data.colors, locked: data.colors.map((_, i) => data.locked && data.locked[i]) });
    App.history.pushHistory();
  }

  function deleteSavedPalette(index) {
    const palettes = getSavedPalettes();
    palettes.splice(index, 1);
    savePalettes(palettes);
    renderSavedDropdown();
  }

  function renderSavedDropdown() {
    const palettes = getSavedPalettes();
    if (!palettes.length) {
      App.sd.innerHTML = '<div class="saved-empty">No saved palettes</div>';
      return;
    }
    App.sd.innerHTML = palettes.map((p, i) =>
      `<div class="saved-item" data-index="${i}"><span>${App.escHtml(p.name)}</span><button class="delete-saved" title="Delete">&times;</button></div>`
    ).join('');

    App.sd.querySelectorAll('.saved-item').forEach(item => {
      const index = parseInt(item.dataset.index);
      item.addEventListener('click', e => {
        if (e.target.closest('.delete-saved')) return;
        loadPalette(palettes[index]);
        App.sd.classList.remove('visible');
      });
      item.querySelector('.delete-saved').addEventListener('click', e => {
        e.stopPropagation();
        deleteSavedPalette(index);
      });
    });
  }

  return { getSavedPalettes, savePalettes, showSaveModal, hideSaveModal, confirmSave, loadPalette, deleteSavedPalette, renderSavedDropdown };
})();
