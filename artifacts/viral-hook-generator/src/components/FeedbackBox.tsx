import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

type Rating = "yes" | "a_little" | "no";

interface FeedbackBoxProps {
  topic: string;
  platform: string;
  onSubmitted?: () => void;
}

export const FeedbackBox = forwardRef<HTMLDivElement, FeedbackBoxProps>(
  function FeedbackBox({ topic, platform, onSubmitted }, ref) {
    const [rating, setRating] = useState<Rating | null>(null);
    const [detail, setDetail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const followUpPrompt =
      rating === "yes"
        ? "Nice — which hook did you like most?"
        : "What felt off?";

    const handleRate = (value: Rating) => {
      setRating(value);
      setDetail("");
    };

    const handleSubmit = async () => {
      if (!rating) return;
      setSubmitting(true);
      try {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating,
            comment: detail.trim() || undefined,
            topic: topic || undefined,
            platform: platform || undefined,
          }),
        });
      } catch {
      } finally {
        setSubmitting(false);
        setSubmitted(true);
        onSubmitted?.();
      }
    };

    const BUTTONS: { value: Rating; label: string }[] = [
      { value: "yes", label: "Yes" },
      { value: "a_little", label: "A bit" },
      { value: "no", label: "No" },
    ];

    return (
      <div ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4, ease: "easeOut" }}
          className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-5"
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 py-0.5"
              >
                <CheckCircle2 size={17} className="text-green-400 shrink-0" />
                <p className="text-sm text-white/65">
                  Thanks — this helps improve HookLab.
                </p>
              </motion.div>
            ) : (
              <motion.div key="form" exit={{ opacity: 0 }} className="space-y-4">
                {/* Question + buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <p className="text-sm font-semibold text-white/80 shrink-0">
                    Did these hooks help?
                  </p>
                  <div className="flex gap-2">
                    {BUTTONS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleRate(value)}
                        className={[
                          "flex-1 sm:flex-none min-w-[68px] px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 active:scale-95",
                          rating === value
                            ? "bg-primary/25 border-primary/60 text-primary shadow-[0_0_12px_rgba(139,92,246,0.15)]"
                            : "bg-white/6 border-white/12 text-white/55 hover:border-white/25 hover:text-white/80",
                        ].join(" ")}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Follow-up — expands after rating */}
                <AnimatePresence>
                  {rating && (
                    <motion.div
                      key={rating}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="overflow-hidden space-y-3"
                    >
                      <p className="text-xs text-white/45">{followUpPrompt}</p>
                      <input
                        type="text"
                        value={detail}
                        onChange={(e) => setDetail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        placeholder="Optional — skip to submit"
                        autoFocus
                        className="w-full px-3.5 py-2.5 text-sm text-white rounded-xl bg-white/5 border border-white/12 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-white/20"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="px-5 py-2 text-xs font-semibold rounded-lg bg-primary/15 border border-primary/30 text-primary/80 hover:bg-primary/25 hover:text-primary transition-all disabled:opacity-40"
                        >
                          {submitting ? "Sending…" : "Submit"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }
);
