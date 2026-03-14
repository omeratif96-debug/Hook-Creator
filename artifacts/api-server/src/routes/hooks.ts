import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateHooksBody, RemixHookBody } from "@workspace/api-zod";

const router: IRouter = Router();

// ── Placeholder data ──────────────────────────────────────────────────────────

const PLACEHOLDER: Record<string, { hooks: string[]; titles: string[]; introScripts: string[] }> = {
  YouTube: {
    hooks: [
      "Nobody told me this before I tried it for 30 days",
      "I spent $10,000 on this so you don't have to",
      "The secret experts won't put in their videos",
      "What actually changes after one full year of this",
      "Every popular piece of advice on this is backwards",
      "I was doing it wrong for three years — here's why",
      "This one thing doubled my results in a single week",
      "The version they show on social media is a lie",
      "Stop buying this — do this instead and save hundreds",
      "Most people quit right before it actually starts working",
    ],
    titles: [
      "I Tested Every Method for 30 Days — Here's What Worked",
      "Why Experts Get This Completely Wrong",
      "The Honest Truth Nobody Talks About",
      "What Happens After One Year of Doing This Every Day",
      "I Tried the Most Expensive Option — Was It Worth It?",
      "The Beginner Mistake That Costs Everyone Months of Progress",
      "Stop Doing This — Do This Instead",
      "The Method I Wish I Had Found Years Ago",
      "Everything You Think You Know About This Is Wrong",
      "From Zero to Results in 30 Days — My Full Breakdown",
    ],
    introScripts: [
      "Before I show you the results, I need to be honest with you — I almost quit halfway through. What kept me going changed everything I thought I knew about this.",
      "I've seen hundreds of videos on this topic. Almost all of them miss the one thing that actually matters. Today I'm going to show you exactly what that is.",
      "Six months ago I was exactly where you are right now. Frustrated, confused, and ready to give up. This is the video I wish someone had made for me back then.",
      "Most people approach this completely backwards. They focus on the wrong thing first, burn out fast, and never see the results they're after. Here's the right order.",
      "Real talk — I wasted two years doing this the hard way before I finally figured out the shortcut. By the end of this video, you won't make the same mistake.",
    ],
  },
  TikTok: {
    hooks: [
      "Wait until you see what happened at the end of this",
      "Things nobody tells you when you first start out",
      "This changed everything and I can't stop thinking about it",
      "POV: you finally figure out what everyone else already knows",
      "I tried this for a week and here's what actually happened",
      "Unpopular opinion — and I have receipts to prove it",
      "Tell me you've been doing it wrong without telling me",
      "The part they always leave out of the tutorial",
      "Day one versus day thirty — the difference will shock you",
      "Doing this one thing saved me so much time and money",
    ],
    titles: [
      "Wait for the Reveal at the End",
      "Things Nobody Tells You When You Start",
      "The Part They Always Leave Out",
      "I Tried This for 30 Days — Here's What Happened",
      "Unpopular Opinion — And I'm Sticking With It",
      "POV: You Finally Figure This Out",
      "Day 1 vs Day 30 — The Difference Is Wild",
      "This One Habit Changed Everything for Me",
      "What They Don't Show You on Social Media",
      "Rating Every Method From Worst to Best",
    ],
    introScripts: [
      "Okay, stay with me because this one is going to change how you think about it. I tested this for a full week so you don't have to.",
      "This is the thing I wish someone had put on my For You Page two years ago. By the end of this video you'll understand why everyone gets it wrong.",
      "Real quick — if you've been struggling with this, it's not your fault. The advice floating around is genuinely bad. Here's what actually works.",
      "I'm going to show you something that took me way too long to figure out. It looks simple but most people completely miss it.",
      "Three months ago I was in your position, totally overwhelmed. This one change made everything else click into place.",
    ],
  },
  Instagram: {
    hooks: [
      "Here is what nobody actually posts about this",
      "Save this before you start — you will thank yourself later",
      "Everything I wish I knew six months before I began",
      "The checklist that changed my entire approach to this",
      "Stop falling for this advice — here is what works instead",
      "Honest review after a full year of doing this consistently",
      "Drop a comment if you needed to see this today",
      "The before-and-after nobody shows you on Instagram",
      "Five things I stopped doing that changed everything",
      "This is the sign you have been waiting for — save it",
    ],
    titles: [
      "Everything I Wish I Knew Before Starting",
      "The Honest Review Nobody Posts",
      "Five Things That Actually Work",
      "Save This for Later — You Will Need It",
      "What Six Months of Consistency Looks Like",
      "The Checklist That Changed My Entire Routine",
      "Swipe to See the Transformation",
      "What Nobody Posts About the Downside",
      "Before You Start — Read This First",
      "The Real Side of This That Everyone Hides",
    ],
    introScripts: [
      "Saving this post is step one. Because what I'm about to share took me six months of trial and error to figure out, and I want you to have it in 60 seconds.",
      "Real talk — the version of this that goes viral on Instagram is not the version that actually works. Here's the honest breakdown.",
      "I almost didn't post this because it goes against what most accounts in this space teach. But the results speak for themselves, so here we go.",
      "This is for anyone who has tried everything and still isn't seeing results. You're not doing it wrong — you're just missing this one piece.",
      "Before you spend another dollar or another hour on this, swipe through these five things. They would have saved me a year of frustration.",
    ],
  },
};

function getPlaceholder(topic: string, platform: string) {
  const p = PLACEHOLDER[platform] ?? PLACEHOLDER.YouTube;
  const sub = (s: string) => s.replace(/{topic}/g, topic);
  return {
    hooks: p.hooks.map(sub),
    titles: p.titles.map(sub),
    introScripts: p.introScripts.map(sub),
  };
}

