#!/usr/bin/env node

const cssModulesPlugin = require("esbuild-css-modules-plugin");

require("esbuild")
  .build({
    logLevel: "info",
    entryPoints: ["src/index.jsx"],
    bundle: true,
    minify: true,
    outfile: "dist/bundle.js",
    plugins: [cssModulesPlugin()],
    jsx: "automatic"
  })
  .catch(() => process.exit(1));
