const rand = (min, max) => min + Math.random() * (max - min);

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  const toHex = v => Math.max(0, Math.min(255, Math.round(v * 255))).toString(16).padStart(2, '0');
  return '#' + toHex(f(0)) + toHex(f(8)) + toHex(f(4));
}

function oklchToLinearRGB(l, c, h) {
  const a = c * Math.cos(h * Math.PI / 180);
  const b = c * Math.sin(h * Math.PI / 180);
  let l1 = l + 0.3963377774 * a + 0.2158037573 * b;
  let m1 = l - 0.1055613458 * a - 0.0638541728 * b;
  let s1 = l - 0.0894841775 * a - 1.2914855480 * b;
  l1 **= 3; m1 **= 3; s1 **= 3;
  return [
    +4.0767416621 * l1 - 3.3077115913 * m1 + 0.2309699292 * s1,
    -1.2684380046 * l1 + 2.6097574011 * m1 - 0.3413193965 * s1,
    -0.0041960863 * l1 - 0.7034186147 * m1 + 1.7076147010 * s1
  ];
}

function isInGamut(r, g, b) {
  return r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1;
}

function oklchToHex(l, c, h) {
  const [r, g, b] = oklchToLinearRGB(l, c, h);
  const toSRGB = v => v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  const toHex = v => Math.min(255, Math.max(0, Math.round(toSRGB(v) * 255))).toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

function hexToOklch(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = v => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  let lLms = Math.cbrt(0.4122214708 * lin(r) + 0.5363325363 * lin(g) + 0.0514459929 * lin(b));
  let mLms = Math.cbrt(0.2119034982 * lin(r) + 0.6806995451 * lin(g) + 0.1073969566 * lin(b));
  let sLms = Math.cbrt(0.0883024619 * lin(r) + 0.2817188376 * lin(g) + 0.6299787005 * lin(b));
  const L = 0.2104542553 * lLms + 0.7936177850 * mLms - 0.0040720468 * sLms;
  const a = 1.9779984951 * lLms - 2.4285922050 * mLms + 0.4505937099 * sLms;
  const bLab = 0.0259040371 * lLms + 0.7827717662 * mLms - 0.8086757660 * sLms;
  return { l: L, c: Math.sqrt(a * a + bLab * bLab), h: (Math.atan2(bLab, a) * 180 / Math.PI + 360) % 360 };
}

function gamutClamp(l, c, h) {
  const [r, g, b] = oklchToLinearRGB(l, c, h);
  if (isInGamut(r, g, b)) return oklchToHex(l, c, h);
  let lo = 0, hi = c;
  for (let i = 0; i < 10; i++) {
    const mid = (lo + hi) / 2;
    const [cr, cg, cb] = oklchToLinearRGB(l, mid, h);
    isInGamut(cr, cg, cb) ? lo = mid : hi = mid;
  }
  return oklchToHex(l, lo, h);
}

function hueAwareL(h, lo, hi) {
  const hp = ((h % 360) + 360) % 360;
  let l = lo + (hi - lo) * Math.random();
  if (hp > 60 && hp < 180) {
    const f = Math.sin((hp - 60) / 120 * Math.PI);
    l = Math.max(l, 0.48 + f * 0.15);
  }
  return l;
}

function generateOklchPalette(count, locked, mode = 'random') {
  const colors = Array.from({ length: count }, (_, i) => locked?.[i] || null);
  const free = colors.reduce((a, c, i) => c ? a : [...a, i], []);
  if (!free.length) return colors;

  const baseHue = rand(0, 360);

  const superCounts = mode === 'super' ? { 'neutral-accent':0, warm:0, cool:0, pastel:0, dual:0 } : null;
  const allSuperModes = superCounts ? Object.keys(superCounts) : null;

  free.forEach((idx, fi) => {
    const t = free.length > 1 ? fi / (free.length - 1) : 0.5;
    let l, c, h;

    switch (mode) {
      case 'analogous':
        h = ((baseHue - 20 + 40 * t) + rand(-4, 4) + 360) % 360;
        l = hueAwareL(h, 0.38, 0.75);
        c = rand(0.10, 0.18);
        break;

      case 'monochromatic':
        h = ((baseHue + rand(-3, 3)) + 360) % 360;
        l = 0.28 + t * 0.50;
        c = 0.06 + (1 - Math.abs(2 * t - 1)) * 0.14;
        l += rand(-0.02, 0.02);
        c += rand(-0.01, 0.01);
        break;

      case 'neutral-accent':
        if (idx === 0) {
          h = ((baseHue + rand(-10, 10)) + 360) % 360;
          l = hueAwareL(h, 0.45, 0.65);
          c = rand(0.15, 0.22);
        } else {
          h = ((baseHue + rand(-15, 15)) + 360) % 360;
          l = 0.28 + t * 0.45 + rand(-0.04, 0.04);
          c = rand(0.03, 0.08);
        }
        break;

      case 'warm':
        h = ((340 + baseHue / 360 * 80 + rand(-20, 20)) + 360) % 360;
        l = hueAwareL(h, 0.30, 0.78);
        c = rand(0.10, 0.20);
        break;

      case 'cool':
        h = ((180 + baseHue / 360 * 120 + rand(-20, 20)) + 360) % 360;
        l = hueAwareL(h, 0.30, 0.78);
        c = rand(0.10, 0.20);
        break;

      case 'pastel':
        h = ((baseHue + rand(-40, 40)) + 360) % 360;
        l = 0.72 + t * 0.15 + rand(-0.03, 0.03);
        c = rand(0.03, 0.08);
        break;

      case 'dual':
        const half = Math.ceil(free.length / 2);
        const isSecond = fi >= half;
        const subIdx = isSecond ? fi - half : fi;
        const subTotal = isSecond ? free.length - half : half;
        const subT = subTotal > 1 ? subIdx / (subTotal - 1) : 0.5;
        h = ((baseHue + (isSecond ? rand(150, 210) : rand(-10, 10))) + rand(-6, 6) + 360) % 360;
        l = hueAwareL(h, 0.25 + subT * 0.50, 0.04);
        c = rand(0.10, 0.18);
        break;

      case 'super':
        {
          let available = allSuperModes.filter(m => superCounts[m] < 3);
          if (!available.length) available = allSuperModes;
          const chosen = available[Math.floor(Math.random() * available.length)];
          superCounts[chosen]++;
          switch (chosen) {
            case 'neutral-accent':
              if (idx === 0) {
                h = ((baseHue + rand(-10, 10)) + 360) % 360;
                l = hueAwareL(h, 0.45, 0.65);
                c = rand(0.15, 0.22);
              } else {
                h = ((baseHue + rand(-15, 15)) + 360) % 360;
                l = 0.28 + t * 0.45 + rand(-0.04, 0.04);
                c = rand(0.03, 0.08);
              }
              break;
            case 'warm':
              h = ((340 + baseHue / 360 * 80 + rand(-20, 20)) + 360) % 360;
              l = hueAwareL(h, 0.30, 0.78);
              c = rand(0.10, 0.20);
              break;
            case 'cool':
              h = ((180 + baseHue / 360 * 120 + rand(-20, 20)) + 360) % 360;
              l = hueAwareL(h, 0.30, 0.78);
              c = rand(0.10, 0.20);
              break;
            case 'pastel':
              h = ((baseHue + rand(-40, 40)) + 360) % 360;
              l = 0.72 + t * 0.15 + rand(-0.03, 0.03);
              c = rand(0.03, 0.08);
              break;
            case 'dual':
              h = ((baseHue + (Math.random() < 0.5 ? rand(-10, 10) : rand(150, 210))) + 360) % 360;
              l = hueAwareL(h, 0.25 + t * 0.50, 0.04);
              c = rand(0.10, 0.18);
              break;
          }
        }
        break;

      default:
        h = ((baseHue + rand(-35, 35)) + 360) % 360;
        l = hueAwareL(h, 0.35, 0.78);
        c = rand(0.10, 0.20);
        break;
    }

    l = Math.max(0.10, Math.min(0.92, l));
    c = Math.max(0.03, Math.min(0.30, c));

    colors[idx] = gamutClamp(l, c, h);
  });

  if (free.length > 1) {
    const sortedFree = [...free].sort((a, b) => hexToOklch(colors[a]).l - hexToOklch(colors[b]).l);
    const sortedColors = sortedFree.map(i => colors[i]);
    free.forEach((pos, idx) => { colors[pos] = sortedColors[idx]; });
  }

  return colors;
}
