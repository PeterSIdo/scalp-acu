"""Build src/data/earWesternInfo.js: descriptions for the Western
Auriculotherapy points (ear-acupoints.txt: musculoskeletal, internal organ
and neuroendocrine charts, Oleson-style (C)/(E) nomenclature).

The text is original wording written for this app from commonly taught
auriculotherapy facts (Nogier's European map and the Chinese standard map);
nothing is quoted from a book. Edit the POINTS table below and re-run:

    python scripts/build_ear_western_info.py

Each entry: name -> (location or None, common uses, note or None).
A location of None means "see the diagram" (no Location section is shown).
"""
import json
import re
from pathlib import Path

E_NOTE = ("European (E) location, from Nogier's map. Nogier and the Chinese "
          "charts place this part of the body in different spots; both are "
          "used in practice, so check both for tenderness.")
C_NOTE = ("Chinese (C) location. The European map (Nogier) puts this part in "
          "a different spot; both are used in practice, so check both for "
          "tenderness.")

POINTS = {
    # ---------------- Musculoskeletal: lower limb ----------------
    "Toes (C)": ("Top outer corner of the superior crus of the antihelix, just under the helix rim.",
                 "Toe pain and sprains, gout, bunions, numbness or cold in the toes.", C_NOTE),
    "Toes (E)": (None, "Toe pain and sprains, gout, bunions, numbness or cold in the toes.", E_NOTE),
    "Heel (C)": ("Top inner corner of the superior crus, close to the triangular fossa.",
                 "Heel pain, plantar fasciitis, heel spurs, Achilles tendon problems.", C_NOTE),
    "Heel (E)": (None, "Heel pain, plantar fasciitis, heel spurs, Achilles tendon problems.", E_NOTE),
    "Ankle (C)": ("Upper part of the superior crus, just below the Toes and Heel points.",
                  "Ankle sprains, ankle arthritis, swelling and stiffness of the ankle.", C_NOTE),
    "Ankle (E)": (None, "Ankle sprains, ankle arthritis, swelling and stiffness of the ankle.", E_NOTE),
    "Knee (C)": ("Middle third of the superior crus.",
                 "Knee pain, osteoarthritis of the knee, ligament and meniscus injuries, sports injuries.", C_NOTE),
    "Knee (E)": (None, "Knee pain, osteoarthritis of the knee, ligament and meniscus injuries, sports injuries.", E_NOTE),
    "Hip (C)": ("Lower third of the superior crus, near where it joins the inferior crus.",
                "Hip pain and arthritis, groin pain, sciatica felt in the hip.", C_NOTE),
    "Hip (E)": (None, "Hip pain and arthritis, groin pain, sciatica felt in the hip.", E_NOTE),

    # ---------------- Musculoskeletal: upper limb ----------------
    "Fingers": ("Top of the scaphoid fossa (scapha), just under the helix; drawn as one dot per fingertip.",
                "Finger pain and stiffness, arthritis of the finger joints, numbness or tingling, cold fingers (Raynaud's).", None),
    "Hand": ("Upper scapha, just below the Fingers.",
             "Hand pain, arthritis, weak grip, numbness of the hand, carpal tunnel symptoms.", None),
    "Wrist": ("Upper scapha, below the Hand.",
              "Wrist sprain, tendonitis, carpal tunnel syndrome, repetitive strain injury.", None),
    "Elbow": ("Middle of the scapha, below the Wrist.",
              "Tennis elbow, golfer's elbow, elbow arthritis and sprains.", None),
    "Arm": ("Scapha, between the Elbow and the Shoulder.",
            "Upper arm pain, muscle strain of the biceps or triceps.", None),
    "Shoulder": ("Lower-middle scapha, below the Arm, level with the upper part of the antihelix body.",
                 "Shoulder pain, frozen shoulder, rotator cuff injury, shoulder arthritis.", None),
    "Master Shoulder": (None,
                        "A general point for shoulder pain and stiffness of any cause; usually combined with the Shoulder point.", None),

    # ---------------- Musculoskeletal: spine and trunk ----------------
    "Cervical Spine": ("Lower part of the antihelix body, from the notch beside the antitragus upward; the neck vertebrae run along its inner edge.",
                       "Neck pain, stiff neck, whiplash, cervical arthritis, headaches that start in the neck, arm pain from neck nerves.", None),
    "Cervical Spine Point": ("A single point on the lower antihelix within the Cervical Spine segment.",
                             "Neck pain and stiffness; used when one point is wanted rather than the whole neck segment.", None),
    "Thoracic Spine": ("Middle of the antihelix body, along its inner edge facing the concha.",
                       "Upper and middle back pain, rib pain, intercostal neuralgia, postural back strain.", None),
    "Lumbar Spine": ("Upper part of the antihelix body, below where the two crura split.",
                     "Low back pain, lumbar disc problems, lumbar stiffness, sciatica from the lower back.", None),
    "Sacral Spine": ("Top of the antihelix body, around the split into the superior and inferior crura.",
                     "Sacral and sacroiliac pain, tailbone (coccyx) pain, pelvic pain.", None),
    "Lumbago": (None, "Acute and chronic low back pain (lumbago), low back strain.", None),
    "Neck": ("Lower antihelix, near its junction with the antitragus, on the side facing the scapha.",
             "Stiff neck, wry neck (torticollis), neck sprain, neck muscle tension.", None),
    "Chest": ("Antihelix body, level with the Thoracic Spine, on the side facing the scapha.",
              "Chest wall pain, rib pain, breast pain, shingles pain over the chest, tight chest.", None),
    "Abdomen": ("Antihelix body, level with the Lumbar Spine, on the side facing the scapha.",
                "Abdominal pain and cramps, bloating, period pain, pain after abdominal surgery.", None),

    # ---------------- Musculoskeletal: head and face ----------------
    "Occiput": ("Outer surface of the antitragus, at its back and upper end.",
                "Headache at the back of the head, neck stiffness, dizziness, insomnia. Also used as a calming point.", None),
    "Temples": ("Middle of the outer surface of the antitragus.",
                "Headache at the temples, migraine, one-sided headache.", None),
    "Forehead": ("Outer surface of the antitragus, at its front lower end.",
                 "Frontal headache, sinus headache, dizziness, poor concentration.", None),
    "Face": ("Ear lobe, in the middle area (the face/cheek zone).",
             "Facial pain, trigeminal neuralgia, facial paralysis (Bell's palsy), facial twitching, acne.", None),
    "Eye": ("Centre of the ear lobe.",
            "Eye strain, red or sore eyes, conjunctivitis, dry eyes, poor vision.", None),
    "Eye Disorder 1": ("Below the intertragic notch, on the front (tragus) side.",
                       "Eye problems: short sight, glaucoma, conjunctivitis, eye strain. Usually used together with Eye Disorder 2.", None),
    "Eye Disorder 2": ("Below the intertragic notch, on the back (antitragus) side.",
                       "Eye problems: short sight, glaucoma, conjunctivitis, eye strain. Usually used together with Eye Disorder 1.", None),
    "Upper Jaw": ("Ear lobe, upper middle area.",
                  "Toothache of the upper teeth, upper jaw pain, sinus pain felt in the teeth.", None),
    "Lower Jaw": ("Ear lobe, upper area, just above the Upper Jaw point.",
                  "Toothache of the lower teeth, lower jaw pain, jaw stiffness.", None),
    "TMJ": (None, "Jaw joint (TMJ) pain, clicking jaw, teeth grinding (bruxism), difficulty opening the mouth.", None),
    "Dental Analgesia": ("Ear lobe, upper front area.",
                         "Toothache and pain relief for dental treatment.", None),
    "Inner Ear (C)": ("Ear lobe, in the area behind the Eye point.",
                      "Tinnitus, hearing loss, vertigo, dizziness, middle ear infections.", C_NOTE),
    "Inner Ear (E)": ("Inner surface of the tragus, below Inner Nose (C).",
                      "Tinnitus, hearing loss, vertigo, dizziness, middle ear infections.", E_NOTE),
    "Inner Nose (C)": ("Inner surface of the tragus (facing the ear canal), lower half.",
                       "Blocked or runny nose, rhinitis, hay fever, sinusitis, nosebleeds.", None),
    "External Ear (C)": ("In front of the notch above the tragus, where the helix root meets the tragus.",
                         "Tinnitus, hearing loss, earache, outer ear inflammation, dizziness.", None),
    "Muscle Relaxation": (None,
                          "Muscle tension, spasms and cramps, stiffness from stress. Often added to formulas for musculoskeletal pain.", None),

    # ---------------- Internal organs: digestive ----------------
    "Mouth": ("Concha, just above and behind the opening of the ear canal, under the root of the helix.",
              "Mouth ulcers, sore mouth or tongue, facial paralysis, taste problems. Widely used in smoking-cessation formulas.", None),
    "Stomach": ("Concha, around the end of the helix root.",
                "Indigestion, nausea and vomiting, gastritis, stomach ulcers, heartburn. Used in appetite and weight-control formulas.", None),
    "Small Intestine": ("Upper concha (cymba), above the helix root, in its middle third.",
                        "Poor digestion and absorption, bloating, diarrhoea, abdominal pain.", None),
    "Large Intestine": ("Upper concha (cymba), above the helix root, in its front third.",
                        "Constipation, diarrhoea, irritable bowel syndrome, bloating and wind.", None),
    "Liver": ("Back part of the concha, beside the antihelix, below the cymba.",
              "Liver and gallbladder problems, digestive upset, muscle tension and cramps, eye problems, irritability, hangover. Used in detox formulas.", None),
    "Pancreas": ("Upper concha (cymba), between the Liver and Kidney areas.",
                 "Indigestion of fats, blood-sugar problems (as a support for diabetes care), pancreatitis.", None),
    "Spleen (C)": ("Lower concha (cavum), below the Liver, next to the antihelix.",
                   "Poor appetite, bloating, loose stools, fatigue, anaemia, easy bruising or bleeding.", C_NOTE),
    "Spleen (E)": (None, "Immune support, anaemia, fatigue, digestive weakness.", E_NOTE),

    # ---------------- Internal organs: cardiorespiratory ----------------
    "Heart (C)": ("Centre of the lower concha (cavum), its deepest part.",
                  "Palpitations, irregular heartbeat, high blood pressure, anxiety, insomnia, night sweats.", C_NOTE),
    "Heart (E)": (None, "Palpitations, irregular heartbeat, high blood pressure, anxiety.", E_NOTE),
    "Lung 1": ("Lower concha (cavum), in the lung area above the Heart point.",
               "Cough, asthma, bronchitis, colds, skin conditions. A core point for smoking cessation and addiction formulas; also used for pain relief.", None),
    "Lung 2": ("Lower concha (cavum), in the lung area below the Heart point.",
               "Cough, asthma, bronchitis, colds, skin conditions. A core point for smoking cessation and addiction formulas; also used for pain relief.", None),
    "Throat (C)": ("Inner surface of the tragus (facing the ear canal), upper half.",
                   "Sore throat, tonsillitis, laryngitis, hoarse voice.", C_NOTE),
    "Throat (E)": (None, "Sore throat, tonsillitis, laryngitis, hoarse voice.", E_NOTE),
    "Diaphragm (C)": ("On the root of the helix (helix crus), where it rises out of the concha.",
                      "Hiccups, spasm of the diaphragm or stomach, bleeding problems, itchy skin. In the European map this spot is Point Zero, a general balancing point.", None),

    # ---------------- Internal organs: urogenital ----------------
    "Kidney (C)": ("Upper concha (cymba), under the inferior crus, below where the antihelix splits.",
                   "Kidney and urinary problems, low back pain, tinnitus and hearing loss, fatigue, hair loss, bone health.", C_NOTE),
    "Kidney (E)": (None, "Kidney and urinary problems, fluid balance, low back pain.", E_NOTE),
    "Bladder": ("Upper concha (cymba), under the inferior crus, in front of the Kidney.",
                "Bladder infection (cystitis), frequent or urgent urination, bed-wetting, urine retention.", None),
    "Prostate (C)": ("Upper front corner of the cymba concha, under the inner end of the inferior crus.",
                     "Prostatitis, enlarged prostate, difficult or frequent urination, impotence.", None),
    "Uterus (C)": ("Triangular fossa, inner (front) part near the helix.",
                   "Period pain, irregular periods, premenstrual syndrome, infertility, menopausal symptoms.", C_NOTE),
    "Uterus (E)": (None, "Period pain, irregular periods, premenstrual syndrome, infertility.", E_NOTE),
    "External Genitals (C)": ("On the helix, level with the inferior crus.",
                              "Genital itching or inflammation, impotence, low libido, painful intercourse.", C_NOTE),
    "External Genitals (E)": (None, "Genital itching or inflammation, impotence, low libido.", E_NOTE),

    # ---------------- Endocrine ----------------
    "Pituitary Gland": (None, "The master gland: hormone imbalance in general, and support for thyroid, adrenal and reproductive hormone problems. A common point in endocrine formulas.", None),
    "Pineal Gland": (None, "Sleep–wake rhythm: insomnia, jet lag, shift-work tiredness, winter low mood.", None),
    "Thyroid Gland (C)": ("Lower antihelix, near the neck area.",
                          "Over- or underactive thyroid (as a support), goitre, metabolism and weight problems, fatigue.", C_NOTE),
    "Thyroid Gland (E)": (None, "Over- or underactive thyroid (as a support), metabolism and weight problems, fatigue.", E_NOTE),
    "Adrenal Gland (C)": ("Lower tip of the tragus (its lower bump).",
                          "Inflammation, allergies, asthma, itchy skin, fever, low blood pressure, rheumatic pain, stress.", C_NOTE),
    "Adrenal Gland (E)": (None, "Stress and burnout, fatigue, inflammation, allergies.", E_NOTE),
    "Ovaries/Testes (E)": (None, "Irregular periods, infertility, menopausal symptoms, low libido, sexual problems.", E_NOTE),
    "Gonadotropins - FSH, Ovaries (C)": (None, "Regulating the sex hormones: irregular periods, ovulation problems, infertility, menopausal symptoms.", C_NOTE),
    "ACTH": (None, "The pituitary hormone that drives the adrenals: stress, inflammation, allergies, rheumatic conditions.", None),
    "TSH": (None, "The pituitary hormone that drives the thyroid: support for thyroid imbalance.", None),

    # ---------------- Nervous system ----------------
    "Brain (C)": (None, "Brain and pituitary function: poor concentration, poor memory, dizziness, insomnia, bed-wetting, developmental and hormonal problems.", None),
    "Brainstem (C)": ("At the notch where the antitragus meets the antihelix.",
                      "Headache, dizziness, neck stiffness, tremors and spasms, after concussion. Calms the nervous system.", None),
    "Frontal Cortex": (None, "Concentration, planning and impulse control: poor focus, ADHD, cravings in addiction, worry.", None),
    "Limbic System (Prostaglandin)": (None, "Emotional balance and inflammation: mood swings, premenstrual symptoms, inflammatory pain.", None),
    "Hippocampus (memory)": (None, "Memory and learning problems, forgetfulness, and trauma-related memories (PTSD).", None),
    "Amygdala (aggressiveness)": (None, "Fear, anger and aggression, anxiety, panic, PTSD.", None),
    "Spinal Cord": ("Along the edge of the antihelix where it drops into the concha (the concha ridge), beside the spine points.",
                    "Nerve pain spreading from the spine, numbness and tingling in the limbs, support after spinal cord injury.", None),
    "Sciatic Nerve": ("Inferior crus of the antihelix, in its middle part.",
                      "Sciatica, pain spreading down the back of the leg, buttock pain.", None),
    "Lesser Occipital Nerve - Wind Stream (C)": ("Scapha, between the Fingers and Wrist areas, near the helix.",
                                                 "Headache at the back and side of the head, migraine, neck pain, numbness of the scalp. As Wind Stream: allergies, hives, hay fever, itching.", None),
}


def slug(name):
    return "EAR-W-" + re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def entry(name, loc, uses, note):
    sections = []
    if loc:
        sections.append({"title": "Location", "paragraphs": [loc]})
    sections.append({"title": "Functions & Uses", "items": [{"label": "Common uses", "text": uses}]})
    if note:
        sections.append({"title": "Note", "paragraphs": [note]})
    return {"id": slug(name), "name": name, "system": "Western Auriculotherapy", "sections": sections}


def main():
    root = Path(__file__).resolve().parent.parent
    info = {n: entry(n, *v) for n, v in POINTS.items()}
    out = root / "src" / "data" / "earWesternInfo.js"
    out.write_text(
        "// Western Auriculotherapy point descriptions, keyed by point name (as in\n"
        "// earPoints.js). GENERATED by scripts/build_ear_western_info.py - edit\n"
        "// the table there and re-run. Original wording; InfoPanel renders `sections`.\n"
        "export const WESTERN_INFO = "
        + json.dumps(info, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {len(info)} points to {out}")


if __name__ == "__main__":
    main()
