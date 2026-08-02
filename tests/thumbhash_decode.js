// Runs the ThumbHash decoder that photolib/static/app.js actually ships, so the
// encoder in photolib/features.py is checked against the code the browser will
// execute rather than against a second implementation written to agree with it.
//
// `th` is NULL in every catalog row until step 9, which means that function has
// never run against a real hash. The browser half of it is a canvas, so the
// stubs below supply just enough of one to capture the ImageData.
//
//   node tests/thumbhash_decode.js <path to app.js> <base64 hash>
//
// prints {"w":…, "h":…, "data":[r,g,b,a, …]} on stdout.

const fs = require("fs");

const source = fs.readFileSync(process.argv[2], "utf8");
const start = source.indexOf("function thumbHashToDataURL");
if (start < 0) throw new Error("thumbHashToDataURL is not in " + process.argv[2]);

let captured = null;
global.atob = (b64) => Buffer.from(b64, "base64").toString("binary");
global.document = {
  createElement: () => ({
    width: 0,
    height: 0,
    getContext: () => ({
      createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
      putImageData: (image) => { captured = image; },
    }),
    toDataURL: () => "data:image/png;base64,stub",
  }),
};

const decode = new Function(source.slice(start) + "; return thumbHashToDataURL;")();
const url = decode(process.argv[3]);
if (!url) throw new Error("the shipped decoder returned null");
process.stdout.write(
  JSON.stringify({ w: captured.width, h: captured.height, data: Array.from(captured.data) })
);
