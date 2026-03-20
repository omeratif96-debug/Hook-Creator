import { Router, type IRouter } from "express";
import healthRouter from "./health";
import hooksRouter from "./hooks";
import waitlistRouter from "./waitlist";
import feedbackRouter from "./feedback";

const router: IRouter = Router();

router.use(healthRouter);
router.use(hooksRouter);
router.use(waitlistRouter);
router.use(feedbackRouter);

export default router;
