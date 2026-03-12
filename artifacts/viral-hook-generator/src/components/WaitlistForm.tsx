import { useState } from "react";
import { Loader2, CheckCircle2, Mail } from "lucide-react";
import { useJoinWaitlist } from "@workspace/api-client-react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [error, setError] = useState("");

  const mutation = useJoinWaitlist({
    mutation: {
      onSuccess: (data) => {
        setSubmitted(true);
        setAlreadyJoined(data.alreadyJoined);
      },
      onError: () => {
        setError("Something went wrong. Please try again.");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    mutation.mutate({ data: { email } });
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <CheckCircle2 size={32} className="text-green-500" />
        <p className="font-semibold text-foreground text-base">
          {alreadyJoined ? "You're already on the list!" : "You're on the list!"}
        </p>
        <p className="text-sm text-muted-foreground">
          We'll reach out when premium access opens.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 pt-2">
      <p className="font-semibold text-foreground text-base">
        Want unlimited hooks?
      </p>
      <p className="text-sm text-muted-foreground">
        Join the waitlist for premium access.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            data-testid="input-waitlist-email"
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 whitespace-nowrap"
          data-testid="button-waitlist-submit"
        >
          {mutation.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Join Waitlist"
          )}
        </button>
      </form>
      {error && (
        <p className="text-sm text-destructive text-left">{error}</p>
      )}
    </div>
  );
}
