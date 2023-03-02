#!/usr/bin/env node

require("esbuild")
  .build({
    logLevel: "info",
    entryPoints: ["src/index.jsx"],
    bundle: true,
    minify: true,
    outfile: "dist/bundle.js",
    jsx: "automatic"
  })
  .catch(() => process.exit(1));
