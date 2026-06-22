// ─────────────────────────────────────────────────────────────────────────────
// Typing Peak — Multilingual Transliteration Engine
// Tamil: full syllabic phonetic engine (Google Input Tools style)
// Other languages: robust phoneme-map engine
// ─────────────────────────────────────────────────────────────────────────────

export type LangCode = "ta" | "hi" | "te" | "ml" | "kn" | "bn" | "mr";

export interface Language {
  code: LangCode;
  name: string;
  nativeName: string;
  fontClass: string;
  placeholder: string;
}

export const LANGUAGES: Language[] = [
  { code: "ta", name: "Tamil",     nativeName: "தமிழ்",   fontClass: "font-tamil",      placeholder: "தமிழில் தட்டச்சு செய்யுங்கள்..." },
  { code: "hi", name: "Hindi",     nativeName: "हिन्दी",  fontClass: "font-devanagari", placeholder: "हिन्दी में टाइप करें..."           },
  { code: "te", name: "Telugu",    nativeName: "తెలుగు",  fontClass: "font-telugu",     placeholder: "తెలుగులో టైప్ చేయండి..."          },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", fontClass: "font-malayalam",  placeholder: "മലയാളത്തിൽ ടൈപ്പ് ചെയ്യുക..."     },
  { code: "kn", name: "Kannada",   nativeName: "ಕನ್ನಡ",  fontClass: "font-kannada",    placeholder: "ಕನ್ನಡದಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..."           },
  { code: "bn", name: "Bengali",   nativeName: "বাংলা",   fontClass: "font-bengali",    placeholder: "বাংলায় টাইপ করুন..."              },
  { code: "mr", name: "Marathi",   nativeName: "मराठी",   fontClass: "font-devanagari", placeholder: "मराठीत टाइप करा..."               },
];

// ═════════════════════════════════════════════════════════════════════════════
//  SECTION 1 — TAMIL ENGINE
// ═════════════════════════════════════════════════════════════════════════════

// Tamil Unicode codepoints
const TA = {
  // Independent vowels
  A:   "அ", // அ
  AA:  "ஆ", // ஆ
  I:   "இ", // இ
  II:  "ஈ", // ஈ
  U:   "உ", // உ
  UU:  "ஊ", // ஊ
  E:   "எ", // எ
  EE:  "ஏ", // ஏ
  AI:  "ஐ", // ஐ
  O:   "ஒ", // ஒ
  OO:  "ஓ", // ஓ
  AU:  "ஔ", // ஔ

  // Vowel signs (matras) — attached to consonants
  S_AA:  "ா", // ா
  S_I:   "ி", // ி
  S_II:  "ீ", // ீ
  S_U:   "ு", // ு
  S_UU:  "ூ", // ூ
  S_E:   "ெ", // ெ
  S_EE:  "ே", // ே
  S_AI:  "ை", // ை
  S_O:   "ொ", // ொ
  S_OO:  "ோ", // ோ
  S_AU:  "ௌ", // ௌ

  // Virama (pulli) — removes inherent vowel from consonant
  VIRAMA: "்", // ்

  // Aaytham
  AAYTHAM: "ஃ", // ஃ

  // Consonants
  K:   "க", // க
  NG:  "ங", // ங
  C:   "ச", // ச
  NJ:  "ஞ", // ஞ
  T_RET: "ட", // ட  (retroflex T)
  N_RET: "ண", // ண  (retroflex N)
  TH:  "த", // த
  N:   "ந", // ந  (dental n)
  P:   "ப", // ப
  M:   "ம", // ம
  Y:   "ய", // ய
  R:   "ர", // ர
  L:   "ல", // ல
  V:   "வ", // வ
  ZH:  "ழ", // ழ
  LL:  "ள", // ள
  RR:  "ற", // ற
  NN:  "ன", // ன  (alveolar n)
  J:   "ஜ", // ஜ
  SH:  "ஷ", // ஷ
  S:   "ஸ", // ஸ
  H:   "ஹ", // ஹ
};

