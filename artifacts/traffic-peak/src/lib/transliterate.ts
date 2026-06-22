// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Typing Peak â€” Multilingual Transliteration Engine
// Tamil: full syllabic phonetic engine (Google Input Tools style)
// Other languages: robust phoneme-map engine
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type LangCode = "ta" | "hi" | "te" | "ml" | "kn" | "bn" | "mr";

export interface Language {
  code: LangCode;
  name: string;
  nativeName: string;
  fontClass: string;
  placeholder: string;
}

export const LANGUAGES: Language[] = [
  { code: "ta", name: "Tamil",     nativeName: "à®¤à®®à®¿à®´à¯",   fontClass: "font-tamil",      placeholder: "à®¤à®®à®¿à®´à®¿à®²à¯ à®¤à®Ÿà¯à®Ÿà®šà¯à®šà¯ à®šà¯†à®¯à¯à®¯à¯à®™à¯à®•à®³à¯..." },
  { code: "hi", name: "Hindi",     nativeName: "à¤¹à¤¿à¤¨à¥à¤¦à¥€",  fontClass: "font-devanagari", placeholder: "à¤¹à¤¿à¤¨à¥à¤¦à¥€ à¤®à¥‡à¤‚ à¤Ÿà¤¾à¤‡à¤ª à¤•à¤°à¥‡à¤‚..."           },
  { code: "te", name: "Telugu",    nativeName: "à°¤à±†à°²à±à°—à±",  fontClass: "font-telugu",     placeholder: "à°¤à±†à°²à±à°—à±à°²à±‹ à°Ÿà±ˆà°ªà± à°šà±‡à°¯à°‚à°¡à°¿..."          },
  { code: "ml", name: "Malayalam", nativeName: "à´®à´²à´¯à´¾à´³à´‚", fontClass: "font-malayalam",  placeholder: "à´®à´²à´¯à´¾à´³à´¤àµà´¤à´¿àµ½ à´Ÿàµˆà´ªàµà´ªàµ à´šàµ†à´¯àµà´¯àµà´•..."     },
  { code: "kn", name: "Kannada",   nativeName: "à²•à²¨à³à²¨à²¡",  fontClass: "font-kannada",    placeholder: "à²•à²¨à³à²¨à²¡à²¦à²²à³à²²à²¿ à²Ÿà³ˆà²ªà³ à²®à²¾à²¡à²¿..."           },
  { code: "bn", name: "Bengali",   nativeName: "à¦¬à¦¾à¦‚à¦²à¦¾",   fontClass: "font-bengali",    placeholder: "à¦¬à¦¾à¦‚à¦²à¦¾à¦¯à¦¼ à¦Ÿà¦¾à¦‡à¦ª à¦•à¦°à§à¦¨..."              },
  { code: "mr", name: "Marathi",   nativeName: "à¤®à¤°à¤¾à¤ à¥€",   fontClass: "font-devanagari", placeholder: "à¤®à¤°à¤¾à¤ à¥€à¤¤ à¤Ÿà¤¾à¤‡à¤ª à¤•à¤°à¤¾..."               },
];

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SECTION 1 â€” TAMIL ENGINE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Tamil Unicode codepoints
const TA = {
  // Independent vowels
  A:   "à®…", // à®…
  AA:  "à®†", // à®†
  I:   "à®‡", // à®‡
  II:  "à®ˆ", // à®ˆ
  U:   "à®‰", // à®‰
  UU:  "à®Š", // à®Š
  E:   "à®Ž", // à®Ž
  EE:  "à®", // à®
  AI:  "à®", // à®
  O:   "à®’", // à®’
  OO:  "à®“", // à®“
  AU:  "à®”", // à®”

  // Vowel signs (matras) â€” attached to consonants
  S_AA:  "à®¾", // à®¾
  S_I:   "à®¿", // à®¿
  S_II:  "à¯€", // à¯€
  S_U:   "à¯", // à¯
  S_UU:  "à¯‚", // à¯‚
  S_E:   "à¯†", // à¯†
  S_EE:  "à¯‡", // à¯‡
  S_AI:  "à¯ˆ", // à¯ˆ
  S_O:   "à¯Š", // à¯Š
  S_OO:  "à¯‹", // à¯‹
  S_AU:  "à¯Œ", // à¯Œ

  // Virama (pulli) â€” removes inherent vowel from consonant
  VIRAMA: "à¯", // à¯

  // Aaytham
  AAYTHAM: "à®ƒ", // à®ƒ

  // Consonants
  K:   "à®•", // à®•
  NG:  "à®™", // à®™
  C:   "à®š", // à®š
  NJ:  "à®ž", // à®ž
  T_RET: "à®Ÿ", // à®Ÿ  (retroflex T)
  N_RET: "à®£", // à®£  (retroflex N)
  TH:  "à®¤", // à®¤
  N:   "à®¨", // à®¨  (dental n)
  P:   "à®ª", // à®ª
  M:   "à®®", // à®®
  Y:   "à®¯", // à®¯
  R:   "à®°", // à®°
  L:   "à®²", // à®²
  V:   "à®µ", // à®µ
  ZH:  "à®´", // à®´
  LL:  "à®³", // à®³
  RR:  "à®±", // à®±
  NN:  "à®©", // à®©  (alveolar n)
  J:   "à®œ", // à®œ
  SH:  "à®·", // à®·
  S:   "à®¸", // à®¸
  H:   "à®¹", // à®¹
};

