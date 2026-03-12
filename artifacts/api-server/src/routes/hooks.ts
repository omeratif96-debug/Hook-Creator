import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateHooksBody } from "@workspace/api-zod";

const router: IRouter = Router();

const CATEGORY_NAMES = [
  "Curiosity Hooks",
  "Contrarian Hooks",
  "Benefit Hooks",
  "Story Hooks",
  "Bold Statement Hooks",
];

const PLACEHOLDER_CATEGORIES: Record<string, { name: string; hooks: string[] }[]> = {
  YouTube: [
    { name: "Curiosity Hooks", hooks: [
      "The {topic} secret nobody is willing to say out loud",
      "What actually happens after one year of {topic}",
      "Why everything you know about {topic} is backwards",
    ]},
    { name: "Contrarian Hooks", hooks: [
      "Stop wasting money on {topic} — here is why",
      "Every expert on {topic} got this completely wrong",
      "The popular {topic} advice that ruined my results",
    ]},
    { name: "Benefit Hooks", hooks: [
      "Master {topic} in a weekend with this method",
      "One change that doubled my {topic} results overnight",
      "Save hours every week by doing {topic} this way",
    ]},
    { name: "Story Hooks", hooks: [
      "By the time I figured out {topic} I had lost thousands",
      "My first month doing {topic} almost broke me",
      "I was embarrassed by my {topic} until this happened",
    ]},
    { name: "Bold Statement Hooks", hooks: [
      "{topic} is the single best skill you can build right now",
      "Nothing changed my life faster than learning {topic}",
      "Most people will never get good at {topic} — here is why",
    ]},
  ],
  TikTok: [
    { name: "Curiosity Hooks", hooks: [
      "Wait until you see what {topic} actually does",
      "Nobody talks about this part of {topic}",
      "Things I wish someone told me about {topic} sooner",
    ]},
    { name: "Contrarian Hooks", hooks: [
      "Unpopular opinion: {topic} is way overrated",
      "Doing {topic} the normal way held me back for years",
      "Everyone got {topic} wrong and I have proof",
    ]},
    { name: "Benefit Hooks", hooks: [
      "Three {topic} tricks that actually changed my routine",
      "Do this one thing and {topic} gets so much easier",
      "Save this if you are trying to get better at {topic}",
    ]},
    { name: "Story Hooks", hooks: [
      "So I tried {topic} for thirty days and this happened",
      "The day {topic} completely changed how I see everything",
      "My {topic} experiment went completely off the rails",
    ]},
    { name: "Bold Statement Hooks", hooks: [
      "{topic} is genuinely the move right now — no debate",
      "Starting {topic} earlier would have changed my life",
      "Real talk — {topic} hits different when you do it right",
    ]},
  ],
  Instagram: [
    { name: "Curiosity Hooks", hooks: [
      "Here is what nobody posts about {topic}",
      "The {topic} result that genuinely surprised me",
      "Save this before you start your {topic} journey",
    ]},
    { name: "Contrarian Hooks", hooks: [
      "The {topic} advice everyone gives is actually wrong",
      "Stopped doing {topic} the traditional way and won",
      "Most {topic} content is missing the most important part",
    ]},
    { name: "Benefit Hooks", hooks: [
      "Five {topic} habits that pay off immediately",
      "Here is the fastest way to see results with {topic}",
      "Do this before anything else when starting {topic}",
    ]},
    { name: "Story Hooks", hooks: [
      "Six months of {topic} and my life looks completely different",
      "Almost gave up on {topic} before I found this approach",
      "My honest review after a full year of {topic}",
    ]},
    { name: "Bold Statement Hooks", hooks: [
      "{topic} is the best investment I have ever made",
      "Consistent {topic} beats every shortcut every single time",
      "There is no version of success here without {topic}",
    ]},
  ],
};

