// Articles for the "Cases" tab: case studies, methods and treatment reports.
// Each article is one entry; every section except title is optional, so
// method-only or case-only articles fit the same shape.
//
// {
//   id, title, condition?, tags?: [string],
//   points?: [{ name, code?, location, warnings?: [POINT_WARNINGS key] }],
//   methods?: [{ name, indication?, text }],
//   results?: [{ label, text }],
//   cases?: [string],
//   discussion?: [string],
//   source?: '<SOURCES id>',
// }

// Safety warnings a point can carry (shown with a yellow warning triangle).
export const POINT_WARNINGS = {
  danger: 'Dangerous point - requires extra caution',
  shallow: 'Deep needling contraindicated - shallow insertion only',
}

export const CASES = [
  {
    id: 'headache-gb20',
    title: 'Headache',
    condition: 'Headache',
    tags: ['Acupressure', 'Electroacupuncture'],
    points: [
      {
        name: 'Fengchi',
        code: 'GB 20',
        location: 'On the nape, below the occipital bone, level with Fengfu (DU 16), in the hollow between the upper ends of the sternocleidomastoid and trapezius muscles.',
        warnings: ['danger'],
      },
    ],
    methods: [
      {
        name: 'Acupressure',
        indication: 'Mild headache',
        text: 'Patient seated. Press or roll both GB 20 points with thumb and middle finger, starting gently and gradually increasing pressure. 10–15 min daily for 7 days.',
      },
      {
        name: 'Electroacupuncture',
        indication: 'Moderate to severe headache',
        text: 'Patient seated. Insert a 1.5 cun needle at each GB 20, directed towards the opposite ear, 1.2–1.3 cun deep. Obtain qi sensation, then apply continuous-wave stimulation for 20–30 min. 1 course = 10 treatments.',
      },
    ],
    results: [
      {
        label: 'Acupressure',
        text: '56 cases (functional, hypertensive and menstrual headache, 1 to 5+ years). 36 cured, 19 improved, 1 no effect. Max 2 courses.',
      },
      {
        label: 'Electroacupuncture',
        text: '260 cases (sinusitis or drug-related headache). 258 cured, 2 no improvement after 1 course.',
      },
    ],
    cases: [
      'Boy, 9, with severe headache for 6 months. Exam and CT normal. Improved after session 1 and resolved after session 5.',
      'Woman, 56, with temporal headache for 10 years, worse with cold and overwork. Relieved after 3 sessions.',
    ],
    discussion: [
      'Choose the method by severity: acupressure for mild headache, electroacupuncture for stronger headache.',
      'GB 20 lies close to major neck muscles, nerves and vessels supplying the head. Stimulating it improves qi and blood flow locally, which relieves headache.',
    ],
    source: 'chen-single-point',
  },
  {
    id: 'stiff-neck-gb39-si3',
    title: 'Stiff Neck',
    condition: 'Stiff neck (neck muscle sprain)',
    tags: ['Acupuncture', 'Distal points'],
    points: [
      {
        name: 'Xuanzhong',
        code: 'GB 39',
        location: 'On the outer side of the lower leg, 3 cun above the tip of the outer ankle bone, on the front border of the fibula.',
      },
      {
        name: 'Houxi',
        code: 'SI 3',
        location: 'On the little-finger edge of the hand, where the palm and back skin meet, at the end of the lower palm crease, just behind the 5th knuckle when a loose fist is made.',
      },
    ],
    methods: [
      {
        name: 'Xuanzhong (GB 39)',
        indication: 'Use either point on its own',
        text: 'Patient seated, both sides. Insert a 1.5–2 cun needle 1.2–1.8 cun deep, depending on build. Stimulate strongly until the qi sensation travels up towards the knee, while the patient moves the neck. Retain 15–20 min, re-stimulating every 5 min.',
      },
      {
        name: 'Houxi (SI 3)',
        indication: 'Use either point on its own',
        text: 'Patient seated, both sides. Insert a 1.5 cun needle towards Hegu (LI 4), more than 1 cun deep. Rotate with reducing method for 1–3 min until the pain eases, then withdraw. If pain remains, retain 20–30 min, re-stimulating every 5 min.',
      },
    ],
    results: [
      {
        label: 'Xuanzhong (GB 39)',
        text: '47 cases. 43 cured (41 after one treatment, 2 after two), 3 improved after two treatments, 1 no effect.',
      },
      {
        label: 'Houxi (SI 3)',
        text: '54 cases. 33 cured, 19 improved, 2 no effect. Most needed 1–2 sessions.',
      },
    ],
    cases: [
      'Man, 27, with right-sided neck pain after sleeping awkwardly; tender, stiff muscles and unable to tilt the head to the right. Massage had barely helped. Much better after 20 min of GB 39 needling.',
      'Man, 37, with morning neck stiffness, pain spreading to the right shoulder and the head held tilted to the left. Pain relieved after 3 min of SI 3 manipulation.',
    ],
    discussion: [
      'Stiff neck is a sprain of the neck muscles from cold, a high pillow or holding the head tilted for long. It shows as pain, stiffness and limited movement.',
      'Both are distal points: needle them while the patient gently moves the neck.',
      'The Gallbladder meridian runs through the side of the neck, so needling GB 39 improves qi and blood flow along it and eases pain and stiffness.',
    ],
    source: 'chen-single-point',
  },
  {
    id: 'cervical-spondylosis-chengshanxia',
    title: 'Cervical Spondylosis',
    condition: 'Cervical spondylosis (cervical spondylopathy)',
    tags: ['Acupuncture', 'Cupping', 'Massage', 'Distal points'],
    points: [
      {
        name: 'Chengshanxia',
        code: 'Experience point',
        location: '2 cun below Chengshan (BL 57), slightly towards the inner side; pick the most tender spot. (BL 57: on the back midline of the calf, halfway between BL 40 and BL 60, in the hollow below the calf muscle bellies when the heel is raised.)',
      },
    ],
    methods: [
      {
        name: 'Acupuncture, cupping and massage',
        text: 'Patient lying face down, both sides. Insert perpendicularly 1.5 cun and stimulate until qi sensation. Place a cup over the needle for 15 min. Then remove both, relax all the leg muscles with both hands, and thumb-massage around the point, working up the leg, for 20–30 min, until the neck feels warm and full and the patient sweats. The patient moves the neck throughout.',
      },
    ],
    results: [
      {
        label: 'Course',
        text: 'Usually 10 or more treatments are needed for a cure.',
      },
    ],
    cases: [
      'Man, 45, with neck pain and numbness in both hands. On needling he felt warmth rising from the low back to the neck, shoulders and hands, with sweating. Steady improvement; fully relieved after 10 sessions.',
    ],
    discussion: [
      'Bony overgrowth of the neck vertebrae irritates or compresses a nerve root, the spinal cord, the vertebral artery or sympathetic nerves. Typical signs are aching, fullness or pain in the neck, shoulder or arm and numb fingers, mostly after age 40.',
    ],
    source: 'chen-single-point',
  },
  {
    id: 'tennis-elbow-ashi',
    title: 'Tennis Elbow',
    condition: 'Tennis elbow (lateral epicondylitis)',
    tags: ['Moxibustion', 'Intradermal needle', 'Plum-blossom needle', 'Ashi point'],
    points: [
      { name: 'Ashi point', location: 'The tender spot in the centre of the lateral epicondyle of the humerus.' },
    ],
    methods: [
      {
        name: 'Moxibustion on ginger',
        text: 'Patient seated, elbow bent and resting on a table. Rub the Ashi point with fresh ginger until the skin reddens. Cover it with a ginger slice 0.3 cun thick, sealed round the edge with plaster. Hold a lit moxa stick about 3 cun away until the area feels pleasantly warm (not hot), 10 min. Leave ginger and plaster in place until the next session. Daily for 10 days.',
      },
      {
        name: 'Intradermal needle',
        text: 'Insert an intradermal needle (handle about 0.5 cun) horizontally at the Ashi point, between skin and muscle, along the muscle fibres. Tape it down and have the patient move the elbow until it is comfortable. Leave in 3–5 days.',
      },
      {
        name: 'Plum-blossom needle',
        text: 'Tap the Ashi point until a few drops of blood appear, then apply moxa as above until the skin reddens. Every other day until improved.',
      },
    ],
    results: [
      { label: 'Moxibustion on ginger', text: '100 cases: 70 cured, 17 markedly improved, 15 improved, 3 no effect (figures as published).' },
      { label: 'Intradermal needle', text: '25 cases: 16 cured (12 after one session, 4 after two), 9 improved.' },
      { label: 'Plum-blossom needle', text: '15 cases, all improved after 2–3 sessions.' },
    ],
    cases: [
      'Man, 38, worker, with right elbow pain and limited movement, worse with effort and cold. Markedly better after 3 courses of ginger moxibustion.',
      'Man, 58, with right elbow pain for a month, worse on moving the elbow. Marked improvement after the intradermal needle was left in for 3 days.',
      'Man, 23, with right elbow pain for 5 days, worse on movement. Improved after 2 plum-blossom sessions.',
    ],
    discussion: [
      'Tennis elbow is pain at the origin of the forearm extensor tendon on the outer elbow, from chronic strain (small tears, bleeding, adhesions or non-infective inflammation). Pain may spread to the shoulder and wrist; the arm feels sore and weak, and symptoms come and go.',
      'Overuse or cold leads to weak qi and stagnant blood, giving pain, a tender Ashi point and weak tendons. All three methods move qi and clear the blood stagnation.',
    ],
    source: 'chen-single-point',
  },
  {
    id: 'wrist-ankle-sprain-relative-point',
    title: 'Sprain of Wrist and Ankle',
    condition: 'Wrist or ankle sprain',
    tags: ['Acupuncture', 'Distal points'],
    points: [
      { name: 'Relative point', location: 'Find the Ashi (most tender) spot on the injured joint, then needle the matching spot on the other joint: for an ankle sprain, the corresponding spot on the wrist; for a wrist sprain, the corresponding spot on the ankle.' },
    ],
    methods: [
      {
        name: 'Acupuncture',
        text: 'Use the relative point on the injured side. Insert a 1 cun needle obliquely, pointing up the limb, 0.5–0.8 cun deep. Reduce with lifting, thrusting and rotating until qi sensation, while the patient moves the injured joint. Retain 20–30 min; if pain returns, re-stimulate every 5 min. For swelling, a local anti-inflammatory dressing can be added.',
      },
    ],
    results: [
      { label: 'Acupuncture', text: '40 cases (15 wrist, 25 ankle), all with pain, swelling and limited movement. All improved after one treatment.' },
    ],
    cases: [
      'Man, 40, office worker, twisted his right ankle on the stairs: swollen, painful, limited movement, X-ray normal. Pain much better after 15 min of needling the relative point on the right wrist; no complaints after 3 sessions.',
    ],
    discussion: [
      'A sprain gives local pain, swelling and limited movement.',
      'The point is chosen away from the injury because a hidden injury may be present, and needling locally could make it worse. Wrist and ankle are linked through the meridians and collaterals, so one joint can be treated through the other.',
    ],
    source: 'chen-single-point',
  },
  {
    id: 'shoulder-back-pain-shangshandian',
    title: 'Shoulder and Back Pain',
    condition: 'Shoulder and upper back pain',
    tags: ['Acupuncture'],
    points: [
      { name: 'Shangshandian', code: 'Experience point', location: 'Go 3 cun lateral from the thyroid cartilage, then 1 cun straight down. The point lies on the inner side of the sternocleidomastoid muscle.', warnings: ['danger', 'shallow'] },
    ],
    methods: [
      {
        name: 'Acupuncture',
        text: 'Affected side only. Use a 1.5 cun (gauge 28) needle, no deeper than 0.5 cun. Lift and thrust quickly with small amplitude until qi sensation, ideally travelling down to the fingers. Withdraw as soon as it is felt; do not retain.',
      },
    ],
    results: [
      { label: 'Acupuncture', text: '246 cases: 133 cured, 122 improved, 9 not improved (figures as published).' },
    ],
    cases: [
      'Woman, 59, with hemiplegia for 6 months and shoulder and back pain. Pain improved after the first treatment; after 10 treatments the arm began to regain strength.',
    ],
    discussion: [
      'Pain over the shoulder and back from shoulder arthritis or inflammation of the local tendons and muscles, with tenderness and limited movement.',
      'The point is on the front of the neck: keep the needle shallow (0.5 cun maximum).',
    ],
    source: 'chen-single-point',
  },
  {
    id: 'intercostal-neuralgia-gb40',
    title: 'Intercostal Neuralgia',
    condition: 'Intercostal neuralgia',
    tags: ['Acupuncture', 'Distal points'],
    points: [
      { name: 'Qiuxu', code: 'GB 40', location: 'In front of and below the outer ankle bone, in the hollow on the outer side of the long toe-extensor tendon.' },
    ],
    methods: [
      {
        name: 'Acupuncture',
        text: 'Opposite side to the pain. Insert a 1.5 cun needle 1 cun deep and rotate until qi sensation. Retain 30 min, re-stimulating every 10 min. Daily.',
      },
    ],
    results: [
      { label: 'Acupuncture', text: '44 cases: 33 cured, 8 improved, 3 no effect. Most responders were at their best after 6 sessions.' },
    ],
    cases: [
      'Male student, 17, with burning right chest pain and tenderness on the mid-clavicular line from the 4th to the 6th rib, not helped by medication. TCM diagnosis: blood stagnation. Improved from the first session; cured after 8.',
    ],
    discussion: [
      'Pricking or stabbing pain along one or more intercostal nerves, sometimes in a belt-like band, worse with coughing or deep breathing, often like an electric shock.',
      'The sides of the chest belong to the Shaoyang meridians. GB 40, the source point of the Gallbladder (foot Shaoyang) meridian, improves qi and blood flow there.',
    ],
    source: 'chen-single-point',
  },
  {
    id: 'l3-transverse-process-ashi',
    title: 'Lumbar Transverse Process Syndrome',
    condition: 'Third lumbar transverse process syndrome',
    tags: ['Acupuncture', 'Cupping', 'Ashi point'],
    points: [
      { name: 'Ashi point', location: 'The centre of the painful area in the low back, on the affected side.' },
    ],
    methods: [
      {
        name: 'Acupuncture and cupping',
        text: 'Patient face down with a small pillow under the abdomen. Insert a 3 cun needle up to 2 cun deep with strong reducing stimulation. Once qi is felt, place a cup over the needle for 20 min. Every other day; 1 course = 6 sessions.',
      },
    ],
    results: [
      { label: 'Acupuncture and cupping', text: '85 cases: 61 cured, 22 improved, 2 no effect.' },
    ],
    cases: [
      'Man, 27, soldier, got low back pain carrying his rifle on his shoulder; X-ray showed an L3 transverse process injury. Ashi point needled 1.5 cun lateral to the spine. Fully recovered after 3 sessions.',
    ],
    discussion: [
      'Non-infective swelling and inflammation of the muscles attached to the L3 transverse process, later with thickening of the periosteum and fibrous tissue. Low back pain spreads to the leg on the same side and is worse with movement.',
      'The L3 transverse process is long and poorly covered by muscle, so it is easily injured. Needling with cupping improves local qi and blood flow and relieves pain.',
    ],
    source: 'chen-single-point',
  },
  {
    id: 'acute-lumbar-sprain-du28-yaotongdian',
    title: 'Acute Lumbar Muscle Sprain',
    condition: 'Acute low back sprain',
    tags: ['Three-edged needle', 'Acupuncture', 'Distal points'],
    points: [
      { name: 'Yinjiao', code: 'DU 28', location: 'Inside the upper lip, where the lip frenum meets the upper gum.' },
      { name: 'Yaotongdian', code: 'EX-UE 7', location: 'Two points on the back of each hand: between the 2nd and 3rd and between the 4th and 5th metacarpals, halfway between the wrist crease and the knuckles.' },
    ],
    methods: [
      {
        name: 'Yinjiao (DU 28), three-edged needle',
        indication: 'When a small blister is present on the lip frenum',
        text: 'About 12 hours after an acute back sprain a small white or dark red blister often appears on the frenum. Patient seated, head tilted back; lift the upper lip, prick the centre of the blister with a three-edged needle and withdraw at once. A little sugar stops excess bleeding. Done correctly, once is usually enough. A sterile hypodermic needle can be used instead.',
      },
      {
        name: 'Yaotongdian (EX-UE 7), acupuncture',
        indication: 'When no blister is found',
        text: 'Affected side. Insert a 1 cun (gauge 26) needle 0.3–0.4 cun deep and stimulate strongly until qi is felt in the back, while the patient moves the low back.',
      },
    ],
    results: [
      { label: 'Yinjiao (DU 28)', text: '174 cases: 148 cured, 25 improved, 1 not improved. Most needed one treatment.' },
      { label: 'Yaotongdian (EX-UE 7)', text: '120 cases: 58 cured, 43 much improved, 19 slightly improved.' },
    ],
    cases: [
      'Man, 50, worker, with acute low back pain after lifting heavy objects, seen the next day. The blister on the frenum was pricked and pain eased markedly; pain-free the following day.',
      'Male student, 17, hurt his back playing basketball: painful, stiff, hot low back, X-ray normal. Much better after the first Yaotongdian treatment, fully relieved after the second.',
    ],
    discussion: [
      'Acute low back pain from a sprain, strain or rheumatic inflammation of the lumbar muscles, often after poor posture, a fall or lifting. It gives constant pain, a stiff spine, local tenderness and limited movement. Use one of the two points.',
      'DU 28 links the Du meridian (which governs the yang meridians and runs up the back) with the Ren meridian. Pricking the blister clears stagnant qi and blood and eases back pain.',
    ],
    source: 'chen-single-point',
  },
  {
    id: 'chronic-lumbar-strain-pigen',
    title: 'Chronic Lumbar Muscle Strain',
    condition: 'Chronic low back muscle strain',
    tags: ['Acupuncture', 'Moxibustion', 'Cupping'],
    points: [
      { name: 'Pigen', code: 'EX-B 4', location: 'On the low back, level with the lower border of the L1 spinous process, 3.5 cun lateral to the midline.', warnings: ['danger'] },
    ],
    methods: [
      {
        name: 'Acupuncture, moxibustion and cupping',
        text: 'Patient face down, both sides. Insert a 3 cun needle obliquely at 45°, 2–2.5 cun deep, until qi sensation travels down, even to the knee. Apply moxa around the needle until the skin reddens and sweats slightly; retain 20 min. Then place a cup over the needle for 10 more min. Daily; 1 course = 8 sessions.',
      },
    ],
    results: [
      { label: 'Acupuncture, moxibustion and cupping', text: '100 cases: 82 cured, 11 improved, 7 no effect. 1–10 sessions, 5 on average.' },
    ],
    cases: [
      'Man, 56, with recurring low back pain, limited movement and morning stiffness; X-ray normal. TCM diagnosis: blood stagnation. Markedly better after 10 treatments.',
    ],
    discussion: [
      'Repeated or prolonged overloading of the lumbar muscles causes chronic non-infective inflammation. It is linked with damp living conditions or sitting and lying on damp ground. Long-standing ache on one or both sides, worse when tired and eased by gentle activity.',
      'In TCM, injury, wind, cold or damp affect the Kidney area. Pigen lies in the area of the extra meridians, which connect with the Kidney meridian.',
    ],
    source: 'chen-single-point',
  },
  {
    id: 'sciatica-shuangyang',
    title: 'Sciatica',
    condition: 'Sciatica',
    tags: ['Acupuncture', 'Moxibustion', 'Cupping'],
    points: [
      {
        name: 'Shuangyang',
        code: 'Experience point',
        location: 'Draw a line from Huantiao (GB 30) to Fengshi (GB 31). From its midpoint go 1 cun towards the back; the two Shuangyang points are 1 cun above and 1 cun below that spot, between the Gallbladder and Bladder meridians. (GB 30: one third of the way from the greater trochanter to the sacral hiatus, patient on the side with the hip flexed. GB 31: on the outer thigh midline, 7 cun above the knee crease.)',
      },
    ],
    methods: [
      {
        name: 'Acupuncture, moxibustion and cupping',
        text: 'Affected side. Insert a 3 cun needle at each point, angled towards each other, 2.5 cun deep. Lift and rotate strongly until qi sensation travels down, even to the foot. Apply moxa until the skin reddens; retain 20 min. Then apply a flash cup for 10 min. Daily.',
      },
    ],
    results: [
      { label: 'Acupuncture, moxibustion and cupping', text: '44 cases: 27 cured, 11 markedly improved, 2 no effect (figures as published).' },
    ],
    cases: [
      'Woman, 45, farmer, with chronic low back and leg pain, limited movement and a cold leg. TCM diagnosis: sciatica from cold and damp. Fully recovered after 10 sessions.',
    ],
    discussion: [
      'Continuous pain along the sciatic nerve: hip, back and outer thigh and leg, and outer foot. It may come from the nerve itself or, more often, from pressure or irritation by nearby structures.',
      'Sciatica is mainly due to wind, cold and damp, so moxa and cupping work well. Shuangyang lies over the sciatic nerve roots and the main muscles and vessels around them, helping sciatic, low back and leg pain.',
    ],
    source: 'chen-single-point',
  },
  {
    id: 'low-back-leg-pain-xiashandian',
    title: 'Pain in Lower Back and Leg',
    condition: 'Low back pain radiating to the leg',
    tags: ['Acupuncture'],
    points: [
      { name: 'Xiashandian', code: 'Experience point', location: 'Draw a line between Zhibian (BL 54) and Huantiao (GB 30). Using it as the base of an equilateral triangle pointing towards the back, the point is at the apex.' },
    ],
    methods: [
      {
        name: 'Acupuncture',
        text: 'Patient lying on the unaffected side; needle the affected side. Insert a 3–4 cun needle 2.5–3.5 cun deep. Lift and thrust quickly until qi sensation travels down to the foot. Daily.',
      },
    ],
    results: [
      { label: 'Acupuncture', text: '259 cases, all cured: 184 after one session, 61 after two, 14 after three.' },
    ],
    cases: [
      'Man, 30, worker, fell while lifting a heavy object: low back and leg pain with tenderness over the sacrum; X-ray normal. Diagnosis: lumbar sprain. Cured after one treatment.',
    ],
    discussion: [
      'Pain from the low back down to the foot, worse with movement, from sciatica, lumbar sprain, lumbar bone overgrowth or a prolapsed lumbar disc.',
      'The method only works if the qi sensation is obtained. Also useful for pain and numbness in the thigh. Avoid cold and exertion during the course.',
    ],
    source: 'chen-single-point',
  },
  {
    id: 'heel-pain-ashi',
    title: 'Heel Pain',
    condition: 'Heel pain (Achilles tendinitis, heel spur, calcaneal problems)',
    tags: ['Massage', 'Moxibustion', 'Ashi point'],
    points: [
      { name: 'Ashi point', location: 'The tender spot on the heel bone (calcaneus).' },
    ],
    methods: [
      {
        name: 'Massage',
        text: 'Patient lying on the back, leg muscles relaxed. Rub and roll with the fingers over the area for 10 min. Daily for 10 sessions.',
      },
      {
        name: 'Moxibustion on ginger',
        text: 'Rub the Ashi point with ginger, lay a slice of ginger on it and burn moxa cones on top, 3–5 cones per session. 1 course = 10 sessions.',
      },
    ],
    results: [
      { label: 'Massage and moxibustion', text: '115 cases: 102 cured, 8 improved, 5 no effect.' },
    ],
    cases: [
      'Man, 54, with right heel pain, worse in cold weather, and a cold, numb right foot; X-ray showed a heel spur. Treated with both methods; dramatically better after two treatments.',
    ],
    discussion: [
      'Heel pain from Achilles tendinitis or problems of the heel bone such as chronic sprain or inflammation. Walking hurts, with tender points around and in front of the heel and on the sole.',
    ],
    source: 'chen-single-point',
  },
  {
    id: 'knee-pain-xiyan',
    title: 'Knee Pain',
    condition: 'Knee pain (arthritis, soft-tissue injury)',
    tags: ['Electroacupuncture'],
    points: [
      { name: 'Xiyan – Eyes of the Knee', code: 'EX-LE 5', location: 'In the two hollows either side of the patellar ligament with the knee bent: Neixiyan (inner) and Waixiyan (outer).', warnings: ['danger'] },
    ],
    methods: [
      {
        name: 'Electroacupuncture',
        text: 'Patient lying down, knee bent. Needle both Xiyan points 1–1.5 cun deep, angled towards the centre of the knee, until qi arrives. Connect to the stimulator, continuous wave, as strong as the patient can comfortably bear, for 30 min. Daily or every other day.',
      },
    ],
    results: [
      { label: 'Electroacupuncture', text: '146 cases: 120 cured, 16 markedly improved, 11 improved, 6 no effect (figures as published; overall 95.9% improved). Most improved after the first treatment.' },
    ],
    cases: [
      'Man, 54, farmer, with recurring knee pain, worse in the cold, with redness and limited movement. Diagnosis: knee arthritis. Much better after the first treatment, pain-free after 8 sessions.',
    ],
    discussion: [
      'Besides arthritis, falls or sudden strain can injure the muscles, tendons and ligaments of the knee, giving pain, tenderness, swelling and limited movement.',
      'Waixiyan lies on the Stomach meridian, the richest in qi and blood of the 12 regular meridians. Stimulating both Xiyan points keeps qi and blood flowing through the knee.',
    ],
    source: 'chen-single-point',
  },
  {
    id: 'general-pain-ear-apex',
    title: 'General Pain',
    condition: 'Pain of many kinds',
    tags: ['Auriculotherapy', 'Acupuncture'],
    points: [
      { name: 'Ear Apex', code: 'MA-H 6', location: 'At the top of the helix, opposite the back edge of the superior crus of the antihelix.' },
    ],
    methods: [
      {
        name: 'Ear acupuncture',
        text: 'Both ears. Insert a 1 cun needle 0.3–0.5 cun deep, angled down and back. Rotate gently until the ear feels a local burning sensation. Retain 20–30 min, re-stimulating every 10 min. For severe recurring pain, use press (retained) needles, changed every 2–3 days. 1 course = 6–8 sessions.',
      },
    ],
    results: [
      { label: 'Ear acupuncture', text: '87 cases with different kinds of pain: 48 cured, 34 improved, 25 no response (figures as published; overall 94.6% improved).' },
    ],
    discussion: [
      'Pain in one part or all of the body from an ongoing, often chronic, illness. Constant pain brings tiredness, poor sleep and restlessness.',
      'Used for headache, sciatica, shoulder and arm pain, low back pain, rheumatic and rheumatoid arthritis, rheumatic muscle pain, intercostal neuralgia, organ pain and post-operative pain. Pain often eases within about 5 minutes.',
    ],
    source: 'chen-single-point',
  },
]

// Flat text of an article, for the list search.
export function caseText(c) {
  return [
    c.title, c.condition, ...(c.tags ?? []),
    ...(c.points ?? []).flatMap(p => [p.name, p.code]),
    ...(c.methods ?? []).map(m => m.name),
  ].filter(Boolean).join(' ').toLowerCase()
}
