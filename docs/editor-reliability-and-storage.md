# Editor reliability and storage

## What changed

1. **Cursor:** the animation starts only on mouse movement and stops when settled.
   Hiding the tab, leaving the page or using the keyboard restores the native cursor.
   Coarse/touch pointers, reduced motion and editable inputs use native behavior.
   Click particles respect pointer/reduced-motion preferences and clean up on unmount.
   Global smooth scrolling remains disabled.
2. **Drafts:** changes are debounced for 1.2 seconds and saved to `PortfolioDraft`,
   separate from public `Portfolio.content`. Incomplete fields are allowed in drafts;
   publication still requires the strict existing validation. A small status strip
   shows saving, recovery, failures and conflicts. Browser recovery copies are owner
   scoped; restoration ignores copies older than 30 days. Publishing does not happen
   automatically. Discard restores the published version and replaces the private draft.
3. **CI:** uses `portfolio_verification`, enables `RUN_DB_TESTS=1`, applies the actual
   migration history, checks schema drift, builds production, then runs browser tests.
   Guards fail CI if its test-database setup would silently skip the protected suites.
   Local browser fixtures stub only hosting-only Vercel scripts, not application APIs.
4. **Images:** new uploads are decoded with a 20-million-pixel processing cap. An
   original plus a proportional WebP preview (longest edge at most 960 pixels,
   quality 78, metadata stripped) are stored. Cards/editor thumbnails use previews;
   case-study galleries keep originals. A missing preview falls back to the original.
   Small files are not upscaled. External links and legacy uploads still work directly;
   this does not proxy arbitrary third-party URLs or retroactively transform old files.
5. **Cleanup:** tracked originals and previews are treated as one upload. Every saved
   draft and every published portfolio is checked, including hidden content and other
   users reusing a public image URL. Removing a reference starts a new 7-day grace
   period. New uploads never saved anywhere have grace from creation. Existing
   untracked files and external URLs are never automatically deleted.

## Required local/production setup

- Apply `20261016000100_drafts_and_upload_lifecycle` before using the updated app:
  confirm the target database in your environment, then run `npx prisma migrate deploy`.
  Docker/Postgres must be running locally. The normal build also deploys migrations.
- Uploads still need `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and the public
  `SUPABASE_PROJECT_IMAGES_BUCKET` (default `project-images`). Keep the existing
  PNG/JPEG/WebP MIME allowlist and 3 MB upload cap. WebP previews use the same bucket.
- Set a strong random `CRON_SECRET` on Vercel. The checked-in schedule calls
  `/api/cron/project-images` daily at 03:00 UTC. No signed-in browser session is required;
  the endpoint requires its own bearer secret. Never expose it in client configuration.
- Keep `PROJECT_UPLOAD_CLEANUP_ENABLED=false` initially. Requests are dry-run until
  you explicitly set it to `true` and redeploy. `?dryRun=1` always overrides real deletion.
  Vercel does not run this schedule through `next dev`; invoke it manually for local checks.

Vercel documents bearer-secret forwarding in its
[cron management guide](https://vercel.com/docs/cron-jobs/manage-cron-jobs).
Storage objects are deleted through the storage API, not by deleting storage SQL rows;
see [Supabase object deletion](https://supabase.com/docs/guides/storage/management/delete-objects).

## Safety and concurrency

- Draft writes use a revision check. The second of two stale tabs cannot overwrite
  the first. On conflict, copy unsynced text before choosing **Reload latest draft**.
  Publishing also checks the revision. A successful publish updates the private baseline.
- If syncing fails, the editor retains its current content, reports failure and offers
  Retry. Browser recovery is best effort: private browsing, storage quota or disabled
  storage can prevent the local copy. Keep the page open until server sync succeeds.
  This also covers failure of the initial recovery request: edits keep an owner-scoped
  local copy even before the server revision is known. Retry fetches the revision without
  reloading or replacing current edits; a different remote baseline blocks overwriting.
  Repeated Publish clicks do not stack identical active error toasts. The draft GET
  returns a friendly 503 on database failure, with technical details logged server-side.
  Missing draft/upload tables require the migration above; Retry cannot create tables.
- Reference updates and cleanup's mark phase share a transaction/advisory lock. Retiring
  uploads are tombstoned before external deletion. Reusing a retired URL is rejected;
  upload a new copy instead. Failed/partial deletion remains retryable, not publishable.
- Cleanup uses only exact registered object paths within the configured bucket and
  storage host. It handles up to 50 upload pairs/run, at most five network requests
  concurrently, and stops starting batches after 45 seconds. Watch `eligible`, `deleted`
  and `failed` counts for backlog or provider failures; pending deletions retry next run.
- SQL registry tombstones are retained. Actual object deletion is permanent; dry-run
  does not delete files or update the unused timestamps. Never shorten grace on production
  data merely to test. Deletion is not triggered directly by the editor's Remove button.

## Manual verification

| Area | Steps | Expected |
| --- | --- | --- |
| Cursor | Move the mouse, stop, hover an input, then enable reduced motion in browser accessibility settings. Try a phone too. | Custom cursor stops when idle; input/touch/reduced-motion interaction uses native behavior. No click particles under reduced motion. |
| Private draft | Publish a baseline. Change name/bio/theme without publishing. Wait for **Draft saved privately**. Reload or leave and return. Open the public page signed out. | Draft recovers in editor; public page still shows the baseline. Only **Publish Changes** changes the live page. |
| Incomplete draft | Clear a required title or enter an unfinished URL. Wait, reload. | Incomplete input recovers, but publishing still rejects invalid content. |
| Conflict | Open two editor tabs at the same draft revision. Save an edit in one, then edit the other. | Second tab shows conflict rather than overwriting the first. Copy unsynced text before reloading. |
| Failure/retry | Temporarily block the draft endpoint using browser network tools, edit, then restore networking and Retry. | Failure is visible; typed content remains and can sync afterward. The public page never receives the failed draft. |
| Initial recovery outage | Block the draft endpoint before entering the editor, edit your name, reload while still blocked, then unblock it and choose Retry. | Local edits return, Publish recognizes the changes, Retry keeps the input intact, and repeated failed Publish attempts do not stack identical active toasts. No client exception overlay. |
| Discard | Edit, wait for autosave, choose Discard in the existing editor actions and confirm. Reload. | Published version is restored, not the discarded private version. |
| Thumbnail | With Storage configured, upload a large screenshot. Inspect the bucket and card's image request; open its case study. | Original and `-preview.webp` exist; card requests preview, gallery requests original. Portrait images remain uncropped. |
| CI | Push only when ready and open the Actions run. | Migration/deployment, schema-drift, unit/integration, production-build and all browser steps execute. New protected tests are not skipped. |
| Cleanup | Invoke the endpoint with its bearer secret and `?dryRun=1`. Check the summary. Use automated disposable-database fixtures to test aging instead of changing live timestamps. | No files deleted in dry-run. Referenced and recent uploads stay protected. |

Example local dry-run after exporting `CRON_SECRET` in your shell:

```sh
curl -H "Authorization: Bearer $CRON_SECRET" \
  'http://localhost:3000/api/cron/project-images?dryRun=1'
