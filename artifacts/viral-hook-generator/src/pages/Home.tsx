import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clipboard, Loader2, Play, Check } from "lucide-react";
import { PlatformToggle } from "@/components/PlatformToggle";
import { HookCard, TextCard, IntroCard } from "@/components/HookCard";
import { useViralHooks } from "@/hooks/use-viral-hooks";
import { useToast } from "@/hooks/use-toast";
import type { Platform, ContentAngle } from "@/hooks/use-viral-hooks";
import type { GenerateHooksRequestPlatform } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const CONTENT_ANGLES: { value: ContentAngle; label: string }[] = [
  { value: "Review", label: "Review" },
  { value: "Educational", label: "Educational" },
  { value: "Storytelling", label: "Storytelling" },
  { value: "Controversial", label: "Controversial" },
  { value: "Comparison", label: "Comparison" },
  { value: "Listicle", label: "Listicle" },
  { value: "Inspirational", label: "Inspirational" },
];

const CREATOR_TIPS = [
  "Hooks that open an information gap — 'What nobody tells you about…' — consistently drive higher click-through rates.",
  "Short titles with strong action verbs outperform long descriptive ones. Aim for 6–8 words.",
  "Opening your video with a question pulls viewers in immediately and signals the answer is coming.",
  "The best hooks make the viewer feel like they are already missing something important.",
  "Titles that use numbers ('5 reasons', '3 mistakes') set a clear expectation and reduce drop-off.",
  "Your first 5 seconds determine if someone stays. Lead with the payoff, not the setup.",
  "Curiosity-gap hooks work best when the gap is specific, not vague. 'This one setting' beats 'something surprising'.",
  "Repeating your video's core promise in both the title and the first sentence reinforces why viewers should stay.",
  "Contrarian titles ('Stop doing X') get attention because they challenge what the viewer already believes.",
  "The most-clicked YouTube titles are often written in second person — they speak directly to 'you'.",
];

const LOADING_MESSAGES = [
  "Analyzing your topic…",
  "Crafting viral hooks…",
  "Writing clickable titles…",
  "Generating intro ideas…",
];

