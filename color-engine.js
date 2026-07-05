/**
 * Oklch Color Engine
 *
 * Converts Oklch (lightness, chroma, hue) to sRGB hex values and
 * generates harmonious color palettes using the Oklch color space.
 *
 * Reference: https://bottosson.github.io/posts/oklab/
 */

/**
 * Convert Oklch to a hex color string.
 *
 * Oklch is a cylindrical representation of Oklab — a perceptually uniform
 * color space designed by Björn Ottosson.
 *
 * @param {number} l - Lightness (0..1)
 * @param {number} c - Chroma (saturation, usually 0..0.4)
 * @param {number} h - Hue in degrees (0..360)
 * @returns {string} Hex color e.g. "#FF8800"
 */
function oklchToHex(l, c, h) {
    // Convert hue from degrees to radians and derive a/b components
    const hRad = h * Math.PI / 180;
    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);

    // Convert from Oklab to linear sRGB via the LMS intermediate space
    let l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    let m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    let s_ = l - 0.0894841775 * a - 1.2914855480 * b;

    // Cube the LMS values to linearize
    l_ = l_ ** 3; m_ = m_ ** 3; s_ = s_ ** 3;

    // Linear sRGB transform matrix
    let r = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
    let g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
    let b_ = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;

    // Clamp to [0, 255] and format as hex
    const clamp = v => Math.min(255, Math.max(0, Math.round(v * 255)));
    const toHex = v => clamp(v).toString(16).padStart(2, '0');

    return '#' + toHex(r) + toHex(g) + toHex(b_);
}

/**
 * Return a random float in [min, max).
 */
function rand(min, max) {
    return min + Math.random() * (max - min);
}

/**
 * Generate a harmonious color palette using Oklch.
 *
 * Five "roles" define lightness/chroma/hue-shift ranges. Each column
 * picks a role (shuffled for variety) and computes a color relative to
 * a shared base hue. Locked columns retain their existing color.
 *
 * @param {number} count - Number of palette columns (2..10)
 * @param {string[]} locked - Array of hex strings or nullish for free slots
 * @returns {string[]} Array of hex color strings
 */
function generateOklchPalette(count, locked) {
    const lockedArr = locked || [];

    // Pick a random base hue — all colors are offset from this
    const baseHue = rand(0, 360);

    // Each role defines lightness, chroma, and hue-shift ranges.
    // Together they produce a cohesive yet varied palette.
    const roles = [
        { l: [0.20, 0.28], c: [0.04, 0.08], hueShift: [0, 0] },      // Dark neutral
        { l: [0.50, 0.60], c: [0.12, 0.18], hueShift: [0, 0] },      // Mid neutral
        { l: [0.75, 0.85], c: [0.06, 0.12], hueShift: [0, 0] },      // Light neutral
        { l: [0.50, 0.60], c: [0.18, 0.25], hueShift: [130, 170] },  // Accent cool
        { l: [0.38, 0.48], c: [0.02, 0.05], hueShift: [30, 60] },    // Warm dark
    ];

    // Fisher-Yates shuffle for varied role assignment
    const shuffled = [...roles];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const result = [];
    for (let i = 0; i < count; i++) {
        // Preserve locked colors
        if (lockedArr[i]) { result.push(lockedArr[i]); continue; }

        // Cycle through shuffled roles, compute Oklch and convert to hex
        const role = shuffled[i % 5];
        const h = (baseHue + rand(role.hueShift[0], role.hueShift[1])) % 360;
        const l = rand(role.l[0], role.l[1]);
        const c = rand(role.c[0], role.c[1]);
        result.push(oklchToHex(l, c, h).toUpperCase());
    }

    return result;
}
