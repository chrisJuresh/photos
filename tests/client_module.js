// Calls a named export of a client module and prints its result as JSON, so the
// client's pure logic can be asserted from pytest without the client growing a
// test runner of its own.
//
//   echo '[{"from":0,"to":3,"height":220},[...],960]' \
//     | node tests/client_module.js ui/src/lib/layout.js rowBoxes
//
// Arguments come in on stdin as a JSON array and are spread over the call; the
// return value goes out on stdout as JSON. The module path is the source under
// `ui/src`, never `photolib/static/bundle.js` -- the bundle is minified, so a
// named export could not be found in it, and a stale one would prove agreement
// with code the browser is no longer running.
//
// `ui/package.json` declares the client an ES module, so node imports these
// files as they are; the older `thumbhash_decode.js` slices its function out of
// the source text because it also has to stub a canvas around it.

const path = require("node:path");
const { pathToFileURL } = require("node:url");

async function main() {
  const [modulePath, exportName] = process.argv.slice(2);
  if (!modulePath || !exportName) {
    throw new Error("usage: node tests/client_module.js <module> <export>  (args as JSON on stdin)");
  }

  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8").trim();
  const args = text ? JSON.parse(text) : [];
  if (!Array.isArray(args)) throw new Error("stdin must hold a JSON array of arguments");

  const module = await import(pathToFileURL(path.resolve(modulePath)).href);
  const target = module[exportName];
  if (typeof target !== "function") {
    throw new Error(exportName + " is not an exported function of " + modulePath);
  }

  process.stdout.write(JSON.stringify(target(...args)));
}

main().catch((err) => {
  process.stderr.write(String(err && err.stack ? err.stack : err) + "\n");
  process.exit(1);
});