// Vowel: [independent form, matra/sign form]
// matra "" means virama (no vowel = halant on consonant)
// matra null means "inherent a" — write consonant only
interface VowelDef { indep: string; matra: string | null }

const TAMIL_VOWELS: Record<string, VowelDef> = {
  "aa":  { indep: TA.AA,  matra: TA.S_AA  },
  "ii":  { indep: TA.II,  matra: TA.S_II  },
  "ee":  { indep: TA.EE,  matra: TA.S_EE  },
  "uu":  { indep: TA.UU,  matra: TA.S_UU  },
  "oo":  { indep: TA.OO,  matra: TA.S_OO  },
  "au":  { indep: TA.AU,  matra: TA.S_AU  },
  "ou":  { indep: TA.AU,  matra: TA.S_AU  },
  "ai":  { indep: TA.AI,  matra: TA.S_AI  },
  "a":   { indep: TA.A,   matra: null      }, // inherent vowel
  "i":   { indep: TA.I,   matra: TA.S_I   },
  "u":   { indep: TA.U,   matra: TA.S_U   },
  "e":   { indep: TA.E,   matra: TA.S_E   },
  "o":   { indep: TA.O,   matra: TA.S_O   },
};

// Ordered from longest to shortest for greedy matching
const TAMIL_VOWEL_KEYS = Object.keys(TAMIL_VOWELS).sort((a, b) => b.length - a.length);

// Consonant clusters — ordered longest first
const TAMIL_CONSONANTS: [string, string][] = [
  // 3-char clusters first
  ["nng", TA.NG],
  // 2-char clusters
  ["ng",  TA.NG],
  ["nj",  TA.NJ],
  ["ny",  TA.NJ],
  ["zh",  TA.ZH],
  ["sh",  TA.SH],
  ["th",  TA.TH],   // த (dental)
  ["dh",  TA.TH],   // treat dh as dental th in Tamil
  ["rr",  TA.RR],   // ற
  ["nn",  TA.NN],   // ன (alveolar n)
  ["ll",  TA.LL],   // ள
  ["ch",  TA.C],
  ["dr",  TA.T_RET],
  ["tr",  TA.T_RET],
  // Single consonants
  ["k",   TA.K],
  ["g",   TA.K],    // Tamil has no voiced stops; map g→க
  ["c",   TA.C],
  ["s",   TA.S],
  ["j",   TA.J],
  ["t",   TA.T_RET], // default t → retroflex ட
  ["d",   TA.T_RET],
  ["n",   TA.N],    // dental ந (will be corrected by context below)
  ["p",   TA.P],
  ["b",   TA.P],    // Tamil has no b; map b→ப
  ["m",   TA.M],
  ["y",   TA.Y],
  ["r",   TA.R],
  ["l",   TA.L],
  ["v",   TA.V],
  ["w",   TA.V],
  ["h",   TA.H],
  ["f",   TA.P],    // approximate f→ப
  ["N",   TA.N_RET], // explicit retroflex ண
  ["L",   TA.LL],
  ["R",   TA.RR],
  ["z",   TA.ZH],
];

// Maximum consonant cluster key length (for greedy scan)
const MAX_CONS_LEN = Math.max(...TAMIL_CONSONANTS.map(([k]) => k.length));
const MAX_VOWEL_LEN = Math.max(...TAMIL_VOWEL_KEYS.map((k) => k.length));

// Build a fast lookup map
const CONS_MAP = new Map<string, string>(TAMIL_CONSONANTS);

// ─── Syllable types ───────────────────────────────────────────────────────────
type Syllable =
  | { type: "vowel_only";  vowelKey: string }          // pure vowel: a, i, aa …
  | { type: "cv";          cons: string; vowelKey: string }  // consonant + vowel
  | { type: "coda";        cons: string }               // consonant at end (virama)
  | { type: "other";       ch: string }                 // pass-through (digits, punct)

