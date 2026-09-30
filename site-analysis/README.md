# تحلیل سایت و استراتژی طراحی — دانشکده تربیت بدنی دانشگاه تهران

Fullscreen Persian (RTL) presentation: start slide + 18 slides + appendix. One slide at a time, no scrolling.
Open `index.html`, or the single offline file `../export/Site_Analysis_PE_Faculty_Tehran.html`.

- Navigation: → / Space / PageDown = next, ← / PageUp = previous, Home/End, swipe on touch; the thin «فهرست» tab on the right opens the slide list; Esc closes the menu / image viewer.
- 1600×900 canvas scaled to the window (`js/deck.js`).
- `js/core/draw.js` — cartography: simplified four-sided site envelope, street hierarchy in px (user colour code kept), chevrons, markers.
- `js/slides/*.js` — one builder per slide; `js/components/components.js` — MapViewer, Tooltip, ImageViewer, Legend, Donut.
- Field photos are shown at their original aspect ratio (object-fit: contain, never cropped).
- `tools/prepare.py` regenerates data/images from the v1 sources; `tools/export.py` builds the single-file export.
