import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useSubmitTest, useGenerateCertificate } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Award, RefreshCw } from "lucide-react";
import { top1000Words } from "@/lib/words";

// â"€â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

type Mode = "words" | "paragraph" | "quotes" | "numbers" | "symbols";
type Duration = 15 | 30 | 60 | 120 | 300;
type CharState = "pending" | "correct" | "incorrect" | "current";

interface CharData {
  char: string;
  state: CharState;
}

// â"€â"€â"€ Constants â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const MODES: { id: Mode; label: string }[] = [
  { id: "words",     label: "words"     },
  { id: "paragraph", label: "paragraph" },
  { id: "quotes",    label: "quotes"    },
  { id: "numbers",   label: "numbers"   },
  { id: "symbols",   label: "symbols"   },
];

const DURATIONS: Duration[] = [15, 30, 60, 120, 300];

const QUOTES = [
  "The only way to do great work is to love what you do.",
  "In the middle of every difficulty lies opportunity.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The future belongs to those who believe in the beauty of their dreams.",
];

const PARAGRAPHS = [
  "The quick brown fox jumps over the lazy dog near the riverbank where the water flows silently under the old wooden bridge. Birds sing softly in the morning mist as the sun rises slowly above the distant mountains casting long golden shadows across the valley floor below. Children play along the narrow path that winds through the forest as leaves rustle gently in the cool afternoon breeze. The smell of fresh rain fills the air while farmers tend to their fields and cattle graze peacefully on the hillside under a clear blue sky.",
  "Technology has transformed the way we communicate and collaborate across the globe. Remote teams now work seamlessly across time zones sharing documents and ideas in real time. The pace of innovation continues to accelerate pushing boundaries of what was once considered impossible. Artificial intelligence is reshaping industries from healthcare to finance enabling smarter decisions and faster outcomes. People around the world are learning new skills adapting to change and finding creative ways to solve problems that previous generations never imagined.",
  "Reading regularly improves vocabulary concentration and empathy by exposing the mind to diverse perspectives and ideas. Whether fiction or nonfiction every book offers a chance to explore new worlds and challenge existing beliefs. Libraries remain vital community spaces where knowledge is freely accessible to all regardless of background or income. The habit of reading even for just thirty minutes each day can significantly improve cognitive function and reduce stress over time.",
  "Exercise is one of the most powerful tools available for maintaining physical and mental health across all stages of life. Regular movement strengthens the heart builds muscle and improves flexibility while also boosting mood and reducing anxiety. Simple activities like walking cycling or swimming can make a substantial difference when practiced consistently. Rest and recovery are equally important allowing the body to repair and grow stronger between sessions of physical activity.",
];

// â"€â"€â"€ Text generation â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function generateText(mode: Mode): string {
  switch (mode) {
    case "words": {
      const shuffled = [...top1000Words].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 200).join(" ");
    }
    case "paragraph":
      return PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)];
    case "quotes":
      return QUOTES[Math.floor(Math.random() * QUOTES.length)];
    case "numbers": {
      const nums: string[] = [];
      for (let i = 0; i < 120; i++) nums.push(String(Math.floor(Math.random() * 9999)));
      return nums.join(" ");
    }
    case "symbols": {
      const syms = "!@#$%^&*()-_=+[]{}|;:,.<>?/".split("");
      const parts: string[] = [];
      for (let i = 0; i < 150; i++) {
        let s = "";
        for (let j = 0; j < Math.floor(Math.random() * 4) + 2; j++)
          s += syms[Math.floor(Math.random() * syms.length)];
        parts.push(s);
      }
      return parts.join(" ");
    }
  }
}

// â"€â"€â"€ Memoised character span â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const Char = memo(function Char({
  char,
  state,
  isCurrent,
  spanRef,
}: {
  char: string;
  state: CharState;
  isCurrent: boolean;
  spanRef?: React.Ref<HTMLSpanElement>;
}) {
  const colorClass =
    state === "correct"
      ? "mt-char-correct"
      : state === "incorrect"
      ? "mt-char-incorrect"
      : "mt-char-pending";

  return (
    <span ref={spanRef} className={`relative char-transition ${colorClass}`}>
      {isCurrent && (
        <span
          aria-hidden
          className="pointer-events-none absolute -left-[1px] top-[0.05em] w-[2px] h-[0.9em] rounded-[1px] mt-caret caret-blink"
        />
      )}
      {char === " " && state === "incorrect"
        ? <span className="mt-space-err">_</span>
        : char}
    </span>
  );
});

