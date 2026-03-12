import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateHooksBody } from "@workspace/api-zod";

const router: IRouter = Router();

const PLACEHOLDER_HOOKS: Record<string, string[]> = {
  YouTube: [
    "I tried {topic} for 30 days and this happened...",
    "Nobody tells you this about {topic}",
    "The {topic} secret that experts don't want you to know",
    "I spent $10,000 on {topic} so you don't have to",
    "Watch this before you try {topic}",
    "Why 99% of people fail at {topic}",
    "The truth about {topic} that changed my life",
    "{topic}: What happens after 1 year?",
    "I exposed the biggest lie about {topic}",
    "How I went from zero to expert at {topic} in 6 months",
    "The {topic} method nobody talks about",
    "My biggest mistake with {topic} (and how to avoid it)",
    "Testing every {topic} hack so you don't have to",
    "This one {topic} trick will blow your mind",
    "Reacting to the worst {topic} advice on the internet",
  ],
  TikTok: [
    "POV: You finally try {topic} ✨",
    "Things nobody tells you about {topic} 👀",
    "This {topic} hack changed my life fr",
    "Wait for the {topic} reveal at the end...",
    "Tell me you're into {topic} without telling me",
    "The {topic} glow up is real 🔥",
    "{topic} but make it aesthetic ✨",
    "Replying to comments about {topic}",
    "Day in my life as someone obsessed with {topic}",
    "Rating every type of {topic} 1-10",
    "What they don't show you about {topic}",
    "I tried {topic} for a week — here's what happened",
    "Unpopular opinion: {topic} is actually overrated",
    "The {topic} trick that went viral for a reason",
    "Me explaining {topic} to my friends 😂",
  ],
  Instagram: [
    "The {topic} guide you never knew you needed 🙌",
    "Save this for your {topic} journey →",
    "Everything I wish I knew about {topic} before starting",
    "Swipe to see the {topic} transformation ➡️",
    "5 things that actually work for {topic}",
    "Why your {topic} isn't working (and how to fix it)",
    "The {topic} checklist you need to save ✅",
    "Honest review: Is {topic} worth the hype?",
    "The before and after of my {topic} experience",
    "Drop a 🔥 if you want my full {topic} guide",
    "{topic} tips that took me years to figure out",
    "The {topic} trend everyone is doing wrong",
    "A day in my life centered around {topic}",
    "What nobody posts about {topic} (the real side)",
    "Proof that {topic} works if you do it right",
  ],
};

function getPlaceholderHooks(topic: string, platform: string): string[] {
  const templates = PLACEHOLDER_HOOKS[platform] || PLACEHOLDER_HOOKS["YouTube"];
  return templates.map((h) => h.replace(/{topic}/g, topic));
}

router.post("/hooks/generate", async (req, res) => {
  const parseResult = GenerateHooksBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { topic, platform } = parseResult.data;

  try {
    const platformExamples: Record<string, string> = {
      YouTube: `Real viral YouTube titles for reference (notice the natural phrasing):
- I Tested 7 Sleep Hacks and One Actually Worked
- Why Rich People Buy Used Cars
- Nobody Told Me This Before I Quit My Job
- Buying a House at 22 Changed Everything
- We Tried the World's Hardest Diet for 30 Days`,
      TikTok: `Real viral TikTok openers for reference (notice how naturally they read aloud):
- Wait until you see what happened at the end
- Renting vs buying — I finally did the math
- Things nobody tells you about working from home
- Three things I stopped buying to save $800 a month
- My gym results after 90 days of actually being consistent`,
      Instagram: `Real viral Instagram caption openers for reference (notice the confident, direct tone):
- Nobody talks about the downside of passive income
- Here is what six figures actually feels like
- Stopped doing this one thing and everything changed
- Real estate agents hate this question — ask it anyway
- Most people quit right before it gets good`,
    };

    const systemPrompt = `You write viral hooks for ${platform} videos. Every hook you write reads like a natural, fluent English headline — the kind a real creator would actually publish. You never produce robotic, templated, or grammatically awkward phrasing.`;

    const prompt = `Write exactly 15 hooks for a ${platform} video about: ${topic}

${platformExamples[platform] ?? platformExamples["YouTube"]}

Write exactly 3 hooks of each style below (15 total):
- CONTRARIAN: Challenges a belief most viewers hold. States the uncomfortable opposite truth.
- CURIOSITY: Opens a gap the viewer must close. Teases an outcome without revealing it.
- BENEFIT-DRIVEN: States the exact payoff the viewer gets. Specific, urgent, zero fluff.
- BOLD STATEMENT: A fully committed claim. No hedging. Reads like a fact, not an opinion.
- SUSPENSE: Drops the viewer into a moment of tension or outcome. Never explains what happened.

OUTPUT RULES — every violation ruins the output:
- 6 to 12 words per hook. Never shorter, never longer.
- Natural spoken English only — read each hook aloud before including it
- No quotation marks anywhere
- No numbering, bullets, labels, or blank lines between hooks
- No awkward grammar, no AI-sounding phrasing, no passive voice
- No two hooks start with the same word
- Each hook must have a completely different structure and angle from every other
- Return only the 15 hooks, one per line, nothing else`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "";
    const hooks = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 15);

    if (hooks.length === 0) {
      const placeholders = getPlaceholderHooks(topic, platform);
      res.json({ hooks: placeholders, platform, topic });
      return;
    }

    res.json({ hooks, platform, topic });
  } catch (err) {
    console.error("OpenAI error, falling back to placeholders:", err);
    const placeholders = getPlaceholderHooks(topic, platform);
    res.json({ hooks: placeholders, platform, topic });
  }
});

export default router;
