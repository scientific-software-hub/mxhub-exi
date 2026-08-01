import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { dustTemplatesPlugin, cssBundlePlugin } from './vite-plugins.mjs';

// The exi.min.css-equivalent bundle (Gruntfile.js's cssmin.prod file list,
// unchanged) -- see cssBundlePlugin in vite-plugins.mjs for why this
// bypasses Vite's own CSS pipeline.
const CSS_BUNDLE_FILES = [
    'node_modules/bootstrap/dist/css/bootstrap.min.css',
    'css/templatelist.css',
    'css/beamlinesessionbox.css',
    'node_modules/vis/dist/vis.css',
    'node_modules/handsontable/dist/handsontable.full.css',
    'css/dygraph-custom.css',
    'css/exi.css',
    'css/calendar.css',
    'css/menu/mainmenu.css',
    'css/override.css',
    'css/grid.css',
    'node_modules/lightbox2/dist/css/lightbox.css',
    'node_modules/bootstrap-year-calendar/css/bootstrap-year-calendar.min.css',
    'node_modules/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
    'node_modules/bootstrap-multiselect/dist/css/bootstrap-multiselect.css',
    'node_modules/handsontable/dist/handsontable.css',
];

// Vendor <script>/<link> files referenced directly in mx/index.html by their
// node_modules path. Vite's build refuses to bundle classic (non-module)
// <script src> tags and leaves their reference untouched -- these need to
// actually exist at that same relative path under dist/ for the reference
// to resolve, so each gets copied verbatim (no processing: these are
// already-built UMD/global bundles).
const VENDOR_FILES = [
    'node_modules/jquery/dist/jquery.js',
    'node_modules/handsontable/dist/handsontable.full.js',
    'node_modules/jquery-lazy/jquery.lazy.min.js',
    'node_modules/dygraphs/dygraph-combined.js',
    'node_modules/vis/dist/vis.js',
    'node_modules/snapsvg/dist/snap.svg-min.js',
    'node_modules/pathjs-amd/dist/path.js',
    'node_modules/dustjs-linkedin/dist/dust-full.min.js',
    'node_modules/dustjs-helpers/dist/dust-helpers.min.js',
    'node_modules/lightbox2/dist/js/lightbox.js',
    'node_modules/bootstrap/dist/js/bootstrap.js',
    'node_modules/notifyjs-browser/dist/notify.js',
    'node_modules/lodash/lodash.js',
    'node_modules/bootstrap-multiselect/dist/js/bootstrap-multiselect.js',
    'node_modules/moment/moment.js',
    'node_modules/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
    'node_modules/html-docx-js/dist/html-docx.js',
    'node_modules/linkifyjs/dist/linkify.js',
    'node_modules/bootstrap-year-calendar/js/bootstrap-year-calendar.min.js',
    'node_modules/linkifyjs/dist/linkify-jquery.min.js',
    // Vendored/minified, excluded from js/main.js's module graph (see
    // js/main.js's header comment) -- referenced as classic scripts, so
    // they need the same verbatim-copy treatment as the nodeModules vendor
    // files above.
    'js/tools/a_three49custom.js',
    'js/tools/b_GLmol_modified.js',
    // Per-deployment config (REST base URL, site list) -- deliberately not
    // part of the js/main.js module graph; referenced as "config.js"
    // (relative to mx/index.html) so it needs to exist at dist/mx/config.js.
    'mx/config.js',
];

// Grunt -> Vite migration (see .claude/specs and the migration plan).
//
// Phase 1: dev server with an ISPyB proxy so local development no longer
// requires deploying EXI into the same Tomcat instance as ISPyB.
// mx/config.js already points at the relative path "/ispyb/ispyb-ws/rest" and
// ISPyB auth is token-in-URL (not cookie-based), so a plain proxy is enough
// to keep every request same-origin from the browser's point of view.
//
// Phase 3: `vite build` replaces the Grunt production pipeline for the MX
// entry point (mx/index.html). saxs/ and tracking/ are out of scope (see
// CLAUDE.md) and are not built by this config -- their min/ artifacts are
// whatever the last `grunt` run produced.

// Vite's dev server always runs .css requests through its PostCSS pipeline
// (needed for @import / CSS-modules / JS `import './x.css'`), even when the
// request comes from a plain <link> tag and nothing ever imports the file
// from JS. That pipeline requires spec-compliant CSS, but the vendored ExtJS
// theme CSS under node_modules uses legacy syntax browsers tolerate but
// strict CSS parsers reject (old-IE `filter:progid:...`). Serve .css
// requests as raw static files, bypassing that pipeline entirely. (Our own
// bundled CSS -- css/main.css -- is handled separately by cssBundlePlugin,
// which owns that URL before this middleware ever sees it.)
function rawCssPlugin() {
    return {
        name: 'serve-raw-css',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const urlPath = req.url.split('?')[0];
                if (!urlPath.endsWith('.css')) return next();
                const filePath = path.join(server.config.root, decodeURIComponent(urlPath));
                fs.readFile(filePath, (err, data) => {
                    if (err) return next();
                    res.setHeader('Content-Type', 'text/css');
                    res.end(data);
                });
            });
        },
    };
}

export default defineConfig({
    root: '.',
    plugins: [
        cssBundlePlugin({ files: CSS_BUNDLE_FILES, outputPath: 'css/main.css' }),
        rawCssPlugin(),
        dustTemplatesPlugin(),
        // Vite's build declines to bundle classic (non type="module")
        // <script src> / <link href> tags -- it warns and leaves the
        // reference as literal text, so every vendor file mx/index.html
        // points at by its node_modules (or js/tools/) path needs to
        // actually exist there under dist/ too. Mirrors Gruntfile.js's
        // copy-extjs task for the ExtJS build/examples/ux/extended
        // directories (Ext.Loader dynamically script-injects Ext.ux.* /
        // Ext.Extended.* at runtime -- paths Vite's HTML scanner can't see
        // to begin with) plus one entry per individually-referenced vendor
        // file.
        viteStaticCopy({
            // `dest` is NOT "the directory to place this in" -- the plugin
            // always preserves src's full relative path underneath dest
            // (see its README: "Directory structure is always preserved").
            // '.' means "under outDir itself", so e.g.
            // src: 'node_modules/jquery/dist/jquery.js' lands at exactly
            // dist/node_modules/jquery/dist/jquery.js -- matching the
            // unmodified '../node_modules/...' references in mx/index.html.
            targets: [
                { src: 'node_modules/@scientific-software-hub/extjs/build', dest: '.' },
                { src: 'node_modules/@scientific-software-hub/extjs/examples/ux', dest: '.' },
                { src: 'node_modules/@scientific-software-hub/extjs/extended', dest: '.' },
                ...VENDOR_FILES.map((src) => ({ src, dest: '.' })),
            ],
        }),
    ],
    server: {
        port: 5173,
        proxy: {
            '/ispyb': {
                target: 'http://localhost:8080',
                changeOrigin: false,
            },
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: 'mx/index.html',
        },
    },
});
