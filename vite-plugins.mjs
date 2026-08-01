// Custom Vite plugins for the Grunt -> Vite migration, Phase 3.
import fs from 'node:fs';
import path from 'node:path';
import dust from 'dustjs-linkedin';
import CleanCSS from 'clean-css';

const VIRTUAL_ID = 'virtual:dust-templates';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

/**
 * Replaces Gruntfile.js's `dustjs` task. Precompiles every file in
 * templates/**\/*.js (raw Dust template markup -- the .js extension is
 * misleading, these are not JavaScript) into a registered Dust template
 * function, using the same dust.compile() API grunt-dustjs called
 * internally, so output is byte-for-byte the same shape as the old
 * min/precompiled.templates.min.js.
 *
 * Template name = basename without .js, regardless of subdirectory
 * (templates/em/foo.template.js -> "foo.template") -- matches the
 * existing naming convention every dust.render() call site depends on.
 *
 * Exposed as a virtual module so it can be imported like any other
 * side-effect module from js/main.js, after js/dust/helpers.js (which
 * registers the custom {@decimal}/{@math}/etc. helpers these templates
 * use) and after the dustjs-linkedin vendor <script> tag (which provides
 * the `dust` global these compiled functions close over).
 */
export function dustTemplatesPlugin({ templatesDir = 'templates' } = {}) {
  function findTemplateFiles(root) {
    const out = [];
    (function walk(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.js')) out.push(full);
      }
    })(root);
    return out.sort();
  }

  function compileAll() {
    const files = findTemplateFiles(templatesDir);
    const chunks = files.map((file) => {
      const name = path.basename(file, '.js');
      const source = fs.readFileSync(file, 'utf8');
      return dust.compile(source, name);
    });
    return chunks.join('\n');
  }

  return {
    name: 'dust-templates',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id === RESOLVED_ID) return compileAll();
    },
    configureServer(server) {
      // Re-trigger Vite's module graph for the virtual module when any
      // template source file changes, so dev-server edits are picked up
      // without a manual reload of unrelated files.
      server.watcher.add(path.resolve(templatesDir));
      server.watcher.on('change', (file) => {
        if (path.resolve(file).startsWith(path.resolve(templatesDir))) {
          const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
          if (mod) server.moduleGraph.invalidateModule(mod);
        }
      });
    },
  };
}

/**
 * Replaces Gruntfile.js's `cssmin` task (min/exi.min.css). Bundles the same
 * file list with the same library (clean-css) and the same options
 * (`rebase: false`) grunt-contrib-cssmin used, rather than routing through
 * Vite's own CSS pipeline (PostCSS/Lightning CSS). Both of those enforce
 * spec-compliant CSS and reject syntax this bundle's vendor files use that
 * browsers tolerate fine (verified separately: PostCSS accepts all 16 files
 * individually, but fails once concatenated -- e.g. handsontable.full.css's
 * `@charset` is no longer first-in-file after concatenation. clean-css has
 * no such restriction, matching what's already running in production).
 *
 * `rebase: false` means url() references inside each source file are left
 * exactly as authored (relative to that file's own directory), not rewritten
 * for the new output location. That only produces correct paths if the
 * bundle is served from a directory the same number of levels below the
 * repo root as every source file's own directory -- true for the current
 * output (css/main.css, alongside the css/ sources) purely by construction,
 * matching how min/exi.min.css already relies on the same coincidence today
 * (css/ and min/ are sibling top-level directories).
 *
 * mx/index.html references this bundle with a plain, literal
 * `<link rel="stylesheet" href="../css/main.css">` -- no special injection
 * needed. At build-scan time the source file genuinely doesn't exist (it's
 * generated here, in generateBundle, which runs later), so Vite's HTML
 * scanner leaves the reference as unprocessed text rather than erroring;
 * by the time the build finishes, this plugin has written the real file to
 * the exact path that reference resolves to. In dev, the same URL is
 * served directly by the middleware below, ahead of Vite's own static
 * file handling.
 */
export function cssBundlePlugin({ files, outputPath = 'css/main.css' } = {}) {
  const absFiles = files.map((f) => path.resolve(f));

  return {
    name: 'legacy-css-bundle',
    configureServer(server) {
      const devUrl = '/' + outputPath;
      server.middlewares.use((req, res, next) => {
        if (req.url.split('?')[0] !== devUrl) return next();
        // Dev: raw concatenation, unminified -- fast, and matches the
        // "serve legacy assets as-is" approach used for other .css files.
        const merged = absFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
        res.setHeader('Content-Type', 'text/css');
        res.end(merged);
      });
    },
    generateBundle() {
      // Build only (configureServer's dev middleware handles serving).
      const result = new CleanCSS({
        rebase: false,
        relativeTo: path.dirname(absFiles[0]),
      }).minify(absFiles);
      if (result.errors.length) {
        this.error(`CSS bundle failed: ${result.errors.join('; ')}`);
      }
      this.emitFile({ type: 'asset', fileName: outputPath, source: result.styles });
    },
  };
}
