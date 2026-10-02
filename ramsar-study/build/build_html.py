# -*- coding: utf-8 -*-
"""Build the Persian (RTL) study report report.html from data.py."""
import html
import os

import data as D

OUT = os.path.join(os.path.dirname(__file__), "..", "report.html")
E = html.escape


def q(code):
    e, name, _ = D.Q[code]
    return f'<span class="q q-{code}" title="{name}">{e} {name}</span>'


def src(s):
    return " ".join(f'<a class="ref" href="#src-{x.strip()}">{x.strip()}</a>' for x in str(s).split(";") if x.strip() and x.strip() not in ("—",))


def table(headers, rows, cls=""):
    h = "".join(f"<th>{E(x)}</th>" for x in headers)
    body = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows)
    return f'<div class="tw"><table class="{cls}"><thead><tr>{h}</tr></thead><tbody>{body}</tbody></table></div>'


def fmt(n):
    return f"{n:,}" if isinstance(n, int) else (E(str(n)) if n is not None else "—")


# ------------------------------------------------------------------ charts (SVG, to scale)
def pop_chart():
    rows = [r for r in D.POP if r[1] == "City" and r[2]]
    W, H, L, B, T = 560, 260, 70, 40, 30
    maxv = 40000
    bw = 90
    gap = (W - L - 20 - bw * len(rows)) / (len(rows))
    out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="جمعیت شهر رامسر در سرشماری‌ها" class="chart" direction="ltr">']
    for t in range(0, maxv + 1, 10000):
        y = H - B - (H - B - T) * t / maxv
        out.append(f'<line x1="{L}" x2="{W-10}" y1="{y:.1f}" y2="{y:.1f}" class="grid"/>'
                   f'<text x="{L-8}" y="{y+4:.1f}" class="ax" text-anchor="end">{t:,}</text>')
    for i, r in enumerate(rows):
        x = L + gap / 2 + i * (bw + gap)
        h = (H - B - T) * r[2] / maxv
        y = H - B - h
        out.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{bw}" height="{h:.1f}" class="bar"/>'
                   f'<text x="{x+bw/2:.1f}" y="{y-8:.1f}" class="val" text-anchor="middle">{r[2]:,}</text>'
                   f'<text x="{x+bw/2:.1f}" y="{H-B+18:.1f}" class="ax" text-anchor="middle">{r[0]}</text>')
        if r[5] is not None:
            out.append(f'<text x="{x+bw/2:.1f}" y="{y+18:.1f}" class="inbar" text-anchor="middle">+{r[5]}%/yr</text>')
    out.append(f'<text x="{L-8}" y="{T-12}" class="ax" text-anchor="end">نفر</text></svg>')
    return "".join(out)


def green_chart():
    items = [("باغ ملی 30 ha", 8.33), ("باغ ملی 33 ha", 9.17), ("+ باغ کاخ (30+6)", 10.0), ("+ باغ کاخ (33+6)", 10.83),
             ("سناریو 1405 بالا (30 ha)", 6.71), ("سناریو 1405 پایین (30 ha)", 7.33)]
    W, H, L, R, T = 620, 300, 190, 30, 20
    maxv = 14
    rowh = (H - T - 30) / len(items)
    sx = lambda v: L + (W - L - R) * v / maxv
    out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="سرانه فضای سبز در برابر استاندارد" class="chart" direction="ltr">',
           f'<rect x="{sx(7):.1f}" y="{T}" width="{sx(12)-sx(7):.1f}" height="{H-T-30}" class="band"/>',
           f'<text x="{(sx(7)+sx(12))/2:.1f}" y="{T+12}" class="ax" text-anchor="middle">استاندارد 7–12 m²</text>']
    for t in range(0, maxv + 1, 2):
        out.append(f'<line x1="{sx(t):.1f}" x2="{sx(t):.1f}" y1="{T}" y2="{H-30}" class="grid"/>'
                   f'<text x="{sx(t):.1f}" y="{H-12}" class="ax" text-anchor="middle">{t}</text>')
    for i, (lab, v) in enumerate(items):
        y = T + 18 + i * rowh
        cls = "bar2" if "سناریو" in lab else "bar"
        out.append(f'<text x="{L-8}" y="{y+rowh/2:.1f}" class="ax" text-anchor="end">{E(lab)}</text>'
                   f'<rect x="{L}" y="{y+4:.1f}" width="{sx(v)-L:.1f}" height="{rowh-12:.1f}" class="{cls}"/>'
                   f'<text x="{sx(v)+6:.1f}" y="{y+rowh/2:.1f}" class="val">{v}</text>')
    out.append("</svg>")
    return "".join(out)


def profile_chart():
    # distance from coast (km) vs elevation (m) — P02 profile A–B; sea level 2025 from N21
    pts = [(0, -29), (2.62, 100), (6.37, 500), (9.76, 1000), (15.55, 2000), (32.46, 3000)]
    W, H, L, B, T, R = 640, 280, 60, 40, 20, 20
    sx = lambda d: L + (W - L - R) * d / 34
    sy = lambda z: H - B - (H - B - T) * (z + 100) / 3200
    out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="نیمرخ ساحل تا کوه" class="chart" direction="ltr">']
    for z in range(0, 3001, 1000):
        out.append(f'<line x1="{L}" x2="{W-R}" y1="{sy(z):.1f}" y2="{sy(z):.1f}" class="grid"/>'
                   f'<text x="{L-6}" y="{sy(z)+4:.1f}" class="ax" text-anchor="end">{z} m</text>')
    for d in range(0, 35, 5):
        out.append(f'<text x="{sx(d):.1f}" y="{H-B+18}" class="ax" text-anchor="middle">{d} km</text>')
    poly = " ".join(f"{sx(d):.1f},{sy(z):.1f}" for d, z in pts)
    area = f"{sx(0):.1f},{sy(-100):.1f} " + poly + f" {sx(32.46):.1f},{sy(-100):.1f}"
    out.append(f'<polygon points="{area}" class="terrain"/><polyline points="{poly}" class="tline"/>')
    out.append(f'<rect x="{sx(0):.1f}" y="{sy(100):.1f}" width="{sx(2.62)-sx(0):.1f}" height="{sy(-100)-sy(100):.1f}" class="cityband"/>'
               f'<text x="{sx(2.62)+4:.1f}" y="{sy(100)-34:.1f}" class="val">جلگه و شهر (0–2.6 km)</text>')
    for d, z in pts:
        out.append(f'<circle cx="{sx(d):.1f}" cy="{sy(z):.1f}" r="3.5" class="dot"/>')
    out.append(f'<text x="{sx(15.55)+8:.1f}" y="{sy(2000)+18:.1f}" class="ax">2000 m @ 15.55 km</text>'
               f'<text x="{sx(2.62)+6:.1f}" y="{sy(100)+14:.1f}" class="ax">100 m @ 2.62 km</text></svg>')
    return "".join(out)


