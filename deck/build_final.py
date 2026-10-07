#!/usr/bin/env python3
"""Builds presentation_final.html (single standalone file) from deck/img/*.jpg."""
import base64, json, os, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, 'img')
FONT = open(os.path.join(HERE, 'vazir.b64')).read().strip()
DIMS = {}
for f in os.listdir(IMG):
    if f.endswith('.jpg'):
        DIMS[f[:-4]] = Image.open(os.path.join(IMG, f)).size

# ---------------------------------------------------------------- helpers
ST = {'o': 'استاندارد رسمی', 'g': 'راهنمای طراحی', 'r': 'توصیه طراحی',
      'a': 'تحلیل معماری', 'u': 'تأییدنشده'}
def st(k): return f'<span class="st st-{k}">{ST[k]}</span>'

def fig(img, x, y, w, h=None, crop=None, svg='', cap='', fx=0, fy=0, cls=''):
    iw, ih = DIMS[img]
    cx, cy, cw, ch = crop or (0, 0, iw, ih)
    if h is None: h = round(w * ch / cw)
    s = max(w / cw, h / ch)                       # cover scale
    vw, vh = w / s, h / s                         # visible source rect
    vx = cx + (cw - vw) / 2 + fx
    vy = cy + (ch - vh) / 2 + fy
    left, top = -vx * s, -vy * s
    ov = f'<svg viewBox="{vx:.1f} {vy:.1f} {vw:.1f} {vh:.1f}" preserveAspectRatio="none">{svg}</svg>' if svg else ''
    c = f'<div class="cap" style="left:{x}px;top:{y+h+8}px;width:{w}px">{cap}</div>' if cap else ''
    return (f'<div class="fig {cls}" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px">'
            f'<img data-img="{img}" alt="" style="width:{iw*s:.1f}px;height:{ih*s:.1f}px;left:{left:.1f}px;top:{top:.1f}px">{ov}</div>{c}')

def col(right, top, width, html, cls=''):
    return f'<div class="col {cls}" style="right:{right}px;top:{top}px;width:{width}px">{html}</div>'

def stat(n, unit, t, src='', tag='', size='', dash=False):
    d = ' dashed' if dash else ''
    return (f'<div class="stat {size}{d}"><div class="n"><bdi dir="ltr">{n}</bdi><small>{unit}</small></div>'
            f'<div class="t">{t}</div><div class="m">{src} {tag}</div></div>')

def nodata(t='در منبع استاندارد بررسی‌شده عدد مشخصی ارائه نشده است.'):
    return f'<div class="nodata">{t}</div>'

SLIDES = []
def slide(kicker, title, body, src, cls='', lede=''):
    SLIDES.append(dict(k=kicker, t=title, b=body, s=src, c=cls, l=lede))

DOT = lambda x, y, n, r=24: (f'<circle class="dot" cx="{x}" cy="{y}" r="{r}"/>'
                             f'<text class="dn" x="{x}" y="{y}" style="font-size:{r*1.2:.0f}px">{n}</text>')
def LAB(x, y, w, h, t, fs=24):
    return (f'<rect class="patch" x="{x}" y="{y}" width="{w}" height="{h}"/>'
            f'<text class="pt" x="{x+w/2}" y="{y+h/2}" style="font-size:{fs}px">{t}</text>')

# ================================================================ 01 COVER
slide('', 'استانداردهای طراحی فضاهای ورزشی',
 fig('p-001', 60, 330, 1180, cap='طرح مرجع پژوهش (مفهومی) — استخر، سالن والیبال، سالن بسکتبال') +
 col(90, 340, 480,
   '<div class="abc"><div><b>A</b>تماشاگر و فضاهای پشتیبانی</div><div><b>B</b>ورزشکار و بازیکن</div>'
   '<div><b>C</b>رختکن و دوش</div></div>'
   '<div class="who" contenteditable="true" spellcheck="false">نام ارائه‌دهنده · درس · استاد</div>')
 , 'FIBA · FIVB · World Aquatics · Sport England', cls='cover',
 lede='شنا  ·  والیبال  ·  بسکتبال')