// ─── Syllable parser ──────────────────────────────────────────────────────────
// Converts a roman word into a list of syllables using greedy longest-match.
function parseSyllables(word: string): Syllable[] {
  const syllables: Syllable[] = [];
  let i = 0;

  while (i < word.length) {
    const ch = word[i];

    // Non-alpha pass-through
    if (!/[a-zA-Z]/.test(ch)) {
      syllables.push({ type: "other", ch });
      i++;
      continue;
    }

    // Try to match a consonant cluster at position i.
    // Special case: if the current char and the next char are the same letter,
    // it's a geminate (doubled consonant, e.g. "nn" in "enna", "kk" in "pakka").
    // In that case prefer the single-char match so we can emit coda + cv.
    let cons: string | null = null;
    const isDoubleLetter = word[i] === word[i + 1] && /[a-z]/i.test(word[i] ?? "");
    const startLen = isDoubleLetter ? 1 : MAX_CONS_LEN;
    for (let len = startLen; len >= 1; len--) {
      const key = word.slice(i, i + len);
      if (CONS_MAP.has(key)) {
        cons = key;
        break;
      }
    }

    if (cons !== null) {
      const consUnicode = CONS_MAP.get(cons)!;
      const afterCons = i + cons.length;

      // Detect geminate single-char consonant: e.g. "kk", "pp", "tt", "nn", "mm"
      // A single-letter key (n, k, p…) followed immediately by the same letter
      // should produce coda + cv, not the digraph interpretation.
      // e.g. "nna" → n(coda=ந்) + na(cv=ன) for words like "enna" (என்ன)
      // Multi-char cluster keys (ng, th, rr…) are never split as geminates.
      const isGeminate =
        cons.length === 1 &&
        word[afterCons] === cons;

      if (isGeminate) {
        // Emit coda for first consonant; loop will re-parse from afterCons
        syllables.push({ type: "coda", cons: consUnicode });
        i = afterCons;
        continue;
      }

      // Try to match a vowel right after the consonant
      let vowelKey: string | null = null;
      for (const vk of TAMIL_VOWEL_KEYS) {
        if (word.slice(afterCons, afterCons + vk.length) === vk) {
          vowelKey = vk;
          break;
        }
      }

      if (vowelKey !== null) {
        syllables.push({ type: "cv", cons: consUnicode, vowelKey });
        i = afterCons + vowelKey.length;
      } else {
        // Coda: consonant gets virama (followed by another consonant or end of word)
        syllables.push({ type: "coda", cons: consUnicode });
        i = afterCons;
      }
      continue;
    }

    // No consonant match — try a standalone vowel
    let vowelKey: string | null = null;
    for (const vk of TAMIL_VOWEL_KEYS) {
      if (word.slice(i, i + vk.length) === vk) {
        vowelKey = vk;
        break;
      }
    }

    if (vowelKey !== null) {
      syllables.push({ type: "vowel_only", vowelKey });
      i += vowelKey.length;
      continue;
    }

    // Truly unknown character — pass through
    syllables.push({ type: "other", ch: word[i] });
    i++;
  }

  return syllables;
}

// ─── Render syllables → Tamil Unicode string ──────────────────────────────────
// Rules:
//   1. vowel_only    → independent vowel character
//   2. cv (a)        → consonant only (inherent vowel, no matra needed)
//   3. cv (other)    → consonant + matra
//   4. coda followed by another consonant/coda → consonant + virama (cluster)
//   5. coda at word end → consonant + virama (pulli)
function renderSyllables(syllables: Syllable[]): string {
  let out = "";

  for (let i = 0; i < syllables.length; i++) {
    const s = syllables[i];

    if (s.type === "other") {
      out += s.ch;
      continue;
    }

    if (s.type === "vowel_only") {
      out += TAMIL_VOWELS[s.vowelKey].indep;
      continue;
    }

    if (s.type === "cv") {
      const vdef = TAMIL_VOWELS[s.vowelKey];
      if (vdef.matra === null) {
        // Inherent 'a' — just write the consonant
        out += s.cons;
      } else {
        out += s.cons + vdef.matra;
      }
      continue;
    }

    if (s.type === "coda") {
      // Always add virama — whether mid-word cluster or word-final
      out += s.cons + TA.VIRAMA;
      continue;
    }
  }

  return out;
}

