// Decoder for the ThumbHash format (evanw/thumbhash), moved unchanged from the
// step 6 grid client. ~30 bytes per photo rendered as a blurred placeholder the
// instant a row scrolls in, so a tile is never empty while its image loads.
//
// `tests/thumbhash_decode.js` slices this file from `function
// thumbHashToDataURL` and evaluates it under node, checking the encoder in
// archive/pipeline/features.py against the code the browser actually runs rather than
// against a second implementation written to agree with it. So the function
// stays last in the file and stays free of any ESM syntax after its own `export`
// keyword.

export function thumbHashToDataURL(base64) {
  try {
    const hash = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const header24 = hash[0] | (hash[1] << 8) | (hash[2] << 16);
    const header16 = hash[3] | (hash[4] << 8);
    const lDc = (header24 & 63) / 63;
    const pDc = ((header24 >> 6) & 63) / 31.5 - 1;
    const qDc = ((header24 >> 12) & 63) / 31.5 - 1;
    const lScale = ((header24 >> 18) & 31) / 31;
    const hasAlpha = header24 >> 23;
    const pScale = ((header16 >> 3) & 63) / 63;
    const qScale = ((header16 >> 9) & 63) / 63;
    const isLandscape = header16 >> 15;
    const lx = Math.max(3, isLandscape ? (hasAlpha ? 5 : 7) : header16 & 7);
    const ly = Math.max(3, isLandscape ? header16 & 7 : hasAlpha ? 5 : 7);

    let acStart = hasAlpha ? 6 : 5;
    let acIndex = 0;
    const channel = (nx, ny, scale) => {
      const ac = [];
      for (let cy = 0; cy < ny; cy++) {
        for (let cx = cy ? 0 : 1; cx * ny < nx * (ny - cy); cx++) {
          const nibble = (hash[acStart + (acIndex >> 1)] >> ((acIndex++ & 1) << 2)) & 15;
          ac.push((nibble / 7.5 - 1) * scale);
        }
      }
      return ac;
    };
    const lAc = channel(lx, ly, lScale);
    const pAc = channel(3, 3, pScale * 1.25);
    const qAc = channel(3, 3, qScale * 1.25);

    const ratio = lx / ly;
    const w = Math.max(1, Math.round(ratio > 1 ? 32 : 32 * ratio));
    const h = Math.max(1, Math.round(ratio > 1 ? 32 / ratio : 32));
    const canvasEl = document.createElement("canvas");
    canvasEl.width = w;
    canvasEl.height = h;
    const ctx = canvasEl.getContext("2d");
    const image = ctx.createImageData(w, h);
    const fx = [];
    const fy = [];
    for (let y = 0, i = 0; y < h; y++) {
      for (let x = 0; x < w; x++, i += 4) {
        let l = lDc;
        let p = pDc;
        let q = qDc;
        for (let cx = 0; cx < lx; cx++) fx[cx] = Math.cos((Math.PI / w) * (x + 0.5) * cx);
        for (let cy = 0; cy < ly; cy++) fy[cy] = Math.cos((Math.PI / h) * (y + 0.5) * cy);
        for (let cy = 0, j = 0; cy < ly; cy++) {
          for (let cx = cy ? 0 : 1; cx * ly < lx * (ly - cy); cx++, j++) {
            l += lAc[j] * fx[cx] * fy[cy] * 2;
          }
        }
        for (let cy = 0, j = 0; cy < 3; cy++) {
          for (let cx = cy ? 0 : 1; cx < 3 - cy; cx++, j++) {
            const f = fx[cx] * fy[cy] * 2;
            p += pAc[j] * f;
            q += qAc[j] * f;
          }
        }
        const b = l - (2 / 3) * p;
        const r = (3 * l - b + q) / 2;
        const g = r - q;
        image.data[i] = Math.max(0, Math.min(255, Math.round(255 * r)));
        image.data[i + 1] = Math.max(0, Math.min(255, Math.round(255 * g)));
        image.data[i + 2] = Math.max(0, Math.min(255, Math.round(255 * b)));
        image.data[i + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    return canvasEl.toDataURL();
  } catch (err) {
    return null; // a malformed hash must never cost a tile
  }
}