# ================================================================ 02 USER SYSTEMS + QUESTION
slide('کاربران', 'یک ساختمان، سه نظام کاربری',
 fig('p-015', 60, 215, 1180, cap='طرح مرجع پژوهش (مفهومی) — رنگ‌ها طبق راهنمای خود تصویر') +
 col(90, 240, 520,
   '<div class="q">پرسش پژوهش</div><div class="qt">ساختمان چگونه مسیر ورزشکار، تماشاگر و خدمات را جدا می‌کند و همه را به زمین می‌رساند؟</div>'
   '<ol class="trio"><li><b>A</b>ورزشکار و داور<small>ورودی اختصاصی ← رختکن ← زمین</small></li>'
   '<li><b>B</b>تماشاگر<small>ورودی عمومی ← گردش ← سکو</small></li>'
   '<li><b>C</b>پشتیبانی و سرویس<small>باراندازی، انبار، تأسیسات</small></li></ol>'),
 'طرح مرجع پژوهش · تفکیک جریان‌ها: FIBA Venue Guide', lede='')

# ================================================================ 03 SPATIAL ORGANISATION
ov = ('<rect class="zone" x="440" y="285" width="325" height="170"/>'
      '<polygon class="ring" points="315,240 400,170 790,170 880,240 880,540 790,600 400,600 315,540"/>'
      '<rect class="ring2" x="282" y="118" width="625" height="508"/>' +
      DOT(602, 370, 1) + DOT(350, 380, 2) + DOT(602, 143, 3) + DOT(150, 330, 4) + DOT(1040, 200, 4))
slide('سازمان فضایی', 'هسته، کاسه، حلقه، حاشیه',
 fig('p-008', 60, 205, 1250, svg=ov, cap='طرح مرجع پژوهش · لایه‌ی تحلیلی افزوده‌ی ارائه') +
 col(90, 230, 430,
   '<ol class="keys"><li><b>1</b>هسته<small>زمین مسابقه</small></li><li><b>2</b>کاسه<small>سکوی تماشاگر</small></li>'
   '<li><b>3</b>حلقه<small>گردش دور کاسه</small></li><li><b>4</b>حاشیه<small>ورزشکار، پشتیبانی، فنی</small></li></ol>'
   f'<div class="note">{st("a")} این خوانش از پلان مرجع است، نه الزام استاندارد.</div>'),
 'تحلیل معماری روی پلان مرجع پژوهش')

# ================================================================ 04 CIRCULATION
slide('گردش', 'سه مسیر، کمترین تقاطع',
 fig('p-018', 60, 205, 1300, cap='طرح مرجع پژوهش (مفهومی) — راهنمای رنگ از خود تصویر') +
 col(90, 240, 380,
   '<div class="sw"><i style="background:#2a62b6"></i><div>ورزشکار<small>ورودی اختصاصی تا زمین</small></div></div>'
   '<div class="sw"><i style="background:#e08a1e"></i><div>تماشاگر<small>لابی عمومی تا سکو</small></div></div>'
   '<div class="sw"><i style="background:#b0268a"></i><div>سرویس<small>باراندازی و تأسیسات</small></div></div>'
   '<div class="sw"><i class="x">×</i><div>نقطه‌ی تعارض<small>جایی که دو مسیر هم‌دیگر را قطع می‌کنند</small></div></div>'
   f'<div class="note">FIBA: جریان‌ها جدا از هم طراحی شوند. {st("g")}</div>'),
 'FIBA Venue Guide — تفکیک گردش · طرح: مرجع پژوهش')

# ================================================================ 05 SWIM 1
ov = ('<g class="dm"><line x1="200" y1="150" x2="1015" y2="150"/><line x1="200" y1="138" x2="200" y2="162"/><line x1="1015" y1="138" x2="1015" y2="162"/></g>' +
      LAB(742, 134, 120, 34, '50 m', 26) +
      '<g class="dm"><line x1="1135" y1="160" x2="1135" y2="430"/><line x1="1123" y1="160" x2="1147" y2="160"/><line x1="1123" y1="430" x2="1147" y2="430"/></g>' +
      LAB(1100, 280, 70, 32, '25 m', 22))
