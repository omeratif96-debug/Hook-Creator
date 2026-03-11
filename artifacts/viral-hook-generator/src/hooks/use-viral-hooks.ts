import { useState } from "react";
import { useGenerateHooks } from "@workspace/api-client-react";
import type { GenerateHooksRequestPlatform } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const PLACEHOLDER_HOOKS = [
  "Stop scrolling! If you care about your future, you need to see this.",
  "I tried the viral hack so you don't have to.",
  "Are you making this HUGE mistake right now?",
  "The secret nobody is talking about.",
  "Top 3 reasons why you're not seeing results.",
  "How I achieved my goal in just 24 hours.",
  "Don't buy anything until you watch this video.",
  "This tip feels illegal to know.",
  "What the experts won't tell you.",
  "The ultimate beginner's guide you've been waiting for.",
  "I spent 100 hours researching this so you don't have to.",
  "Watch this before you make your next move.",
  "My top 5 favorite tools that changed everything.",
  "The harsh truth you need to hear today.",
  "How to level up your game instantly."
];

export function useViralHooks() {
  const { toast } = useToast();
  const [hooks, setHooks] = useState<string[]>([]);
  const [platform, setPlatform] = useState<GenerateHooksRequestPlatform>("TikTok");

  const mutation = useGenerateHooks({
    mutation: {
      onSuccess: (data) => {
        setHooks(data.hooks);
        toast({
          title: "Success! 🎉",
          description: `Generated 15 viral hooks for ${data.platform}.`,
        });
      },
      onError: (error) => {
        console.warn("API failed, using placeholders", error);
        toast({
          title: "Using Sample Data",
          description: "API connection failed. Displaying placeholder hooks instead.",
          variant: "destructive",
        });
        setHooks(PLACEHOLDER_HOOKS);
      }
    }
  });

  return {
    ...mutation,
    hooks,
    platform,
    setPlatform,
    setHooks
  };
}
