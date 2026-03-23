import { Router } from "express";

const router = Router();

router.post("/track-click", (req, res) => {
  try {
    const { hookText, buttonClicked, timestamp } = req.body ?? {};
    console.log("[track-click]", { hookText, buttonClicked, timestamp });
    // In a real app you'd persist this to a DB. For now just acknowledge.
    res.json({ ok: true });
  } catch (err) {
    console.error("Error in /track-click:", err);
    res.status(500).json({ ok: false });
  }
});

export default router;