slide('شنا · استخر', 'استخر و عرشه: هسته‌ی مرطوب',
 fig('p-023', 60, 205, 1290, svg=ov, cap='طرح مرجع پژوهش · ابعاد: افزوده‌ی ارائه · نسبت ترسیم دقیق ۲:۱ نیست') +
 col(90, 215, 400,
   stat('50×25', 'm', 'استخر رقابتی', 'World Aquatics', st('o')) +
   stat('2.5', 'm', 'عرض هر خط شنا', 'World Aquatics', st('o')) +
   stat('7 / 5 / 4–6', 'm', 'حاشیه‌ی عرشه‌ی استخر 50 متری', 'ابتدا / انتها / کنار · Sport England', st('g'), size='sm') +
   '<div class="note">فقط استخر رقابتی؛ نه آموزشی یا عمومی.</div>'),
 'World Aquatics Facilities Rules / Pool Certification · Sport England Swimming Pools')

# ================================================================ 06 SWIM 2
ov = ('<line class="rt" x1="848" y1="22" x2="848" y2="728" style="stroke-dasharray:14 9"/>'
      '<path class="ar" d="M120 520 L330 505 L440 380 L690 345 L905 345 L905 250 L1075 250"/>'
      '<polygon class="ah" points="1075,232 1110,250 1075,268"/>' +
      DOT(130, 470, 1) + DOT(445, 330, 2) + DOT(690, 440, 3) + DOT(905, 410, 4) + DOT(1160, 330, 5))
slide('شنا · ورزشکار', 'از خشک به مرطوب: یک زنجیره',
 fig('p-007', 60, 200, 1288, 760, svg=ov, cap='طرح مرجع پژوهش (مفهومی) · مسیر و شماره‌ها: لایه‌ی تحلیلی') +
 col(90, 230, 400,
   '<ol class="keys sm"><li><b>1</b>ورودی ورزشکار</li><li><b>2</b>رختکن و کمد</li><li><b>3</b>دوش، توالت، آمادگی</li>'
   '<li><b>4</b>گردش مرطوب</li><li><b>5</b>عرشه و استخر</li></ol>'
   '<div class="legend"><i></i>خط‌چین عمودی: مرز خشک ← مرطوب</div>' +
   nodata('مساحت رختکن و تعداد دوش: در منبع استاندارد بررسی‌شده عدد مشخصی ارائه نشده است.')),
 'طرح مرجع پژوهش · سند تأیید استخر World Aquatics عدد رختکن ندارد')

# ================================================================ 07 SWIM 3
slide('شنا · تماشاگر و پشتیبانی', 'سکوی خشک، پشت‌صحنه‌ی فنی',
 col(1000, 215, 820, '<div class="sub">تماشاگر</div>') + col(100, 215, 820, '<div class="sub">پشتیبانی</div>') +
 fig('p-025', 60, 280, 800, cap='سکو و حائل جداکننده — طرح مرجع پژوهش') +
 fig('p-005', 1020, 280, 800, cap='پشتیبانی، فنی و باراندازی — طرح مرجع پژوهش') +
 col(1000, 815, 820, '<ul class="pts"><li>مانع جداکننده‌ی ورزشکار و تماشاگر</li><li>رمپ و جای ویژه‌ی معلولان</li></ul>') +
 col(100, 815, 820, '<ul class="pts"><li>فیلتراسیون و اتاق‌های فنی</li><li>باراندازی و مسیر سرویس جدا</li></ul>') +
 col(100, 948, 1730, '<div class="nodata one">ظرفیت سکو، زاویه‌ی دید و ابعاد اتاق‌های فنی: در منبع استاندارد بررسی‌شده عدد مشخصی ارائه نشده است.</div>'),
 'طرح‌های مرجع پژوهش (مفهومی) · World Aquatics (سند بررسی‌شده: فقط مشخصات استخر)')

# ================================================================ 08 VOLLEY 1
ov = (LAB(372, 352, 116, 46, '9×9 m', 26) + LAB(689, 352, 116, 46, '9×9 m', 26) +
      LAB(352, 360, 30, 30, '', 10) + LAB(396, 438, 56, 24, '6 m', 20) + LAB(722, 438, 50, 24, '6 m', 20) +
      '<text class="pt" x="367" y="376" style="font-size:20px" transform="rotate(-90 367 376)">9 m</text>')
