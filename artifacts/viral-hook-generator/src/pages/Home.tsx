import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clipboard, Loader2, Play } from "lucide-react";
import { PlatformToggle } from "@/components/PlatformToggle";
import { HookCard } from "@/components/HookCard";
import { useViralHooks } from "@/hooks/use-viral-hooks";
import { useToast } from "@/hooks/use-toast";
import type { GenerateHooksRequestPlatform } from "@workspace/api-client-react";

export default function Home() {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const { mutate, isPending, hooks, platform, setPlatform } = useViralHooks();
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic or idea first.",
        variant: "destructive"
      });
      return;
    }
    
    mutate(
      { data: { topic, platform } },
      {
        onSettled: () => {
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }
      }
    );
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(hooks.join("\n\n"));
    toast({
      title: "Copied all hooks!",
      description: "Ready to paste into your script or notes.",
    });
  };

  return (
    <div className="min-h-screen relative w-full pb-24">
      {/* Abstract Background Effect */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={`${import.meta.env.BASE_URL}images/gradient-bg.png`}
          alt="Vibrant Background"
          className="w-full h-full object-cover opacity-60 mix-blend-multiply dark:mix-blend-screen"
        />
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[120px]" />
      </div>

      <main className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 lg:pt-32">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold mb-6 border border-primary/20 shadow-sm"
          >
            <Sparkles size={16} />
            <span>AI-Powered Creator Tool</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold text-foreground mb-6 leading-tight tracking-tight"
          >
            Generate Viral Hooks for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-500">YouTube, TikTok & Instagram</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-xl text-muted-foreground font-medium"
          >
            Turn any video idea into scroll-stopping hooks in seconds.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="text-base text-muted-foreground/70"
          >
            Perfect for creators, marketers, podcasts, real estate pages, and faceless channels.
          </motion.p>
        </div>

        {/* Try it free label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
          className="flex justify-center"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/30">
            ✦ Try it free now
          </span>
        </motion.div>

        {/* Input Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="max-w-3xl mx-auto bg-card/60 backdrop-blur-2xl border-2 border-white/20 dark:border-white/10 shadow-2xl shadow-black/5 rounded-[2rem] p-6 sm:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label htmlFor="topic" className="block text-lg font-bold text-foreground font-display">
                What's your video about?
              </label>
              <textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Example: Porsche Cayenne Turbo review, real estate investment tips, or kids learning colors"
                className="w-full min-h-[160px] p-6 text-lg rounded-2xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all resize-none shadow-inner placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-lg font-bold text-foreground font-display">
                Select Platform
              </label>
              <PlatformToggle 
                value={platform} 
                onChange={(v) => setPlatform(v as GenerateHooksRequestPlatform)} 
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full relative group overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-pink-500 transition-transform duration-500 group-hover:scale-105 group-active:scale-95" />
              <div className="relative flex items-center justify-center gap-3 py-5 px-8 text-white font-bold text-xl shadow-xl shadow-primary/30 group-active:translate-y-1 transition-all">
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    <span>Brainstorming magic...</span>
                  </>
                ) : (
                  <>
                    <Play fill="currentColor" size={20} />
                    <span>Generate Hooks</span>
                  </>
                )}
              </div>
            </button>
          </form>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {hooks.length > 0 && (
            <motion.div 
              ref={resultsRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-24 pt-12 border-t-2 border-border/50"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
                <div>
                  <h2 className="text-3xl font-display font-bold text-foreground">
                    Your {platform} Hooks
                  </h2>
                  <p className="text-muted-foreground mt-2 font-medium">
                    Here are 15 scroll-stopping ideas for your next video.
                  </p>
                </div>
                
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-2 px-6 py-3 bg-card hover:bg-primary hover:text-primary-foreground text-foreground border-2 border-border hover:border-primary shadow-sm hover:shadow-md rounded-xl font-bold transition-all duration-300 active:scale-95 whitespace-nowrap"
                >
                  <Clipboard size={20} />
                  Copy All
                </button>
              </div>

              <motion.div 
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              >
                {hooks.map((hook, index) => (
                  <HookCard key={index} index={index + 1} text={hook} />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