def lynch_diagram():
    # schematic only — not to scale
    return '''<svg viewBox="0 0 640 330" class="diagram" role="img" aria-label="دیاگرام شماتیک خوانایی رامسر" direction="ltr">
<rect x="0" y="0" width="640" height="60" class="sea"/><text x="320" y="36" class="dlab" text-anchor="middle">دریای خزر (Edge)</text>
<path d="M0 60 C120 72 260 56 400 66 S560 58 640 64" class="coastline"/>
<rect x="0" y="250" width="640" height="80" class="forest"/><text x="320" y="300" class="dlab" text-anchor="middle">جنگل هیرکانی و دامنه البرز (Edge)</text>
<line x1="10" y1="150" x2="630" y2="150" class="path-main"/><text x="200" y="140" class="dsm">جاده ساحلی (Path)</text>
<line x1="330" y1="66" x2="330" y2="250" class="path-axis"/><text x="338" y="110" class="dsm">بلوار معلم ≈ 2 km (Path)</text>
<rect x="390" y="165" width="130" height="55" class="airport"/><text x="455" y="197" class="dsm" text-anchor="middle">فرودگاه (Edge داخلی)</text>
<circle cx="330" cy="150" r="13" class="node"/><text x="345" y="172" class="dsm">گره معلم/ساحلی</text>
<circle cx="70" cy="150" r="10" class="node"/><text x="60" y="176" class="dsm" text-anchor="middle">ورودی غرب</text>
<circle cx="615" cy="150" r="10" class="node"/><text x="628" y="178" class="dsm" text-anchor="end">ورودی شرق</text>
<rect x="318" y="228" width="24" height="18" class="lm"/><text x="300" y="242" class="dsm" text-anchor="end">هتل قدیم</text>
<rect x="250" y="196" width="22" height="18" class="lm"/><text x="244" y="210" class="dsm" text-anchor="end">کاخ‌موزه</text>
<rect x="150" y="180" width="70" height="40" class="park"/><text x="185" y="236" class="dsm" text-anchor="middle">باغ ملی 30–33 ha</text>
<line x1="545" y1="66" x2="570" y2="250" class="cable"/><text x="578" y="232" class="dsm">تله‌کابین</text>
<text x="630" y="322" class="note" text-anchor="end">شماتیک — بدون مقیاس؛ موقعیت نسبی از منابع N03, N08–N10, N33, P02</text>
</svg>'''


def chain_diagram(items, cls="chain"):
    return '<ol class="%s">' % cls + "".join(f"<li><b>{E(a)}</b><span>{E(b)}</span></li>" for a, b in items) + "</ol>"


def a2_sheets():
    out = ['<div class="sheets">']
    for code, title, panels in D.SHEETS:
        cells = "".join(f'<div class="pnl">{E(p)}</div>' for p in panels)
        out.append(f'<figure class="a2"><figcaption><b>{code}</b> | {E(title)} <span>A2 افقی 594×420 mm</span></figcaption>'
                   f'<div class="a2g">{cells}</div></figure>')
    out.append("</div>")
    return "".join(out)