slide('والیبال · زمین', 'زمین، منطقه‌ی آزاد، نیمکت‌ها',
 fig('p-022', 60, 205, 1250, svg=ov, cap='طرح مرجع پژوهش · برچسب‌های ابعاد نیمه‌زمین اصلاح شد: هر نیمه 9×9 م، خط حمله 3 م از تور') +
 col(90, 230, 430,
   stat('18×9', 'm', 'زمین بازی', 'FIVB Event Regulations', st('o')) +
   stat('5 | 6.5', 'm', 'منطقه‌ی آزاد: کنار | پشت', 'FIVB (رقابت‌های جهانی)', st('o')) +
   stat('12.5', 'm', 'ارتفاع آزاد از کف', 'FIVB (رقابت‌های جهانی)', st('o'))),
 'FIVB Event Regulations 2026 — Art. 15 · طرح: مرجع پژوهش')

# ================================================================ 09 VOLLEY 2
slide('والیبال · ورزشکار', 'پیش‌ورودی، رختکن، دوش',
 fig('p-013', 60, 205, 1250, cap='طرح مرجع پژوهش (مفهومی) — ورودی با پیش‌ورودی حریم‌دار ← رختکن ← گذرگاه مرطوب ← دوش') +
 col(90, 230, 470,
   f'<div class="note top">اعداد زیر از پژوهش شماست و با متن ماده‌ی مربوط در FIVB تطبیق داده نشد. {st("u")}</div>'
   '<div class="g2">' + stat('30', 'm²', 'مساحت', '', '', 'sm', True) + stat('4', '', 'دوش', '', '', 'sm', True) +
   stat('15', '', 'کمد', '', '', 'sm', True) + stat('15', '', 'جای نشستن', '', '', 'sm', True) +
   stat('3', '', 'توالت فرنگی', '', '', 'sm', True) + stat('1', '', 'تخت ماساژ', '', '', 'sm', True) + '</div>'),
 'FIVB Event Regulations — فصل رختکن تیم‌ها (عدد تأییدنشده؛ پیش از ارائه با متن جاری تطبیق شود)')

# ================================================================ 10 VOLLEY 3
slide('والیبال · داوران و تماشاگر', 'سه مسیر جدا در یک سالن',
 fig('p-017', 60, 205, 1290, cap='طرح مرجع پژوهش (مفهومی) — راهنمای رنگ از خود تصویر') +
 col(90, 230, 420,
   '<div class="sw"><i style="background:#2e7d32"></i><div>داور<small>ورودی ویژه، جدا از عموم</small></div></div>'
   '<div class="sw"><i style="background:#2a62b6"></i><div>ورزشکار و تیم<small>رختکن تا نیمکت</small></div></div>'
   '<div class="sw"><i style="background:#e08a1e"></i><div>تماشاگر<small>گردش بیرونی سالن</small></div></div>' +
   nodata('مساحت رختکن داوران: در منبع استاندارد بررسی‌شده عدد مشخصی ارائه نشده است.')),
 'طرح مرجع پژوهش (مفهومی) · FIVB Event Regulations 2026')

# ================================================================ 11 BASKET 1
slide('بسکتبال · زمین', 'زمین 28×15 و حریم دور آن',
 fig('p-010', 60, 205, 1200, cap='طرح مرجع پژوهش (مفهومی) — برچسب‌های ابعاد از خود تصویر') +
 col(90, 230, 430,
   stat('28×15', 'm', 'زمین بازی', 'FIBA', st('o')) +
   stat('2', 'm', 'حاشیه‌ی آزاد دور زمین', 'FIBA Venue Guide', st('o')) +
   stat('7', 'm', 'ارتفاع آزاد بالای زمین', 'FIBA Venue Guide', st('o'))),
 'FIBA Official Basketball Rules · FIBA Venue Guide — Venue design')

# ================================================================ 12 BASKET 2
ov = ('<path class="ar" d="M555 70 L555 455"/><path class="ar" d="M555 488 L330 488 L330 590"/><path class="ar" d="M555 488 L790 488 L790 590"/>'
      '<polygon class="ah" points="312,585 348,585 330,615"/><polygon class="ah" points="772,585 808,585 790,615"/>' +
      DOT(500, 130, 1, 22) + DOT(235, 270, 2, 22) + DOT(940, 270, 2, 22) + DOT(430, 488, 3, 22) + DOT(430, 600, 4, 22) + DOT(690, 600, 4, 22))
