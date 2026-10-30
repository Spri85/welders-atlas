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

## Square-to-round manual construction guides

- All 76 tests and the production build passed on Node 24.22.1.
- M is the midpoint of baseline 1–2. The centerline M–5 has dimension h. The horizontal 3–7 span is centered over M at height H.
- The default 200 / 100 / 150 mm panel gives h = 158.11 mm and 3–7 = 76.65 mm, calculated before display rounding. M is included in the coordinate table.
- Construction guides use a blue dash-dot style in the preview and PDF. The seven cutting edges and four fold lines retain their geometry. Translated instructions explain the marking sequence and the cutting path through 3–4–5–6–7.
- Browser checks covered guide labels, millimetre/inch conversion and the phone layout. The downloaded Letter PDF was reopened and rendered, and its serialized guide lengths and line style were checked.

Physical metal marking and fitting remain pending.

## Shared on-screen measurement tooltips

- All 77 tests and the production build passed on Node 24.22.1.
- On-screen drawings display identifiers, with numeric values in the tables and hover/focus tooltips. This applies to reducers, square-to-round panels and saddles.
- Browser checks verified hover, keyboard focus and Escape dismissal for all three calculator types. The directive also removes active tooltips when their calculator is destroyed.

## G4 two-piece mitered corner

- All 85 tests and the production build passed on Node 24.22.1.
- The 60 mm / 60° worked example returns 30° off square, 34.64 mm rise and 188.50 mm wrap. Tests cover quarter rises, wrap closure, a 90° corner and invalid angle endpoints.
- Browser checks covered reference values, identifier tooltips, the phone layout, successful PDF download and disabled export after invalid input.
- The three-page A4 PDF was reopened and rendered. It includes the reference sheet, cut profile, square datum and instruction to mark two pieces.

Physical print and assembly checks remain pending.

## G5 two-elbow pipe offset

- All 89 tests and the production build passed.
- The worked example returns 212.13 mm center travel, 150 mm advance and 142.13 mm straight cut. Tests cover zero straight, overlap and a rejected zero-degree angle.
- Browser checks verified the worked result, a zero-straight job, a 1 mm overlap warning and removal of stale geometry after invalid input.

## G6 rectangular frame

- All 93 tests and the production build passed on Node 24.22.1.
- Tests cover butt cuts, per-end clearance, miter long/short points, measured diagonals and invalid openings.
- Browser checks verified 536 mm uprights with 2 mm end gaps, 740 mm miter short points, a 4 mm measured diagonal difference and the phone layout.

## G7 equal gate bar spacing

- All 97 tests and the production build passed.
- Tests verify the five-bar example, single centered bar, unrounded fractional gaps and rejected counts/openings.
- Browser checks verified changed marks, numeric keyboard-focus tooltips and phone layout.

## G8 straight stock cutting planner

- All 103 tests and the production build passed.
- Tests cover kerf/trim conservation, exact consumption, reusable offcuts, deterministic opened-bar ties, incompatible profiles, unavailable pieces and invalid quantities.
- Browser checks verified editing the suggested plan, preserving the job in inches, phone layout and clearing invalid results.

## G9 bolt-circle drilling template

- All 107 tests and the production build passed.
- Tests cover center-origin XY coordinates, angular/chord spacing, rotation, wraparound and invalid hole patterns.
- Browser checks verified rotated coordinate tooltips, phone layout, PDF download and invalid export disabling. The two-page A4 PDF was reopened and rendered; label placement was corrected after visual inspection.

Physical drilling-template registration and scale checks remain pending.

## G10 equal-leg fillet filler estimate

- All 111 tests and the production build passed.
- Tests cover deposited/consumable mass, unrounded batch scaling, full efficiency, invalid assumptions and omitted versus zero price.
- Browser checks verified batch edits, zero cost, leg-size tooltips and phone layout.

## G11 angled pipe opening

- All 115 tests and the production build passed.
- Tests cover axes/shift, a normal passage, all datum directions, mirrored far-face coordinates and excluded tilt inputs.
- Browser checks verified dimensions, direction changes, section/face views, phone layout and two PDF downloads. Both two-page A4 files were reopened; the far-face template was rendered. Flip instructions retain the printed side visible after flipping about datum A.

Physical front/far registration after flipping remains pending.

## G12 press-brake bracket blank

- All 119 tests and the production build passed.
- Tests cover the worked allowance/deduction/blank, exact measured-mode equivalence, zero inside radius, minimum flange and invalid allowances.
- Browser checks verified method switching, displayed blank/centerline, invalid-result clearing and phone layout.

Shop coupon verification for material and tooling remains pending.

## G13 segmented round elbow

- All 123 tests and the production build passed without warnings.
- Tests compare every joint at 361 circumferential stations, verify the 30°/15° worked angles, inside/outside lengths, end geometry, radius scaling and invalid inputs.
- Browser checks verified radius tooltips, the numbered middle-piece PDF, phone layout and invalid-piece clearing. The three-page PDF was reopened and rendered.
- The gore construction follows [Brian Coey’s Round Elbow development](https://pressbooks.bccampus.ca/pressbookbccampussmlt1/chapter/round-elbow/), with one gore per end and two per middle piece. The tangent geometry and coordinate checks are derived in the calculation/tests.

Physical assembly, fit and print-scale checks remain pending.
