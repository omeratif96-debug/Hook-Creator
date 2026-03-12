import { useState } from "react";
import { useGenerateHooks } from "@workspace/api-client-react";
import type { GenerateHooksRequestPlatform, HookCategory } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const PLACEHOLDER_CATEGORIES: HookCategory[] = [
  { name: "Curiosity Hooks", hooks: [
    "The secret to this nobody is willing to say out loud",
    "What actually happens after one year of doing this",
    "Why everything you know about this is backwards",
  ]},
  { name: "Contrarian Hooks", hooks: [
    "Stop wasting money on this — here is why",
    "Every expert got this one thing completely wrong",
    "The popular advice that quietly ruined my results",
  ]},
  { name: "Benefit Hooks", hooks: [
    "Master this skill in a weekend with one method",
    "One change that doubled my results overnight",
    "Save hours every week by doing this differently",
  ]},
  { name: "Story Hooks", hooks: [
    "By the time I figured this out I had lost thousands",
    "My first month doing this almost broke me",
    "I was embarrassed until this one thing happened",
  ]},
  { name: "Bold Statement Hooks", hooks: [
    "This is the single best skill you can build right now",
    "Nothing changed my life faster than learning this",
    "Most people will never get good at this — here is why",
  ]},
];

export function useViralHooks() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<HookCategory[]>([]);
  const [platform, setPlatform] = useState<GenerateHooksRequestPlatform>("TikTok");

  const hooks = categories.flatMap((c) => c.hooks);

  const mutation = useGenerateHooks({
    mutation: {
      onSuccess: (data) => {
        setCategories(data.categories ?? []);
        toast({
          title: "Hooks generated!",
          description: `15 ${data.platform} hooks across 5 categories.`,
        });
      },
      onError: (error) => {
        console.warn("API failed, using placeholders", error);
        toast({
          title: "Using sample hooks",
          description: "Couldn't reach the API. Showing sample hooks instead.",
          variant: "destructive",
        });
        setCategories(PLACEHOLDER_CATEGORIES);
      },
    },
  });

  return {
    ...mutation,
    hooks,
    categories,
    platform,
    setPlatform,
  };
}