slide('بسکتبال · ورزشکار', 'مسیر امن از رختکن تا نیمکت',
 fig('p-006', 60, 205, 1200, svg=ov, cap='طرح مرجع پژوهش (مفهومی) · مسیر و شماره‌ها: لایه‌ی تحلیلی') +
 col(90, 240, 400,
   '<ol class="keys sm"><li><b>1</b>ورودی امن تیم</li><li><b>2</b>دو رختکن برابر</li><li><b>3</b>راهروی امن ورزشکار</li><li><b>4</b>دسترسی جدا به نیمکت</li></ol>'
   f'<div class="note">FIBA: دسترسی امن و جدا از رختکن تا نیمکت؛ بدون تقاطع میزبان و میهمان. {st("o")}</div>'
   f'<div class="note">اتاق کنترل دوپینگ نزدیک رختکن‌ها. {st("o")}</div>'),
 'FIBA Venue Guide — Team changing rooms · Doping control')

# ================================================================ 13 BASKET 3
slide('بسکتبال · رختکن و دوش', 'یک رختکن تیم: چهار عدد کلیدی',
 fig('p-006', 60, 205, 1000, crop=(30, 70, 540, 420), cap='جزئیات: رختکن میزبان — طرح مرجع پژوهش') +
 col(90, 215, 700,
   '<div class="g2">' + stat('50', 'm²', 'مساحت رختکن تیم', '', st('g')) + stat('6', '', 'حداقل سردوش', '', st('g')) +
   stat('17', '', 'حداقل کمد', '', st('g')) + stat('20', '', 'جای نشستن', '', st('g')) + '</div>'
   '<div class="note">منبع: FIBA Venue Guide؛ اعداد با نسخه‌ی جاری راهنما تطبیق نهایی شود.</div>'
   '<div class="note">اتاق پزشکی ۱۵–۳۰ m² نزدیک رختکن و مسیر زمین. ' + st('g') + '</div>'),
 'FIBA Venue Guide — Team changing rooms · Medical')

# ================================================================ 14 BASKET 4
slide('بسکتبال · تماشاگر', 'دید بدون مانع از هر ردیف',
 fig('p-020', 60, 205, 1110, cap='طرح مرجع پژوهش (مفهومی) — پلان نشستن و برش دید') +
 col(90, 230, 450,
   stat('865', 'mm', 'حداقل عمق ردیف', 'FIBA Venue Guide', st('g')) +
   stat('3.7–5.5', 'm', 'فاصله‌ی ردیف اول تا مرز زمین', 'FIBA Venue Guide', st('g')) +
   '<div class="note">خط دید از چشم هر تماشاگر باید از روی سر ردیف جلو عبور کند. ' + st('a') + '</div>'),
 'FIBA Venue Guide — Spectator seating & sightlines · طرح: مرجع پژوهش')

# ================================================================ 15 BOH
slide('پشتیبانی', 'پشت‌صحنه: ساختمان چطور کار می‌کند',
 fig('p-009', 60, 205, 1000, cap='والیبال: انبار، فنی، باراندازی، کمک‌های اولیه') +
 fig('p-005', 1100, 205, 720, 630 * 1, crop=(780, 20, 438, 700), cap='شنا: فیلتراسیون، فنی، باراندازی') +
 col(100, 905, 1700,
   '<div class="chips"><span>ورودی و باراندازی</span><span>انبار تجهیزات</span><span>اتاق‌های فنی</span><span>کمک‌های اولیه</span><span>مسیر سرویس جدا</span></div>') ,
 'طرح‌های مرجع پژوهش (مفهومی) · ابعاد این فضاها: در منبع استاندارد بررسی‌شده عدد مشخصی ارائه نشده است')

