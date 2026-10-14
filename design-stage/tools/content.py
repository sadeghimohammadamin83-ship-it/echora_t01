"""Text content shared by the presentation sheets and the report (single source, so all outputs say the same thing).
Every finding cites where it comes from in the site-analysis atlas (site-analysis/index.html, sections 01–22)."""

# status: D = documented in the site analysis / drawing; H = hypothesis to verify; C = calculated here
FINDINGS = [
    # (id, finding, source, status, O/C, design driver)
    ('F1', 'Site sits between Laleh Park (35 ha, north) and the University of Tehran central campus (≈21 ha, south)', 'Atlas 01–03 · OSM', 'D', 'O',
     'A threshold building: public face to the park, institutional face to the campus'),
    ('F2', "Jalalieh (dead end for cars) + Zare' lane are the only pedestrian link park ↔ campus; metro Boostan-e Laleh L6 ≈ 280 m", 'Atlas 05, 06, 21 · OSM', 'D', 'O',
     "Keep the link public: Zare' becomes the Faculty Street; main entry at Keshavarz × Jalalieh"),
    ('F3', 'No side opens onto an arterial; cars reach the block only from one-way Poursina via Jalalieh / Enayat', 'Atlas 05–06', 'D', 'C',
     'No traffic through the site; service and emergency via Jalalieh from Poursina'),
    ('F4', 'Keshavarz Blvd: divided boulevard, buses, fire-station sirens; wind and dust channelled along it (no dB measured)', 'Atlas 14–15', 'D', 'C',
     'North green / acoustic buffer; the blank wall of the auditorium faces north'),
    ('F5', 'West edge: fine-grain residential with blank party walls (sensitive neighbour)', 'Atlas 07–09, 19', 'D', 'C',
     'Quiet, lower west edge: learning + garden; no outdoor sport or night lighting toward it'),
    ('F6', 'South and east: institutional fabric (UT, TUMS, Institute of Archaeology, History of Science)', 'Atlas 07, 18', 'D', 'O',
     'Large-span sports hall toward the south-east institutional edge'),
    ('F7', 'Mature plane-tree rows on Keshavarz, Poursina and Jalalieh (55 surveyed trees in or within 4 m of the boundary)', 'Atlas 10 · DXF layer TPX_VEGETATION_TREES_INDIVIDUAL', 'D', 'O',
     'Keep every edge row; no footprint inside a tree crown'),
    ('F8', 'Ground falls north → south: ≈3 m (SRTM, atlas 11) but ≈5 m between the 1230 and 1225 contours of the DXF', 'Atlas 11 · DXF TPX_CONTOUR_LINES_5M', 'H', 'O',
     'Put the tallest volume (hall) at the low south edge, floor ≈1.5 m below the street; survey needed'),
    ('F9', 'Semi-arid cold climate (BSk): hot sunny summers, strong west sun, winter inversions; sun path computed for the site', 'Atlas 12–13', 'D', 'O/C',
     'Courts open south; closed, shaded west facades; outdoor court with a N–S long axis'),
    ('F10', 'Winds: SW (annual) and W (brief), plain↔mountain daily flows; summer dust; calm winter inversions', 'Atlas 14', 'D', 'O/C',
     'Buildings shelter the courts from the W; the Faculty Street runs E–W for cross ventilation of the street'),
    ('F11', 'Views: north to the park (upper floors), south to the campus and Poursina plane trees; blank walls W and E', 'Atlas 09, 16', 'D', 'O',
     'Admin / presidency on the top floor of the corner building, looking to the park'),
    ('F12', 'User boundary = 13,846 m² (road edges of the block) vs program 7,864 m² gross', 'DXF · brief', 'C', 'O',
     'Fits on 1–3 levels with ≈31 % ground coverage; no FAR / coverage limit known'),
    ('F13', 'The existing surface parking is lost; local kerbside parking is already under pressure', 'Atlas 19', 'D', 'C',
     'Rely on metro + campus; drop-off and accessible bays on Jalalieh (to confirm)'),
    ('F14', 'Brief item "سایت" (66 / 89 m²) has no stated function', 'Brief', 'H', 'C',
     'Keep it as an unresolved, reserved space; do not reinterpret'),
]

