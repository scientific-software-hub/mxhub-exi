<section class="hero">
  <div class="spot-field"><!--SPOT_FIELD--></div>
  <div class="hero-inner">
    <span class="kicker">Extended ISPyB Interface</span>
    <h1>EXI Documentation</h1>
    <p class="lede">
      EXI is the web interface researchers and beamline staff use to plan, ship, run, and review
      macromolecular crystallography experiments on top of <strong>ISPyB</strong>, the backend
      that stores the experimental record. This site documents it from three angles: using it,
      building it, and trusting it.
    </p>
  </div>
</section>

<div class="stat-row">
  <div class="stat"><span class="stat-value">ExtJS 5</span><span class="stat-label">UI framework</span></div>
  <div class="stat"><span class="stat-value">Dust.js</span><span class="stat-label">templates</span></div>
  <div class="stat"><span class="stat-value">Grunt</span><span class="stat-label">build tool</span></div>
  <div class="stat"><span class="stat-value">Cypress 13</span><span class="stat-label">E2E tests</span></div>
  <div class="stat"><span class="stat-value">22</span><span class="stat-label">user journeys mapped</span></div>
  <div class="stat"><span class="stat-value">16</span><span class="stat-label">test specs</span></div>
  <div class="stat"><span class="stat-value">~69</span><span class="stat-label">REST endpoints</span></div>
</div>

<div class="perspectives">

  <div class="persp-card" style="--card-accent:#0f6e62">
    <span class="eyebrow">For researchers</span>
    <h2>Using EXI</h2>
    <p>Ship samples, register proteins and crystals, and review your results after beamtime.</p>
    <ul>
      <li><a href="user-guide.html">User Guide</a></li>
      <li><a href="user-journeys.html">User Journeys</a></li>
    </ul>
  </div>

  <div class="persp-card" style="--card-accent:#b0502f">
    <span class="eyebrow">For developers</span>
    <h2>Building EXI</h2>
    <p>Tech stack, local setup, and how the MX module is put together — controllers, views, widgets, and the ISPyB REST surface underneath.</p>
    <ul>
      <li><a href="developer-guide.html">Developer Guide</a></li>
      <li><a href="architecture.html">MX Module Architecture</a></li>
      <li><a href="widget-tree.html">Widget &amp; Template Tree</a></li>
    </ul>
  </div>

  <div class="persp-card" style="--card-accent:#2d6a44">
    <span class="eyebrow">For anyone assessing quality</span>
    <h2>Trusting EXI</h2>
    <p>How the automated test suite works, what it actually covers across every user journey, and — just as importantly — what's known to be broken and why it isn't tested around.</p>
    <ul>
      <li><a href="testing.html">Testing &amp; Quality</a></li>
    </ul>
  </div>

</div>