# ================================================================ 16 SCALE (drawn from verified dimensions)
S = 14
def R(x, y, w, h, c): return f'<rect class="{c}" x="{x}" y="{y}" width="{w}" height="{h}"/>'
def scale_svg():
    o = ''
    base = 360  # common baseline center y
    # pool 50x25
    px, pw, ph = 20, 50 * S, 25 * S
    py = base - ph / 2
    o += R(px, py, pw, ph, 'pool')
    for i in range(1, 10):
        yy = py + i * 2.5 * S
        o += f'<line class="lane" x1="{px}" x2="{px+pw}" y1="{yy}" y2="{yy}"/>'
    # volleyball: court 18x9, free zone 5 / 6.5
    vx = px + pw + 60
    fw, fh = (18 + 13) * S, (9 + 10) * S
    cw, chh = 18 * S, 9 * S
    o += R(vx, base - fh / 2, fw, fh, 'fz')
    o += R(vx + 6.5 * S, base - chh / 2, cw, chh, 'court')
    o += f'<line class="ink" x1="{vx+fw/2}" x2="{vx+fw/2}" y1="{base-chh/2}" y2="{base+chh/2}" style="stroke-width:4"/>'
    for dx in (-3 * S, 3 * S):
        o += f'<line class="lane" x1="{vx+fw/2+dx}" x2="{vx+fw/2+dx}" y1="{base-chh/2}" y2="{base+chh/2}"/>'
    # basketball: court 28x15 + 2 m
    bx = vx + fw + 60
    bw, bh = 32 * S, 19 * S
    o += R(bx, base - bh / 2, bw, bh, 'fz')
    o += R(bx + 2 * S, base - 7.5 * S, 28 * S, 15 * S, 'court')
    o += f'<line class="ink" x1="{bx+bw/2}" x2="{bx+bw/2}" y1="{base-7.5*S}" y2="{base+7.5*S}"/>'
    o += f'<circle class="ink" cx="{bx+bw/2}" cy="{base}" r="{1.8*S}" style="fill:none"/>'
    # captions
    def T(x, t, big, sm):
        return (f'<text class="bigt" x="{x}" y="610">{big}</text><text class="smt" x="{x}" y="662">{t}</text>'
                f'<text class="srct" x="{x}" y="705">{sm}</text>')
    o += T(px + pw / 2, 'استخر رقابتی', '50 × 25 m', 'World Aquatics')
    o += T(vx + fw / 2, 'زمین والیبال + منطقه‌ی آزاد', '18 × 9 m', 'FIVB')
    o += T(bx + bw / 2, 'زمین بسکتبال + حاشیه‌ی آزاد', '28 × 15 m', 'FIBA')
    return o
svg_scale = f'<svg class="scale" viewBox="0 0 1780 760" style="left:60px;top:140px;width:1780px;height:760px">{scale_svg()}</svg>'
slide('استاندارد', 'سه فضای اصلی در یک مقیاس',
 svg_scale +
 col(90, 940, 1750, '<div class="legend row"><span><i class="k1"></i>زمین / استخر</span><span><i class="k2"></i>منطقه‌ی آزاد: والیبال <bdi dir="ltr">5 / 6.5 m</bdi> · بسکتبال <bdi dir="ltr">2 m</bdi></span>'
     '<span>' + st('a') + ' ترسیم ساده‌شده با ابعاد استاندارد؛ بدون نقشه‌ی ساختمان</span></div>'),
 'World Aquatics · FIVB Event Regulations (Art. 15) · FIBA Venue Guide')

# ================================================================ 17 CHANGING COMPARISON
slide('رختکن', 'سه رختکن، سه منطق',
 fig('p-000', 60, 205, 1300, cap='طرح مرجع پژوهش (مفهومی) — برچسب‌های متنی تصویر مقیاس رسمی نیستند') +
 col(90, 230, 400,
   '<div class="cmp"><h3>بسکتبال</h3><div class="n"><bdi dir="ltr">50 m²</bdi></div><div class="m">FIBA ' + st('g') + '</div></div>'
   '<div class="cmp"><h3>والیبال</h3><div class="n dash"><bdi dir="ltr">30 m²</bdi></div><div class="m">FIVB ' + st('u') + '</div></div>'
   '<div class="cmp"><h3>شنا</h3>' + nodata('عدد مشخصی در منبع بررسی‌شده ارائه نشده است.') + '</div>'),
 'FIBA Venue Guide · FIVB (از پژوهش شما، تأییدنشده) · World Aquatics (بدون عدد)')

# ================================================================ 18 WET / DRY
slide('دوش', 'یک مرز مشترک: خشک ← مرطوب',
 fig('p-011', 60, 205, 1400, cap='طرح مرجع پژوهش (مفهومی) — شنا · والیبال · بسکتبال') +
 col(90, 240, 330,
   '<ul class="pts"><li><b>شنا</b>گذرگاه مرطوب تا عرشه</li><li><b>والیبال</b>دوش با پرده‌ی حریم</li><li><b>بسکتبال</b>دوش و خشک‌کن بین رختکن و راهرو</li></ul>'
   f'<div class="note">FIBA: کف ضدلغزش در دوش و سرویس. {st("o")}</div>'),
 'FIBA Venue Guide — Team changing rooms · طرح: مرجع پژوهش')