DRIVERS = [
    ('Threshold', 'Park ↔ University: the faculty is a public passage, not an enclosure'),
    ('Faculty Street', "Zare' lane, the only cross-block route, becomes the spine every building opens onto"),
    ('Four edges', 'N public & noisy · S institutional · W quiet & private · E pedestrian'),
    ('Keep the trees', 'The plane-tree rows define the edges; nothing is built inside a crown'),
    ('Bulk where it fits', 'Big, tall volumes low and south-east; the 3-level landmark at the park corner'),
]

PRINCIPLES = [
    '1  Open the block: one public street from Jalalieh to the western lanes.',
    '2  Public faces the park, sport faces the university, learning faces the quiet west.',
    '3  Buffer, do not wall: keep the plane trees, add a planted berm on Keshavarz.',
    '4  Every building enters from the shaded Faculty Street.',
    '5  Large volumes low and south; small volumes stack at the corner.',
]

CONCEPT = dict(
    title='FACULTY STREET', title_fa='خیابانِ دانشکده',
    idea=("The old Zare' service lane is turned into a shaded public street that crosses the block from Jalalieh to the "
          'western lanes. The faculty is organised as rooms along this street: public and event uses face Laleh Park, '
          'the sports hall faces the University, learning faces the quiet residential west.'),
    idea_fa=('کوچه‌ی سرویس زارع به یک خیابان عمومی سایه‌دار تبدیل می‌شود که بلوک را از جلالیه تا کوچه‌های غربی قطع می‌کند. '
             'دانشکده مثل اتاق‌هایی در دو سوی این خیابان سازمان می‌یابد: کاربری‌های عمومی و رویدادی رو به پارک لاله، '
             'سالن ورزشی رو به دانشگاه، و آموزش رو به لبه‌ی آرام مسکونی غرب.'),
)

ALTERNATIVES = [
    dict(key='A', title='Faculty Street', fa='خیابان دانشکده',
         idea="Zare' lane becomes a public E–W street; buildings are rooms along it, grouped by edge character.",
         evidence='F1 F2 F4 F5 F6 F7',
         placement='Auditorium + gateway on the park side; hall in the SE toward the campus; academic wing on the quiet west.',
         organisation='Public/events N · sports SE · learning SW · admin at the main corner.',
         circulation='One spine (E–W) + park-corner plaza; perimeter walks under the existing trees; service only at the E end.',
         open_space='Sequence of plaza → street → courts; edges stay green.',
         pros='Keeps the only park–campus pedestrian link public; every building has a clear address; phasing by building.',
         cons='Long spine needs shade and night management; hall bulk visible from the street.',
         scores=[5, 5, 4, 5, 4, 4, 4]),
    dict(key='B', title='Courtyard Faculty', fa='دانشکده‌ی حیاط‌مرکزی',
         idea='A perimeter ring of buildings around one large central sports-and-learning courtyard.',
         evidence='F4 F9 F10',
         placement='Bars on all four edges; hall on the south side; court in the middle.',
         organisation='Program wraps the court; entrances from the corners.',
         circulation='Internal ring corridor around the court; one controlled gate.',
         open_space='One protected court; edges become building fronts.',
         pros='Strong identity; sheltered microclimate; easy control.',
         cons="Closes the park–campus link and the Zare' lane; builds against the west residents; edge trees under pressure; poor expansion.",
         scores=[3, 4, 4, 3, 3, 2, 4]),
    dict(key='C', title='Landscape Plinth', fa='سکوی منظر',
         idea='Hall and auditorium sunk under a public landscape deck that continues Laleh Park toward the campus; a thin bar sits on top.',
         evidence='F1 F7 F8',
         placement='Large volumes below the deck; academic + admin bar along the west and north on the deck.',
         organisation='Below: sports + events; above: learning + admin.',
         circulation='Deck is public; ramps and stairs at the corners; service ramp from Jalalieh.',
         open_space='Maximum public green; the roof is the park.',
         pros='Least visible bulk; maximum open space; strong landscape identity.',
         cons='Deep excavation and long spans under soil load; daylight and fire egress for the hall; high cost and risk at concept stage.',
         scores=[4, 3, 4, 3, 5, 3, 5]),
]
CRITERIA = ['Response to site', 'Functional clarity', 'Spatial relationships', 'Circulation efficiency', 'Open-space quality',
            'Future expansion', 'Architectural identity']

