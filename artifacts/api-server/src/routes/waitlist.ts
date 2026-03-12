import { Router, type IRouter } from "express";
import { db, waitlistTable } from "@workspace/db";
import { JoinWaitlistBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/waitlist", async (req, res) => {
  const parseResult = JoinWaitlistBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Please provide a valid email address." });
    return;
  }

  const { email } = parseResult.data;

  try {
    const existing = await db
      .select()
      .from(waitlistTable)
      .where(eq(waitlistTable.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      res.json({ message: "You're already on the list!", alreadyJoined: true });
      return;
    }

    await db.insert(waitlistTable).values({ email: email.toLowerCase() });
    res.json({ message: "You're on the list!", alreadyJoined: false });
  } catch (err) {
    console.error("Waitlist error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