# ================================================================ 19 SPECTATOR COMPARISON
slide('تماشاگر', 'سه ورزش، سه سکو',
 fig('p-012', 60, 205, 1400, crop=(0,28,1287,672), cap='طرح مرجع پژوهش (مفهومی) — پلان و برش دید') +
 col(90, 240, 330,
   '<ul class="pts"><li><b>شنا</b>سکوی یک‌طرفه، پشت عرشه‌ی مرطوب</li><li><b>والیبال</b>کاسه دور زمین</li><li><b>بسکتبال</b>کاسه دور زمین، نشستن کنار زمین</li></ul>'
   f'<div class="note">{st("a")} جمع‌بندی از تصویر مرجع؛ نه الزام.</div>'),
 'طرح مرجع پژوهش · تحلیل معماری')

# ================================================================ 20 THREE-SPORT
slide('مقایسه', 'سه ورزش، سه پلان',
 fig('p-019', 60, 205, 1330, cap='طرح مرجع پژوهش (مفهومی)') +
 col(90, 230, 430,
   '<div class="cmp"><h3>شنا</h3><div class="m">استخر <bdi dir="ltr">50×25 m</bdi> · عرشه‌ی مرطوب</div></div>'
   '<div class="cmp"><h3>والیبال</h3><div class="m">زمین <bdi dir="ltr">18×9 m</bdi> · منطقه‌ی آزاد <bdi dir="ltr">5 / 6.5 m</bdi></div></div>'
   '<div class="cmp"><h3>بسکتبال</h3><div class="m">زمین <bdi dir="ltr">28×15 m</bdi> · حاشیه <bdi dir="ltr">2 m</bdi></div></div>'
   f'<div class="note">{st("a")} ستون‌ها تحلیل معماری‌اند.</div>'),
 'جمع‌بندی اسلایدهای قبل · طرح: مرجع پژوهش')

