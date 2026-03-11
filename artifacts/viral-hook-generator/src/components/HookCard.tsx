import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface HookCardProps {
  index: number;
  text: string;
}

export function HookCard({ index, text }: HookCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className={cn(
        "relative bg-card/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl shadow-black/5",
        "border-2 border-border hover:border-primary/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
      )}
    >
      <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold font-display shadow-lg shadow-primary/20 rotate-[-6deg] group-hover:rotate-0 transition-transform duration-300">
        {index}
      </div>
      
      <p className="text-foreground font-medium text-lg leading-relaxed pt-2">
        "{text}"
      </p>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200",
            copied 
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
              : "bg-primary/10 text-primary hover:bg-primary/20 active:scale-95"
          )}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </motion.div>
  );
}