// ── Parsers ───────────────────────────────────────────────────────────────────

function parseSection(text: string, header: string, max: number): string[] {
  const headerPattern = new RegExp(`##\\s*${header}`, "i");
  const nextHeader = /^##\s+/m;

  const start = text.search(headerPattern);
  if (start === -1) return [];

  const afterHeader = text.slice(start).replace(headerPattern, "").trimStart();
  const nextMatch = afterHeader.search(nextHeader);
  const chunk = nextMatch === -1 ? afterHeader : afterHeader.slice(0, nextMatch);

  return chunk
    .split("\n")
    .map((l) => l.trim().replace(/^[-*\d.]+\s*/, ""))
    .filter((l) => l.length > 0)
    .slice(0, max);
}

// ── Platform examples ─────────────────────────────────────────────────────────

const PLATFORM_EXAMPLES: Record<string, string> = {
  YouTube: `Reference — real viral YouTube titles:
- I Tested 7 Sleep Hacks and One Actually Worked
- Why Rich People Buy Used Cars
- Nobody Told Me This Before I Quit My Job
- Buying a House at 22 Changed Everything`,
  TikTok: `Reference — real viral TikTok openers:
- Wait until you see what happened at the end
- Things nobody tells you about working from home
- Three things I stopped buying to save $800 a month`,
  Instagram: `Reference — real viral Instagram openers:
- Nobody talks about the downside of passive income
- Stopped doing this one thing and everything changed
- Most people quit right before it gets good`,
};

// ── Routes ────────────────────────────────────────────────────────────────────

router.post("/hooks/generate", async (req, res) => {
  const parseResult = GenerateHooksBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { topic, platform, contentAngle } = parseResult.data;

  try {
    const systemPrompt = `You are a viral content strategist for ${platform}. You write hooks, titles, and intro scripts that read like real published content — natural, fluent, and immediately compelling. Your output is always platform-appropriate and angle-aware.`;

    const prompt = `Generate content for a ${platform} video about: "${topic}"
Content angle: ${contentAngle}

${PLATFORM_EXAMPLES[platform] ?? PLATFORM_EXAMPLES.YouTube}

Output exactly in this format — each ## header is required:

## Viral Hooks
[10 short punchy hooks, one per line, 6-12 words each, curiosity-driven, varied structure, no quotation marks]

## YouTube Titles
[10 clickable titles, one per line, Title Case, strong curiosity and clarity, no quotation marks]

## Intro Scripts
[5 spoken video openers, one per line, maximum 2 sentences each, strong hook in the first sentence, conversational and natural — exactly how a creator would say it aloud in the first 5 seconds of a video, no quotation marks]

Rules for all output:
- Natural spoken English only — each line must sound good read aloud
- No quotation marks anywhere
- No numbering, bullets, or extra commentary
- No two items start with the same word
- Every item must be unique in angle and structure
- Be platform-aware (${platform}) and angle-aware (${contentAngle})
- Hooks and titles: no awkward grammar, no passive voice, no AI-sounding phrasing
- Intro scripts: maximum 2 sentences, first sentence must immediately hook the viewer, write as if speaking directly into a camera — casual, direct, no filler words`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "";

    const hooks = parseSection(content, "Viral Hooks", 10);
    const titles = parseSection(content, "YouTube Titles", 10);
    const introScripts = parseSection(content, "Intro Scripts", 5);

    if (hooks.length === 0 && titles.length === 0) {
      const fallback = getPlaceholder(topic, platform);
      res.json({ ...fallback, platform, topic, contentAngle });
      return;
    }

    // Pad with fallback if AI returned fewer items than expected
    const fallback = getPlaceholder(topic, platform);
    res.json({
      hooks: hooks.length >= 5 ? hooks : fallback.hooks,
      titles: titles.length >= 5 ? titles : fallback.titles,
      introScripts: introScripts.length >= 3 ? introScripts : fallback.introScripts,
      platform,
      topic,
      contentAngle,
    });
  } catch (err) {
    console.error("OpenAI error, falling back to placeholders:", err);
    const fallback = getPlaceholder(topic, platform);
    res.json({ ...fallback, platform, topic, contentAngle });
  }
});

router.post("/hooks/remix", async (req, res) => {
  const parseResult = RemixHookBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { hook, topic, platform, contentAngle } = parseResult.data;

  try {
    const prompt = `You are remixing a viral hook for a ${platform} video.

Original hook: "${hook}"
Topic: ${topic}
Content angle: ${contentAngle}

Write 10 new variations of this hook. Keep the same core idea but improve clarity, punchiness, and natural phrasing. Each variation should have a completely different structure.

Rules:
- 6 to 12 words per hook
- Natural spoken English, read it aloud before including it
- No quotation marks
- No numbering, bullets, or labels  
- No two variations start with the same word
- Return only the 10 hooks, one per line, nothing else`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 512,
      messages: [
        { role: "system", content: `You write viral hooks for ${platform}. Every hook reads like natural, fluent English a real creator would publish.` },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "";
    const variations = content
      .split("\n")
      .map((l) => l.trim().replace(/^[-*\d.]+\s*/, ""))
      .filter((l) => l.length > 0)
      .slice(0, 10);

    res.json({ variations: variations.length > 0 ? variations : [hook] });
  } catch (err) {
    console.error("Remix error:", err);
    res.json({ variations: [hook] });
  }
});

export default router;
