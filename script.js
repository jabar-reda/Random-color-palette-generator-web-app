/**
 * Palette Generator — UI Controller
 *
 * Manages the DOM: column creation, palette generation, lock toggling,
 * clipboard copy, localStorage save/load, CSS export, and the save modal.
 */

// ----- DOM References -----

const palette = document.getElementById('palette');
const generateBtn = document.getElementById('generateBtn');
const addBtn = document.getElementById('addBtn');
const removeBtn = document.getElementById('removeBtn');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
const exportCssBtn = document.getElementById('exportCssBtn');
const savedDropdown = document.getElementById('savedDropdown');
const saveModal = document.getElementById('saveModal');
const modalNameInput = document.getElementById('modalNameInput');
const modalSave = document.getElementById('modalSave');
const modalCancel = document.getElementById('modalCancel');

const STORAGE_KEY = 'palette-saves';


// ----- Palette Refresh -----

/**
 * Re-generate colors for all columns, preserving locked ones.
 * Called after Generate, add, and remove.
 */
function updatePalette() {
    const columns = [...palette.children];
    const locked = columns.map(c => c.dataset.locked === 'true' ? c.dataset.color : null);
    const colors = generateOklchPalette(columns.length, locked);

    columns.forEach((col, i) => {
        col.dataset.color = colors[i];
        col.style.setProperty('--bg', colors[i]);
        col.querySelector('.hex-code').textContent = colors[i];
    });
}


// ----- Lock Toggle -----

/**
 * Toggle a column's locked state.
 * Locked columns keep their colour across re-generations.
 */
function toggleLock(col) {
    const isLocked = col.dataset.locked === 'true';
    col.dataset.locked = isLocked ? 'false' : 'true';
    col.classList.toggle('locked', !isLocked);
    col.querySelector('.lock-btn').innerHTML = isLocked ? '🔓' : '🔒';
}


// ----- Column Factory -----

/**
 * Attach click listeners to a column:
 *   - lock button toggles lock
 *   - clicking the column copies its hex colour
 */
function initColumnListeners(col) {
    col.querySelector('.lock-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLock(col);
    });

    col.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(col.dataset.color);
            col.classList.add('copied');
            setTimeout(() => col.classList.remove('copied'), 1200);
        } catch (err) {
            console.warn('Copy failed:', err);
        }
    });
}

/**
 * Create a colour column DOM element.
 * The actual colour is set later by updatePalette().
 */
function createColumn() {
    const col = document.createElement('div');
    col.className = 'color-column';
    col.dataset.locked = 'false';
    col.innerHTML = '<button class="lock-btn">&#128275;</button><div class="color-info"><span class="hex-code">#000000</span></div>';
    return col;
}

// Create 5 initial columns
for (let i = 0; i < 5; i++) {
    const col = createColumn();
    palette.appendChild(col);
    initColumnListeners(col);
}


// ----- LocalStorage Save / Load -----

/**
 * Read all saved palettes from localStorage.
 * Returns an empty array on missing data or parse failure.
 */
function getSavedPalettes() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

/**
 * Persist the array of saved palettes to localStorage.
 */
function savePalettes(palettes) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes));
        return true;
    } catch (e) {
        console.warn('Save failed:', e);
        return false;
    }
}

/**
 * Show the save modal with a clean input field.
 */
function showSaveModal() {
    modalNameInput.value = '';
    saveModal.classList.add('visible');
    setTimeout(() => modalNameInput.focus(), 100);
}

/**
 * Hide the save modal.
 */
function hideSaveModal() {
    saveModal.classList.remove('visible');
}

/**
 * Read the modal input, persist the current palette,
 * then close the modal and show a toast.
 */
function confirmSave() {
    const name = modalNameInput.value.trim();
    if (!name) {
        modalNameInput.focus();
        modalNameInput.style.borderColor = '#662222';
        setTimeout(() => modalNameInput.style.borderColor = '', 600);
        return;
    }

    const columns = [...palette.children];
    const colors = columns.map(c => c.dataset.color);
    const locked = columns.map(c => c.dataset.locked === 'true');

    const allPalettes = getSavedPalettes();
    allPalettes.push({ name, colors, locked });
    if (savePalettes(allPalettes)) {
        renderSavedDropdown();
        showToast('Palette saved!');
    } else {
        showToast('Save failed');
    }
    hideSaveModal();
}

/**
 * Entry point for the save button — opens the modal.
 */
function saveCurrentPalette() {
    showSaveModal();
}

/**
 * Load a saved palette into the UI.
 * Adds or removes columns as needed to match the saved count.
 */