# ------------------------------------------------------------------ page
CSS = """
/* layout: right-hand table of contents + long reading column; tables scroll in their own frame */
:root{
  --paper:#f2f5f3; --surface:#ffffff; --ink:#17282c; --muted:#56696c; --rule:#cdd8d6;
  --caspian:#0d6672; --forest:#2e5a3c; --sand:#c9a96a; --warn:#b4462c;
  --q-OFF:#d6efd9; --q-CAL:#dbe8f6; --q-SEC:#fbf0c9; --q-EST:#fbe0cf; --q-CON:#f6c9c0; --q-GAP:#e6e6e6; --q-ink:#17282c;
  --display:"Noto Naskh Arabic","Vazirmatn",serif; --body:"Vazirmatn",Tahoma,sans-serif; --mono:"IBM Plex Mono",ui-monospace,monospace;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  --paper:#0f1a1c; --surface:#16252a; --ink:#e3ecea; --muted:#9fb3b3; --rule:#2c4046;
  --caspian:#5fc0cb; --forest:#8cc79c; --sand:#d8bd84; --warn:#ee8a6f;
  --q-OFF:#1f4a2a; --q-CAL:#1d3a57; --q-SEC:#4d4320; --q-EST:#55341f; --q-CON:#5c2a22; --q-GAP:#33393a; --q-ink:#e3ecea; color-scheme:dark}}
:root[data-theme="dark"]{
  --paper:#0f1a1c; --surface:#16252a; --ink:#e3ecea; --muted:#9fb3b3; --rule:#2c4046;
  --caspian:#5fc0cb; --forest:#8cc79c; --sand:#d8bd84; --warn:#ee8a6f;
  --q-OFF:#1f4a2a; --q-CAL:#1d3a57; --q-SEC:#4d4320; --q-EST:#55341f; --q-CON:#5c2a22; --q-GAP:#33393a; --q-ink:#e3ecea; color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--paper);color:var(--ink);font-family:var(--body);font-size:15px;line-height:1.85;margin:0}
.wrap{display:grid;grid-template-columns:240px minmax(0,1fr);gap:40px;max-width:1280px;margin:0 auto;padding-inline:24px;padding-block:28px 80px}
nav.toc{position:sticky;top:calc(env(safe-area-inset-top,0px) + 16px);align-self:start;max-height:calc(100vh - 32px);overflow:auto;font-size:13px;border-inline-start:2px solid var(--rule);padding-inline-start:14px}
nav.toc a{display:block;color:var(--muted);text-decoration:none;padding-block:3px}
nav.toc a:hover,nav.toc a:focus-visible{color:var(--caspian)}
main{min-width:0}
header.cover{border-bottom:3px double var(--rule);padding-block:8px 24px;margin-bottom:28px}
.eyebrow{font-size:12px;letter-spacing:.06em;color:var(--caspian);font-weight:600}
h1{font-family:var(--display);font-size:clamp(28px,4.4vw,44px);line-height:1.3;margin:6px 0 10px;text-wrap:balance}
h2{font-family:var(--display);font-size:26px;margin:56px 0 12px;padding-top:12px;border-top:1px solid var(--rule);text-wrap:balance}
h3{font-size:17px;margin:28px 0 8px;color:var(--forest)}
p,li{max-width:72ch}
.meta{color:var(--muted);font-size:13.5px}
.chainbar{display:flex;flex-wrap:wrap;gap:6px;margin-top:16px;direction:ltr;justify-content:flex-end}
.chainbar span{font-family:var(--mono);font-size:12px;padding:3px 9px;border:1px solid var(--caspian);color:var(--caspian);border-radius:3px}
.chainbar i{color:var(--muted);font-style:normal}
.tw{overflow-x:auto;margin-block:12px;border:1px solid var(--rule);background:var(--surface)}
table{border-collapse:collapse;width:100%;font-size:13px;font-variant-numeric:tabular-nums}
th{background:var(--caspian);color:var(--surface);font-weight:600;text-align:right;padding:7px 9px;white-space:nowrap;position:sticky;top:0}
td{padding:6px 9px;border-top:1px solid var(--rule);vertical-align:top;min-width:110px}
td:last-child{min-width:240px}
tbody tr:nth-child(even) td{background:color-mix(in srgb,var(--paper) 55%,var(--surface))}
.q{display:inline-block;white-space:nowrap;font-size:11.5px;padding:1px 7px;border-radius:2px;color:var(--q-ink)}
.q-OFF{background:var(--q-OFF)}.q-CAL{background:var(--q-CAL)}.q-SEC{background:var(--q-SEC)}.q-EST{background:var(--q-EST)}.q-CON{background:var(--q-CON)}.q-GAP{background:var(--q-GAP)}
a{color:var(--caspian)} a.ref{font-family:var(--mono);font-size:11.5px;text-decoration:none;border-bottom:1px dotted var(--caspian)}
.legend{display:flex;flex-wrap:wrap;gap:8px}
.callout{border-inline-start:4px solid var(--sand);background:var(--surface);padding:12px 16px;margin-block:16px}
.callout.warn{border-color:var(--warn)}
.kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-block:18px}
.kpi{background:var(--surface);border:1px solid var(--rule);padding:12px 14px}
.kpi b{display:block;font-family:var(--mono);font-size:22px;color:var(--caspian);direction:ltr;text-align:right}
.kpi small{color:var(--muted);font-size:12px;line-height:1.5;display:block}
figure{margin:18px 0}
figcaption{font-size:12.5px;color:var(--muted)}
svg.chart,svg.diagram{width:100%;max-width:680px;height:auto;display:block;background:var(--surface);border:1px solid var(--rule)}
svg text{font-family:var(--body);fill:var(--ink)}
svg .ax{font-size:11px;fill:var(--muted)} svg .val{font-size:12px;font-weight:600;fill:var(--ink)} svg .inbar{font-size:11px;fill:var(--surface)}
svg .grid{stroke:var(--rule);stroke-width:1} svg .bar{fill:var(--caspian)} svg .bar2{fill:var(--sand)} svg .band{fill:var(--forest);opacity:.16}
svg .terrain{fill:var(--forest);opacity:.22} svg .tline{fill:none;stroke:var(--forest);stroke-width:2} svg .dot{fill:var(--forest)} svg .cityband{fill:var(--sand);opacity:.35}
svg .sea{fill:var(--caspian);opacity:.25} svg .forest{fill:var(--forest);opacity:.25} svg .coastline{fill:none;stroke:var(--caspian);stroke-width:2}
svg .path-main{stroke:var(--ink);stroke-width:5} svg .path-axis{stroke:var(--sand);stroke-width:5;stroke-dasharray:2 0}
svg .airport{fill:var(--rule)} svg .node{fill:var(--surface);stroke:var(--warn);stroke-width:3} svg .lm{fill:var(--warn)} svg .park{fill:var(--forest);opacity:.55}
svg .cable{stroke:var(--muted);stroke-width:1.5;stroke-dasharray:5 4} svg .dlab{font-size:14px;font-weight:600} svg .dsm{font-size:11.5px} svg .note{font-size:10px;fill:var(--muted)}
ol.chain{list-style:none;padding:0;margin:18px 0;display:grid;gap:0;max-width:560px}
ol.chain li{background:var(--surface);border:1px solid var(--rule);padding:10px 14px;position:relative;margin-bottom:26px}
ol.chain li:not(:last-child)::after{content:"↓";position:absolute;bottom:-25px;right:50%;color:var(--caspian);font-size:18px}
ol.chain b{display:block;color:var(--caspian)} ol.chain span{font-size:13.5px}
.three{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px}
.three ol{padding-inline-start:20px;margin:0;font-size:13.5px} .three h3{margin-top:0}
.sheets{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
figure.a2{margin:0;background:var(--surface);border:1px solid var(--rule);padding:10px}
figure.a2 figcaption{color:var(--ink);font-size:13px;margin-bottom:8px} figure.a2 figcaption span{color:var(--muted);font-size:11px;float:left}
.a2g{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;aspect-ratio:594/420;max-width:100%}
.pnl{border:1px solid var(--rule);font-size:10.5px;line-height:1.4;padding:4px;color:var(--muted);overflow:hidden}
.pnl:first-child{grid-column:span 2;grid-row:span 2;color:var(--ink);background:color-mix(in srgb,var(--caspian) 10%,var(--surface))}
code,pre{font-family:var(--mono);font-size:12.5px;direction:ltr;text-align:left}
pre{background:var(--surface);border:1px solid var(--rule);padding:12px;overflow-x:auto}
:focus-visible{outline:2px solid var(--caspian);outline-offset:2px}
@media (max-width:860px){.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.wrap{grid-template-columns:minmax(0,1fr);padding-inline:16px}nav.toc{position:static;max-height:none;border:0;padding:0;columns:2}}
@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
"""