// â"€â"€â"€ Stat chip â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const StatChip = memo(function StatChip({
  label,
  value,
  highlight,
  testId,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  testId?: string;
}) {
  return (
    <div className="flex flex-col items-center min-w-[52px]" data-testid={testId}>
      <span
        className={`text-2xl font-semibold tabular-nums leading-none ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mt-1">
        {label}
      </span>
    </div>
  );
});

// â"€â"€â"€ Speed tier animals â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const SnailSvg = () => (
  <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <radialGradient id="snail-shell" cx="50%" cy="40%" r="55%">
        <stop offset="0%" stopColor="#fef9c3"/>
        <stop offset="100%" stopColor="#ca8a04"/>
      </radialGradient>
      <radialGradient id="snail-body-g" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#93c5fd"/>
        <stop offset="100%" stopColor="#1d4ed8"/>
      </radialGradient>
      <filter id="snail-shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#1e40af" floodOpacity="0.3"/>
      </filter>
    </defs>
    <style>{`
      @keyframes s-float{0%,100%{transform:translateY(0px) rotate(0deg)}30%{transform:translateY(-3px) rotate(.4deg)}70%{transform:translateY(-1px) rotate(-.3deg)}}
      @keyframes s-ant1 {0%,100%{transform:rotate(0deg)}40%{transform:rotate(10deg)}80%{transform:rotate(-5deg)}}
      @keyframes s-ant2 {0%,100%{transform:rotate(0deg)}40%{transform:rotate(-12deg)}80%{transform:rotate(6deg)}}
      @keyframes s-shell{0%,100%{transform:rotate(0deg)}50%{transform:rotate(1.5deg)}}
      @keyframes s-trail{0%{opacity:.5;transform:scaleX(1)}100%{opacity:0;transform:scaleX(.3)}}
      .sn-all  {animation:s-float 3.2s cubic-bezier(.45,.05,.55,.95) infinite;transform-origin:80px 85px}
      .sn-a1   {animation:s-ant1  3.2s cubic-bezier(.45,.05,.55,.95) infinite;transform-origin:52px 60px}
      .sn-a2   {animation:s-ant2  3.2s cubic-bezier(.45,.05,.55,.95) infinite 0.4s;transform-origin:44px 62px}
      .sn-sh   {animation:s-shell 3.2s ease-in-out infinite;transform-origin:95px 68px}
      .sn-tr   {animation:s-trail 1.8s ease-out infinite}
    `}</style>
    {/* slime trail */}
    <ellipse className="sn-tr" cx="32" cy="90" rx="22" ry="4" fill="#bfdbfe" opacity=".5"/>
    <g className="sn-all" filter="url(#snail-shadow)">
      {/* body */}
      <path d="M42 88 Q28 80 26 68 Q24 52 38 46 Q54 40 64 54 Q72 66 68 80 L110 80 Q116 80 116 86 Q116 92 110 92 L42 92 Z"
        fill="url(#snail-body-g)" stroke="#1d4ed8" strokeWidth="2"/>
      {/* shell */}
      <g className="sn-sh">
        <circle cx="95" cy="68" r="24" fill="url(#snail-shell)" stroke="#92400e" strokeWidth="2"/>
        <path d="M95 68 m0-14 a14 14 0 1 1-.01 0" fill="none" stroke="#92400e" strokeWidth="1.5" opacity=".5"/>
        <path d="M95 68 m0-7 a7 7 0 1 1-.01 0"   fill="none" stroke="#92400e" strokeWidth="1.2" opacity=".4"/>
        <circle cx="95" cy="68" r="3" fill="#92400e" opacity=".6"/>
        {/* shine */}
        <ellipse cx="87" cy="58" rx="5" ry="3" fill="white" opacity=".35" transform="rotate(-30 87 58)"/>
      </g>
      {/* eye stalks */}
      <g className="sn-a1">
        <path d="M48 60 Q44 46 46 38" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="46" cy="36" r="5" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="1.5"/>
        <circle cx="46" cy="36" r="2" fill="#1e293b"/>
        <circle cx="45" cy="35" r=".8" fill="white"/>
      </g>
      <g className="sn-a2">
        <path d="M56 58 Q56 44 54 36" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="54" cy="34" r="5" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="1.5"/>
        <circle cx="54" cy="34" r="2" fill="#1e293b"/>
        <circle cx="53" cy="33" r=".8" fill="white"/>
      </g>
      {/* mouth */}
      <path d="M44 72 Q48 76 52 72" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </g>
  </svg>
);

const TRexSvg = () => (
  <svg viewBox="0 0 130 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <radialGradient id="tx-skin" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#6abf5e"/>
        <stop offset="60%" stopColor="#3a8f2a"/>
        <stop offset="100%" stopColor="#1e5c14"/>
      </radialGradient>
      <radialGradient id="tx-belly" cx="50%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#fde68a"/>
        <stop offset="60%" stopColor="#f59e0b"/>
        <stop offset="100%" stopColor="#d97706"/>
      </radialGradient>
      <radialGradient id="tx-cape" cx="25%" cy="20%" r="75%">
        <stop offset="0%" stopColor="#fef08a"/>
        <stop offset="100%" stopColor="#eab308"/>
      </radialGradient>
      <filter id="tx-shadow"><feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity=".2"/></filter>
    </defs>
    <style>{`
      @keyframes tx-bob {
        0%,100%{transform:translateY(0)}
        50%    {transform:translateY(-6px)}
      }
      @keyframes tx-jaw2 {
        0%,40%,100%{transform:rotate(0deg)}
        20%         {transform:rotate(22deg)}
        60%         {transform:rotate(14deg)}
        80%         {transform:rotate(22deg)}
      }
      @keyframes tx-tail2 {
        0%,100%{transform:rotate(0deg)}
        50%    {transform:rotate(18deg)}
      }
      @keyframes tx-cape2 {
        0%,100%{transform:rotate(-5deg) scaleY(1)}
        50%    {transform:rotate(8deg) scaleY(1.06)}
      }
      @keyframes tx-arm2 {
        0%,100%{transform:rotate(0deg)}
        50%    {transform:rotate(-20deg)}
      }
      @keyframes tx-shine2 {
        0%,100%{opacity:1} 50%{opacity:.2}
      }
      .tx2-all  {animation:tx-bob   1s ease-in-out infinite;transform-origin:65px 90px}
      .tx2-jaw  {animation:tx-jaw2  1.2s ease-in-out infinite;transform-origin:54px 46px}
      .tx2-tail {animation:tx-tail2 1s ease-in-out infinite;transform-origin:90px 88px}
      .tx2-cape {animation:tx-cape2 1s ease-in-out infinite;transform-origin:72px 68px}
      .tx2-arm  {animation:tx-arm2  .6s ease-in-out infinite;transform-origin:56px 82px}
      .tx2-sh   {animation:tx-shine2 1.2s ease-in-out infinite}
    `}</style>

    <g className="tx2-all" filter="url(#tx-shadow)">

      {/* TAIL */}
      <g className="tx2-tail">
        <path d="M90 88 Q108 80 122 84 Q118 96 104 98 Q96 100 90 95Z"
          fill="url(#tx-skin)" stroke="#1e5c14" strokeWidth="2"/>
        <path d="M100 86 Q110 82 118 85" stroke="#1e5c14" strokeWidth="1.5" strokeLinecap="round" opacity=".45"/>
      </g>

      {/* BACK LEGS â€" thick, powerful */}
      <path d="M72 100 Q68 118 64 130" stroke="#3a8f2a" strokeWidth="16" strokeLinecap="round"/>
      <path d="M88 100 Q92 118 94 130" stroke="#3a8f2a" strokeWidth="14" strokeLinecap="round"/>
      {/* feet claws */}
      <path d="M58 128 Q52 132 48 130 M58 128 Q56 134 52 136 M58 128 Q64 134 62 136"
        stroke="#1e5c14" strokeWidth="4" strokeLinecap="round"/>
      <path d="M94 128 Q100 132 104 130 M94 128 Q96 134 100 136 M94 128 Q88 134 90 136"
        stroke="#1e5c14" strokeWidth="4" strokeLinecap="round"/>

      {/* BODY */}
      <path d="M38 72 Q40 50 56 44 Q74 38 92 50 Q104 58 102 78 Q100 96 84 102 Q66 108 50 100 Q36 92 36 80 Q36 76 38 72Z"
        fill="url(#tx-skin)" stroke="#1e5c14" strokeWidth="2.5"/>

      {/* BELLY â€" orange/yellow patch */}
      <path d="M52 96 Q66 104 82 98 Q92 92 90 76 Q88 62 74 58 Q60 56 52 66 Q46 74 48 86 Q50 92 52 96Z"
        fill="url(#tx-belly)" stroke="#d97706" strokeWidth="1.5"/>

      {/* body spots */}
      <circle cx="86" cy="58" r="4" fill="#1e5c14" opacity=".35"/>
      <circle cx="96" cy="70" r="3.5" fill="#1e5c14" opacity=".3"/>
      <circle cx="90" cy="82" r="3" fill="#1e5c14" opacity=".28"/>

      {/* back spines */}
      <path d="M56 44 Q59 32 62 44 M66 41 Q69 29 72 41 M76 40 Q79 28 82 40 M84 44 Q87 33 90 45"
        stroke="#1e5c14" strokeWidth="3" strokeLinecap="round" opacity=".85"/>

      {/* CAPE â€" flowing behind body */}
      <g className="tx2-cape">
        <path d="M72 56 Q84 62 88 76 Q84 94 78 106 Q70 100 66 86 Q62 72 66 60 Q68 54 72 56Z"
          fill="url(#tx-cape)" stroke="#ca8a04" strokeWidth="2"/>
        <path d="M74 64 Q80 76 78 94" stroke="#fef9c3" strokeWidth="2" strokeLinecap="round" opacity=".55"/>
        <path d="M84 66 Q88 78 86 98" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" opacity=".4"/>
      </g>

      {/* TINY ARM */}
      <g className="tx2-arm">
        <path d="M56 80 Q46 84 42 92" stroke="#3a8f2a" strokeWidth="9" strokeLinecap="round"/>
        <path d="M42 92 Q38 95 35 94 M42 92 Q40 97 37 99" stroke="#1e5c14" strokeWidth="3" strokeLinecap="round"/>
      </g>

      {/* NECK */}
      <path d="M38 72 Q34 62 36 50 Q38 40 48 38 Q56 36 58 46 Q60 56 56 68 Q48 74 42 74Z"
        fill="url(#tx-skin)" stroke="#1e5c14" strokeWidth="2"/>
      {/* neck belly */}
      <path d="M44 66 Q48 58 54 62 Q56 68 50 72 Q46 72 44 66Z" fill="url(#tx-belly)" opacity=".7"/>

      {/* HEAD â€" large rounded, side-facing */}
      <ellipse cx="50" cy="36" rx="28" ry="22" fill="url(#tx-skin)" stroke="#1e5c14" strokeWidth="2.5"/>

      {/* UPPER SNOUT â€" jutting forward left */}
      <path d="M28 38 Q18 42 12 50 Q14 52 22 52 Q34 52 46 50 L50 42Z"
        fill="url(#tx-skin)" stroke="#1e5c14" strokeWidth="2"/>

      {/* mouth open interior */}
      <path d="M22 44 Q14 50 10 58 Q22 56 36 57 Q44 57 48 52Z"
        fill="url(#tx-belly)"/>

      {/* LOWER JAW â€" animated chomping */}
      <g className="tx2-jaw">
        <path d="M22 48 Q14 56 10 64 Q24 62 38 63 Q46 63 50 56 L48 46Z"
          fill="url(#tx-skin)" stroke="#1e5c14" strokeWidth="2"/>
        <path d="M20 54 Q34 58 46 56 Q48 60 44 62 Q30 64 16 60Z" fill="url(#tx-belly)" opacity=".8"/>
        {/* lower teeth */}
        <path d="M18 52 L19 46 M25 54 L26 48 M32 55 L33 49 M39 55 L40 49"
          stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
      {/* upper teeth */}
      <path d="M18 47 L19 41 M25 47 L26 41 M32 47 L33 42 M39 48 L40 43"
        stroke="white" strokeWidth="2.5" strokeLinecap="round"/>

      {/* nostril */}
      <ellipse cx="13" cy="46" rx="2.5" ry="2" fill="#1e5c14" opacity=".8"/>

      {/* EYE â€" large cartoon side-profile */}
      <circle cx="54" cy="22" r="11" fill="white" stroke="#1e5c14" strokeWidth="2"/>
      <circle cx="54" cy="22" r="8" fill="#111"/>
      <circle cx="54" cy="22" r="5.5" fill="#2d7a1f"/>
      <circle cx="54" cy="22" r="3" fill="#050505"/>
      <circle cx="57" cy="19" r="2.5" fill="white" className="tx2-sh"/>
      <circle cx="51" cy="25" r="1.2" fill="white" opacity=".6"/>

      {/* expressive brow */}
      <path d="M44 12 Q54 8 66 12" stroke="#1e5c14" strokeWidth="3.5" strokeLinecap="round"/>
    </g>
  </svg>
);

const RabbitSvg = () => (
  <svg viewBox="0 0 160 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <radialGradient id="rb-fur" cx="40%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#f5f3ff"/>
        <stop offset="100%" stopColor="#c4b5fd"/>
      </radialGradient>
      <radialGradient id="rb-belly" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stopColor="#fff" stopOpacity=".9"/>
        <stop offset="100%" stopColor="#ede9fe"/>
      </radialGradient>
      <filter id="rb-shadow"><feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#7c3aed" floodOpacity=".2"/></filter>
    </defs>
    <style>{`
      @keyframes rb-hop{
        0%   {transform:translateY(0)   scaleY(1)   scaleX(1)}
        18%  {transform:translateY(-2px) scaleY(.92) scaleX(1.08)}
        38%  {transform:translateY(-20px) scaleY(1.06) scaleX(.96)}
        55%  {transform:translateY(-22px) scaleY(1.04) scaleX(.97)}
        72%  {transform:translateY(-6px) scaleY(.94) scaleX(1.06)}
        85%  {transform:translateY(0)   scaleY(1.04) scaleX(.97)}
        100% {transform:translateY(0)   scaleY(1)   scaleX(1)}
      }
      @keyframes rb-shadow{0%,85%,100%{transform:scaleX(1);opacity:.35}38%,55%{transform:scaleX(.55);opacity:.12}}
      @keyframes rb-earL{0%,100%{transform:rotate(0deg)}35%,60%{transform:rotate(-18deg)}}
      @keyframes rb-earR{0%,100%{transform:rotate(0deg)}35%,60%{transform:rotate(12deg)}}
      @keyframes rb-legF{0%,100%{transform:rotate(0deg)}35%{transform:rotate(55deg)}65%{transform:rotate(-10deg)}}
      @keyframes rb-legB{0%,100%{transform:rotate(0deg)}35%{transform:rotate(-65deg)}65%{transform:rotate(20deg)}}
      @keyframes rb-tail{0%,100%{transform:rotate(0deg)}50%{transform:rotate(15deg)}}
      .rb-all  {animation:rb-hop  .7s cubic-bezier(.22,1,.36,1) infinite;transform-origin:80px 95px}
      .rb-shad {animation:rb-shadow .7s cubic-bezier(.22,1,.36,1) infinite;transform-origin:80px 108px}
      .rb-eL   {animation:rb-earL  .7s cubic-bezier(.22,1,.36,1) infinite;transform-origin:65px 38px}
      .rb-eR   {animation:rb-earR  .7s cubic-bezier(.22,1,.36,1) infinite;transform-origin:88px 38px}
      .rb-lF   {animation:rb-legF  .7s cubic-bezier(.22,1,.36,1) infinite;transform-origin:62px 92px}
      .rb-lB   {animation:rb-legB  .7s cubic-bezier(.22,1,.36,1) infinite;transform-origin:96px 92px}
      .rb-tail {animation:rb-tail  .7s ease-in-out infinite;transform-origin:100px 80px}
    `}</style>
    {/* ground shadow */}
    <ellipse className="rb-shad" cx="80" cy="108" rx="28" ry="5" fill="#7c3aed"/>
    <g className="rb-all" filter="url(#rb-shadow)">
      {/* back leg */}
      <g className="rb-lB">
        <path d="M96 92 Q108 88 114 96 Q110 104 100 102 Q94 100 96 92Z" fill="url(#rb-fur)" stroke="#7c3aed" strokeWidth="1.8"/>
      </g>
      {/* body */}
      <ellipse cx="80" cy="82" rx="28" ry="24" fill="url(#rb-fur)" stroke="#7c3aed" strokeWidth="2"/>
      {/* belly */}
      <ellipse cx="78" cy="86" rx="16" ry="14" fill="url(#rb-belly)" opacity=".7"/>
      {/* front leg */}
      <g className="rb-lF">
        <path d="M62 92 Q50 88 46 96 Q50 104 60 102 Q66 100 62 92Z" fill="url(#rb-fur)" stroke="#7c3aed" strokeWidth="1.8"/>
      </g>
      {/* tail */}
      <g className="rb-tail">
        <circle cx="106" cy="78" r="9" fill="white" stroke="#c4b5fd" strokeWidth="1.5"/>
        <circle cx="104" cy="76" r="4" fill="white" opacity=".6"/>
      </g>
      {/* head */}
      <circle cx="68" cy="56" r="20" fill="url(#rb-fur)" stroke="#7c3aed" strokeWidth="2"/>
      {/* ears */}
      <g className="rb-eL">
        <path d="M60 40 Q54 16 58 8 Q64 4 68 12 Q72 22 66 40Z" fill="url(#rb-fur)" stroke="#7c3aed" strokeWidth="2"/>
        <path d="M61 38 Q57 20 60 12 Q63 8 65 14 Q67 22 64 38Z" fill="#f9a8d4" opacity=".8"/>
      </g>
      <g className="rb-eR">
        <path d="M76 40 Q80 16 80 8 Q86 4 88 14 Q90 24 82 40Z" fill="url(#rb-fur)" stroke="#7c3aed" strokeWidth="2"/>
        <path d="M77 38 Q80 20 81 12 Q84 8 85 14 Q86 24 80 38Z" fill="#f9a8d4" opacity=".8"/>
      </g>
      {/* face */}
      <circle cx="62" cy="54" r="4" fill="#1e293b"/>
      <circle cx="74" cy="54" r="4" fill="#1e293b"/>
      <circle cx="63" cy="53" r="1.5" fill="white"/>
      <circle cx="75" cy="53" r="1.5" fill="white"/>
      <ellipse cx="68" cy="61" rx="4" ry="2.5" fill="#f9a8d4"/>
      <path d="M64 63 Q68 67 72 63" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* whiskers */}
      <path d="M56 60 L46 58 M56 62 L46 64" stroke="#7c3aed" strokeWidth="1" opacity=".5" strokeLinecap="round"/>
      <path d="M80 60 L90 58 M80 62 L90 64" stroke="#7c3aed" strokeWidth="1" opacity=".5" strokeLinecap="round"/>
    </g>
  </svg>
);

const FoxSvg = () => (
  <svg viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <radialGradient id="fx-body" cx="40%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#fdba74"/>
        <stop offset="100%" stopColor="#c2410c"/>
      </radialGradient>
      <radialGradient id="fx-belly" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stopColor="#fef9c3"/>
        <stop offset="100%" stopColor="#fde68a"/>
      </radialGradient>
      <filter id="fx-glow"><feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#c2410c" floodOpacity=".22"/></filter>
    </defs>
    <style>{`
      @keyframes fx-run{
        0%,100%{transform:translateY(0) rotate(0deg)}
        20%    {transform:translateY(-7px) rotate(-2.5deg)}
        50%    {transform:translateY(-9px) rotate(1.5deg)}
        75%    {transform:translateY(-5px) rotate(-1deg)}
      }
      @keyframes fx-lA{0%,100%{transform:rotate(-40deg)}50%{transform:rotate(45deg)}}
      @keyframes fx-lB{0%,100%{transform:rotate(40deg)} 50%{transform:rotate(-45deg)}}
      @keyframes fx-lC{0%,100%{transform:rotate(-25deg)}50%{transform:rotate(30deg)}}
      @keyframes fx-lD{0%,100%{transform:rotate(25deg)} 50%{transform:rotate(-30deg)}}
      @keyframes fx-tail{0%,100%{transform:rotate(0deg)}30%{transform:rotate(28deg)}70%{transform:rotate(-10deg)}}
      @keyframes fx-ear{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-8deg)}}
      .fx-all {animation:fx-run  .44s cubic-bezier(.4,0,.2,1) infinite;transform-origin:95px 78px}
      .fx-lA  {animation:fx-lA   .44s cubic-bezier(.4,0,.2,1) infinite;transform-origin:78px 90px}
      .fx-lB  {animation:fx-lB   .44s cubic-bezier(.4,0,.2,1) infinite;transform-origin:96px 90px}
      .fx-lC  {animation:fx-lC   .44s cubic-bezier(.4,0,.2,1) infinite 0.22s;transform-origin:112px 90px}
      .fx-lD  {animation:fx-lD   .44s cubic-bezier(.4,0,.2,1) infinite 0.22s;transform-origin:128px 90px}
      .fx-tail{animation:fx-tail .44s cubic-bezier(.4,0,.2,1) infinite;transform-origin:158px 72px}
      .fx-ear {animation:fx-ear  .44s ease-in-out infinite;transform-origin:72px 46px}
    `}</style>
    {/* speed lines */}
    <path d="M8 70 L32 70" stroke="#fed7aa" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
    <path d="M4 78 L22 78" stroke="#fed7aa" strokeWidth="1.5" strokeLinecap="round" opacity=".35"/>
    <path d="M10 86 L28 86" stroke="#fed7aa" strokeWidth="1.5" strokeLinecap="round" opacity=".3"/>
    <g className="fx-all" filter="url(#fx-glow)">
      {/* tail */}
      <g className="fx-tail">
        <path d="M158 72 Q172 58 178 52 Q176 64 168 76 Q162 84 158 80Z" fill="white" stroke="#c2410c" strokeWidth="1.5"/>
        <path d="M158 72 Q148 70 145 78 Q148 82 158 80Z" fill="url(#fx-body)" stroke="#c2410c" strokeWidth="1.5"/>
      </g>
      {/* legs back */}
      <g className="fx-lC"><path d="M112 90 Q110 104 106 110" stroke="#c2410c" strokeWidth="7" strokeLinecap="round"/></g>
      <g className="fx-lD"><path d="M128 90 Q130 104 134 110" stroke="#c2410c" strokeWidth="7" strokeLinecap="round"/></g>
      {/* body */}
      <path d="M62 78 Q68 58 88 56 Q120 52 145 64 Q158 70 158 78 Q158 90 140 92 Q110 96 80 92 Q62 90 62 78Z"
        fill="url(#fx-body)" stroke="#c2410c" strokeWidth="2"/>
      <ellipse cx="112" cy="80" rx="28" ry="12" fill="url(#fx-belly)" opacity=".6"/>
      {/* legs front */}
      <g className="fx-lA"><path d="M78 90 Q74 104 70 110" stroke="#c2410c" strokeWidth="7" strokeLinecap="round"/></g>
      <g className="fx-lB"><path d="M96 90 Q96 104 98 110" stroke="#c2410c" strokeWidth="7" strokeLinecap="round"/></g>
      {/* neck + head */}
      <path d="M62 78 Q56 68 54 58 Q52 48 62 44 Q76 40 84 52 Q88 60 84 68Z" fill="url(#fx-body)" stroke="#c2410c" strokeWidth="2"/>
      {/* muzzle */}
      <ellipse cx="54" cy="62" rx="14" ry="10" fill="url(#fx-belly)" stroke="#c2410c" strokeWidth="1.5"/>
      {/* ear */}
      <g className="fx-ear">
        <polygon points="62,44 54,26 74,36" fill="url(#fx-body)" stroke="#c2410c" strokeWidth="2"/>
        <polygon points="63,42 58,28 72,36" fill="#fca5a5" opacity=".7"/>
      </g>
      <polygon points="78,46 74,28 86,38" fill="url(#fx-body)" stroke="#c2410c" strokeWidth="2"/>
      <polygon points="79,44 76,30 84,38" fill="#fca5a5" opacity=".7"/>
      {/* eye */}
      <circle cx="64" cy="54" r="4.5" fill="#1e293b"/>
      <circle cx="65" cy="53" r="1.8" fill="white"/>
      {/* nose */}
      <ellipse cx="50" cy="60" rx="3" ry="2" fill="#1e293b"/>
    </g>
  </svg>
);

const CheetahSvg = () => (
  <svg viewBox="0 0 200 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <radialGradient id="ch-body" cx="40%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#fde68a"/>
        <stop offset="100%" stopColor="#b45309"/>
      </radialGradient>
      <filter id="ch-blur"><feGaussianBlur stdDeviation="2.5" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
      <filter id="ch-glow"><feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#b45309" floodOpacity=".3"/></filter>
    </defs>
    <style>{`
      @keyframes ch-gallop{
        0%   {transform:translateY(0) scaleX(1) rotate(0deg)}
        15%  {transform:translateY(-12px) scaleX(1.12) rotate(-3deg)}
        35%  {transform:translateY(-14px) scaleX(1.14) rotate(-2deg)}
        55%  {transform:translateY(-8px)  scaleX(1.06) rotate(1deg)}
        80%  {transform:translateY(-2px)  scaleX(.98)  rotate(.5deg)}
        100% {transform:translateY(0) scaleX(1) rotate(0deg)}
      }
      @keyframes ch-lA{0%,100%{transform:rotate(-55deg)}40%{transform:rotate(60deg)}}
      @keyframes ch-lB{0%,100%{transform:rotate(55deg)} 40%{transform:rotate(-60deg)}}
      @keyframes ch-lC{0%,100%{transform:rotate(-40deg)}40%{transform:rotate(50deg)}}
      @keyframes ch-lD{0%,100%{transform:rotate(40deg)} 40%{transform:rotate(-50deg)}}
      @keyframes ch-tail{0%,100%{transform:rotate(10deg)}50%{transform:rotate(-30deg)}}
      @keyframes ch-spots{0%,100%{opacity:.55}50%{opacity:.35}}
      .ch-all  {animation:ch-gallop .28s cubic-bezier(.2,0,.8,1) infinite;transform-origin:100px 72px}
      .ch-lA   {animation:ch-lA .28s cubic-bezier(.2,0,.8,1) infinite;transform-origin:78px 88px}
      .ch-lB   {animation:ch-lB .28s cubic-bezier(.2,0,.8,1) infinite;transform-origin:98px 88px}
      .ch-lC   {animation:ch-lC .28s cubic-bezier(.2,0,.8,1) infinite 0.14s;transform-origin:116px 88px}
      .ch-lD   {animation:ch-lD .28s cubic-bezier(.2,0,.8,1) infinite 0.14s;transform-origin:136px 88px}
      .ch-tail {animation:ch-tail .28s cubic-bezier(.2,0,.8,1) infinite;transform-origin:160px 66px}
      .ch-sp   {animation:ch-spots .28s ease-in-out infinite}
    `}</style>
    {/* cinematic speed lines */}
    <path d="M4 58 L38 58" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" opacity=".6"/>
    <path d="M2 66 L28 66" stroke="#fde68a" strokeWidth="2"   strokeLinecap="round" opacity=".45"/>
    <path d="M6 74 L34 74" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" opacity=".35"/>
    <path d="M0 80 L22 80" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" opacity=".25"/>
    {/* motion blur ghost */}
    <ellipse cx="100" cy="70" rx="52" ry="16" fill="#fde68a" opacity=".06" filter="url(#ch-blur)"/>
    <g className="ch-all" filter="url(#ch-glow)">
      {/* tail */}
      <g className="ch-tail">
        <path d="M160 66 Q176 50 186 44 Q184 56 178 68 Q172 78 164 76 Z" fill="url(#ch-body)" stroke="#92400e" strokeWidth="1.5"/>
        <path d="M170 62 Q180 52 184 48" stroke="#f5f5f4" strokeWidth="4" strokeLinecap="round" opacity=".5"/>
      </g>
      {/* back legs */}
      <g className="ch-lC" filter="url(#ch-blur)"><path d="M116 88 Q112 100 108 108" stroke="#92400e" strokeWidth="9" strokeLinecap="round"/></g>
      <g className="ch-lD" filter="url(#ch-blur)"><path d="M136 88 Q138 100 142 108" stroke="#92400e" strokeWidth="9" strokeLinecap="round"/></g>
      {/* body â€" stretched ellipse for gallop */}
      <path d="M58 74 Q64 52 90 50 Q130 46 158 60 Q168 66 168 74 Q168 86 150 88 Q118 94 82 90 Q58 86 58 74Z"
        fill="url(#ch-body)" stroke="#92400e" strokeWidth="2"/>
      {/* belly cream */}
      <ellipse cx="118" cy="78" rx="36" ry="10" fill="#fef3c7" opacity=".55"/>
      {/* spots */}
      <g className="ch-sp">
        <circle cx="100" cy="64" r="4" fill="#92400e"/>
        <circle cx="114" cy="60" r="3.5" fill="#92400e"/>
        <circle cx="128" cy="64" r="4" fill="#92400e"/>
        <circle cx="140" cy="70" r="3.5" fill="#92400e"/>
        <circle cx="108" cy="74" r="3" fill="#92400e"/>
        <circle cx="122" cy="72" r="3" fill="#92400e"/>
      </g>
      {/* front legs */}
      <g className="ch-lA" filter="url(#ch-blur)"><path d="M78 88 Q72 100 68 108" stroke="#92400e" strokeWidth="9" strokeLinecap="round"/></g>
      <g className="ch-lB" filter="url(#ch-blur)"><path d="M98 88 Q98 100 100 108" stroke="#92400e" strokeWidth="9" strokeLinecap="round"/></g>
      {/* neck */}
      <path d="M58 74 Q50 62 50 52 Q50 42 62 40 Q76 38 82 50 Q86 60 84 70Z" fill="url(#ch-body)" stroke="#92400e" strokeWidth="2"/>
      {/* head */}
      <circle cx="54" cy="48" r="18" fill="url(#ch-body)" stroke="#92400e" strokeWidth="2"/>
      {/* muzzle */}
      <ellipse cx="44" cy="54" rx="12" ry="9" fill="#fef3c7" stroke="#92400e" strokeWidth="1.5"/>
      {/* tear marks */}
      <path d="M50 52 Q46 58 44 64" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" opacity=".7"/>
      <path d="M56 50 Q54 56 52 62" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round" opacity=".5"/>
      {/* eye */}
      <circle cx="58" cy="44" r="5" fill="#1e293b"/>
      <circle cx="59" cy="43" r="2" fill="white"/>
      {/* ear */}
      <path d="M58 34 Q54 22 62 20 Q70 22 68 34Z" fill="url(#ch-body)" stroke="#92400e" strokeWidth="1.8"/>
      <path d="M72 36 Q70 24 78 22 Q84 24 82 36Z" fill="url(#ch-body)" stroke="#92400e" strokeWidth="1.8"/>
      {/* nose */}
      <ellipse cx="40" cy="52" rx="3.5" ry="2.5" fill="#1e293b"/>
    </g>
  </svg>
);

const EagleSvg = () => (
  <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <radialGradient id="eg-body" cx="45%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#6b7280"/>
        <stop offset="100%" stopColor="#111827"/>
      </radialGradient>
      <radialGradient id="eg-wing" cx="50%" cy="20%" r="70%">
        <stop offset="0%" stopColor="#4b5563"/>
        <stop offset="100%" stopColor="#030712"/>
      </radialGradient>
      <radialGradient id="eg-white" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#f9fafb"/>
        <stop offset="100%" stopColor="#d1d5db"/>
      </radialGradient>
      <filter id="eg-glow"><feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6b7280" floodOpacity=".4"/></filter>
      <filter id="eg-tip"><feGaussianBlur stdDeviation="1.5"/></filter>
    </defs>
    <style>{`
      @keyframes eg-soar {
        0%   {transform:translateY(0) rotate(0deg)}
        25%  {transform:translateY(-10px) rotate(-2deg)}
        50%  {transform:translateY(-14px) rotate(-1deg)}
        75%  {transform:translateY(-8px) rotate(1deg)}
        100% {transform:translateY(0) rotate(0deg)}
      }
      @keyframes eg-wL {
        0%   {transform:rotate(0deg) scaleY(1)}
        25%  {transform:rotate(-28deg) scaleY(.9)}
        50%  {transform:rotate(-38deg) scaleY(.82)}
        75%  {transform:rotate(-18deg) scaleY(.95)}
        100% {transform:rotate(0deg) scaleY(1)}
      }
      @keyframes eg-wR {
        0%   {transform:rotate(0deg) scaleY(1)}
        25%  {transform:rotate(28deg) scaleY(.9)}
        50%  {transform:rotate(38deg) scaleY(.82)}
        75%  {transform:rotate(18deg) scaleY(.95)}
        100% {transform:rotate(0deg) scaleY(1)}
      }
      @keyframes eg-tail {
        0%,100%{transform:rotate(0deg)} 50%{transform:rotate(8deg)}
      }
      @keyframes eg-featherL {
        0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-12deg)} 75%{transform:rotate(4deg)}
      }
      @keyframes eg-featherR {
        0%,100%{transform:rotate(0deg)} 25%{transform:rotate(12deg)} 75%{transform:rotate(-4deg)}
      }
      .eg-all     {animation:eg-soar .9s cubic-bezier(.4,0,.2,1) infinite;transform-origin:100px 58px}
      .eg-wL      {animation:eg-wL   .9s cubic-bezier(.4,0,.2,1) infinite;transform-origin:100px 60px}
      .eg-wR      {animation:eg-wR   .9s cubic-bezier(.4,0,.2,1) infinite;transform-origin:100px 60px}
      .eg-tail    {animation:eg-tail .9s ease-in-out infinite;transform-origin:112px 68px}
      .eg-featherL{animation:eg-featherL .9s ease-in-out infinite;transform-origin:40px 70px}
      .eg-featherR{animation:eg-featherR .9s ease-in-out infinite;transform-origin:162px 70px}
    `}</style>
    <g className="eg-all" filter="url(#eg-glow)">
      {/* Left wing */}
      <g className="eg-wL">
        <path d="M100 60 Q68 30 24 46 Q40 52 56 58 Q72 60 100 68Z" fill="url(#eg-wing)" stroke="#030712" strokeWidth="1.2"/>
        {/* primary feathers */}
        <g className="eg-featherL">
          <path d="M40 50 Q28 56 20 62" stroke="#030712" strokeWidth="5" strokeLinecap="round"/>
          <path d="M50 54 Q36 62 28 70" stroke="#030712" strokeWidth="4" strokeLinecap="round"/>
          <path d="M60 58 Q48 66 40 74" stroke="#030712" strokeWidth="3.5" strokeLinecap="round"/>
        </g>
        {/* white leading edge highlight */}
        <path d="M100 60 Q70 38 36 50" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
      </g>
      {/* Right wing */}
      <g className="eg-wR">
        <path d="M100 60 Q132 30 176 46 Q160 52 144 58 Q128 60 100 68Z" fill="url(#eg-wing)" stroke="#030712" strokeWidth="1.2"/>
        <g className="eg-featherR">
          <path d="M160 50 Q172 56 180 62" stroke="#030712" strokeWidth="5" strokeLinecap="round"/>
          <path d="M150 54 Q164 62 172 70" stroke="#030712" strokeWidth="4" strokeLinecap="round"/>
          <path d="M140 58 Q152 66 160 74" stroke="#030712" strokeWidth="3.5" strokeLinecap="round"/>
        </g>
        <path d="M100 60 Q130 38 164 50" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
      </g>
      {/* tail */}
      <g className="eg-tail">
        <path d="M100 68 Q108 78 116 82 Q114 72 110 66Z" fill="url(#eg-wing)" stroke="#030712" strokeWidth="1"/>
        <path d="M100 68 Q100 82 100 88 Q98 76 96 70Z" fill="url(#eg-wing)" stroke="#030712" strokeWidth="1"/>
        <path d="M100 68 Q92 78 84 82 Q86 72 90 66Z" fill="url(#eg-wing)" stroke="#030712" strokeWidth="1"/>
      </g>
      {/* body */}
      <ellipse cx="100" cy="60" rx="22" ry="14" fill="url(#eg-body)" stroke="#111827" strokeWidth="2"/>
      {/* white head */}
      <circle cx="88" cy="48" r="14" fill="url(#eg-white)" stroke="#d1d5db" strokeWidth="1.5"/>
      {/* dark "mask" over white head - eagle pattern */}
      <path d="M92 44 Q96 40 100 44 Q98 52 92 54Z" fill="url(#eg-body)" opacity=".6"/>
      {/* eye */}
      <circle cx="86" cy="46" r="5" fill="#1e293b"/>
      <circle cx="86" cy="45" r="2" fill="#fbbf24"/>
      <circle cx="86.5" cy="44.5" r="1" fill="white"/>
      {/* beak */}
      <path d="M80 50 Q74 54 76 58 Q80 56 84 52Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2"/>
      {/* talons */}
      <path d="M104 72 Q104 82 100 88" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"/>
      <path d="M100 88 Q96 92 92 90" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M100 88 Q100 94 98 96" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
      <path d="M100 88 Q104 94 106 96" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
    </g>
  </svg>
);

const LightningSvg = () => (
  <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <radialGradient id="ln-core" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fefce8"/>
        <stop offset="40%" stopColor="#fde047"/>
        <stop offset="100%" stopColor="#ca8a04"/>
      </radialGradient>
      <radialGradient id="ln-orb" cx="50%" cy="40%" r="55%">
        <stop offset="0%" stopColor="#fefce8"/>
        <stop offset="60%" stopColor="#fbbf24"/>
        <stop offset="100%" stopColor="#92400e" stopOpacity="0"/>
      </radialGradient>
      <filter id="ln-glow1"><feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#fde047" floodOpacity=".9"/></filter>
      <filter id="ln-glow2"><feDropShadow dx="0" dy="0" stdDeviation="16" floodColor="#fbbf24" floodOpacity=".6"/><feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#fff" floodOpacity=".8"/></filter>
      <filter id="ln-blur"><feGaussianBlur stdDeviation="3"/></filter>
      <filter id="ln-arc-glow"><feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#fde047" floodOpacity=".8"/></filter>
    </defs>
    <style>{`
      @keyframes ln-pulse {
        0%,100%{transform:scale(1);opacity:1}
        30%    {transform:scale(1.08);opacity:.9}
        60%    {transform:scale(.95);opacity:1}
      }
      @keyframes ln-orb-pulse {
        0%,100%{transform:scale(1);opacity:.7}
        50%    {transform:scale(1.3);opacity:.3}
      }
      @keyframes ln-arc1 {
        0%   {d:path("M80 50 Q85 38 100 44 Q110 28 120 40");opacity:1}
        25%  {d:path("M80 50 Q90 32 100 44 Q108 30 120 40");opacity:.7}
        50%  {d:path("M80 50 Q88 40 100 44 Q112 26 120 40");opacity:1}
        75%  {d:path("M80 50 Q84 36 100 44 Q106 32 120 40");opacity:.6}
        100% {d:path("M80 50 Q85 38 100 44 Q110 28 120 40");opacity:1}
      }
      @keyframes ln-arc2 {
        0%   {d:path("M76 60 Q70 44 86 38 Q78 24 96 28");opacity:.8}
        33%  {d:path("M76 60 Q72 46 86 38 Q80 22 96 28");opacity:.4}
        66%  {d:path("M76 60 Q68 42 86 38 Q76 26 96 28");opacity:.9}
        100% {d:path("M76 60 Q70 44 86 38 Q78 24 96 28");opacity:.8}
      }
      @keyframes ln-arc3 {
        0%   {d:path("M104 58 Q118 46 112 34 Q124 20 130 32");opacity:.7}
        40%  {d:path("M104 58 Q120 44 112 34 Q122 22 130 32");opacity:.4}
        80%  {d:path("M104 58 Q116 48 112 34 Q126 18 130 32");opacity:.9}
        100% {d:path("M104 58 Q118 46 112 34 Q124 20 130 32");opacity:.7}
      }
      @keyframes ln-spark {
        0%   {opacity:1;r:4}
        50%  {opacity:.6;r:6}
        100% {opacity:1;r:4}
      }
      @keyframes ln-ring {
        0%   {transform:scale(1);opacity:.6}
        50%  {transform:scale(1.5);opacity:0}
        100% {transform:scale(1);opacity:.6}
      }
      @keyframes ln-ground {
        0%,100%{transform:scaleX(1);opacity:.3}
        50%    {transform:scaleX(1.4);opacity:.1}
      }
      .ln-main  {animation:ln-pulse     .18s cubic-bezier(.4,0,.6,1) infinite;transform-origin:100px 58px}
      .ln-orb   {animation:ln-orb-pulse .18s ease-in-out infinite;transform-origin:100px 58px}
      .ln-a1    {animation:ln-arc1      .22s ease-in-out infinite}
      .ln-a2    {animation:ln-arc2      .18s ease-in-out infinite .06s}
      .ln-a3    {animation:ln-arc3      .20s ease-in-out infinite .10s}
      .ln-sp1   {animation:ln-spark     .14s ease-in-out infinite}
      .ln-sp2   {animation:ln-spark     .14s ease-in-out infinite .07s}
      .ln-sp3   {animation:ln-spark     .18s ease-in-out infinite .03s}
      .ln-ring  {animation:ln-ring      .4s  ease-out infinite}
      .ln-ground{animation:ln-ground    .18s ease-in-out infinite;transform-origin:100px 108px}
    `}</style>
    {/* ground glow */}
    <ellipse className="ln-ground" cx="100" cy="108" rx="48" ry="8" fill="#fde047" opacity=".2" filter="url(#ln-blur)"/>
    {/* outer energy ring */}
    <circle className="ln-ring" cx="100" cy="58" r="42" stroke="#fde047" strokeWidth="2" fill="none" opacity=".4"/>
    {/* soft halo */}
    <circle cx="100" cy="58" r="44" fill="url(#ln-orb)" className="ln-orb" filter="url(#ln-blur)"/>
    {/* electric arcs */}
    <g filter="url(#ln-arc-glow)">
      <path className="ln-a1" d="M80 50 Q85 38 100 44 Q110 28 120 40" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path className="ln-a2" d="M76 60 Q70 44 86 38 Q78 24 96 28" stroke="#fde047" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path className="ln-a3" d="M104 58 Q118 46 112 34 Q124 20 130 32" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </g>
    {/* main bolt */}
    <g className="ln-main" filter="url(#ln-glow2)">
      {/* outer stroke / glow layer */}
      <path d="M106 14 L88 58 L100 58 L86 104 L118 52 L104 52Z" fill="#fbbf24" stroke="#fef08a" strokeWidth="4" strokeLinejoin="round"/>
      {/* core bright fill */}
      <path d="M106 14 L88 58 L100 58 L86 104 L118 52 L104 52Z" fill="url(#ln-core)" strokeWidth="0"/>
      {/* white hot center streak */}
      <path d="M104 20 L92 56 L102 56 L90 96" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity=".6"/>
    </g>
    {/* sparks */}
    <g filter="url(#ln-glow1)">
      <circle className="ln-sp1" cx="72"  cy="40" r="4"   fill="#fef9c3"/>
      <circle className="ln-sp2" cx="130" cy="36" r="3.5" fill="#fef9c3"/>
      <circle className="ln-sp3" cx="62"  cy="72" r="3"   fill="#fbbf24"/>
      <circle className="ln-sp1" cx="138" cy="68" r="3.5" fill="#fbbf24"/>
      <circle className="ln-sp2" cx="78"  cy="100"r="2.5" fill="#fde047"/>
      <circle className="ln-sp3" cx="124" cy="96" r="2.5" fill="#fde047"/>
      <circle className="ln-sp1" cx="100" cy="18" r="3"   fill="#fef9c3"/>
    </g>
  </svg>
);

const RocketSvg = () => (
  <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <radialGradient id="rk-body" cx="35%" cy="20%" r="70%">
        <stop offset="0%" stopColor="#a5b4fc"/>
        <stop offset="100%" stopColor="#312e81"/>
      </radialGradient>
      <radialGradient id="rk-nose" cx="40%" cy="15%" r="65%">
        <stop offset="0%" stopColor="#e0e7ff"/>
        <stop offset="100%" stopColor="#6366f1"/>
      </radialGradient>
      <radialGradient id="rk-fl1" cx="50%" cy="0%" r="100%">
        <stop offset="0%" stopColor="#fef3c7"/>
        <stop offset="40%" stopColor="#fbbf24"/>
        <stop offset="100%" stopColor="#dc2626"/>
      </radialGradient>
      <radialGradient id="rk-fl2" cx="50%" cy="0%" r="100%">
        <stop offset="0%" stopColor="#fed7aa"/>
        <stop offset="50%" stopColor="#f97316"/>
        <stop offset="100%" stopColor="#9a3412"/>
      </radialGradient>
      <filter id="rk-glow"><feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#6366f1" floodOpacity=".5"/></filter>
      <filter id="rk-flame-glow"><feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#fbbf24" floodOpacity=".7"/></filter>
      <filter id="rk-blur"><feGaussianBlur stdDeviation="3"/></filter>
    </defs>
    <style>{`
      @keyframes rk-fly {
        0%   {transform:translateX(0) translateY(0) rotate(0deg)}
        20%  {transform:translateX(3px) translateY(-6px) rotate(-1.5deg)}
        50%  {transform:translateX(-2px) translateY(-10px) rotate(.8deg)}
        80%  {transform:translateX(2px) translateY(-5px) rotate(-1deg)}
        100% {transform:translateX(0) translateY(0) rotate(0deg)}
      }
      @keyframes rk-flame-outer {
        0%,100%{transform:scaleX(1) scaleY(1)}
        25%    {transform:scaleX(.85) scaleY(1.4)}
        50%    {transform:scaleX(1.1) scaleY(1.1)}
        75%    {transform:scaleX(.9)  scaleY(1.3)}
      }
      @keyframes rk-flame-inner {
        0%,100%{transform:scaleX(1) scaleY(1)}
        33%    {transform:scaleX(.75) scaleY(1.5)}
        66%    {transform:scaleX(1.1) scaleY(.9)}
      }
      @keyframes rk-spark {
        0%   {opacity:1;transform:translate(0,0) scale(1)}
        100% {opacity:0;transform:translate(var(--dx),var(--dy)) scale(.3)}
      }
      @keyframes rk-trail {
        0%,100%{opacity:.4;transform:scaleX(1)}
        50%    {opacity:.1;transform:scaleX(.7)}
      }
      .rk-all   {animation:rk-fly .7s cubic-bezier(.4,0,.6,1) infinite;transform-origin:110px 60px}
      .rk-fo    {animation:rk-flame-outer .14s ease-in-out infinite;transform-origin:110px 88px}
      .rk-fi    {animation:rk-flame-inner .10s ease-in-out infinite .04s;transform-origin:110px 90px}
      .rk-trail {animation:rk-trail .14s ease-in-out infinite}
      .rk-s1{animation:rk-spark .4s ease-out infinite;--dx:-16px;--dy:18px}
      .rk-s2{animation:rk-spark .4s ease-out infinite .13s;--dx:18px;--dy:22px}
      .rk-s3{animation:rk-spark .4s ease-out infinite .26s;--dx:-6px;--dy:28px}
      .rk-s4{animation:rk-spark .35s ease-out infinite .07s;--dx:10px;--dy:24px}
    `}</style>
    {/* motion trail / exhaust plume behind rocket */}
    <g className="rk-trail">
      <ellipse cx="68" cy="60" rx="28" ry="8" fill="#fbbf24" opacity=".12" filter="url(#rk-blur)"/>
      <path d="M12 56 L62 58" stroke="#fde68a" strokeWidth="3" strokeLinecap="round" opacity=".4"/>
      <path d="M8 63 L56 62" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" opacity=".3"/>
      <path d="M16 70 L58 67" stroke="#fde68a" strokeWidth="1.5" strokeLinecap="round" opacity=".2"/>
    </g>
    <g className="rk-all" filter="url(#rk-glow)">
      {/* exhaust flame â€" outer */}
      <g className="rk-fo" filter="url(#rk-flame-glow)">
        <path d="M94 88 Q90 108 110 116 Q130 108 126 88Z" fill="url(#rk-fl1)"/>
      </g>
      {/* exhaust flame â€" mid */}
      <g className="rk-fi">
        <path d="M100 88 Q98 106 110 114 Q122 106 120 88Z" fill="url(#rk-fl2)"/>
        <path d="M104 88 Q104 104 110 112 Q116 104 116 88Z" fill="#ef4444"/>
        {/* white-hot core */}
        <path d="M107 90 Q107 102 110 108 Q113 102 113 90Z" fill="#fef9c3"/>
      </g>
      {/* sparks */}
      <circle className="rk-s1" cx="106" cy="90" r="3" fill="#fbbf24"/>
      <circle className="rk-s2" cx="114" cy="90" r="2.5" fill="#f97316"/>
      <circle className="rk-s3" cx="110" cy="92" r="2" fill="#fef3c7"/>
      <circle className="rk-s4" cx="108" cy="91" r="2" fill="#ef4444"/>
      {/* fins */}
      <path d="M94 74 Q80 84 78 98 L94 88Z" fill="#f43f5e" stroke="#be123c" strokeWidth="1.8"/>
      <path d="M126 74 Q140 84 142 98 L126 88Z" fill="#f43f5e" stroke="#be123c" strokeWidth="1.8"/>
      {/* body */}
      <path d="M94 28 Q94 88 110 92 Q126 88 126 28 Q118 14 110 12 Q102 14 94 28Z" fill="url(#rk-body)" stroke="#312e81" strokeWidth="2"/>
      {/* nose cone */}
      <path d="M102 28 Q102 14 110 10 Q118 14 118 28Z" fill="url(#rk-nose)" stroke="#4338ca" strokeWidth="1.5"/>
      {/* window */}
      <circle cx="110" cy="54" r="11" fill="#0f172a" stroke="#6366f1" strokeWidth="2.5"/>
      <circle cx="110" cy="54" r="8" fill="#1e1b4b"/>
      <circle cx="108" cy="51" r="4" fill="#3730a3" opacity=".8"/>
      <circle cx="107" cy="50" r="2" fill="#e0e7ff" opacity=".4"/>
      {/* body stripe */}
      <line x1="94" y1="70" x2="126" y2="70" stroke="#6366f1" strokeWidth="2" opacity=".4"/>
      <line x1="94" y1="40" x2="126" y2="40" stroke="#6366f1" strokeWidth="1.5" opacity=".3"/>
    </g>
  </svg>
);

interface SpeedTier {
  title: string;
  message: (wpm: number, cpm: number, acc: number) => string;
  Svg: () => JSX.Element;
}

function getSpeedTier(wpm: number): SpeedTier {
  if (wpm <= 20) return {
    title: "Rising Typist",
    message: (w, c, a) => `${w} WPM · ${c} CPM · ${a}% accuracy. Every expert was once a beginner — keep pushing!`,
    Svg: SnailSvg,
  };
  if (wpm <= 40) return {
    title: "T-Rex Typist",
    message: (w, c, a) => `${w} WPM · ${c} CPM · ${a}% accuracy. You're stomping through the keys — unstoppable momentum!`,
    Svg: TRexSvg,
  };
  if (wpm <= 60) return {
    title: "Fast Fingers",
    message: (w, c, a) => `${w} WPM · ${c} CPM · ${a}% accuracy. Your fingers are flying — well above average!`,
    Svg: RabbitSvg,
  };
  if (wpm <= 80) return {
    title: "Elite Typist",
    message: (w, c, a) => `${w} WPM · ${c} CPM · ${a}% accuracy. Elite speed — you're outpacing 90% of typists!`,
    Svg: CheetahSvg,
  };
  if (wpm <= 100) return {
    title: "Precision Pro",
    message: (w, c, a) => `${w} WPM · ${c} CPM · ${a}% accuracy. Effortless precision at blazing speed — seriously impressive!`,
    Svg: EagleSvg,
  };
  return {
    title: "Lightning Fingers",
    message: (w, c, a) => `${w} WPM · ${c} CPM · ${a}% accuracy. LEGENDARY. You type faster than most people think!`,
    Svg: LightningSvg,
  };
}