function loadPalette(data) {
    // Add columns if the saved palette has more
    while (palette.children.length < data.colors.length) {
        const col = createColumn();
        palette.appendChild(col);
        initColumnListeners(col);
    }
    // Remove columns if the saved palette has fewer
    while (palette.children.length > data.colors.length) {
        palette.removeChild(palette.lastElementChild);
    }

    // Apply colours and lock states
    const cols = [...palette.children];
    cols.forEach((col, i) => {
        col.dataset.color = data.colors[i];
        col.style.setProperty('--bg', data.colors[i]);
        col.querySelector('.hex-code').textContent = data.colors[i];
        const isLocked = data.locked && data.locked[i];
        col.dataset.locked = isLocked ? 'true' : 'false';
        col.classList.toggle('locked', isLocked);
        col.querySelector('.lock-btn').innerHTML = isLocked ? '🔒' : '🔓';
    });
}

/**
 * Remove a saved palette by array index and re-render the dropdown.
 */
function deleteSavedPalette(index) {
    const palettes = getSavedPalettes();
    palettes.splice(index, 1);
    savePalettes(palettes);
    renderSavedDropdown();
}

/**
 * Build the dropdown list from saved palettes.
 * Each item has a Load action and a Delete (✕) button.
 */
function renderSavedDropdown() {
    const palettes = getSavedPalettes();

    if (palettes.length === 0) {
        savedDropdown.innerHTML = '<div class="saved-empty">No saved palettes</div>';
        return;
    }

    savedDropdown.innerHTML = palettes.map((p, i) => `
        <div class="saved-item" data-index="${i}">
            <span>${escHtml(p.name)}</span>
            <button class="delete-saved" title="Delete">✕</button>
        </div>
    `).join('');

    // Attach click handlers to each row
    savedDropdown.querySelectorAll('.saved-item').forEach((item) => {
        const index = parseInt(item.dataset.index);
        item.addEventListener('click', (e) => {
            if (e.target.closest('.delete-saved')) return;
            loadPalette(palettes[index]);
            savedDropdown.classList.remove('visible');
        });
        item.querySelector('.delete-saved').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSavedPalette(index);
        });
    });
}

/**
 * Escape HTML entities in user-provided text.
 */
function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}


// ----- Export CSS -----

/**
 * Build CSS custom-property declarations from the current palette
 * and copy them to the clipboard.
 * Format:
 *   :root {
 *     --c1: #FF8800;
 *     --c2: #...
 *   }
 */
function exportCss() {
    const columns = [...palette.children];
    const vars = columns.map((col, i) => `  --c${i + 1}: ${col.dataset.color};`).join('\n');
    const css = `:root {\n${vars}\n}`;

    navigator.clipboard.writeText(css).then(() => {
        showToast('CSS variables copied!');
    }).catch(() => {
        // Fallback for insecure contexts (HTTP) where Clipboard API is unavailable
        const ta = document.createElement('textarea');
        ta.value = css;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        showToast('CSS variables copied!');
    });
}


// ----- Toast Notification -----

/**
 * Show a brief toast message at the bottom center of the screen.
 * Reuses a single DOM element to avoid duplicates.
 */
function showToast(msg) {
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
}


// ----- Event Listeners -----

// Generate button — re-roll all unlocked colours
generateBtn.addEventListener('click', updatePalette);

// Add a new column (max 10)
addBtn.addEventListener('click', () => {
    if (palette.children.length >= 10) return;
    const col = createColumn();
    palette.appendChild(col);
    initColumnListeners(col);
    updatePalette();
});

// Remove the last column (min 2)
removeBtn.addEventListener('click', () => {
    if (palette.children.length <= 2) return;
    palette.removeChild(palette.lastElementChild);
    updatePalette();
});

// Save — opens the save modal
saveBtn.addEventListener('click', saveCurrentPalette);

// Modal controls
modalCancel.addEventListener('click', hideSaveModal);
modalSave.addEventListener('click', confirmSave);
modalNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmSave();
    if (e.key === 'Escape') hideSaveModal();
});
// Clicking the backdrop dismisses the modal
saveModal.addEventListener('click', (e) => {
    if (e.target === saveModal) hideSaveModal();
});

// Load — toggle the saved-palettes dropdown
loadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    renderSavedDropdown();
    savedDropdown.classList.toggle('visible');
});

// Close the dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.load-wrapper')) {
        savedDropdown.classList.remove('visible');
    }
});

// Export CSS button
exportCssBtn.addEventListener('click', exportCss);

// Keyboard shortcut: Spacebar generates a new palette
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        updatePalette();
    }
});

// Generate an initial palette on page load
updatePalette();
