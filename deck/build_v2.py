#!/usr/bin/env python3
"""Builds presentation_v2.html (standalone) from deck/img/*.jpg."""
import base64, json, os, re
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, 'img'); IMG2 = os.path.join(HERE, 'img2')
FONT = open(os.path.join(HERE, 'vazir.b64')).read().strip()
PATHS = {}
for d in (IMG, IMG2):
    for f in os.listdir(d):
        if f.endswith('.jpg'): PATHS[f[:-4]] = os.path.join(d, f)
DIMS = {k: Image.open(v).size for k, v in PATHS.items()}

# ------------------------------------------------------------ helpers
FA = str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')
def fa(h):
    """Persian digits in running text only (tags and <bdi> untouched)."""
    parts = re.split(r'(<[^>]*>|<bdi.*?</bdi>)', h)
    out = []
    for p in parts:
        if p.startswith('<'):
            out.append(p)
        else:
            p = re.sub(r'(\d)\.(\d)', r'\1٫\2', p)
            out.append(p.translate(FA))
    return ''.join(out)

def fig(img, x, y, w, h=None, crop=None, svg='', cap='', fx=0, fy=0, big=False):
    iw, ih = DIMS[img]
    cx, cy, cw, ch = crop or (0, 0, iw, ih)
    if h is None: h = round(w * ch / cw)
    s = max(w / cw, h / ch)
    vw, vh = w / s, h / s
    vx, vy = cx + (cw - vw) / 2 + fx, cy + (ch - vh) / 2 + fy
    ov = (f'<svg class="{"k" if big else ""}" viewBox="{vx:.1f} {vy:.1f} {vw:.1f} {vh:.1f}" preserveAspectRatio="none">{svg}</svg>') if svg else ''
    c = f'<div class="cap" style="left:{x}px;top:{y+h+8}px;width:{w}px">{fa(cap)}</div>' if cap else ''
    return (f'<div class="fig" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px">'
            f'<img data-img="{img}" alt="" style="width:{iw*s:.1f}px;height:{ih*s:.1f}px;left:{-vx*s:.1f}px;top:{-vy*s:.1f}px">{ov}</div>{c}')

def colR(right, top, width, html):
    return f'<div class="col" style="right:{right}px;top:{top}px;width:{width}px">{html}</div>'
def colL(left, top, width, html):
    return f'<div class="col" style="left:{left}px;top:{top}px;width:{width}px">{html}</div>'

def lede(t): return f'<p class="lede">{fa(t)}</p>'
def pl(items):
    return '<ul class="pl">' + ''.join(f'<li>{fa(i)}</li>' for i in items) + '</ul>'
def keys(items):
    return '<ol class="keys sm">' + ''.join(f'<li><span class="kn">{i+1}</span><span class="kt">{fa(t)}</span></li>' for i, t in enumerate(items)) + '</ol>'
def s2(n, unit, what, why, src, c=''):
    return (f'<div class="s2 {c}"><div class="n"><bdi dir="ltr">{n}</bdi><small>{unit}</small></div>'
            f'<div class="w">{fa(what)}</div><div class="y">{fa(why)}</div><div class="m">{src}</div></div>')
def sw(color, t, sm):
    return f'<div class="sw"><i style="background:{color}"></i><div>{fa(t)}<small>{fa(sm)}</small></div></div>'

SLIDES = []
def slide(kicker, title, body, src, cls='', sub=''):
    SLIDES.append(dict(k=kicker, t=title, b=body, s=src, c=cls, l=sub))

DOT = lambda x, y, n, r=24: (f'<circle class="dot" cx="{x}" cy="{y}" r="{r}"/>'
                             f'<text class="dn" x="{x}" y="{y}" style="font-size:{r*1.2:.0f}px">{n}</text>')
def LABI(x, y, w, h, t, fs=24):
    return (f'<rect class="patch" x="{x}" y="{y}" width="{w}" height="{h}"/>'
            f'<text class="pi" x="{x+w/2}" y="{y+h/2}" style="font-size:{fs}px">{t}</text>')
def LAB(x, y, w, h, t, fs=24):
    return (f'<rect class="patch" x="{x}" y="{y}" width="{w}" height="{h}"/>'
            f'<text class="pt" x="{x+w/2}" y="{y+h/2}" style="font-size:{fs}px">{t}</text>')

