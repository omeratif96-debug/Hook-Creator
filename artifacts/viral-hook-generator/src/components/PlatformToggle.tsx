import { motion } from "framer-motion";
import { Youtube, Instagram, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GenerateHooksRequestPlatform } from "@workspace/api-client-react";

const platforms = [
  { id: "YouTube", icon: Youtube, activeColor: "from-red-500/80 to-red-600/80", iconColor: "text-red-400" },
  { id: "TikTok",  icon: Music2,   activeColor: "from-cyan-500/80 to-sky-600/80",  iconColor: "text-cyan-400" },
  { id: "Instagram", icon: Instagram, activeColor: "from-pink-500/80 to-rose-600/80", iconColor: "text-pink-400" },
] as const;

interface PlatformToggleProps {
  value: GenerateHooksRequestPlatform;
  onChange: (value: GenerateHooksRequestPlatform) => void;
}

export function PlatformToggle({ value, onChange }: PlatformToggleProps) {
  return (
    <div className="flex gap-2 w-full">
      {platforms.map((p) => {
        const isSelected = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id as GenerateHooksRequestPlatform)}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all duration-200 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              isSelected
                ? "text-white shadow-md"
                : "bg-white/5 text-white/40 border border-white/8 hover:bg-white/8 hover:text-white/70"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="active-platform"
                className={cn("absolute inset-0 bg-gradient-to-br opacity-90", p.activeColor)}
                initial={false}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <p.icon
                size={15}
                className={cn(
                  "transition-colors duration-200",
                  isSelected ? "text-white" : p.iconColor
                )}
              />
              {p.id}
            </span>
          </button>
        );
      })}
    </div>
  );
}
