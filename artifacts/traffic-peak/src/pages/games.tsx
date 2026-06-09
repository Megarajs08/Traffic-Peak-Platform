import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { top1000Words } from "@/lib/words";
import { GamepadIcon, Zap, Shuffle, Bot } from "lucide-react";
import WordRain from "@/components/games/WordRain";
import AlphabetSprint from "@/components/games/AlphabetSprint";
import WordScramble from "@/components/games/WordScramble";
import TypingRace from "@/components/games/TypingRace";

type GameId = "word-rain" | "alphabet-sprint" | "word-scramble" | "typing-race" | null;

const GAMES = [
  {
    id: "word-rain" as GameId,
    icon: GamepadIcon,
    title: "Word Rain",
    description: "Words fall from the top. Type them before they hit the bottom.",
    color: "text-blue-400",
  },
  {
    id: "alphabet-sprint" as GameId,
    icon: Zap,
    title: "Alphabet Sprint",
    description: "Type A through Z as fast as you can.",
    color: "text-yellow-400",
  },
  {
    id: "word-scramble" as GameId,
    icon: Shuffle,
    title: "Word Scramble",
    description: "Unscramble the letters to type the correct word.",
    color: "text-green-400",
  },
  {
    id: "typing-race" as GameId,
    icon: Bot,
    title: "Race vs AI",
    description: "Race an AI opponent. Can you beat it to the finish?",
    color: "text-purple-400",
  },
];

export default function Games() {
  const [activeGame, setActiveGame] = useState<GameId>(null);

  if (activeGame === "word-rain") return <WordRain onExit={() => setActiveGame(null)} />;
  if (activeGame === "alphabet-sprint") return <AlphabetSprint onExit={() => setActiveGame(null)} />;
  if (activeGame === "word-scramble") return <WordScramble onExit={() => setActiveGame(null)} />;
  if (activeGame === "typing-race") return <TypingRace onExit={() => setActiveGame(null)} />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" data-testid="games-heading">Typing Games</h1>
          <p className="text-muted-foreground">Practice typing while having fun.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border/60 rounded-xl p-6 hover:border-primary/30 transition-colors cursor-pointer group"
              onClick={() => setActiveGame(game.id)}
              data-testid={`game-card-${game.id}`}
            >
              <game.icon className={`w-8 h-8 ${game.color} mb-4`} />
              <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{game.title}</h2>
              <p className="text-muted-foreground text-sm mb-5">{game.description}</p>
              <Button size="sm" data-testid={`button-play-${game.id}`}>Play Now</Button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