# ============================================================ 01 COVER
slide('', 'استانداردهای طراحی فضاهای ورزشی',
  fig('g-three', 60, 330, 1180, cap='سازمان فضایی سه نوع سالن رقابتی: استخر · والیبال · بسکتبال') +
  colR(90, 350, 480,
    '<div class="abc"><div><b>A</b>فضای تماشاگر و پشتیبانی</div><div><b>B</b>فضای ورزشکار و بازیکن</div><div><b>C</b>رختکن و دوش</div></div>'
    '<div class="who" contenteditable="true" spellcheck="false">نام ارائه‌دهنده · درس · استاد</div>'),
  'FIBA · FIVB · World Aquatics · Sport England', cls='cover', sub='شنا  ·  والیبال  ·  بسکتبال')

# ============================================================ 02 PROBLEM
slide('مسئله معماری', 'مسئله معماری: سازمان‌دهی ورزشکار، تماشاگر و خدمات',
  fig('g-board', 60, 205, 1290, cap='سه سالن رقابتی، سه پاسخ به یک پرسش: فضای مسابقه در مرکز و سه نظام حرکتی در پیرامون') +
  colR(90, 215, 430,
    lede('هر ساختمان ورزشی باید سه <b>حوزه‌ی حرکتی</b> را هم‌زمان پاسخ دهد، بی‌آنکه مسیرها یکدیگر را قطع کنند.') +
    pl(['<b>فضای مسابقه</b> هسته‌ی عملکردی مجموعه است.',
        '<b>ورزشکار</b>: دسترسی کنترل‌شده از رختکن تا زمین.',
        '<b>تماشاگر</b>: ورود، دید و تخلیه.',
        '<b>خدمات</b>: لایه‌ی فنی و پشتیبانی مستقل.'])),
  'FIBA Venue Guide · FIVB Event Regulations · World Aquatics')

# ============================================================ 03 THREE SYSTEMS
slide('نظام حرکتی', 'سه نظام حرکتی: ورزشکار، تماشاگر، خدمات',
  fig('g-spatial', 680, 205, 1150, cap='پلان یک سالن چندمنظوره: حوزه‌ی ورزشکار، فضاهای پشتیبانی و لایه‌ی خدماتی؛ رنگ‌ها طبق راهنمای خود نقشه') +
  colL(60, 215, 560,
    lede('هر نظام حرکتی ورودی، مسیر و <b>سطح کنترل</b> متفاوت دارد.') +
    pl(['<b>حوزه‌ی ورزشکار</b> — فضای نیمه‌خصوصی با <b>دسترسی کنترل‌شده</b> از ورودی اختصاصی تا رختکن و زمین.',
        '<b>حوزه‌ی تماشاگر</b> — فضای عمومی؛ ورود از لابی، <b>گردش پیرامونی</b> و تخلیه.',
        '<b>لایه‌ی خدماتی</b> — باراندازی، انبار و فنی؛ مسیر مستقل از دو حوزه‌ی دیگر.'])),
  'FIBA Venue Guide — تفکیک جریان‌ها')

# ============================================================ 04 SPATIAL ORGANISATION
ov = ('<rect class="zone" x="730" y="470" width="540" height="280"/>'
      '<polygon class="ring" points="550,370 670,256 1340,256 1460,370 1460,830 1340,880 670,880 550,830"/>'
      '<rect class="ring2" x="470" y="210" width="1270" height="810"/>' +
      DOT(1000, 610, 1, 40) + DOT(600, 610, 2, 40) + DOT(1000, 226, 3, 40) + DOT(230, 520, 4, 40) + DOT(1800, 300, 4, 40))
slide('سازمان‌دهی فضایی', 'فضای مسابقه در مرکز، لایه‌های پشتیبانی در پیرامون',
  fig('g-arena', 60, 205, 1180, svg=ov, big=True, cap='تحلیل سلسله‌مراتب فضایی روی پلان همکف یک سالن بسکتبال') +
  colR(90, 215, 430,
    lede('<b>سلسله‌مراتب فضایی</b> از مرکز به پیرامون: مسابقه، جایگاه، گردش، پشتیبانی.') +
    keys(['<b>هسته‌ی عملکردی</b> — فضای مسابقه', '<b>جایگاه</b> تماشاگر با دید به زمین',
          '<b>گردش افقی</b> پیرامون جایگاه', 'بلوک‌های <b>ورزشکار</b> و <b>پشتیبانی</b>'])),
  'تحلیل معماری روی پلان')