# ================================================================ 21 CASE STUDY
plans = [('c-5', 'تراز −1'), ('c-3', 'تراز 1'), ('c-2', 'تراز 2'), ('c-1', 'تراز 3')]
cs = fig('c-0', 60, 205, 900, cap='برش — نقشه‌ی مرجع (نام پروژه در مرجع نیامده)')
for i, (k, t) in enumerate(plans):
    cs += fig(k, 1000 + (i % 2) * 430, 205 + (i // 2) * 320, 410, cap=t)
cs += col(90, 860, 1740,
  '<ul class="pts three"><li>استخر در پایین‌ترین تراز</li><li>سالن چندزمینه بالاتر از استخر</li><li>پشتیبانی در نوار کناری هر تراز</li></ul>')
slide('نمونه‌ی موردی', 'استاندارد چگونه معماری می‌شود', cs,
 'نقشه‌های ارائه‌شده توسط ارائه‌دهنده · مقیاس و نام‌ها از خود نقشه · ' + 'تحلیل معماری')

# ================================================================ 22 CONCLUSIONS
slide('نتیجه‌گیری', 'چهار نتیجه‌ی معماری',
 fig('p-024', 60, 205, 1000, cap='طرح مرجع پژوهش — مسیرهای رنگی؛ راهنمای رنگ ندارد (مرجع بصری)') +
 col(90, 215, 740,
   '<ol class="cons"><li>ورزشگاه فقط فضای مسابقه نیست؛ یک سیستم حرکتی چندکاربره است.</li>'
   '<li>مسیر ورزشکار از مسیر عمومی جدا و کنترل می‌شود.</li>'
   '<li>رختکن و دوش یک زنجیره‌ی واحد با زمین‌اند.</li>'
   '<li>استاندارد رسمی از راهنما و تحلیل جدا بماند.</li></ol>'),
 'این‌ها نتیجه‌گیری معماری‌اند، نه مقررات رسمی')

# ================================================================ 23 SOURCES
slide('منابع', 'منابع',
 col(90, 200, 1740,
   '<div class="srcg">'
   '<div><h3>استاندارد رسمی</h3>'
   '<p><b>FIBA</b> — Venue Guide<a href="https://www.venueguide.fiba.basketball/vanue-design">venueguide.fiba.basketball/vanue-design</a></p>'
   '<p><b>FIVB</b> — Event Regulations 2026 · Official Regulations<a href="https://www.fivb.com/volleyball/regulations-and-forms/">fivb.com/volleyball/regulations-and-forms</a></p>'
   '<p><b>World Aquatics</b> — Facilities Rules · Pool Certification<a href="https://www.worldaquatics.com/rules/facilities">worldaquatics.com/rules/facilities</a></p></div>'
   '<div><h3>راهنمای طراحی معماری</h3>'
   '<p><b>Sport England</b> — Sports Halls<a href="https://www.sportengland.org/guidance-and-support/facilities-and-planning/design-and-cost-guidance/sports-halls">sportengland.org · sports-halls</a></p>'
   '<p><b>Sport England</b> — Swimming Pools<a href="https://www.sportengland.org/guidance-and-support/facilities-and-planning/design-and-cost-guidance/swimming-pools">sportengland.org · swimming-pools</a></p>'
   '<p><b>Sport England</b> — Combined Leisure Provision<a href="https://www.sportengland.org/guidance-and-support/facilities-and-planning/design-and-cost-guidance/combined-leisure-provision">sportengland.org · combined-leisure-provision</a></p>'
   '<p><b>Sport England</b> — Accessible Sports Facilities (2010)<a href="https://www.sportengland.org/media/30246/accessible-sports-facilities-2010.pdf">sportengland.org · accessible-sports-facilities</a></p></div>'
   '<div><h3>نمونه‌ها و تصاویر</h3>'
   '<p><b>پلان‌ها و برش‌ها</b> — مرجع پژوهش ارائه‌دهنده (مفهومی)؛ برچسب‌های متنی آن‌ها استاندارد رسمی نیست.</p>'
   '<p><b>نمونه‌ی موردی</b> — نقشه‌های چندطبقه‌ی ارائه‌شده؛ نام و سال پروژه در مرجع ذکر نشده است.</p></div></div>'
   '<div class="legend row big"><span>' + st('o') + ' متن رسمی</span><span>' + st('g') + ' راهنمای منبع</span><span>' + st('r') + ' توصیه</span><span>' + st('a') + ' برداشت ارائه</span><span>' + st('u') + ' با متن جاری تطبیق نشده</span></div>'
   '<div class="note wide">هنگام ساخت این نسخه، دسترسی به سایت منابع بالا ممکن نبود؛ اعداد و برچسب وضعیت آن‌ها از بررسی منبع در نسخه‌ی قبلی حفظ شده‌اند. پیش از ارائه با متن جاری تطبیق شود.</div>'),
 'ارائه‌ی کلاسی · معماری فضاهای ورزشی')

# ---------------------------------------------------------------- render
N = len(SLIDES)
secs = ''
for i, s in enumerate(SLIDES, 1):
    if s['c'] == 'cover':
        head = (f'<header class="ch"><div class="kicker"><b>01</b><i></i>ارائه‌ی کلاسی · معماری فضاهای ورزشی</div>'
                f'<h1>{s["t"]}</h1><div class="sub">{s["l"]}</div></header>')
    else:
        head = f'<header><div class="kicker"><b>{i:02d}</b><i></i>{s["k"]}</div><h1>{s["t"]}</h1></header>'
    secs += (f'<section class="slide {s["c"]}" data-title="{s["t"]}">{head}{s["b"]}'
             f'<footer><div class="src"><b>منبع:</b> {s["s"]}</div><div class="pg">{i:02d} <span>/ {N:02d}</span></div></footer></section>\n')

CSS = open(os.path.join(HERE, 'final.css'), encoding='utf8').read()
JS = open(os.path.join(HERE, 'final.js'), encoding='utf8').read()
imgs = {}
for k in DIMS:
    imgs[k] = 'data:image/jpeg;base64,' + base64.b64encode(open(os.path.join(IMG, k + '.jpg'), 'rb').read()).decode()
html = open(os.path.join(HERE, 'final_shell.html'), encoding='utf8').read()
html = (html.replace('%%FONT%%', FONT).replace('%%CSS%%', CSS).replace('%%SLIDES%%', secs)
        .replace('%%N%%', f'{N:02d}').replace('%%IMGS%%', json.dumps(imgs)).replace('%%JS%%', JS))
out = os.path.join(HERE, 'presentation_final.html')
open(out, 'w', encoding='utf8').write(html)
print('slides', N, 'bytes', len(html))