// ─── Context corrections ──────────────────────────────────────────────────────
// After rendering, apply known Tamil orthographic rules:
//   • ன (alveolar NN ன) before vowels at word start → ந (ந)
//   • Geminate fix: க்க → க்க (already correct from coda+cv)
//   • ண (retroflex N) between vowels — handled by user typing N
function applyTamilOrthography(text: string): string {
  // Word-initial ன → ந
  return text.replace(/(^|[\s஀-௿])(ன)/g, (_, pre, _ch) => pre + TA.N);
}

// ─── Public API: transliterate a single Tamil word ────────────────────────────
function transliterateTamilWord(word: string): string {
  if (!word) return "";
  const syllables = parseSyllables(word);
  const rendered  = renderSyllables(syllables);
  return rendered;
}

// ─── Known-word dictionary for common words (ranking / correction) ────────────
// These are only used for lookup suggestions, NOT for blocking the engine.
// The engine always generates output even for unknown words.
const TAMIL_DICTIONARY: Record<string, string> = {
  enna:      "என்ன",
  ennai:     "என்னை",
  ennal:     "என்னால்",
  ennamo:    "என்னமோ",
  yenna:     "என்ன",
  naan:      "நான்",
  naam:      "நாம்",
  amma:      "அம்மா",
  appa:      "அப்பா",
  anna:      "அண்ணா",
  akka:      "அக்கா",
  thambi:    "தம்பி",
  thangai:   "தங்கை",
  vanakkam:  "வணக்கம்",
  tamil:     "தமிழ்",
  eppadi:    "எப்படி",
  irukken:   "இருக்கேன்",
  irukku:    "இருக்கு",
  irukkrom:  "இருக்கோம்",
  ennaku:    "எனக்கு",
  ungal:     "உங்கள்",
  engal:     "எங்கள்",
  naadu:     "நாடு",
  ooru:      "ஊர்",
  veedu:     "வீடு",
  padam:     "படம்",
  pattanam:  "பட்டணம்",
  paal:      "பால்",
  saapadu:   "சாப்பாடு",
  thanni:    "தண்ணி",
  kaadu:     "காடு",
  vaan:      "வான்",
  mann:      "மண்",
  penn:      "பெண்",
  aan:       "ஆண்",
  kurai:     "குறை",
  neram:     "நேரம்",
  maram:     "மரம்",
  varam:     "வரம்",
  uyir:      "உயிர்",
  ullam:     "உள்ளம்",
  kathal:    "காதல்",
  manithan:  "மனிதன்",
  manidhan:  "மனிதன்",
  azhagu:    "அழகு",
  azhagin:   "அழகின்",
  kavithai:  "கவிதை",
  ilam:      "இளம்",
  kaalam:    "காலம்",
  sollu:     "சொல்லு",
  ketku:     "கேட்கு",
  padikka:   "படிக்க",
  ezhuthu:   "எழுத்து",
  pechchu:   "பேச்சு",
  theru:     "தெரு",
  karai:     "கரை",
  odam:      "ஓடம்",
  kari:      "கறி",
  koil:      "கோயில்",
  endha:     "எந்த",
  antha:     "அந்த",
  inga:      "இங்க",
  anga:      "அங்க",
  neengal:   "நீங்கள்",
  neenga:    "நீங்க",
  nee:       "நீ",
  avan:      "அவன்",
  aval:      "அவள்",
  avanga:    "அவங்க",
  andha:     "அந்த",
  indha:     "இந்த",
  yellam:    "எல்லாம்",
  yella:     "எல்லா",
  romba:     "ரொம்ப",
  konjam:    "கொஞ்சம்",
  therinju:  "தெரிஞ்சு",
  theriyum:  "தெரியும்",
  theriyala: "தெரியல",
  mudiyum:   "முடியும்",
  mudiyala:  "முடியல",
  vaa:       "வா",
  po:        "போ",
  porom:     "போறோம்",
  varom:     "வரோம்",
  paarom:    "பாரோம்",
  paaru:     "பாரு",
  sollu:     "சொல்லு",
  kettu:     "கேட்டு",
  paartu:    "பார்த்து",
  saapta:    "சாப்பிட்ட",
  kudicha:   "குடிச்ச",
  pannuven:  "பண்ணுவேன்",
  pannrom:   "பண்றோம்",
};