# ============================================================ 05 CIRCULATION
slide('تفکیک حرکت', 'تفکیک مسیرهای ورزشکار، تماشاگر و خدمات',
  fig('g-circ', 60, 205, 1180, cap='مسیرهای حرکتی و نقاط تعارض روی پلان؛ راهنمای رنگ از خود نقشه') +
  colR(90, 215, 420,
    lede('هر <b>تلاقی</b> دو مسیر یک <b>نقطه‌ی تعارض</b> است؛ هدف طراحی کاهش آن‌هاست.') +
    sw('#2a62b6', 'ورزشکار', 'ورودی اختصاصی تا زمین') + sw('#e08a1e', 'تماشاگر', 'لابی عمومی تا جایگاه') +
    sw('#b0268a', 'خدمات', 'باراندازی و تأسیسات') +
    '<div class="note">FIBA: جریان‌ها از هم <b>تفکیک</b> شوند و میزبان و میهمان یکدیگر را قطع نکنند.</div>'),
  'FIBA Venue Guide — گردش و تفکیک جریان‌ها')

# ============================================================ 06 SWIM STANDARD
ov = ('<g class="dm"><line x1="200" y1="150" x2="1015" y2="150"/><line x1="200" y1="138" x2="200" y2="162"/><line x1="1015" y1="138" x2="1015" y2="162"/></g>' +
      LAB(742, 134, 120, 34, '50 m', 26) +
      '<g class="dm"><line x1="1135" y1="160" x2="1135" y2="430"/><line x1="1123" y1="160" x2="1147" y2="160"/><line x1="1123" y1="430" x2="1147" y2="430"/></g>' +
      LAB(1100, 280, 70, 32, '25 m', 22))
slide('شنا · فضای مسابقه', 'شنا — هندسه‌ی استخر رقابتی و عرشه‌ی پیرامونی',
  fig('p-023', 60, 205, 1290, svg=ov, cap='پلان و برش طولی استخر؛ ابعاد از استاندارد World Aquatics (نسبت ترسیم تقریبی است)') +
  colR(90, 205, 420,
    s2('50×25', 'm', 'استخر رقابتی', 'طول ۵۰ و عرض حداقل ۲۵ متر؛ <b>عرشه‌ی مرطوب</b> پیرامون آن را سازمان می‌دهد.', 'World Aquatics · Pool Certification', 'c') +
    s2('2.5', 'm', 'عرض هر خط شنا', 'عرض استخر از تعداد <b>خطوط</b> و عرض هر خط به‌دست می‌آید.', 'World Aquatics · Pool Certification', 'c') +
    s2('≥2.5', 'm', 'عمق آب', 'برای رقابت‌های المپیک و قهرمانی جهان؛ استخر آموزشی و عمومی از این شرط مستثنا است.', 'World Aquatics · Pool Certification', 'c')),
  'World Aquatics Facilities Rules · Pool Certification')

# ============================================================ 07 SWIM SEQUENCE
ov = ('<line class="rt" x1="1310" y1="10" x2="1310" y2="1060" style="stroke-dasharray:26 16"/>'
      '<path class="ar" d="M240 770 L620 770 L780 560 L1000 700 L1150 830 L1400 830 L1400 300 L1560 300"/>'
      '<polygon class="ah" points="1560,262 1640,300 1560,338"/>' +
      DOT(240, 690, 1, 38) + DOT(860, 560, 2, 38) + DOT(1010, 740, 3, 38) + DOT(1400, 600, 4, 38) + DOT(1700, 700, 5, 38))
