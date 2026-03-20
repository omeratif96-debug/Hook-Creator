import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

function SmallCopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={handle}
      title="Copy"
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95",
        copied
          ? "bg-green-500/15 text-green-400"
          : "bg-white/5 text-white/40 hover:bg-primary/15 hover:text-primary border border-white/8",
        className
      )}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

type Reaction = "yes" | "a_little" | "no";

const REACTION_META: Record<Reaction, { emoji: string; confirm: string; followUp: string }> = {
  yes:      { emoji: "👍", confirm: "Nice — this one works 👍",          followUp: "What made this good?" },
  a_little: { emoji: "😐", confirm: "Good to know 😐",                   followUp: "What felt off?" },
  no:       { emoji: "👎", confirm: "Helpful — thanks for being honest", followUp: "What felt off?" },
};

const REACTIONS = (["yes", "a_little", "no"] as Reaction[]);

interface HookReactionsProps {
  hookText: string;
  topic?: string;
  platform?: string;
  onRated?: () => void;
}

function HookReactions({ hookText, topic, platform, onRated }: HookReactionsProps) {
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const meta = reaction ? REACTION_META[reaction] : null;

  const handleReact = (value: Reaction) => {
    setReaction(value);
    setComment("");
  };

  const submit = async (withComment: boolean) => {
    if (!reaction) return;
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reaction,
          comment: withComment && comment.trim() ? comment.trim() : undefined,
          favHook: hookText,
          topic: topic || undefined,
          platform: platform || undefined,
        }),
      });
    } catch {
    } finally {
      setSubmitting(false);
      setDone(true);
      onRated?.();
    }
  };

  return (
    <div className="px-4 pb-3 border-t border-white/5">
      <AnimatePresence mode="wait">
        {done ? (
          /* ── Done state ── */
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-1.5 py-2"
          >
            <Check size={11} className="text-green-400" />
            <span className="text-[11px] text-green-400/80">Thanks for rating this</span>
          </motion.div>
        ) : !reaction ? (
          /* ── Initial: centered reaction buttons ── */
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="flex items-center justify-center gap-3 pt-3"
          >
            {REACTIONS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleReact(value)}
                className="group flex flex-col items-center gap-1 transition-all duration-150 active:scale-90"
              >
                <span className="w-10 h-10 flex items-center justify-center text-xl rounded-xl bg-white/5 border border-white/8 group-hover:bg-primary/10 group-hover:border-primary/25 group-hover:scale-110 transition-all duration-150">
                  {REACTION_META[value].emoji}
                </span>
              </button>
            ))}
          </motion.div>
        ) : (
          /* ── After reaction: confirmation + follow-up ── */
          <motion.div
            key="followup"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pt-3 space-y-2.5"
          >
            {/* Selected reaction + confirmation */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReaction(null)}
                className="w-8 h-8 flex items-center justify-center text-lg rounded-lg bg-primary/15 border border-primary/30 scale-105"
              >
                {meta!.emoji}
              </button>
              <span className="text-xs text-white/55">{meta!.confirm}</span>
            </div>

            {/* Optional follow-up input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit(true)}
                placeholder={meta!.followUp}
                autoFocus
                className="flex-1 min-w-0 px-2.5 py-1.5 text-xs text-white rounded-lg bg-white/5 border border-white/10 focus:border-primary/40 focus:ring-1 focus:ring-primary/10 outline-none transition-all placeholder:text-white/20"
              />
              <button
                type="button"
                onClick={() => submit(true)}
                disabled={submitting}
                className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/15 border border-primary/25 text-primary/80 hover:bg-primary/25 hover:text-primary transition-all disabled:opacity-40"
              >
                {submitting ? "…" : "Send"}
              </button>
              <button
                type="button"
                onClick={() => submit(false)}
                disabled={submitting}
                className="shrink-0 px-2.5 py-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Skip
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface HookCardProps {
  index: number;
  text: string;
  onRemix?: () => void;
  isRemixing?: boolean;
  remixVariations?: string[];
  topic?: string;
  platform?: string;
  onRated?: () => void;
}

export function HookCard({
  index,
  text,
  onRemix,
  isRemixing,
  remixVariations = [],
  topic,
  platform,
  onRated,
}: HookCardProps) {
  const [showVariations, setShowVariations] = useState(false);
  const hasVariations = remixVariations.length > 0;

  const handleRemix = () => {
    onRemix?.();
    setShowVariations(true);
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
      className="group relative flex flex-col rounded-xl border border-white/8 bg-white/[0.03] hover:border-primary/30 hover:bg-primary/[0.04] transition-all duration-200"
    >
      {/* Hook text */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
          {index}
        </span>
        <p className="flex-1 text-sm text-white/80 leading-relaxed font-medium">
          {text}
        </p>
      </div>

      {/* Emoji reactions — centered, directly under text */}
      <HookReactions hookText={text} topic={topic} platform={platform} onRated={onRated} />

      {/* Actions bar */}
      <div className="flex items-center gap-2 px-4 pb-3 pt-2 border-t border-white/5">
        <SmallCopyButton text={text} />
        {onRemix && (
          <button
            onClick={handleRemix}
            disabled={isRemixing}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95 border",
              isRemixing
                ? "bg-white/5 text-white/25 border-white/5 cursor-not-allowed"
                : "bg-white/5 text-white/40 border-white/8 hover:bg-indigo-500/15 hover:text-indigo-400 hover:border-indigo-500/20"
            )}
          >
            <RefreshCw size={11} className={isRemixing ? "animate-spin" : ""} />
            {isRemixing ? "Remixing…" : "Remix"}
          </button>
        )}
        {hasVariations && (
          <button
            onClick={() => setShowVariations((v) => !v)}
            className="ml-auto flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            {showVariations ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {remixVariations.length} variations
          </button>
        )}
      </div>

      {/* Remix variations */}
      <AnimatePresence>
        {showVariations && hasVariations && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/6 pt-3 space-y-2">
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2.5">
                Variations
              </p>
              {remixVariations.map((v, i) => (
                <div key={i} className="flex items-start gap-2.5 group/var">
                  <span className="text-[10px] text-white/20 font-mono mt-1 w-3 flex-shrink-0">{i + 1}</span>
                  <p className="text-xs text-white/60 flex-1 leading-relaxed">{v}</p>
                  <SmallCopyButton text={v} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function TextCard({ index, text }: { index: number; text: string }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
      className="group flex flex-col rounded-xl border border-white/8 bg-white/[0.03] hover:border-indigo-500/30 hover:bg-indigo-500/[0.04] transition-all duration-200"
    >
      <div className="flex items-start gap-3 p-4">
        <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center">
          {index}
        </span>
        <p className="flex-1 text-sm text-white/80 leading-relaxed font-medium">
          {text}
        </p>
      </div>
      <div className="px-4 pb-3 border-t border-white/5 mt-auto">
        <SmallCopyButton text={text} className="mt-2" />
      </div>
    </motion.div>
  );
}

export function IntroCard({ index, text }: { index: number; text: string }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
      className="group flex flex-col rounded-xl border border-white/8 bg-white/[0.03] hover:border-fuchsia-500/30 hover:bg-fuchsia-500/[0.03] transition-all duration-200"
    >
      <div className="flex items-start gap-3 p-4">
        <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-400 text-[10px] font-bold flex items-center justify-center">
          {index}
        </span>
        <p className="flex-1 text-sm text-white/75 leading-relaxed">
          {text}
        </p>
      </div>
      <div className="px-4 pb-3 border-t border-white/5 mt-auto">
        <SmallCopyButton text={text} className="mt-2" />
      </div>
    </motion.div>
  );
}
