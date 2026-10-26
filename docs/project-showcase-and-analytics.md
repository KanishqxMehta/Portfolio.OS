# Project showcase and visitor actions

## Editor

Expand **Screenshots** on a project. Add up to 8 HTTP/HTTPS
image URLs, or upload PNG/JPEG/WebP files up to 3 MB each. The first image is the
cover; **Make cover** changes it. Captions also provide accessible image descriptions.
Card covers use a 16:10 frame (recommended 1600 × 1000 px), start edge-to-edge
at the top and fade into the card background. Landscape images fill the frame;
portrait/mobile images are contained without cropping or stretching. For larger
mobile previews, use a 16:10 composition with multiple phone screens side by side.
Case-study gallery images remain uncropped and do not use the cover fade.
Project-card descriptions are clamped to three lines with overflow hidden;
the full description is preserved on the case-study page.
Photo cards place their live-link control and project number in the top corners,
using white content on dark backplates plus a subtle black top scrim for contrast
on light, dark and mixed images.
All main layouts and the archive now render the same `ProjectCard` component.
Projects without screenshots use a built-in, theme-aware browser/code illustration
in the same 16:10 cover frame, keeping titles aligned in mixed rows. Cards stretch
to a shared row height on desktop without forcing heights in the mobile stack. Unreadable
cover images use the same fallback; editor thumbnails and case-study galleries
keep their existing behavior. The decorative fallback needs no upload or remote request.
The content order, left inset, title/description typography, spacing and action
control dimensions are identical for image and text-only cards. Image covers
are optional; they do not change the body layout. Controls include their own
border/radius styling and no longer rely on CSS injected by the main renderer.
Optional case-study sections are problem, role, approach, challenges and results.
Add a source-code URL separately from the live-project URL.

Use **Enable case study**, then **Edit case study** to write it. Individual
sections expand one at a time to keep the editor short. A public case-study link
and page require at least one non-blank written section and must not be toggled
off. Turning the toggle off preserves the writing. Previously written studies
without an explicit toggle value remain enabled; empty legacy projects have no
case-study page. Screenshots alone do not enable a case study.

Tags and year appear on the main cards in every layout, as well as the archive.
Image rows are collapsed by default; open a row to edit its URL/caption, make it
the cover, or remove it. Publish removals to update the public portfolio.

Publish to make these changes public. Existing projects need no migration of
their content. The main page still shows at most four projects; the archive and
case-study pages respect both section and individual-project visibility.

The Hero editor also accepts an optional public resume PDF URL. This is a link,
not an automatic PDF export or file download.

## Supabase Storage setup

1. In Supabase Storage, create a **public** bucket named `project-images` (or set
   `SUPABASE_PROJECT_IMAGES_BUCKET` to your bucket name).
2. Set its allowed MIME types to `image/png`, `image/jpeg`, `image/webp` and its
   maximum file size to 3 MB. These files are intentionally publicly readable.
3. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and optionally
   `SUPABASE_PROJECT_IMAGES_BUCKET` in local server configuration and Vercel.
   Never use a `NEXT_PUBLIC_` prefix for the service-role key. Redeploy after
   changing environment variables.
4. Do not add public write policies: authenticated application requests are
   checked by the server before its server-only credential performs the upload.

Uploads use random, non-overwriting object names within a hashed owner folder,
check file signatures, reject SVG, and allow at most 30 attempts per user/hour.
Image links work even when storage is unconfigured. Storage failures show a
friendly message; provider details stay in server logs.

Removing an image changes the private draft first; publish to remove it publicly.
New uploads are tracked and eligible for scheduled cleanup after at least 7 days
unused by every saved draft and published portfolio. Cleanup defaults to dry-run
and needs explicit enablement. Legacy untracked uploads are not deleted.
Uploading before publishing still makes the file public by URL. See
[editor reliability and storage](./editor-reliability-and-storage.md) for setup,
safety rules and verification. New uploads also generate a proportional WebP
preview for cards; galleries keep the original image.

References: [Supabase standard uploads](https://supabase.com/docs/guides/storage/uploads/standard-uploads)
and [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).

## Analytics

Run the new Prisma migration before serving these changes. The normal build
script includes `prisma migrate deploy`; it must target the intended database.

The existing Analytics page shows visitor action totals and the five most-clicked
projects, filtered by the existing date picker. Data starts at deployment; it
cannot reconstruct earlier clicks. Metrics count link clicks, not unique people,
completed downloads or sent messages. Owner clicks while signed in are ignored.

The action endpoint validates against current visible published content, rate
limits requests and deduplicates retried event IDs. The client suppresses rapid
duplicate clicks and respects Do Not Track. Session identifiers are stored only
as portfolio-scoped hashes; no destination URLs or raw IP addresses are stored
in action records. Browser blocking, disabled JavaScript and network loss can
reduce measured counts. This is best-effort analytics, not an audit log.

## Manual checks

1. Edit a project: add image URL/upload, caption, source URL and case study; publish.
2. Open the public portfolio signed out: check the cover and **View case study**.
   Check the archive and the detail page on mobile too.
3. Click a live/source link, social link, contact link and View resume (if set).
   Sign back in and open Analytics: the corresponding totals should increase.
4. Repeat while signed in as the portfolio owner: totals should not increase.
5. Hide a project or the entire Projects section and publish: its direct detail
   URL must return not found and its actions must be rejected.
6. Try an invalid image type or a file over 3 MB. Expect a friendly validation
   message. With storage unconfigured, expect the image-link fallback message.
7. Verify previous project-only portfolios and all four layouts still render.

## Shared-component compatibility

- `src/components/portfolio/Renderer.tsx` is imported by
  `src/app/p/[slug]/page.tsx`, `src/app/dashboard/edit/page.tsx`, and
  `src/components/editor/DiffViewer.tsx`. Its props are unchanged; case-study
  navigation appears only when the existing public archive URL is supplied.
- `src/components/portfolio/SidebarBlocks.tsx` is imported only by the renderer;
  screenshots and case-study links follow the same optional-data behavior.
- `src/components/portfolio/ProjectMetadata.tsx` is imported by `ProjectCard.tsx`
  and the case-study page so tags/year stay consistent.
  Case-study publication is checked in `src/lib/project-collection.ts` and reused
  by those views and `src/lib/engagement.ts` (both tracker and server endpoint).
- `src/components/portfolio/ProjectCard.tsx` is imported by `Renderer.tsx`, `SidebarBlocks.tsx`,
  and `src/app/p/[slug]/projects/page.tsx`. It reuses `ProjectCardActions.tsx`, `ProjectImage.tsx` and
  `ProjectMetadata.tsx`. Image and metadata components also retain their separate
  case-study/editor consumers; the cover presentation remains opt-in.
- `src/components/editor/blocks/HeroBlockEditor.tsx` and
  `src/components/editor/blocks/ProjectsBlockEditor.tsx` are imported only by
  `src/app/dashboard/BlockEditor.tsx`. Their external props are unchanged.
- `src/components/portfolio/ViewTracker.tsx` is imported only by the public main
  page; it remains once-per-slug and is not mounted by editor or diff previews.
- `src/app/dashboard/analytics/AnalyticsDashboardClient.tsx` is imported only by
  its server page. `AnalyticsChart.tsx` is imported by `ChartWrapper.tsx`, which
  is imported only by the dashboard client; the fixed 400px chart height is
  preserved while its width remains responsive.

Type checks cover these consumers. Browser checks cover classic, bento, sidebar
and terminal public renderers, the archive, mobile case studies, owner editor
publishing and analytics, with no unexpected console errors/warnings or overlays.
