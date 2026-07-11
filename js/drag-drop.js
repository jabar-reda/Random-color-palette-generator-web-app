App.initColumnListeners = (() => {
  let dragSrc = null;
  let dragOverCol = null;
  let dragAfter = false;

  function onDragStart(e) {
    dragSrc = this;
    dragOverCol = null;
    dragAfter = false;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragOver(e) {
    e.preventDefault();
    const col = e.target.closest('.color-column');
    if (!col || col === dragSrc) return;
    const rect = col.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;

    if (col !== dragOverCol || after !== dragAfter) {
      dragOverCol = col;
      dragAfter = after;
      if (after) {
        col.parentNode.insertBefore(dragSrc, col.nextSibling);
      } else {
        col.parentNode.insertBefore(dragSrc, col);
      }
    }
  }

  function onDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.color-column').forEach(c => c.classList.remove('drag-over'));
    updateAmbientBackground(App.cols().map(v => v.dataset.color));
    App.history.pushHistory();
  }

  function initColumnListeners(col) {
    col.querySelector('.lock-btn').addEventListener('click', e => {
      e.stopPropagation();
      App.toggleLock(col);
      App.history.pushHistory();
    });

    col.addEventListener('click', e => {
      if (e.target.closest('.lock-btn')) return;
      App.detail.showDetailPanel(col.dataset.color);
    });

    col.draggable = true;
    col.addEventListener('dragstart', onDragStart);
    col.addEventListener('dragover', onDragOver);
    col.addEventListener('dragend', onDragEnd);
    col.addEventListener('dragenter', e => {
      const col = e.target.closest('.color-column');
      if (col) col.classList.add('drag-over');
    });
    col.addEventListener('dragleave', e => {
      const col = e.target.closest('.color-column');
      if (col && !col.contains(e.relatedTarget)) col.classList.remove('drag-over');
    });
  }

  return initColumnListeners;
})();