slide('شنا · ورزشکار', 'توالی فضایی شنا: از ورودی خشک تا عرشه‌ی مرطوب',
  fig('g-athlete', 60, 205, 1200, svg=ov, big=True, cap='پلان توالی ورزشکار؛ خط‌چین عمودی مرز <b>خشک ← مرطوب</b>') +
  colR(90, 205, 440,
    lede('ورزشکار از <b>فضای خشک</b> وارد می‌شود و پس از <b>رختکن</b> و <b>دوش</b> از <b>گردش مرطوب</b> به عرشه می‌رسد؛ مرز <b>خشک ← مرطوب</b> یک‌بار عبور می‌شود.') +
    keys(['ورودی ورزشکار — فضای خشک', 'رختکن و کمد', 'آماده‌سازی، دوش و سرویس', 'گردش مرطوب', 'عرشه و استخر'])),
  'World Aquatics · Sport England Swimming Pools')

# ============================================================ 08 SWIM SPECTATOR + SUPPORT
slide('شنا · جایگاه و پشتیبانی', 'جایگاه خشک تماشاگر، لایه‌ی فنی در پشت عرشه',
  col := colR(90, 205, 1740, lede('جایگاه <b>تماشاگر</b> از عرشه‌ی مرطوب جدا می‌شود و <b>لایه‌ی فنی</b> مسیر مستقل دارد.')) +
  fig('g-spec', 60, 300, 830, cap='جایگاه و مانع جداکننده‌ی مسیر ورزشکار و تماشاگر') +
  fig('g-boh', 980, 300, 830, cap='فضاهای پزشکی، فنی و باراندازی با مسیر خدماتی') +
  colR(1030, 820, 800, pl(['<b>مانع جداکننده</b> میان عرشه و جایگاه', 'رمپ و <b>جای ویژه‌ی معلولان</b>'])) +
  colR(90, 820, 800, pl(['<b>فیلتراسیون</b> و اتاق‌های فنی', '<b>باراندازی</b> و مسیر خدماتی جدا'])),
  'World Aquatics · Sport England Swimming Pools')

# ============================================================ 09 VOLLEY COURT
ov = (LABI(640, 584, 170, 58, '9×9 m', 38) + LABI(1146, 584, 172, 58, '9×9 m', 38) +
      LABI(628, 572, 36, 70, '', 10) + LABI(1384, 580, 36, 56, '', 10) +
      LABI(706, 698, 56, 36, '6 m', 30) + LABI(1210, 698, 56, 36, '6 m', 30) +
      '<text class="pi" x="646" y="606" style="font-size:30px" transform="rotate(-90 646 606)">9 m</text>'
      '<text class="pi" x="1402" y="606" style="font-size:30px" transform="rotate(-90 1402 606)">9 m</text>')
slide('والیبال · فضای مسابقه', 'والیبال — زمین، منطقه‌ی آزاد و استقرار تیم‌ها',
  fig('g-vcourt', 60, 205, 1200, svg=ov, big=True, cap='پلان سالن والیبال؛ ابعاد روی زمین: هر نیمه ۹×۹ متر، خط حمله ۳ متر از تور') +
  colR(90, 205, 440,
    s2('18×9', 'm', 'زمین بازی', 'دو نیمه‌زمین ۹×۹ متر؛ مرز <b>فضای مسابقه</b>.', 'FIVB Event Regulations · Art. 15', 'c') +
    s2('31×19', 'm', 'محوطه‌ی بازی', 'زمین به‌علاوه‌ی <b>منطقه‌ی آزاد</b>: ۵ متر کنار، ۶٫۵ متر پشت خط انتها.', 'FIVB Event Regulations · Art. 15', 'c') +
    s2('12.5', 'm', 'ارتفاع آزاد', 'حداقل ارتفاع بدون مانع از کف، برای <b>سازه‌ی سقف</b> و تجهیزات.', 'FIVB Event Regulations · Art. 15', 'c')),
  'FIVB Event Regulations · Official Volleyball Rules')

