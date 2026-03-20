import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

type Rating = "yes" | "a_little" | "no";

interface FeedbackBoxProps {
  topic: string;
  platform: string;
}

export function FeedbackBox({ topic, platform }: FeedbackBoxProps) {
  const [rating, setRating] = useState<Rating | null>(null);
  const [comment, setComment] = useState("");
  const [favHook, setFavHook] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || undefined,
          favHook: favHook.trim() || undefined,
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

  const RATING_BUTTONS: { value: Rating; label: string }[] = [
    { value: "yes", label: "Yes" },
    { value: "a_little", label: "A little" },
    { value: "no", label: "No" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
      className="rounded-xl border border-white/8 bg-white/[0.025] px-5 py-5"
    >
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 py-1"
          >
            <CheckCircle2 size={18} className="text-green-400 shrink-0" />
            <p className="text-sm text-white/60">
              Thanks — your feedback helps improve HookLab.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Heading + rating buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-sm font-semibold text-white/70 shrink-0">
                Was this useful?
              </p>
              <div className="flex gap-2">
                {RATING_BUTTONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={[
                      "px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150",
                      rating === value
                        ? "bg-primary/20 border-primary/50 text-primary"
                        : "bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white/70",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional inputs — only shown after a rating is picked */}
            <AnimatePresence>
              {rating && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3 overflow-hidden"
                >
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What felt good or bad?"
                    rows={2}
                    className="w-full px-3.5 py-2.5 text-sm text-white rounded-xl bg-white/4 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none placeholder:text-white/20 leading-relaxed"
                  />
                  <input
                    type="text"
                    value={favHook}
                    onChange={(e) => setFavHook(e.target.value)}
                    placeholder="Which hook did you like most?"
                    className="w-full px-3.5 py-2.5 text-sm text-white rounded-xl bg-white/4 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-white/20"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/8 border border-white/12 text-white/70 hover:bg-white/12 hover:text-white transition-all disabled:opacity-40"
                    >
                      {submitting ? "Sending…" : "Send feedback"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