// ─── Autocomplete / suggestion engine ─────────────────────────────────────────
const learnedWords = new Map<string, string>(); // roman → tamil (user-confirmed)
const learnedFreq  = new Map<string, number>();  // roman → selection count

export function learnSelection(roman: string, tamil: string): void {
  learnedWords.set(roman.toLowerCase(), tamil);
  learnedFreq.set(roman.toLowerCase(), (learnedFreq.get(roman.toLowerCase()) ?? 0) + 1);
}

export function getSuggestions(partial: string): Array<{ roman: string; tamil: string }> {
  if (!partial || partial.length < 2) return [];
  const lower = partial.toLowerCase();

  const results: Array<{ roman: string; tamil: string; score: number }> = [];

  // 1. Exact match from learned words (highest priority)
  if (learnedWords.has(lower)) {
    results.push({ roman: lower, tamil: learnedWords.get(lower)!, score: 1000 + (learnedFreq.get(lower) ?? 0) });
  }

  // 2. Prefix matches from dictionary
  for (const [roman, tamil] of Object.entries(TAMIL_DICTIONARY)) {
    if (roman.startsWith(lower) && roman !== lower) {
      results.push({ roman, tamil, score: 100 - roman.length });
    }
  }

  // 3. Prefix matches from learned words
  for (const [roman, tamil] of learnedWords) {
    if (roman.startsWith(lower) && roman !== lower) {
      const freq = learnedFreq.get(roman) ?? 1;
      results.push({ roman, tamil, score: 50 + freq });
    }
  }

  // Deduplicate and sort by score descending
  const seen = new Set<string>();
  return results
    .sort((a, b) => b.score - a.score)
    .filter(({ roman }) => {
      if (seen.has(roman)) return false;
      seen.add(roman);
      return true;
    })
    .slice(0, 5)
    .map(({ roman, tamil }) => ({ roman, tamil }));
}

// ─── Main Tamil transliterate word ───────────────────────────────────────────
// Prefers dictionary, then engine output
function bestTamilWord(word: string): string {
  const lower = word.toLowerCase();

  // Learned words first
  if (learnedWords.has(lower)) return learnedWords.get(lower)!;

  // Dictionary lookup
  if (TAMIL_DICTIONARY[lower]) return TAMIL_DICTIONARY[lower];

  // Engine
  const engineOut = transliterateTamilWord(lower);
  return applyTamilOrthography(engineOut);
}

// ═════════════════════════════════════════════════════════════════════════════
//  SECTION 2 — OTHER LANGUAGE ENGINES (phoneme-map based, robust)
// ═════════════════════════════════════════════════════════════════════════════

