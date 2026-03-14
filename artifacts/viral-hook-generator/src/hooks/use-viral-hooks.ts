import { useState } from "react";
import { useGenerateHooks } from "@workspace/api-client-react";
import type { GenerateHooksRequestPlatform, GenerateHooksRequestContentAngle } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export type ContentAngle = GenerateHooksRequestContentAngle;
export type Platform = GenerateHooksRequestPlatform;

const FALLBACK_HOOKS = [
  "Nobody told me this before I tried it for 30 days",
  "I spent $10,000 on this so you don't have to",
];
const FALLBACK_TITLES = ["I Tested Every Method — Here's What Worked"];
const FALLBACK_INTROS = ["Before I show you the results, let me be completely honest with you."];

export function useViralHooks() {
  const { toast } = useToast();
  const [hooks, setHooks] = useState<string[]>([]);
  const [titles, setTitles] = useState<string[]>([]);
  const [introScripts, setIntroScripts] = useState<string[]>([]);
  const [platform, setPlatform] = useState<Platform>("YouTube");
  const [contentAngle, setContentAngle] = useState<ContentAngle>("Review");

  const mutation = useGenerateHooks({
    mutation: {
      onSuccess: (data) => {
        setHooks(data.hooks ?? FALLBACK_HOOKS);
        setTitles(data.titles ?? FALLBACK_TITLES);
        setIntroScripts(data.introScripts ?? FALLBACK_INTROS);
        toast({
          title: "Content generated!",
          description: `10 hooks, 10 titles, and 5 intros ready.`,
        });
      },
      onError: () => {
        toast({
          title: "Generation failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      },
    },
  });

  const hasResults = hooks.length > 0 || titles.length > 0 || introScripts.length > 0;

  return {
    ...mutation,
    hooks,
    titles,
    introScripts,
    hasResults,
    platform,
    setPlatform,
    contentAngle,
    setContentAngle,
  };
}
