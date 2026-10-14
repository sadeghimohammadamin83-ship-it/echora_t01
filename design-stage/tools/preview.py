"""Render the DXF (whole sheet and a zoom on the site) with ezdxf's drawing add-on — an independent re-read of the file."""
import sys, os, ezdxf, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
from ezdxf.addons.drawing import RenderContext, Frontend
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
from ezdxf.addons.drawing.config import Configuration, BackgroundPolicy, LineweightPolicy
src, out = sys.argv[1], sys.argv[2]
d = ezdxf.readfile(src)
for name, lim, dpi, size in [('full', None, 110, (20, 14)), ('site', (225, 420, 195, 395), 130, (14, 14))]:
    fig = plt.figure(figsize=size); ax = fig.add_axes([0, 0, 1, 1])
    cfg = Configuration(background_policy=BackgroundPolicy.WHITE, lineweight_policy=LineweightPolicy.RELATIVE, lineweight_scaling=0.6)
    Frontend(RenderContext(d), MatplotlibBackend(ax), config=cfg).draw_layout(d.modelspace(), finalize=True)
    if lim: ax.set_adjustable('box'); ax.set_aspect('equal'); ax.set_xlim(lim[0], lim[1]); ax.set_ylim(lim[2], lim[3])
    fig.savefig(f'{out}_{name}.png', dpi=dpi); plt.close(fig)
print('ok')
