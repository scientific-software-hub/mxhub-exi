#!/usr/bin/env node
'use strict';

/**
 * Builds the mxhub-exi documentation site: documentation/*.md -> documentation/_site/*.html
 *
 * No frameworks — plain Node + marked + highlight.js. Two checks run before anything is
 * written to disk and FAIL THE BUILD (non-zero exit) if they don't pass:
 *
 *   1. Scrub check — the FORBIDDEN list below catches real names/logins/emails/proposal
 *      codes that must never appear in the public docs (see documentation/README's
 *      "Anonymisation" note, or the plan this was built from).
 *   2. Link check — every relative link produced by the `link` renderer must resolve to a
 *      real output page, and every #anchor must resolve to a real heading on that page.
 *
 * Run: `npm run build` (from documentation/), or `npm run serve` to also preview on :4000.
 */

const fs = require('fs');
const path = require('path');
const { Marked } = require('marked');
const hljs = require('highlight.js');

const ROOT = __dirname;
const OUT = path.join(ROOT, '_site');
const TEMPLATES = path.join(ROOT, 'templates');
const REPO_URL = 'https://github.com/scientific-software-hub/mxhub-exi';

// Site chrome accent (top bar, wordmark, footer links) — kept distinct from every
// per-page content accent below so it always reads as "the site", not "a section".
const CHROME_ACCENT = '#0a6b82';

// ---------------------------------------------------------------------------------------
// Page manifest — nav order, per-page accent, and the copy used in <header class="doc-header">
// and on the landing page's perspective cards.
// ---------------------------------------------------------------------------------------

const SECTIONS = [
  {
    key: 'home', file: 'index.md', out: 'index.html', isHome: true,
    nav: 'Home', title: 'EXI Documentation', accent: CHROME_ACCENT,
    blurb: 'Documentation for EXI, the Extended ISPyB Interface used at MX synchrotron beamlines.',
  },
  {
    key: 'user-guide', file: 'user-guide.md', out: 'user-guide.html',
    nav: 'User Guide', title: 'User Guide', accent: '#0f6e62',
    kicker: 'For researchers & sample submitters',
    blurb: 'Ship samples, register proteins and crystals, and review your results after beamtime.',
  },
  {
    key: 'user-journeys', file: 'user-journeys.md', out: 'user-journeys.html',
    nav: 'User Journeys', title: 'User Journeys', accent: '#6b3585',
    kicker: '22 journeys across 3 personas, live-validated against a running instance',
    blurb: 'Every path a user, local contact, or facility manager takes through EXI, mapped step by step.',
  },
  {
    key: 'architecture', file: 'architecture.md', out: 'architecture.html',
    nav: 'Architecture', title: 'MX Module Architecture', accent: '#33408c',
    kicker: 'Views, routes & the ISPyB REST surface',
    blurb: 'The full MX module: top-level composition, routing, per-feature widget hierarchies, and the REST endpoint reference.',
  },
  {
    key: 'widget-tree', file: 'widget-tree.md', out: 'widget-tree.html',
    nav: 'Widget Tree', title: 'Widget & Template Tree', accent: '#2e5280',
    kicker: 'ExtJS views, widgets & Dust templates',
    blurb: 'How each top-level view is assembled from ExtJS widgets and precompiled Dust templates.',
  },
  {
    key: 'developer-guide', file: 'developer-guide.md', out: 'developer-guide.html',
    nav: 'Developer Guide', title: 'Developer Guide', accent: '#b0502f',
    kicker: 'Build, run & debug EXI',
    blurb: 'Tech stack, local setup, running the Cypress suite, and attaching a debugger to a live build.',
  },
  {
    key: 'testing', file: 'testing.md', out: 'testing.html',
    nav: 'Testing & Quality', title: 'Testing & Quality', accent: '#2d6a44',
    kicker: "What's tested, and what isn't yet",
    blurb: 'How the Cypress suite works, what it covers across all 20 user journeys, and known gaps.',
  },
];

// ---------------------------------------------------------------------------------------
// Anonymisation — real-world references that must never reappear in the public docs.
// Facility/beamline names (DESY, P11) and the already-synthetic MX1234 are intentionally
// NOT in this list — they're kept because they appear verbatim in the app's own UI labels
// and in the user-guide screenshots.
// ---------------------------------------------------------------------------------------

