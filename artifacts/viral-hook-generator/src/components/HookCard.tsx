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

interface HookCardProps {
  index: number;
  text: string;
  onRemix?: () => void;
  isRemixing?: boolean;
  remixVariations?: string[];
}

export function HookCard({ index, text, onRemix, isRemixing, remixVariations = [] }: HookCardProps) {
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

      <div className="flex items-center gap-2 px-4 pb-3 pt-0 border-t border-white/5 mt-auto">
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