def build():
    pc_rows = [[E(a), E(str(b)), fmt(c), E(str(d)), E(str(e)), E(str(f)), E(str(g)), src(h), q(qq), E(z)] for a, b, c, d, e, f, g, h, qq, z in D.PER_CAPITA]
    pop_rows = [[y, s, fmt(p) if p else "DATA GAP", fmt(hh) if hh else "DATA GAP", hs or "—",
                 (f"{g}%" if g is not None else ("پایه" if p else "—")), src(sr), q(qq), E(n)] for y, s, p, hh, hs, g, sr, qq, n in D.POP]
    sections = []
    add = sections.append

    add(("summary", "یافته‌های کلیدی", f"""
<div class="kpis">
<div class="kpi"><b>35,997</b><small>جمعیت شهر رامسر، 1395 (City) {q('OFF')}</small></div>
<div class="kpi"><b>8.3–9.2 m²</b><small>سرانه فضای سبز قابل‌محاسبه؛ فقط از یک باغ {q('CON')}</small></div>
<div class="kpi"><b>2.3–2.7</b><small>تخت بیمارستانی در هزار نفر (County) {q('CON')}</small></div>
<div class="kpi"><b>80→120 t</b><small>پسماند روزانه عادی → فصل گردشگری {q('CON')}</small></div>
<div class="kpi"><b>≈20%→76%</b><small>سطح مصنوع شهر تا 2022 (Landsat) {q('SEC')}</small></div>
<div class="kpi"><b>&lt; −29 m</b><small>تراز خزر، کمینه تاریخی 2025 {q('SEC')}</small></div>
</div>
<ul>
<li>آخرین آمار رسمی جمعیت شهر مربوط به <b>1395</b> است. سرشماری 1405 ثبت‌مبناست و هنوز نتیجه‌ای برای شهر رامسر منتشر نکرده است: {q('GAP')} <a class="ref" href="#src-N32">N32</a>.</li>
<li>سرانه فضای سبز رامسر روی کاغذ بالای حد پایین استاندارد (7 m²) است، ولی کل عدد از یک لکه 30–33 هکتاری (باغ ملی) می‌آید و مساحت هیچ پارک دیگری در منابع منتشر نشده است. مسئله، <b>توزیع</b> است نه عدد کل.</li>
<li>فضای فرهنگی شهر گردشگرمحور است: پردیس کاخ‌موزه بیش از 500 هزار بازدید در سال دارد (حدود 14 بازدید به ازای هر ساکن)، در حالی که برای ساکنان فقط 2 کتابخانه عمومی و هیچ فرهنگسرای ثبت‌شده‌ای یافت شد.</li>
<li>فشار گردشگری را آمار رسمی جمعیت شناور نشان نمی‌دهد ({q('GAP')})، اما پسماند روزانه از حدود 80 به 120 تن در فصل گردشگری می‌رسد؛ یعنی حدود 28 تا 37 هزار نفر جمعیت معادل اضافه {q('EST')}.</li>
<li>محدوده طراحی پیشنهادی از دل داده‌ها انتخاب شد: <b>محور میراثی–ساحلی بلوار معلم</b> (هتل قدیم ← ساحل، حدود 2 km، ثبت ملی 1352) که هم کمبود فضای عمومی، هم گسست شهر–دریا و هم فشار گردشگری را در یک نقطه جمع می‌کند.</li>
</ul>"""))

    add(("method", "روش، محدودیت‌ها و سطح اعتبار", f"""
<p>این گزارش دور دوم پژوهش است و روی گزارش پایه (P01، 77 صفحه) و اطلس GIS (P02، 38 صفحه) گروه بنا شده است. همه داده‌های جدید از جستجوی منابع رسمی، علمی و خبری به دست آمد و هر عدد با منبع، سال، محدوده جغرافیایی و سطح اعتبار ثبت شد. شهر رامسر (City) و شهرستان رامسر (County) در هیچ جدولی جایگزین هم نشده‌اند.</p>
<div class="legend">{''.join(q(k) for k in D.Q)}</div>
<div class="callout warn"><b>محدودیت دسترسی.</b> در محیط اجرای این پژوهش، اتصال مستقیم به OpenStreetMap/Overpass، درگاه مرکز آمار (amar.org.ir)، سایت شهرداری (ramsar.ir) و ویکی‌پدیا مسدود بود. منابع از طریق نتایج موتور جستجو خوانده شدند؛ برای همین در چند مورد سال دقیق خبر خوانده نشد و با «نامشخص» یا «حدود» علامت خورده است. نقشه‌های خدمات (Map 1 تا 10) با اسکریپت آماده پروژه روی یک رایانه متصل به اینترنت ساخته می‌شوند (بخش GIS).</div>
<p>ترتیب اعتبار منابع طبق دستور پروژه: سند رسمی دولتی ← آمار رسمی ← سند شهرداری ← وزارتخانه ← مقاله علمی ← پایان‌نامه ← خبر معتبر ← سایت عمومی ← وبلاگ. هیچ استاندارد سرانه‌ای از وبلاگ برداشته نشد.</p>"""))

    add(("population", "جمعیت و خانوار", f"""
{table(["سال", "Geographic Scope", "جمعیت", "خانوار", "بعد خانوار", "رشد سالانه", "منبع", "اعتبار", "توضیح"], pop_rows)}
<figure>{pop_chart()}<figcaption>شکل 1 — جمعیت شهر رامسر (City). منبع: مرکز آمار ایران، سرشماری‌های 1385–1395 (N01). رشد مرکب سالانه محاسبه پژوهش {q('CAL')}.</figcaption></figure>
<h3>تحلیل</h3>
<ul>
<li>رشد شهر از 0.40٪ در دوره 1385–1390 به 2.19٪ در 1390–1395 جهش کرده است. در همین دوره خانوارها سالانه 3.10٪ رشد کردند، یعنی سریع‌تر از جمعیت.</li>
<li>بعد خانوار از 3.43 به 2.96 رسیده است. خانوار کوچک‌تر یعنی واحد مسکونی بیشتر برای همان جمعیت؛ این با گسترش ساخت‌وساز و تبدیل باغ (N19، N20) هم‌خوان است.</li>
<li>انحلال 70 مدرسه به‌دلیل کاهش دانش‌آموز در شهرستان (N13) نشانه پیر شدن یا کاهش موالید است، ولی ساختار سنی 1395 شهر در دسترس نبود: {q('GAP')}.</li>
<li>جمعیت شناور (گردشگر و مالکان خانه دوم) در هیچ منبع رسمی برای شهر منتشر نشده است: {q('GAP')}. در بخش گردشگری یک شاخص غیرمستقیم ارائه شده است.</li>
</ul>
<h3>تعارض‌ها و اعداد ردشده</h3>
{table(["موضوع", "عدد A", "عدد B", "علت", "تصمیم", "اعتبار"], [[E(a), E(b), E(c), E(d), E(e), q(qq)] for a, b, c, d, e, qq in D.POP_CONFLICTS])}"""))

    add(("percapita", "سرانه‌های شهری — جدول اصلی", f"""
<p>جمعیت مبنا: <b>35,997 نفر</b> (شهر، 1395). سرانه = مساحت ÷ جمعیت. هر جا مساحت خدمت در هیچ منبعی منتشر نشده بود، به‌جای حدس زدن، شاخص تعدادی یا {q('GAP')} ثبت شد.</p>
{table(["شاخص", "مقدار موجود", "جمعیت", "سرانه / شاخص", "استاندارد", "کمبود/مازاد", "سال", "منبع", "اعتبار", "تحلیل کوتاه"], pc_rows)}
<figure>{green_chart()}<figcaption>شکل 2 — حساسیت سرانه فضای سبز به منبع مساحت و جمعیت. نوار سبز: بازه استاندارد 7–12 m² (وزارت راه و شهرسازی به نقل N29). نوار زرد: جمعیت سناریوی 1405 (P01، نه آمار) {q('EST')}.</figcaption></figure>
<h3>فضای سبز: عدد خوب، توزیع ضعیف</h3>
<p>با 30 هکتار باغ ملی (N03) سرانه 8.33 و با 33 هکتار (N04) سرانه 9.17 m² است؛ هر دو بالای حد پایین 7 m² و زیر حد مطلوب 12 m². اما این عدد از یک لکه در محله نوربخش می‌آید. سهم کل فضای سبز عمومی از پهنه ساخته‌شده حدود 7.5٪ است و ساکنان شرق شهر و نوار ساحلی احتمالاً در شعاع 500 متری هیچ پارکی نیستند. این ادعا فرضیه است و با Map 1 آزموده می‌شود. اگر جمعیت تا 1405 به بازه سناریوهای گزارش پایه رسیده باشد، سرانه بدون پارک جدید به 6.7–7.3 m² می‌افتد. پارک جنگلی صفارود (55 ha) در 9 km خارج شهر است و در سرانه شهری حساب نشد.</p>
<p>رابطه با طبیعت: شهر میان دریا و جنگل هیرکانی است، ولی فضای سبز شهری این دو را به هم وصل نمی‌کند. رودها و آبراهه‌های عمود بر ساحل که از درون بافت می‌گذرند (P02) بستر طبیعی یک شبکه سبز خطی‌اند. گردشگران از همان باغ ملی، باغ کاخ و بلوار معلم استفاده می‌کنند؛ پس در فصل اوج، سرانه واقعی هر استفاده‌کننده کمتر از عدد جدول است.</p>
<h3>فرهنگی و موزه‌ای</h3>
<p>پردیس کاخ‌موزه (باغ 6 ha، شش بنا، موزه‌های تخصصی از 1395) به‌تنهایی سرانه‌ای حدود 1.67 m² می‌سازد که از استاندارد حدود 1 m² بیشتر است. این عدد فریبنده است: فضا بلیت‌دار، گردشگرمحور و تحت مدیریت بنیاد مستضعفان است. برای ساکنان دو کتابخانه عمومی (یکی به ازای حدود 18 هزار نفر) یافت شد و هیچ فرهنگسرا یا خانه فرهنگ محله‌ای در منابع دیده نشد. داده‌ها این گزاره را پشتیبانی می‌کنند: <b>رامسر ظرفیت فرهنگی–گردشگری بالا دارد ولی فضای فرهنگی روزمره ساکنان کم است.</b></p>
<h3>ورزشی، آموزشی، درمانی، مذهبی، امدادی</h3>
<ul>
<li>ورزشی: مساحت داده نشده؛ رئیس اداره ورزش و جوانان رامسر زیرساخت ورزشی را «نامطلوب» و سالن مادر (تختی) را «نامناسب» دانسته است (N14).</li>
<li>آموزشی (شهرستان): حدود 28 دانش‌آموز در هر کلاس؛ مدارس به‌دلیل کاهش دانش‌آموز منحل شده‌اند. کمبود مدرسه با داده‌ها تأیید نمی‌شود؛ مسئله احتمالاً توزیع و کیفیت است.</li>
<li>درمانی: یک بیمارستان 200 تختی (مصوب) برای کل شهرستان؛ 2.3 تا 2.7 تخت در هزار نفر ساکن، که در اوج گردشگری کاهش می‌یابد. مراکز سلامت و داروخانه‌ها: {q('GAP')}.</li>
<li>مذهبی، آتش‌نشانی و کلانتری: تعداد و موقعیت در منابع منتشر نشده است: {q('GAP')}. اسکریپت GIS این لایه‌ها را از OSM استخراج می‌کند.</li>
</ul>"""))

    add(("standards", "استانداردهای سرانه", f"""
{table(["شاخص", "مقدار", "واحد", "مرجع", "سال", "محدوده کاربرد", "اعتبار", "توضیح / دلیل انتخاب"], [[E(a), E(b), E(c), E(d), E(e), E(f), q(qq), E(n)] for a, b, c, d, e, f, qq, n in D.STANDARDS])}
<p><b>دلیل انتخاب.</b> برای فضای سبز بازه 7–12 m² انتخاب شد چون پرکاربردترین مرجع وزارت راه و شهرسازی در طرح‌های جامع است و در مقالات داوری‌شده هم به آن ارجاع داده می‌شود (N29). رقم 20–25 m² بین‌المللی فقط برای مقایسه آمده است. برای ورزشی، فرهنگی و درمانی، ضوابط 1369 شورای عالی (N27) مبنا قرار گرفت. مرجع رسمی جدیدتر، مصوبه 1389 «تدقیق تعاریف و مفاهیم کاربری‌ها و تعیین سرانه آنها» (N28)، سرانه‌ها را به تفکیک اندازه شهر می‌دهد، ولی جدول کامل آن بازیابی نشد. پیش از تحویل نهایی باید از درگاه شورا گرفته و جایگزین شود. عزیزی (1392، N30) نشان داده است که سرانه‌ها در 40 طرح جامع ایران رابطه نظام‌مندی با اندازه شهر ندارند؛ پس مقایسه با استاندارد فقط یک ورودی تحلیل است، نه حکم نهایی.</p>"""))

    add(("services", "موجودی خدمات شهری", table(["گروه", "نام", "نوع", "موقعیت", "مساحت/ظرفیت", "سال", "Geographic Scope", "منبع", "اعتبار"],
                                                [[E(a), E(b), E(c), E(d), E(e), E(f), E(g), src(h), q(qq)] for a, b, c, d, e, f, g, h, qq in D.SERVICES])))

    add(("tourism", "گردشگری و جمعیت شناور", f"""
{table(["شاخص", "مقدار", "واحد", "سال", "Geographic Scope", "منبع", "اعتبار", "توضیح"], [[E(a), E(b), E(c), E(d), E(e), src(f), q(qq), E(n)] for a, b, c, d, e, f, qq, n in D.TOURISM])}
<h3>فشار جمعیت ساکن + شناور</h3>
<p>آمار رسمی جمعیت شناور وجود ندارد. سه شاخص مستقل جهت فشار را نشان می‌دهند:</p>
<ul>
<li><b>اقامت:</b> 115 هزار نفر‌شب ثبت‌شده (N02) معادل 3.2 شب به ازای هر ساکن است. این فقط اقامت رسمی است؛ ویلاها و خانه‌های دوم شمرده نمی‌شوند.</li>
<li><b>موزه:</b> بیش از 500 هزار بازدید سالانه از کاخ‌موزه (N07) یعنی حدود 14 بازدید به ازای هر ساکن، متمرکز در یک نقطه از مرکز شهر.</li>
<li><b>پسماند:</b> افزایش از حدود 80 به 120 تن در روز در فصل گردشگری (N24) با سرانه 1.08–1.41 kg/نفر/روز معادل حضور 28 تا 37 هزار نفر اضافه است، تقریباً هم‌اندازه جمعیت ساکن شهر {q('EST')}.</li>
</ul>
<p>پیامد این فشار بر فضای عمومی و ساحل، پارکینگ و جاده ساحلی (تنها محور شرق–غرب)، پسماند (دفن در جنگل اشکته‌چال)، آب و فاضلاب، خدمات درمانی (تنها بیمارستان شهرستان) و فضای سبز است. داده کمّی برای پارکینگ، آب و فاضلاب در منابع یافت نشد: {q('GAP')}. تابستان 1405 به گزارش برنا (N23) «بی‌سابقه» بوده است، زیرا مسافران به سمت مقصدهایی رفتند که امن‌تر می‌دانستند. پس فشار رو به افزایش است.</p>"""))

    add(("history", "تاریخ و فرهنگ", f"""
{table(["سال", "رویداد", "اثر کالبدی", "اثر اجتماعی", "اثر اقتصادی", "مکان", "منبع", "اعتبار"], [[E(a), E(b), E(c), E(d), E(e), E(f), src(g), q(qq)] for a, b, c, d, e, f, g, qq in D.HISTORY])}
<p><b>تحلیل.</b> رامسر از معدود شهرهای ایران است که هسته مدرن آن طراحی‌شده است: هتل قدیم، کاخ و بلوار معلم یک محور شمالی–جنوبی 2 کیلومتری میان کوه و دریا ساخته‌اند و هر دو عنصر اصلی در 1352 ثبت ملی شده‌اند. پس از انقلاب، مالکیت این عناصر به نهادهایی رسید که منطق مدیریتشان نقطه‌ای است: کاخ به بنیاد مستضعفان و هتل‌ها به مجموعه آزادی. نتیجه، مجموعه‌ای از جاذبه‌های جدا از هم است که با شبکه فضای عمومی پیوند ندارند. از دوره قاجار و پیش از آن سند معتبری در منابع قابل‌دسترس یافت نشد: {q('GAP')}.</p>"""))

    add(("geography", "وضعیت جغرافیایی", f"""
{table(["شاخص", "مقدار", "سال", "Geographic Scope", "منبع", "اعتبار", "توضیح"], [[E(a), E(b), E(c), E(d), src(e), q(qq), E(n)] for a, b, c, d, e, qq, n in D.GEOGRAPHY])}
<figure>{profile_chart()}<figcaption>شکل 3 — نیمرخ ساحل تا کوه. نقاط از نیمرخ A–B اطلس GIS پروژه (P02)؛ تراز دریا 2025 از N21. خط بین نقاط درون‌یابی خطی است.</figcaption></figure>
<p><b>اثر بر توسعه شهری.</b> شهر در جلگه‌ای با عرض 400 متر تا 3 کیلومتر فشرده شده است (N31). در کمتر از 3 کیلومتر از ساحل ارتفاع به 100 متر و در 15.5 کیلومتر به 2000 متر می‌رسد (P02). هر توسعه جدید یا به دامنه پرشیب و پرلغزش می‌رود، یا به باغ و شالیزار جلگه، یا به حریم رود و ساحل. افت سریع خزر (زیر −29 متر در 2025، N21) ساحل را عقب می‌برد و نوار تازه‌ای از زمین ساحلی می‌سازد. این نوار هم تهدید است (تصرف، ساخت) و هم فرصت (فضای عمومی). بارش 1,238 میلی‌متری با اوج پاییزی، رطوبت 76–85٪ و تابستان گرم و شرجی (P01) یعنی هر فضای عمومی باید سایه، تهویه و زهکشی داشته باشد.</p>"""))

    add(("physical", "وضعیت کالبدی و خوانایی (Kevin Lynch)", f"""
<figure>{lynch_diagram()}<figcaption>شکل 4 — دیاگرام شماتیک خوانایی رامسر (Path، Edge، District، Node، Landmark). بدون مقیاس.</figcaption></figure>
{table(["عنصر", "مصادیق در رامسر", "ارزیابی", "منبع"], [[E(a), E(b), E(c), src(d)] for a, b, c, d in D.LYNCH])}
<ul>
<li><b>ساختار:</b> خطی شرقی–غربی موازی ساحل، با یک محور عمود شاخص (معلم). جاده ساحلی هم شریان منطقه‌ای و هم خیابان اصلی شهر است (P02).</li>
<li><b>تغییر کاربری:</b> سطح مصنوع شهر از حدود 20٪ به حدود 76٪ (2022) رسیده و شاخص آب (NDWI) 61٪ کاهش یافته است (N19). در شهرستان شالیزار و مرتع کم و شهر و باغ مرکبات زیاد شده است (N20).</li>
<li><b>تراکم:</b> ناخالص حدود 90 نفر در هکتار روی پهنه ساخته‌شده 398 ha {q('EST')}. نقشه کاربری رسمی، مرز قانونی، بافت فرسوده و تعداد طبقات: {q('GAP')}.</li>
<li><b>گره‌ها</b> ترافیکی‌اند نه جمعی؛ شهر میدان یا پلازای شاخص ثبت‌شده‌ای ندارد. نزدیک‌ترین نمونه، تقاطع بلوار معلم با جاده ساحلی است.</li>
</ul>"""))

    add(("economy", "اقتصاد", f"""
{table(["شاخص", "مقدار", "سال", "Geographic Scope", "منبع", "اعتبار", "توضیح"], [[E(a), E(b), E(c), E(d), src(e), q(qq), E(n)] for a, b, c, d, e, qq, n in D.ECONOMY])}
<p><b>تحلیل.</b> داده اشتغال در سطح شهرستان و شهر منتشر نمی‌شود؛ بیکاری مازندران (6.6٪، بهار 1404) پایین‌تر از کشور است. شواهد کیفی و غیرمستقیم ساختاری خدماتی–گردشگری و فصلی را نشان می‌دهند: نفر‌شب‌های ثبت‌شده، 40 بومگردی، توسعه فرودگاه، و بازار زمین که با ویلاسازی (64 ویلای غیرمجاز روی 10 ha در یک مورد) تغذیه می‌شود. وابستگی به یک فصل یعنی درآمد ناپایدار و زیرساختی که برای اوج ساخته می‌شود و بقیه سال کم‌کار است. پیشنهاد گردشگری چهارفصل (رویداد پاییز/زمستان، گردشگری فرهنگی) از همین‌جا می‌آید.</p>"""))

    add(("social", "تحلیل اجتماعی", f"""
<ul>
<li><b>خانوار:</b> بعد خانوار 2.96 (1395) و رشد سریع‌تر خانوار نسبت به جمعیت (N01) یعنی تقاضای فزاینده برای واحد مسکونی کوچک‌تر.</li>
<li><b>گروه‌های سنی:</b> داده 1395 شهر در دسترس نبود {q('GAP')}؛ شاهد غیرمستقیم انحلال 70 مدرسه (N13) کاهش جمعیت دانش‌آموزی را نشان می‌دهد. برنامه فضای عمومی باید سالمندان را جدی بگیرد، ولی این پیشنهاد باید با هرم سنی تأیید شود.</li>
<li><b>کیفیت زندگی:</b> ساکنان در فصل اوج با گردشگران بر سر همان فضاها (باغ ملی، بلوار، ساحل)، همان جاده و همان بیمارستان رقابت می‌کنند. فضاهای روزمره ساکن‌محور (فرهنگسرا، ورزش، پارک محله‌ای) یا وجود ندارند یا آماری از آن‌ها منتشر نشده است.</li>
<li><b>جمعیت فعال و اشتغال:</b> {q('GAP')} در سطح شهر/شهرستان.</li>
</ul>"""))

    maps_rows = [[f"Map {n}", E(t), E(l), f"<code>{E(tags)}</code>", E(s)] for n, t, l, tags, s in D.MAPS]
    add(("gis", "GIS و تحلیل فضایی خدمات", f"""
<p>نقشه‌های تحلیلی طبیعی (شیب، ارتفاع، مخاطرات، LOM) در اطلس P02 موجودند. برای نقشه‌های خدمات، داده مکانی معتبر شهرداری منتشر نشده است و OpenStreetMap از محیط این پژوهش در دسترس نبود. بنابراین یک اسکریپت تکرارپذیر آماده و روی داده آزمایشی تست شد. اسکریپت این کارها را انجام می‌دهد: داده OSM محدوده شهر را از Overpass می‌گیرد؛ جمعیت 1395 را به نسبت مساحت ساختمان‌ها پخش می‌کند؛ برای هر خدمت بافر می‌زند؛ سهم جمعیت تحت پوشش و فاقد پوشش را حساب می‌کند؛ و 10 نقشه PNG با منبع داده می‌سازد.</p>
{table(["نقشه", "عنوان", "لایه‌ها", "تگ‌های OSM", "وضعیت"], maps_rows)}
<pre>pip install requests geopandas shapely pyproj matplotlib
python gis/ramsar_osm_services.py            # خروجی در ./out
python gis/ramsar_osm_services.py --boundary marz_shahr.shp   # اگر مرز قانونی شهر دریافت شد</pre>
<div class="callout"><b>هشدار تفسیر.</b> OSM داده داوطلبانه است و هر خدمتی که در آن ثبت نشده باشد، روی نقشه «کمبود» دیده می‌شود. هر منطقه فاقد پوشش باید پیش از گزارش به‌عنوان کمبود، در برداشت میدانی کنترل شود. بافرها اقلیدسی‌اند و پوشش را حداکثری نشان می‌دهند.</div>"""))

    add(("compare", "مقایسه با شهرهای مشابه", f"""
{table(["شهر", "استان", "جمعیت 1395", "Geographic Scope", "سرانه فضای سبز", "ویژگی گردشگری", "منبع", "اعتبار", "قابلیت مقایسه"], [[E(a), E(b), fmt(c), E(d), E(e), E(f), src(g), q(qq), E(z)] for a, b, c, d, e, f, g, qq, z in D.COMPARE])}
<p>جمعیت هر پنج شهر از یک سرشماری (1395) و در سطح City است، پس قابل مقایسه است. سرانه فضای سبز، خدمات فرهنگی و ساختار اقتصادی شهرهای همسایه با روش یکسان در منابع یافت نشد. برای همین مقایسه سرانه‌ها انجام نشد تا نتیجه گمراه‌کننده‌ای تولید نشود. اسکریپت GIS با تغییر BBOX برای نوشهر، تنکابن و چالوس هم قابل اجراست و مقایسه هم‌روش را ممکن می‌کند. لاهیجان با بیش از 100 هزار نفر در کلاس اندازه دیگری است.</p>"""))

    swot = {
        "قوت (S)": ["برند جهانی «رامسر» (1971)", "محور میراثی ثبت‌شده 2 km", "کاخ‌موزه با بیش از 500k بازدید", "جلگه کم‌شیب مناسب پیاده/دوچرخه", "فرودگاه و تله‌کابین"],
        "ضعف (W)": ["تمرکز فضای سبز در یک باغ", "فضای فرهنگی و ورزشی ساکن‌محور اندک", "ساختار تک‌محوری و نبود اتوبوس شهری", "نبود داده پایه شهری", "دفن پسماند در جنگل"],
        "فرصت (O)": ["ساحل نوپدید با افت خزر", "سرشماری 1405 و داده ثبتی", "تقاضای رو‌به‌رشد گردشگری غرب مازندران", "رودها به‌عنوان کریدور سبز", "جمعیت دانشجویی (دانشکده‌ها)"],
        "تهدید (T)": ["سیل، لغزش و زلزله (A=0.3g)", "ویلاسازی و تبدیل باغ", "افزایش فشار فصلی (تابستان 1405)", "گرمای شهری (کاهش NDWI)", "تراکم کارکرد در یک نقطه"],
    }
    swot_html = '<div class="three">' + "".join(f"<div><h3>{E(k)}</h3><ol>{''.join(f'<li>{E(x)}</li>' for x in v)}</ol></div>" for k, v in swot.items()) + "</div>"
    add(("swot", "SWOT", swot_html + table(["نوع", "راهبرد", "اقدام کلیدی"], [[E(a), E(b), E(c)] for a, b, c in D.STRATEGIES])))

    add(("problems", "استخراج مسائل", table(["کد", "حوزه", "داده", "مسئله", "شاهد", "پیامد", "فرصت"],
                                            [[E(a), E(b), E(c), E(d), src(e.replace(",", ";").replace(" این پژوهش", "")), E(f), E(g)] for a, b, c, d, e, f, g in D.PROBLEMS])))
    add(("needs", "استخراج نیازها", table(["مسئله", "نیاز شهری", "پاسخ برنامه‌ریزی"], [[E(a), E(b), E(c)] for a, b, c in D.NEEDS])))

    add(("program", "برنامه فضایی پیشنهادی — محور معلم", f"""
<p><b>چرا این محدوده؟</b> محور بلوار معلم (هتل قدیم ← ساحل، حدود 2 km) جایی است که پنج مسئله اصلی روی هم می‌افتند: میراث ثبتی گسسته (P11)، گسست شهر–دریا (P8)، فشار گردشگری (P6)، تمرکز فضای سبز (P3) و تنها گره شاخص شهر که امروز ترافیکی است. اندازه‌های زیر پیشنهاد طراحی‌اند، نه داده.</p>
{table(["گروه", "جزء برنامه", "اندازه پیشنهادی", "کاربران", "نیاز مرتبط", "مبنای داده"], [[E(a), E(b), E(c), E(d), E(e), src(f)] for a, b, c, d, e, f in D.PROGRAM])}"""))

    add(("sheets", "ساختار پنج شیت A2", a2_sheets() + "<p class='meta'>خانه بزرگ هر شیت عنوان و نقشه/نمودار شاخص است؛ ترتیب خانه‌ها مسیر DATA ← ANALYSIS ← PROBLEM ← SOLUTION را از راست به چپ دنبال می‌کند.</p>"))

    final_chain = chain_diagram([
        ("رامسر امروز", "36 هزار نفر (1395) در جلگه 0.4–3 km؛ برند جهانی؛ فشار گردشگری هم‌اندازه جمعیت"),
        ("مسائل", "فضای سبز متمرکز، فرهنگ گردشگرمحور، تک‌محوری، گسست شهر–دریا، مخاطرات، ویلاسازی"),
        ("نیازها", "شبکه سبز، فضای جمعی ساکن+گردشگر، دسترسی ساحل، مدیریت حرکت، تاب‌آوری"),
        ("راهبردها", "گردشگری چهارفصل، زیرساخت سبز، مرز رشد، داده باز"),
        ("برنامه", "پلازا، پارک خطی ساحلی، مرکز تفسیر میراث، ورزش روباز، پارکینگ حاشیه‌ای و شاتل"),
        ("فضای شهری پیشنهادی", "محور میراثی–ساحلی معلم: از هتل قدیم تا ساحل نوپدید"),
    ])
    add(("final", "جمع‌بندی برنامه‌ریزی شهری رامسر", f"""
<div class="three">
<div><h3>10 مسئله اصلی</h3><ol>{''.join(f'<li>{E(x)}</li>' for x in D.TOP10_ISSUES)}</ol></div>
<div><h3>10 ظرفیت اصلی</h3><ol>{''.join(f'<li>{E(x)}</li>' for x in D.TOP10_CAPACITIES)}</ol></div>
<div><h3>10 نیاز اصلی</h3><ol>{''.join(f'<li>{E(x)}</li>' for x in D.TOP10_NEEDS)}</ol></div>
</div>
<h3>راهبردهای پیشنهادی</h3>
<ol>{''.join(f'<li><b>{E(b)}</b>: {E(c)}</li>' for a, b, c in D.STRATEGIES)}</ol>
<h3>برنامه فضایی پیشنهادی</h3>
<p>پلازای «دروازه دریا» در تقاطع معلم و جاده ساحلی، فضاهای مکث هر 150–200 متر، پارک خطی ساحلی انطباقی روی ساحل نوپدید، مرکز تفسیر میراث «رامسر معاصر»، ورزش روباز، باغ سایه‌دار با گونه‌های هیرکانی، پارک سیلابی، پارکینگ حاشیه‌ای در ورودی‌ها با شاتل فصلی، و دست‌کم 40٪ سطوح نفوذپذیر.</p>
<h3>دیاگرام نهایی</h3>
{final_chain}"""))

    gaps = [r for r in D.PER_CAPITA if r[8] == "GAP"]
    add(("gaps", "DATA GAP — فهرست و مسیر دریافت", f"""
<ul>
<li>جمعیت 1405 شهر (سرشماری ثبت‌مبنا در جریان) — پیگیری از مرکز آمار پس از انتشار.</li>
<li>جدول کامل سرانه‌های مصوبه 1389 شورای عالی شهرسازی — درگاه شورا/وزارت راه و شهرسازی.</li>
<li>طرح جامع/تفصیلی مصوب رامسر، مرز قانونی و نقشه کاربری — استعلام از شهرداری و اداره کل راه و شهرسازی مازندران.</li>
<li>ساختار سنی و جنسی، اشتغال و سهم بخش‌ها (1395، جدول تفصیلی شهر/شهرستان) — مرکز آمار.</li>
<li>مساحت سایر پارک‌ها، فضای سبز خطی و ساحلی — واحد فضای سبز شهرداری + Map 1.</li>
<li>فرهنگسرا، مساحت کتابخانه‌ها، سالن‌های ورزشی، مراکز سلامت، مساجد، آتش‌نشانی، کلانتری — اسکریپت GIS + برداشت میدانی.</li>
<li>ظرفیت پارکینگ و شمارش ترافیک در روز عادی و اوج — برداشت میدانی گروه.</li>
<li>جمعیت شناور و نفر‌شب ماهانه — اداره میراث فرهنگی رامسر.</li>
<li>تعداد ثبت‌شده این دور: {len(gaps)} شاخص سرانه و چند ردیف خدمات/اقتصاد (شیت DATA_GAPS در فایل Excel).</li>
</ul>"""))

    src_rows = [[f'<span id="src-{a}">{a}</span>', E(b), E(c), E(d), f'<a href="{E(e)}" target="_blank" rel="noopener">{E(e[:60])}{"…" if len(e) > 60 else ""}</a>' if e.startswith("http") else E(e), E(f), str(g), E(n)] for a, b, c, d, e, f, g, n in D.SOURCES]
    add(("sources", "جدول منابع", f"<p class='meta'>تاریخ دسترسی: {D.ACCESS_DATE}. رتبه اعتبار: 1 = سند رسمی دولتی … 9 = وبلاگ؛ 0 = فایل‌های پروژه.</p>" +
         table(["کد", "سازمان / نویسنده", "عنوان", "سال", "URL", "نوع", "رتبه", "توضیح"], src_rows)))

    toc = "".join(f'<a href="#{i}">{E(t)}</a>' for i, t, _ in sections)
    body = "".join(f'<section id="{i}"><h2>{E(t)}</h2>{c}</section>' for i, t, c in sections)
    page = f"""<title>مطالعات شهری رامسر</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700&family=Noto+Naskh+Arabic:wght@600;700&family=IBM+Plex+Mono:wght@400;600&display=swap">
<style>{CSS}</style>
<div class="wrap" dir="rtl" lang="fa">
<nav class="toc" aria-label="فهرست">{toc}</nav>
<main>
<header class="cover">
<div class="eyebrow">درس مبانی برنامه‌ریزی فضاهای شهری · گروه سوم · مهر 1405</div>
<h1>مطالعات و تحلیل شهر رامسر</h1>
<p class="meta">مشکات عروجی · محمد امین صادقی · فاطمه صفری‌نژاد · آرینه مارگوسیان · حدیثه صیفوری</p>
<p class="meta">دور دوم پژوهش: استخراج داده از منابع رسمی، علمی و خبری، اعتبارسنجی، محاسبه سرانه‌ها و استخراج برنامه طراحی. همه اعداد در فایل <code>Ramsar_Database.xlsx</code> با منبع، سال، محدوده و سطح اعتبار آمده‌اند.</p>
<div class="chainbar"><span>DATA</span><i>→</i><span>ANALYSIS</span><i>→</i><span>PROBLEM</span><i>→</i><span>NEED</span><i>→</i><span>STRATEGY</span><i>→</i><span>PROGRAM</span><i>→</i><span>DESIGN</span></div>
</header>
{body}
</main></div>"""
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(page)
    print("saved", os.path.abspath(OUT), len(page))


if __name__ == "__main__":
    build()
