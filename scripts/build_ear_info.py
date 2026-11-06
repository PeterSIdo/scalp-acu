"""Convert Section V of the Huang docx into src/data/earAuriculotherapyInfo.js.

Usage: python build_ear_info.py <docx> <names.json> <out.js>

names.json is the app's point-name list, dumped from earAuriculotherapy.js:
  cp src/data/earAuriculotherapy.js /tmp/pts.mjs
  node -e "import('file:///'+process.argv[1]).then(m=>require('fs').writeFileSync(process.argv[2], JSON.stringify(m.AURICULOTHERAPY_POINTS.map(p=>p.name))))" /tmp/pts.mjs names.json
  python scripts/build_ear_info.py "../docs/Section V VI Li-Chun Huang.docx" names.json src/data/earAuriculotherapyInfo.js
"""
import difflib
import json
import re
import sys

import docx

DOCX, POINTS_JS, OUT = sys.argv[1:4]

# App point name -> book heading (without its number), where they differ.
ALIASES = {
    'Sympathetic (sympathy)': 'Sympathetic',
    'Lesser Occipital Nerve Point': 'Lesser Occipital Nerve',
    'Auricular Temporal Nerve': 'Auriculotemporal Nerve',
    'Thyroid Gland': 'Thyroid',
    'Raising Blood Pressure Point': 'Raise Blood Pressure Point',
    'Decrease Blood Pressure Point': 'Lower Blood Pressure Point',
    'Abdominal Area': 'Abdominal Distension Area',
    'Allergic Area': 'Allergy Area',
    'Dizziness Point': 'Dizziness Area',
    'Hot Point': 'Heat Point',
    'Rheumatic Line': 'Rheumatism Line',
    'Tubercular Point': 'Tuberculosis Point',
    'Specific Area I of Tumour': 'Tumour Specific Area I',
    'Specific Area II of Tumour': 'Tumour Specific Area II',
    'Groove of Tinnitus': 'Tinnitus Groove',
    'Missing Teeth Groove': 'Missing Tooth Groove',
    'Hepatomegaly Area': 'Enlarged Liver Area',
    'Splenomegaly Area': 'Enlarged Spleen Area',
    'Groove of Hypertension': 'Low Blood Pressure Groove',
    'Gall Bladder': 'Gallbladder',
    'Esophagus': 'Oesophagus',
    'Cardiac': 'Cardia',
    'Face & Cheek Area': 'Face and Cheek',
    'Parotid Gland': 'Parotid',
    'Cervix Uteri': 'Cervix',
    'Cervix Vertebrae': 'Cervical Spine',
    'Thoracic Vertebrae': 'Thoracic Spine',
    'Lumbar Vertebrae': 'Lumbar Spine',
    'Sacral Vertebrae': 'Sacral Spine',
    'Coccyx Vertebrae': 'Coccyx',
    'Mammary Gland': 'Breast',
    'Inter Costal': 'Intercostal',
    'Hip Joint': 'Hip',
    'Knee Joint': 'Knee',
    'External Knee': 'Outer Knee',
    'Buttocks (Hip)': 'Buttock',
    'Popliteal Fossa': 'Back of the Knee',
    'Calf Point': 'Calf',
    'Finger': 'Fingers',
    'Sacroiliac Articulation': 'Sacroiliac Joint',
    'Biliary Duct': 'Bile Duct',
    'Rib Rim': 'Subcostal Line',
    'Larynx and Tooth': 'Larynx and Teeth',
    'Sole of Foot': 'Sole of the Foot',
    'Thigh Muscles': 'Thigh',
    'Tragic Apex': 'Tragus Apex',
    'Helix 1-6': 'Helix 1–6',
    'Heart on Back of the Auricle': 'Heart (Back of Ear)',
    'Liver in posterior Auricle': 'Liver (Back of Ear)',
    'Spleen on Back of The Auricle': 'Spleen (Back of Ear)',
    'Lung on back of the Auricle': 'Lung (Back of Ear)',
    'Kidney In Back of Auricle': 'Kidney (Back of Ear)',
    'Groove on Back of the Auricle': 'Groove of Posterior Surface',
}

# Book wording that only makes sense inside the book.
CHAPTER_REFS = [
    (re.compile(r'\s*\(see Chapter 5\)'), ''),
    (re.compile(r'\s*See Chapter 5\.'), ''),
    (re.compile(r'\s*covered in the diagnosis chapter \(Chapter 5\)\.?'), ' see the book\'s diagnosis chapter.'),
    (re.compile(r'See the safety note (at the top of this part|above)\.'), 'See the note below.'),
]

SERIOUS_NOTE = ('Ear signs for serious conditions (tumours, TB, heart disease, diabetes and similar) are '
                'traditional observations, not reliable tests. Never use them to tell a client they have a '
                'disease. If you notice something concerning, encourage them to see their GP.')


def clean(text):
    for pattern, repl in CHAPTER_REFS:
        text = pattern.sub(repl, text)
    return text.strip()


def split_label(text):
    m = re.match(r'^([^:]{1,60}):\s*(.*)$', text)
    return (m.group(1), m.group(2)) if m else (None, text)