# functional relationships  S strong/adjacent · M moderate/convenient · W weak/separate · R restricted/controlled · ? unresolved
_REL = {
    ('CL', 'SH'): 'M', ('CL', 'AU'): 'M', ('CL', 'LB'): 'S', ('CL', 'AS'): 'M', ('CL', 'WL'): 'M', ('CL', 'AD'): 'M', ('CL', 'PR'): 'W',
    ('CL', 'RW'): 'W', ('CL', 'CF'): 'M', ('CL', 'WC'): 'S',
    ('SH', 'AU'): 'W', ('SH', 'LB'): 'W', ('SH', 'AS'): 'W', ('SH', 'WL'): 'S', ('SH', 'AD'): 'W', ('SH', 'PR'): 'W', ('SH', 'RW'): 'W',
    ('SH', 'CF'): 'M', ('SH', 'WC'): 'M',
    ('AU', 'LB'): 'W', ('AU', 'AS'): 'M', ('AU', 'WL'): 'W', ('AU', 'AD'): 'M', ('AU', 'PR'): 'M', ('AU', 'RW'): 'W', ('AU', 'CF'): 'M', ('AU', 'WC'): 'S',
    ('LB', 'AS'): 'W', ('LB', 'WL'): 'W', ('LB', 'AD'): 'W', ('LB', 'PR'): 'W', ('LB', 'RW'): 'W', ('LB', 'CF'): 'M', ('LB', 'WC'): 'M',
    ('AS', 'WL'): 'W', ('AS', 'AD'): 'M', ('AS', 'PR'): 'M', ('AS', 'RW'): 'W', ('AS', 'CF'): 'S', ('AS', 'WC'): 'M',
    ('WL', 'AD'): 'W', ('WL', 'PR'): 'W', ('WL', 'RW'): 'W', ('WL', 'CF'): 'W', ('WL', 'WC'): 'M',
    ('AD', 'PR'): 'R', ('AD', 'RW'): 'M', ('AD', 'CF'): 'M', ('AD', 'WC'): 'S',
    ('PR', 'RW'): 'W', ('PR', 'CF'): 'W', ('PR', 'WC'): 'M',
    ('RW', 'CF'): 'S', ('RW', 'WC'): 'M',
    ('CF', 'WC'): 'S',
}


def rel(a, b):
    if a == b: return ''
    if 'ST' in (a, b): return '?'
    return _REL.get((a, b)) or _REL.get((b, a)) or 'W'


REL_NOTES = {
    'S': 'Strong — directly adjacent', 'M': 'Moderate — conveniently connected', 'W': 'Weak — separated where appropriate',
    'R': 'Restricted — controlled access', '?': 'Unresolved — "سایت" function unknown',
}
NEEDS = [  # (key, needs)
    ('SH', 'direct public entrance from the street · service / loading · acoustic separation from library and classrooms'),
    ('AU', 'independent entrance and foyer · crowd egress (west garden) · acoustic shell · toilets adjacent'),
    ('AS', 'independent access from the gateway lobby · near catering (café below)'),
    ('LB', 'student access from the street · away from hall and court noise'),
    ('CL', 'legible access from the street · east light into the Learning Court · shaded west facade'),
    ('WL', 'service access · next to the hall (sports-science) · away from the library'),
    ('AD', 'reachable from the main entrance without crossing teaching areas'),
    ('PR', 'controlled visitor access via administration (same floor, separate suite)'),
    ('CF', 'open to the plaza and court terrace; shared by students, staff and event visitors'),
    ('RW', 'staff use; next to the café, own terrace'),
    ('WC', 'distributed: academic wing, auditorium, gateway (none opening onto a hall or the café)'),
    ('ST', 'unknown — reserved in the academic wing ground floor until the brief is clarified'),
]
