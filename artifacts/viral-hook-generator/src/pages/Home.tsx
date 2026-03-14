import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clipboard, Loader2, Play, Check, RefreshCw } from "lucide-react";
import { PlatformToggle } from "@/components/PlatformToggle";
import { HookCard, TextCard, IntroCard } from "@/components/HookCard";
import { useViralHooks } from "@/hooks/use-viral-hooks";
import { useToast } from "@/hooks/use-toast";
import type { Platform, ContentAngle } from "@/hooks/use-viral-hooks";
import type { GenerateHooksRequestPlatform } from "@workspace/api-client-react";

const CONTENT_ANGLES: { value: ContentAngle; label: string }[] = [
  { value: "Review", label: "Review" },
  { value: "Educational", label: "Educational" },
  { value: "Storytelling", label: "Storytelling" },
  { value: "Controversial", label: "Controversial" },
  { value: "Comparison", label: "Comparison" },
  { value: "Listicle", label: "Listicle" },
  { value: "Inspirational", label: "Inspirational" },
];

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
    toast({ title: `${label} copied!`, description: "Ready to paste." });
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className={
        variant === "accent"
          ? "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-all duration-200 active:scale-95"
          : "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all duration-200 active:scale-95"
      }
    >
      {copied ? <Check size={14} /> : <Clipboard size={14} />}
      {copied ? "Copied!" : label}
    </button>
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

  // Remix state
  const [remixMap, setRemixMap] = useState<Map<string, string[]>>(new Map());
  const [remixingSet, setRemixingSet] = useState<Set<string>>(new Set());

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
      toast({
        title: "Remix failed",
        description: "Couldn't generate variations. Try again.",
        variant: "destructive",
      });
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
      toast({
        title: "Topic required",
        description: "Please enter a topic or idea first.",
        variant: "destructive",
      });
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
    <div className="min-h-screen relative w-full pb-24">
      {/* Dark gradient background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#1a0e2e] to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-indigo-900/15 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 lg:pt-32">

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary font-semibold mb-6 border border-primary/25 shadow-sm"
          >
            <Sparkles size={15} />
            <span>AI-Powered Creator Tool</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-foreground mb-5 leading-tight tracking-tight"
          >
            Generate Viral YouTube{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">
              Hooks, Titles & Intro Scripts
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-lg text-muted-foreground font-medium mb-2"
          >
            Turn any video idea into scroll-stopping hooks, clickable titles, and engaging opening lines in seconds.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm text-muted-foreground/55"
          >
            Perfect for YouTubers, faceless channels, educators, reviewers, and marketers.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="text-xs text-primary/60 mt-3 tracking-wide font-medium"
          >
            Used by creators to generate scroll-stopping YouTube hooks in seconds.
          </motion.p>
        </div>

        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-3xl mx-auto bg-card/70 backdrop-blur-2xl border border-white/8 shadow-2xl shadow-black/40 rounded-2xl p-6 sm:p-8 mb-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Topic */}
            <div className="space-y-2">
              <label htmlFor="topic" className="block text-sm font-bold text-foreground/90 uppercase tracking-wider">
                What&apos;s your video about?
              </label>
              <textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Example: Porsche Cayenne Turbo review, kids learning colors, real estate investing tips, or how to grow on YouTube."
                className="w-full min-h-[120px] p-4 text-base rounded-xl bg-background/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground/40 text-foreground"
              />
            </div>

            {/* Platform + Angle row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-foreground/90 uppercase tracking-wider">
                  Platform
                </label>
                <PlatformToggle
                  value={platform}
                  onChange={(v) => setPlatform(v as GenerateHooksRequestPlatform)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="angle" className="block text-sm font-bold text-foreground/90 uppercase tracking-wider">
                  Content Angle
                </label>
                <select
                  id="angle"
                  value={contentAngle}
                  onChange={(e) => setContentAngle(e.target.value as ContentAngle)}
                  className="w-full h-full min-h-[52px] px-4 py-3 text-base rounded-xl bg-background/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground appearance-none cursor-pointer"
                >
                  {CONTENT_ANGLES.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full relative group overflow-hidden rounded-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-violet-500 to-indigo-500 transition-transform duration-500 group-hover:scale-105 group-active:scale-95" />
              <div className="relative flex items-center justify-center gap-3 py-4 px-8 text-white font-bold text-lg shadow-xl shadow-primary/30 group-active:translate-y-0.5 transition-all">
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    <span>Generating content…</span>
                  </>
                ) : (
                  <>
                    <Play fill="currentColor" size={18} />
                    <span>Generate Content</span>
                  </>
                )}
              </div>
            </button>
          </form>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {hasResults && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16 space-y-10"
            >

              {/* ── Hooks ────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-card/40 border border-white/6 rounded-2xl p-6 sm:p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                      <span>🎣</span> Viral Hooks
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Short, punchy, curiosity-driven — built to stop the scroll.
                    </p>
                  </div>
                  <CopyAllButton label="Copy All Hooks" text={hooks.join("\n\n")} />
                </div>
                <motion.div
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
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
              </motion.div>

              {/* ── Titles ───────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="bg-card/40 border border-white/6 rounded-2xl p-6 sm:p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                      <span>📝</span> YouTube Titles
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Clickable, title-cased, built for high CTR.
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <CopyAllButton label="Copy All Titles" text={titles.join("\n\n")} />
                    <CopyAllButton
                      label="Copy as Title Case"
                      text={titles.map(toTitleCase).join("\n")}
                      variant="accent"
                    />
                  </div>
                </div>
                <motion.div
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {titles.map((title, i) => (
                    <TextCard key={i} index={i + 1} text={title} />
                  ))}
                </motion.div>
              </motion.div>

              {/* ── Intro Scripts ─────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card/40 border border-white/6 rounded-2xl p-6 sm:p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                      <span>🎬</span> Intro Script Ideas
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Opening lines that hook your viewer in the first 5 seconds.
                    </p>
                  </div>
                  <CopyAllButton label="Copy All Intros" text={introScripts.join("\n\n")} />
                </div>
                <motion.div
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 gap-3"
                >
                  {introScripts.map((script, i) => (
                    <IntroCard key={i} index={i + 1} text={script} />
                  ))}
                </motion.div>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeleton */}
        <AnimatePresence>
          {isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-16 space-y-10"
            >
              {[{ label: "🎣 Viral Hooks", rows: 4 }, { label: "📝 YouTube Titles", rows: 4 }, { label: "🎬 Intro Script Ideas", rows: 2 }].map(({ label, rows }) => (
                <div key={label} className="bg-card/40 border border-white/6 rounded-2xl p-6 sm:p-8">
                  <div className="h-6 w-48 bg-white/5 rounded-lg mb-6 animate-pulse" />
                  <div className={`grid grid-cols-1 ${rows <= 2 ? "" : "sm:grid-cols-2"} gap-3`}>
                    {Array.from({ length: rows }).map((_, i) => (
                      <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                        <div className="h-4 bg-white/5 rounded mb-2 w-full" />
                        <div className="h-4 bg-white/5 rounded w-2/3" />
                      </div>
                    ))}
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
