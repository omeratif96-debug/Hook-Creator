import { Router, type IRouter } from "express";
import healthRouter from "./health";
import hooksRouter from "./hooks";
import waitlistRouter from "./waitlist";

const router: IRouter = Router();

router.use(healthRouter);
router.use(hooksRouter);
router.use(waitlistRouter);

export default router;
