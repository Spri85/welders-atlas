# Pattern verification

## E1 round reducer

Automated checks on 2026-10-30 passed using Node 24.22.1.

- All 46 Vitest tests and the production build passed.
- Browser downloads on port 4200 produced six-page A4 Ukrainian and US Letter English PDFs for the 200 / 100 / 150 mm reducer.
- Reopened PDFs have the requested physical page sizes and `PrintScaling=None`.
- The serialized reference line measures 50 mm. All serialized outline vertices align across horizontal and vertical tile boundaries after accounting for the 10 mm overlap.
- Rendered PDF pages were inspected for readable Cyrillic, labels, alignment crosses and unclipped instructions.
- Arc chords deviate from the calculated circular outline by at most 0.01 mm.

Physical verification is pending. Print at 100% with page fitting disabled, measure the reference line, assemble the tiles and roll a paper sample to verify both nominal openings. These templates are physically unverified until that check is recorded.

## G2 square-to-round transition

- All 57 tests and the production build passed after the shared preview and export-dialog changes.
- Every edge of all five developed triangles matches its corresponding 3D edge, including a shallow transition and a tall transition.
- Four rotated copies share their square corners and rim endpoints. The rim is explicitly a 16-sided approximation of the specified round diameter.
- Browser checks covered keyboard rotation and view switching, unit changes, invalid-input hiding, and the phone layout.
- A downloaded two-page A4 panel PDF contains fold marks, seam labels, the 16-facet designation and the instruction to cut four identical panels. The rendered page was inspected.
- Export settings open in a modal dialog. Escape closes it and restores focus to the download button.

Physical assembly and fabrication checks remain pending.

## G3 branch saddle and final integration

- All 67 tests and the production build passed on Node 24.22.1.
- A 60 mm branch on a 100 mm main produces a 10.00 mm notch depth and a 188.50 mm wrap. The sampled intersection lies on both cylinder surfaces.
- Equal diameters are supported. Oversized, non-positive and non-finite diameters are rejected. Wrap seam endpoints meet.
- The wrap samples the profile at 0.5 degree intervals, includes quarter-turn marks and has a 20 mm reference band for tracing. Branch length is selected separately.
- Browser checks covered unit round trips, equal and oversized branches, hidden stale results, keyboard view switching, desktop and phone layouts, all three languages and a successful wrap PDF download.
- The downloaded two-page A4 wrap PDF was reopened and rendered. Quarter marks, reference-band instructions and the physical-verification status were checked.
- The top action selector shows one calculator at a time. Switching among all three tools, keyboard selection and PDF export were verified at port 4200.

Physical pipe fitting and printed-template scale checks remain pending.

## Complete flat-outline dimensions

- All 71 tests and the production build passed on Node 24.22.1.
- Square-to-round drawings label seven vertices. The measurement table includes all seven cut edges, four fold lines, overall width and height, and all seven vertex coordinates relative to the lower-left bounds corner.
- Shared measurement data drives the preview tables and PDF reference sheets. Reducer details include both arc lengths and radii, seam length and sweep. Saddle details include wrap length, quarter spacing, notch depth, reference-band height and quarter-turn profile coordinates.
- Browser checks verified the complete panel tables, millimetre/inch switching and the 375 px phone layout.
- Downloaded English Letter panel, Ukrainian A4 reducer and Russian A4 saddle PDFs were reopened and checked for localized reference values, page sizes, print preferences and a 50 mm scale line on their full-size tiles. Rendered reference and tile pages were inspected.
- Each PDF now includes one dimension reference sheet before the tiles. The default samples have three panel pages, seven reducer pages and three saddle pages in total.

Physical verification remains pending.

## Manual saddle marking guide

- All 75 tests and the production build passed on Node 24.22.1.
- Heights are measured down from the top reference edge. A labels 0°, 180° and 360°; B labels 90° and 270°. For the 100 / 60 mm case, A is 20 mm and B is 30 mm. Equal 100 mm diameters give B = 70 mm.
- The coordinate table uses the top-left datum and provides 25 absolute X/Y marking positions at 15° intervals. Square-to-round coordinates retain their lower-left datum.
- Browser checks verified all five A/B numeric labels, inch conversion, all 25 table rows and the phone layout. Geometry and component tests verify updates after diameter edits.
- A US Letter PDF was downloaded, reopened and rendered. Its reference sheet contains every marking station and top-datum instructions; the pattern tiles contain all A/B labels and values. Reference sheets paginate when needed.

Physical marking and fitting checks remain pending.
