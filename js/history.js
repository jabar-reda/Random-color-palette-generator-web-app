App.history = (() => {
  const MAX_HISTORY = 50;
  let history = [];
  let historyIndex = -1;

  function pushHistory() {
    if (historyIndex < history.length - 1)
      history = history.slice(0, historyIndex + 1);
    history.push(App.captureState());
    if (history.length > MAX_HISTORY) history.shift();
    historyIndex = history.length - 1;
    updateHistoryButtons();
  }

  function undo() {
    if (historyIndex <= 0) return;
    historyIndex--;
    App.applyState(history[historyIndex]);
    updateHistoryButtons();
  }

  function redo() {
    if (historyIndex >= history.length - 1) return;
    historyIndex++;
    App.applyState(history[historyIndex]);
    updateHistoryButtons();
  }

  function updateHistoryButtons() {
    App.ub.disabled = historyIndex <= 0;
    App.rb2.disabled = historyIndex >= history.length - 1;
  }

  return { pushHistory, undo, redo, updateHistoryButtons };
})();