# ============================================================ 10 VOLLEY CHANGING
slide('والیبال · رختکن و دوش', 'والیبال — پیش‌ورودی، تعویض، دوش',
  fig('p-013', 60, 205, 880, cap='پلان رختکن تیم: <b>پیش‌ورودی</b> حریم‌دار ← تعویض و کمدها ← گذار مرطوب ← دوش') +
  fig('g-chcompare', 975, 205, 340, 560, crop=(780, 40, 590, 990), cap='پلان رختکن تیم والیبال') +
  colR(90, 205, 470,
    s2('30', 'm²', 'رختکن تیم والیبال', 'فضایی برای <b>تعویض</b>، <b>کمد</b>، <b>دوش</b> و سرویس تیم؛ با پیش‌ورودی حریم‌دار.', 'FIVB Event Regulations · Art. 22', 'c') +
    '<div class="g3" style="grid-template-columns:1fr 1fr;gap:12px 24px">' +
    s2('4', '', 'دوش', '', '', 'c') + s2('3', '', 'توالت', '', '', 'c') +
    s2('15', '', 'کمد', '', '', 'c') + s2('1', '', 'تخت ماساژ', '', '', 'c') + '</div>'),
  'FIVB Event Regulations — Art. 22 · تیم‌ها: حداقل ۴ رختکن در هر سالن')

# ============================================================ 11 VOLLEY SPECTATOR + OFFICIALS
slide('والیبال · داوران و تماشاگر', 'والیبال — تفکیک مسیر داوران، ورزشکار و تماشاگر',
  fig('p-017', 560, 205, 1290, cap='پلان مسیرهای داوران، ورزشکار و تماشاگر؛ راهنمای رنگ از خود نقشه') +
  colL(60, 215, 460,
    lede('<b>ورودی ویژه‌ی داوران</b> جدا از عموم، و <b>رختکن داوران</b> مستقل از تیم‌هاست.') +
    sw('#2e7d32', 'داوران', 'ورودی اختصاصی ← رختکن ← زمین') + sw('#2a62b6', 'ورزشکار و تیم', 'رختکن تا نیمکت') +
    sw('#e08a1e', 'تماشاگر', 'گردش بیرونی سالن') +
    s2('6', '', 'رختکن در هر سالن', '۴ اتاق برای تیم‌ها و ۲ اتاق برای داوران و مسئولان.', 'FIVB Event Regulations · Art. 22', 'c')),
  'FIVB Event Regulations 2025–2026')

# ============================================================ 12 BASKET COURT
slide('بسکتبال · فضای مسابقه', 'بسکتبال — زمین، حریم پیرامونی و ارتفاع آزاد',
  fig('g-bcourt', 60, 205, 1150, svg=LABI(1766, 626, 124, 60, 'MEDIA ACCESS', 20), big=True, cap='پلان فضای مسابقه و عملیات: نیمکت‌ها، میز مسابقه، ورودی‌های ورزشکار و رسانه') +
  colR(90, 205, 480,
    s2('28×15', 'm', 'زمین بازی', 'مرز بازی؛ همراه با <b>حاشیه‌ی آزاد</b> کل محوطه حداقل ۳۲×۱۹ متر می‌شود.', 'FIBA Official Rules · Venue Guide', 'c') +
    s2('2', 'm', 'حاشیه‌ی آزاد', 'فاصله‌ی ایمن میان خط زمین، <b>نیمکت‌ها</b> و <b>جایگاه</b>.', 'FIBA Venue Guide', 'c') +
    s2('7', 'm', 'ارتفاع آزاد', 'حداقل بدون مانع؛ برای رویدادهای تلویزیونی ۱۴ متر توصیه می‌شود.', 'FIBA Venue Guide', 'c')),
  'FIBA Official Basketball Rules · FIBA Venue Guide')

# ============================================================ 13 BASKET ATHLETE
ov = (DOT(485, 330, 1, 36) + DOT(1090, 330, 1, 36) + DOT(800, 718, 2, 36) + DOT(790, 830, 3, 36) + DOT(805, 1060, 4, 36))
slide('بسکتبال · ورزشکار', 'توالی حرکت ورزشکار از رختکن تا فضای مسابقه',
  fig('g-bsupport', 60, 205, 980, svg=ov, big=True, cap='پلان رختکن‌ها، پزشکی و راهروی ورزشکار؛ شماره‌ها: تحلیل معماری') +
  colR(90, 205, 520,
    lede('مسیر از <b>ورودی امن تیم</b> تا <b>نیمکت</b> باید کوتاه، <b>کنترل‌شده</b> و برای میزبان و میهمان <b>مستقل</b> باشد.') +
    keys(['دو رختکن <b>هم‌اندازه</b> با اتاق مربی', 'راهروی امن ورزشکار', 'پزشکی و دوپینگ در <b>مجاورت</b>', 'دسترسی جدا به زمین و نیمکت'])),
  'FIBA Venue Guide — Team changing rooms')

