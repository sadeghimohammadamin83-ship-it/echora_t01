# Site Analysis — Faculty of Physical Education, Tehran

Two views of the same project, no build step:
- `index.html` — **scroll atlas** (main): 23 sections, fixed index rail, sticky map narratives, GIS layers, 3D model, DEM terrain, wind regimes, analysis atlas.
- `presentation.html` — fullscreen Persian slide version (18 slides).
Single offline files: `../export/Site_Analysis_PE_Faculty_Tehran.html` (atlas) and `…_slides.html`.

## Pipelines (`tools/`)
- `prepare.py` — geometry, land use, optimised photos (from the v1 project).
- `imagery.py` — Google context image: georeferenced (5 control points, ≈5 m), labels removed (inpaint), upscaled, graded to a monochrome base; canopy extracted from Google + aerial → stipple layer and 3D tree points.
- `dem.py` — SRTM 30 m (AWS Terrain Tiles): roofs/canopy filtered out → ground surface → hypsometry, hillshade, slope, aspect, 5 m / 1 m contours, A–B section, 3D grid.
- `export.py [page]` — single-file offline HTML. `pdf.js` — PDF of the slide version.

## Code
`js/core/sa.js` helpers · `js/components/components.js` MapViewer, LayerControl (toggle + opacity), Tooltip, ImageViewer, Navigation, Scrolly ·
`js/core/draw.js` linework & site envelope · `js/core/atlas.js` imagery base, drawing sheets, coordinate ticks, annotations, zoom-in entrances ·
`js/sections/*.js` one builder per section (`model3d.js` uses the vendored Three.js r147, MIT, `js/vendor/`).
