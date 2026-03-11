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
    const prompt = `You are a viral content expert specializing in ${platform} hooks. 
    
Generate exactly 15 compelling, viral-worthy hook sentences for a video about: "${topic}"

Requirements:
- Each hook should be a single sentence or short phrase (not a full script)
- Hooks should create curiosity, urgency, or emotional pull
- Tailor the tone and style specifically for ${platform}
- For YouTube: focus on titles/thumbnail text style hooks
- For TikTok: casual, trending, conversational hooks with energy
- For Instagram: polished but engaging caption-style hooks
- Make them diverse (mix of question hooks, story hooks, controversy hooks, value hooks, etc.)
- Do NOT number them or add bullet points
- Return ONLY the 15 hooks, one per line, nothing else

Topic: ${topic}
Platform: ${platform}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
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
