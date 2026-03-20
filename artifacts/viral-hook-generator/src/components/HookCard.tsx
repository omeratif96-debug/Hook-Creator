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

const REACTIONS: { value: Reaction; emoji: string }[] = [
  { value: "yes", emoji: "👍" },
  { value: "a_little", emoji: "😐" },
  { value: "no", emoji: "👎" },
];

interface HookReactionsProps {
  hookText: string;
  topic?: string;
  platform?: string;
}

function HookReactions({ hookText, topic, platform }: HookReactionsProps) {
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const followUp = reaction === "yes" ? "What made this good?" : "What felt off?";

  const handleReact = (value: Reaction) => {
    setReaction(value);
    setComment("");
  };

  const handleSubmit = async () => {
    if (!reaction) return;
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reaction,
          comment: comment.trim() || undefined,
          favHook: hookText,
          topic: topic || undefined,
          platform: platform || undefined,
        }),
      });
    } catch {
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <span className="text-[11px] text-green-400/70 flex items-center gap-1">
        <Check size={10} /> Thanks
      </span>
    );
  }

  return (
    <div className="contents">
      {/* Reaction buttons */}
      <div className="flex items-center gap-0.5 ml-auto">
        {REACTIONS.map(({ value, emoji }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleReact(value)}
            title={value === "yes" ? "Good" : value === "a_little" ? "Okay" : "Bad"}
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-all duration-150 active:scale-90",
              reaction === value
                ? "bg-primary/20 scale-110"
                : "opacity-40 hover:opacity-100 hover:bg-white/8"
            )}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Inline follow-up */}
      <AnimatePresence>
        {reaction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden col-span-full w-full"
            style={{ gridColumn: "1 / -1" }}
          >
            <div className="pt-2.5 border-t border-white/6 flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder={followUp}
                autoFocus
                className="flex-1 min-w-0 px-2.5 py-1.5 text-xs text-white rounded-lg bg-white/5 border border-white/10 focus:border-primary/40 focus:ring-1 focus:ring-primary/10 outline-none transition-all placeholder:text-white/20"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/15 border border-primary/25 text-primary/80 hover:bg-primary/25 hover:text-primary transition-all disabled:opacity-40"
              >
                {submitting ? "…" : "Send"}
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
}

export function HookCard({
  index,
  text,
  onRemix,
  isRemixing,
  remixVariations = [],
  topic,
  platform,
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
      <div className="flex items-start gap-3 p-4">
        <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
          {index}
        </span>
        <p className="flex-1 text-sm text-white/80 leading-relaxed font-medium">
          {text}
        </p>
      </div>

      {/* Actions + reactions row */}
      <div className="flex flex-wrap items-center gap-2 px-4 pb-3 pt-0 border-t border-white/5 mt-auto">
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
            className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            {showVariations ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {remixVariations.length} variations
          </button>
        )}

        {/* Emoji reactions — right-aligned, inline follow-up below */}
        <HookReactions hookText={text} topic={topic} platform={platform} />
      </div>

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
