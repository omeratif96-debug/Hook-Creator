import { motion } from "framer-motion";
import { Youtube, Instagram, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GenerateHooksRequestPlatform } from "@workspace/api-client-react";

const platforms = [
  { id: "TikTok", icon: Music2, color: "group-hover:text-[#00f2fe]" },
  { id: "Instagram", icon: Instagram, color: "group-hover:text-[#E1306C]" },
  { id: "YouTube", icon: Youtube, color: "group-hover:text-[#FF0000]" },
] as const;

interface PlatformToggleProps {
  value: GenerateHooksRequestPlatform;
  onChange: (value: GenerateHooksRequestPlatform) => void;
}

export function PlatformToggle({ value, onChange }: PlatformToggleProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {platforms.map((p) => {
        const isSelected = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id as GenerateHooksRequestPlatform)}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 group overflow-hidden focus:outline-none focus:ring-4 focus:ring-primary/20",
              isSelected
                ? "text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
                : "bg-card text-muted-foreground border-2 border-border hover:border-primary/30 hover:bg-primary/5 hover:-translate-y-0.5"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="active-platform"
                className="absolute inset-0 bg-gradient-to-br from-primary to-primary/90 z-0"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <p.icon className={cn("w-5 h-5 transition-colors duration-300", !isSelected && p.color)} />
              {p.id}
            </span>
          </button>
        );
      })}
    </div>
  );
}
