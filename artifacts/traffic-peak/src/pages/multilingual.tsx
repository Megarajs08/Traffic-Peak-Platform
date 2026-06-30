import { useState, useCallback, useRef, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOMeta } from "@/components/SEOMeta";
import {
  transliterate, transliteratePartial, getSuggestions, learnSelection,
  LANGUAGES, type LangCode, type Language,
} from "@/lib/transliterate";
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Copy, Download, Trash2, Type, ChevronDown, Check, Globe,
  ZoomIn, ZoomOut, RotateCcw,
} from "lucide-react";

// â”€â”€â”€ Font size options â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

// â”€â”€â”€ Toolbar button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ToolBtn({
  onClick, active, title, children, disabled,
}: {
  onClick?: () => void; active?: boolean; title: string;
  children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        flex items-center justify-center w-8 h-8 rounded text-sm transition-all duration-100 select-none
        ${active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"}
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {children}
    </button>
  );
}

// â”€â”€â”€ Language dropdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function LangDropdown({
  current, onChange,
}: { current: Language; onChange: (l: Language) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 h-9 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors duration-100 select-none min-w-[160px]"
      >
        <Globe className="w-4 h-4 text-primary shrink-0" />
        <span className="flex-1 text-left">{current.nativeName}</span>
        <span className="text-xs text-muted-foreground">({current.name})</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-56 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { onChange(lang); setOpen(false); }}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left
                ${lang.code === current.code ? "bg-primary/10 text-primary" : "text-foreground"}
              `}
            >
              <span className="text-base leading-none">{lang.nativeName}</span>
              <span className="text-xs text-muted-foreground ml-auto">{lang.name}</span>
              {lang.code === current.code && <Check className="w-3.5 h-3.5 ml-1 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Font size picker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FontSizePicker({ size, onChange }: { size: number; onChange: (s: number) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex items-center">
      <button
        onClick={() => onChange(Math.max(12, size - 2))}
        className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        title="Decrease font size"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-2 h-7 text-sm font-mono text-foreground hover:bg-muted rounded transition-colors min-w-[36px] text-center"
        title="Font size"
      >
        {size}
      </button>
      <button
        onClick={() => onChange(Math.min(48, size + 2))}
        className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        title="Increase font size"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 rounded-xl border border-border bg-card shadow-xl overflow-hidden w-20">
          {FONT_SIZES.map((s) => (
            <button
              key={s}
              onClick={() => { onChange(s); setOpen(false); }}
              className={`w-full px-3 py-1.5 text-sm text-left hover:bg-muted transition-colors
                ${s === size ? "bg-primary/10 text-primary font-semibold" : "text-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function MultilingualTyping() {
  const [lang, setLang] = useState<Language>(LANGUAGES[0]); // Tamil default
  const [rawText, setRawText] = useState("");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [align, setAlign] = useState<"left" | "center" | "right">("left");
  const [fontSize, setFontSize] = useState(20);
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ roman: string; tamil: string }>>([]);
  const [currentWord, setCurrentWord] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const commitTamilWordAtBoundary = useCallback((text: string, cursorAtEnd: boolean) => {
    if (lang.code !== "ta" || !cursorAtEnd) return text;

    // Convert only when a roman word is completed with a boundary key (space/newline/punctuation).
    const match = text.match(/([a-zA-Z]+)([\s.,!?;:()\[\]{}"'`-]+)$/);
    if (!match) return text;

    const [, romanWord, trailing] = match;
    const tamilWord = transliterate(romanWord, "ta");
    if (!tamilWord || tamilWord === romanWord) return text;

    return text.slice(0, text.length - romanWord.length - trailing.length) + tamilWord + trailing;
  }, [lang.code]);

  // Transliterate on every keystroke
  const transliterated = transliterate(rawText, lang.code);

  // Update suggestions for the word currently being typed
  const updateSuggestions = useCallback((text: string) => {
    if (lang.code !== "ta") { setSuggestions([]); return; }
    // Get the last incomplete word (no trailing space)
    const match = text.match(/([a-zA-Z]+)$/);
    const word = match ? match[1] : "";
    setCurrentWord(word);
    if (word.length >= 2) {
      setSuggestions(getSuggestions(word));
    } else {
      setSuggestions([]);
    }
  }, [lang.code]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const isCursorAtEnd = (e.target.selectionStart ?? e.target.value.length) === e.target.value.length;
    const val = commitTamilWordAtBoundary(e.target.value, isCursorAtEnd);
    setRawText(val);
    updateSuggestions(val);
  }, [commitTamilWordAtBoundary, updateSuggestions]);

  const applySuggestion = useCallback((roman: string, tamil: string) => {
    // Replace the current word at end of rawText with the selected suggestion
    const replacement = lang.code === "ta" ? tamil + " " : roman + " ";
    const newRaw = rawText.replace(/([a-zA-Z]+)$/, replacement);
    setRawText(newRaw);
    setSuggestions([]);
    setCurrentWord("");
    learnSelection(roman, tamil);
    textareaRef.current?.focus();
    // Place cursor at end
    setTimeout(() => {
      const ta = textareaRef.current;
      if (ta) { ta.selectionStart = ta.selectionEnd = ta.value.length; }
    }, 0);
  }, [lang.code, rawText]);

  const wordCount = transliterated.trim() === "" ? 0 : transliterated.trim().split(/\s+/).length;
  const charCount = transliterated.replace(/\s/g, "").length;

  const handleLangChange = useCallback((newLang: Language) => {
    setLang(newLang);
    textareaRef.current?.focus();
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(transliterated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [transliterated]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([transliterated], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lang.name.toLowerCase()}-text.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transliterated, lang.name]);

  const handleClear = useCallback(() => {
    setRawText("");
    textareaRef.current?.focus();
  }, []);

  // Textarea style
  const textStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontWeight: bold ? "700" : "400",
    fontStyle: italic ? "italic" : "normal",
    textDecoration: underline ? "underline" : "none",
    textAlign: align,
    lineHeight: "1.8",
    letterSpacing: "0.01em",
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEOMeta
        title="Multilingual Typing Tool â€” Type in Tamil, Hindi & More | Typing Peak"
        description="Type in Indian languages instantly. Phonetic transliteration for Tamil, Hindi, Telugu, Malayalam, Kannada, Bengali, and Marathi. No software needed."
        keywords="tamil typing, hindi typing, telugu typing, malayalam typing, kannada typing, bengali typing, marathi typing, transliteration, indian language typing"
      />
      <Navbar />

      <main className="flex-1 flex flex-col">

        {/* â”€â”€ Page header â”€â”€ */}
        <div className="border-b border-border/60 bg-card/50">
          <div className="container mx-auto px-4 py-4 max-w-6xl flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Multilingual Typing
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Type in English â€” get Indian language output instantly
              </p>
            </div>
            <LangDropdown current={lang} onChange={handleLangChange} />
          </div>
        </div>

        {/* â”€â”€ Word toolbar (Google Docs style) â”€â”€ */}
        <div className="sticky top-0 z-30 border-b border-border/60 bg-card/95 backdrop-blur-sm shadow-sm">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center gap-1 py-1.5 flex-wrap">

              {/* Font size */}
              <FontSizePicker size={fontSize} onChange={setFontSize} />

              <div className="w-px h-6 bg-border mx-1" />

              {/* Text formatting */}
              <ToolBtn onClick={() => setBold((b) => !b)} active={bold} title="Bold (Ctrl+B)">
                <Bold className="w-4 h-4" />
              </ToolBtn>
              <ToolBtn onClick={() => setItalic((i) => !i)} active={italic} title="Italic (Ctrl+I)">
                <Italic className="w-4 h-4" />
              </ToolBtn>
              <ToolBtn onClick={() => setUnderline((u) => !u)} active={underline} title="Underline (Ctrl+U)">
                <Underline className="w-4 h-4" />
              </ToolBtn>

              <div className="w-px h-6 bg-border mx-1" />

              {/* Alignment */}
              <ToolBtn onClick={() => setAlign("left")} active={align === "left"} title="Align left">
                <AlignLeft className="w-4 h-4" />
              </ToolBtn>
              <ToolBtn onClick={() => setAlign("center")} active={align === "center"} title="Align center">
                <AlignCenter className="w-4 h-4" />
              </ToolBtn>
              <ToolBtn onClick={() => setAlign("right")} active={align === "right"} title="Align right">
                <AlignRight className="w-4 h-4" />
              </ToolBtn>

              <div className="w-px h-6 bg-border mx-1" />

              {/* Actions */}
              <ToolBtn onClick={handleCopy} title={copied ? "Copied!" : "Copy output"}>
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </ToolBtn>
              <ToolBtn onClick={handleDownload} disabled={!transliterated} title="Download as .txt">
                <Download className="w-4 h-4" />
              </ToolBtn>
              <ToolBtn onClick={handleClear} disabled={!rawText} title="Clear all">
                <Trash2 className="w-4 h-4" />
              </ToolBtn>

              {/* Language quick-select pills â€” mobile friendly shortcuts */}
              <div className="ml-auto flex items-center gap-1 flex-wrap">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleLangChange(l)}
                    className={`
                      px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-100
                      ${l.code === lang.code
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}
                    `}
                  >
                    {l.nativeName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* â”€â”€ Editor area â€” two-panel like Google Docs â”€â”€ */}
        <div className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full" style={{ minHeight: "60vh" }}>

            {/* Left panel: Roman input */}
            <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-muted/30">
                <Type className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  English Input (Phonetic)
                </span>
              </div>
              {/* Suggestion bar â€” shown while typing a Tamil word */}
              {suggestions.length > 0 && (
                <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/50 bg-muted/20 flex-wrap">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider mr-1">Suggestions:</span>
                  {suggestions.map(({ roman, tamil }) => (
                    <button
                      key={roman}
                      onClick={() => applySuggestion(roman, tamil)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-card border border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm"
                    >
                      <span className="text-foreground font-medium">{tamil}</span>
                      <span className="text-muted-foreground/50 text-xs">({roman})</span>
                    </button>
                  ))}
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={rawText}
                onChange={handleTextChange}
                placeholder={`Type phonetically in English...\ne.g. "vanakkam" â†’ ${transliterate("vanakkam", lang.code)}`}
                autoFocus
                spellCheck={false}
                className={`flex-1 w-full bg-transparent px-5 py-4 text-foreground text-base resize-none outline-none placeholder:text-muted-foreground/40 leading-relaxed ${lang.fontClass}`}
                style={{ minHeight: "52vh" }}
              />
            </div>

            {/* Right panel: Transliterated output */}
            <div className="flex flex-col rounded-xl border border-primary/30 bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-primary/5">
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {lang.name} Output
                </span>
                <span className="ml-auto text-xs text-muted-foreground">{lang.nativeName}</span>
              </div>

              {/* Output display â€” styled by toolbar */}
              <div
                className="flex-1 px-5 py-4 overflow-y-auto cursor-text select-text"
                style={{ minHeight: "55vh" }}
              >
                {transliterated || currentWord ? (
                  <p
                    style={textStyle}
                    className={`whitespace-pre-wrap break-words text-foreground leading-[1.9] ${lang.fontClass}`}
                  >
                    {transliterated}
                    {/* Live partial preview of word being typed */}
                    {currentWord && lang.code === "ta" && (
                      <span className="text-primary/60 border-b border-primary/40">
                        {transliteratePartial(currentWord, lang.code)}
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-muted-foreground/35 text-base" style={{ fontSize: `${fontSize}px` }}>
                    {lang.placeholder}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* â”€â”€ How to use guide â”€â”€ */}
          <div className="mt-6 rounded-xl border border-border bg-card/60 p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Type className="w-4 h-4 text-primary" />
              How to type â€” Phonetic guide for {lang.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {getPhoneticExamples(lang.code).map(([roman, native, meaning]) => (
                <div key={roman} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
                  <code className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">{roman}</code>
                  <span className="text-sm text-foreground">â†’</span>
                  <span className="text-sm font-medium">{native}</span>
                  {meaning && <span className="text-xs text-muted-foreground ml-auto">{meaning}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* â”€â”€ Status bar (Word-style bottom bar) â”€â”€ */}
        <div className="sticky bottom-0 z-20 border-t border-border/60 bg-card/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center gap-6 py-1.5 text-xs text-muted-foreground select-none flex-wrap">
              <span>
                <span className="text-foreground font-medium">{wordCount}</span> words
              </span>
              <span>
                <span className="text-foreground font-medium">{charCount}</span> characters
              </span>
              <span>
                <span className="text-foreground font-medium">{rawText.split("\n").length}</span> lines
              </span>
              <span className="ml-auto flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-primary" />
                <span className="text-primary font-medium">{lang.name}</span>
                <span>Â·</span>
                <span>Phonetic transliteration</span>
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// â”€â”€â”€ Phonetic examples per language â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getPhoneticExamples(lang: LangCode): [string, string, string][] {
  const examples: Record<LangCode, [string, string, string][]> = {
    ta: [
      ["vanakkam", "à®µà®£à®•à¯à®•à®®à¯", "Hello"],
      ["nandri", "à®¨à®©à¯à®±à®¿", "Thank you"],
      ["amma", "à®…à®®à¯à®®à®¾", "Mother"],
      ["tamil", "à®¤à®®à®¿à®²à¯", "Tamil"],
      ["ka", "à®•", "à®•"],
      ["sa", "à®š", "à®š"],
      ["na", "à®©", "à®©"],
      ["aa", "à®†", "à®†"],
    ],
    hi: [
      ["namaste", "à¤¨à¤®à¤¸à¥à¤¤à¥‡", "Hello"],
      ["dhanyavaad", "à¤§à¤¨à¥à¤¯à¤µà¤¾à¤¦", "Thanks"],
      ["bharat", "à¤­à¤¾à¤°à¤¤", "India"],
      ["aa", "à¤†", "Ä"],
      ["ka", "à¤•", "à¤•"],
      ["bh", "à¤­", "à¤­"],
      ["sh", "à¤¶", "à¤¶"],
      ["kh", "à¤–", "à¤–"],
    ],
    te: [
      ["namaskaram", "à°¨à°®à°¸à±à°•à°¾à°°à°‚", "Hello"],
      ["dhanyavaadalu", "à°§à°¨à±à°¯à°µà°¾à°¦à°¾à°²à±", "Thanks"],
      ["telugu", "à°¤à±†à°²à±à°—à±", "Telugu"],
      ["aa", "à°†", "Ä"],
      ["ka", "à°•", "à°•"],
      ["ga", "à°—", "à°—"],
      ["ta", "à°Ÿ", "à°Ÿ"],
      ["bh", "à°­", "à°­"],
    ],
    ml: [
      ["namaskaram", "à´¨à´®à´¸àµà´•à´¾à´°à´‚", "Hello"],
      ["nanni", "à´¨à´¨àµà´¨à´¿", "Thank you"],
      ["kerala", "à´•àµ‡à´°à´²", "Kerala"],
      ["aa", "à´†", "Ä"],
      ["ka", "à´•", "à¤•"],
      ["zh", "à´´", "à´´"],
      ["ma", "à´®", "à´®"],
      ["la", "à´²", "à´²"],
    ],
    kn: [
      ["namaskara", "à²¨à²®à²¸à³à²•à²¾à²°", "Hello"],
      ["dhanyavadagalu", "à²§à²¨à³à²¯à²µà²¾à²¦à²—à²³à³", "Thanks"],
      ["kannada", "à²•à²¨à³à²¨à²¦", "Kannada"],
      ["aa", "à²†", "Ä"],
      ["ka", "à²•", "à²•"],
      ["ga", "à²—", "à²—"],
      ["sha", "à²¶", "à²¶"],
      ["La", "à²³", "à²³"],
    ],
    bn: [
      ["namaskar", "à¦¨à¦®à¦¸à§à¦•à¦¾à¦°", "Hello"],
      ["dhonyabad", "à¦§à¦¨à§à¦¯à¦¬à¦¾à¦¦", "Thanks"],
      ["bangla", "à¦¬à¦¾à¦‚à¦²", "Bengali"],
      ["aa", "à¦†", "Ä"],
      ["ka", "à¦•", "à¦•"],
      ["ga", "à¦—", "à¦—"],
      ["bh", "à¦­", "à¦­"],
      ["sh", "à¦¶", "à¦¶"],
    ],
    mr: [
      ["namaskar", "à¤¨à¤®à¤¸à¥à¤•à¤¾à¤°", "Hello"],
      ["dhanyavaad", "à¤§à¤¨à¥à¤¯à¤µà¤¾à¤¦", "Thanks"],
      ["marathi", "à¤®à¤°à¤¾à¤ à¥€", "Marathi"],
      ["aa", "à¤†", "Ä"],
      ["ka", "à¤•", "à¤•"],
      ["bh", "à¤­", "à¤­"],
      ["sh", "à¤¶", "à¤¶"],
      ["kh", "à¤–", "à¤–"],
    ],
  };
  return examples[lang] ?? [];
}