```

With Storage unconfigured, the response reports `configured: false`. To test deletion
end-to-end against a real bucket, use a disposable Supabase project and disposable
database—not the production bucket. The automated integration suite mocks provider
deletion and verifies grace, cross-owner references, dry-run, tombstones and retries.

## Automated checks and shared consumers

Run `npm run typecheck`, `npm run lint -- --max-warnings=0`, and `npm run test`.
Database suites require **both** `RUN_DB_TESTS=1` and a `DATABASE_URL` ending in
`/portfolio_verification`; apply migrations to that disposable database first.
Run `npm run test:e2e` locally, or the production-build workflow in CI.

- Cursor components: `src/app/layout.tsx` only; scroll behavior stays native.
- `ProjectImage`: `ProjectCard`, `ProjectsBlockEditor`, case-study gallery. New
  thumbnail prop is optional; gallery behavior remains opt-in through `contain`.
- `ProjectCard`: `Renderer`, `SidebarBlocks`, project archive. Renderer consumers:
  public portfolio, dashboard editor and `DiffViewer`.
- Portfolio store consumers: `src/app/dashboard/edit/page.tsx`,
  `src/app/dashboard/edit/ThemePicker.tsx`, `src/app/dashboard/edit/LayoutPicker.tsx`,
  `src/app/dashboard/BlockEditor.tsx`, `src/components/DashboardHeader.tsx`,
  `src/components/editor/BlockUI.tsx`, `src/components/editor/PublishModal.tsx`,
  `src/components/editor/ResumeParserModal.tsx`,
  `src/components/editor/blocks/ProjectsBlockEditor.tsx`,
  `src/components/editor/blocks/ExperienceBlockEditor.tsx`, and
  `src/components/editor/blocks/EducationBlockEditor.tsx`.
  Existing methods remain available; draft state adds private recovery, not public autosave.
- Draft schema reuses existing block shapes. Image URL validation is unchanged;
  optional `thumbnailUrl` preserves older portfolios.
- Draft-storage consumers: `src/store/usePortfolioStore.ts` and
  `src/app/dashboard/edit/page.tsx`; existing numeric revisions remain supported,
  and an unknown revision now stores its baseline for safe recovery.

Live Supabase deletion and a remote GitHub Actions run require your deployment/configuration.
Local verification must not be described as proof those external services ran.

Verification for this change passed: production build, zero-warning lint, TypeScript,
122 unit/database tests with coverage, and all 28 Chromium browser tests in CI mode
with retries disabled. All 10 migrations were also applied to an empty disposable
database, followed by a no-drift schema comparison. Expected 409 conflict and 503
outage fixtures are checked explicitly; healthy flows have no unexpected browser
errors/warnings or Next.js error overlays.

Separate maintenance item: npm still reports dependency-audit advisories in the
existing dependency tree. This change did not apply unrelated forced/breaking upgrades.
