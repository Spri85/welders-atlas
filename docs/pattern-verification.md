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