// Vowel: [independent form, matra/sign form]
// matra "" means virama (no vowel = halant on consonant)
// matra null means "inherent a" â€” write consonant only
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

// Consonant clusters â€” ordered longest first
const TAMIL_CONSONANTS: [string, string][] = [
  // 3-char clusters first
  ["nng", TA.NG],
  // 2-char clusters
  ["ng",  TA.NG],
  ["nj",  TA.NJ],
  ["ny",  TA.NJ],
  ["zh",  TA.ZH],
  ["sh",  TA.SH],
  ["th",  TA.TH],   // à®¤ (dental)
  ["dh",  TA.TH],   // treat dh as dental th in Tamil
  ["rr",  TA.RR],   // à®±
  ["nn",  TA.NN],   // à®© (alveolar n)
  ["ll",  TA.LL],   // à®³
  ["ch",  TA.C],
  ["dr",  TA.T_RET],
  ["tr",  TA.T_RET],
  // Single consonants
  ["k",   TA.K],
  ["g",   TA.K],    // Tamil has no voiced stops; map gâ†’à®•
  ["c",   TA.C],
  ["s",   TA.S],
  ["j",   TA.J],
  ["t",   TA.T_RET], // default t â†’ retroflex à®Ÿ
  ["d",   TA.T_RET],
  ["n",   TA.N],    // dental à®¨ (will be corrected by context below)
  ["p",   TA.P],
  ["b",   TA.P],    // Tamil has no b; map bâ†’à®ª
  ["m",   TA.M],
  ["y",   TA.Y],
  ["r",   TA.R],
  ["l",   TA.L],
  ["v",   TA.V],
  ["w",   TA.V],
  ["h",   TA.H],
  ["f",   TA.P],    // approximate fâ†’à®ª
  ["N",   TA.N_RET], // explicit retroflex à®£
  ["L",   TA.LL],
  ["R",   TA.RR],
  ["z",   TA.ZH],
];

// Maximum consonant cluster key length (for greedy scan)
const MAX_CONS_LEN = Math.max(...TAMIL_CONSONANTS.map(([k]) => k.length));
const MAX_VOWEL_LEN = Math.max(...TAMIL_VOWEL_KEYS.map((k) => k.length));

// Build a fast lookup map
const CONS_MAP = new Map<string, string>(TAMIL_CONSONANTS);

// â”€â”€â”€ Syllable types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Syllable =
  | { type: "vowel_only";  vowelKey: string }          // pure vowel: a, i, aa â€¦
  | { type: "cv";          cons: string; vowelKey: string }  // consonant + vowel
  | { type: "coda";        cons: string }               // consonant at end (virama)
  | { type: "other";       ch: string }                 // pass-through (digits, punct)