# ============================================================ 14 BASKET CHANGING
slide('بسکتبال · رختکن تیم', 'رختکن تیم بسکتبال: ظرفیت، نشیمن، دوش و مجاورت',
  fig('g-bsupport', 60, 205, 660, 540, crop=(250, 190, 790, 640), cap='رختکن میزبان: کمدها، پله، اتاق مربی') +
  fig('g-chcompare', 750, 205, 400, 540, crop=(1360, 40, 640, 990), cap='پلان رختکن تیم بسکتبال') +
  colR(90, 205, 440,
    s2('50', 'm²', 'رختکن تیم', 'حداقل مساحت برای سازمان‌دهی <b>کمد</b>، <b>نشیمن</b>، <b>دوش</b> و گردش داخلی.', 'FIBA Venue Guide', 'c') +
    '<div class="note">اتاق مربی ≥ ۲۰ متر مربع، <b>مجاور</b> رختکن.</div>') +
  '<div class="g3" style="position:absolute;left:60px;right:90px;top:800px;grid-template-columns:repeat(3,1fr)">' +
  s2('17', '', 'کمد (حداقل)', 'ابعاد پیشنهادی ۹۰۰×۶۰۰×۲۴۰۰ میلی‌متر.', '', 'c') +
  s2('20', '', 'جای نشستن', 'نیمکت یا صندلی شست‌وشوپذیر.', '', 'c') +
  s2('2.7', 'm', 'ارتفاع سقف', 'درها حداقل ۲٫۲ متر.', 'FIBA Venue Guide', 'c') + '</div>',
  'FIBA Venue Guide — Team changing rooms')

# ============================================================ 15 BASKET SPECTATOR
slide('بسکتبال · جایگاه', 'سازمان‌دهی جایگاه و خط دید در سالن بسکتبال',
  fig('g-bseating', 740, 205, 1090, cap='پلان نشیمن و برش خط دید: جایگاه پله‌ای، دسترسی‌ها و جای ویژه‌ی معلولان') +
  colL(60, 215, 640,
    lede('<b>خط دید</b> هر تماشاگر باید از روی سر ردیف جلو عبور کند؛ <b>ارتفاع پله‌ها</b> نسبت به زمین همین را تأمین می‌کند.') +
    s2('865', 'mm', 'عمق ردیف', 'حداقل عمق پله‌ی نشیمن؛ توصیه‌ی راهنما برای نشستن و <b>گذر</b> راحت.', 'FIBA Venue Guide', 'c') +
    s2('465', 'mm', 'فاصله‌ی صندلی‌ها', 'از مرکز تا مرکز؛ تعیین‌کننده‌ی <b>ظرفیت</b> هر ردیف.', 'FIBA Venue Guide', 'c')),
  'FIBA Venue Guide — Spectator seating & sightlines')

# ============================================================ 16 SUPPORT
slide('پشتیبانی', 'لایه‌ی خدماتی: دسترسی مستقل به فضای مسابقه',
  fig('g-bsupport', 60, 205, 800, cap='رختکن‌ها، پزشکی و کنترل دوپینگ: مجاور مسیر ورزشکار') +
  fig('g-boh', 1010, 205, 810, 570, crop=(1080, 40, 920, 800), cap='استخر: فنی، فیلتراسیون و باراندازی') +
  colR(90, 900, 1740,
    '<div class="chips"><span><b>پزشکی</b> و کنترل دوپینگ</span><span><b>انبار</b> تجهیزات</span><span>اتاق‌های <b>فنی</b></span><span><b>باراندازی</b></span><span>مسیر <b>خدماتی</b> مستقل</span></div>'),
  'FIBA Venue Guide — medical & doping control · طرح‌های سالن و استخر')