const FORBIDDEN = [
  { name: 'login "hakanj"', re: /\bhakanj\b/i },
  { name: 'login "hovomo"', re: /\bhovomo\b/i },
  { name: 'name "Hakanpää"', re: /hakanp[äa]{1,2}t/i },
  { name: 'name "von Moeller"', re: /von\s+moeller/i },
  { name: 'name "Taberman"', re: /taberman/i },
  { name: 'name "Paul Carroll"', re: /paul\s+carroll/i },
  { name: 'desy.de email address', re: /@desy\.de/i },
  { name: 'real proposal code P20010444', re: /P20010444/ },
  { name: 'real proposal code R20260053', re: /R20260053/ },
  { name: 'real session id 11023045', re: /11023045/ },
  { name: 'real session id 11024778', re: /11024778/ },
  { name: 'real session id 11024235', re: /11024235/ },
  { name: 'real /ispyb_data/ file path', re: /\/ispyb_data\// },
];

const scrubViolations = [];

function scrubCheck(fileLabel, source) {
  const lines = source.split('\n');
  for (const { name, re } of FORBIDDEN) {
    lines.forEach((line, i) => {
      if (re.test(line)) {
        scrubViolations.push(
          `${fileLabel}:${i + 1}: matches ${name} — "${line.trim().slice(0, 110)}"`
        );
      }
    });
  }
}

// ---------------------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------------------

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function stripTags(html) {
  return String(html).replace(/<[^>]+>/g, '');
}

function makeSlugger() {
  const seen = new Map();
  return function slug(raw) {
    let base = String(raw)
      .toLowerCase()
      .replace(/`/g, '')
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .trim()
      .replace(/\s+/g, '-');
    if (!base) base = 'section';
    const n = seen.get(base) || 0;
    seen.set(base, n + 1);
    return n === 0 ? base : `${base}-${n}`;
  };
}

function extractH1(markdown) {
  const m = markdown.match(/^#\s+(.+?)\s*$/m);
  if (!m) return { title: null, rest: markdown };
  const rest = markdown.replace(m[0], '').replace(/^\s*\n/, '');
  return { title: m[1], rest };
}

function fillTemplate(tpl, map) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (m, key) => (key in map ? map[key] : ''));
}

// ---------------------------------------------------------------------------------------
// Signature visual — a procedurally-generated diffraction-spot pattern (concentric rings
// of unevenly-spaced, unevenly-sized dots, the way Bragg reflections cluster on a real MX
// detector image around the beamstop). Deterministic (seeded LCG) so rebuilds don't churn
// the output. Used in the hero background, the wordmark mark, and the favicon.
// ---------------------------------------------------------------------------------------

function diffractionDots({ size, rings, seed, accent }) {
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return (s % 10000) / 10000;
  };
  const cx = size / 2;
  const cy = size / 2;
  let out = '';
  for (let r = 1; r <= rings; r++) {
    const radius = (r / rings) * (size / 2 - size * 0.03) + size * 0.03;
    const count = 5 + r * 6;
    for (let i = 0; i < count; i++) {
      if (rand() > 0.8) continue; // sparsify — real spot patterns have gaps, not full rings
      const angle = (i / count) * Math.PI * 2 + rand() * 0.2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      const dotR = (0.6 + rand() * (size / 220)) * (1 - r / (rings + 3));
      const op = Math.max(0.1, 0.95 - r * (0.7 / rings)) * (0.5 + rand() * 0.5);
      out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${dotR.toFixed(2)}" fill="${accent}" fill-opacity="${op.toFixed(2)}"/>`;
    }
  }
  return out;
}

function spotMarkSmall() {
  const dots = diffractionDots({ size: 28, rings: 2, seed: 3, accent: CHROME_ACCENT });
  return `<svg class="spot-mark" width="22" height="22" viewBox="0 0 28 28" aria-hidden="true">${dots}</svg>`;
}

function heroSpotField(accent) {
  const dots = diffractionDots({ size: 640, rings: 7, seed: 42, accent });
  return `<svg viewBox="0 0 640 640" width="640" height="640" aria-hidden="true">${dots}</svg>`;
}

const FAVICON_DATA_URI = 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
  `<rect width="64" height="64" rx="14" fill="#16151a"/>` +
  diffractionDots({ size: 64, rings: 3, seed: 7, accent: '#5fd0e8' }) +
  `</svg>`
);

// ---------------------------------------------------------------------------------------
// Markdown rendering — a single Marked instance whose renderer closes over module-level
// `cur*` state, reset before each page. The build is synchronous/single-threaded, so this
// is safe and much simpler than threading state through marked's options object.
// ---------------------------------------------------------------------------------------

let curOut = null;
let curHeadings = [];
let curUsedMermaid = false;

const linkRecords = [];
const headingsByPage = {};