function getPlaceholderCategories(topic: string, platform: string) {
  const cats = PLACEHOLDER_CATEGORIES[platform] ?? PLACEHOLDER_CATEGORIES["YouTube"];
  return cats.map((cat) => ({
    name: cat.name,
    hooks: cat.hooks.map((h) => h.replace(/{topic}/g, topic)),
  }));
}

function parseCategories(text: string): { name: string; hooks: string[] }[] {
  const results: { name: string; hooks: string[] }[] = [];
  const sections = text.split(/^##\s+/m).filter((s) => s.trim().length > 0);

  for (const section of sections) {
    const lines = section.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) continue;
    const name = lines[0].replace(/:$/, "").trim();
    const hooks = lines.slice(1).filter((l) => !l.startsWith("#")).slice(0, 3);
    if (hooks.length > 0) results.push({ name, hooks });
  }

  return results;
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
      YouTube: `Reference — real viral YouTube titles:
- I Tested 7 Sleep Hacks and One Actually Worked
- Why Rich People Buy Used Cars
- Nobody Told Me This Before I Quit My Job
- Buying a House at 22 Changed Everything`,
      TikTok: `Reference — real viral TikTok openers:
- Wait until you see what happened at the end
- Renting vs buying — I finally did the math
- Things nobody tells you about working from home
- Three things I stopped buying to save $800 a month`,
      Instagram: `Reference — real viral Instagram caption openers:
- Nobody talks about the downside of passive income
- Stopped doing this one thing and everything changed
- Real estate agents hate this question — ask it anyway
- Most people quit right before it gets good`,
    };

    const systemPrompt = `You write viral hooks for ${platform} videos. Every hook reads like a natural, fluent English headline that a real creator would publish. You never produce robotic, templated, or grammatically awkward phrasing.`;

    const prompt = `Write exactly 15 hooks for a ${platform} video about: ${topic}

${platformExamples[platform] ?? platformExamples["YouTube"]}

Output the hooks grouped into exactly these 5 categories, 3 hooks each.
Use exactly this format — the ## prefix on each category name is required:

## Curiosity Hooks
[hook 1]
[hook 2]
[hook 3]
## Contrarian Hooks
[hook 4]
[hook 5]
[hook 6]
## Benefit Hooks
[hook 7]
[hook 8]
[hook 9]
## Story Hooks
[hook 10]
[hook 11]
[hook 12]
## Bold Statement Hooks
[hook 13]
[hook 14]
[hook 15]

Category definitions:
- Curiosity Hooks: Open an information gap. Tease an outcome without revealing it.
- Contrarian Hooks: Challenge a belief most viewers hold. State the uncomfortable opposite.
- Benefit Hooks: State the exact payoff the viewer gets. Specific, urgent, zero fluff.
- Story Hooks: Drop the viewer mid-tension or mid-outcome. Never explain what happened upfront.
- Bold Statement Hooks: A fully committed declarative claim. No hedging. Reads like a fact.

Rules for every hook:
- 6 to 12 words. Hard maximum.
- Natural spoken English — sounds right when read aloud
- No quotation marks
- No numbering, bullets, or extra commentary
- No awkward grammar or passive voice
- Each hook completely different in structure and angle from every other`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "";
    const categories = parseCategories(content);

    if (categories.length === 0) {
      const fallback = getPlaceholderCategories(topic, platform);
      const hooks = fallback.flatMap((c) => c.hooks);
      res.json({ hooks, categories: fallback, platform, topic });
      return;
    }

    // Pad or trim to exactly 5 categories with 3 hooks each
    const filled = CATEGORY_NAMES.map((name, i) => ({
      name,
      hooks: (categories[i]?.hooks ?? []).slice(0, 3),
    }));

    const hooks = filled.flatMap((c) => c.hooks);
    res.json({ hooks, categories: filled, platform, topic });
  } catch (err) {
    console.error("OpenAI error, falling back to placeholders:", err);
    const fallback = getPlaceholderCategories(topic, platform);
    const hooks = fallback.flatMap((c) => c.hooks);
    res.json({ hooks, categories: fallback, platform, topic });
  }
});

export default router;
