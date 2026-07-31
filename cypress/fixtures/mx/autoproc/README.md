# Autoproc plot fixtures

## What's here

- `autoproc_detailed_statistics_fixture.log` — a real autoPROC "detailed statistics" log, valid
  against the parser the ISPyB REST backend uses (`AutoProcDetailedTableParser`). Contains three
  "# detailed statistics" tables: OVERALL, STARANISO measurements, STARANISO observations.
- `xscale-{completeness,rfactor,isigma,cc2,sigmaano,anomcorr}.txt` — **real** `text/plain` CSV
  responses recorded live from `GET .../mx/autoprocintegration/{id}/xscale/{metric}`, after
  pointing a real `AutoProcProgramAttachment` row at the `.log` file above (see "How this was
  produced"). Use these as `cy.intercept()` fixtures so mocked plot tests assert on realistic curve
  shapes instead of made-up numbers.
- `xscale-wilson-broken.txt` — the **actual** (buggy) response body for `xscale/wilson` against
  this fixture: HTTP `200` with a leaked exception message instead of CSV or an error status. See
  `.claude/specs/confirmed-bugs.md` for the corresponding entry. Do not treat this as a "happy
  path" fixture — it documents a real backend defect. Re-record if/when the backend is fixed.
- `fastdp-empty.txt` — the real response for `GET .../fastdp/completeness` against this same
  fixture: just the CSV header row, no data. This log format only satisfies the `xscale/*`
  endpoints, not `fastdp/*` (which needs a differently-named/formatted log, parsed by a different
  server-side parser). Use this fixture for tests asserting the *empty*/no-data state of the
  FastDP plots, not as a stand-in for real FastDP data.

## How this was produced (reproduce after a DB reseed)

1. Copy the fixture log in from the sibling backend repo's test resources (already done here, but
   for reference — check that repo's `AutoProcDetailedTableParserTest` fixtures for the current
   file name/location).
2. Find an existing `AutoProcProgramAttachment` row whose `fileName` already matches the autoPROC
   log pattern for the `autoProcProgramId`(s) you want to hijack (or use whichever ones back the
   data collection you're testing against):
   ```sql
   SELECT autoProcProgramAttachmentId, autoProcProgramId, fileName, filePath
   FROM AutoProcProgramAttachment
   WHERE fileName LIKE '%autoPROC%.log' AND autoProcProgramId IN (<your program ids>);
   ```
3. Point that row's `filePath` at this fixture directory's **absolute host path**, and `fileName`
   at the fixture file itself (it already matches the lookup pattern case-insensitively, so no
   rename needed):
   ```sql
   UPDATE AutoProcProgramAttachment
   SET filePath = '<absolute path to>/cypress/fixtures/mx/autoproc',
       fileName = 'autoproc_detailed_statistics_fixture.log'
   WHERE autoProcProgramAttachmentId IN (<ids>);
   ```
   Do **not** insert a brand-new attachment row alongside the existing one — the backend's XScale
   lookup matches by `fileName LIKE` pattern for the program id with no other filter, so a second
   matching row for the same program creates ambiguity about which one gets read. Update the
   existing row in place.
4. The path is used literally by the backend (no base-dir config on Linux) — whichever OS user runs
   the REST process needs read access to this file. On a typical single-user dev machine that's
   automatic.
5. Pick two `autoProcProgramId`s backing the same data collection — one plain `autoPROC` program
   (drives the overall/isotropic table) and one `autoPROC_staraniso` program (drives the STARANISO
   observations table):
   ```sql
   SELECT autoProcProgramId, processingPrograms FROM AutoProcProgram
   WHERE autoProcProgramId IN (
     SELECT autoProcProgramId FROM AutoProcIntegration WHERE dataCollectionId = <your dc id>
   );
   ```
   Use the row with `processingPrograms = 'autoPROC'` for the overall table, and
   `'autoPROC_staraniso'` for the staraniso table.