// Each entry: [roman_key, unicode] — sorted longest-first inside each group
const DEVANAGARI_MAP: [string, string][] = [
  ["aa","आ"],["ii","ई"],["uu","ऊ"],["ee","ई"],["oo","ओ"],["ai","ऐ"],["au","औ"],["ou","औ"],
  ["a","अ"],["i","इ"],["u","उ"],["e","ए"],["o","ओ"],
  ["kh","ख"],["gh","घ"],["ch","च"],["Ch","छ"],["jh","झ"],["Th","ठ"],["Dh","ढ"],
  ["th","त"],["dh","द"],["ph","फ"],["bh","भ"],["sh","श"],["Sh","ष"],
  ["ny","ञ"],["ng","ङ"],["nj","ञ"],["rr","ड़"],["nn","ण"],
  ["k","क"],["g","ग"],["c","च"],["j","ज"],["t","त"],["d","द"],["n","न"],
  ["p","प"],["b","ब"],["m","म"],["y","य"],["r","र"],["l","ल"],["v","व"],["w","व"],
  ["s","स"],["h","ह"],["f","फ"],["z","ज़"],["q","क़"],["N","ण"],["T","ट"],["D","ड"],
  ["R","ड़"],["L","ळ"],["M","ं"],["H","ः"],
];

const TELUGU_MAP: [string, string][] = [
  ["aa","ఆ"],["ii","ఈ"],["uu","ఊ"],["ee","ఈ"],["ai","ఐ"],["oo","ఓ"],["au","ఔ"],
  ["a","అ"],["i","ఇ"],["u","ఉ"],["e","ఎ"],["o","ఒ"],
  ["kh","ఖ"],["gh","ఘ"],["ch","చ"],["jh","ఝ"],["th","థ"],["dh","ధ"],
  ["ph","ఫ"],["bh","భ"],["sh","శ"],["ng","ఙ"],["ny","ఞ"],["nj","ఞ"],
  ["rr","ర్ర"],["nn","న్న"],["ll","ల్ల"],
  ["k","క"],["g","గ"],["c","చ"],["j","జ"],["t","ట"],["d","డ"],["n","న"],
  ["p","ప"],["b","బ"],["m","మ"],["y","య"],["r","ర"],["l","ల"],["v","వ"],["w","వ"],
  ["s","స"],["h","హ"],["f","ఫ"],["z","జ"],["L","ళ"],["N","ణ"],["R","ర"],["T","ఠ"],["D","ఢ"],
];

const MALAYALAM_MAP: [string, string][] = [
  ["aa","ആ"],["ii","ഈ"],["uu","ഊ"],["ee","ഈ"],["ai","ഐ"],["oo","ഓ"],["au","ഔ"],
  ["a","അ"],["i","ഇ"],["u","ഉ"],["e","എ"],["o","ഒ"],
  ["kh","ഖ"],["gh","ഘ"],["ch","ച"],["jh","ഝ"],["th","ഥ"],["dh","ധ"],
  ["ph","ഫ"],["bh","ഭ"],["sh","ശ"],["zh","ഴ"],["ng","ങ"],["ny","ഞ"],["nj","ഞ"],
  ["rr","റ്റ"],["nn","ന്ന"],["ll","ല്ല"],
  ["k","ക"],["g","ഗ"],["c","ച"],["j","ജ"],["t","ട"],["d","ഡ"],["n","ന"],
  ["p","പ"],["b","ബ"],["m","മ"],["y","യ"],["r","ര"],["l","ല"],["v","വ"],["w","വ"],
  ["s","സ"],["h","ഹ"],["f","ഫ"],["z","സ"],["L","ള"],["N","ണ"],["R","ര"],
];

