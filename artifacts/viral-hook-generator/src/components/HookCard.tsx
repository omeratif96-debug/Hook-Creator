import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface HookCardProps {
  index: number;
  text: string;
  onRemix?: () => void;
  isRemixing?: boolean;
  remixVariations?: string[];
}

function SmallCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={handle}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
        copied
          ? "bg-green-500/20 text-green-400"
          : "bg-white/5 text-muted-foreground hover:bg-primary/20 hover:text-primary"
      )}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function HookCard({ index, text, onRemix, isRemixing, remixVariations = [] }: HookCardProps) {
  const [showVariations, setShowVariations] = useState(false);

  const handleRemix = () => {
    onRemix?.();
    setShowVariations(true);
  };

  const hasVariations = remixVariations.length > 0;

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      className="group relative bg-card border border-border hover:border-primary/40 rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className="flex-shrink-0 w-6 h-6 rounded-md bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
          {index}
        </span>
        <p className="flex-1 text-foreground font-medium leading-relaxed text-sm">
          {text}
        </p>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <SmallCopyButton text={text} />
        {onRemix && (
          <button
            onClick={handleRemix}
            disabled={isRemixing}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
              isRemixing
                ? "bg-primary/10 text-primary/50 cursor-not-allowed"
                : "bg-white/5 text-muted-foreground hover:bg-indigo-500/20 hover:text-indigo-400"
            )}
          >
            <RefreshCw size={12} className={isRemixing ? "animate-spin" : ""} />
            {isRemixing ? "Remixing…" : "Remix"}
          </button>
        )}
        {hasVariations && (
          <button
            onClick={() => setShowVariations((v) => !v)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showVariations ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {remixVariations.length} variations
          </button>
        )}
      </div>

      <AnimatePresence>
        {showVariations && hasVariations && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border/60 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                More variations for this hook
              </p>
              {remixVariations.map((v, i) => (
                <div key={i} className="flex items-start gap-2 group/var">
                  <span className="text-xs text-muted-foreground/50 font-mono mt-0.5 w-4 flex-shrink-0">{i + 1}</span>
                  <p className="text-sm text-foreground/80 flex-1 leading-relaxed">{v}</p>
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
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      className="group relative bg-card border border-border hover:border-primary/40 rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className="flex-shrink-0 w-6 h-6 rounded-md bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
          {index}
        </span>
        <p className="flex-1 text-foreground font-medium leading-relaxed text-sm">
          {text}
        </p>
      </div>
      <div className="flex justify-end">
        <SmallCopyButton text={text} />
      </div>
    </motion.div>
  );
}

export function IntroCard({ index, text }: { index: number; text: string }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      className="group relative bg-card border border-border hover:border-primary/40 rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 w-6 h-6 rounded-md bg-indigo-500/15 text-indigo-400 text-xs font-bold flex items-center justify-center">
          {index}
        </span>
        <p className="flex-1 text-foreground/90 leading-relaxed text-sm">
          {text}
        </p>
      </div>
      <div className="flex justify-end">
        <SmallCopyButton text={text} />
      </div>
    </motion.div>
  );
}