// â”€â”€â”€ Syllable parser â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      // A single-letter key (n, k, pâ€¦) followed immediately by the same letter
      // should produce coda + cv, not the digraph interpretation.
      // e.g. "nna" â†’ n(coda=à®¨à¯) + na(cv=à®©) for words like "enna" (à®Žà®©à¯à®©)
      // Multi-char cluster keys (ng, th, rrâ€¦) are never split as geminates.
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

    // No consonant match â€” try a standalone vowel
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

    // Truly unknown character â€” pass through
    syllables.push({ type: "other", ch: word[i] });
    i++;
  }

  return syllables;
}

// â”€â”€â”€ Render syllables â†’ Tamil Unicode string â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Rules:
//   1. vowel_only    â†’ independent vowel character
//   2. cv (a)        â†’ consonant only (inherent vowel, no matra needed)
//   3. cv (other)    â†’ consonant + matra
//   4. coda followed by another consonant/coda â†’ consonant + virama (cluster)
//   5. coda at word end â†’ consonant + virama (pulli)
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
        // Inherent 'a' â€” just write the consonant
        out += s.cons;
      } else {
        out += s.cons + vdef.matra;
      }
      continue;
    }

    if (s.type === "coda") {
      // Always add virama â€” whether mid-word cluster or word-final
      out += s.cons + TA.VIRAMA;
      continue;
    }
  }

  return out;
}

// â”€â”€â”€ Context corrections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// After rendering, apply known Tamil orthographic rules:
//   â€¢ à®© (alveolar NN à®©) before vowels at word start â†’ à®¨ (à®¨)
//   â€¢ Geminate fix: à®•à¯à®• â†’ à®•à¯à®• (already correct from coda+cv)
//   â€¢ à®£ (retroflex N) between vowels â€” handled by user typing N
function applyTamilOrthography(text: string): string {
  // Word-initial à®© â†’ à®¨
  return text.replace(/(^|\s)(à®©)/g, (_, pre, _ch) => pre + TA.N);
}

// â”€â”€â”€ Public API: transliterate a single Tamil word â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function transliterateTamilWord(word: string): string {
  if (!word) return "";
  const syllables = parseSyllables(word);
  const rendered  = renderSyllables(syllables);
  return rendered;
}

