import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

// Phase 1 of the Grunt -> Vite migration (see .claude/specs and the migration plan).
// This config only stands up a dev server with an ISPyB proxy so local development
// no longer requires deploying EXI into the same Tomcat instance as ISPyB.
// mx/config.js already points at the relative path "/ispyb/ispyb-ws/rest" and ISPyB
// auth is token-in-URL (not cookie-based), so a plain proxy is sufficient to keep
// every request same-origin from the browser's point of view.
//
// Grunt still owns the production build in this phase (`npm run build`).

// Vite's dev server always runs .css requests through its PostCSS pipeline (needed
// for @import / CSS-modules / JS `import './x.css'`), even when the request comes
// from a plain <link> tag and nothing ever imports the file from JS — which is the
// case for 100% of the CSS in this app today. That pipeline requires spec-compliant
// CSS, but this codebase (and the vendored ExtJS theme CSS under node_modules) uses
// legacy syntax browsers tolerate but strict CSS parsers reject (e.g. old-IE
// `filter:progid:...`). Serve .css requests as raw static files, bypassing that
// pipeline entirely, so the dev server's behavior matches production (nginx just
// serves the bytes as-is).
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
    plugins: [rawCssPlugin()],
    server: {
        port: 5173,
        proxy: {
            '/ispyb': {
                target: 'http://localhost:8080',
                changeOrigin: false,
            },
        },
    },
});