# ============================================================ 17 CHANGING COMPARISON
slide('مقایسه', 'مقایسه‌ی رختکن‌ها: سه منطق، سه سازمان فضایی',
  fig('g-chcompare', 60, 205, 1250, cap='سه رختکن در یک پلان: شنا، والیبال، بسکتبال') +
  colR(90, 205, 440,
    '<div class="mini"><h3>بسکتبال</h3><div class="n"><bdi dir="ltr">50<small> m²</small></bdi></div><p>دو رختکن <b>هم‌اندازه</b> با اتاق مربی و پزشکی در مجاورت.</p></div>'
    '<div class="mini"><h3>والیبال</h3><div class="n"><bdi dir="ltr">30<small> m²</small></bdi></div><p><b>پیش‌ورودی</b> حریم‌دار و گذار مرطوب پیش از دوش.</p></div>'
    '<div class="mini"><h3>شنا</h3><p>رختکن بخشی از <b>گذار مرطوب</b> تا عرشه است: <b>خشک ← مرطوب</b>.</p></div>'),
  'FIBA Venue Guide · FIVB Event Regulations · World Aquatics')

# ============================================================ 18 SPATIAL COMPARISON
slide('مقایسه', 'مقایسه‌ی سازمان فضایی: سه ورزش، سه سیستم معماری',
  fig('g-spcompare', 60, 205, 1150, cap='پلان و برش جایگاه تماشاگر در شنا، والیبال و بسکتبال') +
  colR(90, 205, 410,
    '<div class="mini"><h3>شنا</h3><div class="n"><bdi dir="ltr">50×25<small> m</small></bdi></div><p><b>عرشه‌ی مرطوب</b> میان استخر و جایگاه.</p></div>'
    '<div class="mini"><h3>والیبال</h3><div class="n"><bdi dir="ltr">18×9<small> m</small></bdi></div><p><b>منطقه‌ی آزاد</b> و گردش پیرامونی.</p></div>'
    '<div class="mini"><h3>بسکتبال</h3><div class="n"><bdi dir="ltr">28×15<small> m</small></bdi></div><p><b>جایگاه محیطی</b> و حریم ۲ متری.</p></div>'),
  'World Aquatics · FIVB · FIBA')