# --- parse Section V into raw entries -----------------------------------
paras = docx.Document(DOCX).paragraphs
entries = []  # {heading, part, lines: [(kind, text)]}
part = None
for p in paras:
    style, text = p.style.name, p.text
    if text.startswith('Section VI') and style.startswith('Heading 1'):
        break
    if style == 'Heading 1':
        part = text
        continue
    # Part 5's Heading 2s are group titles ("Spine", "Limbs"), not points.
    if style in ('Heading 2', 'Heading 3') and part and part.startswith('Part') \
            and not (style == 'Heading 2' and part.startswith('Part 5')):
        entries.append({'heading': re.sub(r'^\d+\.\s*', '', text), 'part': part, 'lines': []})
        continue
    if not entries or not text.strip() or style.startswith('Heading'):
        continue
    if part and entries[-1]['part'] != part:
        continue
    # Sub-bullets are list level 1 (they also start with a no-break space).
    kind = 'sub' if p._p.xpath('.//w:ilvl/@w:val') == ['1'] else ('intro' if style == 'Normal' else 'item')
    entries[-1]['lines'].append((kind, text.strip()))

# Index by heading, by heading without its parenthesis (first one wins, so
# Zang-Fu "Heart" beats "Heart (Back of Ear)").
by_heading = {}
for e in entries:
    by_heading.setdefault(e['heading'], e)
    by_heading.setdefault(re.sub(r'\s*\(.*\)$', '', e['heading']), e)


FILLER = {'of', 'the', 'and', 'on', 'in', 'point', 'gland', 'area'}


def words(text):
    return {w.rstrip('s') for w in re.findall(r'[a-z0-9]+', text.lower())} - FILLER


def same_name(other, name):
    """True when `other` is just a spelling/wording variant of `name`."""
    letters = lambda t: re.sub(r'[^a-z]', '', t.lower())
    return (words(other) <= words(name)
            or difflib.SequenceMatcher(None, letters(other), letters(name)).ratio() > 0.85)


# --- turn an entry into InfoPanel sections --------------------------------
def build(name, e):
    uses, assessment, notes, aka, intro = [], None, [], [], []
    current = None  # list the last item went into, so sub-bullets follow it
    for kind, raw in e['lines']:
        text = clean(raw)
        if kind == 'intro':
            label, body = split_label(text)
            intro.append(body if label == 'TCM role' else text)
            continue
        if kind == 'sub':
            target = assessment['items'] if assessment is not None and current is assessment else uses
            label, body = split_label(text)
            target.append({'label': label, 'text': body} if label else {'text': text})
            continue
        label, body = split_label(text)
        if label and label.startswith('Assessment'):
            extra = label[len('Assessment'):].strip(' ()')
            assessment = {'title': 'Assessment', 'paragraphs': [], 'items': []}
            if extra:
                body = f'{extra[0].upper()}{extra[1:]}: {body}' if body else ''
            if body:
                assessment['paragraphs'].append(body)
            current = assessment
        elif label == 'Also known as':
            aka.append(body)
            current = None
        elif label in ('Note', 'Tip'):
            notes.append(body)
            current = None
        elif assessment is not None and current is assessment and label is None:
            assessment['after'] = text
        else:
            uses.append({'label': label, 'text': body} if label else {'text': text})
            current = uses

    sections = []
    paren = re.search(r'\((.*)\)$', e['heading'])
    bare = re.sub(r'\s*\(.*\)$', '', e['heading'])
    names = []
    if bare.lower() != name.lower():
        names.append(bare)
    if paren and 'Back of Ear' not in paren.group(1):
        names.extend(n.strip().strip('"') for n in re.split(r'[,/]', paren.group(1)))
    for a in aka:
        names.extend(n.strip() for n in a.rstrip('.').split(','))
    names = [n for i, n in enumerate(names) if n and n[0].isupper() and not same_name(n, name) and n not in names[:i]]
    if names:
        sections.append({'title': 'Also Known As', 'paragraphs': [', '.join(names)]})
    if intro:
        sections.append({'title': 'TCM Role', 'paragraphs': intro})
    if uses:
        sections.append({'title': 'Functions & Uses', 'items': uses})
    if assessment and (assessment['paragraphs'] or assessment['items']):
        if not assessment['items']:
            del assessment['items']
        sections.append(assessment)
    if notes:
        sections.append({'title': 'Notes', 'paragraphs': notes})
    body_text = json.dumps(sections)
    if e['part'].startswith('Part 3') and ('See the note below' in body_text or name in {
            'Pancreas Point', 'Tubercular Point', 'Coronary Heart Disease Groove'}):
        sections.append({'title': 'Note', 'paragraphs': [SERIOUS_NOTE]})
    return sections


# --- app point names --------------------------------------------------------
app_names = json.load(open(POINTS_JS, encoding='utf-8'))

info, missing, used = {}, [], set()
for name in app_names:
    e = by_heading.get(ALIASES.get(name, name))
    if not e:
        missing.append(name)
        continue
    used.add(id(e))
    info[name] = {
        'id': 'EAR-CN-' + re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-'),
        'name': name,
        'system': 'Chinese Auriculotherapy',
        'source': 'huang-auriculotherapy',
        'sections': build(name, e),
    }

unused = [e['heading'] for e in entries if id(e) not in used]
print('points:', len(app_names), 'with info:', len(info))
print('no book entry:', missing)
print('book entries not matched:', unused)

js = ['// Chinese Auriculotherapy point descriptions, keyed by point name (as in',
      '// earAuriculotherapy.js). Generated from docs/Section V VI Li-Chun Huang.docx',
      '// (Section V, Function of Ear Points), rewritten in plain English from',
      "// SOURCES['huang-auriculotherapy']. InfoPanel renders `sections`.",
      'export const AURICULOTHERAPY_INFO = ' + json.dumps(info, ensure_ascii=False, indent=2) + '\n']
open(OUT, 'w', encoding='utf-8', newline='\n').write('\n'.join(js))