// â"€â"€â"€ Main component â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export default function TypingTest() {
  const [mode, setMode]                 = useState<Mode>("words");
  const [duration, setDuration]         = useState<Duration>(60);
  const [text, setText]                 = useState(() => generateText("words"));
  const [chars, setChars]               = useState<CharData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted]           = useState(false);
  const [finished, setFinished]         = useState(false);
  const [timeLeft, setTimeLeft]         = useState(60);
  const [errors, setErrors]             = useState(0);
  const [totalTyped, setTotalTyped]     = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [startTime, setStartTime]       = useState(0);
  const [elapsedMs, setElapsedMs]       = useState(0);
  const [showCertModal, setShowCertModal] = useState(false);
  const [certName, setCertName]           = useState("");
  const [submittedTestId, setSubmittedTestId] = useState<number | null>(null);

  const [lineOffset, setLineOffset] = useState(0);
  const wpmHistoryRef = useRef<number[]>([]);

  const inputRef        = useRef<HTMLInputElement>(null);
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const textAreaRef     = useRef<HTMLDivElement>(null);
  const currentCharRef  = useRef<HTMLSpanElement>(null);
  const textParaRef     = useRef<HTMLParagraphElement>(null);

  const { isAuthenticated } = useAuth();
  const submitTest  = useSubmitTest();
  const generateCert = useGenerateCertificate();

  // â"€â"€ Init chars â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  useEffect(() => {
    setChars(
      text.split("").map((char, i) => ({
        char,
        state: i === 0 ? "current" : "pending",
      }))
    );
    setCurrentIndex(0);
    setLineOffset(0);
    setStarted(false);
    setFinished(false);
    setTimeLeft(duration);
    setErrors(0);
    setTotalTyped(0);
    setCorrectChars(0);
    setElapsedMs(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [text, duration]);

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    wpmHistoryRef.current = [];
    setText(generateText(mode));
  }, [mode]);

  useEffect(() => {
    setTimeLeft(duration);
    reset();
  }, [duration, reset]);

  // â"€â"€ Timer â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      const nowMs = Date.now() - startTime;
      setElapsedMs(nowMs);
      // Record instantaneous WPM snapshot for the graph
      const elMin = nowMs / 1000 / 60;
      setCorrectChars((cc) => {
        const snap = elMin > 0 ? Math.round(cc / 5 / elMin) : 0;
        wpmHistoryRef.current = [...wpmHistoryRef.current, snap];
        return cc;
      });
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, finished, startTime]);

  // â"€â"€ Auto-submit â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  useEffect(() => {
    if (!finished || correctChars === 0) return;
    const elapsed = (Date.now() - startTime) / 1000 / 60;
    const wpm = elapsed > 0 ? Math.round(correctChars / 5 / elapsed) : 0;
    const cpm = elapsed > 0 ? Math.round(correctChars / elapsed) : 0;
    const accuracy = totalTyped > 0 ? Math.round((correctChars / (correctChars + errors)) * 100) : 0;
    submitTest.mutate(
      { data: { wpm, cpm, accuracy, duration, mode, errorCount: errors, charCount: correctChars } },
      { onSuccess: (r) => setSubmittedTestId(r.id) }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  // â"€â"€ Line-snap: scroll up when caret moves onto line 3 â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  // Uses offsetTop (layout position, unaffected by translateY) so the
  // measurement is always accurate regardless of current scroll state.
  useEffect(() => {
    const caret = currentCharRef.current;
    const para  = textParaRef.current;
    if (!caret || !para) return;

    // offsetTop of caret relative to the paragraph element (layout-space)
    const caretLayoutTop = caret.offsetTop;
    const lineH = parseFloat(getComputedStyle(para).lineHeight) || 44;

    // Which logical line is the caret on? (0-based)
    const caretLine = Math.floor(caretLayoutTop / lineH);

    // We show 3 lines. Scroll so caret stays on line 1 (middle).
    // Target translateY = (caretLine - 1) * lineH, but never go negative.
    const targetOffset = Math.max(0, (caretLine - 1) * lineH);
    setLineOffset(targetOffset);
  }, [currentIndex]);

  // â"€â"€ Tab+Enter to restart â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  useEffect(() => {
    let tab = false;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab")   { e.preventDefault(); tab = true; return; }
      if (e.key === "Enter" && tab) { e.preventDefault(); reset(); }
      tab = false;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reset]);

  // â"€â"€ Keystroke handler â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (finished) return;
      const key = e.key;

      if (key === "Backspace") {
        e.preventDefault();
        if (currentIndex === 0) return;
        setChars((prev) => {
          const next = [...prev];
          next[currentIndex]     = { ...next[currentIndex],     state: "pending"  };
          next[currentIndex - 1] = { ...next[currentIndex - 1], state: "current" };
          return next;
        });
        setCurrentIndex((i) => i - 1);
        return;
      }

      if (key.length !== 1) return;
      e.preventDefault();

      // When the expected character is a space, only accept spacebar
      const expectedChar = chars[currentIndex]?.char;
      if (expectedChar === " " && key !== " ") return;

      if (!started) {
        setStarted(true);
        setStartTime(Date.now());
      }

      const isCorrect = key === expectedChar;
      setTotalTyped((t) => t + 1);
      if (isCorrect) setCorrectChars((c) => c + 1);
      else           setErrors((err) => err + 1);

      const nextIdx = currentIndex + 1;

      setChars((prev) => {
        const next = [...prev];
        next[currentIndex] = { ...next[currentIndex], state: isCorrect ? "correct" : "incorrect" };
        if (nextIdx < next.length)
          next[nextIdx] = { ...next[nextIdx], state: "current" };
        return next;
      });

      setCurrentIndex(nextIdx);
      if (nextIdx >= chars.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setFinished(true);
      }
    },
    [finished, started, currentIndex, chars]
  );

  // â"€â"€ Live stats â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  const elapsedMinutes = useMemo(() => {
    const ms = started ? (finished ? elapsedMs : Date.now() - startTime) : 0;
    return Math.max(ms / 1000 / 60, 0.001);
  }, [started, finished, elapsedMs, startTime]);

  const liveWpm = useMemo(
    () => (started ? Math.round(correctChars / 5 / elapsedMinutes) : 0),
    [correctChars, elapsedMinutes, started]
  );
  const liveCpm = useMemo(
    () => (started ? Math.round(correctChars / elapsedMinutes) : 0),
    [correctChars, elapsedMinutes, started]
  );
  const liveAccuracy = useMemo(
    () => (totalTyped === 0 ? 100 : Math.round((correctChars / totalTyped) * 100)),
    [correctChars, totalTyped]
  );
  const finalWpm = useMemo(() => {
    if (!finished) return liveWpm;
    const elapsed = (duration - timeLeft) / 60 || elapsedMs / 1000 / 60;
    return elapsed > 0 ? Math.round(correctChars / 5 / elapsed) : 0;
  }, [finished, liveWpm, duration, timeLeft, correctChars, elapsedMs]);

  // â"€â"€ Render â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  return (
    <div
      className="min-h-screen flex flex-col bg-background"
      onClick={() => inputRef.current?.focus()}
    >
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 gap-8 py-10 relative overflow-hidden">

        {/* Decorative background clipart */}
        <div className="pointer-events-none select-none absolute inset-0 overflow-hidden" aria-hidden>

          {/* Top-left: floating keyboard */}
          <svg className="absolute -top-4 -left-6 opacity-[0.045] w-72 h-auto" viewBox="0 0 280 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="272" height="122" rx="14" stroke="currentColor" strokeWidth="5"/>
            {[0,1,2,3,4,5,6,7,8,9].map(i => <rect key={i} x={16 + i*26} y={20} width="18" height="18" rx="4" fill="currentColor" opacity="0.6"/>)}
            {[0,1,2,3,4,5,6,7,8].map(i => <rect key={i} x={22 + i*26} y={46} width="18" height="18" rx="4" fill="currentColor" opacity="0.5"/>)}
            {[0,1,2,3,4,5,6,7].map(i => <rect key={i} x={30 + i*26} y={72} width="18" height="18" rx="4" fill="currentColor" opacity="0.4"/>)}
            <rect x="80" y="98" width="120" height="18" rx="6" fill="currentColor" opacity="0.5"/>
          </svg>

          {/* Top-right: single large key with lightning */}
          <svg className="absolute top-8 -right-2 opacity-[0.04] w-44 h-auto" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="6" width="128" height="128" rx="18" stroke="currentColor" strokeWidth="5"/>
            <rect x="14" y="14" width="112" height="112" rx="14" stroke="currentColor" strokeWidth="3" opacity="0.5"/>
            <path d="M78 28 L52 72 H68 L50 112 L94 60 H76 Z" fill="currentColor" opacity="0.7"/>
          </svg>

          {/* Bottom-left: stacked keys */}
          <svg className="absolute -bottom-2 -left-4 opacity-[0.04] w-56 h-auto" viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            {[0,1,2,3,4,5,6].map(i => (
              <g key={i} transform={`translate(${i * 6}, ${i * -4})`}>
                <rect x="10" y={20 + i*22} width="180" height="18" rx="5" stroke="currentColor" strokeWidth="3" opacity={0.6 - i*0.08}/>
              </g>
            ))}
            <rect x="50" y="148" width="100" height="22" rx="6" fill="currentColor" opacity="0.25"/>
          </svg>

          {/* Bottom-right: computer mouse */}
          <svg className="absolute -bottom-4 -right-4 opacity-[0.045] w-44 h-auto" viewBox="0 0 140 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Mouse body */}
            <path d="M30 80 C30 40 110 40 110 80 L110 160 C110 178 96 190 70 190 C44 190 30 178 30 160 Z" stroke="currentColor" strokeWidth="5"/>
            {/* Left/right button split line */}
            <line x1="70" y1="42" x2="70" y2="100" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            {/* Top curve separating buttons from body */}
            <path d="M30 100 Q70 108 110 100" stroke="currentColor" strokeWidth="4"/>
            {/* Scroll wheel */}
            <rect x="60" y="56" width="20" height="36" rx="10" stroke="currentColor" strokeWidth="3.5"/>
            <line x1="70" y1="62" x2="70" y2="86" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
            {/* Cable */}
            <path d="M70 42 C70 28 80 18 70 6" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
          </svg>

          {/* Centre-left: WPM meter arc (very faint) */}
          <svg className="absolute top-1/2 -translate-y-1/2 -left-16 opacity-[0.03] w-52 h-auto" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 140 A70 70 0 1 1 140 140" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
            <path d="M20 140 A70 70 0 0 1 105 32" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.6"/>
            <circle cx="80" cy="80" r="6" fill="currentColor"/>
            <line x1="80" y1="80" x2="105" y2="40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7"/>
          </svg>

          {/* Centre-right: floating letters */}
          <svg className="absolute top-1/2 -translate-y-1/2 -right-10 opacity-[0.035] w-40 h-auto" viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="10"  y="40"  fontFamily="monospace" fontSize="28" fill="currentColor" opacity="0.9">A</text>
            <text x="60"  y="80"  fontFamily="monospace" fontSize="22" fill="currentColor" opacity="0.6">Z</text>
            <text x="20"  y="120" fontFamily="monospace" fontSize="32" fill="currentColor" opacity="0.8">W</text>
            <text x="70"  y="155" fontFamily="monospace" fontSize="20" fill="currentColor" opacity="0.5">M</text>
            <text x="8"   y="192" fontFamily="monospace" fontSize="24" fill="currentColor" opacity="0.7">P</text>
          </svg>

        </div>

        {/* â"€â"€ Mode selector (above card) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
        <div className="flex items-center gap-0.5 text-sm select-none" data-testid="mode-selector">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); reset(); }}
              className={`px-2.5 py-1 rounded transition-colors duration-100 ${
                mode === m.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
              data-testid={`mode-${m.id}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Main typing area - monkeytype style */}
        <div
          ref={textAreaRef}
          className="w-full max-w-4xl cursor-pointer"
          onClick={() => inputRef.current?.focus()}
          data-testid="typing-text-container"
        >
          {/* Top bar: duration pills left | live stats right */}
          <div className="flex items-center justify-between mb-5" data-testid="live-stats">
            <div className="flex items-center gap-1 select-none" data-testid="duration-selector">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={(e) => { e.stopPropagation(); setDuration(d); }}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-100 ${
                    duration === d
                      ? "text-[#e2b714] bg-[#e2b714]/10"
                      : "text-muted-foreground/40 hover:text-muted-foreground/70"
                  }`}
                  data-testid={`duration-${d}`}
                >
                  {d}s
                </button>
              ))}
            </div>
            <div className="flex items-center gap-8 select-none">
              <div className="flex items-baseline gap-1" data-testid="stat-time">
                <span className="text-3xl font-bold tabular-nums text-[#e2b714]">{timeLeft}</span>
                <span className="text-xs text-muted-foreground/40 ml-0.5">s</span>
              </div>

              {/* Speedometer + WPM */}
              <div className="flex items-center gap-2" data-testid="stat-wpm">
                {(() => {
                  const maxWpm = 150;
                  const pct = Math.min(liveWpm / maxWpm, 1);
                  // Arc from 210° to 330° (150° sweep) — left-to-right
                  const cx = 28, cy = 28, r = 20;
                  const startAngle = 215;
                  const sweep = 110;
                  const toRad = (d: number) => (d * Math.PI) / 180;
                  const arcX = (a: number) => cx + r * Math.cos(toRad(a));
                  const arcY = (a: number) => cy + r * Math.sin(toRad(a));
                  // Track arc
                  const trackD = `M ${arcX(startAngle)} ${arcY(startAngle)} A ${r} ${r} 0 0 1 ${arcX(startAngle + sweep)} ${arcY(startAngle + sweep)}`;
                  // Fill arc
                  const fillSweep = sweep * pct;
                  const fillD = fillSweep > 0
                    ? `M ${arcX(startAngle)} ${arcY(startAngle)} A ${r} ${r} 0 ${fillSweep > 180 ? 1 : 0} 1 ${arcX(startAngle + fillSweep)} ${arcY(startAngle + fillSweep)}`
                    : "";
                  // Needle angle
                  const needleAngle = startAngle + sweep * pct;
                  const nx = cx + (r - 5) * Math.cos(toRad(needleAngle));
                  const ny = cy + (r - 5) * Math.sin(toRad(needleAngle));
                  // Color: green→yellow→red based on speed
                  const color = pct < 0.4 ? "#5cb85c" : pct < 0.75 ? "#e2b714" : "#ca4754";
                  return (
                    <svg width="56" height="40" viewBox="0 0 56 42" fill="none">
                      {/* Track */}
                      <path d={trackD} stroke="currentColor" strokeOpacity="0.12" strokeWidth="4" strokeLinecap="round" fill="none"/>
                      {/* Fill */}
                      {fillD && <path d={fillD} stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" style={{ transition: "all 0.3s ease" }}/>}
                      {/* Needle */}
                      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="2" strokeLinecap="round" style={{ transition: "all 0.3s ease" }}/>
                      {/* Centre dot */}
                      <circle cx={cx} cy={cy} r="2.5" fill={color} style={{ transition: "fill 0.3s ease" }}/>
                    </svg>
                  );
                })()}
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-semibold tabular-nums text-foreground/60">{liveWpm}</span>
                  <span className="text-xs text-muted-foreground/40">wpm</span>
                </div>
              </div>

              <div className="flex items-baseline gap-1" data-testid="stat-accuracy">
                <span className="text-xl font-semibold tabular-nums text-foreground/60">{liveAccuracy}</span>
                <span className="text-xs text-muted-foreground/40">%</span>
              </div>
            </div>
          </div>

          {/* Typing text area */}
          <div className="relative overflow-hidden" style={{ height: "9.6rem" }}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-4 z-10" style={{background:"linear-gradient(to bottom, var(--background) 0%, transparent 100%)"}}/>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 z-10" style={{background:"linear-gradient(to top, var(--background) 20%, transparent 100%)"}}/>
            <p
              ref={textParaRef}
              className="font-mono text-[1.35rem] leading-[3.2rem] tracking-wide select-none break-words"
              style={{
                transform: `translateY(-${lineOffset}px)`,
                transition: lineOffset === 0 ? "none" : "transform 120ms cubic-bezier(0.4,0,0.2,1)",
              }}
              aria-label="Typing text"
            >
              {chars.map((c, i) => (
                <Char
                  key={i}
                  char={c.char}
                  state={c.state}
                  isCurrent={c.state === "current"}
                  spanRef={c.state === "current" ? currentCharRef : undefined}
                />
              ))}
            </p>
            {!started && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-sm text-muted-foreground/30 tracking-widest uppercase font-mono">
                  start typing…
                </p>
              </div>
            )}
          </div>

          {/* Bottom: restart */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm text-muted-foreground/30 hover:text-[#e2b714] hover:bg-[#e2b714]/5 transition-colors duration-150 select-none"
              data-testid="button-restart"
              tabIndex={-1}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>restart</span>
            </button>
            <span className="text-xs text-muted-foreground/20 select-none font-mono">tab + enter</span>
          </div>
        </div>

        {/* â"€â"€ Hidden input â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
        <input
          ref={inputRef}
          className="fixed -top-[999px] opacity-0 w-0 h-0 pointer-events-none"
          onKeyDown={handleKeyDown}
          readOnly
          autoFocus
          aria-hidden
          tabIndex={-1}
          data-testid="typing-input"
        />

      </main>

      {/* Results overlay */}
      <AnimatePresence>
        {finished && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "hsl(var(--background)/0.85)", backdropFilter: "blur(12px)" }}
            data-testid="results-overlay"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{    opacity: 0, y: 18, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full max-w-[460px] rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              data-testid="results-card"
            >
              {(() => {
                const tier = getSpeedTier(finalWpm);
                const hist = wpmHistoryRef.current;
                const W = 420, H = 72;
                const pad = { l: 4, r: 4, t: 6, b: 6 };
                const maxWpm = Math.max(...hist, finalWpm, 1);
                const pts = hist.map((v, idx) => {
                  const x = pad.l + (idx / Math.max(hist.length - 1, 1)) * (W - pad.l - pad.r);
                  const y = pad.t + (1 - v / maxWpm) * (H - pad.t - pad.b);
                  return `${x},${y}`;
                });
                const polyline = pts.join(" ");
                const areaPath = hist.length > 1
                  ? `M${pts[0]} L${pts.slice(1).join(" L")} L${W - pad.r},${H - pad.b} L${pad.l},${H - pad.b} Z`
                  : "";

                return (
                  <>
                    {/* Header: animal + title */}
                    <div className="flex items-center gap-4 px-6 pt-6 pb-4">
                      <motion.div
                        initial={{ scale: 0.5, rotate: -10 }}
                        animate={{ scale: 1,   rotate: 0   }}
                        transition={{ delay: 0.08, type: "spring", stiffness: 280, damping: 20 }}
                        className="shrink-0 w-20 h-20 flex items-center justify-center"
                      >
                        <tier.Svg />
                      </motion.div>
                      <div className="min-w-0">
                        <motion.p
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.14 }}
                          className="text-lg font-bold leading-tight"
                          data-testid="result-title"
                        >
                          {tier.title}
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-xs text-muted-foreground mt-1 leading-relaxed"
                        >
                          {tier.message(finalWpm, liveCpm, liveAccuracy)}
                        </motion.p>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-4 divide-x divide-border/50 border-y border-border/50 mx-0">
                      {[
                        { label: "wpm",      value: finalWpm,           testId: "result-wpm"      },
                        { label: "cpm",      value: liveCpm,            testId: "result-cpm"      },
                        { label: "accuracy", value: `${liveAccuracy}%`, testId: "result-accuracy" },
                        { label: "errors",   value: errors,             testId: "result-errors"   },
                      ].map((s, i) => (
                        <motion.div
                          key={s.label}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.22 + i * 0.05 }}
                          className="flex flex-col items-center py-3 px-2"
                        >
                          <span className="text-2xl font-bold tabular-nums text-foreground leading-none" data-testid={s.testId}>
                            {s.value}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                            {s.label}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* WPM sparkline graph */}
                    {hist.length > 1 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.38 }}
                        className="px-5 pt-4 pb-2"
                      >
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">wpm over time</p>
                        <svg
                          viewBox={`0 0 ${W} ${H}`}
                          preserveAspectRatio="none"
                          className="w-full h-16"
                        >
                          <defs>
                            <linearGradient id="wpm-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(213 94% 68%)" stopOpacity="0.18" />
                              <stop offset="100%" stopColor="hsl(213 94% 68%)" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {/* Area fill */}
                          <path d={areaPath} fill="url(#wpm-grad)" />
                          {/* Line */}
                          <polyline
                            points={polyline}
                            fill="none"
                            stroke="hsl(213 94% 68%)"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />
                          {/* End dot */}
                          {pts.length > 0 && (() => {
                            const last = pts[pts.length - 1].split(",");
                            return (
                              <circle
                                cx={last[0]}
                                cy={last[1]}
                                r="2.5"
                                fill="hsl(213 94% 68%)"
                              />
                            );
                          })()}
                        </svg>
                      </motion.div>
                    )}

                    {/* Share + actions */}
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-1">share</span>
                        {[
                          {
                            label: "Facebook",
                            color: "#1877f2",
                            icon: <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
                            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(`I just typed ${finalWpm} WPM with ${liveAccuracy}% accuracy on TypingPeak!`)}`,
                          },
                          {
                            label: "LinkedIn",
                            color: "#0a66c2",
                            icon: <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
                            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`,
                          },
                          {
                            label: "Twitter",
                            color: "#1da1f2",
                            icon: <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>,
                            href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just typed ${finalWpm} WPM with ${liveAccuracy}% accuracy on TypingPeak!`)}`,
                          },
                        ].map((s) => (
                          <a
                            key={s.label}
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                            style={{ backgroundColor: s.color }}
                            aria-label={`Share on ${s.label}`}
                          >
                            {s.icon}
                          </a>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={reset}
                          className="gap-1.5 text-xs"
                          data-testid="button-try-again"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Try Again
                        </Button>
                        {isAuthenticated && submittedTestId && (
                          <Button
                            size="sm"
                            onClick={() => setShowCertModal(true)}
                            className="gap-1.5 text-xs"
                            data-testid="button-get-certificate"
                          >
                            <Award className="w-3 h-3" />
                            Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* â"€â"€ Certificate modal â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <AnimatePresence>
        {showCertModal && (
          <motion.div
            key="cert"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: "hsl(var(--background)/0.85)", backdropFilter: "blur(12px)" }}
            data-testid="cert-modal"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: 12 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-sm rounded-2xl border border-border bg-card px-7 py-7"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-semibold mb-1">Generate Certificate</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Your name as it should appear on the certificate.
              </p>
              <input
                type="text"
                placeholder="Full name"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-foreground text-sm mb-4 outline-none focus:ring-1 focus:ring-primary"
                data-testid="input-cert-name"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-sm"
                  onClick={() => setShowCertModal(false)}
                  data-testid="button-cert-cancel"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 text-sm"
                  disabled={!certName.trim() || generateCert.isPending}
                  onClick={() => {
                    if (submittedTestId && certName.trim()) {
                      generateCert.mutate(
                        { data: { testResultId: submittedTestId, recipientName: certName.trim() } },
                        { onSuccess: () => setShowCertModal(false) }
                      );
                    }
                  }}
                  data-testid="button-cert-generate"
                >
                  {generateCert.isPending ? "Generatingâ€¦" : "Generate"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