const KANNADA_MAP: [string, string][] = [
  ["aa","ಆ"],["ii","ಈ"],["uu","ಊ"],["ee","ಈ"],["ai","ಐ"],["oo","ಓ"],["au","ಔ"],
  ["a","ಅ"],["i","ಇ"],["u","ಉ"],["e","ಎ"],["o","ಒ"],
  ["kh","ಖ"],["gh","ಘ"],["ch","ಚ"],["jh","ಝ"],["th","ಥ"],["dh","ಧ"],
  ["ph","ಫ"],["bh","ಭ"],["sh","ಶ"],["ng","ಙ"],["ny","ಞ"],["nj","ಞ"],
  ["rr","ರ್ರ"],["nn","ನ್ನ"],["ll","ಲ್ಲ"],
  ["k","ಕ"],["g","ಗ"],["c","ಚ"],["j","ಜ"],["t","ಟ"],["d","ಡ"],["n","ನ"],
  ["p","ಪ"],["b","ಬ"],["m","ಮ"],["y","ಯ"],["r","ರ"],["l","ಲ"],["v","ವ"],["w","ವ"],
  ["s","ಸ"],["h","ಹ"],["f","ಫ"],["z","ಜ"],["L","ಳ"],["N","ಣ"],["R","ರ"],["T","ಠ"],["D","ಢ"],
];

const BENGALI_MAP: [string, string][] = [
  ["aa","আ"],["ii","ঈ"],["uu","ঊ"],["ee","ঈ"],["oo","ও"],["ai","ঐ"],["au","ঔ"],
  ["a","অ"],["i","ই"],["u","উ"],["e","এ"],["o","ও"],
  ["kh","খ"],["gh","ঘ"],["ch","চ"],["jh","ঝ"],["th","থ"],["dh","ধ"],
  ["ph","ফ"],["bh","ভ"],["sh","শ"],["ng","ঙ"],["ny","ঞ"],["nj","ঞ"],
  ["rr","ড়"],["nn","ণ"],["ll","ল্ল"],
  ["k","ক"],["g","গ"],["c","চ"],["j","জ"],["t","ত"],["d","দ"],["n","ন"],
  ["p","প"],["b","ব"],["m","ম"],["y","য"],["r","র"],["l","ল"],["v","ভ"],["w","ও"],
  ["s","স"],["h","হ"],["f","ফ"],["z","জ"],["N","ণ"],["T","ট"],["D","ড"],["R","ড়"],
];

type PhonemeMap = [string, string][];

const LANG_PHONEME_MAPS: Partial<Record<LangCode, PhonemeMap>> = {
  hi: DEVANAGARI_MAP,
  mr: DEVANAGARI_MAP,
  te: TELUGU_MAP,
  ml: MALAYALAM_MAP,
  kn: KANNADA_MAP,
  bn: BENGALI_MAP,
};

function transliterateWordPhoneme(word: string, map: PhonemeMap): string {
  const maxLen = Math.max(...map.map(([k]) => k.length));
  let result = "";
  let i = 0;
  while (i < word.length) {
    let matched = false;
    for (let len = maxLen; len >= 1; len--) {
      const chunk = word.slice(i, i + len);
      const entry = map.find(([k]) => k === chunk);
      if (entry) {
        result += entry[1];
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += word[i];
      i++;
    }
  }
  return result;
}

// ═════════════════════════════════════════════════════════════════════════════
//  SECTION 3 — PUBLIC API
// ═════════════════════════════════════════════════════════════════════════════

// Transliterate full text, preserving spaces / newlines / punctuation
export function transliterate(text: string, lang: LangCode): string {
  if (lang === "ta") {
    // Split on roman word boundaries; pass everything else through
    return text.replace(/([a-zA-Z]+)/g, (word) => bestTamilWord(word));
  }

  const map = LANG_PHONEME_MAPS[lang];
  if (!map) return text;
  return text.replace(/([a-zA-Z]+)/g, (word) => transliterateWordPhoneme(word, map));
}

// Transliterate a partial word being typed (no dictionary correction — raw engine)
// Used for live preview in the editor input
export function transliteratePartial(partial: string, lang: LangCode): string {
  if (!partial) return "";
  if (lang === "ta") {
    const lower = partial.toLowerCase();
    const engineOut = transliterateTamilWord(lower);
    return applyTamilOrthography(engineOut);
  }
  const map = LANG_PHONEME_MAPS[lang];
  if (!map) return partial;
  return transliterateWordPhoneme(partial, map);
}