// â”€â”€â”€ Known-word dictionary for common words (ranking / correction) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// These are only used for lookup suggestions, NOT for blocking the engine.
// The engine always generates output even for unknown words.
const TAMIL_DICTIONARY: Record<string, string> = {
  enna:      "à®Žà®©à¯à®©",
  ennai:     "à®Žà®©à¯à®©à¯ˆ",
  ennal:     "à®Žà®©à¯à®©à®¾à®²à¯",
  ennamo:    "à®Žà®©à¯à®©à®®à¯‹",
  yenna:     "à®Žà®©à¯à®©",
  naan:      "à®¨à®¾à®©à¯",
  naam:      "à®¨à®¾à®®à¯",
  amma:      "à®…à®®à¯à®®à®¾",
  appa:      "à®…à®ªà¯à®ªà®¾",
  anna:      "à®…à®£à¯à®£à®¾",
  akka:      "à®…à®•à¯à®•à®¾",
  thambi:    "à®¤à®®à¯à®ªà®¿",
  thangai:   "à®¤à®™à¯à®•à¯ˆ",
  vanakkam:  "à®µà®£à®•à¯à®•à®®à¯",
  tamil:     "à®¤à®®à®¿à®´à¯",
  eppadi:    "à®Žà®ªà¯à®ªà®Ÿà®¿",
  irukken:   "à®‡à®°à¯à®•à¯à®•à¯‡à®©à¯",
  irukku:    "à®‡à®°à¯à®•à¯à®•à¯",
  irukkrom:  "à®‡à®°à¯à®•à¯à®•à¯‹à®®à¯",
  ennaku:    "à®Žà®©à®•à¯à®•à¯",
  ungal:     "à®‰à®™à¯à®•à®³à¯",
  engal:     "à®Žà®™à¯à®•à®³à¯",
  naadu:     "à®¨à®¾à®Ÿà¯",
  ooru:      "à®Šà®°à¯",
  veedu:     "à®µà¯€à®Ÿà¯",
  padam:     "à®ªà®Ÿà®®à¯",
  pattanam:  "à®ªà®Ÿà¯à®Ÿà®£à®®à¯",
  paal:      "à®ªà®¾à®²à¯",
  saapadu:   "à®šà®¾à®ªà¯à®ªà®¾à®Ÿà¯",
  thanni:    "à®¤à®£à¯à®£à®¿",
  kaadu:     "à®•à®¾à®Ÿà¯",
  vaan:      "à®µà®¾à®©à¯",
  mann:      "à®®à®£à¯",
  penn:      "à®ªà¯†à®£à¯",
  aan:       "à®†à®£à¯",
  kurai:     "à®•à¯à®±à¯ˆ",
  neram:     "à®¨à¯‡à®°à®®à¯",
  maram:     "à®®à®°à®®à¯",
  varam:     "à®µà®°à®®à¯",
  uyir:      "à®‰à®¯à®¿à®°à¯",
  ullam:     "à®‰à®³à¯à®³à®®à¯",
  kathal:    "à®•à®¾à®¤à®²à¯",
  manithan:  "à®®à®©à®¿à®¤à®©à¯",
  manidhan:  "à®®à®©à®¿à®¤à®©à¯",
  azhagu:    "à®…à®´à®•à¯",
  azhagin:   "à®…à®´à®•à®¿à®©à¯",
  kavithai:  "à®•à®µà®¿à®¤à¯ˆ",
  ilam:      "à®‡à®³à®®à¯",
  kaalam:    "à®•à®¾à®²à®®à¯",
  sollu:     "à®šà¯Šà®²à¯à®²à¯",
  ketku:     "à®•à¯‡à®Ÿà¯à®•à¯",
  padikka:   "à®ªà®Ÿà®¿à®•à¯à®•",
  ezhuthu:   "à®Žà®´à¯à®¤à¯à®¤à¯",
  pechchu:   "à®ªà¯‡à®šà¯à®šà¯",
  theru:     "à®¤à¯†à®°à¯",
  karai:     "à®•à®°à¯ˆ",
  odam:      "à®“à®Ÿà®®à¯",
  kari:      "à®•à®±à®¿",
  koil:      "à®•à¯‹à®¯à®¿à®²à¯",
  endha:     "à®Žà®¨à¯à®¤",
  antha:     "à®…à®¨à¯à®¤",
  inga:      "à®‡à®™à¯à®•",
  anga:      "à®…à®™à¯à®•",
  neengal:   "à®¨à¯€à®™à¯à®•à®³à¯",
  neenga:    "à®¨à¯€à®™à¯à®•",
  nee:       "à®¨à¯€",
  avan:      "à®…à®µà®©à¯",
  aval:      "à®…à®µà®³à¯",
  avanga:    "à®…à®µà®™à¯à®•",
  andha:     "à®…à®¨à¯à®¤",
  indha:     "à®‡à®¨à¯à®¤",
  yellam:    "à®Žà®²à¯à®²à®¾à®®à¯",
  yella:     "à®Žà®²à¯à®²à®¾",
  romba:     "à®°à¯Šà®®à¯à®ª",
  konjam:    "à®•à¯Šà®žà¯à®šà®®à¯",
  therinju:  "à®¤à¯†à®°à®¿à®žà¯à®šà¯",
  theriyum:  "à®¤à¯†à®°à®¿à®¯à¯à®®à¯",
  theriyala: "à®¤à¯†à®°à®¿à®¯à®²",
  mudiyum:   "à®®à¯à®Ÿà®¿à®¯à¯à®®à¯",
  mudiyala:  "à®®à¯à®Ÿà®¿à®¯à®²",
  vaa:       "à®µà®¾",
  po:        "à®ªà¯‹",
  porom:     "à®ªà¯‹à®±à¯‹à®®à¯",
  varom:     "à®µà®°à¯‹à®®à¯",
  paarom:    "à®ªà®¾à®°à¯‹à®®à¯",
  paaru:     "à®ªà®¾à®°à¯",
  sollu:     "à®šà¯Šà®²à¯à®²à¯",
  kettu:     "à®•à¯‡à®Ÿà¯à®Ÿà¯",
  paartu:    "à®ªà®¾à®°à¯à®¤à¯à®¤à¯",
  saapta:    "à®šà®¾à®ªà¯à®ªà®¿à®Ÿà¯à®Ÿ",
  kudicha:   "à®•à¯à®Ÿà®¿à®šà¯à®š",
  pannuven:  "à®ªà®£à¯à®£à¯à®µà¯‡à®©à¯",
  pannrom:   "à®ªà®£à¯à®±à¯‹à®®à¯",
};

