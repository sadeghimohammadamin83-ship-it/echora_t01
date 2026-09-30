"""Bundle a page + css/js/fonts/images into ONE offline HTML file.
  python3 tools/export.py                    → index.html (scroll atlas)   → ../export/Site_Analysis_PE_Faculty_Tehran.html
  python3 tools/export.py presentation.html  → fullscreen slide version    → ../export/Site_Analysis_PE_Faculty_Tehran_slides.html
Images are embedded as data URIs; large photos are re-encoded (≤1100 px, JPEG q70) — never cropped."""
import base64, glob, io, json, os, re, sys
from PIL import Image
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
def b64(p, mime): return 'data:%s;base64,%s' % (mime, base64.b64encode(open(p, 'rb').read()).decode())
SRC = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
OUT = '../export/Site_Analysis_PE_Faculty_Tehran' + ('_slides' if 'presentation' in SRC else '') + '.html'
imgs = {}
for p in sorted(glob.glob('img/**/*.*', recursive=True)):
    if 'presentation' in SRC and p.startswith('img/layers/'): continue   # the slide version uses no imagery layers
    ext = p.rsplit('.', 1)[-1].lower()
    if ext == 'jpg':
        if 'google_context' in p: continue
        if p.startswith('img/layers/s2_'):          # Sentinel bases: keep their full resolution
            imgs[p] = b64(p, 'image/jpeg'); continue
        im = Image.open(p).convert('RGB')
        if p.startswith('img/photos/') or p.startswith('img/source/IMG'): im.thumbnail((1100, 1100))
        buf = io.BytesIO(); im.save(buf, 'JPEG', quality=70 if not p.startswith('img/layers/') else 82, optimize=True, progressive=True)
        imgs[p] = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
    elif ext == 'png' and p.startswith('img/layers/'):
        imgs[p] = b64(p, 'image/png')
html = open(SRC, encoding='utf8').read()
def css(m):
    c = open(m.group(1), encoding='utf8').read()
    return '<style>\n' + re.sub(r'url\("\.\./(fonts/[^"]+)"\)', lambda f: 'url("%s")' % b64(f.group(1), 'font/woff2'), c) + '\n</style>'
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css, html)
html = re.sub(r'<link rel="preload"[^>]*>\n?', '', html)
hook = '''<script>/* offline bundle: resolve img/... paths to embedded data URIs */
window.SA_B64=%s;(function(){var M=window.SA_B64,f=function(v){return typeof v==='string'&&M[v]?M[v]:v};
var d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{get:d.get,set:function(v){d.set.call(this,f(v))}});
var sa=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){return sa.call(this,n,(n==='src'||n==='href')?f(v):v)};
var fix=function(n){if(n.nodeType!==1)return;(n.tagName==='IMG'?[n]:[]).concat([].slice.call(n.querySelectorAll?n.querySelectorAll('img'):[])).forEach(function(i){var s=i.getAttribute('src');if(M[s])sa.call(i,'src',M[s])})};
new MutationObserver(function(r){r.forEach(function(x){x.addedNodes.forEach(fix)})}).observe(document.documentElement,{childList:true,subtree:true});})();</script>''' % json.dumps(imgs)
html = re.sub(r'<script src="([^"]+)"></script>', lambda m: '<script>\n' + open(m.group(1), encoding='utf8').read().replace('</script', '<\\/script') + '\n</script>', html)
html = re.sub(r'(<body[^>]*>)', lambda m: m.group(1) + '\n' + hook, html, count=1)
os.makedirs('../export', exist_ok=True)
out = OUT
open(out, 'w', encoding='utf8').write(html)
print(out, round(os.path.getsize(out) / 1e6, 1), 'MB')
