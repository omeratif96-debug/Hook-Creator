import { Router } from "express";
import { db, clicksTable, insertClickSchema } from "@workspace/db";

const router = Router();

router.post("/track-click", async (req, res) => {
  try {
    const parseResult = insertClickSchema.safeParse(req.body ?? {});
    if (!parseResult.success) {
      res.status(400).json({ error: "Invalid payload." });
      return;
    }

    const { hookText, buttonClicked, timestamp } = parseResult.data;

    await db.insert(clicksTable).values({ hookText, buttonClicked, timestamp: timestamp ? new Date(timestamp) : undefined });

    console.log("[track-click] saved", { hookText, buttonClicked, timestamp });
    res.json({ ok: true });
  } catch (err) {
    console.error("Error in /track-click:", err);
    res.status(500).json({ ok: false });
  }
});

router.get("/track-clicks", async (req, res) => {
  try {
    const rows = await db.select().from(clicksTable).orderBy(clicksTable.timestamp.desc).limit(50);
    res.json(rows);
  } catch (err) {
    console.error("Error in /track-clicks:", err);
    res.status(500).json({ error: "Could not fetch clicks." });
  }
});

export default router;