// â”€â”€â”€ Autocomplete / suggestion engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const learnedWords = new Map<string, string>(); // roman â†’ tamil (user-confirmed)
const learnedFreq  = new Map<string, number>();  // roman â†’ selection count

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

// â”€â”€â”€ Main Tamil transliterate word â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SECTION 2 â€” OTHER LANGUAGE ENGINES (phoneme-map based, robust)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// Each entry: [roman_key, unicode] â€” sorted longest-first inside each group
const DEVANAGARI_MAP: [string, string][] = [
  ["aa","à¤†"],["ii","à¤ˆ"],["uu","à¤Š"],["ee","à¤ˆ"],["oo","à¤“"],["ai","à¤"],["au","à¤”"],["ou","à¤”"],
  ["a","à¤…"],["i","à¤‡"],["u","à¤‰"],["e","à¤"],["o","à¤“"],
  ["kh","à¤–"],["gh","à¤˜"],["ch","à¤š"],["Ch","à¤›"],["jh","à¤"],["Th","à¤ "],["Dh","à¤¢"],
  ["th","à¤¤"],["dh","à¤¦"],["ph","à¤«"],["bh","à¤­"],["sh","à¤¶"],["Sh","à¤·"],
  ["ny","à¤ž"],["ng","à¤™"],["nj","à¤ž"],["rr","à¤¡à¤¼"],["nn","à¤£"],
  ["k","à¤•"],["g","à¤—"],["c","à¤š"],["j","à¤œ"],["t","à¤¤"],["d","à¤¦"],["n","à¤¨"],
  ["p","à¤ª"],["b","à¤¬"],["m","à¤®"],["y","à¤¯"],["r","à¤°"],["l","à¤²"],["v","à¤µ"],["w","à¤µ"],
  ["s","à¤¸"],["h","à¤¹"],["f","à¤«"],["z","à¤œà¤¼"],["q","à¤•à¤¼"],["N","à¤£"],["T","à¤Ÿ"],["D","à¤¡"],
  ["R","à¤¡à¤¼"],["L","à¤³"],["M","à¤‚"],["H","à¤ƒ"],
];

const TELUGU_MAP: [string, string][] = [
  ["aa","à°†"],["ii","à°ˆ"],["uu","à°Š"],["ee","à°ˆ"],["ai","à°"],["oo","à°“"],["au","à°”"],
  ["a","à°…"],["i","à°‡"],["u","à°‰"],["e","à°Ž"],["o","à°’"],
  ["kh","à°–"],["gh","à°˜"],["ch","à°š"],["jh","à°"],["th","à°¥"],["dh","à°§"],
  ["ph","à°«"],["bh","à°­"],["sh","à°¶"],["ng","à°™"],["ny","à°ž"],["nj","à°ž"],
  ["rr","à°°à±à°°"],["nn","à°¨à±à°¨"],["ll","à°²à±à°²"],
  ["k","à°•"],["g","à°—"],["c","à°š"],["j","à°œ"],["t","à°Ÿ"],["d","à°¡"],["n","à°¨"],
  ["p","à°ª"],["b","à°¬"],["m","à°®"],["y","à°¯"],["r","à°°"],["l","à°²"],["v","à°µ"],["w","à°µ"],
  ["s","à°¸"],["h","à°¹"],["f","à°«"],["z","à°œ"],["L","à°³"],["N","à°£"],["R","à°°"],["T","à° "],["D","à°¢"],
];

