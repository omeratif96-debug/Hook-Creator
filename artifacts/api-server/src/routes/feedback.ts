import { Router, type IRouter } from "express";
import { db, feedbackTable, insertFeedbackSchema } from "@workspace/db";

const router: IRouter = Router();

router.post("/feedback", async (req, res) => {
  const parseResult = insertFeedbackSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid feedback payload." });
    return;
  }

  try {
    await db.insert(feedbackTable).values(parseResult.data);
    res.json({ ok: true });
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ error: "Could not save feedback. Please try again." });
  }
});

export default router;