# ============================================================ 19 CASE STUDY
cs = fig('c-0', 60, 205, 900, cap='برش: استخر در پایین‌ترین تراز، سالن در تراز بالاتر')
for i, (k, t) in enumerate([('c-5', 'تراز −۱: استخر'), ('c-3', 'تراز ۱: سالن'), ('c-2', 'تراز ۲'), ('c-1', 'تراز ۳')]):
    cs += fig(k, 1000 + (i % 2) * 430, 205 + (i // 2) * 320, 410, cap=t)
cs += colR(90, 880, 1740, lede('<b>توالی ترازها</b>: استخر در پایین‌ترین تراز، <b>سالن</b> بالاتر، و <b>فضاهای پشتیبانی</b> در نوار کناری هر تراز.'))
slide('نمونه‌ی موردی', 'از استاندارد تا ساختمان: توالی ترازها در یک مجموعه‌ی ورزشی', cs,
  'نمونه‌ی معماری · پلان‌ها و برش پروژه')

# ============================================================ 20 CONCLUSIONS
slide('جمع‌بندی', 'جمع‌بندی معماری',
  fig('g-arrows', 60, 205, 880, cap='جریان‌های حرکتی در پلان یک سالن چندمنظوره') +
  colR(90, 205, 840,
    '<ol class="cons">'
    '<li><b>ورزشکار</b>، <b>تماشاگر</b> و <b>خدمات</b> سه نظام حرکتی مستقل‌اند.</li>'
    '<li><b>رختکن و دوش</b> حلقه‌ی اتصال ورزشکار به فضای مسابقه‌اند؛ توالی <b>خشک ← مرطوب</b> حفظ می‌شود.</li>'
    '<li><b>ابعاد استاندارد</b> فضای مسابقه را تعریف می‌کنند؛ <b>پیرامون</b> آن را معماری سازمان می‌دهد.</li>'
    '<li><b>جایگاه</b> باید هم‌زمان <b>دید</b>، <b>دسترسی</b> و <b>تخلیه</b> را پاسخ دهد.</li>'
    '<li><b>لایه‌ی خدماتی</b> مستقل، عملکرد را بدون مزاحمت برای مسیر عمومی ممکن می‌کند.</li></ol>'),
  'جمع‌بندی')

# ============================================================ 21 SOURCES
def L(u): return f'<a href="{u}">{u.replace("https://","")}</a>'
slide('منابع', 'منابع',
  colR(90, 200, 1740,
    '<div class="srcg">'
    '<div><h3>استانداردهای رسمی</h3>'
    '<p><b>FIBA</b> — Venue Guide' + L('https://www.venueguide.fiba.basketball/vanue-design') + '</p>'
    '<p><b>FIBA</b> — Official Basketball Rules 2024' + L('https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2024-v10a.pdf') + '</p>'
    '<p><b>FIVB</b> — Event Regulations 2025/2026' + L('https://www.fivb.com/wp-content/uploads/2024/06/FIVB-Event-Regulations-2026_27022026_clean.pdf') + '</p>'
    '<p><b>FIVB</b> — Official Volleyball Rules 2025–2028' + L('https://www.fivb.com/wp-content/uploads/2025/01/FIVB-Volleyball_Rules2025_2028-EN-v05.pdf') + '</p>'
    '<p><b>World Aquatics</b> — Facilities Rules · Pool Certification' + L('https://www.worldaquatics.com/rules/facilities') + '</p></div>'
    '<div><h3>راهنمای طراحی معماری</h3>'
    '<p><b>Sport England</b> — Sports Halls' + L('https://www.sportengland.org/guidance-and-support/facilities-and-planning/design-and-cost-guidance/sports-halls') + '</p>'
    '<p><b>Sport England</b> — Swimming Pools' + L('https://www.sportengland.org/guidance-and-support/facilities-and-planning/design-and-cost-guidance/swimming-pools') + '</p>'
    '<p><b>Sport England</b> — Combined Leisure Provision' + L('https://www.sportengland.org/guidance-and-support/facilities-and-planning/design-and-cost-guidance/combined-leisure-provision') + '</p>'
    '<p><b>Sport England</b> — Accessible Sports Facilities (2010)' + L('https://www.sportengland.org/media/30246/accessible-sports-facilities-2010.pdf') + '</p></div>'
    '<div><h3>نمونه‌ها و پلان‌ها</h3>'
    '<p><b>پلان‌ها و برش‌ها</b> — نقشه‌های مرجع سالن‌های ورزشی، با تحلیل افزوده‌ی ارائه.</p>'
    '<p><b>نمونه‌ی موردی</b> — مجموعه‌ی ورزشی چندترازی؛ فقط به‌عنوان نمونه‌ی معماری، نه مرجع ابعاد.</p></div></div>'),
  'ارائه‌ی کلاسی · معماری فضاهای ورزشی')

# ------------------------------------------------------------ render
N = len(SLIDES)
secs = ''
for i, s in enumerate(SLIDES, 1):
    if s['c'] == 'cover':
        head = (f'<header class="ch"><div class="kicker"><b>01</b><i></i>ارائه‌ی کلاسی · معماری فضاهای ورزشی</div>'
                f'<h1>{s["t"]}</h1><div class="sub">{s["l"]}</div></header>')
    else:
        head = f'<header><div class="kicker"><b>{i:02d}</b><i></i>{s["k"]}</div><h1>{s["t"]}</h1></header>'
    secs += (f'<section class="slide {s["c"]}" data-title="{s["t"]}">{head}{s["b"]}'
             f'<footer><div class="src">{s["s"]}</div><div class="pg">{i:02d} <span>/ {N:02d}</span></div></footer></section>\n')

CSS = open(os.path.join(HERE, 'v2.css'), encoding='utf8').read()
JS = open(os.path.join(HERE, 'v2.js'), encoding='utf8').read()
used = set(re.findall(r'data-img="([^"]+)"', secs))
imgs = {k: 'data:image/jpeg;base64,' + base64.b64encode(open(PATHS[k], 'rb').read()).decode() for k in sorted(used)}
print('images', sorted(used))
html = open(os.path.join(HERE, 'v2_shell.html'), encoding='utf8').read()
html = (html.replace('%%FONT%%', FONT).replace('%%CSS%%', CSS).replace('%%SLIDES%%', secs)
        .replace('%%N%%', f'{N:02d}').replace('%%IMGS%%', json.dumps(imgs)).replace('%%JS%%', JS))
open(os.path.join(HERE, 'presentation_v2.html'), 'w', encoding='utf8').write(html)
print('slides', N, 'bytes', len(html))
