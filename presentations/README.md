# Design 4 — Sports Facilities & Physical Education Faculty

| File | Contents |
|---|---|
| `01_Architectural_Standards_Sports_PE_Faculty.pptx` | 14 slides. Standards study: basketball & volleyball (court, spectators, athletes, changing, support), circulation, PE-faculty spaces, WC/accessibility, Iranian vs international comparison, references. |
| `02_Case_Studies_APSC_and_Charles_University.pptx` | 23 slides. Precedent analysis: Anna Pao Sohmen Centre (primary, built from the uploaded drawing set) and FTVS Charles University, comparison, design lessons, references. |

Every dimension on a slide carries its source line; values that could not be verified are shown in red or tagged.

## Rebuild
```
cd src && npm install && ./build.sh deckA_standards.js 01_Architectural_Standards_Sports_PE_Faculty.pptx
./build.sh deckB_casestudies.js 02_Case_Studies_APSC_and_Charles_University.pptx
```
`build.sh` needs the pptx skill path in `PPTX_SKILL` (for theme + validation). Images in `src/img` are crops of the uploaded scan.