const md = new Marked({
  gfm: true,
  renderer: {
    heading(text, level, raw) {
      const id = curSlug(raw);
      if (level === 2 || level === 3) {
        curHeadings.push({ depth: level, id, text: stripTags(text) });
      }
      return `<h${level} id="${id}">${text}</h${level}>\n`;
    },
    code(code, infostring) {
      const lang = (infostring || '').trim().split(/\s+/)[0];
      if (lang === 'mermaid') {
        curUsedMermaid = true;
        return `<div class="diagram-wrap"><pre class="mermaid">${escapeHtml(code)}</pre></div>\n`;
      }
      let highlighted;
      let dataLang = lang || '';
      try {
        if (lang && hljs.getLanguage(lang)) {
          highlighted = hljs.highlight(code, { language: lang }).value;
        } else {
          const auto = hljs.highlightAuto(code);
          highlighted = auto.value;
          dataLang = dataLang || auto.language || '';
        }
      } catch (e) {
        highlighted = escapeHtml(code);
      }
      return `<div class="code-wrap"><pre><code class="hljs" data-lang="${escapeHtml(dataLang)}">${highlighted}</code></pre></div>\n`;
    },
    link(href, title, text) {
      const isExternal = /^([a-z][a-z0-9+.-]*:)?\/\//i.test(href) || /^mailto:/i.test(href);
      let finalHref = href;
      if (!isExternal && !href.startsWith('#')) {
        finalHref = href.replace(/\.md(#.*)?$/i, (m, anchor) => '.html' + (anchor || ''));
      }
      if (!isExternal) linkRecords.push({ from: curOut, href: finalHref });
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      const targetAttr = isExternal ? ' target="_blank" rel="noopener"' : '';
      return `<a href="${finalHref}"${titleAttr}${targetAttr}>${text}</a>`;
    },
    table(header, body) {
      return `<div class="table-wrap"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>\n`;
    },
  },
});

let curSlug = makeSlugger();

function renderPage(section) {
  curOut = section.out;
  curHeadings = [];
  curUsedMermaid = false;
  curSlug = makeSlugger();

  const rawMd = fs.readFileSync(path.join(ROOT, section.file), 'utf8');
  scrubCheck(section.file, rawMd);

  let bodyMd = rawMd;
  let title = section.title;
  if (!section.isHome) {
    const extracted = extractH1(rawMd);
    bodyMd = extracted.rest;
    title = extracted.title || section.title;
  }

  const html = md.parse(bodyMd);
  headingsByPage[section.out] = curHeadings;
  return { html, usedMermaid: curUsedMermaid, title };
}

// ---------------------------------------------------------------------------------------
// Chrome — top bar, doc header, TOC rail, footer, conditional Mermaid loader
// ---------------------------------------------------------------------------------------

function renderTopbar(currentKey) {
  const links = SECTIONS.filter((s) => !s.isHome)
    .map((s) => {
      const cls = s.key === currentKey ? ' current' : '';
      return `<a class="${cls.trim()}" href="${s.out}"><span class="dot" style="--dot-color:${s.accent}"></span>${escapeHtml(s.nav)}</a>`;
    })
    .join('\n      ');
  return `<header class="topbar">
    <a class="wordmark" href="index.html">${spotMarkSmall()}EXI Docs</a>
    <nav>
      ${links}
    </nav>
    <span class="spacer"></span>
    <a class="gh-link" href="${REPO_URL}" target="_blank" rel="noopener">GitHub ↗</a>
  </header>`;
}

function renderHeaderBlock(section, title) {
  return `<header class="doc-header">
  <div class="kicker">${escapeHtml(section.kicker || '')}</div>
  <h1>${escapeHtml(title)}</h1>
  <div class="sub">${escapeHtml(section.blurb || '')}</div>
</header>`;
}

function renderTocRail(headings) {
  if (!headings || headings.length < 2) return '';
  // h.text is stripTags() output of marked's already-escaped inline heading HTML — do not
  // escapeHtml() it again here, or entities like &#39; double-escape into literal "&amp;#39;".
  const items = headings
    .map((h) => `<li class="h${h.depth}"><a href="#${h.id}">${h.text}</a></li>`)
    .join('\n');
  return `<aside class="toc-rail">
  <div class="toc-kicker">On this page</div>
  <ol>${items}</ol>
</aside>`;
}

function renderFooter() {
  return `<footer class="site-footer">
    Generated from <code>documentation/*.md</code> · <a href="${REPO_URL}" target="_blank" rel="noopener">mxhub-exi on GitHub</a>
  </footer>`;
}

function renderMermaidScript(accent) {
  return `<script type="module">
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const rootTheme = document.documentElement.getAttribute('data-theme');
const dark = rootTheme ? rootTheme === 'dark' : prefersDark;
mermaid.initialize(dark ? {
  startOnLoad: false, theme: 'dark', securityLevel: 'strict', fontFamily: 'JetBrains Mono, monospace'
} : {
  startOnLoad: false, theme: 'base', securityLevel: 'strict', fontFamily: 'JetBrains Mono, monospace',
  themeVariables: {
    primaryColor: '${accent}22', primaryBorderColor: '${accent}', primaryTextColor: '#1c1b19',
    lineColor: '${accent}', secondaryColor: '#f6f8fa', tertiaryColor: '#faf9f6',
    fontFamily: 'JetBrains Mono, monospace'
  }
});
mermaid.run({ querySelector: 'pre.mermaid' }).catch((err) => console.error('mermaid render failed', err));
</script>`;
}

// ---------------------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------------------

function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });

  fs.copyFileSync(path.join(TEMPLATES, 'style.css'), path.join(OUT, 'assets', 'style.css'));

  const imagesDir = path.join(ROOT, 'images');
  if (fs.existsSync(imagesDir)) {
    fs.cpSync(imagesDir, path.join(OUT, 'images'), { recursive: true });
  }
  const csvPath = path.join(ROOT, 'Shipment.csv');
  if (fs.existsSync(csvPath)) {
    fs.copyFileSync(csvPath, path.join(OUT, 'Shipment.csv'));
  }

  const pageTpl = fs.readFileSync(path.join(TEMPLATES, 'page.html'), 'utf8');

  const rendered = SECTIONS.map((section) => ({ section, ...renderPage(section) }));

  if (scrubViolations.length) {
    console.error(`\nScrub check failed — ${scrubViolations.length} real-world reference(s) found:\n`);
    for (const v of scrubViolations) console.error('  ' + v);
    console.error('\nRemove or anonymise these before the docs can build.\n');
    process.exit(1);
  }

  for (const { section, html, usedMermaid, title } of rendered) {
    const map = {
      TITLE: `${title} · EXI Docs`,
      DESCRIPTION: escapeHtml(section.blurb || ''),
      ACCENT: section.accent,
      FAVICON: FAVICON_DATA_URI,
      TOPBAR: renderTopbar(section.key),
      SHELL_CLASS: section.isHome ? 'no-toc' : '',
      HEADER_BLOCK: section.isHome ? '' : renderHeaderBlock(section, title),
      CONTENT: `<div class="doc-body">\n${
        section.isHome ? html.replace('<!--SPOT_FIELD-->', heroSpotField(section.accent)) : html
      }\n</div>`,
      TOC_RAIL: section.isHome ? '' : renderTocRail(headingsByPage[section.out]),
      FOOTER: renderFooter(),
      MERMAID_SCRIPT: usedMermaid ? renderMermaidScript(section.accent) : '',
    };
    fs.writeFileSync(path.join(OUT, section.out), fillTemplate(pageTpl, map));
  }

  // Link check — runs after every page is on disk conceptually, but we only need the
  // in-memory maps: every output filename, and every page's set of heading ids.
  const outputFiles = new Set(SECTIONS.map((s) => s.out));
  const linkErrors = [];
  for (const rec of linkRecords) {
    if (rec.href.startsWith('#')) {
      const heads = headingsByPage[rec.from] || [];
      if (!heads.some((h) => h.id === rec.href.slice(1))) {
        linkErrors.push(`${rec.from}: anchor link "${rec.href}" has no matching heading on that page`);
      }
      continue;
    }
    const [file, anchor] = rec.href.split('#');
    const isPage = outputFiles.has(file);
    const isStaticAsset = !isPage && fs.existsSync(path.join(ROOT, file));
    if (!isPage && !isStaticAsset) {
      linkErrors.push(`${rec.from}: links to "${rec.href}", but no page or static file builds to "${file}"`);
      continue;
    }
    if (isPage && anchor) {
      const heads = headingsByPage[file] || [];
      if (!heads.some((h) => h.id === anchor)) {
        linkErrors.push(`${rec.from}: links to "${rec.href}", but "${file}" has no heading "#${anchor}"`);
      }
    }
  }
  if (linkErrors.length) {
    console.error(`\nLink check failed — ${linkErrors.length} broken internal link(s):\n`);
    for (const e of linkErrors) console.error('  ' + e);
    console.error('');
    process.exit(1);
  }

  const diagramCount = rendered.filter((r) => r.usedMermaid).length;
  console.log(`Built ${rendered.length} pages -> ${path.relative(ROOT, OUT)}/`);
  console.log(`  ${diagramCount} page(s) contain Mermaid diagrams`);
  console.log(`  ${linkRecords.length} internal link(s) checked, 0 broken`);
  console.log(`  scrub check passed (${FORBIDDEN.length} patterns, 0 matches)`);
}

main();