function LoadingMessages() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {/* Animated dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary/60"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Rotating message */}
      <div className="h-5 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="text-sm text-white/40 font-medium tracking-wide absolute inset-0 text-center whitespace-nowrap"
          >
            {LOADING_MESSAGES[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

function CopyAllButton({
  label,
  text,
  variant = "default",
}: {
  label: string;
  text: string;
  variant?: "default" | "accent";
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied!", description: "Ready to paste." });
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className={cn(
        "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 whitespace-nowrap",
        variant === "accent"
          ? "bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20"
          : "bg-white/5 text-muted-foreground hover:bg-primary/15 hover:text-primary border border-white/8"
      )}
    >
      {copied ? <Check size={12} /> : <Clipboard size={12} />}
      {copied ? "Copied!" : label}
    </button>
  );
}

function SectionCard({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-card/50 overflow-hidden">
      <div className={cn("h-0.5 w-full", accent)} />
      <div className="p-5 sm:p-7">{children}</div>
    </div>
  );
}

export default function Home() {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const {
    mutate,
    isPending,
    hooks,
    titles,
    introScripts,
    hasResults,
    platform,
    setPlatform,
    contentAngle,
    setContentAngle,
  } = useViralHooks();
  const resultsRef = useRef<HTMLDivElement>(null);

  const [remixMap, setRemixMap] = useState<Map<string, string[]>>(new Map());
  const [remixingSet, setRemixingSet] = useState<Set<string>>(new Set());

  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    if (hooks.length > 0) {
      setTipIndex(Math.floor(Math.random() * CREATOR_TIPS.length));
    }
  }, [hooks]);

  const handleRemix = async (hook: string) => {
    setRemixingSet((prev) => new Set([...prev, hook]));
    try {
      const res = await fetch("/api/hooks/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hook, topic, platform, contentAngle }),
      });
      if (!res.ok) throw new Error("Remix failed");
      const data = await res.json();
      setRemixMap((prev) => new Map([...prev, [hook, data.variations ?? []]]));
    } catch {
      toast({ title: "Remix failed", description: "Couldn't generate variations. Try again.", variant: "destructive" });
    } finally {
      setRemixingSet((prev) => {
        const next = new Set(prev);
        next.delete(hook);
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Please enter a topic or idea first.", variant: "destructive" });
      return;
    }
    setRemixMap(new Map());
    setRemixingSet(new Set());
    mutate(
      { data: { topic, platform, contentAngle } },
      {
        onSuccess: () => {
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        },
      }
    );
  };

  const toTitleCase = (s: string) =>
    s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  return (
    <div className="min-h-screen relative w-full pb-32">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#080810]" />
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-violet-950/60 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] bg-indigo-950/40 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] right-[5%] w-[250px] h-[250px] bg-purple-950/30 rounded-full blur-[80px]" />
      </div>

      <main className="relative z-10 container max-w-4xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 lg:pt-28">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-5 border border-primary/20"
          >
            <Sparkles size={13} />
            AI-Powered Creator Tool
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white mb-3 leading-[1.1] tracking-tight"
          >
            Hook
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400">
              Lab
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="text-lg sm:text-xl text-white/60 font-medium mb-4 tracking-tight"
          >
            Get better hooks and ideas to grow your product — in seconds
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="text-sm sm:text-base text-white/40 leading-relaxed mb-3"
          >
            Turn one idea into attention-grabbing hooks, titles, and angles to grow faster.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="text-xs text-white/30 tracking-wide"
          >
            Used by founders to get better ideas and grow faster.
          </motion.p>
        </div>

        {/* ── Input Card ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.26 }}
          className="max-w-3xl mx-auto rounded-2xl border border-white/8 bg-[#0f0f1a] shadow-2xl shadow-black/60 p-5 sm:p-7 mb-4"
        >
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Topic */}
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-white/60 mb-2">
                What are you trying to grow?
              </label>
              <textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Example: landing page for my SaaS, AI tool for creators, newsletter for startup founders, real estate lead generation, or how to get more users"
                rows={3}
                className="w-full px-4 py-3 text-sm text-white rounded-xl bg-white/4 border border-white/10 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 outline-none transition-all resize-none placeholder:text-white/20 leading-relaxed"
              />
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Use case
              </label>
              <PlatformToggle
                value={platform}
                onChange={(v) => setPlatform(v as GenerateHooksRequestPlatform)}
              />
            </div>

            {/* Content Angle */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Content Angle
              </label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_ANGLES.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setContentAngle(a.value)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                      contentAngle === a.value
                        ? "bg-primary text-white shadow-md shadow-primary/25"
                        : "bg-white/5 text-white/50 border border-white/8 hover:bg-white/10 hover:text-white/80"
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full relative group overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 transition-opacity duration-300 group-hover:opacity-90 group-disabled:opacity-60" />
              <div className="relative flex items-center justify-center gap-2.5 py-3.5 px-6 text-white font-semibold text-base">
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Generating hooks…
                  </>
                ) : (
                  <>
                    <Play fill="currentColor" size={15} />
                    Generate Hooks
                  </>
                )}
              </div>
            </button>

          </form>
        </motion.div>

        {/* ── Results ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {hasResults && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 space-y-5"
            >

              {/* Hooks */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
                <SectionCard accent="bg-gradient-to-r from-violet-500 via-purple-500 to-transparent">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
                    <div>
                      <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
                        Hooks 🎣
                      </h2>
                      <p className="text-xs text-white/40 mt-0.5">Short, curiosity-driven hooks for your video.</p>
                    </div>
                    <CopyAllButton label="Copy All" text={hooks.join("\n\n")} />
                  </div>
                  <motion.div
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035 } } }}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    {hooks.map((hook, i) => (
                      <HookCard
                        key={i}
                        index={i + 1}
                        text={hook}
                        onRemix={() => handleRemix(hook)}
                        isRemixing={remixingSet.has(hook)}
                        remixVariations={remixMap.get(hook) ?? []}
                      />
                    ))}
                  </motion.div>
                </SectionCard>
              </motion.div>

              {/* Titles */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionCard accent="bg-gradient-to-r from-indigo-500 via-blue-500 to-transparent">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
                    <div>
                      <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
                        YouTube Titles 📝
                      </h2>
                      <p className="text-xs text-white/40 mt-0.5">Clickable titles designed to improve click-through rate.</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <CopyAllButton label="Copy All" text={titles.join("\n\n")} />
                      <CopyAllButton label="Title Case" text={titles.map(toTitleCase).join("\n")} variant="accent" />
                    </div>
                  </div>
                  <motion.div
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035 } } }}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    {titles.map((title, i) => (
                      <TextCard key={i} index={i + 1} text={title} />
                    ))}
                  </motion.div>
                </SectionCard>
              </motion.div>

              {/* Intros */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                <SectionCard accent="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-transparent">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
                    <div>
                      <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
                        Intro Scripts 🎬
                      </h2>
                      <p className="text-xs text-white/40 mt-0.5">Opening lines that hook the viewer in the first 5 seconds.</p>
                    </div>
                    <CopyAllButton label="Copy All" text={introScripts.join("\n\n")} />
                  </div>
                  <motion.div
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 gap-3"
                  >
                    {introScripts.map((script, i) => (
                      <IntroCard key={i} index={i + 1} text={script} />
                    ))}
                  </motion.div>
                </SectionCard>
              </motion.div>

              {/* Creator Tip */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
              >
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 flex gap-3 items-start">
                  <span className="text-amber-400 text-base leading-none mt-0.5 shrink-0">💡</span>
                  <div>
                    <p className="text-xs font-semibold text-amber-400/80 uppercase tracking-widest mb-1">Creator Tip</p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={tipIndex}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-sm text-white/55 leading-relaxed"
                      >
                        {CREATOR_TIPS[tipIndex]}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeleton */}
        <AnimatePresence>
          {isPending && !hasResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-10 space-y-5"
            >
              <LoadingMessages />
              {[
                { accent: "bg-gradient-to-r from-violet-500 to-transparent", rows: 4 },
                { accent: "bg-gradient-to-r from-indigo-500 to-transparent", rows: 4 },
                { accent: "bg-gradient-to-r from-fuchsia-500 to-transparent", rows: 2 },
              ].map(({ accent, rows }, si) => (
                <div key={si} className="rounded-2xl border border-white/8 bg-[#0f0f1a] overflow-hidden">
                  <div className={cn("h-0.5", accent)} />
                  <div className="p-5 sm:p-7">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
                    </div>
                    <div className={cn("grid gap-3", rows <= 2 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
                      {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-4 animate-pulse">
                          <div className="h-3.5 bg-white/5 rounded mb-2.5 w-full" />
                          <div className="h-3.5 bg-white/5 rounded w-4/5" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