const MALAYALAM_MAP: [string, string][] = [
  ["aa","à´†"],["ii","à´ˆ"],["uu","à´Š"],["ee","à´ˆ"],["ai","à´"],["oo","à´“"],["au","à´”"],
  ["a","à´…"],["i","à´‡"],["u","à´‰"],["e","à´Ž"],["o","à´’"],
  ["kh","à´–"],["gh","à´˜"],["ch","à´š"],["jh","à´"],["th","à´¥"],["dh","à´§"],
  ["ph","à´«"],["bh","à´­"],["sh","à´¶"],["zh","à´´"],["ng","à´™"],["ny","à´ž"],["nj","à´ž"],
  ["rr","à´±àµà´±"],["nn","à´¨àµà´¨"],["ll","à´²àµà´²"],
  ["k","à´•"],["g","à´—"],["c","à´š"],["j","à´œ"],["t","à´Ÿ"],["d","à´¡"],["n","à´¨"],
  ["p","à´ª"],["b","à´¬"],["m","à´®"],["y","à´¯"],["r","à´°"],["l","à´²"],["v","à´µ"],["w","à´µ"],
  ["s","à´¸"],["h","à´¹"],["f","à´«"],["z","à´¸"],["L","à´³"],["N","à´£"],["R","à´°"],
];

const KANNADA_MAP: [string, string][] = [
  ["aa","à²†"],["ii","à²ˆ"],["uu","à²Š"],["ee","à²ˆ"],["ai","à²"],["oo","à²“"],["au","à²”"],
  ["a","à²…"],["i","à²‡"],["u","à²‰"],["e","à²Ž"],["o","à²’"],
  ["kh","à²–"],["gh","à²˜"],["ch","à²š"],["jh","à²"],["th","à²¥"],["dh","à²§"],
  ["ph","à²«"],["bh","à²­"],["sh","à²¶"],["ng","à²™"],["ny","à²ž"],["nj","à²ž"],
  ["rr","à²°à³à²°"],["nn","à²¨à³à²¨"],["ll","à²²à³à²²"],
  ["k","à²•"],["g","à²—"],["c","à²š"],["j","à²œ"],["t","à²Ÿ"],["d","à²¡"],["n","à²¨"],
  ["p","à²ª"],["b","à²¬"],["m","à²®"],["y","à²¯"],["r","à²°"],["l","à²²"],["v","à²µ"],["w","à²µ"],
  ["s","à²¸"],["h","à²¹"],["f","à²«"],["z","à²œ"],["L","à²³"],["N","à²£"],["R","à²°"],["T","à² "],["D","à²¢"],
];

const BENGALI_MAP: [string, string][] = [
  ["aa","à¦†"],["ii","à¦ˆ"],["uu","à¦Š"],["ee","à¦ˆ"],["oo","à¦“"],["ai","à¦"],["au","à¦”"],
  ["a","à¦…"],["i","à¦‡"],["u","à¦‰"],["e","à¦"],["o","à¦“"],
  ["kh","à¦–"],["gh","à¦˜"],["ch","à¦š"],["jh","à¦"],["th","à¦¥"],["dh","à¦§"],
  ["ph","à¦«"],["bh","à¦­"],["sh","à¦¶"],["ng","à¦™"],["ny","à¦ž"],["nj","à¦ž"],
  ["rr","à¦¡à¦¼"],["nn","à¦£"],["ll","à¦²à§à¦²"],
  ["k","à¦•"],["g","à¦—"],["c","à¦š"],["j","à¦œ"],["t","à¦¤"],["d","à¦¦"],["n","à¦¨"],
  ["p","à¦ª"],["b","à¦¬"],["m","à¦®"],["y","à¦¯"],["r","à¦°"],["l","à¦²"],["v","à¦­"],["w","à¦“"],
  ["s","à¦¸"],["h","à¦¹"],["f","à¦«"],["z","à¦œ"],["N","à¦£"],["T","à¦Ÿ"],["D","à¦¡"],["R","à¦¡à¦¼"],
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SECTION 3 â€” PUBLIC API
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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

// Transliterate a partial word being typed (no dictionary correction â€” raw engine)
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
